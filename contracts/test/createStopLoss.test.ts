import {expect} from "./chai-setup";
import {
  ethers,
  deployments,
  getUnnamedAccounts,
  getNamedAccounts,
} from "@nomiclabs/buidler";
import {ethers as ethers2} from "ethers";
import {BigNumber} from "ethers";
const {
  utils: {parseEther},
} = ethers2;

import {
  INIT_ETH_PRICE,
  INIT_DAI_USERBALANCE,
  INIT_DAI_LIQUIDITY,
  INFINITE_DEADLINE,
  NULL_ADDRESS,
} from "../utils/envutils";
import {weiAmountToString} from "../utils/ethutils";

describe("User Create A Stop Loss", async function () {
  // const {deployer, user} = await getNamedAccounts();
  // const userSigner = await ethers.getSigner(user);
  // const deployerSigner = await ethers.getSigner(deployer);
  beforeEach(async () => {
    await deployments.fixture();
  });
  it("User should add liquidity, get LP Tokens", async function () {
    const {deployer, user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIFWETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    let daiBalance = await FDAI.balanceOf(user);
    let lpBalance = await uniPair.balanceOf(user);
    expect(lpBalance).to.be.equal(BigNumber.from("0"));
    expect(daiBalance).to.be.equal(INIT_DAI_USERBALANCE);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await (await FDAI.approve(uniRouter.address, INIT_DAI_LIQUIDITY)).wait();
    await (
      await uniRouter.addLiquidityETH(
        FDAI.address,
        INIT_DAI_USERBALANCE, /// 300 000 DAI
        parseEther("10"),
        parseEther("1"),
        user,
        INFINITE_DEADLINE,
        {
          value: INIT_DAI_USERBALANCE.div(INIT_ETH_PRICE),
          gasLimit: 4300000,
        }
      )
    ).wait();
    daiBalance = await FDAI.balanceOf(user);
    expect(daiBalance).to.be.equal(BigNumber.from("0"));
    lpBalance = await uniPair.balanceOf(user);
    expect(lpBalance).not.to.be.equal(BigNumber.from("0"));
  });

  it("should add liquidity and make a stop loss offer", async function () {
    const {deployer, user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIFWETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFWETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    let daiBalance = await FDAI.balanceOf(user);
    let lpBalance = await uniPair.balanceOf(user);
    expect(lpBalance).to.be.equal(BigNumber.from("0"));
    expect(daiBalance).to.be.equal(INIT_DAI_USERBALANCE);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await (await FDAI.approve(uniRouter.address, INIT_DAI_LIQUIDITY)).wait();
    await (
      await uniRouter.addLiquidityETH(
        FDAI.address,
        INIT_DAI_USERBALANCE, /// 300 000 DAI
        parseEther("10"),
        parseEther("1"),
        user,
        INFINITE_DEADLINE,
        {
          value: INIT_DAI_USERBALANCE.div(INIT_ETH_PRICE),
          gasLimit: 4300000,
        }
      )
    ).wait();
    daiBalance = await FDAI.balanceOf(user);
    expect(daiBalance).to.be.equal(BigNumber.from("0"));
    lpBalance = await uniPair.balanceOf(user);
    expect(lpBalance).not.to.be.equal(BigNumber.from("0"));
    await (await uniPair.approve(pool.address, lpBalance)).wait();
    await expect(
      pool.stopLoss(
        lpBalance,
        FDAI.address,
        // LP worth is initially 2* init Dai
        // Stop loss for 1.8 init Dai
        INIT_DAI_USERBALANCE.mul(BigNumber.from("18")).div(BigNumber.from("10"))
      )
    ).to.emit(pool, "StopLoss");
  });

  it("should add liquidity, make a stop loss offer, not be liquidated when wrong conditions", async function () {
    const {deployer, user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIFWETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFWETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    let daiBalance = await FDAI.balanceOf(user);
    let lpBalance = await uniPair.balanceOf(user);
    expect(lpBalance).to.be.equal(BigNumber.from("0"));
    expect(daiBalance).to.be.equal(INIT_DAI_USERBALANCE);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await (await FDAI.approve(uniRouter.address, INIT_DAI_LIQUIDITY)).wait();
    await (
      await uniRouter.addLiquidityETH(
        FDAI.address,
        INIT_DAI_USERBALANCE, /// 300 000 DAI
        parseEther("10"),
        parseEther("1"),
        user,
        INFINITE_DEADLINE,
        {
          value: INIT_DAI_USERBALANCE.div(INIT_ETH_PRICE),
          gasLimit: 4300000,
        }
      )
    ).wait();
    daiBalance = await FDAI.balanceOf(user);
    expect(daiBalance).to.be.equal(BigNumber.from("0"));
    lpBalance = await uniPair.balanceOf(user);
    expect(lpBalance).not.to.be.equal(BigNumber.from("0"));
    await (await uniPair.approve(pool.address, lpBalance)).wait();
    await expect(
      pool.stopLoss(
        lpBalance,
        FDAI.address,
        // LP worth is initially 2* init Dai
        // Stop loss for 1.8 init Dai
        INIT_DAI_USERBALANCE
      )
    ).to.emit(pool, "StopLoss");
    pool = await ethers.getContractAt("SLPool", poolAddress, deployerSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await expect(pool.executeStopLoss(0, FDAI.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
  });

  it("should add liquidity, make a stop loss offer, be liquidated when right conditions", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const liqSigner = await ethers.getSigner(liquidator);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIFWETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFWETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    let daiBalance = await FDAI.balanceOf(user);
    let lpBalance = await uniPair.balanceOf(user);
    expect(lpBalance).to.be.equal(BigNumber.from("0"));
    expect(daiBalance).to.be.equal(INIT_DAI_USERBALANCE);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await (await FDAI.approve(uniRouter.address, INIT_DAI_LIQUIDITY)).wait();
    await (
      await uniRouter.addLiquidityETH(
        FDAI.address,
        INIT_DAI_USERBALANCE, /// 600 DAI
        parseEther("10"),
        parseEther("1"),
        user,
        INFINITE_DEADLINE,
        {
          value: INIT_DAI_USERBALANCE.div(INIT_ETH_PRICE),
          gasLimit: 4300000,
        }
      )
    ).wait();
    daiBalance = await FDAI.balanceOf(user);
    expect(daiBalance).to.be.equal(BigNumber.from("0"));
    lpBalance = await uniPair.balanceOf(user);
    expect(lpBalance).not.to.be.equal(BigNumber.from("0"));
    await (await uniPair.approve(pool.address, lpBalance)).wait();
    await expect(
      pool.stopLoss(
        lpBalance,
        FDAI.address,
        // LP worth is initially 2* init Dai
        // Stop loss for 1.8 init Dai
        INIT_DAI_USERBALANCE.mul(BigNumber.from("1980")).div(
          BigNumber.from("1000")
        )
      )
    ).to.emit(pool, "StopLoss");
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await (await pool.executeStopLoss(0, FDAI.address)).wait();
  });
});
