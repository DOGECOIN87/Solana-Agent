/**
 * Solana AI Agent Dashboard - Main Application
 */
import { initDashboard } from './js/dashboard.js';
import { initWallet } from './js/wallet.js';
import { initSwap } from './js/swap.js';
import { initAssistant } from './js/assistant.js';
import { initAnalytics } from './js/analytics.js';

// Application state
const appState = {
  defaultPanel: 'dashboard',
  currentPanel: null,
  isDarkMode: true,
  panels: [
    {
      id: 'dashboard',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
      `,
      label: 'Dashboard',
      init: initDashboard
    },
    {
      id: 'wallet',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      `,
      label: 'Wallet',
      init: initWallet
    },
    {
      id: 'swap',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="17 1 21 5 17 9"></polyline>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
          <polyline points="7 23 3 19 7 15"></polyline>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
        </svg>
      `,
      label: 'Swap',
      init: initSwap
    },
    {
      id: 'analytics',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="20" x2="18" y2="10"></line>
          <line x1="12" y1="20" x2="12" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="14"></line>
          <line x1="3" y1="20" x2="21" y2="20"></line>
        </svg>
      `,
      label: 'Analytics',
      init: initAnalytics
    },
    {
      id: 'assistant',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `,
      label: 'AI Assistant',
      init: initAssistant
    },
    {
      id: 'tokens',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      `,
      label: 'Tokens',
      init: null
    }
  ]
};

/**
 * Initialize the application
 */
function initApp() {
  // Setup navigation
  setupNavigation();
  
  // Setup theme toggle
  setupThemeToggle();
  
  // Setup collapse sidebar button
  setupSidebarCollapse();
  
  // Initialize all modules at startup
  appState.panels.forEach(panel => {
    if (typeof panel.init === 'function') {
      try {
        panel.init();
      } catch (error) {
        console.error(`Error initializing ${panel.id} panel:`, error);
      }
    }
  });
  
  // Show default panel
  showPanel(appState.defaultPanel);
  
  // Apply theme
  applyTheme(appState.isDarkMode);
  
  console.log('Solana AI Agent Dashboard initialized');
}

/**
 * Setup navigation between panels
 */
function setupNavigation() {
  // Add navigation items to sidebar
  const sidebar = document.querySelector('.sidebar-nav');
  
  if (sidebar) {
    appState.panels.forEach(panel => {
      const navItem = document.createElement('div');
      navItem.className = 'nav-item';
      navItem.dataset.panel = panel.id;
      navItem.innerHTML = `
        <div class="nav-icon">${panel.icon}</div>
        <div class="nav-label">${panel.label}</div>
      `;
      
      navItem.addEventListener('click', () => showPanel(panel.id));
      
      sidebar.appendChild(navItem);
    });
  }
}

/**
 * Show specific panel
 * @param {string} panelId - ID of panel to show
 */
function showPanel(panelId) {
  // If already showing this panel, do nothing
  if (appState.currentPanel === panelId) return;
  
  // Store current panel ID
  appState.currentPanel = panelId;
  
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.dataset.panel === panelId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Show selected panel, hide others
  document.querySelectorAll('.panel').forEach(panel => {
    if (panel.classList.contains(`${panelId}-panel`)) {
      panel.classList.add('active');
    } else {
      panel.classList.remove('active');
    }
  });
  
  // Update panel specific UI if needed
  const panel = appState.panels.find(p => p.id === panelId);
  if (panel && panel.update) {
    try {
      panel.update();
    } catch (error) {
      console.error(`Error updating ${panel.id} panel:`, error);
    }
  }
}

/**
 * Setup theme toggle button
 */
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const connectWalletBtn = document.getElementById('connect-wallet-btn');
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      appState.isDarkMode = !appState.isDarkMode;
      applyTheme(appState.isDarkMode);
    });
  }
}

function copyWalletAddress() {
  const walletAddress = document.getElementById('displayed-wallet-address');
  if (walletAddress) {
    navigator.clipboard.writeText(walletAddress.textContent)
      .then(() => showSuccessMessage('Wallet address copied to clipboard'))
      .catch(err => showErrorMessage('Failed to copy wallet address'));
  }
}

/**
 * Apply theme based on dark mode setting
 * @param {boolean} isDarkMode - Whether to use dark mode
 */
function applyTheme(isDarkMode) {
  const root = document.documentElement;
  
  if (isDarkMode) {
    root.classList.add('dark-mode');
    root.classList.remove('light-mode');
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      `;
    }
  } else {
    root.classList.add('light-mode');
    root.classList.remove('dark-mode');
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      `;
    }
  }
}

/**
 * Setup sidebar collapse functionality
 */
function setupSidebarCollapse() {
  const collapseBtn = document.getElementById('collapse-sidebar');
  const app = document.querySelector('.app-container');
  
  if (collapseBtn && app) {
    collapseBtn.addEventListener('click', () => {
      app.classList.toggle('sidebar-collapsed');
      
      // Update collapse button icon
      if (app.classList.contains('sidebar-collapsed')) {
        collapseBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="13 17 18 12 13 7"></polyline>
            <polyline points="6 17 11 12 6 7"></polyline>
          </svg>
        `;
      } else {
        collapseBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        `;
      }
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
