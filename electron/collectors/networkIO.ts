import { App } from "electron";
import * as si from "systeminformation";

export default {
    updatesHeapId: "networkUpdate",
    name: "Network I/O",
    executionCondition: (timestamp: number) => timestamp % 1 === 0,
    collect: async (
        _: App,
    ): Promise<Record<string, any> & { successful: boolean }> => {
        const network = await si.networkStats();

        return {
            successful: true,
            rx: network[0].rx_sec,
            tx: network[0].tx_sec,
        };
    },
};
