const { app, BrowserWindow, Menu, Tray } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let tray = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'assets/icons/icon.png'),
  });

  // Load the index.html of the app
  mainWindow.loadFile('index.html');

  // Open DevTools in development
  // mainWindow.webContents.openDevTools();
}

// Create tray icon and context menu
function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/icons/icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => app.quit() }
  ]);

  tray.setToolTip('MCP Web Store');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Handle the protocol (mcpwebstore://)
app.setAsDefaultProtocolClient('mcpwebstore');

// For Windows - handle protocol when app is already running
app.on('second-instance', (event, commandLine) => {
  // Someone tried to run a second instance, we should focus our window
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    
    // Handle protocol url
    const url = commandLine.pop();
    if (url) {
      // TODO: Parse and handle URL
      console.log('Protocol URL:', url);
    }
  }
});

// For macOS - handle protocol when app is not running
app.on('open-url', (event, url) => {
  event.preventDefault();
  // TODO: Parse and handle URL
  console.log('Protocol URL:', url);
}); 