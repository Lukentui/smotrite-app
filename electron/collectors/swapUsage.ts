import {exec} from 'child_process'
import { App } from 'electron';

export default {
    updatesHeapId: "swapUpdate",
    name: "Swap usage",
    shouldBeExecuted: (timestamp: number) => timestamp % 1 === 0,
    collect: async (app: App): Promise<Object> => {
        const appDir = app.getPath('appData') + '/pro.nikkitin.smotrite';
        try {
            const res = await exec(
                appDir + "/swap-usage"
            );

            if(res.stderr) {
                return {
                    current: 0
                };
            }

            return {
                current: Number(res.stdout ?? 0) ?? 0
            };
        } catch {
            return {
                current: 0
            };
        }
    }
}