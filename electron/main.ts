import { app, BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import path from 'node:path'
import * as si from 'systeminformation';
require('@electron/remote/main').initialize()
// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')


let win: BrowserWindow | null
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

const setIntervalImmideately = (func: () => void, ms: number) => {
  func()
  setInterval(func, ms)
}


function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    frame: false,
    width: 900,
    maxWidth: 900,
    height: 600,
    minHeight: 450,
    minWidth: 470,
    title: 'Smotrite',
  })

  let updates = {};
const touchUpdate = (e: string) => {
  updates[e] = 1

  if(Object.keys(updates).length >= 6) {
    setTimeout(() => win?.webContents.send('removeLoading'), 500);
  }
}

  // win.webContents.openDevTools();

  setIntervalImmideately(async () => {
    win?.webContents.send('memoryUpdate', await si.mem());
    touchUpdate('memoryUpdate');
  }, 2500)


  setIntervalImmideately(async () => {
    win?.webContents.send('drivesIOUpdate', await si.fsStats());
    touchUpdate('drivesIOUpdate');
  }, 1000)

  setIntervalImmideately(async () => {
    win?.webContents.send('drivesLayoutUpdate', await si.diskLayout());
    touchUpdate('drivesLayoutUpdate');
  }, 5000)

  setIntervalImmideately(async () => {
    win?.webContents.send('cpuUpdate', {
      load: await si.currentLoad(),
      cpu: await si.cpu(),

      ...((await si.currentLoad()).cpus.reduce((prev, curr, i) => {
        return {
          ...prev,
          [`core${i}`]: curr.load.toFixed(2),
        }
      }, {})),
    });
    touchUpdate('cpuUpdate');
  }, 1000)

  setIntervalImmideately(async () => {
    const network = (await si.networkStats());
    if(!network.length) return
    win?.webContents.send('networkUpdate', {
      rx: network[0].rx_sec,
      tx: network[0].tx_sec,
    });
    touchUpdate('networkUpdate');
  }, 500)

  setIntervalImmideately(async () => {
    win?.webContents.send('hwInfoUpdate', {
      os: (await si.osInfo()).codename + ' ' + (await si.osInfo()).release,
      cpu: (await si.cpu()).manufacturer + ' ' + (await si.cpu()).brand,
      gpu: ((await si.graphics())?.controllers[0]?.model) ?? 'unknown',
      memoryBanks: (await si.memLayout()).map(v => v.size/1073741824),
  
      disks: await si.diskLayout(),
      totalSpace: (await si.diskLayout()).map(v => v.size).reduce((prev, curr) => prev + curr, 0) / 1073741824,
    });
    touchUpdate('hwInfoUpdate');
  }, 10000)


  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }
}


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on('close', () => {
  app.quit()
})

ipcMain.on('minimize', () => {
  BrowserWindow.getFocusedWindow()?.minimize();
})

app.whenReady().then(createWindow)
