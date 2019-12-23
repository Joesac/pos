const { app, BrowserWindow } = require("electron");
const ipc = require('electron').ipcMain
const path = require("path");
const menu = require("electron").Menu

let mainWindow
let printWindow
let splashScreenWin

function createWindow() {
  mainWindow = new BrowserWindow({
    minWidth: 1000,
    minHeight: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // Maximize Main Wiindow
  mainWindow.maximize();

  mainWindow.loadFile(path.join(__dirname, '/pages/home/index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", function() {
    mainWindow = null
    if (printWindow) {
      printWindow.close()
    }
  });

  mainWindow.webContents.once('did-finish-load', () => {
    if (splashScreenWin) splashScreenWin.close()
      mainWindow.show();
  })

  printWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  printWindow.loadFile(path.join(__dirname, '/pages/print/index.html'))
}

function createSplashScreen() {
  splashScreenWin = new BrowserWindow({
    width: 450,
    height: 250,
    center: true,
    frame: false,
    show: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  })
  
  splashScreenWin.loadFile('./pages/splashscreen/index.html')
  splashScreenWin.setSkipTaskbar(true)
  splashScreenWin.on('closed', () => splashScreenWin = null)
  splashScreenWin.webContents.once('did-finish-load', () => {
    splashScreenWin.show()
  })
}

app.on('ready', () => {
  createSplashScreen()
  setTimeout(() =>
    createWindow(),
  2000)
  menu.setApplicationMenu(null)
});
app.on('window-all-closed', () => {
    if (process.platform !== "darwin") app.quit();
})
app.on('activate', () => {
    if (mainWindow === null) createWindow()
})

ipc.on('prepare-receipt-print', (evt, data) => {
  printWindow.webContents.send('print-automatically', data)
})

ipc.on('begin-print', (evt, data) => {
  const win = BrowserWindow.fromWebContents(evt.sender)
  win.webContents.print({silent: true})
})

ipc.on('isLoggedIn', (evt) => {
  evt.sender.send('isLoggedInBoolean')
})