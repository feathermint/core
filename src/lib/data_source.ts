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
  txjobs: mongo.Collection<t.TransactionJob>;
}

export class DataSource {
  static #instance: DataSource;
  readonly #client: mongo.MongoClient;
  readonly #cache: Partial<RepositoryMap> = {};
  readonly #dbName?: string;
  readonly #defaultTransactionOptions: mongo.TransactionOptions = {
    readPreference: "primary",
    readConcern: { level: "majority" },
    writeConcern: { w: "majority" },
  };

  static async init(url?: string, dbName?: string): Promise<DataSource> {
    if (this.#instance) return this.#instance;

    this.#instance = new DataSource(await connect(url), dbName);
    return this.#instance;
  }

  private constructor(client: mongo.MongoClient, dbName?: string) {
    this.#client = client;
    this.#dbName = dbName;
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
    return this.#client.startSession({
      defaultTransactionOptions: this.#defaultTransactionOptions,
      ...options,
    });
  }

  async runTransaction(
    fn: mongo.WithTransactionCallback<void>,
    options?: {
      session?: mongo.ClientSessionOptions;
      transaction?: mongo.TransactionOptions;
    },
  ) {
    await this.#client.withSession(
      {
        defaultTransactionOptions: this.#defaultTransactionOptions,
        ...options?.session,
      },
      async (session) => {
        await session.withTransaction(fn, options?.transaction);
      },
    );
  }

  async close(force = false) {
    log.info("Closing the MongoDB client.");
    return await this.#client.close(force);
  }
}
