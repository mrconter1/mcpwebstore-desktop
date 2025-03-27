// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose functions to the renderer process
contextBridge.exposeInMainWorld('mcpDesktop', {
  // Get list of installed MCPs
  getInstalledMCPs: async () => {
    return ipcRenderer.invoke('get-installed-mcps');
  },
  
  // Install a new MCP
  installMCP: async (mcpData) => {
    return ipcRenderer.invoke('install-mcp', mcpData);
  },
  
  // Start an MCP
  startMCP: async (slug) => {
    return ipcRenderer.invoke('start-mcp', slug);
  },
  
  // Stop an MCP
  stopMCP: async (slug) => {
    return ipcRenderer.invoke('stop-mcp', slug);
  },
  
  // Uninstall an MCP
  uninstallMCP: async (slug) => {
    return ipcRenderer.invoke('uninstall-mcp', slug);
  },
  
  // Fetch MCP data from API
  fetchMCPData: async (slug) => {
    try {
      const response = await fetch(`http://localhost:3000/api/mcp/${slug}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch MCP data (${slug}):`, error);
      throw error;
    }
  },
  
  // Fetch all MCPs from API
  fetchAllMCPs: async () => {
    try {
      const response = await fetch('http://localhost:3000/api/mcps');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch MCPs:', error);
      throw error;
    }
  }
}); 