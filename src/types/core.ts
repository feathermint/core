type ObjectId = import("mongodb").ObjectId;
export type Resource =
  | "token"
  | "token pool"
  | "transaction"
  | "transfer"
  | "user"
  | "status";

export interface User {
  account: string;
  balance: {
    available: number;
    reserved: number;
  };
  profile: {
    name: string | null;
    avatar: string | null;
    banner: string | null;
  };
  flags: number;
  active: boolean;
  verified: boolean;
}

export interface Token {
  userId: ObjectId;
  poolId: ObjectId;
  name: string;
  description: string;
  balance: number;
  supply: number;
  transferred: number;
  txHash: string | null;
  // Arbitrary properties. Values may be strings, numbers, object or arrays.
  // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1155.md#erc-1155-metadata-uri-json-schema
  // properties: unknown;
}

export interface TokenMetadata {
  name: string;
  decimals: 0;
  description: string;
  image: string;
}

export interface LiquidityTokenMetadata {
  name: string;
  decimals: 18;
  description: string;
  image: string;
}

export interface TokenPool {
  userId: ObjectId;
  heroTokenId: ObjectId | null;
  name: string;
  description: string;
  count: number;
  aggregate: {
    balance: number;
    supply: number;
    transferred: number;
  };
  pending: ObjectId[];
}

export interface Transfer {
  userId: ObjectId;
  poolId: ObjectId;
  txHash: string;
  recipient: string;
  token: {
    ids: string[];
    amounts: number[];
  };
}

export type TransactionJob = TokenCreationJobV1 | TransferJobV1;

interface BaseTransactionJob {
  userId: ObjectId;
  gasUnits: number;
  reserved: {
    gasFee: string;
    platformFee: string;
  };
}

export interface TokenCreationJobV1 extends BaseTransactionJob {
  type: "TokenCreationJob";
  v: 1;
  token: {
    id: ObjectId;
    poolId: ObjectId;
    name: string;
    description: string;
    supply: number;
  };
}

export interface TransferJobV1 extends BaseTransactionJob {
  type: "TransferJob";
  v: 1;
  transfer: {
    id: ObjectId;
    tokenIds: string[];
    amounts: number[];
    recipient: string;
  };
}

export type InProgress<T extends TransactionJob> = T & {
  signerAddress: string;
  nonce: number;
  txHash: string;
};

export type Price = GasPrice | MaticPrice;

export interface GasPrice {
  name: "gas";
  unit: "wei";
  baseFeePerGas: number;
  maxPriorityFeePerGas: number;
  lastUpdated: Date;
}

export interface MaticPrice {
  name: "matic";
  unit: "usd";
  price: number;
  lastUpdated: Date;
}

export enum JobStatus {
  Unknown = 0,
  Queued = 1,
  InProgress = 2,
  Success = 3,
  Failure = 4,
}
