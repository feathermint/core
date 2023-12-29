/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  ClientSession,
  ClientSessionOptions,
  Collection,
  Document,
  TransactionOptions,
  WithTransactionCallback,
} from "@feathermint/mongo-connect";
import { Dictionary } from "..";
import type { DataStore, RepositoryMap } from "../lib/data_store";

interface MockCollectionMethods<T = Document> {
  find?: MockCollection<T>["find"];
  findOne?: MockCollection<T>["findOne"];
  findOneAndUpdate?: MockCollection<T>["findOneAndUpdate"];
  insertOne?: MockCollection<T>["insertOne"];
  updateOne?: MockCollection<T>["updateOne"];
  deleteOne?: MockCollection<T>["deleteOne"];
  countDocuments?: MockCollection<T>["countDocuments"];
}

export class MockCollection<T = Document> {
  constructor(methods: MockCollectionMethods<T>) {
    Object.assign(this, methods);
  }

  find(...args: unknown[]): MockCursor<T> {
    throw new Error("Method not implemented.");
  }

  findOne(...args: unknown[]): Promise<T | null> {
    throw new Error("Method not implemented.");
  }

  findOneAndUpdate(
    ...args: unknown[]
  ): ReturnType<Collection["findOneAndUpdate"]> {
    throw new Error("Method not implemented.");
  }

  insertOne(...args: unknown[]): ReturnType<Collection["insertOne"]> {
    throw new Error("Method not implemented.");
  }

  updateOne(...args: unknown[]): ReturnType<Collection["updateOne"]> {
    throw new Error("Method not implemented.");
  }

  deleteOne(...args: unknown[]): ReturnType<Collection["deleteOne"]> {
    throw new Error("Method not implemented.");
  }

  countDocuments(...args: unknown[]): ReturnType<Collection["countDocuments"]> {
    throw new Error("Method not implemented.");
  }
}

export class MockDataStore implements Required<DataStore> {
  constructor(private collections: Dictionary<MockCollection>) {}

  repository<K extends keyof RepositoryMap>(name: K): RepositoryMap[K] {
    return this.collections[name] as unknown as RepositoryMap[K];
  }

  startSession(): ClientSession {
    return {
      async withTransaction(callback: () => Promise<void>) {
        await callback();
      },
      async endSession() {
        //
      },
    } as ClientSession;
  }

  async runTransaction(
    fn: WithTransactionCallback<void>,
    options?:
      | {
          session?: ClientSessionOptions | undefined;
          transaction?: TransactionOptions | undefined;
        }
      | undefined,
  ): Promise<void> {
    await fn({} as ClientSession);
  }

  close(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}

export class MockCursor<T> {
  constructor(private next: () => Promise<IteratorResult<T>>) {}

  [Symbol.asyncIterator]() {
    return {
      next: this.next,
      return() {
        return { done: true };
      },
    };
  }

  toArray(): Promise<Document[]> {
    throw new Error("Method not implemented.");
  }
}

function noop() {}
