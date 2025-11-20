import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDLXGDMUHSAU5XBLLWLZUMS4KGU5BSBG3HHMLRXPXNO2CRLVCA3WJBJM",
  },
} as const;

export type DataKey =
  | { tag: "DonationCount"; values: void }
  | { tag: "Donation"; values: readonly [u64] }
  | { tag: "TotalDonated"; values: readonly [string] };

export interface DonationRecord {
  amount: i128;
  asset: string;
  donor: string;
  memo: Option<string>;
  recipient: string;
  timestamp: u64;
}

export interface Client {
  /**
   * Construct and simulate a donate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Make a donation by transferring USDC (or any asset) from donor to recipient
   * This function creates a payment operation that the caller must include in their transaction
   * Returns the donation ID
   */
  donate: (
    {
      donor,
      recipient,
      amount,
      asset,
      memo,
    }: { donor: string; recipient: string; amount: i128; asset: string; memo: Option<string> },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<u64>>;

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the donation contract
   */
  initialize: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a get_donation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get a specific donation by ID
   */
  get_donation: (
    { donation_id }: { donation_id: u64 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Option<DonationRecord>>>;

  /**
   * Construct and simulate a total_donated transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total amount donated to a specific recipient
   */
  total_donated: (
    { recipient }: { recipient: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<i128>>;

  /**
   * Construct and simulate a donation_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get donation count
   */
  donation_count: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u64>>;

  /**
   * Construct and simulate a get_donor_donations transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all donations for a specific donor
   */
  get_donor_donations: (
    { donor, limit }: { donor: string; limit: u32 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Array<DonationRecord>>>;

  /**
   * Construct and simulate a get_recipient_donations transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all donations for a specific recipient
   */
  get_recipient_donations: (
    { recipient, limit }: { recipient: string; limit: u32 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    }
  ) => Promise<AssembledTransaction<Array<DonationRecord>>>;
}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAAAAAL9NYWtlIGEgZG9uYXRpb24gYnkgdHJhbnNmZXJyaW5nIFVTREMgKG9yIGFueSBhc3NldCkgZnJvbSBkb25vciB0byByZWNpcGllbnQKVGhpcyBmdW5jdGlvbiBjcmVhdGVzIGEgcGF5bWVudCBvcGVyYXRpb24gdGhhdCB0aGUgY2FsbGVyIG11c3QgaW5jbHVkZSBpbiB0aGVpciB0cmFuc2FjdGlvbgpSZXR1cm5zIHRoZSBkb25hdGlvbiBJRAAAAAAGZG9uYXRlAAAAAAAFAAAAAAAAAAVkb25vcgAAAAAAABMAAAAAAAAACXJlY2lwaWVudAAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAFYXNzZXQAAAAAAAATAAAAAAAAAARtZW1vAAAD6AAAABAAAAABAAAABg==",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAAAwAAAAAAAAAAAAAADURvbmF0aW9uQ291bnQAAAAAAAABAAAAAAAAAAhEb25hdGlvbgAAAAEAAAAGAAAAAQAAAAAAAAAMVG90YWxEb25hdGVkAAAAAQAAABM=",
        "AAAAAAAAACBJbml0aWFsaXplIHRoZSBkb25hdGlvbiBjb250cmFjdAAAAAppbml0aWFsaXplAAAAAAAAAAAAAA==",
        "AAAAAAAAAB1HZXQgYSBzcGVjaWZpYyBkb25hdGlvbiBieSBJRAAAAAAAAAxnZXRfZG9uYXRpb24AAAABAAAAAAAAAAtkb25hdGlvbl9pZAAAAAAGAAAAAQAAA+gAAAfQAAAADkRvbmF0aW9uUmVjb3JkAAA=",
        "AAAAAAAAADBHZXQgdG90YWwgYW1vdW50IGRvbmF0ZWQgdG8gYSBzcGVjaWZpYyByZWNpcGllbnQAAAANdG90YWxfZG9uYXRlZAAAAAAAAAEAAAAAAAAACXJlY2lwaWVudAAAAAAAABMAAAABAAAACw==",
        "AAAAAAAAABJHZXQgZG9uYXRpb24gY291bnQAAAAAAA5kb25hdGlvbl9jb3VudAAAAAAAAAAAAAEAAAAG",
        "AAAAAQAAAAAAAAAAAAAADkRvbmF0aW9uUmVjb3JkAAAAAAAGAAAAAAAAAAZhbW91bnQAAAAAAAsAAAAAAAAABWFzc2V0AAAAAAAAEwAAAAAAAAAFZG9ub3IAAAAAAAATAAAAAAAAAARtZW1vAAAD6AAAABAAAAAAAAAACXJlY2lwaWVudAAAAAAAABMAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAY=",
        "AAAAAAAAACZHZXQgYWxsIGRvbmF0aW9ucyBmb3IgYSBzcGVjaWZpYyBkb25vcgAAAAAAE2dldF9kb25vcl9kb25hdGlvbnMAAAAAAgAAAAAAAAAFZG9ub3IAAAAAAAATAAAAAAAAAAVsaW1pdAAAAAAAAAQAAAABAAAD6gAAB9AAAAAORG9uYXRpb25SZWNvcmQAAA==",
        "AAAAAAAAACpHZXQgYWxsIGRvbmF0aW9ucyBmb3IgYSBzcGVjaWZpYyByZWNpcGllbnQAAAAAABdnZXRfcmVjaXBpZW50X2RvbmF0aW9ucwAAAAACAAAAAAAAAAlyZWNpcGllbnQAAAAAAAATAAAAAAAAAAVsaW1pdAAAAAAAAAQAAAABAAAD6gAAB9AAAAAORG9uYXRpb25SZWNvcmQAAA==",
      ]),
      options
    );
  }
  public readonly fromJSON = {
    donate: this.txFromJSON<u64>,
    initialize: this.txFromJSON<null>,
    get_donation: this.txFromJSON<Option<DonationRecord>>,
    total_donated: this.txFromJSON<i128>,
    donation_count: this.txFromJSON<u64>,
    get_donor_donations: this.txFromJSON<Array<DonationRecord>>,
    get_recipient_donations: this.txFromJSON<Array<DonationRecord>>,
  };
}
