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
    
    interface Holder extends ContractBase {
      exampleAttribute(): Promise<BigNumber>;

      exampleFunction(
        newValue: AnyNumber,
        options?: TransactionOptions
      ): Promise<TransactionResult>;
    }
    
    
    interface ExampleAttributeChangedEvent {
      newValue: BigNumber;
    }

    interface MigrationsContract extends Contract<Migrations> {
      'new'(options?: TransactionOptions): Promise<Migrations>;
    }
    
    interface HolderContract extends Contract<Holder> {
      'new'(options?: TransactionOptions): Promise<Holder>;
    }
    
    interface HoldingsArtifacts extends TruffleArtifacts {
      require(name: string): AnyContract;
      require(name: './Migrations.sol'): MigrationsContract;
      require(name: './Holder.sol'): HolderContract;
    }
  }

  export = holdings;
}
