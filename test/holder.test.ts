import { assert } from 'chai';

import * as Web3 from 'web3';
import { AnyNumber } from 'web3';

import {
  HodlerFiredEvent,
  HodlerRegisteredEvent,
  HodlingsArtifacts,
  PragmaticHodlings,
  TestToken,
  TokenSettledEvent
} from 'hodlings';

import { BigNumber } from 'bignumber.js';
import { ContractContextDefinition } from 'truffle';
import {
  assertNumberAlmostEqual,
  assertNumberEqual,
  assertReverts,
  findLastLog,
  getNetworkTimestamp
} from './helpers';

declare const web3: Web3;
declare const artifacts: HodlingsArtifacts;
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
    const tokenTotalSupply = new BigNumber(1000000000);
    const tokenAvailableAmount = new BigNumber(1000000);
    let token: TestToken;

    beforeEach(async () => {
      token = await TestTokenContract.new('PC Token', 'PC', tokenTotalSupply, {
        from: owner
      });
      await token.mint(owner, tokenAvailableAmount, { from: owner });
      assertNumberEqual(await token.balanceOf(owner), tokenAvailableAmount);
    });

    context('after token transfer', () => {
      const transferAmount = new BigNumber(1000);

      beforeEach(async () => {
        await setupAmountToSettle(transferAmount);
      });

      context('after hodler register', async () => {
        beforeEach(async () => {
          await hodlings.registerHodler(
            accounts[1],
            new BigNumber(100),
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

        it('should revert for non-owner', async () => {
          await assertReverts(async () => {
            await hodlings.settleToken(token.address, { from: nonOwner });
          });
        });
      });

      it('should revert for empty hodler list', async () => {
        await assertReverts(async () => {
          await hodlings.settleToken(token.address, { from: owner });
        });
      });
    });

    it('should transfer the same amount', async () => {
      const transferAmount = new BigNumber(100);
      await setupAmountToSettle(transferAmount);

      const hodlers: TestHodler[] = [
        new TestHodler(100, 50),
        new TestHodler(100, 50),
      ];

      await testSettlement(hodlers);
    });

    it('should transfer simple calculated proportions', async () => {
      const transferAmount = new BigNumber(2000);
      await setupAmountToSettle(transferAmount);

      const hodlers: TestHodler[] = [
        new TestHodler(1000, 1000),
        new TestHodler(800, 800),
        new TestHodler(200, 200)
      ];

      await testSettlement(hodlers);
    });

    it(
      'should transfer simple calculated proportions with new hodler',
      async () => {
        const transferAmount = new BigNumber(2000);
        await setupAmountToSettle(transferAmount);

        const hodlers: TestHodler[] = [
          new TestHodler(1100, 916),
          new TestHodler(900, 750),
          new TestHodler(300, 250),
          new TestHodler(100, 83),
        ];

        await testSettlement(hodlers);
      });

    it(
      'should transfer simple calculated proportions after delete hodler',
      async () => {
        const transferAmount = new BigNumber(2000);
        await setupAmountToSettle(transferAmount);

        const hodlers: TestHodler[] = [
          new TestHodler(1000, 1111),
          new TestHodler(800, 888),
        ];

        await testSettlement(hodlers);
      });

    it('should revert if contract has no tokens', async () => {
      await hodlings.registerHodler(accounts[1], 100, { from: owner });

      await assertReverts(async () => {
        await hodlings.settleToken(token.address, { from: owner });
      });
    });

    async function setupAmountToSettle(amount: BigNumber) {
      await token.transfer(
        hodlings.address,
        amount,
        { from: owner }
      );
      assertNumberEqual(
        await token.balanceOf(hodlings.address),
        amount
      );
    }

    async function testSettlement(hodlers: TestHodler[]) {
      if (hodlers.length > accounts.length) {
        throw new Error('Too many hodlers.');
      }

      const currentTimestamp = await getNetworkTimestamp();

      for (const [idx, hodler] of hodlers.entries()) {
        await hodlings.registerHodler(
          accounts[idx],
          currentTimestamp - hodler.workedSeconds,
          { from: owner }
        );
      }

      await hodlings.settleToken(token.address, { from: owner });

      for (const [idx, hodler] of hodlers.entries()) {
        assertNumberAlmostEqual(
          await token.balanceOf(accounts[idx]),
          hodler.expectedAmount,
          1
        );
      }
    }
  });

  describe('#registerHodler', () => {
    it('Should add one hodler', async () => {
      const hodler = accounts[1];
      const hodlerTimestamp = 100;
      await hodlings.registerHodler(
        hodler,
        hodlerTimestamp,
        { from: owner }
      );

      const currentHodlers: Hodler[] =
        parseHodlers(await hodlings.getHodlers());
      assertNumberEqual(currentHodlers.length, 1);
      assert.equal(currentHodlers[0].address, hodler);
      assertNumberEqual(currentHodlers[0].joinTimestamp, hodlerTimestamp);
    });

    it('Should emit HodlerRegistered event', async () => {
      const hodler = accounts[1];
      const hodlerTimestamp = 100;
      const registerTx =
        await hodlings.registerHodler(
          hodler,
          hodlerTimestamp,
          { from: owner }
        );

      const log = findLastLog(registerTx, 'HodlerRegistered');
      assert.isOk(log);
      const event = log.args as HodlerRegisteredEvent;
      assert.isOk(event);
      assert.equal(event.account, hodler);
      assertNumberEqual(event.joinTimestamp, new BigNumber(hodlerTimestamp));
    });

    it('Should add few hodlers', async () => {
      const hodlers: Hodler[] =
        accounts.map(
          (address, idx): Hodler => ({
            address,
            joinTimestamp: new BigNumber(idx).add(1)
          }));

      await hodlers.forEach(async (hodler) => {
        await hodlings.registerHodler(
          hodler.address,
          hodler.joinTimestamp,
          { from: owner }
        );
      });

      const registeredHodlers: Hodler[] = parseHodlers(
        await hodlings.getHodlers()
      );

      assertNumberEqual(registeredHodlers.length, hodlers.length);

      hodlers.forEach((hodler) => {
        const registered =
          registeredHodlers.find((item) => item.address === hodler.address);

        assert.isOk(registered);
        assertNumberEqual(registered!.joinTimestamp, hodler.joinTimestamp);
      });
    });

    it('Should revert if not owner', async () => {
      await assertReverts(async () => {
        await hodlings.registerHodler(
          accounts[1],
          100,
          { from: nonOwner }
        );
      });
    });

    it('Should revert if already exists', async () => {
      const hodler = accounts[1];
      const hodlerTimestamp = 100;
      await hodlings.registerHodler(
        hodler,
        hodlerTimestamp,
        { from: owner }
      );

      await assertReverts(async () => {
        await hodlings.registerHodler(
          hodler,
          hodlerTimestamp,
          { from: owner }
        );
      });
    });
  });

  describe('#removeHodler', () => {
    beforeEach(async () => {
      await accounts.forEach(async (account, idx) => {
        await hodlings.registerHodler(
          account,
          new BigNumber(idx).add(1),
          { from: owner }
        );
      });

      assertNumberEqual(
        (await hodlings.getHodlers())[0].length,
        accounts.length,
      );
    });

    it('Should remove hodler', async () => {
      const hodlerToFire = accounts[2];
      assert.isTrue(await hodlings.isHodler(hodlerToFire));

      await hodlings.fireHodler(hodlerToFire, { from: owner });

      assert.isFalse(await hodlings.isHodler(hodlerToFire));

      const currentHodlers: Hodler[] =
        parseHodlers(await hodlings.getHodlers());
      assert.equal(currentHodlers.length, accounts.length - 1);
      assert.isNotOk(
        currentHodlers.find(hodler => hodler.address === hodlerToFire)
      );
    });

    it('Should emit HodlerFired event', async () => {
      const hodlerToFire = accounts[2];
      assert.isTrue(await hodlings.isHodler(hodlerToFire));

      const fireTx =
        await hodlings.fireHodler(hodlerToFire, { from: owner });

      const log = findLastLog(fireTx, 'HodlerFired');
      assert.isOk(log);
      const event = log.args as HodlerFiredEvent;
      assert.isOk(event);
      assert.equal(event.account, hodlerToFire);
    });

    it('Should revert if not owner', async () => {
      await assertReverts(async () => {
        await hodlings.fireHodler(accounts[2], { from: nonOwner });
      });
    });

    it('Should revert if is not holder', async () => {
      const hodlerToFire = accounts[2];
      await hodlings.fireHodler(hodlerToFire, { from: owner });
      assert.isFalse(await hodlings.isHodler(hodlerToFire));

      await assertReverts(async () => {
        await hodlings.fireHodler(hodlerToFire, { from: owner });
      });
    });
  });
});

interface Hodler {
  address: Address;
  joinTimestamp: AnyNumber;
}

class TestHodler {
  constructor(
    public workedSeconds: number,
    public expectedAmount: number
  ) {

  }
}

function parseHodlers(args: [Address[], BigNumber[]]): Hodler[] {
  const addresses: Address[] = args[0];
  const timestamps: BigNumber[] = args[1];
  const result: Hodler[] = new Array<Hodler>(addresses.length);
  for (let i = 0; i < addresses.length; i++) {
    result[i] = {
      address: addresses[i],
      joinTimestamp: timestamps[i],
    };
  }
  return result;
}
