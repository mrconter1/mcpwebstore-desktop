const { app, BrowserWindow, Menu, Tray, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let tray = null;

// Create user data directory for MCPs
const USER_DATA_DIR = path.join(app.getPath('userData'), 'mcps');
if (!fs.existsSync(USER_DATA_DIR)) {
  fs.mkdirSync(USER_DATA_DIR, { recursive: true });
}

// Base URL for API (local dev server)
const API_BASE_URL = 'http://localhost:3000/api';

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true, // Enable webview tag
    },
    icon: path.join(__dirname, 'assets/icons/icon.png'),
  });

  // Allow CORS for local development
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['Origin'] = 'http://localhost:3000';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  // Load the index.html of the app
  mainWindow.loadFile('index.html');

  // Open DevTools in development for debugging
  // mainWindow.webContents.openDevTools();
}

// Create tray icon and context menu
function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/icons/icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show MCP Desktop', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);

  tray.setToolTip('MCP Web Store Desktop');
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

// Handle IPC messages for MCP operations
// Get installed MCPs
ipcMain.handle('get-installed-mcps', async () => {
  try {
    const dataPath = path.join(USER_DATA_DIR, 'installed.json');
    
    if (!fs.existsSync(dataPath)) {
      return [];
    }
    
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (error) {
    console.error('Error reading installed MCPs:', error);
    return [];
  }
});

// Install MCP
ipcMain.handle('install-mcp', async (event, mcpData) => {
  try {
    console.log(`Installing MCP: ${mcpData.name}`);
    
    // This is where you would implement the actual installation logic
    // For now, we'll just save the MCP info to a file
    
    const dataPath = path.join(USER_DATA_DIR, 'installed.json');
    let installedMCPs = [];
    
    if (fs.existsSync(dataPath)) {
      installedMCPs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    }
    
    // Check if already installed
    const existingIndex = installedMCPs.findIndex(mcp => mcp.slug === mcpData.slug);
    
    if (existingIndex >= 0) {
      installedMCPs[existingIndex] = mcpData;
    } else {
      installedMCPs.push(mcpData);
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(installedMCPs, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Installation failed:', error);
    return { success: false, error: error.message };
  }
});

// Start MCP
ipcMain.handle('start-mcp', async (event, slug) => {
  try {
    console.log(`Starting MCP: ${slug}`);
    
    // Update the MCP status in the installed list
    const dataPath = path.join(USER_DATA_DIR, 'installed.json');
    
    if (fs.existsSync(dataPath)) {
      const installedMCPs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const mcpIndex = installedMCPs.findIndex(mcp => mcp.slug === slug);
      
      if (mcpIndex >= 0) {
        installedMCPs[mcpIndex].status = 'running';
        fs.writeFileSync(dataPath, JSON.stringify(installedMCPs, null, 2));
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to start MCP ${slug}:`, error);
    return { success: false, error: error.message };
  }
});

// Stop MCP
ipcMain.handle('stop-mcp', async (event, slug) => {
  try {
    console.log(`Stopping MCP: ${slug}`);
    
    // Update the MCP status in the installed list
    const dataPath = path.join(USER_DATA_DIR, 'installed.json');
    
    if (fs.existsSync(dataPath)) {
      const installedMCPs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const mcpIndex = installedMCPs.findIndex(mcp => mcp.slug === slug);
      
      if (mcpIndex >= 0) {
        installedMCPs[mcpIndex].status = 'stopped';
        fs.writeFileSync(dataPath, JSON.stringify(installedMCPs, null, 2));
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Failed to stop MCP ${slug}:`, error);
    return { success: false, error: error.message };
  }
});

// Uninstall MCP
ipcMain.handle('uninstall-mcp', async (event, slug) => {
  try {
    console.log(`Uninstalling MCP: ${slug}`);
    
    const dataPath = path.join(USER_DATA_DIR, 'installed.json');
    
    if (fs.existsSync(dataPath)) {
      let installedMCPs = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      installedMCPs = installedMCPs.filter(mcp => mcp.slug !== slug);
      fs.writeFileSync(dataPath, JSON.stringify(installedMCPs, null, 2));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Uninstallation failed:', error);
    return { success: false, error: error.message };
  }
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
      // Parse and handle URL
      console.log('Protocol URL:', url);
      handleProtocolUrl(url);
    }
  }
});

// For macOS - handle protocol when app is not running
app.on('open-url', (event, url) => {
  event.preventDefault();
  // Parse and handle URL
  console.log('Protocol URL:', url);
  handleProtocolUrl(url);
});

// Handle protocol URLs
function handleProtocolUrl(url) {
  // Check if it's a valid protocol URL
  if (url && url.startsWith('mcpwebstore://')) {
    try {
      // Extract the command and parameters
      const urlObj = new URL(url);
      const command = urlObj.hostname;
      const params = Object.fromEntries(urlObj.searchParams);
      
      // Handle different commands
      switch (command) {
        case 'install':
          if (params.slug) {
            console.log(`Installing MCP: ${params.slug}`);
            // Add to installation queue
            if (mainWindow) {
              mainWindow.webContents.executeJavaScript(`
                const queue = JSON.parse(localStorage.getItem('mcpInstallQueue') || '[]');
                if (!queue.includes('${params.slug}')) {
                  queue.push('${params.slug}');
                  localStorage.setItem('mcpInstallQueue', JSON.stringify(queue));
                  console.log('Added to installation queue:', '${params.slug}');
                  
                  // Update UI if needed
                  if (typeof updateQueueCount === 'function') {
                    updateQueueCount();
                  }
                }
              `);
            }
          }
          break;
          
        default:
          console.log(`Unknown protocol command: ${command}`);
      }
    } catch (error) {
      console.error('Failed to parse protocol URL:', error);
    }
  }
} 