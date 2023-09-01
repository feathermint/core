import type { FeeEstimator } from "..";

export class MockFeeEstimator implements Required<FeeEstimator> {
  constructor(
    public gasPrice: bigint,
    public maticPrice: number,
  ) {}
  platformFeeUSD = 0;
  gasFeeMargin = 0;

  gasUnits(): number {
    throw new Error("Method not implemented.");
  }

  reservedAmount(): number {
    throw new Error("Method not implemented.");
  }

  gasFee(): bigint {
    throw new Error("Method not implemented.");
  }

  platformFee(): number {
    throw new Error("Method not implemented.");
  }
}
