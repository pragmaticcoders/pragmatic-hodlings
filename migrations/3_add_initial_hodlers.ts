import { HodlingsArtifacts } from 'hodlings';
import { Deployer } from 'truffle';
import { AnyNumber } from 'web3';

declare const artifacts: HodlingsArtifacts;

const PragmaticHodlings = artifacts.require('./PragmaticHodlings.sol');

const initialHodlers: InitialHodler[] = [
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c150d', '2015-01-02'],
  ['0x6b734e6151d6ca0b03eab35d48911f66fe6b3a90', '2016-01-02'],
  ['0xcba5a25918f46ea73f2640cecb8e0dda6cfec4ef', '2017-01-02'],
  ['0x4cbd4b81d620e71aded75e8a05f6c90e2f9aaa97', '2018-01-02']
].map(arr => ({address: arr[0], joinDate: toTimestamp(arr[1])}));

async function deploy() {
  const hodlings = await PragmaticHodlings.deployed();

  for (const hodler of initialHodlers) {
    // tslint:disable:no-console
    console.log('adding hodler', hodler);
    await hodlings.addHodler(hodler.address, hodler.joinDate);
  }
}

function toTimestamp(date: string) {
  return Math.floor(Date.parse(date) / 1000);
}

function migrate(deployer: Deployer) {
  deployer.then(() => deploy());
}

export = migrate;

interface InitialHodler {
  address: Address;
  joinDate: AnyNumber;
}
