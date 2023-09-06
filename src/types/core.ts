type ObjectId = import("mongodb").ObjectId;
export type Resource =
  | "token"
  | "token pool"
  | "transaction"
  | "transfer"
  | "user";

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

export type Transaction = TokenCreationTransactionV1 | TransferTransactionV1;

interface BaseTransaction {
  userId: ObjectId;
  status: -1 | 0 | 1 | 2;
  signer?: string;
  nonce?: number;
  txHash?: string;
  gasUnits: number;
  reserved: {
    gasFee: number;
    platformFee: number;
  };
}

export interface TokenCreationTransactionV1 extends BaseTransaction {
  type: "TokenCreationTransaction";
  v: 1;
  token: {
    id: ObjectId;
    poolId: ObjectId;
    name: string;
    description: string;
    supply: number;
  };
}

export interface TransferTransactionV1 extends BaseTransaction {
  type: "TransferTransaction";
  v: 1;
  transfer: {
    id: ObjectId;
    tokenIds: {
      primary: string[];
      secondary: string[];
    };
    amounts: number[];
    recipient: string;
  };
}

export type Price = GasPrice | MaticPrice;

export interface GasPrice {
  name: "gas";
  unit: "wei";
  price: string;
  lastUpdated: Date;
}

export interface MaticPrice {
  name: "matic";
  unit: "usd";
  price: number;
  lastUpdated: Date;
}

export interface Worker {
  account: string;
  transactionIds: string[];
}
