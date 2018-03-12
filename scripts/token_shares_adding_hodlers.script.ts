import { ScriptFinalizer } from 'truffle';
import { calculateShares } from './token_shares';
import { HodlingsArtifacts } from 'hodlings';
import * as Web3 from 'web3';

declare const artifacts: HodlingsArtifacts;
declare const web3: Web3;

const measurementInterval = 10;
const measurementsCount = 39;

async function asyncExec() {

  const hodlersWorkedDays: number[] = [
    1500, 1450, 1400, 1350, 1300,
    1250, 1200, 1150, 1100, 1050,
    1000, 950, 900, 850, 750,
    700, 650, 600, 550, 500,
    450, 400, 350, 300, 250,
    200, 150, 100, 50, 0,
    -30, -60, -90, -120
  ];

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
