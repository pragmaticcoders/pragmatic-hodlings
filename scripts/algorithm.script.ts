import { ScriptFinalizer } from 'truffle';

import { BigNumber } from 'bignumber.js';
import { HodlingsArtifacts, PragmaticHodlings, TestToken } from 'hodlings';
import * as Web3 from 'web3';

declare const web3: Web3;
declare const artifacts: HodlingsArtifacts;

const DAYS_IN_SECONDS = 86400;

const PragmaticHodlingsContract = artifacts.require('./PragmaticHodlings.sol');
const TestTokenContract = artifacts.require('./TestToken.sol');

const tokenSupply = new BigNumber(1000);
const owner = web3.eth.accounts[0];

async function asyncExec() {

  const hodlersWorkedDays: number[] = [
    1500, 1450, 1300, 1250, 1200, 1150, 1100, 1050, 1000, 950,
    900, 850, 750, 700, 650, 600, 550, 500, 450, 400,
    350, 300, 250, 200, 150, 100, 50, 0
  ];

  for (let timeShiftDays = 0; timeShiftDays <= 120; timeShiftDays += 30) {
    await setupAndCalculate(hodlersWorkedDays, timeShiftDays);
  }
}

async function setupAndCalculate(
  hodlersWorkedDays: number[],
  timeShiftDays: number
) {
  const hodlings = await PragmaticHodlingsContract.new({ from: owner });
  const token = await TestTokenContract.new(
    'PC Token',
    'PC',
    tokenSupply,
    { from: owner }
  );
  await token.mint(owner, tokenSupply, { from: owner });
  await token.transfer(hodlings.address, tokenSupply, { from: owner });

  await calculate(hodlings, token, hodlersWorkedDays, timeShiftDays);
}

async function calculate(
  hodlings: PragmaticHodlings,
  token: TestToken,
  hodlersWorkDuration: number[],
  timeShiftDays: number,
) {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  for (const [idx, hodlerWorkDuration] of hodlersWorkDuration.entries()) {
    await hodlings.registerHodler(
      numberToAddress(idx),
      currentTimestamp - (timeShiftDays + hodlerWorkDuration) * DAYS_IN_SECONDS,
      { from: owner }
    );
  }

  await hodlings.settleToken(token.address, { from: owner });

  console.log(`--------------------------Timeshift ${timeShiftDays} days--------------------------`);
  for (const [idx] of hodlersWorkDuration.entries()) {
    const hodlerBalance = await token.balanceOf(numberToAddress(idx));
    console.log(idx, hodlerBalance.toNumber());
  }
}

function numberToAddress(val: number): Address {
  return '0x' + ((val + 1).toString(16) as any).padStart(40, '0');
}

function exec(finalize: ScriptFinalizer) {
  asyncExec().then(() => finalize(), reason => finalize(reason));
}

export = exec;
