import { fromGwei } from './utils';

const from = '0xcba5a25918f46ea73f2640cecb8e0dda6cfec4ef';
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
      network_id: '*'
    }
  }
};
