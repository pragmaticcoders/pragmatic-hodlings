import { HodlingsArtifacts } from 'hodlings';
import { Deployer } from 'truffle';

declare const artifacts: HodlingsArtifacts;

const PragmaticHodlings = artifacts.require('./PragmaticHodlings.sol');

async function deploy(deployer: Deployer) {
  await deployer.deploy(PragmaticHodlings);
}

function migrate(deployer: Deployer) {
  deployer.then(() => deploy(deployer));
}

export = migrate;
