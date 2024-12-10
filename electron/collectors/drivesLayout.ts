import { App } from "electron";
import * as si from "systeminformation";

export default {
  updatesHeapId: "drivesLayoutUpdate",
  name: "Drives layout",
  executionCondition: (timestamp: number) => timestamp % 1 === 0,
  collect: async (_: App): Promise<Record<string, any> & { successful: boolean }> => {
    return {
      successful: true,
      current: await si.diskLayout(),
    };
  },
};
