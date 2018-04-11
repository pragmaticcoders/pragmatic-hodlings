import { HodlingsArtifacts } from 'hodlings';
import { Deployer } from 'truffle';
import { AnyNumber } from 'web3';

declare const artifacts: HodlingsArtifacts;

const PragmaticHodlings = artifacts.require('./PragmaticHodlings.sol');

const initialHodlers: InitialHodler[] = [
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c150d', '2017.04.03'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1500', '2017.04.03'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1501', '2017.07.03'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1502', '2017.10.02'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1503', '2016.02.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1504', '2017.07.03'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1505', '2016.07.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1506', '2017.03.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1507', '2017.05.04'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1508', '2017.05.22'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1509', '2017.12.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c150a', '2017.12.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c150b', '2017.12.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c150c', '2017.12.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1511', '2016.04.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1522', '2017.12.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c153d', '2017.12.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c154d', '2017.06.19'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c155d', '2017.10.02'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c156d', '2017.10.02'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c157d', '2018.03.16'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c158d', '2017.12.20'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c159d', '2018.01.08'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c15ad', '2017.12.19'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c15bd', '2018.02.02'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c15cd', '2014.09.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c15dd', '2014.09.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c100d', '2017.01.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c110d', '2016.05.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c120d', '2017.08.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c130d', '2018.03.23'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c140d', '2017.07.12'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c150d', '2017.11.02'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c160d', '2016.11.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c170d', '2017.06.01'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c180d', '2018.02.12'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c190d', '2017.11.14'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1a0d', '2018.02.13'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1b0d', '2018.02.19'],
  ['0x9838e38f8273ee06251d2ef7ac3d4312df3c1c0d', '2018.04.02'],
].map(arr => ({ address: arr[0], joinDate: toTimestamp(arr[1]) }));

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
