import { FeathermintERC1155 } from "@feathermint/contracts/utils/gas.json";
import type { ChangeStreamUpdateDocument } from "@feathermint/mongo-connect";
import { GasPrice, MaticPrice, Price } from "../types/core";
import type { DataSource } from "./data_source";
import type { EventReporter } from "./event_reporter";
import { ONE_GWEI } from "./utils/constants";

type Operation = keyof typeof FeathermintERC1155;

interface FeeEstimatorDeps {
  dataSource: Required<DataSource>;
  eventReporter: EventReporter;
  platformFee: number;
  gasFeeMargin: number;
}

interface FeeEstimatorDepsWithPrices extends FeeEstimatorDeps {
  gasPrice: bigint;
  maticPrice: number;
}

export class FeeEstimator {
  readonly #dataSource: Required<DataSource>;
  readonly #eventReporter: EventReporter;
  readonly platformFeeUSD: number;
  readonly gasFeeMargin: number;
  #gasPrice: bigint;
  #maticPrice: number;

  static async init(deps: FeeEstimatorDeps) {
    const prices = deps.dataSource.repository("prices");
    const [gasPriceDoc, maticPriceDoc] = await Promise.all([
      prices.findOne<GasPrice>({ name: "gas" }),
      prices.findOne<MaticPrice>({ name: "matic" }),
    ]);
    if (!gasPriceDoc) throw new PriceNotFoundError("gas");
    if (!maticPriceDoc) throw new PriceNotFoundError("matic");

    if (deps.gasFeeMargin < 0 || deps.gasFeeMargin > 1)
      throw new InvalidGasFeeMarginError();

    return new FeeEstimator({
      ...deps,
      gasPrice: BigInt(gasPriceDoc.price),
      maticPrice: maticPriceDoc.price,
    });
  }

  private constructor(deps: FeeEstimatorDepsWithPrices) {
    this.#dataSource = deps.dataSource;
    this.#eventReporter = deps.eventReporter;
    this.platformFeeUSD = deps.platformFee;
    this.#maticPrice = deps.maticPrice;
    this.#gasPrice = deps.gasPrice;
    this.gasFeeMargin = deps.gasFeeMargin;
    this.#dataSource
      .getStream("priceUpdates")
      .on("change", this.#changeListener.bind(this));
  }

  get gasPrice(): bigint {
    return this.#gasPrice;
  }

  get maticPrice(): number {
    return this.#maticPrice;
  }

  gasUnits(operation: Operation, batchSize?: number): number {
    switch (operation) {
      case "safeTransferFrom":
      case "createToken":
      case "mint":
      case "burn":
        return FeathermintERC1155[operation];
      case "safeBatchTransferFrom":
      case "mintBatch":
      case "burnBatch": {
        const n = !batchSize || batchSize < 2 ? 0 : batchSize - 2;
        const minAmount = FeathermintERC1155[operation].min;
        const additionalAmount = FeathermintERC1155[operation].inc * n;
        return minAmount + additionalAmount;
      }
      default:
        // Triggers a compiler error when new operations are added,
        // keeping the switch statement exhaustive.
        throw new UnknownOperationError(operation);
    }
  }

  /**
   * Returns the amount in gwei that must be deducted from the user's
   * available balance and added to the user's reserved balance.
   */
  reservedAmount(gasUnits: number): number {
    const gasFee = gasUnits * Number(this.gasPrice / ONE_GWEI);
    return gasFee + gasFee * this.gasFeeMargin + this.platformFee();
  }

  /**
   * Returns the gas fee in wei
   */
  gasFee(gasUnits: number): bigint {
    return BigInt(gasUnits) * this.gasPrice;
  }

  /**
   * Returns the platform fee in gwei
   */
  platformFee(): number {
    const fraction = this.platformFeeUSD / this.maticPrice;
    return Math.floor(fraction * 10 ** 9);
  }

  #changeListener(change: ChangeStreamUpdateDocument<Price>) {
    if (!change.fullDocument) {
      this.#eventReporter.captureException(new UndefinedDocumentError());
      return;
    }

    if (change.fullDocument.name === "gas")
      this.#gasPrice = BigInt(change.fullDocument.price);
    else if (change.fullDocument.name === "matic")
      this.#maticPrice = change.fullDocument.price;
  }
}

export class PriceNotFoundError extends Error {
  constructor(name: "gas" | "matic") {
    super(`fee_estimator: ${name} price not found`);
  }
}

export class UnknownOperationError extends Error {
  constructor(cause: never) {
    super("fee_estimator: unknown operation", { cause });
  }
}

export class UndefinedDocumentError extends Error {
  constructor() {
    super("fee_estimator: change.fullDocument is undefined");
  }
}

export class InvalidGasFeeMarginError extends Error {
  constructor() {
    super("fee_estimator: gasFeeMargin must be between 0 and 1");
  }
}
