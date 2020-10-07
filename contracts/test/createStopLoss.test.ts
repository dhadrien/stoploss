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
} from "../utils/envutils";

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

  it("should add liqidity and make a stop loss offer", async function () {
    // const {deployer, user} = await getNamedAccounts();
    // const userSigner = await ethers.getSigner(user);
    // const deployerSigner = await ethers.getSigner(deployer);
    // const FDAI = await ethers.getContract("FDAI", userSigner);
    // let daiBalance = await FDAI.balanceOf(user);
    // expect(daiBalance).to.be.equal(INIT_DAI_USERBALANCE);
    // const uniRouter = await ethers.getContract("UniswapV2Router02", userSigner);
    // await (await FDAI.approve(uniRouter.address, INIT_DAI_LIQUIDITY)).wait();
    // await (
    //   await uniRouter.addLiquidityETH(
    //     FDAI.address,
    //     INIT_DAI_USERBALANCE, /// 300 000 DAI
    //     parseEther("10"),
    //     parseEther("1"),
    //     user,
    //     INFINITE_DEADLINE,
    //     {
    //       value: INIT_DAI_USERBALANCE.div(INIT_ETH_PRICE),
    //       gasLimit: 4300000,
    //     }
    //   )
    // ).wait();
    // daiBalance = await FDAI.balanceOf(user);
    // expect(daiBalance).to.be.equal(BigNumber.from("0"));
  });

  // it("setMessage works", async function () {
  //   await deployments.fixture();
  //   const others = await getUnnamedAccounts();
  //   const jellyStoplossFinnanceContract = await ethers.getContract(
  //     "JellyStoplossFinnance",
  //     others[0]
  //   );
  //   const testMessage = "Hello World";
  //   await expect(jellyStoplossFinnanceContract.setMessage(testMessage))
  //     .to.emit(jellyStoplossFinnanceContract, "MessageChanged")
  //     .withArgs(others[0], testMessage);
  // });
});
