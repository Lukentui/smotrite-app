// structure.test.ts
import { describe, it, expect, expectTypeOf } from "vitest";
import collectors from "../../electron/collectors";
import { app } from "electron";
import dayjs from "dayjs";

describe("collectors architecutre test", () => {
  it.concurrent.each(collectors)(
    `should have the correct structure`,
    (collector) => {
      expectTypeOf(collector.executionCondition).parameter(0).toBeNumber();
      expectTypeOf(collector.executionCondition).returns.toBeBoolean();
      expect(collector.executionCondition(dayjs().unix())).toBeTypeOf(
        "boolean",
      );

      expectTypeOf(collector.collect).parameter(0).toBeCallableWith(app);
      expectTypeOf(collector.collect).returns.toBeObject();

      expectTypeOf(collector.name).toBeString();
      expectTypeOf(collector.updatesHeapId).toBeString();
    },
  );
});
