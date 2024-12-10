import { exec } from "child_process";
import { App } from "electron";
import macMemory from "mac-memory-ts";

export default {
  updatesHeapId: "memoryUsage",
  name: "Memory usage",
  shouldBeExecuted: (timestamp: number) => timestamp % 2 === 0,
  collect: async (app: App): Promise<Object> => macMemory(),
};
