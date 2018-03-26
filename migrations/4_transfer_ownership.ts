import { HodlingsArtifacts } from 'hodlings';
import { Deployer } from 'truffle';

declare const artifacts: HodlingsArtifacts;

const PragmaticHodlings = artifacts.require('./PragmaticHodlings.sol');

async function deploy() {
  const hodlings = await PragmaticHodlings.deployed();

  // todo deploy multisig here??
  // hodlings.transferOwnership(multisig.address);
}

function migrate(deployer: Deployer) {
  deployer.then(() => deploy());
}

export = migrate;
