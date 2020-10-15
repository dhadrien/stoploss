import {BuidlerRuntimeEnvironment} from "@nomiclabs/buidler/types";
import {ethers} from "@nomiclabs/buidler";
import {ethers as ethers2} from "ethers";

const {
  utils: {parseEther},
} = ethers2;

import {logStep} from "../utils/slutils";
import {weiAmountToString} from "../utils/ethutils";
import {
  NULL_ADDRESS,
  INIT_ETH_LIQUIDITY,
  INIT_DAI_LIQUIDITY,
  INIT_TOKEN_SUPPLY,
  INFINITE_DEADLINE,
} from "../utils/envutils";

async function deployTokenWeth(
  token: string,
  bre: BuidlerRuntimeEnvironment
): Promise<BuidlerRuntimeEnvironment> {
  const {deployer, user} = await bre.getNamedAccounts();
  const {deploy, save, getArtifact} = bre.deployments;
  const deployerSigner = await ethers.getSigner(deployer);
  const WETH = await ethers.getContract("WETH");
  const Token = await ethers.getContract(token);
  const uniRouter = await ethers.getContract(
    "UniswapV2Router02",
    deployerSigner
  );
  const uniFactory = await ethers.getContract(
    "UniswapV2Factory",
    deployerSigner
  );
  const SLfactory = await ethers.getContract("SLFactory", deployerSigner);

  let pairAddress = await uniFactory.getPair(Token.address, WETH.address);
  if (pairAddress === NULL_ADDRESS) {
    await (await uniFactory.createPair(Token.address, WETH.address)).wait();
    pairAddress = await uniFactory.getPair(Token.address, WETH.address);
    console.log("Pair Created: ", pairAddress);
  } else
    console.log("Pair already created in previous deployment: ", pairAddress);
  const uniPairArtifact = await getArtifact("UniswapV2Pair");
  save("UniPair" + token + "WETH", {
    abi: uniPairArtifact.abi,
    address: pairAddress,
  });
  const uniPair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
  logStep("ADDING INITIAL LIQUIDITY");
  const {_reserve0: res0, _reserve1: res1} = await uniPair.getReserves();
  const [reserveBefore1, reserveBefore2] = [res0, res1].map(weiAmountToString);
  if (reserveBefore1 === reserveBefore2 && reserveBefore2 === "0") {
    await (await WETH.approve(uniRouter.address, INIT_TOKEN_SUPPLY)).wait();
    await (await Token.approve(uniRouter.address, INIT_TOKEN_SUPPLY)).wait();
    await (
      await uniRouter.addLiquidity(
        WETH.address,
        Token.address,
        INIT_ETH_LIQUIDITY,
        INIT_DAI_LIQUIDITY,
        parseEther("1"),
        parseEther("1"),
        deployer,
        INFINITE_DEADLINE,
        {
          gasLimit: 900000,
        }
      )
    ).wait();
  } else console.log("Liquidity already exist, no need to add more");
  const TokenReserve = await Token.balanceOf(pairAddress);
  const WETHREserve = await WETH.balanceOf(pairAddress);
  console.log("Reserve for Token: ", weiAmountToString(TokenReserve));
  console.log("Reserve for WETH: ", weiAmountToString(WETHREserve));

  logStep("DEPLOYING STOPLOSS ORACLE FOR" + token + "/WETH");
  await deploy("SLOracle" + token + "WETH", {
    contract: "SLOracle",
    from: deployer,
    proxy: false,
    args: [uniFactory.address, Token.address, WETH.address],
    log: true,
  });
  const SLOracle = await ethers.getContract("SLOracle" + token + "WETH");

  logStep("DEPLOYER STOPLOSS POOL FOR" + token + "/WETH PAIR");
  let poolAddress = await SLfactory.getPoolFromTokens(
    Token.address,
    WETH.address
  );
  if (poolAddress === NULL_ADDRESS) {
    await (
      await SLfactory.createPool(WETH.address, Token.address, SLOracle.address)
    ).wait();
    poolAddress = await SLfactory.getPoolFromTokens(
      Token.address,
      WETH.address
    );
    console.log("Pool Created: ", poolAddress);
  } else
    console.log("Pool already created in previous deployment: ", poolAddress);
  const SLPool = await getArtifact("SLPool");
  save("SLPool" + token + "WETH", {abi: SLPool.abi, address: poolAddress});
  return bre;
}

async function deployTokenFeth(
  token: string,
  bre: BuidlerRuntimeEnvironment
): Promise<BuidlerRuntimeEnvironment> {
  const {deployer, user} = await bre.getNamedAccounts();
  const {deploy, save, getArtifact} = bre.deployments;
  const deployerSigner = await ethers.getSigner(deployer);
  const FETH = await ethers.getContract("FETH");
  const Token = await ethers.getContract(token);
  const uniRouter = await ethers.getContract(
    "UniswapV2Router02",
    deployerSigner
  );
  const uniFactory = await ethers.getContract(
    "UniswapV2Factory",
    deployerSigner
  );
  const SLfactory = await ethers.getContract("SLFactory", deployerSigner);

  let pairAddress = await uniFactory.getPair(Token.address, FETH.address);
  if (pairAddress === NULL_ADDRESS) {
    await (await uniFactory.createPair(Token.address, FETH.address)).wait();
    pairAddress = await uniFactory.getPair(Token.address, FETH.address);
    console.log("Pair Created: ", pairAddress);
  } else
    console.log("Pair already created in previous deployment: ", pairAddress);
  const uniPairArtifact = await getArtifact("UniswapV2Pair");
  save("UniPair" + token + "FETH", {
    abi: uniPairArtifact.abi,
    address: pairAddress,
  });
  const uniPair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
  logStep("ADDING INITIAL LIQUIDITY");
  const {_reserve0: res0, _reserve1: res1} = await uniPair.getReserves();
  const [reserveBefore1, reserveBefore2] = [res0, res1].map(weiAmountToString);
  if (reserveBefore1 === reserveBefore2 && reserveBefore2 === "0") {
    await (await FETH.approve(uniRouter.address, INIT_TOKEN_SUPPLY)).wait();
    await (await Token.approve(uniRouter.address, INIT_TOKEN_SUPPLY)).wait();
    await (
      await uniRouter.addLiquidity(
        FETH.address,
        Token.address,
        INIT_ETH_LIQUIDITY,
        INIT_DAI_LIQUIDITY,
        parseEther("1"),
        parseEther("1"),
        deployer,
        INFINITE_DEADLINE,
        {
          gasLimit: 900000,
        }
      )
    ).wait();
  } else console.log("Liquidity already exist, no need to add more");
  const TokenReserve = await Token.balanceOf(pairAddress);
  const FETHREserve = await FETH.balanceOf(pairAddress);
  console.log("Reserve for Token: ", weiAmountToString(TokenReserve));
  console.log("Reserve for FETH: ", weiAmountToString(FETHREserve));

  logStep("DEPLOYING STOPLOSS ORACLE FOR " + token + "/FETH");
  await deploy("SLOracle" + token + "FETH", {
    contract: "SLOracle",
    from: deployer,
    proxy: false,
    args: [uniFactory.address, Token.address, FETH.address],
    log: true,
  });
  const SLOracle = await ethers.getContract("SLOracle" + token + "FETH");

  logStep("DEPLOYER STOPLOSS POOL FOR" + token + "/FETH PAIR");
  let poolAddress = await SLfactory.getPoolFromTokens(
    Token.address,
    FETH.address
  );
  console.log("$$$$$$$$$$$$$$$", FETH.address);
  console.log(
    token + "balance OF DPELOYER",
    weiAmountToString(await Token.balanceOf(deployer))
  );
  if (poolAddress === NULL_ADDRESS) {
    await (
      await SLfactory.createPool(FETH.address, Token.address, SLOracle.address)
    ).wait();
    poolAddress = await SLfactory.getPoolFromTokens(
      Token.address,
      FETH.address
    );
    console.log("Pool Created: ", poolAddress);
  } else
    console.log("Pool already created in previous deployment: ", poolAddress);
  const SLPool = await getArtifact("SLPool");
  save("SLPool" + token + "FETH", {abi: SLPool.abi, address: poolAddress});
  return bre;
}

export {deployTokenWeth, deployTokenFeth};
