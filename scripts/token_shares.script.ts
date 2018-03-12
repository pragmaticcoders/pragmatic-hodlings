import { HodlingsArtifacts } from 'hodlings';
import { ScriptFinalizer } from 'truffle';
import * as Web3 from 'web3';
import { calculateShares } from './token_shares';

declare const artifacts: HodlingsArtifacts;
declare const web3: Web3;

const measurementInterval = 10;
const measurementsCount = 39;

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

  await calculateShares(
    hodlersWorkedDays,
    [],
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
