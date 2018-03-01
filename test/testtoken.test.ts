import { assert } from 'chai';

import * as Web3 from 'web3';

import { HoldingsArtifacts, TestToken } from 'holdings';

import BigNumber from 'bignumber.js';
import { ContractContextDefinition } from 'truffle';
import { assertNumberEqual } from './helpers';

declare const web3: Web3;
declare const artifacts: HoldingsArtifacts;
declare const contract: ContractContextDefinition;

const TestTokenContract = artifacts.require('./TestToken.sol');

contract('TestToken', accounts => {
  const owner = accounts[0];
  const name = 'PRC Token';
  const symbol = 'PRC';
  const totalSupply = new BigNumber(1000000000);
  let token: TestToken;

  beforeEach(async () => {
    token = await TestTokenContract.new(name, symbol, totalSupply, {
      from: owner
    });
  });

  describe('#ctor', () => {
    it('should set name', async () => {
      assert.equal(await token.name(), name);
    });

    it('should set symbol', async () => {
      assert.equal(await token.symbol(), symbol);
    });

    it('should set totalSupply', async () => {
      assertNumberEqual(await token.totalSupply(), totalSupply);
    });
  });
});
