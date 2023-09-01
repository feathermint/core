import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { EventReporter } from "../lib/event_reporter";
import { MockCollection, MockDataSource } from "../mocks";
import { GasPrice, MaticPrice } from "../types/core";
import {
  FeeEstimator,
  InvalidGasFeeMarginError,
  PriceNotFoundError,
} from "./fee_estimator";

chai.use(chaiAsPromised);

const gasPriceDoc: GasPrice = {
  name: "gas",
  unit: "wei",
  price: "0x17b79a6e99",
  lastUpdated: new Date(),
};
const maticPriceDoc: MaticPrice = {
  name: "matic",
  unit: "usd",
  price: 0.8,
  lastUpdated: new Date(),
};

const prices: MockCollection = {
  findOne(...args: unknown[]) {
    const arg = args[0] as { name: string };
    if (arg.name === "gas") return Promise.resolve(gasPriceDoc);
    if (arg.name === "matic") return Promise.resolve(maticPriceDoc);
    return Promise.reject("Invalid argument");
  },
};

const deps = {
  dataSource: new MockDataSource({ prices }),
  eventReporter: {
    captureException: () => "eventId",
    captureMessage: () => "eventId",
  } as EventReporter,
  platformFee: 0.02,
  gasFeeMargin: 0,
};

describe("FeeEstimator", () => {
  describe("#init", () => {
    it("throws if the the gas price document is not found", async () => {
      await expect(
        FeeEstimator.init({
          ...deps,
          dataSource: new MockDataSource({
            prices: { findOne: () => Promise.resolve(null) },
          }),
        }),
      ).to.be.rejectedWith(PriceNotFoundError);
    });

    it("throws if the the matic price document is not found", async () => {
      const prices: MockCollection = {
        findOne(...args: unknown[]) {
          const arg = args[0] as { name: string };
          if (arg.name === "gas")
            return Promise.resolve<GasPrice>({
              name: "gas",
              unit: "wei",
              price: "0x17b79a6e99",
              lastUpdated: new Date(),
            });
          if (arg.name === "matic") return Promise.resolve(null);
          return Promise.reject("Invalid argument");
        },
      };

      await expect(
        FeeEstimator.init({
          ...deps,
          dataSource: new MockDataSource({ prices }),
        }),
      ).to.be.rejectedWith(PriceNotFoundError);
    });

    it("throws if the the gas price margin is invalid", async () => {
      await expect(
        FeeEstimator.init({ ...deps, gasFeeMargin: -0.5 }),
      ).to.be.rejectedWith(InvalidGasFeeMarginError);

      await expect(
        FeeEstimator.init({ ...deps, gasFeeMargin: 1.5 }),
      ).to.be.rejectedWith(InvalidGasFeeMarginError);
    });
  });

  describe("#gasPrice", () => {
    it("returns the cached gas price", async () => {
      const fe = await FeeEstimator.init(deps);
      expect(fe.gasPrice).to.eq(BigInt(gasPriceDoc.price));
    });
  });

  describe("#maticPrice", () => {
    it("returns the cached MATIC price", async () => {
      const fe = await FeeEstimator.init(deps);
      expect(fe.maticPrice).to.eq(maticPriceDoc.price);
    });
  });

  describe("#gasUnits", () => {
    it("returns the required amount of gas units for an operation", async () => {
      const fe = await FeeEstimator.init(deps);

      let result = fe.gasUnits("safeTransferFrom");
      expect(result).to.eq(58873);

      result = fe.gasUnits("safeBatchTransferFrom");
      expect(result).to.eq(88393);
    });
  });

  describe("#gasFee", () => {
    it("returns the gas fee in wei based on the number of gas units", async () => {
      const fe = await FeeEstimator.init(deps);
      const gasUnits = 100000;

      const result = fe.gasFee(gasUnits);
      expect(result).to.eq(BigInt(gasUnits) * fe.gasPrice);
    });
  });

  describe("#reservedAmount", () => {
    it("returns the reserved amount in gwei for an operation", async () => {
      const fe = await FeeEstimator.init(deps);

      let gasUnits = fe.gasUnits("createToken");
      let result = fe.reservedAmount(gasUnits);
      expect(result).to.eq(39_633_283);

      gasUnits = fe.gasUnits("safeBatchTransferFrom", 5);
      result = fe.reservedAmount(gasUnits);
      expect(result).to.eq(42_733_478);
    });
  });
});
