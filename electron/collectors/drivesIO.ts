import { exec } from "child_process";
import { App } from "electron";
import * as si from "systeminformation";

export default {
  updatesHeapId: "drivesIOUpdate",
  name: "Drives I/O",
  executionCondition: (timestamp: number) => timestamp % 1 === 0,
  collect: async (_: App): Promise<Record<string, any> & { successful: boolean }> => {
    return {
      successful: true,
      ...(await si.fsStats()),
    };
  },
};
