import { execute } from "async-execute";
import { existsSync } from "fs-extra";

const killProcess = async (processId: number): Promise<void> => {
    try {
        await execute(`kill -9 ${processId}`);
    } catch (e) {
        throw new Error(`Unable to kill process ${processId}, reason: ${e}`);
    }
};

const getProcessDirectory = async (processId: number): Promise<void> => {
    try {
        await execute(`/bin/sh -c "dirname $(ps -o comm= -p ${processId})"`);
    } catch (e) {
        throw new Error(
            `Unable to find directory of the process ${processId}, reason: ${e}`,
        );
    }
};

const openDirectoryInFinder = async (directoryPath: string): Promise<void> => {
    if (!existsSync(directoryPath)) {
        throw new Error(
            `Unable to open directory in Finder, directory doesn't exists!`,
        );
    }

    try {
        await execute(`/usr/bin/open "${directoryPath}"`);
    } catch (e) {
        throw new Error(
            `Unable to open directory in Finder, reason: ${e}`,
        );
    }
};

export default { killProcess, openDirectoryInFinder, getProcessDirectory };
