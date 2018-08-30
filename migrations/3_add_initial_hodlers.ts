import {HodlingsArtifacts} from 'hodlings';
import {Deployer} from 'truffle';
import {AnyNumber} from 'web3';

declare const artifacts: HodlingsArtifacts;

const PragmaticHodlings = artifacts.require('./PragmaticHodlings.sol');

const initialHodlers: InitialHodler[] =
    [
        {address: '0x01', joined: 1421712000},
        {address: '0x02', joined: 1421712000},
        {address: '0x03', joined: 1453248000},
        {address: '0x04', joined: 1484870400},
    ];

async function deploy() {
    const hodlings = await PragmaticHodlings.deployed();

    for (const hodler of initialHodlers) {
        // tslint:disable:no-console
        console.log('adding hodler', hodler);
        await hodlings.addHodler(hodler.address, hodler.joined);
    }
}

function migrate(deployer: Deployer) {
    deployer.then(() => deploy());
}

export = migrate;

interface InitialHodler {
    address: Address;
    joined: AnyNumber;
}
