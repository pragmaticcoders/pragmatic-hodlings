import { fromGwei } from './utils';

const from = '0x9838e38F8273eE06251D2ef7Ac3d4312dF3C150D';
const gas = 3000000;
const gasPrice = fromGwei(14);
const host = 'localhost';
const port = 8545;

const defaults = {
    from,
    gas,
    gasPrice,
    host,
    port
};

export = {
  networks: {
    rinkeby: {
      ...defaults,
      network_id: '4'
    },
    testrpc: {
      ...defaults,
      from: undefined,
      network_id: '*',
    }
  }
};
