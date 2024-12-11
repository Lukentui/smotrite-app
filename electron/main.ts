import { app, BrowserWindow, ipcMain, net, protocol, dialog } from "electron";
import path from "node:path";
require("@electron/remote/main").initialize();
import { initialize, trackEvent } from "@aptabase/electron/main";
import fs from "fs";
const extract = require("extract-zip");
import dayjs from "dayjs";
import collectors from "./collectors";
import log from "electron-log";
import Downloader from "nodejs-file-downloader";
import { calculateSHA256ByPath, getAppDir } from "./fsManager";
import axios from "axios";
import { execute } from "async-execute";
import { getSafeAppVersion } from "./electronHelpers";
import taskManager from "./taskManager";

initialize("A-EU-2276314363");

// Disable error dialogs by overriding
dialog.showErrorBox = function (title, content) {
    console.log(`${title}\n${content}`);
};

process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
    ? process.env.DIST
    : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

const metricsUpdatesLoop = async (
    callback?: (i: number, outOf: number) => void,
) => {
    const currentUnixTimestamp = dayjs().unix();

    let i = 0;
    for (const collector of collectors) {
        i++;
        // console.info(`[${collector.name}]: ${i}`);
        if (!collector.executionCondition(currentUnixTimestamp)) {
            if (callback) {
                callback.call(this, i, collectors.length);
            }
            continue;
        }

        const res = await collector.collect(app);

        win?.webContents.send(collector.updatesHeapId, res);
        // console.info(
        //   `[NEW] ${collector.name}: ${JSON.stringify(res).substring(0, 50)}`,
        // );

        if (callback) {
            callback.call(this, i, collectors.length);
        }
    }

    await new Promise((r) => setTimeout(r, 1000));
    metricsUpdatesLoop();
};

const setIntervalImmideately = (func: () => void, ms: number) => {
    try {
        func();
        setInterval(func, ms);
    } catch (e) {
        console.error("interval error: " + String(e));
    }
};

function createWindow() {
    win = new BrowserWindow({
        icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
        webPreferences: {
            // nodeIntegration: true,
            preload: path.join(__dirname, "preload.js"),
            // contextIsolation: false
        },
        frame: false,
        width: 900,
        maxWidth: 900,
        height: 620,
        minHeight: 450,
        minWidth: 470,
        title: "Smotrite",
        // transparent: true,
        // backgroundColor: "#00000000",
        // vibrancy: 'light',
        thickFrame: true,

        // backgroundMaterial: 'mica'
    });

    win.webContents.once("dom-ready", async () => {
        trackEvent("app.dom-ready");

        if (
            fs.existsSync(getAppDir() + "/.binaries_ok_" + getSafeAppVersion())
        ) {
            trackEvent("app.loading-binaries-ok");
            win?.webContents.send("setLoadingMessage", `A little more...`);
            metricsUpdatesLoop();
            setTimeout(() => win?.webContents.send("removeLoading"), 500);
            return;
        }

        trackEvent("app.loading-binaries-download");

        // clean cache folder
        fs.readdirSync(getAppDir()).forEach((f) =>
            fs.rmSync(`${getAppDir()}/${f}`),
        );

        try {
            const releaseInfo = await axios.get(
                `https://api.github.com/repos/Lukentui/smotrite-app/releases/tags/${app.isPackaged ? app.getVersion() : "alpha"}`,
            );

            if (
                !releaseInfo.data?.assets?.some(
                    (asset) => asset.name === "binaries.zip.sha256-checksum",
                )
            ) {
                throw new Error(
                    "Release does not include required file: binaries.zip.sha256-checksum",
                );
            }

            if (
                !releaseInfo.data?.assets?.some(
                    (asset) => asset.name === "binaries.zip",
                )
            ) {
                throw new Error(
                    "Release does not include required file: binaries.zip",
                );
            }
        } catch (e) {
            dialog.showMessageBox(win, {
                type: "error",
                buttons: ["OK"],
                title: "Unable to download required binaries!",
                message: `Unable to download required binaries! Version: ${app.isPackaged ? app.getVersion() : "alpha"}. Error: ${String(e)}`,
            });
            win?.webContents.send(
                "setLoadingMessage",
                `Unable to download required binaries!`,
            );
            trackEvent("app.loading-binaries-failed");
            return;
        }

        const downloader = new Downloader({
            url: `https://github.com/Lukentui/smotrite-app/releases/download/${app.isPackaged ? app.getVersion() : "alpha"}/binaries.zip`,
            // url: "https://github.com/Lukentui/smotrite-app/releases/download/alpha/binaries.zip",
            directory: getAppDir(),
            fileName: "binaries.zip",
            onProgress: function (percentage) {
                log.info(`Loading binaries: ${percentage}%`);
                win?.webContents.send(
                    "setLoadingMessage",
                    `Loading binaries: ${percentage}%`,
                );
            },
        });

        try {
            log.info("downloading binaries...");
            await downloader.download();
            log.info("downloaded!");

            win?.webContents.send(
                "setLoadingMessage",
                `Validating checksums...`,
            );
            const downloadedChecksum = await calculateSHA256ByPath(
                getAppDir() + "/binaries.zip",
            );
            // `https://github.com/Lukentui/smotrite-app/releases/download/${app.getVersion()}/binaries.zip.sha256-checksum`,
            const expectedChecksum = (
                await axios.get(
                    // 'https://github.com/Lukentui/smotrite-app/releases/download/alpha/binaries.zip.sha256-checksum'
                    `https://github.com/Lukentui/smotrite-app/releases/download/${app.isPackaged ? app.getVersion() : "alpha"}/binaries.zip.sha256-checksum`,
                )
            ).data.trim();

            log.log(
                `checksums: ${downloadedChecksum.substring(0, 6)}:${expectedChecksum.substring(0, 6)}`,
            );
            if (downloadedChecksum !== expectedChecksum) {
                throw new Error(`Bad binaries checksum: ${downloadedChecksum}`);
            }

            win?.webContents.send(
                "setLoadingMessage",
                `Extracting binaries...`,
            );
            extract(getAppDir() + "/binaries.zip", { dir: getAppDir() });
            win?.webContents.send("setLoadingMessage", `A little more...`);
            metricsUpdatesLoop();
            setTimeout(() => win?.webContents.send("removeLoading"), 1000);
            fs.writeFileSync(
                getAppDir() + "/.binaries_ok_" + getSafeAppVersion(),
                "",
            );
        } catch (error) {
            // todo show error on loading screen
            log.error("Unable to initialize binaries: " + error);
            dialog.showMessageBox(win, {
                type: "error",
                buttons: ["OK"],
                title: "Unable to download required binaries!",
                message: `Unable to download required binaries(post-verify)! Version: ${app.isPackaged ? app.getVersion() : "alpha"}. Error: ${String(error)}`,
            });
            trackEvent("app.loading-binaries-failed");
        }
    });

    if (!app.isPackaged) {
        win.webContents.openDevTools();
    }

    setIntervalImmideately(async () => {
        if (!win.isFocused) return;

        try {
            // todo refactor
            const result = await execute(`"${getAppDir()}/process-list"`);
            win?.webContents.send("processListUpdate", JSON.parse(result));
        } catch {}
    }, 3500);

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
    } else {
        // win.loadFile('dist/index.html')
        win.loadFile(path.join(process.env.DIST, "index.html"));
    }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
        win = null;
    }
});

app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.on("close", () => {
    app.quit();
    trackEvent("app.closed");
});

ipcMain.on("minimize", () => {
    BrowserWindow.getFocusedWindow()?.minimize();
    trackEvent("app.minimize");
});

ipcMain.on("kill-process", async (_, { processId, appId }) => {
    if (typeof processId !== "number") {
        return;
    }

    try {
        await taskManager.killProcess(processId as number)
        trackEvent("feature.process-kill.success");
    } catch (e) {
        trackEvent("feature.process-kill.error", {
            reason: String(e),
        });

        win?.webContents.send("kill-process-error", {
            processId,
            appId,
            error: String(e),
        });
    }
});

ipcMain.on("open-process-path", async (_, { processId }) => {
    if (typeof processId !== "number") {
        return;
    }

    trackEvent("feature.process-path");
    await taskManager.openDirectoryInFinder(
        await taskManager.getProcessDirectory(processId as number)
    )
});

ipcMain.on("settings-button", () => {
    win.webContents.openDevTools();
    trackEvent("feature.settings-button");
});

app.whenReady().then(() => {
    protocol.handle("local-fs", (request) =>
        net.fetch("file://" + request.url.slice("local-fs://".length)),
    );
    trackEvent("app.started");
    return createWindow();
});
