import type { EventReporter } from "..";

export class MockEventReporter implements Required<EventReporter> {
  captureException(): string {
    throw new Error("Method not implemented.");
  }

  captureMessage(): string {
    throw new Error("Method not implemented.");
  }
}
