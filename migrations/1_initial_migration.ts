import { HoldingsArtifacts } from 'holdings';
import { Deployer } from 'truffle';

declare const artifacts: HoldingsArtifacts;

const Migrations = artifacts.require('./Migrations.sol');

async function deploy(deployer: Deployer) {
  await deployer.deploy(Migrations);
}

function migrate(deployer: Deployer) {
  deployer.then(() => deploy(deployer));
}

export = migrate;
