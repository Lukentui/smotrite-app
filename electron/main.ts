import {
  app,
  BrowserWindow,
  ipcMain,
  ipcRenderer,
  net,
  protocol,
  dialog,
} from "electron";
import path from "node:path";
import * as si from "systeminformation";
require("@electron/remote/main").initialize();
const { exec } = require("node:child_process");
import macMemory from "mac-memory-ts";
import { initialize, trackEvent } from "@aptabase/electron/main";
import {isAppleSilicon} from 'is-apple-silicon';

initialize("A-EU-2276314363");

// Disable error dialogs by overriding
dialog.showErrorBox = function (title, content) {
  console.log(`${title}\n${content}`);
};

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

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
    height: 600,
    minHeight: 450,
    minWidth: 470,
    title: "Smotrite",
    // transparent: true,
    // backgroundColor: "#00000000",
    // vibrancy: 'light',
    thickFrame: true,
    // backgroundMaterial: 'mica'
  });

  let updates = {};
  const touchUpdate = (e: string) => {
    updates[e] = 1;

    if (Object.keys(updates).length >= 6) {
      setTimeout(() => win?.webContents.send("removeLoading"), 500);
    }
  };

  // win.webContents.openDevTools();

  setIntervalImmideately(async () => {
    win?.webContents.send("memoryUpdate", await macMemory());
    touchUpdate("memoryUpdate");
  }, 2500);

  setIntervalImmideately(async () => {
    exec(
      process.execPath.replace("MacOS/Smotrite", "") + "bin/" + "process-list",
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        // console.log(`stdout: ${stdout}`);
        // console.error(`stderr: ${stderr}`);

        win?.webContents.send("processListUpdate", JSON.parse(stdout));
      }
    );

    // let {error, stdout, stderr} = await exec();
  }, 3500);

  setIntervalImmideately(async () => {
    console.info(__dirname);
    exec(
      process.execPath.replace("MacOS/Smotrite", "") + "bin/" + "cpu-temp",
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        // console.log(`stdout: ${stdout}`);
        // console.error(`stderr: ${stderr}`);

        win?.webContents.send("cpuTemperatureUpdate", { current: stdout });
      }
    );

    // let {error, stdout, stderr} = await exec();
  }, 3500);

  setIntervalImmideately(async () => {
    win?.webContents.send("drivesIOUpdate", await si.fsStats());
    touchUpdate("drivesIOUpdate");
  }, 1000);

  setIntervalImmideately(async () => {
    win?.webContents.send("drivesLayoutUpdate", await si.diskLayout());
    touchUpdate("drivesLayoutUpdate");
  }, 5000);

  setIntervalImmideately(async () => {
    win?.webContents.send("cpuUpdate", {
      load: await si.currentLoad(),
      cpu: await si.cpu(),

      ...(await si.currentLoad()).cpus.reduce((prev, curr, i) => {
        return {
          ...prev,
          [`core${i}`]: curr.load.toFixed(2),
        };
      }, {}),
    });
    touchUpdate("cpuUpdate");
  }, 1000);

  setIntervalImmideately(async () => {
    const network = await si.networkStats();
    if (!network.length) return;
    win?.webContents.send("networkUpdate", {
      rx: network[0].rx_sec,
      tx: network[0].tx_sec,
    });
    touchUpdate("networkUpdate");
  }, 500);

  setIntervalImmideately(async () => {
    win?.webContents.send("hwInfoUpdate", {
      os: (await si.osInfo()).codename + " " + (await si.osInfo()).release,
      cpu: (await si.cpu()).manufacturer + " " + (await si.cpu()).brand,
      gpu: (await si.graphics())?.controllers[0]?.model ?? "unknown",
      memoryBanks: (await si.memLayout()).map((v) => v.size / 1073741824),
      isAppleSilicon: isAppleSilicon(true),
      serialNumber: (await si.system()).serial,

      disks: await si.diskLayout(),
      totalSpace:
        (await si.diskLayout())
          .map((v) => v.size)
          .reduce((prev, curr) => prev + curr, 0) / 1073741824,
    });
    touchUpdate("hwInfoUpdate");
  }, 10000);

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

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
});

ipcMain.on("kill-process", (_, { processId, appId }) => {
  if (typeof processId !== "number") {
    return;
  }

  exec(`kill -9 ${processId}`, (error, stdout, stderr) => {
    if (error) {
      setTimeout(() => {
        win?.webContents.send("kill-process-error", {
          processId,
          appId,
          error: stderr,
        });
        console.info(error, stderr);
      }, 1500);
      return;
    }
  });

  trackEvent("feature.process-kill");
});

ipcMain.on("open-process-path", (_, { processId }) => {
  if (typeof processId !== "number") {
    return;
  }

  exec(
    `/usr/bin/open $(dirname $(ps -o comm= -p ${processId}))`,
    (error, stdout, stderr) => {
      console.info(error);
    }
  );

  trackEvent("feature.process-path");
});

ipcMain.on("settings-button", () => {
  win.webContents.openDevTools();
  trackEvent("feature.settings-button");
});

app.whenReady().then(() => {
  protocol.handle("local-fs", (request) =>
    net.fetch("file://" + request.url.slice("local-fs://".length))
  );
  trackEvent("app.started");
  return createWindow();
});
