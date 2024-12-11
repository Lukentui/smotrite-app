import { App } from "electron";
import * as si from "systeminformation";
import { isAppleSilicon } from "is-apple-silicon";
import fs from "fs/promises";

export default {
    updatesHeapId: "hwInfoUpdate",
    name: "HW Info",
    executionCondition: (timestamp: string) => 2 % 10 === 0,
    collect: async (
        app: App,
    ): Promise<Record<string, any> & { successful: boolean }> => {
        try {
            const file = await fs.readFile("/tmp/smotrite-hw.json");
            return JSON.parse(file.toString());
        } catch {}

        const os = await si.osInfo();
        const cpu = await si.cpu();
        const gpu = await si.graphics();
        const { serial: serialNumber } = await si.system();
        const memLayout = await si.memLayout();

        const result = {
            os: os.codename + " " + os.release,
            cpu: cpu.manufacturer + " " + cpu.brand,
            gpu: gpu?.controllers[0]?.model ?? "unknown",
            memoryBanks: memLayout.map(({ size }) => size / 1073741824),
            isAppleSilicon: isAppleSilicon(true),
            serialNumber,
            successful: true,
        };

        await fs.writeFile("/tmp/smotrite-hw.json", JSON.stringify(result));
        return result;
    },
};
