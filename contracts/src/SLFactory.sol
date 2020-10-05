// SPDX-License-Identifier: MIT
pragma solidity 0.7.1;

import '@nomiclabs/buidler/console.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import 'buidler-deploy/solc_0.7/proxy/Proxied.sol';
import './interfaces/IUniswapV2Factory.sol';
import './interfaces/IUniswapV2Pair.sol';
import './SLPool.sol';
import "@nomiclabs/buidler/console.sol";

contract SLFactory {
    using SafeMath for uint;
    
    address public immutable uniFactory;
    address public immutable WETH;
    
    mapping(address => mapping(address => address)) public getPoolFromTokens; // helper, not really needed
    mapping(address => address) public getPoolFromPair;
    address[] public allPools;

    event PoolCreated(address indexed token0, address indexed token1, address pair, address pool, address oracle, uint);

    constructor(address _uniFactory, address wethtAddress) {
        uniFactory = _uniFactory;
        WETH = wethtAddress;
    }

    function allPoolsLength() external view returns (uint) {
        return allPools.length;
    }

    function createPool(address tokenA, address tokenB, address oracle) external returns (address pool) {
        require(tokenA != tokenB, 'STOP LOSS: IDENTICAL_ADDRESSES');
        require(tokenA != address(0), 'STOP LOSS: TOKEN: ZERO_ADDRESS');
        require(tokenB != address(0), 'STOP LOSS: TOKEN: ZERO_ADDRESS');

        address pair = IUniswapV2Factory(uniFactory).getPair(tokenA,tokenB);
        require(pair != address(0), 'STOP LOSS: UNIPAIR_NOT_EXIST');
        require(getPoolFromPair[pair] == address(0), 'STOP LOSS: POOL_EXISTS');
        bytes memory bytecode = type(SLPool).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(pair));
        assembly {
            pool := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }
        SLPool(pool).initialize(pair, tokenA, tokenB, oracle, WETH, uniFactory);
        getPoolFromTokens[tokenA][tokenB] = pool;
        getPoolFromTokens[tokenB][tokenA] = pool;
        getPoolFromPair[pair] = pool;
        allPools.push(pair);
        emit PoolCreated(tokenA, tokenB, pair, pool, oracle, allPools.length);
    }
}