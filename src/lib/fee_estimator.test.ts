import type { Document } from "@feathermint/mongo-connect";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { MockCollection, MockDataSource, MockEventReporter } from "../mocks";
import type { GasPrice, MaticPrice } from "../types/domain";
import { FeeEstimator, PriceNotFoundError } from "./fee_estimator";

chai.use(chaiAsPromised);

const gasPriceDoc: GasPrice = {
  name: "gas",
  unit: "wei",
  baseFeePerGas: 2 ** 32,
  maxPriorityFeePerGas: 2 ** 31,
  lastUpdated: new Date(),
};
const maticPriceDoc: MaticPrice = {
  name: "matic",
  unit: "usd",
  price: 0.8,
  lastUpdated: new Date(),
};

const prices = new MockCollection<Document>({
  findOne(...args: unknown[]) {
    const arg = args[0] as { name: string };
    if (arg.name === "gas") return Promise.resolve(gasPriceDoc);
    if (arg.name === "matic") return Promise.resolve(maticPriceDoc);
    return Promise.reject("Invalid argument");
  },
});

const deps = {
  dataSource: new MockDataSource({ prices }),
  eventReporter: new MockEventReporter(),
  platformFee: 0.02,
};

describe("FeeEstimator", () => {
  describe("#init", () => {
    it("throws if the the gas price document is not found", async () => {
      const prices = new MockCollection({
        findOne(...args: unknown[]) {
          const arg = args[0] as { name: string };
          if (arg.name === "gas") return Promise.resolve(null);
          if (arg.name === "matic") return Promise.resolve(maticPriceDoc);
          return Promise.reject("Invalid argument");
        },
      });

      await expect(
        FeeEstimator.init({
          ...deps,
          dataSource: new MockDataSource({ prices }),
        }),
      ).to.be.rejectedWith(PriceNotFoundError);
    });

    it("throws if the the matic price document is not found", async () => {
      const prices = new MockCollection({
        findOne(...args: unknown[]) {
          const arg = args[0] as { name: string };
          if (arg.name === "gas") return Promise.resolve(gasPriceDoc);
          if (arg.name === "matic") return Promise.resolve(null);
          return Promise.reject("Invalid argument");
        },
      });

      await expect(
        FeeEstimator.init({
          ...deps,
          dataSource: new MockDataSource({ prices }),
        }),
      ).to.be.rejectedWith(PriceNotFoundError);
    });
  });
});
