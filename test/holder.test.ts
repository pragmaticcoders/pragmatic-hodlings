import { assert } from 'chai';

import * as Web3 from 'web3';

import {
  EmployeeFiredEvent,
  EmployeeRegisteredEvent,
  Holder,
  HoldingsArtifacts,
  TestToken,
  TokenSettledEvent
} from 'holdings';

import { BigNumber } from 'bignumber.js';
import { ContractContextDefinition } from 'truffle';
import { assertNumberEqual, assertReverts, findLastLog } from './helpers';

declare const web3: Web3;
declare const artifacts: HoldingsArtifacts;
declare const contract: ContractContextDefinition;

const HolderContract = artifacts.require('./Holder.sol');
const TestTokenContract = artifacts.require('./TestToken.sol');

contract('Holder', accounts => {
  const owner = accounts[9];
  const nonOwner = accounts[8];
  let holder: Holder;

  beforeEach(async () => {
    holder = await HolderContract.new({ from: owner });
  });

  describe('#ctor', () => {
    it('should create', async () => {
      assert.isOk(holder);
    });

    it('should create without employees', async () => {
      assertNumberEqual((await holder.getEmployees())[0].length, 0);
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

        await holder.registerEmployee(accounts[1], 100, { from: owner });
        await holder.registerEmployee(accounts[2], 100, { from: owner });
        await holder.registerEmployee(accounts[3], 100, { from: owner });
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
        assertNumberEqual(
          await token.balanceOf(accounts[3]),
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
      await holder.registerEmployee(accounts[1], 100, { from: owner });
      await holder.registerEmployee(accounts[2], 100, { from: owner });

      await assertReverts(async () => {
        await holder.settleToken(token.address, { from: owner });
      });
    });
  });

  describe('#registerEmployee', () => {
    it('Should add one employee', async () => {
      const employee = accounts[1];
      const employeeTimestamp = 100;
      await holder.registerEmployee(employee, employeeTimestamp, { from: owner });

      const currentEmployees: Employee[] =
        parseEmployees(await holder.getEmployees());
      assertNumberEqual(currentEmployees.length, 1);
      assert.equal(currentEmployees[0].address, employee);
      assertNumberEqual(currentEmployees[0].joinTimestamp, employeeTimestamp);
    });

    it('Should emit EmployeeRegistered event', async () => {
      const employee = accounts[1];
      const employeeTimestamp = 100;
      const registerTx =
        await holder.registerEmployee(
          employee,
          employeeTimestamp,
          { from: owner }
        );

      const log = findLastLog(registerTx, 'EmployeeRegistered');
      assert.isOk(log);
      const event = log.args as EmployeeRegisteredEvent;
      assert.isOk(event);
      assert.equal(event.account, employee);
      assertNumberEqual(event.joinTimestamp, new BigNumber(employeeTimestamp));
    });

    it('Should add few employees', async () => {
      const employees: Employee[] =
        accounts.map(
          (address, idx): Employee => ({
            address,
            joinTimestamp: new BigNumber(idx).add(1)
          }));

      await employees.forEach(async (employee) => {
        await holder.registerEmployee(
          employee.address,
          employee.joinTimestamp,
          { from: owner }
        );
      });

      const registeredEmployees: Employee[] =
        parseEmployees(await holder.getEmployees());

      assertNumberEqual(registeredEmployees.length, employees.length);

      employees.forEach((employee) => {
        const registered =
          registeredEmployees.find((item) => item.address === employee.address);

        assert.isOk(registered);
        assertNumberEqual(registered!.joinTimestamp, employee.joinTimestamp);
      });
    });

    it('Should revert if not owner', async () => {
      await assertReverts(async () => {
        await holder.registerEmployee(
          accounts[1],
          100,
          { from: nonOwner }
        );
      });
    });

    it('Should revert if already exists', async () => {
      const employee = accounts[1];
      const employeeTimestamp = 100;
      await holder.registerEmployee(employee, employeeTimestamp, { from: owner });

      await assertReverts(async () => {
        await holder.registerEmployee(
          employee,
          employeeTimestamp,
          { from: owner }
        );
      });
    });
  });

  describe('#fireEmployee', () => {

    beforeEach(async () => {
      await accounts.forEach(async (account, idx) => {
        await holder.registerEmployee(
          account,
          new BigNumber(idx).add(1),
          { from: owner }
        );
      });

      assertNumberEqual(
        (await holder.getEmployees())[0].length,
        accounts.length,
      );
    });

    it('Should remove employee', async () => {
      const employeeToFire = accounts[2];
      assert.isTrue(await holder.isEmployed(employeeToFire));

      await holder.fireEmployee(employeeToFire, { from: owner });

      assert.isFalse(await holder.isEmployed(employeeToFire));

      const currentEmployees: Employee[] =
        parseEmployees(await holder.getEmployees());
      assert.equal(currentEmployees.length, accounts.length - 1);
      assert.isNotOk(
        currentEmployees.find(employee => employee.address === employeeToFire)
      );
    });

    it('Should emit EmployeeFired event', async () => {
      const employeeToFire = accounts[2];
      assert.isTrue(await holder.isEmployed(employeeToFire));

      const fireTx = await holder.fireEmployee(employeeToFire, { from: owner });

      const log = findLastLog(fireTx, 'EmployeeFired');
      assert.isOk(log);
      const event = log.args as EmployeeFiredEvent;
      assert.isOk(event);
      assert.equal(event.account, employeeToFire);
    });

    it('Should revert if not owner', async () => {
      await assertReverts(async () => {
        await holder.fireEmployee(accounts[2], { from: nonOwner });
      });
    });

    it('Should revert if is not employed', async () => {
      const employeeToFire = accounts[2];
      await holder.fireEmployee(employeeToFire, { from: owner });
      assert.isFalse(await holder.isEmployed(employeeToFire));

      await assertReverts(async () => {
        await holder.fireEmployee(employeeToFire, { from: owner });
      });
    });
  });
});

interface Employee {
  address: Address;
  joinTimestamp: BigNumber;
}

function parseEmployees(args: [Address[], BigNumber[]]): Employee[] {
  const addresses: Address[] = args[0];
  const timestamps: BigNumber[] = args[1];
  const result: Employee[] = new Array<Employee>(addresses.length);
  for (let i = 0; i < addresses.length; i++) {
    result[i] = {
      address: addresses[i],
      joinTimestamp: timestamps[i],
    };
  }
  return result;
}
