import Cpu from "./Cpu";
import CpuTemperature from "./CpuTemperature";
import Drives from "./Drives";
import Hardware from "./Hardware";
import Memory from "./Memory";
import Network from "./Network";
import SwapUsage from "./SwapUsage";

export const WidgetsComponents = {
    hardware: Hardware,
    network: Network,
    memory: Memory,
    cpu: Cpu,
    drives: Drives,
    cpuTemperature: CpuTemperature,
    swapUsage: SwapUsage,
};
