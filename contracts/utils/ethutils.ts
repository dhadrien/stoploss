import {ethers} from 'ethers';

export function weiAmountToString(bignum: ethers.BigNumber): string {
  return bignum.div(ethers.utils.parseEther('1.0')).toString();
}
