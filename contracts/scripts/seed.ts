import {getUnnamedAccounts, ethers, getNamedAccounts} from "@nomiclabs/buidler";
import {ethers as ethers2} from "ethers";
import {BigNumber} from "ethers";
const {
  utils: {parseEther},
} = ethers2;
const messages = [
  "Hello",
  "你好",
  "سلام",
  "здравствуйте",
  "Habari",
  "Bonjour",
  "नमस्ते",
];

function waitFor<T>(p: Promise<{wait: () => Promise<T>}>): Promise<T> {
  return p.then((tx) => tx.wait());
}

async function main() {
  const others = await getUnnamedAccounts();
  const {deployer, user, liquidator} = await getNamedAccounts();
  const liqSigner = await ethers.getSigner(liquidator);
  const userSigner = await ethers.getSigner(user);
  const FDAI = await ethers.getContract("FDAI", userSigner);
  const FWETH = await ethers.getContract("FWETH", userSigner);
  let pool = await ethers.getContract("SLPoolFDAIFWETH", userSigner);
  await (await FDAI.approve(pool.address, parseEther("5000000000"))).wait();
  await pool.stopLossFromToken(
    parseEther("100").div(BigNumber.from("96")).mul(BigNumber.from("100")),
    parseEther("100")
  );
  await pool.stopLossFromToken(
    parseEther("100").div(BigNumber.from("56")).mul(BigNumber.from("100")),
    parseEther("100")
  );
  await pool.stopLossFromToken(
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
  pool = await ethers.getContract("SLPoolFDAIFWETH", liqSigner);
  await pool.executeStopLoss(0, FDAI.address);
  await pool.executeStopLoss(0, FWETH.address);
  pool = await ethers.getContract("SLPoolFDAIFWETH", userSigner);
  await pool.withdraw(2, FDAI.address);
  await pool.withdraw(2, FWETH.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
