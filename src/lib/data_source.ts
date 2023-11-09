import * as logger from "@feathermint/logger";
import type * as mongo from "@feathermint/mongo-connect";
import { connect } from "@feathermint/mongo-connect";
import * as t from "../types/domain";

const log = logger.create("datasource");

export interface RepositoryMap {
  users: mongo.Collection<t.User>;
  tokenpools: mongo.Collection<t.TokenPool>;
  tokens: mongo.Collection<t.Token>;
  transfers: mongo.Collection<t.Transfer>;
  txjobs: mongo.Collection<t.InProgress<t.TransactionJob>>;
  prices: mongo.Collection<t.Price>;
}

export interface StreamMap {
  priceUpdates?: mongo.ChangeStream<t.Price>;
}

export class DataSource {
  static #instance: DataSource;
  #client: mongo.MongoClient;
  #cache: Partial<RepositoryMap> = {};
  #streams: StreamMap;
  #dbName?: string;

  static async init(url?: string, dbName?: string): Promise<DataSource> {
    if (this.#instance) return this.#instance;

    this.#instance = new DataSource(await connect(url), dbName);
    return this.#instance;
  }

  private constructor(client: mongo.MongoClient, dbName?: string) {
    this.#client = client;
    this.#streams = {};
    this.#dbName = dbName;
  }

  getStream(
    name: keyof StreamMap,
    options?: { pipeline?: Document[]; resumeToken?: string },
  ) {
    switch (name) {
      case "priceUpdates":
        return this.#priceUpdateStream(options);
      default:
        // Triggers a compiler error when new streams are added,
        // keeping the switch statement exhaustive.
        throw new UnknownStreamError(name);
    }
  }

  repository<K extends keyof RepositoryMap>(name: K): RepositoryMap[K] {
    if (!this.#cache[name]) {
      this.#cache[name] = this.#client
        .db(this.#dbName)
        .collection(name) as RepositoryMap[K];
    }
    return this.#cache[name]!;
  }

  startSession(options?: mongo.ClientSessionOptions): mongo.ClientSession {
    const defaultTransactionOptions: mongo.TransactionOptions = {
      readPreference: "primary",
      readConcern: { level: "majority" },
      writeConcern: { w: "majority" },
    };

    return this.#client.startSession({
      defaultTransactionOptions,
      ...options,
    });
  }

  async close(force: boolean) {
    const activeStreams = Object.keys(this.#streams);
    if (activeStreams.length > 0) {
      await Promise.all(
        activeStreams.map((name) => {
          log.info(`Closing ${name} change stream.`);
          return this.#streams[name as keyof StreamMap]?.close();
        }),
      ).catch(log.error);
    }

    log.info("Closing the MongoDB client.");
    return await this.#client.close(force);
  }

  #priceUpdateStream(options?: {
    pipeline?: Document[];
    resumeToken?: string;
  }) {
    const { pipeline = [], resumeToken } = options ?? {};

    if (!this.#streams.priceUpdates || this.#streams.priceUpdates.closed)
      this.#streams.priceUpdates = this.repository("prices").watch(
        [{ $match: { operationType: "update" } }, ...pipeline],
        {
          fullDocument: "updateLookup",
          ...(resumeToken && { resumeAfter: resumeToken }),
        },
      );
    return this.#streams.priceUpdates;
  }
}

class UnknownStreamError extends Error {
  constructor(cause: never) {
    super("data_source: unknown stream", { cause });
  }
}
