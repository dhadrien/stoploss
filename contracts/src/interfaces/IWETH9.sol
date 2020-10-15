pragma solidity 0.7.1;

interface IWETH9 {
    function deposit() external payable;
    function withdraw(uint wad) external;
}