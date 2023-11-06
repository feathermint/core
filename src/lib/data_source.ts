import type {
  ChangeStream,
  ChangeStreamUpdateDocument,
  ClientSession,
  ClientSessionOptions,
  Collection,
  Document,
  MongoClient,
  TransactionOptions,
} from "@feathermint/mongo-connect";
import { connect } from "@feathermint/mongo-connect";
import * as t from "../types/domain";

export interface RepositoryMap {
  users: Collection<t.User>;
  tokenpools: Collection<t.TokenPool>;
  tokens: Collection<t.Token>;
  transfers: Collection<t.Transfer>;
  txjobs: Collection<t.Signed<t.TransactionJob>>;
  prices: Collection<t.Price>;
}

export interface StreamMap {
  priceUpdates?: ChangeStream<t.Price, ChangeStreamUpdateDocument<t.Price>>;
}

export class DataSource {
  static #instance: DataSource;
  #client: MongoClient;
  #cache: Partial<RepositoryMap> = {};
  #streams: StreamMap;
  #dbName?: string;

  static async init(url?: string, dbName?: string): Promise<DataSource> {
    if (this.#instance) return this.#instance;

    this.#instance = new DataSource(await connect(url), dbName);
    return this.#instance;
  }

  private constructor(client: MongoClient, dbName?: string) {
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

  startSession(options?: ClientSessionOptions): ClientSession {
    const defaultTransactionOptions: TransactionOptions = {
      readPreference: "primary",
      readConcern: { level: "majority" },
      writeConcern: { w: "majority" },
    };

    return this.#client.startSession({
      defaultTransactionOptions,
      ...options,
    });
  }

  close(force?: boolean) {
    return this.#client.close(force);
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
