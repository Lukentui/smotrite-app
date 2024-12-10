import {exec} from 'child_process'
import { App } from 'electron';

export default {
    updatesHeapId: "cpuTemperature",
    name: "CPU Temperature",
    shouldBeExecuted: (timestamp: number) => timestamp % 1 === 0,
    collect: async (app: App): Promise<Object> => {
        const appDir = app.getPath('appData') + '/pro.nikkitin.smotrite';

        return new Promise(function(resolve) {
            exec(`"${appDir}/cpu-temp" -c`,
                function(error, stdout) {
                    if(error) {
                        return resolve({
                            current: null
                        });
                    }
        
                    return resolve({
                        current: stdout.trim() + ' °C'
                    });
            });
        });
    }
}