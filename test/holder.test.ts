import { assert } from 'chai';

import * as Web3 from 'web3';
import { AnyNumber } from 'web3';

import {
  HodlerAddedEvent,
  HodlerRemovedEvent,
  HodlingsArtifacts,
  PragmaticHodlings,
  PragmaticHodlingsTimeMocked,
  TestToken,
  TokenSettledEvent
} from 'hodlings';

import { BigNumber } from 'bignumber.js';
import { ContractContextDefinition } from 'truffle';
import { assertNumberEqual, assertReverts, findLastLog } from './helpers';

declare const web3: Web3;
declare const artifacts: HodlingsArtifacts;
declare const contract: ContractContextDefinition;

const PragmaticHodlingsContract = artifacts.require('./PragmaticHodlings.sol');
const PragmaticHodlingsTimeMockedContract = artifacts.require(
  './PragmaticHodlingsTimeMocked.sol'
);
const TestTokenContract = artifacts.require('./TestToken.sol');

contract('PragmaticHodlings', accounts => {
  const owner = accounts[9];
  const nonOwner = accounts[8];

  describe('#ctor', () => {
    let hodlings: PragmaticHodlings;

    beforeEach(async () => {
      hodlings = await PragmaticHodlingsContract.new({ from: owner });
    });

    it('should create', async () => {
      assert.isOk(hodlings);
    });

    it('should create without hodlers', async () => {
      assertNumberEqual((await hodlings.getHodlers())[0].length, 0);
    });
  });

  context('deployed', () => {
    let hodlings: PragmaticHodlings;

    beforeEach(async () => {
      hodlings = await PragmaticHodlingsContract.new({ from: owner });
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
        assertNumberEqual(currentHodlers[0].joined, hodlerTimestamp);
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
        assertNumberEqual(event.joined, new BigNumber(hodlerTimestamp));
      });

      it('Should add few hodlers', async () => {
        const hodlers: Hodler[] = accounts.map((address, idx): Hodler => ({
          address,
          joined: new BigNumber(idx).add(1)
        }));

        await hodlers.forEach(async hodler => {
          await hodlings.addHodler(hodler.address, hodler.joined, {
            from: owner
          });
        });

        const addedHodlers: Hodler[] = parseHodlers(
          await hodlings.getHodlers()
        );

        assertNumberEqual(addedHodlers.length, hodlers.length);

        hodlers.forEach(hodler => {
          const added = addedHodlers.find(
            item => item.address === hodler.address
          );

          assert.isOk(added);
          assertNumberEqual(added!.joined, hodler.joined);
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

      it('Should revert if join timestamp is future', async () => {
        const hodler = accounts[1];
        const hodlerTimestamp = Math.floor(Date.now() / 1000) + 1000;

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
        const hodlerToFire = accounts[2];
        assert.isTrue(await hodlings.isHodler(hodlerToFire));

        await hodlings.removeHodler(hodlerToFire, { from: owner });

        assert.isFalse(await hodlings.isHodler(hodlerToFire));

        const currentHodlers: Hodler[] = parseHodlers(
          await hodlings.getHodlers()
        );
        assert.equal(currentHodlers.length, accounts.length - 1);
        assert.isNotOk(
          currentHodlers.find(hodler => hodler.address === hodlerToFire)
        );
      });

      it('Should emit HodlerRemoved event', async () => {
        const hodlerToFire = accounts[2];
        assert.isTrue(await hodlings.isHodler(hodlerToFire));

        const removeTx = await hodlings.removeHodler(hodlerToFire, {
          from: owner
        });

        const log = findLastLog(removeTx, 'HodlerRemoved');
        assert.isOk(log);
        const event = log.args as HodlerRemovedEvent;
        assert.isOk(event);
        assert.equal(event.account, hodlerToFire);
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

  context('deployed mocked time', () => {
    const mockedContractTime = 1521808225; // some date
    let hodlings: PragmaticHodlingsTimeMocked;

    beforeEach(async () => {
      hodlings = await PragmaticHodlingsTimeMockedContract.new(
        { from: owner }
      );
      await hodlings.setNow(mockedContractTime);
    });

    describe('#settleToken', () => {
      const tokenTotalSupply = new BigNumber(1000000000);
      let token: TestToken;

      beforeEach(async () => {
        token = await TestTokenContract.new(
          'PC Token',
          'PC',
          tokenTotalSupply,
          { from: owner }
        );
        await token.mint(owner, tokenTotalSupply, { from: owner });
        assertNumberEqual(await token.balanceOf(owner), tokenTotalSupply);
      });

      context('after token transfer', () => {
        const transferAmount = new BigNumber(1000);

        beforeEach(async () => {
          await setupAmountToSettle(transferAmount);
        });

        context('after hodler register', async () => {
          beforeEach(async () => {
            await hodlings.addHodler(accounts[1], new BigNumber(100), {
              from: owner
            });
          });

          it('should emit TokenSettled event', async () => {
            const tx = await hodlings.settleToken(
              token.address,
              { from: owner }
            );

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
          new TestHodler(100, 50)
        ];

        await testSettlement(hodlers);
      });

      it('should transfer simple calculated proportions', async () => {
        const transferAmount = new BigNumber(8640);
        await setupAmountToSettle(transferAmount);

        const hodlers: TestHodler[] = [
          new TestHodler(10000000, 4320),
          new TestHodler(8000000, 3456),
          new TestHodler(2000000, 864)
        ];

        await testSettlement(hodlers);
      });

      it('should transfer simple calculated proportions with new hodler', async () => {
        const transferAmount = new BigNumber(864);
        await setupAmountToSettle(transferAmount);

        const hodlers: TestHodler[] = [
          new TestHodler(11000000, 396),
          new TestHodler(9000000, 324),
          new TestHodler(3000000, 108),
          new TestHodler(1000000, 36)
        ];

        await testSettlement(hodlers);
      });

      it('should transfer simple calculated proportions after delete hodler', async () => {
        const transferAmount = new BigNumber(864);
        await setupAmountToSettle(transferAmount);

        const hodlers: TestHodler[] = [
          new TestHodler(1000, 480),
          new TestHodler(800, 384)
        ];

        await testSettlement(hodlers);
      });

      it('should transfer rest of tokens to first hodler', async () => {
        const transferAmount = new BigNumber(1000);
        await setupAmountToSettle(transferAmount);

        const hodlers: TestHodler[] = [
          new TestHodler(1000, 166 + 4),
          new TestHodler(1000, 166),
          new TestHodler(1000, 166),
          new TestHodler(1000, 166),
          new TestHodler(1000, 166),
          new TestHodler(1000, 166)
        ];

        await testSettlement(hodlers);
      });

      it('should revert if contract has no tokens', async () => {
        await hodlings.addHodler(accounts[1], 100, { from: owner });

        await assertReverts(async () => {
          await hodlings.settleToken(token.address, { from: owner });
        });
      });

      async function setupAmountToSettle(amount: BigNumber) {
        await token.transfer(hodlings.address, amount, { from: owner });
        assertNumberEqual(await token.balanceOf(hodlings.address), amount);
      }

      async function testSettlement(hodlers: TestHodler[]) {
        if (hodlers.length > accounts.length) {
          throw new Error('Too many hodlers.');
        }

        for (const [idx, hodler] of hodlers.entries()) {
          await hodlings.addHodler(
            accounts[idx],
            mockedContractTime - hodler.workedSeconds,
            { from: owner }
          );
        }

        await hodlings.settleToken(token.address, { from: owner });

        for (const [idx, hodler] of hodlers.entries()) {
          /*
          Probably its going to conflict here.
          With current time-mockable contract this version is correct
          remove this comment after merge
           */
          assertNumberEqual(
            await token.balanceOf(accounts[idx]),
            hodler.expectedAmount
          );
        }

        assertNumberEqual(
          await token.balanceOf(hodlings.address),
          0
        );

      }
    });
  });

});

interface Hodler {
  address: Address;
  joined: AnyNumber;
}

class TestHodler {
  constructor(public workedSeconds: number, public expectedAmount: number) {
  }
}

function parseHodlers(args: [Address[], BigNumber[]]): Hodler[] {
  const addresses: Address[] = args[0];
  const timestamps: BigNumber[] = args[1];
  const result: Hodler[] = new Array<Hodler>(addresses.length);
  for (let i = 0; i < addresses.length; i++) {
    result[i] = {
      address: addresses[i],
      joined: timestamps[i]
    };
  }
  return result;
}
