const { app, BrowserWindow } = require("electron");
const ipc = require('electron').ipcMain
const path = require("path");

let mainWindow;
let printWindow;

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
  
  // Remove the menu
  mainWindow.removeMenu()

  mainWindow.loadFile(path.join(__dirname, '/pages/home/index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", function() {
    mainWindow = null;
  });

  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.show();
  })

  printWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    }
  })

  printWindow.loadFile(path.join(__dirname, '/pages/print/index.html'))
}

app.on('ready', createWindow);
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