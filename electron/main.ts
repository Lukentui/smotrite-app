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
const https = require('https');
const fs = require('fs');
const extract = require('extract-zip')
import dayjs from 'dayjs'
import collectors from './collectors';

const appDir = app.getPath('appData') + '/pro.nikkitin.smotrite';
initialize("A-EU-2276314363");

// Disable error dialogs by overriding
dialog.showErrorBox = function (title, content) {
  console.log(`${title}\n${content}`);
};

// 

// fs.mkdirSync(appDir, { recursive: true });

// const file = fs.createWriteStream(appDir + '/binaries.zip');
// const request = https.get('https://objects.githubusercontent.com/github-production-release-asset-2e65be/715295812/0e992032-c33f-4d61-a07a-a2065ad621fa?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=releaseassetproduction%2F20240813%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240813T233400Z&X-Amz-Expires=300&X-Amz-Signature=1d6a6e8081101b826236ac4431a68f55d9dcfa369c09b61e4b4c5df7296d079e&X-Amz-SignedHeaders=host&actor_id=17615743&key_id=0&repo_id=715295812&response-content-disposition=attachment%3B%20filename%3Dbinaries.zip&response-content-type=application%2Foctet-stream', function(response) {
//    response.pipe(file);

//    // after download completed close filestream
//    file.on("finish", () => {
//        file.close();
//        extract(appDir + '/binaries.zip', { dir: appDir })
//        console.log("Download Completed");
//    });
// });


process.env.DIST = path.join(__dirname, "../dist");
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, "../public");

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

const metricsUpdatesLoop = async (callback?: (i: number, outOf: number) => void) => {
  const currentUnixTimestamp = dayjs().unix();

  let i = 0;
  for (const collector of collectors) {
    i++;
    console.info(`[${collector.name}]: ${i}`)
    if(!collector.shouldBeExecuted(currentUnixTimestamp)) {
      if(callback) {
        callback.call(this, i, collectors.length)
      }
      continue;
    }

    const res = await collector.collect(app);

    win?.webContents.send(collector.updatesHeapId, res);
    console.info(`[NEW] ${collector.name}: ${JSON.stringify(res).substring(0, 50)}`)

    if(callback) {
      callback.call(this, i, collectors.length)
    }
  }

  await new Promise(r => setTimeout(r, 1000));
  metricsUpdatesLoop();
}

metricsUpdatesLoop()


const setIntervalImmideately = (func: () => void, ms: number) => {
  try {
    func();
    setInterval(func, ms);
  } catch (e) {
    console.error("interval error: " + String(e));
  }
};

function createWindow() {
  console.warn(4, app.getVersion());
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

  // let updates = {};
  const touchUpdate = (e: string) => {
    // updates[e] = 1;

    // win?.webContents.send("setLoadingMessage", "Downloading binaries...")


    // win?.webContents.send("setLoadingMessage", `Collecting metrics ${Object.keys(updates).length}/7`)

    // if (Object.keys(updates).length >= 6) {
    //   setTimeout(() => win?.webContents.send("removeLoading"), 500);
    // }
  };

  // win.webContents.openDevTools();

  // setIntervalImmideately(async () => {
  //   if(!win.isFocused) return;

  //   win?.webContents.send("memoryUpdate", await macMemory());
  //   touchUpdate("memoryUpdate");
  // }, 2500);

  setIntervalImmideately(async () => {
    if(!win.isFocused) return;
    
    exec(
      process.execPath.replace("MacOS/Smotrite", "") + "bin/" + "process-list",
      (error, stdout, stderr) => {
        if (error) {
          return;
        }
        // console.log(`stdout: ${stdout}`);
        // console.error(`stderr: ${stderr}`);

        win?.webContents.send("processListUpdate", JSON.parse(stdout));
      }
    );

    // let {error, stdout, stderr} = await exec();
  }, 3500);

  // setIntervalImmideately(async () => {
  //   if(!win.isFocused) return;
    
  //   exec(
  //     process.execPath.replace("MacOS/Smotrite", "") + "bin/" + "cpu-temp -c",
  //     (error, stdout, stderr) => {
  //       if (error) {
  //         return;
  //       }
  //       // console.log(`stdout: ${stdout}`);
  //       // console.error(`stderr: ${stderr}`);

  //       win?.webContents.send("cpuTemperatureUpdate", { current: stdout + ' °C' });
  //     }
  //   );

  //   // let {error, stdout, stderr} = await exec();
  // }, 3500);

  // setIntervalImmideately(async () => {
  //   if(!win.isFocused) return;
    
  //   exec(
  //     process.execPath.replace("MacOS/Smotrite", "") + "bin/" + "swap-usage",
  //     (error, stdout, stderr) => {
  //       if (error) {
  //         win?.webContents.send("swapUpdate", { current: error });
  //         touchUpdate("swapUpdate");
  //         return;
  //       }
  //       // console.error(`stderr: ${stderr}`);

  //       win?.webContents.send("swapUpdate", { current: Number(stdout ?? 0) });
  //       touchUpdate("swapUpdate");
  //     }
  //   );

  // }, 3500);

  // setIntervalImmideately(async () => {
  //   if(!win.isFocused) return;
    
  //   win?.webContents.send("drivesLayoutUpdate", await si.diskLayout());
  //   touchUpdate("drivesLayoutUpdate");
  // }, 5000);

  setIntervalImmideately(async () => {
    if(!win.isFocused) return;
    
    // win?.webContents.send("drivesIOUpdate", await si.fsStats());
    // touchUpdate("drivesIOUpdate");

    // win?.webContents.send("cpuUpdate", {
    //   load: await si.currentLoad(),
    //   cpu: await si.cpu(),

    //   ...(await si.currentLoad()).cpus.reduce((prev, curr, i) => {
    //     return {
    //       ...prev,
    //       [`core${i}`]: curr.load.toFixed(2),
    //     };
    //   }, {}),
    // });
    // touchUpdate("cpuUpdate");


    // const network = await si.networkStats();
    // if (!network.length) return;
    // win?.webContents.send("networkUpdate", {
    //   rx: network[0].rx_sec,
    //   tx: network[0].tx_sec,
    // });
    // touchUpdate("networkUpdate");
  }, 2000);

  // setIntervalImmideately(async () => {
  //   if(!win.isFocused) return;
    
  //   win?.webContents.send("hwInfoUpdate", {
  //     os: (await si.osInfo()).codename + " " + (await si.osInfo()).release,
  //     cpu: (await si.cpu()).manufacturer + " " + (await si.cpu()).brand,
  //     gpu: (await si.graphics())?.controllers[0]?.model ?? "unknown",
  //     memoryBanks: (await si.memLayout()).map((v) => v.size / 1073741824),
  //     isAppleSilicon: isAppleSilicon(true),
  //     serialNumber: (await si.system()).serial,

  //     disks: await si.diskLayout(),
  //     totalSpace:
  //       (await si.diskLayout())
  //         .map((v) => v.size)
  //         .reduce((prev, curr) => prev + curr, 0) / 1073741824,
  //   });
  //   touchUpdate("hwInfoUpdate");
  // }, 100000);

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
  trackEvent("app.minimize");
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
