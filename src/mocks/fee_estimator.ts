/* eslint-disable @typescript-eslint/no-unused-vars */
import type { FeeEstimator } from "..";

export class MockFeeEstimator implements Required<FeeEstimator> {
  constructor(
    public baseFeePerGas: bigint,
    public maxPriorityFeePerGas: bigint,
  ) {}

  gasUnits(
    operation?:
      | "createToken"
      | "safeTransferFrom"
      | "safeAdjustedBatchTransferFrom"
      | "mint"
      | "mintBatch"
      | "burn"
      | "burnBatch",
    batchSize?: number | undefined,
  ): number {
    throw new Error("Method not implemented.");
  }

  platformFee(): bigint {
    throw new Error("Method not implemented.");
  }
}
