import { BigNumber } from 'bignumber.js';
import { HodlingsArtifacts } from 'hodlings';
import { ScriptFinalizer } from 'truffle';
import * as Web3 from 'web3';

declare const artifacts: HodlingsArtifacts;
declare const web3: Web3;

const amountPerIteration = new BigNumber(1000000);
const iterationsCount = 20;

const PragmaticHodlingsContract = artifacts.require('./PragmaticHodlings.sol');
const TestTokenContract = artifacts.require('./TestToken.sol');
const owner = web3.eth.accounts[0];

async function asyncExec() {
  const usageData: number[] = [];

  for (let idx = 0; idx < iterationsCount; idx++) {
    const hodlings = await PragmaticHodlingsContract.new({ from: owner });
    const token = await TestTokenContract.new(
      'PC Token',
      'PC',
      amountPerIteration,
      { from: owner }
    );

    await token.mint(owner, amountPerIteration);
    await token.transfer(hodlings.address, amountPerIteration, { from: owner });

    for (let i = 0; i <= idx; i++) {
      await hodlings.addHodler(numberToAddress(i + 1), 10000000 * idx, {
        from: owner
      });
    }

    const estimatedGas = await (hodlings.settleToken as any).estimateGas(
      token.address,
      { from: owner }
    );

    usageData.push(estimatedGas);
  }

  let gasChangeSum = 0;
  usageData.forEach((item, idx) => {
    if (idx === 0) {
      console.log(`hodlers count: ${idx + 1}`, `gas usage: ${item}`);
    } else {
      gasChangeSum += item - usageData[idx - 1];
      console.log(
        `hodlers count: ${idx + 1}`,
        `gas usage: ${item}`,
        `gas usage change: ${item - usageData[idx - 1]}`
      );
    }
  });

  console.log(
    `Average gas usage change per user: ${Math.floor(
      gasChangeSum / (usageData.length - 1)
    )}`
  );
}

function exec(finalize: ScriptFinalizer) {
  asyncExec().then(() => finalize(), reason => finalize(reason));
}

export = exec;

function numberToAddress(val: number): Address {
  return '0x' + ((val + 1).toString(16) as any).padStart(40, '0');
}
