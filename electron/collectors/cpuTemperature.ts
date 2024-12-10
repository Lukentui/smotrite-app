import { execute } from "async-execute";
import { exec } from "child_process";
import { App } from "electron";

export default {
  updatesHeapId: "cpuTemperatureUpdate",
  name: "CPU Temperature",
  executionCondition: (timestamp: number) => timestamp % 1 === 0,
  collect: async (app: App): Promise<Record<string, any> & { successful: boolean }> => {
    const appDir = app.getPath("appData") + "/pro.nikkitin.smotrite";

    try {
      const result = await execute(`"${appDir}/cpu-temp" -c`);

      return {
        successful: true,
        current: result.trim() + " °C",
      };
    } catch {
      return {
        successful: false,
        current: null,
      };
    }
  },
};
