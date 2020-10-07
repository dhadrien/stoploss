pragma solidity 0.7.1;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './interfaces/IUniswapV2Pair.sol';
import './interfaces/IUniswapV2Router02.sol';
import '@nomiclabs/buidler/console.sol';
import './lib/SLOracle.sol';

contract SLPool {
    using SafeMath  for uint;

    uint constant RATIO_PRECISION = 1000 * 1000;
    uint constant MARGIN_RATIO = 5; // 5% margin => will go to liquidators

    address public immutable poolFactory;
    address public WETH;
    bool public isWETH;
    address public uniswapFactory;
    address public uniPair;
    address public tokenA; // Is WETH if WETH Pool
    address public tokenB; // Is Other token if WETH Pool
    bool public inverted;// Is the sorting inverted compared to uniswap's?

    // oracle
    address public oracle;
    uint public constant PERIOD = 1 seconds;
    uint32 public blockTimestampLast;
    uint public priceA; // 1 WETH = priceB Tokens
    // uint public priceB; // 1 Token = priceA WETH
    uint public reserveA; // no real need for storage
    uint public reserveB; // no real need for storage
    uint public totalLpSupply; //no real need for storage
    uint public lastRatioA;
    uint public lastRatioB;

    // Router for trading/ Liquidity removal
    address public uniRouter;
    


    event StopLoss(address uniPair, uint number, address orderer, uint lpAmount, address tokenToGuarantee, uint ratio);
    
    StopOrder[] public getStopOrdersTokenA;
    StopOrder[] public getStopOrdersTokenB;
    // naive struct not gas efficient
    struct StopOrder {
      address payable orderer;
      uint lpAmount;
      uint ratio;
    }

    constructor() {
        poolFactory = msg.sender;
    }

    // called once by the poolFactory at time of deployment
    function initialize(address _uniPair, address _token1, address _token2, address _oracle, address _WETH, address _uniswapFactory, address _uniRouter) external {
        require(msg.sender == poolFactory, 'SLPool: FORBIDDEN'); // sufficient check
        uniPair = _uniPair;
        uniswapFactory = _uniswapFactory;
        WETH = _WETH;
        uniRouter = _uniRouter;
        (tokenA, tokenB) = specialSortTokens(_token1, _token2);
        oracle = _oracle;
        initPrice();
        IUniswapV2Pair(uniPair).approve(uniRouter, 10000000000000 ether);
    }

    function specialSortTokens(
        address _tokenA,
        address _tokenB
    )
        internal
        returns (address token0, address token1)
    {
        // Special for the WETH pool: we want WETH as token A
        (token0, token1) = sortTokens(_tokenA, _tokenB);
        if (token0 == WETH) {
          isWETH = true;
        } else if (token1 == WETH) {
          (token0, token1) = (token1, token0);
          inverted = true;
          isWETH = true;
        }
    }

    function sortTokens(
        address _tokenA,
        address _tokenB
    )
        internal
        pure
        returns (address token0, address token1)
    {
          (token0, token1) = _tokenA < _tokenB ? (_tokenA, _tokenB) : (_tokenB, _tokenA);
    }

    function initPrice()
        public
    {
      blockTimestampLast = SLOracle(oracle).blockTimestampLast();
      update();
    }

     function update()
        internal
    {
        (, , uint32 blockTimestamp) =
            UniswapV2OracleLibrary.currentCumulativePrices(uniPair);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired

        if (timeElapsed >= uint32(PERIOD)) {
          // Update price
          console.log("SLPOOL: UPDATING RATIOS AND PRICE: ", block.timestamp);
          SLOracle(oracle).update();
          blockTimestampLast = blockTimestamp;
          // Aproximations: hold in highly liquid pools. 
          priceA = SLOracle(oracle).consult(tokenA, 1 ether); // Priice of 1WETH in token
          (uint reserve0, uint reserve1,) = IUniswapV2Pair(uniPair).getReserves();
          (reserveA, reserveB) = inverted ? (reserve1, reserve0) : (reserve0, reserve1);
          totalLpSupply = IUniswapV2Pair(uniPair).totalSupply(); // in storage for now, could be memory
          uint totalReserveinB = reserveB.add((reserveA.mul(priceA.div(1 ether))));
          uint totalReserveInA = totalReserveinB.div(priceA.div(1 ether));
          lastRatioA = (totalReserveInA.mul(RATIO_PRECISION)).div(totalLpSupply);
          lastRatioB = (totalReserveinB.mul(RATIO_PRECISION)).div(totalLpSupply);
        }
    }

    function getLpAmount() public view returns (uint) {
      return IUniswapV2Pair(uniPair).balanceOf(address(this));
    }

    function stopLoss(uint lpAmount, address tokenToGuarantee, uint amountToGuarantee) public {
      bool isTokenA = true; // WETH
      if (tokenToGuarantee != tokenA) {
        require(tokenToGuarantee== tokenB, 'SLPOOL: Wrong Token');
        isTokenA = false;
      }
      console.log("NEW STOP LOSS ASKED. isTokenA? ", isTokenA);
      console.log("amountToGuarantee", amountToGuarantee);
      console.log("lpAmount", lpAmount);
      IUniswapV2Pair(uniPair).transferFrom(msg.sender, address(this), lpAmount);
      // not yet sure what to do with it, but it normalizes
      
      // We multiply by two 
      uint ratio = (amountToGuarantee.mul(RATIO_PRECISION)).div(lpAmount);
      uint length;
      if(isTokenA) {
        getStopOrdersTokenA.push(StopOrder(msg.sender, lpAmount, ratio));
        length = getStopOrdersTokenA.length;
      } else {
        getStopOrdersTokenB.push(StopOrder(msg.sender, lpAmount, ratio));
        length = getStopOrdersTokenB.length;
      }
      emit StopLoss(uniPair, length, msg.sender, lpAmount, tokenToGuarantee, ratio);
      console.log("New StopLoss Registered from", msg.sender);
      console.log("Token A? ", isTokenA);
      console.log("LpAmount:", lpAmount, "ratio", ratio);
      update();
    }

    function _executeStopLoss() public {}     

    function _executeStopLossTokenWeth(uint stopLossindex) public {
      require(lastRatioB < (getStopOrdersTokenB[stopLossindex].ratio.mul(uint(100).add(MARGIN_RATIO))).div(100), 'SLPOOL: RATIO_CONDITION');
      (uint tokenReceived, uint ethReceived) =
          IUniswapV2Router02(uniRouter).removeLiquidityETH(
            tokenB, 
            getStopOrdersTokenB[stopLossindex].lpAmount,
            0,
            0,
            address(this),
            262156100447
          ); // infiinite deadline
      uint tokenGuaranted = (getStopOrdersTokenB[stopLossindex].lpAmount
                              .mul(getStopOrdersTokenB[stopLossindex].ratio))
                              .div(RATIO_PRECISION);         
      address[] memory path = new address[](2);
      path[0] = WETH;
      path[1] = tokenB;
      uint[] memory etherSold = new uint[](1);
      etherSold = 
        IUniswapV2Router02(uniRouter).swapETHForExactTokens{value:ethReceived}(
          tokenGuaranted.sub(tokenReceived), path, address(this), 262156100447
        ); // infiinite deadline
      ERC20(tokenB).transfer(getStopOrdersTokenB[stopLossindex].orderer, tokenGuaranted);
      msg.sender.send(ethReceived - etherSold[0]);
    }

    // function _executeStopLossEth(uint stopLossindex) {
    //   (uint tokenReceived, uint ethReceived) =
    //       IUniswapV2Router02(uniRouter).removeLiquidityETH(
    //         tokenB, 
    //         getStopOrdersTokenA[stopLossindex].lpAmount,
    //         0,
    //         0,
    //         address(this),
    //         262156100447
    //       ); // infiinite deadline
    //   uint etherGuaranteed = (getStopOrdersTokenA[stopLossindex].lpAmount
    //                           .mul(getStopOrdersTokenA[stopLossindex].ratio))
    //                           .div(RATIO_PRECISION);         
    //   address[] memory path = new address[](2);
    //   path[0] = tokenB;
    //   path[1] = WETH;
    //   uint[] memory tokenSold = new uint[](1);
    //   tokenSold = 
    //     IUniswapV2Router02(uniRouter).swapTokensForExactETH(
    //       ethGuaranteed.sub(ethReceived), tokenReceived, path, address(this), 262156100447
    //     );
    //   getStopOrdersTokenA[stopLossindex].transfer(ethGuaranteed);
    //   ERC20(token).transfer(msg.sender, tokenReceived - tokenSold[0]);
    //   ERC20(tokenB).transfer(.orderer, tokenGuaranted);
    //   msg.sender.send(ethReceived - etherSold[0]);
    // }

    function executeStopLoss(uint stopLossindex, address token) public {
      if (token != tokenA) {
        require(token == tokenB, "SLPOOL: Wrong Token");
      }
      if (isWETH) {
        if (token == tokenB) {
          _executeStopLossTokenWeth(stopLossindex);
        } else {
          // _executeStopLossEth(stopLossindex);
        }
      } else {
        _executeStopLoss();
      }
    }


    receive() external payable {}
    // force reserves to match balances
    function sync() external {
        // _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)), reserve0, reserve1);
    }
}