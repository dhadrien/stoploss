import {expect} from './chai-setup';
import {ethers, deployments, getUnnamedAccounts} from '@nomiclabs/buidler';

describe('Uniswap Factory V2 Creation', function () {
  it('should work', async function () {
    await deployments.fixture();
    const uni = await ethers.getContract('UniswapV2Factory');
    console.log("susu l'adresse?", uni.address);
    expect(uni.address).to.be.a('string');
  });

  it('should fails', async function () {
    await deployments.fixture();
    const jellyStoplossFinnanceContract = await ethers.getContract('JellyStoplossFinnance');
    expect(jellyStoplossFinnanceContract.fails('testing')).to.be.revertedWith('fails');
  });

  it('setMessage works', async function () {
    await deployments.fixture();
    const others = await getUnnamedAccounts();
    const jellyStoplossFinnanceContract = await ethers.getContract('JellyStoplossFinnance', others[0]);
    const testMessage = 'Hello World';
    await expect(jellyStoplossFinnanceContract.setMessage(testMessage))
      .to.emit(jellyStoplossFinnanceContract, 'MessageChanged')
      .withArgs(others[0], testMessage);
  });
});
