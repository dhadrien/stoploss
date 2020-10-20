pragma solidity 0.7.1;

import './interfaces/IERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
contract DumbVault {
  using SafeMath  for uint;

  address public feth;
  address public fdai;
  address public fusdc;
  address public fusdt;
  address public fwbtc;
  mapping(address => mapping(address => uint)) lastGot;
  uint PERIOD = 2 hours;
  mapping(address => uint) amounts;

    constructor (address _feth, address _fdai, address _fusdc, address _fusdt, address _fwbtc) {
      feth = _feth;
      amounts[feth] = 2 ether;
      fdai = _fdai;
      amounts[fdai] = 600 ether;
      fusdc = _fusdc;
      amounts[fusdc] = 600 ether;
      fusdt = _fusdt;
      amounts[fusdt] = 600 ether;
      fwbtc = _fwbtc;
      amounts[fwbtc] = (uint(10**18)).div(uint(300));
    }

    function getSome(address token) public {
      require(block.timestamp > lastGot[msg.sender][token] + PERIOD);
      IERC20(token).transfer(msg.sender, amounts[token]);
    }
}