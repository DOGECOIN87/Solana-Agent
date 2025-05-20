/**
 * Solana AI Agent Dashboard - Wallet Module
 */
import { formatAddress, showSuccessMessage, showErrorMessage } from './utils.js';

// Wallet state
let currentWallet = null;
let solBalance = 0;
let tokenBalances = [];

/**
 * Initialize wallet module
 */
export function initWallet() {
  setupWalletListeners();
  checkWalletConnection();
}

/**
 * Setup wallet event listeners
 */
function setupWalletListeners() {
  // Connect wallet button
  document.getElementById('connect-wallet-btn').addEventListener('click', connectWallet);
  
  // Disconnect wallet button (in user menu)
  document.getElementById('disconnect-wallet').addEventListener('click', disconnectWallet);
  
  // Wallet dropdown in header
  const walletDisplay = document.querySelector('.wallet-display');
  if (walletDisplay) {
    walletDisplay.addEventListener('click', toggleWalletMenu);
  }
  
  // Close wallet menu when clicking outside
  document.addEventListener('click', function(event) {
    const walletMenu = document.querySelector('.wallet-menu');
    const walletDisplay = document.querySelector('.wallet-display');
    
    if (walletMenu && walletMenu.classList.contains('active') && 
        !walletMenu.contains(event.target) && 
        !walletDisplay.contains(event.target)) {
      walletMenu.classList.remove('active');
    }
  });
}

/**
 * Toggle wallet dropdown menu
 */
function toggleWalletMenu(event) {
  event.stopPropagation();
  const walletMenu = document.querySelector('.wallet-menu');
  walletMenu.classList.toggle('active');
}

/**
 * Check if wallet is already connected (e.g. from browser storage)
 */
async function checkWalletConnection() {
  try {
    // In production, this would check if a wallet is already connected
    // For demo purposes, we'll simulate no initial connection
    updateWalletUI(null);
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    updateWalletUI(null);
  }
}

/**
 * Connect to wallet
 */
async function connectWallet() {
  try {
    // Check if Phantom wallet is installed
    if (!window.solana || !window.solana.isPhantom) {
      showErrorMessage('Phantom wallet extension not found. Please install it first.');
      window.open('https://phantom.app/', '_blank');
      return;
    }
    
    // In a real implementation, this would connect to the actual wallet
    // For demo purposes, we'll simulate a successful connection
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simulate a wallet connection
    const address = 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH';
    
    // Set current wallet
    currentWallet = {
      address,
      displayName: formatAddress(address),
      provider: 'phantom'
    };
    
    // Update UI
    updateWalletUI(currentWallet);
    
    // Show success message
    showSuccessMessage('Wallet connected successfully');
    
    // Load wallet data
    await loadWalletData();
    
    // Update wallet panel if active
    if (document.querySelector('.wallet-panel.active')) {
      updateWalletPanel();
    }
    
  } catch (error) {
    console.error('Error connecting wallet:', error);
    showErrorMessage('Failed to connect wallet. Please try again.');
  }
}

/**
 * Disconnect wallet
 */
function disconnectWallet() {
  // Clear wallet data
  currentWallet = null;
  solBalance = 0;
  tokenBalances = [];
  
  // Update UI
  updateWalletUI(null);
  
  // Close wallet menu
  document.querySelector('.wallet-menu').classList.remove('active');
  
  // Show success message
  showSuccessMessage('Wallet disconnected');
  
  // Update wallet panel if active
  if (document.querySelector('.wallet-panel.active')) {
    updateWalletPanel();
  }
}

/**
 * Update wallet UI elements based on connection state
 */
function updateWalletUI(wallet) {
  const connectButton = document.getElementById('connect-wallet-btn');
  const walletDisplay = document.querySelector('.wallet-display');
  const walletAddress = document.querySelector('.wallet-address');
  const walletIcon = document.querySelector('.wallet-icon');
  
  if (wallet) {
    // Update header display
    connectButton.classList.add('hidden');
    walletDisplay.classList.remove('hidden');
    walletAddress.textContent = wallet.displayName;
    if (wallet.provider === 'phantom') {
      walletIcon.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="128" height="128" rx="64" fill="#AB9FF2"/>
          <path d="M110.13 46.12H99.03C98.5 46.12 98.06 46.55 98.06 47.09V79.57C98.06 80.11 98.5 80.54 99.03 80.54H110.13C110.66 80.54 111.09 80.11 111.09 79.57V47.09C111.09 46.55 110.66 46.12 110.13 46.12Z" fill="white"/>
          <path d="M86.27 38.33H18.27C17.74 38.33 17.3 38.76 17.3 39.3V87.32C17.3 87.85 17.74 88.29 18.27 88.29H86.27C86.8 88.29 87.24 87.85 87.24 87.32V39.3C87.24 38.76 86.8 38.33 86.27 38.33Z" fill="white"/>
          <path d="M110.13 83.44H99.03C98.5 83.44 98.06 83.88 98.06 84.41V87.32C98.06 87.85 98.5 88.29 99.03 88.29H110.13C110.66 88.29 111.09 87.85 111.09 87.32V84.41C111.09 83.88 110.66 83.44 110.13 83.44Z" fill="white"/>
        </svg>
      `;
    }
    
    // Hide wallet connection card on wallet panel
    const walletConnectionCard = document.querySelector('.wallet-connection-card');
    if (walletConnectionCard) {
      walletConnectionCard.classList.add('hidden');
    }
    
    // Show wallet info card on wallet panel
    const walletInfoCard = document.querySelector('.wallet-info-card');
    if (walletInfoCard) {
      walletInfoCard.classList.remove('hidden');
    }
    
  } else {
    // Update header display
    connectButton.classList.remove('hidden');
    walletDisplay.classList.add('hidden');
    
    // Show wallet connection card on wallet panel
    const walletConnectionCard = document.querySelector('.wallet-connection-card');
    if (walletConnectionCard) {
      walletConnectionCard.classList.remove('hidden');
    }
    
    // Hide wallet info card on wallet panel
    const walletInfoCard = document.querySelector('.wallet-info-card');
    if (walletInfoCard) {
      walletInfoCard.classList.add('hidden');
    }
  }
}

/**
 * Load wallet data (balances, token accounts)
 */
async function loadWalletData() {
  if (!currentWallet) return;
  
  try {
    // Simulate loading data with delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Set SOL balance (in a real implementation, this would fetch from RPC)
    solBalance = 45.72;
    
    // Set token balances (in a real implementation, this would fetch from RPC)
    tokenBalances = [
      { token: 'USDC', symbol: 'USDC', amount: 1250.73, value: '$1,250.73', logo: 'usdc-icon.svg' },
      { token: 'Jupiter', symbol: 'JUP', amount: 423.5, value: '$5,281.25', logo: 'jup-icon.svg' },
      { token: 'Bonk', symbol: 'BONK', amount: 42000000, value: '$983.40', logo: 'bonk-icon.svg' },
      { token: 'Jito', symbol: 'JTO', amount: 12.8, value: '$125.18', logo: 'jto-icon.svg' }
    ];
    
  } catch (error) {
    console.error('Error loading wallet data:', error);
    showErrorMessage('Failed to load wallet data');
  }
}

/**
 * Update wallet panel with wallet data
 */
export function updateWalletPanel() {
  if (!currentWallet) {
    // No wallet connected
    return;
  }
  
  try {
    // Update wallet address
    const walletAddressDisplay = document.querySelector('.wallet-info-card .wallet-address');
    if (walletAddressDisplay) {
      walletAddressDisplay.textContent = currentWallet.address;
    }
    
    // Update SOL balance
    const solBalanceDisplay = document.getElementById('sol-balance');
    if (solBalanceDisplay) {
      solBalanceDisplay.textContent = `${solBalance} SOL`;
    }
    
    const solValueDisplay = document.getElementById('sol-usd-value');
    if (solValueDisplay) {
      // Assume SOL price from the dashboard
      const solPrice = 167.64;
      const totalValue = (solBalance * solPrice).toFixed(2);
      solValueDisplay.textContent = `$${totalValue}`;
    }
    
    // Update token balances table
    const tokenBalancesTable = document.querySelector('.token-balances-table tbody');
    if (tokenBalancesTable) {
      tokenBalancesTable.innerHTML = '';
      
      tokenBalances.forEach(token => {
        const row = document.createElement('tr');
        
        const logoCell = document.createElement('td');
        logoCell.innerHTML = `<img src="${token.logo}" onerror="this.src='default-token-icon.svg'" alt="${token.symbol}" class="token-icon">`;
        
        const nameCell = document.createElement('td');
        nameCell.innerHTML = `<div class="token-info"><span class="token-name">${token.token}</span><span class="token-symbol">${token.symbol}</span></div>`;
        
        const amountCell = document.createElement('td');
        amountCell.textContent = token.amount.toLocaleString();
        
        const valueCell = document.createElement('td');
        valueCell.textContent = token.value;
        
        row.appendChild(logoCell);
        row.appendChild(nameCell);
        row.appendChild(amountCell);
        row.appendChild(valueCell);
        
        tokenBalancesTable.appendChild(row);
      });
    }
    
  } catch (error) {
    console.error('Error updating wallet panel:', error);
  }
}

/**
 * Get current wallet
 */
export function getCurrentWallet() {
  return currentWallet;
}

/**
 * Get SOL balance
 */
export function getSolBalance() {
  return solBalance;
}

/**
 * Get token balances
 */
export function getTokenBalances() {
  return tokenBalances;
}
