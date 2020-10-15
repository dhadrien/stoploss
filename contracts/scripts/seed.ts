import {getUnnamedAccounts, ethers, getNamedAccounts} from "@nomiclabs/buidler";
import {ethers as ethers2} from "ethers";
import {BigNumber} from "ethers";
import {NULL_ADDRESS} from "../utils/envutils";
const {
  utils: {parseEther},
} = ethers2;

function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  return p.then((tx) => tx.wait());
}

async function populateOrders(tokenString: string) {
  const others = await getUnnamedAccounts();
  const {deployer, user, liquidator} = await getNamedAccounts();
  const liqSigner = await ethers.getSigner(liquidator);
  const userSigner = await ethers.getSigner(user);
  const FWETH = await ethers.getContract("FWETH", userSigner);
  const Token = await ethers.getContract("F" + tokenString, userSigner);
  let pool = await ethers.getContract(
    "SLPoolF" + tokenString + "FWETH",
    userSigner
  );
  await (await Token.approve(pool.address, parseEther("5000000000"))).wait();
  await pool.stopLossFromToken(
    Token.address,
    parseEther("100").div(BigNumber.from("96")).mul(BigNumber.from("100")),
    parseEther("100")
  );
  await pool.stopLossFromToken(
    Token.address,
    parseEther("100").div(BigNumber.from("56")).mul(BigNumber.from("100")),
    parseEther("100")
  );
  await pool.stopLossFromToken(
    Token.address,
    parseEther("100").div(BigNumber.from("56")).mul(BigNumber.from("100")),
    parseEther("100")
  );
  await pool.stopLossFromEther(
    parseEther("2").mul(BigNumber.from("96")).div(BigNumber.from("100")),
    {
      value: parseEther("2"),
    }
  );
  await pool.stopLossFromEther(
    parseEther("2").mul(BigNumber.from("56")).div(BigNumber.from("100")),
    {
      value: parseEther("2"),
    }
  );
  await pool.stopLossFromEther(
    parseEther("2").mul(BigNumber.from("56")).div(BigNumber.from("100")),
    {
      value: parseEther("2"),
    }
  );
  pool = await ethers.getContract("SLPoolF" + tokenString + "FWETH", liqSigner);
  await pool.executeStopLoss(0, Token.address);
  await pool.executeStopLoss(0, FWETH.address);
  pool = await ethers.getContract(
    "SLPoolF" + tokenString + "FWETH",
    userSigner
  );
  await pool.withdraw(2, Token.address);
  await pool.withdraw(2, FWETH.address);
  return userSigner;
}

async function main() {
  const userSigner = await populateOrders("DAI");
  // await populateOrders("USDC");
  // await populateOrders("USDT");
  // const userSigner = await populateOrders("WBTC");
  await userSigner.sendTransaction({
    to: NULL_ADDRESS,
    value: (await userSigner.getBalance()).sub(parseEther("5")),
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
