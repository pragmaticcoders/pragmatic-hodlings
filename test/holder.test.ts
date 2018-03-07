import { assert } from 'chai';

import * as Web3 from 'web3';

import {
  HodlerAddedEvent,
  HodlerRemovedEvent,
  HoldingsArtifacts,
  PragmaticHodlings,
  TestToken,
  TokenSettledEvent
} from 'hodlings';

import { BigNumber } from 'bignumber.js';
import { ContractContextDefinition } from 'truffle';
import {
  assertNumberEqual,
  assertReverts,
  findLastLog,
  getUnixNow
} from './helpers';

declare const web3: Web3;
declare const artifacts: HoldingsArtifacts;
declare const contract: ContractContextDefinition;

const PragmaticHodlingsContract = artifacts.require('./PragmaticHodlings.sol');
const TestTokenContract = artifacts.require('./TestToken.sol');

contract('PragmaticHodlings', accounts => {
  const owner = accounts[9];
  const nonOwner = accounts[8];
  let hodlings: PragmaticHodlings;

  beforeEach(async () => {
    hodlings = await PragmaticHodlingsContract.new({ from: owner });
  });

  describe('#ctor', () => {
    it('should create', async () => {
      assert.isOk(hodlings);
    });

    it('should create without hodlers', async () => {
      assertNumberEqual((await hodlings.getHodlers())[0].length, 0);
    });
  });

  describe('#settleToken', () => {
    const totalSupply = new BigNumber(1000000000);
    const availableAmount = new BigNumber(1000000);
    const transferAmount = new BigNumber(1000);
    let token: TestToken;

    beforeEach(async () => {
      token = await TestTokenContract.new('PC Token', 'PC', totalSupply, {
        from: owner
      });
      await token.mint(owner, availableAmount, { from: owner });
      assertNumberEqual(await token.balanceOf(owner), availableAmount);
    });

    context('after token transfer', () => {
      beforeEach(async () => {
        await token.transfer(hodlings.address, transferAmount, { from: owner });
        assertNumberEqual(
          await token.balanceOf(hodlings.address),
          transferAmount
        );
      });

      it('should revert for empty hodler list', async () => {
        await assertReverts(async () => {
          await hodlings.settleToken(token.address, { from: owner });
        });
      });
    });

    context('after token transfer and hodlers addition', () => {
      const hourInSeconds = new BigNumber(3600);
      const dayInSeconds = new BigNumber(24).mul(hourInSeconds);
      const joinTimeStamp = getUnixNow().sub(dayInSeconds.mul(2));

      beforeEach(async () => {
        await token.transfer(hodlings.address, transferAmount, { from: owner });
        assertNumberEqual(
          await token.balanceOf(hodlings.address),
          transferAmount
        );

        await hodlings.addHodler(
          accounts[1],
          joinTimeStamp.sub(hourInSeconds.mul(3)),
          { from: owner }
        );
        await hodlings.addHodler(
          accounts[2],
          joinTimeStamp.sub(hourInSeconds.mul(2)),
          {
            from: owner
          }
        );
        await hodlings.addHodler(
          accounts[3],
          joinTimeStamp.sub(hourInSeconds.mul(1)),
          { from: owner }
        );
      });

      it('should emit TokenSettled event', async () => {
        const tx = await hodlings.settleToken(token.address, { from: owner });

        const log = findLastLog(tx, 'TokenSettled');
        assert.isOk(log);

        const event = log.args as TokenSettledEvent;
        assert.equal(event.token, token.address);
        assertNumberEqual(event.amount, transferAmount);
      });

      it('should transfer equal token shares to hodlers', async () => {
        await hodlings.settleToken(token.address, { from: owner });

        assertNumberEqual(
          await token.balanceOf(accounts[1]),
          transferAmount.div(3).floor()
        );
        assertNumberEqual(
          await token.balanceOf(accounts[2]),
          transferAmount.div(3).floor()
        );
        assertNumberEqual(
          await token.balanceOf(accounts[3]),
          transferAmount.div(3).floor()
        );
      });

      it('should transfer token shares depending on seniority', async () => {
        await hodlings.addHodler(accounts[4], joinTimeStamp.add(dayInSeconds), {
          from: owner
        });
        await hodlings.addHodler(
          accounts[5],
          joinTimeStamp.add(dayInSeconds.mul(2)),
          { from: owner }
        );

        await hodlings.settleToken(token.address, { from: owner });

        assertNumberEqual(
          await token.balanceOf(accounts[1]),
          transferAmount
            .mul(3)
            .div(12)
            .floor()
        );
        assertNumberEqual(
          await token.balanceOf(accounts[2]),
          transferAmount
            .mul(3)
            .div(12)
            .floor()
        );

        assertNumberEqual(
          await token.balanceOf(accounts[3]),
          transferAmount
            .mul(3)
            .div(12)
            .floor()
        );

        assertNumberEqual(
          await token.balanceOf(accounts[4]),
          transferAmount
            .mul(2)
            .div(12)
            .floor()
        );

        assertNumberEqual(
          await token.balanceOf(accounts[5]),
          transferAmount
            .mul(1)
            .div(12)
            .floor()
        );
      });

      it('should revert for non-owner', async () => {
        await assertReverts(async () => {
          await hodlings.settleToken(token.address, { from: nonOwner });
        });
      });
    });

    it('should revert for insufficient token amount', async () => {
      await hodlings.addHodler(accounts[1], 100, { from: owner });
      await hodlings.addHodler(accounts[2], 100, { from: owner });

      await assertReverts(async () => {
        await hodlings.settleToken(token.address, { from: owner });
      });
    });
  });

  describe('#addHodler', () => {
    it('Should add one hodler', async () => {
      const hodler = accounts[1];
      const hodlerTimestamp = 100;
      await hodlings.addHodler(hodler, hodlerTimestamp, { from: owner });

      const currentHodlers: Hodler[] = parseHodlers(
        await hodlings.getHodlers()
      );
      assertNumberEqual(currentHodlers.length, 1);
      assert.equal(currentHodlers[0].address, hodler);
      assertNumberEqual(currentHodlers[0].joinTimestamp, hodlerTimestamp);
    });

    it('Should emit HodlerAdded event', async () => {
      const hodler = accounts[1];
      const hodlerTimestamp = 100;
      const addTx = await hodlings.addHodler(hodler, hodlerTimestamp, {
        from: owner
      });

      const log = findLastLog(addTx, 'HodlerAdded');
      assert.isOk(log);
      const event = log.args as HodlerAddedEvent;
      assert.isOk(event);
      assert.equal(event.account, hodler);
      assertNumberEqual(event.joinTimestamp, new BigNumber(hodlerTimestamp));
    });

    it('Should add few hodlers', async () => {
      const hodlers: Hodler[] = accounts.map((address, idx): Hodler => ({
        address,
        joinTimestamp: new BigNumber(idx).add(1)
      }));

      await hodlers.forEach(async hodler => {
        await hodlings.addHodler(hodler.address, hodler.joinTimestamp, {
          from: owner
        });
      });

      const addedHodlers: Hodler[] = parseHodlers(await hodlings.getHodlers());

      assertNumberEqual(addedHodlers.length, hodlers.length);

      hodlers.forEach(hodler => {
        const added = addedHodlers.find(
          item => item.address === hodler.address
        );

        assert.isOk(added);
        assertNumberEqual(added!.joinTimestamp, hodler.joinTimestamp);
      });
    });

    it('Should revert if not owner', async () => {
      await assertReverts(async () => {
        await hodlings.addHodler(accounts[1], 100, { from: nonOwner });
      });
    });

    it('Should revert if already exists', async () => {
      const hodler = accounts[1];
      const hodlerTimestamp = 100;
      await hodlings.addHodler(hodler, hodlerTimestamp, { from: owner });

      await assertReverts(async () => {
        await hodlings.addHodler(hodler, hodlerTimestamp, { from: owner });
      });
    });
  });

  describe('#removeHodler', () => {
    beforeEach(async () => {
      await accounts.forEach(async (account, idx) => {
        await hodlings.addHodler(account, new BigNumber(idx).add(1), {
          from: owner
        });
      });

      assertNumberEqual(
        (await hodlings.getHodlers())[0].length,
        accounts.length
      );
    });

    it('Should remove hodler', async () => {
      const hodlerToRemove = accounts[2];
      assert.isTrue(await hodlings.isHodler(hodlerToRemove));

      await hodlings.removeHodler(hodlerToRemove, { from: owner });

      assert.isFalse(await hodlings.isHodler(hodlerToRemove));

      const currentHodlers: Hodler[] = parseHodlers(
        await hodlings.getHodlers()
      );
      assert.equal(currentHodlers.length, accounts.length - 1);
      assert.isNotOk(
        currentHodlers.find(hodler => hodler.address === hodlerToRemove)
      );
    });

    it('Should emit HodlerRemoved event', async () => {
      const hodlerToRemove = accounts[2];
      assert.isTrue(await hodlings.isHodler(hodlerToRemove));

      const removeTx = await hodlings.removeHodler(hodlerToRemove, {
        from: owner
      });

      const log = findLastLog(removeTx, 'HodlerRemoved');
      assert.isOk(log);
      const event = log.args as HodlerRemovedEvent;
      assert.isOk(event);
      assert.equal(event.account, hodlerToRemove);
    });

    it('Should revert if not owner', async () => {
      await assertReverts(async () => {
        await hodlings.removeHodler(accounts[2], { from: nonOwner });
      });
    });

    it('Should revert if is not holder', async () => {
      const hodlerToFire = accounts[2];
      await hodlings.removeHodler(hodlerToFire, { from: owner });
      assert.isFalse(await hodlings.isHodler(hodlerToFire));

      await assertReverts(async () => {
        await hodlings.removeHodler(hodlerToFire, { from: owner });
      });
    });
  });
});

interface Hodler {
  address: Address;
  joinTimestamp: BigNumber;
}

function parseHodlers(args: [Address[], BigNumber[]]): Hodler[] {
  const addresses: Address[] = args[0];
  const timestamps: BigNumber[] = args[1];
  const result: Hodler[] = new Array<Hodler>(addresses.length);
  for (let i = 0; i < addresses.length; i++) {
    result[i] = {
      address: addresses[i],
      joinTimestamp: timestamps[i]
    };
  }
  return result;
}
