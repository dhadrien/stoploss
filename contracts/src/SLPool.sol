pragma solidity 0.7.1;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './interfaces/IUniswapV2Pair.sol';
import '@nomiclabs/buidler/console.sol';
import './lib/SLOracle.sol';

contract SLPool {
    using SafeMath  for uint;

    uint constant RATIO_PRECISION = 1000000;

    address public immutable poolFactory;
    address public WETH;
    address public uniswapFactory;
    address public uniPair;
    address public tokenA; // Is WETH if WETH Pool
    address public tokenB; // Is Other token if WETH Pool
    bool public inverted;// Is the sorting inverted?

    // oracle
    address public oracle;
    uint public constant PERIOD = 10 seconds;
    uint32 public blockTimestampLast;
    uint public priceA; // 1 WETH = priceB Tokens
    // uint public priceB; // 1 Token = priceA WETH
    uint public reserveA; // no real need for storage
    uint public reserveB; // no real need for storage
    uint public totalLpSupply; //no real need for storage
    uint public lastRatioA; 
    uint public lastRatioB;
    


    event StopLoss(address uniPair, address orderer, uint lpAmount, address tokenToGuarantee, uint ratio);
    
    StopOrder[] public getStopOrdersToken1;
    StopOrder[] public getStopOrdersToken2;
    // naive struct not gas efficient
    struct StopOrder {
      address orderer;
      uint lpAmount;
      uint ratio;
    }

    constructor() {
        poolFactory = msg.sender;
    }

    // called once by the poolFactory at time of deployment
    function initialize(address _uniPair, address _token1, address _token2, address _oracle, address _WETH, address _uniswapFactory) external {
        require(msg.sender == poolFactory, 'SLPool: FORBIDDEN'); // sufficient check
        uniPair = _uniPair;
        uniswapFactory = _uniswapFactory;
        WETH = _WETH;
        (tokenA, tokenB) = specialSortTokens(_token1, _token2);
        (address tokenATest, ) = sortTokens(_token1, _token2);
        inverted = (tokenATest == tokenA);
        oracle = _oracle;
        initPrice();
    }

    function specialSortTokens(
        address _tokenA,
        address _tokenB
    )
        internal
        view
        returns (address token0, address token1)
    {
        // Special for the WETH pool: we want it as token A
        if (_tokenA == WETH) {
          (token0, token1) = (_tokenA, _tokenB);
        } else if (_tokenB == WETH) {
          (token0, token1) = (_tokenB, _tokenA);
        } else {
          (token0, token1) = sortTokens(token0, token1);
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
          SLOracle(oracle).update();
          blockTimestampLast = blockTimestamp;
          // Aproximations: hold in highly liquid pools. 
          priceA = SLOracle(oracle).consult(tokenA, 1 ether); // Priice of 1WETH in token
          // priceB = SLOracle(oracle).consult(tokenB, 1 ether); 

          // updated reserves
          (uint reserve0, uint reserve1,) = IUniswapV2Pair(uniPair).getReserves();
          (reserveA, reserveB) = inverted ? (reserve1, reserve0) : (reserve0, reserve1);
          
          // update total amount of LP
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
      bool isToken1 = true;
      if (tokenToGuarantee != tokenA) {
        require(tokenToGuarantee== tokenB, 'SLPOOL: Wrong Token');
        isToken1 = false;
      }
      
      IUniswapV2Pair(uniPair).transferFrom(msg.sender, address(this), lpAmount);
      // not yet sure what to do with it, but it normalizes
      uint ratio = (amountToGuarantee.mul(RATIO_PRECISION)).div(lpAmount);
      if(isToken1) {
        getStopOrdersToken1.push(StopOrder(msg.sender, lpAmount, ratio));
      } else {
        getStopOrdersToken2.push(StopOrder(msg.sender, lpAmount, ratio));
      }
      emit StopLoss(uniPair, msg.sender, lpAmount, tokenToGuarantee, ratio);
      update();
    }

    // force reserves to match balances
    function sync() external {
        // _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)), reserve0, reserve1);
    }
}