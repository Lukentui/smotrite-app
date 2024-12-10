import {exec} from 'child_process'
import { App } from 'electron';
import * as si from "systeminformation";

export default {
    updatesHeapId: "networkUpdate",
    name: "Network I/O",
    shouldBeExecuted: (timestamp: number) => timestamp % 1 === 0,
    collect: async (app: App): Promise<Object> => {
        console.warn(9994, 'prev')
        const network = await si.networkStats();
        console.warn(9994, network)
        return {
            rx: network[0].rx_sec,
            tx: network[0].tx_sec,
        };
    }
}