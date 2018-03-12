import { BigNumber } from 'bignumber.js';
import * as fs from 'fs';
import {
  HodlingsArtifacts,
  PragmaticHodlings,
  PragmaticHodlingsContract,
  TestToken,
  TestTokenContract
} from 'hodlings';
import * as Web3 from 'web3';

const DAYS_IN_SECONDS = 86400;

const outputFilename = `./scripts/outputs/token_shares.csv`;

let owner: Address;
let PragmaticHodlingsContract: PragmaticHodlingsContract;
let TestTokenContract: TestTokenContract;

export async function calculateShares(
  tokenSupply: BigNumber,
  hodlersWorkedDays: number[],
  hodlersToRemove: Array<{ removeDay: number, index: number }>,
  measurementInterval: number,
  measurementsCount: number,
  artifacts: HodlingsArtifacts,
  web3: Web3
) {
  PragmaticHodlingsContract = artifacts.require('./PragmaticHodlings.sol');
  TestTokenContract = artifacts.require('./TestToken.sol');
  owner = web3.eth.accounts[0];

  const chartData: number[][] = [];
  for (
    let timeShiftDays = 0;
    timeShiftDays <= measurementsCount * measurementInterval;
    timeShiftDays += measurementInterval
  ) {

    const csvRowData: number[] =
      await setupAndCalculate(tokenSupply, hodlersWorkedDays, hodlersToRemove, timeShiftDays);
    chartData.push([timeShiftDays, ...csvRowData]);
  }

  const streamWrite = fs.createWriteStream(outputFilename, { flags: 'w' });
  const columnNames = ('days' +
    hodlersWorkedDays.reduce((acc, item) => `${acc},${item} days`, '') +
    '\n'
  );
  streamWrite.write(columnNames);
  streamWrite.close();

  const streamAppend = fs.createWriteStream(outputFilename, { flags: 'a' });

  chartData.forEach(row => {
    const parsedRow = row.join(',') + '\n';
    streamAppend.write(parsedRow);
  });
  streamAppend.end();
}

async function setupAndCalculate(
  tokenSupply: BigNumber,
  hodlersWorkedDays: number[],
  hodlersToRemove: any[],
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

  return await calculate(hodlings, token, hodlersWorkedDays, hodlersToRemove, timeShiftDays);
}

async function calculate(
  hodlings: PragmaticHodlings,
  token: TestToken,
  hodlersWorkDuration: number[],
  hodlersToRemove: any[],
  timeShiftDays: number,
): Promise<number[]> {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const removedHodlers = hodlersToRemove.filter(
    hodler => hodler.removeDay <= timeShiftDays
  );

  for (const [idx, hodlerWorkDuration] of hodlersWorkDuration.entries()) {

    if (removedHodlers.find(item => item.index === idx)) {
      // removed already
      continue;
    }
    const durationWithTimeShift = timeShiftDays + hodlerWorkDuration;
    if (durationWithTimeShift > 0) { // if hodler is already joined
      await hodlings.addHodler(
        numberToAddress(idx),
        currentTimestamp - durationWithTimeShift * DAYS_IN_SECONDS,
        { from: owner }
      );
    }
  }

  const data: number[] = new Array<number>(hodlersWorkDuration.length);
  await hodlings.settleToken(token.address, { from: owner });

  for (const [idx] of hodlersWorkDuration.entries()) {
    if (removedHodlers.find(item => item.index === idx)) {
      // removed already so type nan
      data[idx] = NaN;
    } else {
      const hodlerBalance = await token.balanceOf(numberToAddress(idx));
      data[idx] = hodlerBalance.toNumber();
    }

  }
  return data;
}

function numberToAddress(val: number): Address {
  return '0x' + ((val + 1).toString(16) as any).padStart(40, '0');
}
