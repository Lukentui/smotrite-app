import cpuTemperature from "./cpuTemperature";
import cpuUsage from "./cpuUsage";
import drivesIO from "./drivesIO";
import drivesLayout from "./drivesLayout";
import hardwareInfo from "./hardwareInfo";
import memoryUsage from "./memoryUsage";
import networkIO from "./networkIO";
import swapUsage from "./swapUsage";

const collectors = [
    swapUsage,
    cpuUsage,
    cpuTemperature,
    memoryUsage,
    drivesIO,
    hardwareInfo,
    drivesLayout,
    networkIO,
];

const keys = Object.keys(collectors)
if(new Set(keys).size !== keys.length) {
    throw new Error("Some collectors are duplicated! It's prohibited and gonna break the app.");
}

export default collectors;
