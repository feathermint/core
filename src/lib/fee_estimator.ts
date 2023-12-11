import estimates from "@feathermint/contracts/gas/FeathermintERC1155.json";
import type { Redis } from "@feathermint/redis-connect";
import { z } from "zod";
import type { GasPrice, MaticPrice } from "../types/domain";
import type { EventReporter } from "./event_reporter";
import { REDIS } from "./utils";

const gasSchema = z.object({
  baseFeePerGas: z.number(),
  maxPriorityFeePerGas: z.number(),
  timestamp: z.number(),
});
const maticSchema = z.object({
  price: z.number(),
  timestamp: z.number(),
});

type Operation = keyof typeof estimates;

interface FeeEstimatorDeps {
  redis: Redis;
  eventReporter: EventReporter;
  platformFee: number;
}

interface FeeEstimatorOptions {
  updateMaticPrice?: boolean;
  updateGasPrice?: boolean;
}

export class FeeEstimator {
  readonly #redis: Redis;
  readonly #eventReporter: EventReporter;
  readonly #platformFeeUSD: number;
  #baseFeePerGas!: bigint;
  #maxPriorityFeePerGas!: bigint;
  #maticPrice!: number;

  static async init(deps: FeeEstimatorDeps): Promise<FeeEstimator> {
    return await new FeeEstimator(deps).init();
  }

  private constructor(deps: FeeEstimatorDeps) {
    this.#redis = deps.redis;
    this.#eventReporter = deps.eventReporter;
    this.#platformFeeUSD = deps.platformFee;
  }

  private async init(
    options: FeeEstimatorOptions = {
      updateMaticPrice: true,
      updateGasPrice: true,
    },
  ): Promise<this> {
    const { maticPrice, gasPrice } = REDIS.KEYS;
    const result = await this.#redis.mget(maticPrice, gasPrice);
    if (result[0] === null) throw new RedisKeyNotFoundError(maticPrice);
    if (result[1] === null) throw new RedisKeyNotFoundError(gasPrice);

    let matic: MaticPrice;
    let gas: GasPrice;
    try {
      matic = maticSchema.parse(JSON.parse(result[0]));
      gas = gasSchema.parse(JSON.parse(result[1]));
    } catch (err) {
      throw new InvalidPriceError(err);
    }

    this.#maticPrice = matic.price;
    this.#baseFeePerGas = BigInt(gas.baseFeePerGas);
    this.#maxPriorityFeePerGas = BigInt(gas.maxPriorityFeePerGas);

    const channels: string[] = [];
    if (options.updateMaticPrice) channels.push(REDIS.CHANNELS.matic);
    if (options.updateGasPrice) channels.push(REDIS.CHANNELS.gas);
    if (channels.length) await this.#redis.subscribe(...channels);

    this.#redis.on("message", this.#handleMessage);

    return this;
  }

  get baseFeePerGas(): bigint {
    return this.#baseFeePerGas;
  }

  get maxPriorityFeePerGas(): bigint {
    return this.#maxPriorityFeePerGas;
  }

  gasUnits(operation: Operation, batchSize?: number): number {
    switch (operation) {
      case "safeTransferFrom":
      case "createToken":
      case "mint":
      case "burn":
        return estimates[operation];
      case "safeAdjustedBatchTransferFrom":
      case "mintBatch":
      case "burnBatch": {
        const n = !batchSize || batchSize < 2 ? 0 : batchSize - 2;
        const minAmount = estimates[operation].min;
        const additionalAmount = estimates[operation].inc * n;
        return minAmount + additionalAmount;
      }
      default:
        // Triggers a compiler error when new operations are added,
        // keeping the switch statement exhaustive.
        throw new UnknownOperationError(operation);
    }
  }

  platformFee(): bigint {
    const fraction = this.#platformFeeUSD / this.#maticPrice;
    return BigInt(Math.floor(fraction * 10 ** 9)) * 10n ** 9n;
  }

  async close() {
    this.#redis.removeListener("message", this.#handleMessage);
    await this.#redis.unsubscribe();
    await this.#redis.quit();
  }

  #handleMessage = (channel: string, message: string) => {
    if (channel === REDIS.CHANNELS.gas) {
      this.#updateGasPrice(message);
    } else if (channel === REDIS.CHANNELS.matic) {
      this.#updateMaticPrice(message);
    }
  };

  #updateMaticPrice = (message: string) => {
    try {
      const matic = maticSchema.parse(JSON.parse(message));
      this.#maticPrice = matic.price;
    } catch (err) {
      const wrappedError = new PriceUpdateError("matic", err);
      this.#eventReporter.captureException(wrappedError);
    }
  };

  #updateGasPrice = (message: string) => {
    try {
      const gas = gasSchema.parse(JSON.parse(message));
      this.#baseFeePerGas = BigInt(gas.baseFeePerGas);
      this.#maxPriorityFeePerGas = BigInt(gas.maxPriorityFeePerGas);
    } catch (err) {
      const wrappedError = new PriceUpdateError("gas", err);
      this.#eventReporter.captureException(wrappedError);
    }
  };
}

export class RedisKeyNotFoundError extends Error {
  constructor(key: string) {
    super(`fee_estimator: ${key} not found`);
  }
}

export class UnknownOperationError extends Error {
  constructor(cause: never) {
    super("fee_estimator: unknown operation", { cause });
  }
}

export class InvalidPriceError extends Error {
  constructor(cause: unknown) {
    super("fee_estimator: invalid price", { cause });
  }
}

export class PriceUpdateError extends Error {
  constructor(name: "matic" | "gas", cause: unknown) {
    super(`fee_estimator: failed to update ${name} price`, { cause });
  }
}
