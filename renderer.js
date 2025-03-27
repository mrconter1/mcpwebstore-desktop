// DOM Elements
const storeWebview = document.getElementById('store-webview');
const refreshBtn = document.getElementById('refresh-installed-btn');
const noMcpsMessage = document.getElementById('no-mcps-message');
const installedMcpsList = document.getElementById('installed-mcps-list');
const mcpDetailModal = document.getElementById('mcp-detail-modal');
const modalContent = document.getElementById('modal-content');
const closeModalBtn = document.getElementById('close-modal');

// Tab switching
function openTab(tabId, event) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Deactivate all tab buttons
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  
  // Show the selected tab
  document.getElementById(tabId).classList.add('active');
  
  // Activate the clicked button
  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  } else {
    const activeButton = document.querySelector(`.tab-button[onclick*="${tabId}"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    }
  }
  
  // If switching to installed tab, refresh the list
  if (tabId === 'installed-tab') {
    refreshInstalledMCPs();
  }
}

// Show a notification
function showNotification(message, type = 'success') {
  // Create notification element from template
  const template = document.getElementById('notification-template');
  const notification = template.cloneNode(true);
  notification.id = '';
  notification.classList.add(type);
  notification.style.display = 'block';
  
  // Set message
  notification.querySelector('.notification-message').textContent = message;
  
  // Add to document
  document.body.appendChild(notification);
  
  // Remove after a few seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 500);
  }, 3000);
}

// Create an MCP card element for the installed list
function createMCPCard(mcp) {
  const card = document.createElement('div');
  card.className = 'mcp-card';
  card.id = `mcp-${mcp.slug}`;
  
  // Get initials for icon
  const initials = mcp.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  // Status indicator
  const statusLabel = mcp.status === 'running' ? 'Running' : 'Stopped';
  const statusClass = mcp.status === 'running' ? 'running' : 'stopped';
  
  // Card header with icon and name
  const header = document.createElement('div');
  header.className = 'mcp-header';
  
  const icon = document.createElement('div');
  icon.className = 'mcp-icon';
  icon.textContent = initials;
  
  const nameElement = document.createElement('div');
  nameElement.className = 'mcp-name';
  nameElement.innerHTML = `
    ${mcp.name}
    <span class="mcp-status ${statusClass}">${statusLabel}</span>
  `;
  
  header.appendChild(icon);
  header.appendChild(nameElement);
  
  // Description
  const description = document.createElement('div');
  description.className = 'mcp-description';
  description.textContent = mcp.description || 'No description available';
  
  // Meta info (author, category, etc)
  const meta = document.createElement('div');
  meta.className = 'mcp-meta';
  
  if (mcp.author) {
    const authorSpan = document.createElement('span');
    authorSpan.textContent = `Author: ${mcp.author}`;
    meta.appendChild(authorSpan);
  }
  
  if (mcp.category) {
    const categorySpan = document.createElement('span');
    categorySpan.className = 'mcp-category';
    categorySpan.textContent = mcp.category;
    meta.appendChild(categorySpan);
  }
  
  // Controls
  const controls = document.createElement('div');
  controls.className = 'mcp-controls';
  
  // Start/Stop button
  if (mcp.status !== 'running') {
    const startButton = document.createElement('button');
    startButton.className = 'start';
    startButton.textContent = 'Start';
    startButton.addEventListener('click', () => startMCP(mcp.slug));
    controls.appendChild(startButton);
  } else {
    const stopButton = document.createElement('button');
    stopButton.className = 'stop';
    stopButton.textContent = 'Stop';
    stopButton.addEventListener('click', () => stopMCP(mcp.slug));
    controls.appendChild(stopButton);
  }
  
  // Uninstall button
  const uninstallButton = document.createElement('button');
  uninstallButton.className = 'uninstall';
  uninstallButton.textContent = 'Uninstall';
  uninstallButton.addEventListener('click', () => {
    if (confirm(`Are you sure you want to uninstall ${mcp.name}?`)) {
      uninstallMCP(mcp.slug);
    }
  });
  controls.appendChild(uninstallButton);
  
  // Assemble the card
  card.appendChild(header);
  card.appendChild(description);
  if (meta.children.length > 0) {
    card.appendChild(meta);
  }
  card.appendChild(controls);
  
  return card;
}

// Refresh the list of installed MCPs
async function refreshInstalledMCPs() {
  try {
    const installedMCPs = await window.mcpDesktop.getInstalledMCPs();
    
    if (installedMCPs.length === 0) {
      noMcpsMessage.style.display = 'block';
      installedMcpsList.innerHTML = '';
      return;
    }
    
    noMcpsMessage.style.display = 'none';
    installedMcpsList.innerHTML = '';
    
    installedMCPs.forEach(mcp => {
      const card = createMCPCard(mcp);
      installedMcpsList.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to refresh MCPs:', error);
    showNotification('Failed to load installed MCPs', 'error');
  }
}

// Handle MCP Start
async function startMCP(slug) {
  try {
    const result = await window.mcpDesktop.startMCP(slug);
    
    if (result.success) {
      showNotification(`Started MCP: ${slug}`);
      refreshInstalledMCPs();
    } else {
      throw new Error(result.error || 'Failed to start MCP');
    }
  } catch (error) {
    console.error(`Failed to start MCP ${slug}:`, error);
    showNotification(`Failed to start MCP: ${error.message}`, 'error');
  }
}

// Handle MCP Stop
async function stopMCP(slug) {
  try {
    const result = await window.mcpDesktop.stopMCP(slug);
    
    if (result.success) {
      showNotification(`Stopped MCP: ${slug}`);
      refreshInstalledMCPs();
    } else {
      throw new Error(result.error || 'Failed to stop MCP');
    }
  } catch (error) {
    console.error(`Failed to stop MCP ${slug}:`, error);
    showNotification(`Failed to stop MCP: ${error.message}`, 'error');
  }
}

// Handle MCP Uninstall
async function uninstallMCP(slug) {
  try {
    const result = await window.mcpDesktop.uninstallMCP(slug);
    
    if (result.success) {
      showNotification(`Uninstalled MCP: ${slug}`);
      refreshInstalledMCPs();
    } else {
      throw new Error(result.error || 'Failed to uninstall MCP');
    }
  } catch (error) {
    console.error(`Failed to uninstall MCP ${slug}:`, error);
    showNotification(`Failed to uninstall MCP: ${error.message}`, 'error');
  }
}

// Initialize the app when document is ready
document.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshInstalledMCPs);
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      mcpDetailModal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === mcpDetailModal) {
      mcpDetailModal.style.display = 'none';
    }
  });
  
  // Set up alternative tab switching (in case onclick attributes aren't working)
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Extract the tab ID from the onclick attribute
      const onclickAttr = this.getAttribute('onclick') || '';
      const match = onclickAttr.match(/openTab\('([^']+)'/) || [];
      
      if (match[1]) {
        console.log('Tab clicked via event listener:', match[1]);
        openTab(match[1], e);
      }
    });
  });
  
  // Debug info
  console.log('Tabs found:', document.querySelectorAll('.tab-button').length);
  console.log('Tab contents found:', document.querySelectorAll('.tab-content').length);
  
  // Set up webview event listeners
  if (storeWebview) {
    storeWebview.addEventListener('dom-ready', () => {
      console.log('Webview loaded');
      
      // Inject code to intercept install button clicks
      storeWebview.executeJavaScript(`
        // Flag to indicate we're running in the desktop app
        window.isInDesktopApp = true;
        console.log('Desktop app integration enabled');
        
        // Function to extract the MCP slug from the URL or data attribute
        function getMcpSlugFromUrl() {
          const pathSegments = window.location.pathname.split('/');
          // Find a segment that looks like a slug (no special characters)
          for (const segment of pathSegments) {
            if (segment && /^[a-z0-9-]+$/.test(segment)) {
              return segment;
            }
          }
          return null;
        }
        
        // Intercept clicks on install buttons
        document.addEventListener('click', async (event) => {
          // Look for elements with install-related classes or attributes
          const target = event.target.closest('button[data-action="install"], .install-button, [data-slug]');
          
          if (target) {
            console.log('Install button clicked:', target);
            event.preventDefault();
            event.stopPropagation();
            
            let slug = target.getAttribute('data-slug');
            
            // If no slug attribute, try to get it from the URL
            if (!slug) {
              slug = getMcpSlugFromUrl();
            }
            
            if (!slug) {
              console.error('Could not determine MCP slug for installation');
              alert('Could not determine which MCP to install. Please try again.');
              return;
            }
            
            try {
              console.log('Installing MCP with slug:', slug);
              // Fetch MCP data from API
              const response = await fetch('/api/mcp/' + slug);
              if (!response.ok) {
                throw new Error('Failed to fetch MCP data: ' + response.statusText);
              }
              
              const mcpData = await response.json();
              console.log('MCP data retrieved:', mcpData);
              
              // Add status property for the desktop app
              mcpData.status = 'stopped';
              
              // Tell desktop app to install this MCP
              const result = await window.mcpDesktop.installMCP(mcpData);
              
              if (result.success) {
                alert('MCP installed successfully! Switch to the Installed MCPs tab to manage it.');
              } else {
                throw new Error(result.error || 'Installation failed');
              }
            } catch (error) {
              console.error('Installation error:', error);
              alert('Failed to install MCP: ' + error.message);
            }
          }
        });
      `).catch(err => {
        console.error('Failed to inject script into webview:', err);
      });
    });
    
    storeWebview.addEventListener('did-fail-load', (event) => {
      console.error('Webview failed to load:', event);
      storeWebview.innerHTML = `
        <div style="padding: 20px; text-align: center;">
          <h2>Failed to load MCP Store</h2>
          <p>Make sure the web server is running at http://localhost:3000</p>
          <button onclick="location.reload()">Retry</button>
        </div>
      `;
    });
  }
  
  // Initial load of installed MCPs
  refreshInstalledMCPs();
}); 