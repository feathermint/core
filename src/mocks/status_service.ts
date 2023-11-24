/* eslint-disable @typescript-eslint/no-unused-vars */
import { StatusService } from "../lib/status_service";
import type { JobStatus } from "../types/domain";

export class MockStatusService implements Required<StatusService> {
  get(id: string): Promise<JobStatus> {
    throw new Error("Method not implemented.");
  }

  set(id: string, status: JobStatus): Promise<void> {
    throw new Error("Method not implemented.");
  }

  responseFor(id: string): Promise<string> {
    throw new Error("Method not implemented.");
  }
}
