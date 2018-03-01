import { assert } from 'chai';

import * as Web3 from 'web3';

import {
  Holder,
  HoldingsArtifacts,
  TestToken,
  TokenSettledEvent
} from 'holdings';

import BigNumber from 'bignumber.js';
import { ContractContextDefinition } from 'truffle';
import { assertNumberEqual, assertReverts, findLastLog } from './helpers';

declare const web3: Web3;
declare const artifacts: HoldingsArtifacts;
declare const contract: ContractContextDefinition;

const HolderContract = artifacts.require('./Holder.sol');
const TestTokenContract = artifacts.require('./TestToken.sol');

contract('Holder', accounts => {
  const owner = accounts[9];
  const nonOwner = accounts[1];
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
    const totalSupply = new BigNumber(1000000000);
    const availableAmount = new BigNumber(1000000);
    const transferAmount = new BigNumber(1000);
    let token: TestToken;

    beforeEach(async () => {
      token = await TestTokenContract.new('PRC Token', 'PCR', totalSupply, {
        from: owner
      });
      await token.mint(owner, availableAmount, { from: owner });
      assertNumberEqual(await token.balanceOf(owner), availableAmount);
    });

    context('after token transfer', () => {
      beforeEach(async () => {
        await token.transfer(holder.address, transferAmount, { from: owner });
        assertNumberEqual(
          await token.balanceOf(holder.address),
          transferAmount
        );
      });

      it('should revert for empty employee list', async () => {
        await assertReverts(async () => {
          await holder.settleToken(token.address, { from: owner });
        });
      });
    });

    context('after token transfer and employees addition', () => {
      beforeEach(async () => {
        await token.transfer(holder.address, transferAmount, { from: owner });
        assertNumberEqual(
          await token.balanceOf(holder.address),
          transferAmount
        );

        await holder.addEmployee(accounts[1], { from: owner });
        await holder.addEmployee(accounts[2], { from: owner });
        await holder.addEmployee(accounts[3], { from: owner });
      });

      it('should emit TokenSettled event', async () => {
        const tx = await holder.settleToken(token.address, { from: owner });

        const log = findLastLog(tx, 'TokenSettled');
        assert.isOk(log);

        const event = log.args as TokenSettledEvent;
        assert.equal(event.token, token.address);
        assertNumberEqual(event.amount, transferAmount);
      });

      it('should transfer token shares to employees', async () => {
        await holder.settleToken(token.address, { from: owner });

        assertNumberEqual(
          await token.balanceOf(accounts[1]),
          transferAmount.div(3).floor()
        );
        assertNumberEqual(
          await token.balanceOf(accounts[2]),
          transferAmount.div(3).floor()
        );
      });

      it('should revert for non-owner', async () => {
        await assertReverts(async () => {
          await holder.settleToken(token.address, { from: nonOwner });
        });
      });
    });

    it('should revert for insufficient token amount', async () => {
      await holder.addEmployee(accounts[1], { from: owner });
      await holder.addEmployee(accounts[2], { from: owner });

      await assertReverts(async () => {
        await holder.settleToken(token.address, { from: owner });
      });
    });
  });
});
