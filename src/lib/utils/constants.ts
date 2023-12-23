export const ONE_GWEI = BigInt(10 ** 9);
export const ONE_MATIC = BigInt(10 ** 9) * ONE_GWEI;
export const REDIS = {
  KEYS: {
    gasPrice: "price:gas",
    txjobs: "jobs:tx",
  } as const,
  CHANNELS: {
    gas: "channel:gas",
  } as const,
};
