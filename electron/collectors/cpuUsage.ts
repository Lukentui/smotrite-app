import { exec } from "child_process";
import { App } from "electron";
import * as si from "systeminformation";

export default {
  updatesHeapId: "cpuUpdate",
  name: "CPU Usage",
  shouldBeExecuted: (timestamp: number) => timestamp % 2 === 0,
  collect: async (app: App): Promise<Object> => ({
    load: await si.currentLoad(),
    cpu: await si.cpu(),

    ...(await si.currentLoad()).cpus.reduce((prev, curr, i) => {
      return {
        ...prev,
        [`core${i}`]: curr.load.toFixed(2),
      };
    }, {}),
  }),
};
