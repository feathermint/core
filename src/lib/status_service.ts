import type { Redis } from "@feathermint/redis-connect";
import { JobStatus } from "../types/domain";

interface ServiceDeps {
  redis: Required<Redis>;
  keyExpiration?: number;
}

export class StatusService {
  #redis: Required<Redis>;
  #keyExpiration: number;

  constructor({ redis, keyExpiration }: ServiceDeps) {
    this.#redis = redis;
    this.#keyExpiration = keyExpiration ?? 1800;
  }

  #jobStatusToResponse: Record<JobStatus, string> = {
    [JobStatus.Unknown]: JSON.stringify({ status: "Unknown" }),
    [JobStatus.Queued]: JSON.stringify({ status: "Queued" }),
    [JobStatus.InProgress]: JSON.stringify({ status: "InProgress" }),
    [JobStatus.Success]: "",
    [JobStatus.Failure]: JSON.stringify({ status: "Failure" }),
  };

  async get(id: string): Promise<JobStatus> {
    const status = await this.#redis.get(id);
    switch (Number(status) as JobStatus) {
      case JobStatus.Queued:
        return JobStatus.Queued;
      case JobStatus.InProgress:
        return JobStatus.InProgress;
      case JobStatus.Success:
        return JobStatus.Success;
      case JobStatus.Failure:
        return JobStatus.Failure;
      default:
        return JobStatus.Unknown;
    }
  }

  async set(id: string, status: JobStatus): Promise<void> {
    await this.#redis.setex(`s:${id}`, this.#keyExpiration, status);
  }

  async responseFor(id: string): Promise<string> {
    return this.#jobStatusToResponse[await this.get(id)];
  }
}
