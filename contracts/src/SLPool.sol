pragma solidity 0.7.1;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './interfaces/IUniswapV2Pair.sol';
import '@nomiclabs/buidler/console.sol';
import './lib/SLOracle.sol';

contract SLPool {
    using SafeMath  for uint;

    address public immutable factory;
    address public uniPair;
    address public tokenA;
    address public tokenB;

    // oracle
    address public oracle;
    uint public constant PERIOD = 1 minutes;
    uint32 public blockTimestampLast;
    uint public priceA;
    uint public priceB;
    


    event StopLoss(address uniPair, address orderer, uint lpAmount, address tokenToSave, uint ratio);
    
    StopOrder[] public getStopOrdersToken1;
    StopOrder[] public getStopOrdersToken2;
    // naive struct not gas efficient
    struct StopOrder {
      address orderer;
      uint lpAmount;
      uint ratio;
    }

    constructor() {
        factory = msg.sender;
    }

    // called once by the factory at time of deployment
    function initialize(address _uniPair, address _token1, address _token2, address _oracle) external {
        require(msg.sender == factory, 'SLPool: FORBIDDEN'); // sufficient check
        uniPair = _uniPair;
        (tokenA, tokenB) = sortTokens(_token1, _token2);
        oracle = _oracle;
        initPrice();
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
      updatePrice();
    }

     function updatePrice()
        internal
    {
        (, , uint32 blockTimestamp) =
            UniswapV2OracleLibrary.currentCumulativePrices(uniPair);
        uint32 timeElapsed = blockTimestamp - blockTimestampLast; // overflow is desired
        if (timeElapsed >= uint32(PERIOD)) {
          SLOracle(oracle).update();
          blockTimestampLast = blockTimestamp;
          priceA = SLOracle(oracle).consult(tokenA, 1 ether);
          priceB = SLOracle(oracle).consult(tokenB, 1 ether);
        }
    }

    function getLpAmount() public view returns (uint) {
      return IUniswapV2Pair(uniPair).balanceOf(address(this));
    }

    function stopLoss(uint lpAmount, address tokenToSave, uint minAmountToSave) public {
      bool isToken1 = true;
      if (tokenToSave != tokenA) {
        require(tokenToSave== tokenB, 'SLPOOL: Wrong Token');
        isToken1 = false;
      }
      
      IUniswapV2Pair(uniPair).transferFrom(msg.sender, address(this), lpAmount);
      // not yet sure what to do with it, but it normalizes
      uint ratio = (lpAmount.mul(1000000)).div(minAmountToSave);
      if(isToken1) {
        getStopOrdersToken1.push(StopOrder(msg.sender, lpAmount, ratio));
      } else {
        getStopOrdersToken2.push(StopOrder(msg.sender, lpAmount, ratio));
      }
      emit StopLoss(uniPair, msg.sender, lpAmount, tokenToSave, ratio);
      updatePrice();
    }

    // force reserves to match balances
    function sync() external {
        // _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)), reserve0, reserve1);
    }
}