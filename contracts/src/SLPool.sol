pragma solidity 0.7.1;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import './interfaces/IUniswapV2Pair.sol';
import './interfaces/IERC20.sol';
import './interfaces/IUniswapV2Router02.sol';
import './interfaces/IWETH9.sol';
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
    // address public oracle;
    // uint public constant PERIOD = 1 seconds;
    uint32 public blockTimestampLast;
    uint public priceA; // 1 tokenB = priceA tokenA
    uint public reserveA; // no real need for storage
    uint public reserveB; // no real need for storage
    uint public totalLpSupply; //no real need for storage
    uint public lastRatioA;
    uint public lastRatioB;

    // Router for trading/ Liquidity removal
    address public uniRouter;

    event StopLossCreated(
      address uniPair,
      uint orderNumber,
      address orderer,
      bool delegated,
      uint lpAmount,
      address tokenToGuarantee,
      uint amountToGuarantee,
      uint tokenIn,
      uint ratio
    );
    
    event WithdrawStopLoss(
      address uniPair,
      uint orderNumber,
      address withdrawer,
      uint lpAmount,
      address tokenWithdrawn,
      uint amountWithdrawn
    );

    event StopLossExecuted(
      address uniPair,
      uint orderNumber,
      address orderer,
      address liquidator,
      uint lpAmount,
      address tokenWithdrawn,
      uint amountWithdrawn,
      address tokenToLiquidator,
      uint amountToLiquidator
    );

    event Update(
      uint timeStamp,
      uint newPriceA,
      uint newRatioA,
      uint newRatioB
    );
    
    StopOrder[] public getStopOrdersTokenA;
    StopOrder[] public getStopOrdersTokenB;
    // naive struct not gas efficient
    struct StopOrder {
      address payable orderer;
      uint lpAmount;
      uint ratio;
      uint amountToGuarantee;
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
        // oracle = _oracle;
        // initPrice();
        // for hackathon: simplify => infinite allowance
        IERC20(uniPair).approve(uniRouter, 10000000000000 ether);
        IERC20(tokenA).approve(uniRouter, 10000000000000 ether);
        IERC20(tokenB).approve(uniRouter, 10000000000000 ether);
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
      // blockTimestampLast = SLOracle(oracle).blockTimestampLast();
      update();
    }

     function update()
        public returns (uint, uint, uint) // returns weak oracle price for hackathon
    {
        (, , uint32 blockTimestamp) =
            UniswapV2OracleLibrary.currentCumulativePrices(uniPair);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired

        // if (timeElapsed >= uint32(PERIOD)) {
          // Update price
          // SLOracle(oracle).update();
          blockTimestampLast = blockTimestamp;
          // Aproximations: hold in highly liquid pools. 
          // priceA = SLOracle(oracle).consult(tokenA, 1 ether); // Priice of 1WETH in token
          (uint reserve0, uint reserve1,) = IUniswapV2Pair(uniPair).getReserves();
          (reserveA, reserveB) = inverted ? (reserve1, reserve0) : (reserve0, reserve1);
          // We make it as simple as possible for the hackathon, more work to be done on the oracle side
          priceA = (reserveB.mul(1 ether)).div(reserveA);
          totalLpSupply = IUniswapV2Pair(uniPair).totalSupply(); // in storage for now, could be memory
          uint totalReserveinB = reserveB.add((reserveA.mul(priceA).div(1 ether)));
          uint totalReserveInA = totalReserveinB.div(priceA).mul(1 ether);
          lastRatioA = (totalReserveInA.mul(RATIO_PRECISION)).div(totalLpSupply);
          lastRatioB = (totalReserveinB.mul(RATIO_PRECISION)).div(totalLpSupply);
          emit Update(block.timestamp, priceA, lastRatioA, lastRatioB);
          return (priceA, lastRatioA, lastRatioB); // hackathon
        // }
    }

    function getLpAmount() public view returns (uint) {
      return IUniswapV2Pair(uniPair).balanceOf(address(this));
    }

    function _getOrderer(uint orderIndex, address token) private view returns (address){
      return token == tokenA ? 
        getStopOrdersTokenA[orderIndex].orderer :
        getStopOrdersTokenB[orderIndex].orderer;
    }
    function _getLpAmount(uint orderIndex, address token) private view returns (uint){
      return token == tokenA ? 
        getStopOrdersTokenA[orderIndex].lpAmount :
        getStopOrdersTokenB[orderIndex].lpAmount;
    }
    function _getAmountToGuarantee(uint orderIndex, address token) private view returns (uint){
      return token == tokenA ? 
        getStopOrdersTokenA[orderIndex].amountToGuarantee :
        getStopOrdersTokenB[orderIndex].amountToGuarantee;
    }
    function _getRatio(uint orderIndex, address token) private view returns (uint){
      return token == tokenA ? 
        getStopOrdersTokenA[orderIndex].ratio :
        getStopOrdersTokenB[orderIndex].ratio;
    }
    function _deleteOrder(uint orderIndex, address token) private {
      token == tokenA ? 
        delete getStopOrdersTokenA[orderIndex] :
        delete getStopOrdersTokenB[orderIndex];
    }
    // // for the hackathon weak oracle
    // function _getPriceA() public view returns (uint) {

    // }

    function stopLoss(uint lpAmount, address tokenToGuarantee, uint amountToGuarantee) public {
      _stopLoss(lpAmount, tokenToGuarantee, amountToGuarantee, 0, false);
    }

    function stopLossFromToken(address tokenIn, uint  amountToSend, uint amountToGuarantee) public {
      _stopLossFromToken(tokenIn, amountToSend, amountToGuarantee, false);
    }

    function _stopLossFromToken(address tokenIn, uint  amountToSend, uint amountToGuarantee, bool fromEther) public {
      require(amountToSend > amountToGuarantee, "SLPOOL: TOO_LARGE_GUARANTEE");
      address[] memory path = new address[](2);
      path[0] = tokenIn;
      path[1] = tokenIn == tokenB ? tokenA : tokenB;
      uint[] memory amounts = new uint[](2);
      if(!fromEther) {IERC20(tokenIn).transferFrom(msg.sender, address(this),  amountToSend);}
      if(fromEther) {
      }
      amounts = 
        IUniswapV2Router02(uniRouter).swapExactTokensForTokens(
            amountToSend.div(2), 0, path, address(this), 262156100447
        );
      (, , uint liquidity) =
        IUniswapV2Router02(uniRouter).addLiquidity(
              path[1],
              path[0],
              amounts[1],
              amounts[0],
              0,
              0,
              address(this),
              262156100447
          );
      _stopLoss(liquidity, tokenIn, amountToGuarantee, amountToSend, true);
    }

    function stopLossFromEther(uint ethToGuarantee) public payable {
      require(isWETH, "SLPOOL: NOT_WETH_POOL");
      require(msg.value > ethToGuarantee, "SLPOOL: TOO_LARGE_ETH_GUARANTEE");
      IWETH9(tokenA).deposit{value: msg.value}();
      _stopLossFromToken(tokenA, msg.value, ethToGuarantee, true);
    }

    // have to make it public for tests, should be removed to interal
    function _stopLoss(uint lpAmount, address tokenToGuarantee, uint amountToGuarantee, uint tokenIn, bool delegated) public {
      bool isTokenA = true; // WETH
      if (tokenToGuarantee != tokenA) {
        require(tokenToGuarantee== tokenB, 'SLPOOL: Wrong Token');
        isTokenA = false;
      }
      if (!delegated) {
        IUniswapV2Pair(uniPair).transferFrom(msg.sender, address(this), lpAmount);
      }
      // not yet sure what to do with it, but it normalizes
      
      // We multiply by two 
      uint ratio = (amountToGuarantee.mul(RATIO_PRECISION)).div(lpAmount);
      uint length;
      if(isTokenA) {
        getStopOrdersTokenA.push(StopOrder(msg.sender, lpAmount, ratio, amountToGuarantee));
        length = getStopOrdersTokenA.length - 1;
      } else {
        getStopOrdersTokenB.push(StopOrder(msg.sender, lpAmount, ratio, amountToGuarantee));
        length = getStopOrdersTokenB.length - 1;
      }
      emit StopLossCreated(uniPair, length, msg.sender, delegated, lpAmount, tokenToGuarantee, amountToGuarantee, tokenIn, ratio);
      update();
    }

    function _executeStopLossToken(uint stopLossindex, address token) public {
      bool isA = token == tokenA;
      require((isA ? lastRatioA : lastRatioB) < (_getRatio(stopLossindex, token).mul(uint(100).add(MARGIN_RATIO))).div(100), 'SLPOOL: RATIO_CONDITION');
      (uint tokenReceived, uint otherTokenReceived) =
          IUniswapV2Router02(uniRouter).removeLiquidity(
            token,
            isA ? tokenB : tokenA,
            _getLpAmount(stopLossindex, token),
            0,
            0,
            address(this),
            262156100447
          ); // infiinite deadline
      uint tokenGuaranted = _getAmountToGuarantee(stopLossindex, token);
      address[] memory path = new address[](2);
      path[0] = isA ? tokenB : tokenA;
      path[1] = token;
      uint[] memory otherTokenSold = new uint[](1);
      otherTokenSold = 
        IUniswapV2Router02(uniRouter).swapTokensForExactTokens(
          tokenGuaranted.sub(tokenReceived), otherTokenReceived, path, address(this), 262156100447
        ); // infiinite deadline
      IERC20(token).transfer(_getOrderer(stopLossindex, token), tokenGuaranted);
      IERC20(isA ? tokenB : tokenA).transfer(msg.sender, otherTokenReceived - otherTokenSold[0]);
      emit StopLossExecuted(
        uniPair,
        stopLossindex,
        _getOrderer(stopLossindex, token),
        msg.sender,
        _getLpAmount(stopLossindex, token),
        token,
        tokenGuaranted,
        isA ? tokenB : tokenA,
        otherTokenReceived - otherTokenSold[0]
      );
      // update();
      _deleteOrder(stopLossindex, token);
    }     

    // this function is currently public, should be internal, otherwise revert dont throw correct message
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
      uint tokenGuaranted = getStopOrdersTokenB[stopLossindex].amountToGuarantee;   
      address[] memory path = new address[](2);
      path[0] = WETH;
      path[1] = tokenB;
      uint[] memory etherSold = new uint[](1);
      etherSold = 
        IUniswapV2Router02(uniRouter).swapETHForExactTokens{value:ethReceived}(
          tokenGuaranted.sub(tokenReceived), path, address(this), 262156100447
        ); // infiinite deadline
      IERC20(tokenB).transfer(getStopOrdersTokenB[stopLossindex].orderer, tokenGuaranted);
      msg.sender.transfer(ethReceived - etherSold[0]);
      emit StopLossExecuted(
        uniPair,
        stopLossindex,
        getStopOrdersTokenB[stopLossindex].orderer,
        msg.sender,
        getStopOrdersTokenB[stopLossindex].lpAmount,
        tokenB,
        tokenGuaranted,
        tokenA,
        ethReceived - etherSold[0]
      );
      // update();
      delete getStopOrdersTokenB[stopLossindex];
    }

    // this function is currently public, should be internal, otherwise revert dont throw correct message
    function _executeStopLossEth(uint stopLossindex) public {
      require(lastRatioA < (getStopOrdersTokenA[stopLossindex].ratio.mul(uint(100).add(MARGIN_RATIO))).div(100), 'SLPOOL: RATIO_CONDITION');
      update();
      (uint tokenReceived, uint ethReceived) =
          IUniswapV2Router02(uniRouter).removeLiquidityETH(
            tokenB, 
            getStopOrdersTokenA[stopLossindex].lpAmount,
            0,
            0,
            address(this),
            262156100447
          ); // infiinite deadline
      uint etherGuaranteed = getStopOrdersTokenA[stopLossindex].amountToGuarantee;        
      address[] memory path = new address[](2);
      path[0] = tokenB;
      path[1] = WETH;
      uint[] memory tokenSold = new uint[](1);
      tokenSold = 
        IUniswapV2Router02(uniRouter).swapTokensForExactETH(
          etherGuaranteed.sub(ethReceived), tokenReceived, path, address(this), 262156100447
        );
      getStopOrdersTokenA[stopLossindex].orderer.transfer(etherGuaranteed);
      IERC20(tokenB).transfer(msg.sender, tokenReceived - tokenSold[0]);
      emit StopLossExecuted(
        uniPair,
        stopLossindex,
        getStopOrdersTokenA[stopLossindex].orderer,
        msg.sender,
        getStopOrdersTokenA[stopLossindex].lpAmount,
        tokenA,
        etherGuaranteed,
        tokenB,
        tokenReceived - tokenSold[0]
      );
      update();
      delete getStopOrdersTokenA[stopLossindex];
    }

    function executeStopLoss(uint stopLossindex, address token) public {
      if (token != tokenA) {
        require(token == tokenB, "SLPOOL: Wrong Token");
      }
      update();
      if (isWETH) {
        if (token == tokenB) {
          _executeStopLossTokenWeth(stopLossindex);
        } else {
          _executeStopLossEth(stopLossindex);
        }
      } else {
        _executeStopLossToken(stopLossindex, token);
      }
    }

    function _withdrawStopLossEth(uint stopLossindex) public {
      require(getStopOrdersTokenA[stopLossindex].orderer == msg.sender, 'SLPOOL: SENDER_NOT_AUTHORIZED');
      (uint tokenReceived, uint ethReceived) =
          IUniswapV2Router02(uniRouter).removeLiquidityETH(
            tokenB, 
            getStopOrdersTokenA[stopLossindex].lpAmount,
            0,
            0,
            address(this),
            262156100447
          ); // infiinite deadline         
      address[] memory path = new address[](2);
      path[0] = tokenB;
      path[1] = WETH;
      uint[] memory amounts = new uint[](2);
      amounts = 
        IUniswapV2Router02(uniRouter).swapExactTokensForETH(
          tokenReceived, 0, path, address(this), 262156100447
        );
      msg.sender.transfer(amounts[1].add(ethReceived));
      emit WithdrawStopLoss(uniPair, stopLossindex, msg.sender, getStopOrdersTokenA[stopLossindex].lpAmount, tokenA, amounts[1].add(ethReceived));
      // update();
      delete getStopOrdersTokenA[stopLossindex];
    }

    function _withdrawStopLossTokenWeth(uint stopLossindex) public {
      require(getStopOrdersTokenB[stopLossindex].orderer == msg.sender, 'SLPOOL: SENDER_NOT_AUTHORIZED');
      (uint tokenReceived, uint ethReceived) =
          IUniswapV2Router02(uniRouter).removeLiquidityETH(
            tokenB,
            getStopOrdersTokenB[stopLossindex].lpAmount,
            0,
            0,
            address(this),
            262156100447
          ); // infiinite deadline         
      address[] memory path = new address[](2);
      path[0] = WETH;
      path[1] = tokenB;
      uint[] memory amounts = new uint[](2);
      amounts = 
        IUniswapV2Router02(uniRouter).swapExactETHForTokens{value:ethReceived}(
          0, path, address(this), 262156100447
        ); // infiinite deadline
      IERC20(tokenB).transfer(msg.sender, amounts[1].add(tokenReceived));
      emit WithdrawStopLoss(uniPair, stopLossindex, msg.sender, getStopOrdersTokenB[stopLossindex].lpAmount, tokenB, amounts[1].add(tokenReceived));
      // update();
      delete getStopOrdersTokenB[stopLossindex];
    }

    function _withdrawStopLossToken (uint stopLossindex, address token) public {
      bool isA = token == tokenA;
      require( _getOrderer(stopLossindex, token) == msg.sender, 'SLPOOL: SENDER_NOT_AUTHORIZED');
      (uint tokenReceived, uint otherTokenReceived) =
          IUniswapV2Router02(uniRouter).removeLiquidity(
            token,
            isA ? tokenB : tokenA,
            _getLpAmount(stopLossindex, token),
            0,
            0,
            address(this),
            262156100447
          ); // infiinite deadline         
      address[] memory path = new address[](2);
      path[0] = isA ? tokenB : tokenA;
      path[1] = token;
      uint[] memory amounts = new uint[](2);
      amounts = 
        IUniswapV2Router02(uniRouter).swapExactTokensForTokens(
          otherTokenReceived, 0, path, address(this), 262156100447
        ); // infiinite deadline
      IERC20(token).transfer(msg.sender, amounts[1].add(tokenReceived));
      emit WithdrawStopLoss(uniPair, stopLossindex, msg.sender, _getLpAmount(stopLossindex, token), token, amounts[1].add(tokenReceived));
      // update();
      _deleteOrder(stopLossindex, token);
    }

    function withdraw(uint stopLossindex, address token) public {
      if (token != tokenA) {
        require(token == tokenB, "SLPOOL: Wrong Token");
      }
      update();
      if (isWETH) {
        if (token == tokenB) {
          _withdrawStopLossTokenWeth(stopLossindex);
        } else {
          _withdrawStopLossEth(stopLossindex);
        }
      } else {
          _withdrawStopLossToken(stopLossindex, token);
      }
    }
    receive() external payable {}
    // force reserves to match balances
    function sync() external {
        // _update(IIERC20(token0).balanceOf(address(this)), IIERC20(token1).balanceOf(address(this)), reserve0, reserve1);
    }
}