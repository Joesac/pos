const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

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
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== "darwin") app.quit();
})
app.on('activate', () => {
    if (mainWindow === null) createWindow()
})
