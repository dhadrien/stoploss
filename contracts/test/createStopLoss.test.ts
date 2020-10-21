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
    const WETH = await ethers.getContract("WETH", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIWETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIWETH");
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
      WETH,
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
    const {pool, lpBalance, FDAI, WETH, uniPair} = await addLiquidity();
    await (await uniPair.approve(pool.address, lpBalance)).wait();
    await expect(
      pool.stopLoss(
        lpBalance,
        WETH.address,
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
      WETH,
      uniPair,
      deployerSigner,
    } = await addLiquidity();
    await (await uniPair.approve(pool.address, lpBalance)).wait();
    await expect(
      pool.stopLoss(
        lpBalance,
        WETH.address,
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
    await expect(pool.executeStopLoss(0, WETH.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
    // Bugging.. Error: Transaction reverted for an unrecognized reason. Please report this to help us improve Buidler.
  });

  it("should add liquidity, make a stop loss offer Token Side, be liquidated when right conditions", async function () {
    let {
      pool,
      lpBalance,
      FDAI,
      WETH,
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
      WETH,
      uniPair,
      liqSigner,
    } = await addLiquidity();
    await (await uniPair.approve(pool.address, lpBalance)).wait();
    await expect(
      pool.stopLoss(
        lpBalance,
        WETH.address,
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
    await (await pool.executeStopLoss(0, WETH.address)).wait();
  });
});

describe("[ETH/TOKEN PAIR] User add liquidity from one token, make a stop loss on this token", async function () {
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
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIWETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIWETH");
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
  });

  it("should create a stoploss with Token only", async function () {
    const {user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIWETH");
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(FDAI.address, parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
  });
  it("should create a stoploss with Token only and one with ether only", async function () {
    const {user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIWETH");
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(FDAI.address, parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromEther(parseEther("1"), {value: parseEther("2")})
    ).to.emit(pool, "StopLossCreated");
  });
  it("should create a stoploss with ETH only and withdraw", async function () {
    const {deployer, user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const WETH = await ethers.getContract("WETH", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIWETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIWETH");
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
    await pool.withdraw(0, WETH.address);
  });
  it("should create a stoploss with Token only and withdraw", async function () {
    const {user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const WETH = await ethers.getContract("WETH", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIWETH");
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(FDAI.address, parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
    await expect(pool.withdraw(0, WETH.address)).to.be.reverted;
    await pool.withdraw(0, FDAI.address);
  });
  it("should create a stoploss with ETH only and not be liquidated when should not", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const liqSigner = await ethers.getSigner(liquidator);
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const WETH = await ethers.getContract("WETH", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIWETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIWETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    const daiBalance = await FDAI.balanceOf(user);
    const lpBalance = await uniPair.balanceOf(user);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await expect(
      pool.stopLossFromEther(parseEther("1"), {value: parseEther("2")})
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await expect(pool.executeStopLoss(0, WETH.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
  });
  it("should create a stoploss with ETH only and be liquidated when should", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const liqSigner = await ethers.getSigner(liquidator);
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const WETH = await ethers.getContract("WETH", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIWETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIWETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
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
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await pool.executeStopLoss(0, WETH.address);
  });
  it("should create a stoploss with Token only and not be liquidated when should not", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const liqSigner = await ethers.getSigner(liquidator);
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIWETH");
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(FDAI.address, parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await expect(pool.executeStopLoss(0, FDAI.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
  });
  it("should create a stoploss with Token only and be liquidated when should", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const liqSigner = await ethers.getSigner(liquidator);
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIWETH");
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(
        FDAI.address,
        parseEther("200").div(BigNumber.from("96")).mul(BigNumber.from("100")),
        parseEther("200")
      )
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await pool.executeStopLoss(0, FDAI.address);
  });
  it("should create 3 stoplosss with Token only, 3 with Ether, 1 of each liq, withdrawn, not liq", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const liqSigner = await ethers.getSigner(liquidator);
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const WETH = await ethers.getContract("WETH", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIWETH");
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(
        FDAI.address,
        parseEther("100").div(BigNumber.from("96")).mul(BigNumber.from("100")),
        parseEther("100")
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromToken(
        FDAI.address,
        parseEther("100").div(BigNumber.from("56")).mul(BigNumber.from("100")),
        parseEther("100")
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromToken(
        FDAI.address,
        parseEther("100").div(BigNumber.from("56")).mul(BigNumber.from("100")),
        parseEther("100")
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromEther(
        parseEther("2").mul(BigNumber.from("96")).div(BigNumber.from("100")),
        {
          value: parseEther("2"),
        }
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromEther(
        parseEther("2").mul(BigNumber.from("56")).div(BigNumber.from("100")),
        {
          value: parseEther("2"),
        }
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromEther(
        parseEther("2").mul(BigNumber.from("56")).div(BigNumber.from("100")),
        {
          value: parseEther("2"),
        }
      )
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(1, FDAI.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
    await expect(pool.executeStopLoss(1, WETH.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
    await expect(pool.executeStopLoss(0, FDAI.address)).to.emit(
      pool,
      "StopLossExecuted"
    );
    await expect(pool.executeStopLoss(0, WETH.address)).to.emit(
      pool,
      "StopLossExecuted"
    );
    pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await expect(pool.withdraw(2, FDAI.address)).to.emit(
      pool,
      "WithdrawStopLoss"
    );
    await expect(pool.withdraw(2, WETH.address)).to.emit(
      pool,
      "WithdrawStopLoss"
    );
  });
});

describe("[TOKEN/TOKEN PAIR] User add liquidity from one token, make a stop loss on this token", async function () {
  // const {deployer, user} = await getNamedAccounts();
  // const userSigner = await ethers.getSigner(user);
  // const deployerSigner = await ethers.getSigner(deployer);
  beforeEach(async () => {
    await deployments.fixture();
  });
  it("should create a stoploss with FETH (ERC20) only", async function () {
    const {deployer, user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FETH = await ethers.getContract("FETH", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIFETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FETH.approve(pool.address, parseEther("5000000000"))).wait();
    const daiBalance = await FDAI.balanceOf(user);
    const lpBalance = await uniPair.balanceOf(user);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await expect(
      pool.stopLossFromToken(FETH.address, parseEther("2"), parseEther("1"))
    ).to.emit(pool, "StopLossCreated");
  });

  it("should create a stoploss with Token only", async function () {
    const {user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FETH = await ethers.getContract("FETH", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFETH");
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(FDAI.address, parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
  });
  it("should create a stoploss with Token only and one with ether only", async function () {
    const {user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FETH = await ethers.getContract("FETH", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFETH");
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await (await FETH.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(FDAI.address, parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromToken(FETH.address, parseEther("2"), parseEther("1"))
    ).to.emit(pool, "StopLossCreated");
  });
  it("should create a stoploss with FETH only and withdraw", async function () {
    const {deployer, user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FETH = await ethers.getContract("FETH", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIFETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FETH.approve(pool.address, parseEther("5000000000"))).wait();
    const daiBalance = await FDAI.balanceOf(user);
    const lpBalance = await uniPair.balanceOf(user);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await expect(
      pool.stopLossFromToken(FETH.address, parseEther("2"), parseEther("1"))
    ).to.emit(pool, "StopLossCreated");
    await pool.withdraw(0, FETH.address);
  });
  it("should create a stoploss with Token only and withdraw", async function () {
    const {user} = await getNamedAccounts();
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FETH = await ethers.getContract("FETH", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFETH");
    const pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(FDAI.address, parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
    await expect(pool.withdraw(0, FETH.address)).to.be.reverted;
    await pool.withdraw(0, FDAI.address);
  });
  it("should create a stoploss with FETH only and not be liquidated when should not", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const liqSigner = await ethers.getSigner(liquidator);
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FETH = await ethers.getContract("FETH", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIFETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FETH.approve(pool.address, parseEther("5000000000"))).wait();
    const daiBalance = await FDAI.balanceOf(user);
    const lpBalance = await uniPair.balanceOf(user);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await expect(
      pool.stopLossFromToken(FETH.address, parseEther("2"), parseEther("1"))
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await expect(pool.executeStopLoss(0, FETH.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
  });
  it("should create a stoploss with FETH only and be liquidated when should", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const liqSigner = await ethers.getSigner(liquidator);
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FETH = await ethers.getContract("FETH", userSigner);
    const {address: uniPairAddress} = await deployments.get("UniPairFDAIFETH");
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFETH");
    const uniPair = await ethers.getContractAt(
      "UniswapV2Pair",
      uniPairAddress,
      userSigner
    );
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FETH.approve(pool.address, parseEther("5000000000"))).wait();
    const daiBalance = await FDAI.balanceOf(user);
    const lpBalance = await uniPair.balanceOf(user);
    const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    await expect(
      pool.stopLossFromToken(
        FETH.address,
        parseEther("2"),
        parseEther("2").mul(BigNumber.from("96")).div(BigNumber.from("100"))
      )
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await pool.executeStopLoss(0, FETH.address);
  });
  it("should create a stoploss with Token only and not be liquidated when should not", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const liqSigner = await ethers.getSigner(liquidator);
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFETH");
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(FDAI.address, parseEther("200"), parseEther("150"))
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await expect(pool.executeStopLoss(0, FDAI.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
  });
  it("should create a stoploss with Token only and be liquidated when should", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const liqSigner = await ethers.getSigner(liquidator);
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFETH");
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(
        FDAI.address,
        parseEther("200").div(BigNumber.from("96")).mul(BigNumber.from("100")),
        parseEther("200")
      )
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(0, NULL_ADDRESS)).to.be.revertedWith(
      "revert SLPOOL: Wrong Token"
    );
    await pool.executeStopLoss(0, FDAI.address);
  });
  it("should create 3 stoplosss with Token only, 3 with Ether, 1 of each liq, withdrawn, not liq", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const liqSigner = await ethers.getSigner(liquidator);
    const userSigner = await ethers.getSigner(user);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FETH = await ethers.getContract("FETH", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFETH");
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await (await FETH.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(
        FDAI.address,
        parseEther("100").div(BigNumber.from("96")).mul(BigNumber.from("100")),
        parseEther("100")
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromToken(
        FDAI.address,
        parseEther("100").div(BigNumber.from("56")).mul(BigNumber.from("100")),
        parseEther("100")
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromToken(
        FDAI.address,
        parseEther("100").div(BigNumber.from("56")).mul(BigNumber.from("100")),
        parseEther("100")
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromToken(
        FETH.address,
        parseEther("2"),
        parseEther("2").mul(BigNumber.from("96")).div(BigNumber.from("100"))
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromToken(
        FETH.address,
        parseEther("2"),
        parseEther("2").mul(BigNumber.from("56")).div(BigNumber.from("100"))
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromToken(
        FETH.address,
        parseEther("2"),
        parseEther("2").mul(BigNumber.from("56")).div(BigNumber.from("100"))
      )
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(1, FDAI.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
    await expect(pool.executeStopLoss(1, FETH.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
    await expect(pool.executeStopLoss(0, FDAI.address)).to.emit(
      pool,
      "StopLossExecuted"
    );
    await expect(pool.executeStopLoss(0, FETH.address)).to.emit(
      pool,
      "StopLossExecuted"
    );
    pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    await expect(pool.withdraw(2, FDAI.address)).to.emit(
      pool,
      "WithdrawStopLoss"
    );
    await expect(pool.withdraw(2, FETH.address)).to.emit(
      pool,
      "WithdrawStopLoss"
    );
  });
  it("should create 1 stoplosss with Token only, 1 with Ether. Should be or not be liquidated depending on Swaps in the uniPair", async function () {
    const {deployer, user, liquidator} = await getNamedAccounts();
    const liqSigner = await ethers.getSigner(liquidator);
    const userSigner = await ethers.getSigner(user);
    const deployerSigner = await ethers.getSigner(deployer);
    const FDAI = await ethers.getContract("FDAI", userSigner);
    const FETH = await ethers.getContract("FETH", userSigner);
    const {address: poolAddress} = await deployments.get("SLPoolFDAIFETH");
    let pool = await ethers.getContractAt("SLPool", poolAddress, userSigner);
    const {address: pairAddress} = await deployments.get("UniPairFDAIFETH");
    const router = await ethers.getContract(
      "UniswapV2Router02",
      deployerSigner
    );
    await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
    await (await FETH.approve(pool.address, parseEther("5000000000"))).wait();
    await expect(
      pool.stopLossFromToken(
        FDAI.address,
        parseEther("1").div(BigNumber.from("94")).mul(BigNumber.from("100")),
        parseEther("1")
      )
    ).to.emit(pool, "StopLossCreated");
    await expect(
      pool.stopLossFromToken(
        FETH.address,
        parseEther("0.2"),
        parseEther("0.2").mul(BigNumber.from("94")).div(BigNumber.from("100"))
      )
    ).to.emit(pool, "StopLossCreated");
    pool = await ethers.getContractAt("SLPool", poolAddress, liqSigner);
    await expect(pool.executeStopLoss(0, FDAI.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
    await expect(pool.executeStopLoss(0, FETH.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
    await (await FDAI.approve(router.address, parseEther("200000"))).wait();
    await (await FETH.approve(router.address, parseEther("200000"))).wait();
    // swaping eth => fdai
    await router.swapExactTokensForTokens(
      parseEther("5000"),
      parseEther("1"),
      [FETH.address, FDAI.address],
      deployer,
      INFINITE_DEADLINE
    );
    await expect(pool.executeStopLoss(0, FETH.address)).to.be.revertedWith(
      "revert SLPOOL: RATIO_CONDITION"
    );
    await expect(pool.executeStopLoss(0, FDAI.address)).to.emit(
      pool,
      "StopLossExecuted"
    );
    await router.swapExactTokensForTokens(
      parseEther("3200000"),
      parseEther("1"),
      [FDAI.address, FETH.address],
      deployer,
      INFINITE_DEADLINE
    );
    await expect(pool.executeStopLoss(0, FETH.address)).to.emit(
      pool,
      "StopLossExecuted"
    );
  });
});
