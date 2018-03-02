import { HoldingsArtifacts } from 'hodlings';
import { Deployer } from 'truffle';

declare const artifacts: HoldingsArtifacts;

const PragmaticHodlings = artifacts.require('./PragmaticHodlings.sol');

async function deploy(deployer: Deployer) {
  await deployer.deploy(PragmaticHodlings);
}

function migrate(deployer: Deployer) {
  deployer.then(() => deploy(deployer));
}

export = migrate;
