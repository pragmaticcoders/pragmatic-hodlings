import { BigNumber } from 'bignumber.js';
import { HodlingsArtifacts } from 'hodlings';
import { ScriptFinalizer } from 'truffle';
import * as Web3 from 'web3';
import { calculateShares } from './token_shares';

declare const artifacts: HodlingsArtifacts;
declare const web3: Web3;

const measurementInterval = 10;
const measurementsCount = 39;
const tokenSupply = new BigNumber(100000);

async function asyncExec() {
  let hodlersWorkedDays: number[] = [];
  process.argv.forEach((item, idx) => {
    if (item === 'data') {
      hodlersWorkedDays = JSON.parse(process.argv[idx + 1]);
    }
  });

  if (!hodlersWorkedDays.length) {
    throw new Error('data is not specified');
  }

  let hodlersToRemove: Array<{ removeDay: number, index: number }> = [];
  process.argv.forEach((item, idx) => {
    if (item === 'dataToRemove') {
      const rawData: number[][] = JSON.parse(process.argv[idx + 1]);
      hodlersToRemove = rawData.reduce((acc, raw) => {
        return [
          ...acc,
          {
            index: raw[1],
            removeDay: raw[0]
          }
        ];
      }, [] as any[]);
    }
  });

  await calculateShares(
    tokenSupply,
    hodlersWorkedDays,
    hodlersToRemove,
    measurementInterval,
    measurementsCount,
    artifacts,
    web3
  );
}

function exec(finalize: ScriptFinalizer) {
  asyncExec().then(() => finalize(), reason => finalize(reason));
}

export = exec;
