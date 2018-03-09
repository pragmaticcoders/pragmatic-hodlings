declare type Callback<T> = (err: Error | null, value: T) => void;

declare type Address = string;

declare module 'web3' {
  import { BigNumber } from 'bignumber.js';
  import { AbstractBlock } from 'web3';

  class Web3 {
    public eth: {
      accounts: Address[];
      defaultAccount: Address;

      getBlockNumber(callback: Callback<number>): void;
      sendTransaction(txData: Web3.TxData, callback: Callback<string>): void;
      getBalance(account: Address, callback: Callback<BigNumber>): void;
      sign(account: Address, text: string): string;
      getBlock(id: number | string, callback: Callback<AbstractBlock>): void;
    };

    public version: {
      getNetwork(cb: Callback<string>): void;
    };

    public constructor(provider?: Web3.Provider);

    public sha3(str: string, options?: { encoding: 'hex' }): string;

    public toDecimal(hex: string): number;

    public toHex(num: number): string;
  }

  namespace Web3 {
    type AnyNumber = number | string | BigNumber;

    interface RequestPayload {
      params: any[];
      method: string;
      id: number;
      jsonrpc: string;
    }

    interface ResponsePayload {
      result: any;
      id: number;
      jsonrpc: string;
    }

    interface Provider {
      sendAsync(
        payload: RequestPayload,
        callback: (err: Error | null, result: ResponsePayload) => void
      ): void;
    }

    interface AbstractBlock {
      number: number | null;
      hash: string | null;
      parentHash: string;
      nonce: string | null;
      sha3Uncles: string;
      logsBloom: string | null;
      transactionsRoot: string;
      stateRoot: string;
      miner: string;
      difficulty: BigNumber;
      totalDifficulty: BigNumber;
      extraData: string;
      size: number;
      gasLimit: number;
      gasUsed: number;
      timestamp: number;
      uncles: string[];
    }

    interface Transaction {
      hash: string;
      nonce: number;
      blockHash: string | null;
      blockNumber: number | null;
      transactionIndex: number | null;
      from: string;
      to: string | null;
      value: BigNumber;
      gasPrice: BigNumber;
      gas: number;
      input: string;
    }

    interface TxData {
      from?: Address;
      to: Address;
      value?: AnyNumber;
      gas?: AnyNumber;
      gasPrice?: AnyNumber;
      data?: string;
      nonce?: AnyNumber;
    }
  }

  export = Web3;
}
