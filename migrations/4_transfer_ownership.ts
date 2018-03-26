import { HodlingsArtifacts } from 'hodlings';
import { Deployer } from 'truffle';

declare const artifacts: HodlingsArtifacts;

const PragmaticHodlings = artifacts.require('./PragmaticHodlings.sol');
const MultiSigWallet = artifacts.require('./MultiSigWallet.sol');

async function deploy(deployer: Deployer) {
  const owners = [
    '0x9838e38f8273ee06251d2ef7ac3d4312df3c150d',
    '0x6b734e6151d6ca0b03eab35d48911f66fe6b3a90',
    '0xcba5a25918f46ea73f2640cecb8e0dda6cfec4ef',
    '0x4cbd4b81d620e71aded75e8a05f6c90e2f9aaa97'
  ];
  const required = 2;

  await deployer.deploy(MultiSigWallet, owners, required);

  const hodlings = await PragmaticHodlings.deployed();
  const multisig = await MultiSigWallet.deployed();

  await hodlings.transferOwnership(multisig.address);
}

function migrate(deployer: Deployer) {
  deployer.then(() => deploy(deployer));
}

export = migrate;
