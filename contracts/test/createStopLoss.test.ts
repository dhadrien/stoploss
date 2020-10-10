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

const addLiquidity = deployments.createFixture(
  async ({deployments, getNamedAccounts, ethers}, options) => {
    await deployments.fixture(); // ensure you start from a fresh deployments
    const {deployer, user, liquidator} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const liqSigner = await ethers.getSigner(liquidator);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FWETH = await ethers.getContract("FWETH", userSigner);
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
    return {
      FDAI,
      FWETH,
      deployerSigner,
      userSigner,
      uniPair,
      uniRouter,
      pool,
      lpBalance,
      liqSigner,
    };
  }
);

describe("User adds liquidity, then Create A Stop Loss with LP: ETH/Token", async function () {
  // const {deployer, user} = await getNamedAccounts();
  // const userSigner = await ethers.getSigner(user);
  // const deployerSigner = await ethers.getSigner(deployer);
  beforeEach(async () => {
    await deployments.fixture();
  });
  it("User should add liquidity, get LP Tokens", async function () {
    await addLiquidity();
  });
  it("should add liquidity and make a stop loss offer Token Side", async function () {
    const {pool, lpBalance, FDAI, uniPair} = await addLiquidity();
    await (await uniPair.approve(pool.address, lpBalance)).wait();
    await expect(
      pool.stopLoss(
        lpBalance,
        FDAI.address,
        // LP worth is initially 2* init Dai
        // Stop loss for 1.8 init Dai
        INIT_DAI_USERBALANCE.mul(BigNumber.from("18")).div(BigNumber.from("10"))
      )
    ).to.emit(pool, "StopLossCreated");
  });
  it("should add liquidity and make a stop loss offer Ether Side", async function () {
    const {pool, lpBalance, FDAI, FWETH, uniPair} = await addLiquidity();
    await (await uniPair.approve(pool.address, lpBalance)).wait();
    await expect(
      pool.stopLoss(
        lpBalance,
        FWETH.address,
        // LP worth is initially 2* init Dai
        // Stop loss for 1.8 init Dai
        INIT_DAI_USERBALANCE.div(INIT_ETH_PRICE)
          .mul(BigNumber.from("18"))
          .div(BigNumber.from("10"))
      )
    ).to.emit(pool, "StopLossCreated");
  });

  it("should add liquidity, make a stop loss offer Token side, not be liquidated when wrong conditions", async function () {
    let {pool, lpBalance, FDAI, uniPair, deployerSigner} = await addLiquidity();
    await (await uniPair.approve(pool.address, lpBalance)).wait();
    await expect(
      pool.stopLoss(
        lpBalance,
        FDAI.address,
        // LP worth is initially 2* init Dai
        // Stop loss for 1.8 init Dai
        INIT_DAI_USERBALANCE
      )
    ).to.emit(pool, "StopLossCreated");
    pool = await pool.connect(deployerSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await expect(pool.executeStopLoss(0, FDAI.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
  });

  it("should add liquidity, make a stop loss offer Ether side, not be liquidated when wrong conditions", async function () {
    let {
      pool,
      lpBalance,
      FDAI,
      FWETH,
      uniPair,
      deployerSigner,
    } = await addLiquidity();
    await (await uniPair.approve(pool.address, lpBalance)).wait();
    await expect(
      pool.stopLoss(
        lpBalance,
        FWETH.address,
        // LP worth is initially 2* init Dai
        // Stop loss for 1.8 init Dai
        INIT_DAI_USERBALANCE.div(INIT_ETH_PRICE)
          .mul(BigNumber.from("18"))
          .div(BigNumber.from("10"))
      )
    ).to.emit(pool, "StopLossCreated");
    pool = await pool.connect(deployerSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await expect(pool.executeStopLoss(0, FWETH.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
    // Bugging.. Error: Transaction reverted for an unrecognized reason. Please report this to help us improve Buidler.
  });

  it("should add liquidity, make a stop loss offer Token Side, be liquidated when right conditions", async function () {
    let {
      pool,
      lpBalance,
      FDAI,
      FWETH,
      uniPair,
      liqSigner,
    } = await addLiquidity();
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
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", pool.address, liqSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await (await pool.executeStopLoss(0, FDAI.address)).wait();
  });

  it("should add liquidity, make a stop loss offer Ether side, be liquidated when right conditions", async function () {
    let {
      pool,
      lpBalance,
      FDAI,
      FWETH,
      uniPair,
      liqSigner,
    } = await addLiquidity();
    await (await uniPair.approve(pool.address, lpBalance)).wait();
    await expect(
      pool.stopLoss(
        lpBalance,
        FWETH.address,
        // LP worth is initially 2* init Dai
        // Stop loss for 1.8 init Dai
        INIT_DAI_USERBALANCE.div(INIT_ETH_PRICE)
          .mul(BigNumber.from("1950"))
          .div(BigNumber.from("1000"))
      )
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", pool.address, liqSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await (await pool.executeStopLoss(0, FWETH.address)).wait();
  });
});

describe("User add liquidity from one token, make a stop loss on this token", async function () {
  // const {deployer, user} = await getNamedAccounts();
  // const userSigner = await ethers.getSigner(user);
  // const deployerSigner = await ethers.getSigner(deployer);
  beforeEach(async () => {
    await deployments.fixture();
  });
  it("should create a stoploss with ETH only", async function () {
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
    const daiBalance = await FDAI.balanceOf(user);
    const lpBalance = await uniPair.balanceOf(user);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await expect(
      pool.stopLossFromEther(parseEther("2"), {value: parseEther("1")})
    ).to.emit(pool, "StopLossCreated");
  });

  it("should create a stoploss with Token only", async function () {
    const {user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFWETH");
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
  });
  it("should create a stoploss with Token only and one with ether only", async function () {
    const {user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFWETH");
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromEther(parseEther("2"), {value: parseEther("1")})
    ).to.emit(pool, "StopLossCreated");
  });
  it("should create a stoploss with ETH only and withdraw", async function () {
    const {deployer, user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FWETH = await ethers.getContract("FWETH", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIFWETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFWETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    const daiBalance = await FDAI.balanceOf(user);
    const lpBalance = await uniPair.balanceOf(user);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await expect(
      pool.stopLossFromEther(parseEther("2"), {value: parseEther("1")})
    ).to.emit(pool, "StopLossCreated");
    await pool.withdraw(0, FWETH.address);
  });
  it("should create a stoploss with Token only and withdraw", async function () {
    const {user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FWETH = await ethers.getContract("FWETH", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFWETH");
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
    await expect(pool.withdraw(0, FWETH.address)).to.be.reverted;
    await pool.withdraw(0, FDAI.address);
  });
  it("should create a stoploss with ETH only and not be liquidated when should not", async function () {
    const {deployer, user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FWETH = await ethers.getContract("FWETH", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIFWETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFWETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    const daiBalance = await FDAI.balanceOf(user);
    const lpBalance = await uniPair.balanceOf(user);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await expect(
      pool.stopLossFromEther(parseEther("1"), {value: parseEther("2")})
    ).to.emit(pool, "StopLossCreated");
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await expect(pool.executeStopLoss(0, FWETH.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
  });
  it("should create a stoploss with ETH only and be liquidated when should", async function () {
    const {deployer, user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FWETH = await ethers.getContract("FWETH", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIFWETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFWETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    const daiBalance = await FDAI.balanceOf(user);
    const lpBalance = await uniPair.balanceOf(user);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await expect(
      pool.stopLossFromEther(
        parseEther("2").mul(BigNumber.from("96")).div(BigNumber.from("100")),
        {
          value: parseEther("2"),
        }
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await pool.executeStopLoss(0, FWETH.address);
  });
  it("should create a stoploss with Token only and not be liquidated when should not", async function () {
    const {deployer, user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFWETH");
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await expect(pool.executeStopLoss(0, FDAI.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
  });
  it("should create a stoploss with Token only and be liquidated when should", async function () {
    const {deployer, user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFWETH");
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(
        parseEther("200").div(BigNumber.from("96")).mul(BigNumber.from("100")),
        parseEther("200")
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await pool.executeStopLoss(0, FDAI.address);
  });
});
