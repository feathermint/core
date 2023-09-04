/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
  ClientSession,
  Collection,
  Document,
} from "@feathermint/mongo-connect";
import { Dictionary } from "..";
import type { DataSource, RepositoryMap, StreamMap } from "../lib/data_source";

export class MockCollection<T = Document> {
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

export class MockDataSource implements Required<DataSource> {
  constructor(private collections: Dictionary<MockCollection>) {}

  getStream(name: keyof StreamMap): Required<StreamMap>[keyof StreamMap] {
    switch (name) {
      case "priceUpdates":
        return {
          on: noop,
        } as unknown as Required<StreamMap>["priceUpdates"];
      default:
        throw new Error(`Stream ${name as string} does not exist.`);
    }
  }

  startSession(): ClientSession {
    return {
      async withTransaction(callback: () => Promise<void>) {
        await callback();
        return {};
      },
      async endSession() {
        //
      },
    } as ClientSession;
  }

  repository<K extends keyof RepositoryMap>(name: K): RepositoryMap[K] {
    return this.collections[name] as unknown as RepositoryMap[K];
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
