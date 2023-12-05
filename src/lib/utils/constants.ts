export const ONE_GWEI = BigInt(10 ** 9);
export const ONE_MATIC = BigInt(10 ** 9) * ONE_GWEI;
export const REDIS = {
  KEYS: {
    maticPrice: "price:matic",
    gasPrice: "price:gas",
    txjobs: "jobs:tx",
  } as const,
  CHANNELS: {
    matic: "channel:matic",
    gas: "channel:gas",
  } as const,
};
