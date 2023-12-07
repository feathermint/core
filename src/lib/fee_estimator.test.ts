import { Redis } from "@feathermint/redis-connect";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { MockEventReporter } from "../mocks";
import {
  FeeEstimator,
  InvalidPriceError,
  RedisKeyNotFoundError,
} from "./fee_estimator";

chai.use(chaiAsPromised);

const gasPrice = JSON.stringify({
  baseFeePerGas: 2 ** 32,
  maxPriorityFeePerGas: 2 ** 31,
  timestamp: Date.now(),
});
const maticPrice = JSON.stringify({
  price: 0.8,
  timestamp: Date.now(),
});

const deps = {
  eventReporter: new MockEventReporter(),
  platformFee: 0.02,
};

describe("FeeEstimator", () => {
  describe("#init", () => {
    it("throws if the matic price is not found", async () => {
      await expect(
        FeeEstimator.init({
          ...deps,
          redis: {
            mget: () => Promise.resolve([null, gasPrice]),
          } as Redis,
        }),
      ).to.be.rejectedWith(RedisKeyNotFoundError);
    });

    it("throws if the gas price is not found", async () => {
      await expect(
        FeeEstimator.init({
          ...deps,
          redis: {
            mget: () => Promise.resolve([maticPrice, null]),
          } as Redis,
        }),
      ).to.be.rejectedWith(RedisKeyNotFoundError);
    });

    it("throws if the matic price is not valid", async () => {
      await expect(
        FeeEstimator.init({
          ...deps,
          redis: {
            mget: () => {
              const maticPrice = JSON.stringify({
                price: null,
                timestamp: Date.now(),
              });
              return Promise.resolve([maticPrice, gasPrice]);
            },
          } as Redis,
        }),
      ).to.be.rejectedWith(InvalidPriceError);
    });

    it("throws if the gas price is not valid", async () => {
      await expect(
        FeeEstimator.init({
          ...deps,
          redis: {
            mget: () => {
              const gasPrice = JSON.stringify({
                baseFeePerGas: 2 ** 32,
                timestamp: Date.now(),
              });
              return Promise.resolve([maticPrice, gasPrice]);
            },
          } as Redis,
        }),
      ).to.be.rejectedWith(InvalidPriceError);
    });

    it("returns a FeeEstimator instance", async () => {
      await expect(
        FeeEstimator.init({
          ...deps,
          redis: {
            mget: () => Promise.resolve([maticPrice, gasPrice]),
            subscribe: () => Promise.resolve(null),
            on() {},
          } as unknown as Redis,
        }),
      ).to.eventually.be.instanceOf(FeeEstimator);
    });
  });
});
