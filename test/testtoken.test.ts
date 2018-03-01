import { assert } from 'chai';

import * as Web3 from 'web3';

import { HoldingsArtifacts, TestToken } from 'holdings';

import { ContractContextDefinition } from 'truffle';

declare const web3: Web3;
declare const artifacts: HoldingsArtifacts;
declare const contract: ContractContextDefinition;

const TestTokenContract = artifacts.require('./TestToken.sol');

contract('TestToken', accounts => {
  const owner = accounts[0];
  const name = 'PRC Token';
  const symbol = 'PRC';
  let token: TestToken;

  beforeEach(async () => {
    token = await TestTokenContract.new(name, symbol, { from: owner });
  });

  describe('#ctor', () => {
    it('should set name', async () => {
      assert.equal(await token.name(), name);
    });

    it('should set symbol', async () => {
      assert.equal(await token.symbol(), symbol);
    });
  });
});
