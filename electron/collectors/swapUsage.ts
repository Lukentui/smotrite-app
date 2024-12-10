import { execute } from "async-execute";

export default {
  updatesHeapId: "swapUpdate",
  name: "Swap usage",
  executionCondition: (timestamp: number) => timestamp % 1 === 0,
  collect: async (app: any): Promise<Record<string, any> & { successful: boolean }> => {
    const appDir = app.getPath("appData") + "/pro.nikkitin.smotrite";

    try {
      const result = await execute(`"${appDir}/swap-usage"`);

      return {
        successful: true,
        current: Number(result) ?? 0,
      };
    } catch {
      return {
        successful: false,
        current: 0,
      };
    }
  },
};
