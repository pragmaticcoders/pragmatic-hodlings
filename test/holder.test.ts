import { assert } from 'chai';

import * as Web3 from 'web3';

import { Holder, HoldingsArtifacts, TestToken } from 'holdings';

import { ContractContextDefinition } from 'truffle';

declare const web3: Web3;
declare const artifacts: HoldingsArtifacts;
declare const contract: ContractContextDefinition;

const HolderContract = artifacts.require('./Holder.sol');
const TestTokenContract = artifacts.require('./TestToken.sol');

contract('Holder', accounts => {
  const owner = accounts[9];
  let holder: Holder;

  beforeEach(async () => {
    holder = await HolderContract.new({ from: owner });
  });

  describe('#ctor', () => {
    it('should create contract', async () => {
      const holderContract = await HolderContract.new({ from: owner });
      assert.isOk(holderContract);
    });
  });

  describe('#settleToken', () => {
    let token: TestToken;
    beforeEach(async () => {
      token = await TestTokenContract.new('PRC Token', 'PCR', { from: owner });
    });

    it('should create contract', async () => {
      holder = await HolderContract.new({ from: owner });
      assert.isOk(contract);
    });
  });
});
