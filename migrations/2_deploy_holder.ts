import { HoldingsArtifacts } from 'holdings';
import { Deployer } from 'truffle';

declare const artifacts: HoldingsArtifacts;

const Holder = artifacts.require('./Holder.sol');

async function deploy(deployer: Deployer) {
  await deployer.deploy(Holder);
}

function migrate(deployer: Deployer) {
  deployer.then(() => deploy(deployer));
}

export = migrate;
