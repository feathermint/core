/* eslint-disable @typescript-eslint/no-unused-vars */
import type { EventReporter } from "..";

export class MockEventReporter implements Required<EventReporter> {
  captureException(exception?: unknown): string {
    throw new Error("Method not implemented.");
  }

  captureMessage(message?: string): string {
    throw new Error("Method not implemented.");
  }
}
