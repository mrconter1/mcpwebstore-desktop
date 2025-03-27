// Sample data (this would eventually come from local storage or a database)
const sampleMcps = [
  {
    id: 'mcp-1',
    name: 'Sample MCP 1',
    description: 'This is a sample MCP for demonstration',
    version: '1.0.0',
    isRunning: true
  },
  {
    id: 'mcp-2',
    name: 'Sample MCP 2',
    description: 'Another sample MCP for demonstration',
    version: '0.9.0',
    isRunning: false
  }
];

// DOM Elements
const mcpItemsContainer = document.getElementById('mcp-items-container');
const emptyState = document.querySelector('.empty-state');

// Function to render MCP items
function renderMcpList(mcps) {
  if (!mcps || mcps.length === 0) {
    emptyState.style.display = 'block';
    mcpItemsContainer.innerHTML = '';
    return;
  }

  emptyState.style.display = 'none';
  mcpItemsContainer.innerHTML = '';

  mcps.forEach(mcp => {
    const mcpItem = document.createElement('div');
    mcpItem.className = 'mcp-item';
    mcpItem.id = mcp.id;

    // Get initials for icon
    const initials = mcp.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    mcpItem.innerHTML = `
      <div class="mcp-icon">${initials}</div>
      <div class="mcp-details">
        <div class="mcp-name">${mcp.name} <span class="mcp-version">v${mcp.version}</span></div>
        <div class="mcp-description">${mcp.description}</div>
      </div>
      <div class="mcp-actions">
        <button class="${mcp.isRunning ? 'secondary' : 'primary'}" data-action="${mcp.isRunning ? 'stop' : 'start'}">
          ${mcp.isRunning ? 'Stop' : 'Start'}
        </button>
        <button class="secondary" data-action="uninstall">Uninstall</button>
      </div>
    `;

    // Add event listeners to buttons
    mcpItem.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.getAttribute('data-action');
        handleMcpAction(mcp.id, action);
      });
    });

    mcpItemsContainer.appendChild(mcpItem);
  });
}

// Function to handle MCP actions
function handleMcpAction(mcpId, action) {
  switch (action) {
    case 'start':
      // Placeholder: In a real app, this would send a message to the main process
      console.log(`Starting MCP ${mcpId}`);
      // Update UI
      updateMcpStatus(mcpId, true);
      break;
    case 'stop':
      console.log(`Stopping MCP ${mcpId}`);
      // Update UI
      updateMcpStatus(mcpId, false);
      break;
    case 'uninstall':
      console.log(`Uninstalling MCP ${mcpId}`);
      // Update UI (remove from list)
      removeMcpFromList(mcpId);
      break;
  }
}

// Update MCP running status in UI
function updateMcpStatus(mcpId, isRunning) {
  const mcpItem = document.getElementById(mcpId);
  if (!mcpItem) return;

  const button = mcpItem.querySelector(`button[data-action="${isRunning ? 'stop' : 'start'}"]`);
  if (button) {
    button.setAttribute('data-action', isRunning ? 'stop' : 'start');
    button.textContent = isRunning ? 'Stop' : 'Start';
    button.className = isRunning ? 'secondary' : 'primary';
  }
}

// Remove MCP from UI list
function removeMcpFromList(mcpId) {
  const mcpItem = document.getElementById(mcpId);
  if (!mcpItem) return;

  mcpItem.remove();
  
  // Check if list is now empty
  if (mcpItemsContainer.children.length === 0) {
    emptyState.style.display = 'block';
  }
}

// Initialize the app
function initApp() {
  // In a real app, we'd fetch the installed MCPs from storage
  // For demo, we'll use sample data
  renderMcpList(sampleMcps);
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp); 