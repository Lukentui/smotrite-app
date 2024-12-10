import {exec} from 'child_process'
import { App } from 'electron';
import * as si from "systeminformation";

export default {
    updatesHeapId: "drivesIOUpdate",
    name: "Drives I/O",
    shouldBeExecuted: (timestamp: number) => timestamp % 1 === 0,
    collect: async (app: App): Promise<Object> => {
        return si.fsStats();
    }
}