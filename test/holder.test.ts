import {assert} from 'chai';

import * as Web3 from 'web3';

import {Holder, HoldingsArtifacts,} from 'holdings';

import {ContractContextDefinition} from 'truffle';

declare const web3: Web3;
declare const artifacts: HoldingsArtifacts;
declare const contract: ContractContextDefinition;

const HolderContract = artifacts.require('./Holder.sol');

contract('Holder', accounts => {
  const owner = accounts[9];
  let myContract: Holder;

  describe('#ctor', () => {
    it('should set exampleAttribute', async () => {
      myContract = await HolderContract.new({from: owner});
      assert.isOk(contract);
    });
  });

});
