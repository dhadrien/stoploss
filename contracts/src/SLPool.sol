pragma solidity 0.7.1;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import './interfaces/IUniswapV2Pair.sol';


contract SLPool {
    using SafeMath  for uint;

    address public factory;
    address public uniPair;
    address public token1;
    address public token2;

    event StopLoss(address uniPair, address orderer, uint lpAmount, address tokenToSave, uint amountToSave);
    
    StopOrder[] public getStopOrdersToken1;
    StopOrder[] public getStopOrdersToken2;
    // naive struct not gas efficient
    struct StopOrder {
      address orderer;
      uint lpAmount;
      uint ratio;
    }

    event Sync(uint112 reserve0, uint112 reserve1);

    constructor() {
        factory = msg.sender;
    }

    // called once by the factory at time of deployment
    function initialize(address _uniPair, address _token1, address _token2) external {
        require(msg.sender == factory, 'SLPool: FORBIDDEN'); // sufficient check
        uniPair = _uniPair;
        token1 = _token1;
        token2 = _token2;
    }

    function getLpAmount() public returns (uint) {
      return IUniswapV2Pair(uniPair).balanceOf(address(this));
    }

    function stopLoss(uint lpAmount, address tokenToSave, uint minAmountToSave) public {
      bool isToken1 = true;
      if (tokenToSave != token1) {
        require(tokenToSave== token2, 'SLPOOL: Wrong Token');
        isToken1 = false;
      }
      
      IUniswapV2Pair(uniPair).transferFrom(msg.sender, address(this), lpAmount);
      // not yet sure what to do with it, but it normalizes
      // uint ratio = minAmountToSave.div(lpAmount);
      if(isToken1) {
        getStopOrdersToken1.push(StopOrder(msg.sender, lpAmount, minAmountToSave));
      } else {
        getStopOrdersToken2.push(StopOrder(msg.sender, lpAmount, minAmountToSave));
      }
      emit StopLoss(uniPair, msg.sender, lpAmount, tokenToSave, minAmountToSave);
    }

    // force reserves to match balances
    function sync() external {
        // _update(IERC20(token0).balanceOf(address(this)), IERC20(token1).balanceOf(address(this)), reserve0, reserve1);
    }
}