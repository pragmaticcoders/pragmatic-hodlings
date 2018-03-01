declare module 'holdings' {
  import { BigNumber } from 'bignumber.js';
  import {
    AnyContract,
    Contract,
    ContractBase,
    TransactionOptions,
    TransactionResult,
    TruffleArtifacts
  } from 'truffle';
  import { AnyNumber } from 'web3';

  namespace holdings {

    interface Migrations extends ContractBase {
      setCompleted(
        completed: number,
        options?: TransactionOptions
      ): Promise<TransactionResult>;

      upgrade(
        address: Address,
        options?: TransactionOptions
      ): Promise<TransactionResult>;
    }

    interface Ownable extends ContractBase {
      owner(): Promise<Address>;

      transferOwnership(newOwner: Address): Promise<TransactionResult>;
    }

    interface ERC20Basic extends ContractBase {
      totalSupply(): Promise<BigNumber>;

      balanceOf(who: Address): Promise<BigNumber>;

      transfer(
        to: Address,
        amount: BigNumber,
        options?: TransactionOptions
      ): Promise<TransactionResult>;
    }

    interface MintableToken extends ERC20Basic, Ownable {
      mintingFinished(): Promise<boolean>;

      mint(
        to: Address,
        amount: AnyNumber,
        options?: TransactionOptions
      ): Promise<TransactionResult>;

      finishMinting(options?: TransactionOptions): Promise<TransactionResult>;
    }

    interface MintedEvent {
      to: Address;
      amount: BigNumber;
    }

    type MintingFinishedEvent = {};

    interface TestToken extends MintableToken {
      name(): Promise<string>;

      symbol(): Promise<string>;

      totalSupply(): Promise<BigNumber>;
    }

    interface TokenSettledEvent {
      token: Address;
      amount: BigNumber;

      getEmployees(): Promise<[Address[], BigNumber[]]>;
    }

    interface Holder extends ContractBase, Ownable {
      registerEmployee(
        addr: Address,
        joinTimestamp: AnyNumber,
        options?: TransactionOptions
      ): Promise<TransactionResult>;

      fireEmployee(
        addr: Address,
        options?: TransactionOptions
      ): Promise<TransactionResult>;

      settleToken(
        token: Address,
        options?: TransactionOptions
      ): Promise<TransactionResult>;

      isEmployed(addr: Address): Promise<boolean>;

      getEmployees(): Promise<[Address[], BigNumber[]]>;
    }

    interface EmployeeRegisteredEvent {
      addr: Address;
      joinTimestamp: BigNumber;
    }

    interface EmployeeFiredEvent {
      addr: Address;
    }

    interface MigrationsContract extends Contract<Migrations> {
      'new'(options?: TransactionOptions): Promise<Migrations>;
    }

    interface TestTokenContract extends Contract<TestToken> {
      'new'(
        name: string,
        symbol: string,
        totalSupply: AnyNumber,
        options?: TransactionOptions
      ): Promise<TestToken>;
    }

    interface HolderContract extends Contract<Holder> {
      'new'(options?: TransactionOptions): Promise<Holder>;
    }

    interface HoldingsArtifacts extends TruffleArtifacts {
      require(name: string): AnyContract;

      require(name: './Migrations.sol'): MigrationsContract;

      require(name: './TestToken.sol'): TestTokenContract;

      require(name: './Holder.sol'): HolderContract;
    }
  }

  export = holdings;
}
