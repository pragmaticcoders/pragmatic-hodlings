declare module 'hodlings' {
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

  namespace hodlings {
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

    interface PragmaticHodlings extends ContractBase, Ownable {
      addHodler(
        account: Address,
        joinDate: AnyNumber,
        options?: TransactionOptions
      ): Promise<TransactionResult>;

      removeHodler(
        account: Address,
        options?: TransactionOptions
      ): Promise<TransactionResult>;

      settleToken(
        token: Address,
        options?: TransactionOptions
      ): Promise<TransactionResult>;

      getHodlers(): Promise<[Address[], BigNumber[]]>;

      isHodler(account: Address): Promise<boolean>;
    }

    interface HodlerAddedEvent {
      account: Address;
      joinDate: BigNumber;
    }

    interface HodlerRemovedEvent {
      account: Address;
    }

    interface TokenSettledEvent {
      token: Address;
      amount: BigNumber;
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

    interface PragmaticHodlingsContract extends Contract<PragmaticHodlings> {
      'new'(options?: TransactionOptions): Promise<PragmaticHodlings>;
    }

    interface HodlingsArtifacts extends TruffleArtifacts {
      require(name: string): AnyContract;
      require(name: './Migrations.sol'): MigrationsContract;
      require(name: './TestToken.sol'): TestTokenContract;
      require(name: './PragmaticHodlings.sol'): PragmaticHodlingsContract;
    }
  }

  export = hodlings;
}
