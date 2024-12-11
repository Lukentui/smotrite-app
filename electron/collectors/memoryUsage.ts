import { App } from "electron";
import macMemory from "mac-memory-ts";

export default {
    updatesHeapId: "memoryUsage",
    name: "Memory usage",
    executionCondition: (timestamp: number) => timestamp % 2 === 0,
    collect: async (
        _: App,
    ): Promise<Record<string, any> & { successful: boolean }> => ({
        successful: true,
        ...(await macMemory()),
    }),
};
