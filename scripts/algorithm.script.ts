import { ScriptFinalizer } from 'truffle';

import { BigNumber } from 'bignumber.js';
import * as fs from 'fs';
import { HodlingsArtifacts, PragmaticHodlings, TestToken } from 'hodlings';
import * as Web3 from 'web3';

declare const web3: Web3;
declare const artifacts: HodlingsArtifacts;

const DAYS_IN_SECONDS = 86400;

const PragmaticHodlingsContract = artifacts.require('./PragmaticHodlings.sol');
const TestTokenContract = artifacts.require('./TestToken.sol');

const measurementsCount = 13;
const measurementInterval = 30;
const tokenSupply = new BigNumber(1000);
const owner = web3.eth.accounts[0];

async function asyncExec() {

  const hodlersWorkedDays: number[] = [
    1500, 1450, 1400, 1350, 1300,
    1250, 1200, 1150, 1100, 1050,
    1000, 950, 900, 850, 750,
    700, 650, 600, 550, 500,
    450, 400, 350, 300, 250,
    200, 150, 100, 50, 0
  ];

  const hodlersToJoin: number[] = [
    1 * measurementInterval,
    2 * measurementInterval,
    3 * measurementInterval
  ];

  const chartData: number[][] = [];
  for (
    let timeShiftDays = 0;
    timeShiftDays <= measurementsCount * measurementInterval;
    timeShiftDays += measurementInterval
  ) {
    if (hodlersToJoin.find(joiningDay => joiningDay === timeShiftDays)) {
      // comment this to keep constant hodlers count
      // hodlersWorkedDays.push(0);
    }

    const csvRowData: number[] =
      await setupAndCalculate(hodlersWorkedDays, timeShiftDays);
    chartData.push([timeShiftDays, ...csvRowData]);
  }

  const streamWrite = fs.createWriteStream(
    `./scripts/outputs/alg_constant.csv`,
    { flags: 'w' }
  );
  const columnNames = ('days' +
    hodlersWorkedDays.reduce((acc, item) => `${acc},${item} days`, '') +
    '\n'
  );
  streamWrite.write(columnNames);
  streamWrite.close();

  const streamAppend = fs.createWriteStream(
    `./scripts/outputs/alg_constant.csv`,
    { flags: 'a' }
  );

  chartData.forEach(row => {
    const parsedRow = row.join(',') + '\n';
    streamAppend.write(parsedRow);
  });
  streamAppend.end();
}

async function setupAndCalculate(
  hodlersWorkedDays: number[],
  timeShiftDays: number,
): Promise<number[]> {
  const hodlings = await PragmaticHodlingsContract.new({ from: owner });
  const token = await TestTokenContract.new(
    'PC Token',
    'PC',
    tokenSupply,
    { from: owner }
  );
  await token.mint(owner, tokenSupply, { from: owner });
  await token.transfer(hodlings.address, tokenSupply, { from: owner });

  return await calculate(hodlings, token, hodlersWorkedDays, timeShiftDays);
}

async function calculate(
  hodlings: PragmaticHodlings,
  token: TestToken,
  hodlersWorkDuration: number[],
  timeShiftDays: number,
): Promise<number[]> {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  for (const [idx, hodlerWorkDuration] of hodlersWorkDuration.entries()) {
    await hodlings.addHodler(
      numberToAddress(idx),
      currentTimestamp - (timeShiftDays + hodlerWorkDuration) * DAYS_IN_SECONDS,
      { from: owner }
    );
  }

  const data: number[] = new Array<number>(hodlersWorkDuration.length);
  await hodlings.settleToken(token.address, { from: owner });

  for (const [idx] of hodlersWorkDuration.entries()) {
    const hodlerBalance = await token.balanceOf(numberToAddress(idx));
    data[idx] = hodlerBalance.toNumber();
  }
  return data;
}

function numberToAddress(val: number): Address {
  return '0x' + ((val + 1).toString(16) as any).padStart(40, '0');
}

function exec(finalize: ScriptFinalizer) {
  asyncExec().then(() => finalize(), reason => finalize(reason));
}

export = exec;
