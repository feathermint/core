type ObjectId = import("mongodb").ObjectId;

export type Resource = "token" | "token pool" | "transfer" | "user" | "status";

export interface User {
  account: string;
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
  id: string;
  userId: string;
  signerAddress: string | null;
  nonce: number | null;
  maxPriorityFeePerGas: number | null;
  txHash: string | null;
}

export interface TokenCreationJobV1 extends BaseTransactionJob {
  type: "TokenCreationJob";
  v: 1;
  token: {
    id: string;
    poolId: string;
    supply: number;
  };
}

export interface TransferJobV1 extends BaseTransactionJob {
  type: "TransferJob";
  v: 1;
  transfer: {
    id: string;
    poolId: string;
    tokenIds: string[];
    amounts: number[];
    recipient: string;
  };
}

export interface TransactionReceipt {
  transactionHash: string;
  transactionIndex: string;
  blockHash: string;
  blockNumber: string;
  from: string;
  to: string | null;
  cumulativeGasUsed: string;
  gasUsed: string;
  contractAddress: string | null;
  logs: TransactionLog[];
  logsBloom: string;
  type: string;
  status: string;
  effectiveGasPrice: string;
}

export interface TransactionLog {
  removed: boolean;
  logIndex: string;
  transactionIndex: string;
  transactionHash: string;
  blockHash: string;
  blockNumber: string;
  address: string;
  data: string;
  topics: string[];
}

export interface GasPrice {
  baseFeePerGas: number;
  maxPriorityFeePerGas: number;
  timestamp: number;
}

export interface MaticPrice {
  price: number;
  timestamp: number;
}

export enum JobStatus {
  Unknown = 0,
  Queued = 1,
  InProgress = 2,
  Success = 3,
  Failure = 4,
}
