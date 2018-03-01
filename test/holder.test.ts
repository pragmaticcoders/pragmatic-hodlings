import {assert} from 'chai';

import * as Web3 from 'web3';

import {Holder, HoldingsArtifacts, } from 'holdings';

import BigNumber from 'bignumber.js';
import {ContractContextDefinition} from 'truffle';
import {assertNumberEqual, assertReverts} from './helpers';

declare const web3: Web3;
declare const artifacts: HoldingsArtifacts;
declare const contract: ContractContextDefinition;

const HolderContract = artifacts.require('./Holder.sol');

contract('Holder', accounts => {
  const owner = accounts[9];
  const nonOwner = accounts[8];
  let holder: Holder;

  beforeEach(async () => {
    holder = await HolderContract.new({from: owner});
  });

  describe('#ctor', () => {
    it('should create', async () => {
      assert.isOk(contract);
    });

    it('should create without employees', async () => {
      assertNumberEqual((await holder.getEmployees())[0].length, 0);
    });
  });

  describe('#registerEmployee', () => {
    it('Should add one employee', async () => {
      const employee = accounts[1];
      const employeeTimestamp = 100;
      await holder.registerEmployee(employee, employeeTimestamp, {from: owner});

      const currentEmployees: Employee[] =
        parseEmployees(await holder.getEmployees());
      assertNumberEqual(currentEmployees.length, 1);
      assert.equal(currentEmployees[0].address, employee);
      assertNumberEqual(currentEmployees[0].joinTimestamp, employeeTimestamp);
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
          {from: owner}
        );
      });

      const registeredEmployees: Employee[] =
        parseEmployees(await holder.getEmployees());

      assertNumberEqual(registeredEmployees.length, employees.length);
      employees.forEach(employee => {
        const registered =
          registeredEmployees.find((item) => item.address === employee.address);

        assert.isOk(registered);
        if (registered) { // ts2532 posibbly undefined workaround
          assertNumberEqual(registered.joinTimestamp, employee.joinTimestamp);
        }
      });
    });

    it('Should revert if not owner', async () => {
      await assertReverts(async () => {
        await holder.registerEmployee(
          accounts[1],
          100,
          {from: nonOwner}
        );
      });
    });

    it('Should revert if already exists', async () => {
      const employee = accounts[1];
      const employeeTimestamp = 100;
      await holder.registerEmployee(employee, employeeTimestamp, {from: owner});

      await assertReverts(async () => {
        await holder.registerEmployee(
          employee,
          employeeTimestamp,
          {from: owner}
        );
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
