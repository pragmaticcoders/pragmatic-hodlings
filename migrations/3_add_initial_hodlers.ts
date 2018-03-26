import * as fs from 'fs';
import { HodlingsArtifacts } from 'hodlings';
import { Deployer } from 'truffle';
import { AnyNumber } from 'web3';

declare const artifacts: HodlingsArtifacts;

const PragmaticHodlings = artifacts.require('./PragmaticHodlings.sol');

async function deploy() {
  const initialHodlers: InitialHodler[] = getInitialHodlers();

  const hodlings = await PragmaticHodlings.deployed();

  for (const hodler of initialHodlers) {
    // tslint:disable:no-console
    console.log('adding hodler', hodler);
    await hodlings.addHodler(hodler.address, hodler.joined);
  }

}

interface InitialHodler {
  address: Address;
  joined: AnyNumber;
}

function getInitialHodlers(): InitialHodler[] {
  const result: InitialHodler[] = [];
  const lines = fs.readFileSync('./migrations/initialHodlings.csv', 'utf-8')
    .split('\n');

  lines.forEach((line, idx) => {
    if (idx === 0) {
      // address,date(YYYY-MM-DD)
      return;
    }
    const splitted = line.split(',');
    result.push({
      address: splitted[0],
      joined: toTimestamp(splitted[1])
    });

  });

  return result;

  function toTimestamp(date: string) {
    return Math.floor(Date.parse(date) / 1000);
  }
}

function migrate(deployer: Deployer) {
  deployer.then(() => deploy());
}

export = migrate;
