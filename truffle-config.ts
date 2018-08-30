import * as PrivateKeyProvider from 'truffle-privatekey-provider';
import {fromGwei} from './utils';

const gas = 3000000;
const gasPrice = fromGwei(14);
const host = 'localhost';
const port = 8545;

const defaults = {
  gas,
  gasPrice,
  host,
  port
};

export = {
  networks: {
    mainnet: {
      ...defaults,
      network_id: '1',
      provider: new PrivateKeyProvider(
        process.env.PRIVATE_KEY!,
        'https://infura.io/',
      )
    },
    rinkeby: {
      ...defaults,
      from: '0xcba5a25918f46ea73f2640cecb8e0dda6cfec4ef',
      network_id: '4',
    },
    ropsten: {
      ...defaults,
      network_id: '2',
      provider: new PrivateKeyProvider(
        process.env.PRIVATE_KEY!,
        'https://ropsten.infura.io/',
      )
    },
    testrpc: {
      ...defaults,
      from: undefined,
      network_id: '*'
    },
  }
};
