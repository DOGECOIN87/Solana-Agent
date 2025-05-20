/**
 * Solana AI Agent Dashboard - Token Swap Module
 * Uses Jupiter API for token swapping
 */
import { showSuccessMessage, showErrorMessage } from './utils.js';
import { getCurrentWallet, getSolBalance, getTokenBalances } from './wallet.js';

// Token list for swap interface
let tokenList = [];
let slippageOptions = [0.1, 0.5, 1, 2];
let selectedSlippage = 1;

/**
 * Initialize swap module
 */
export function initSwap() {
  setupSwapListeners();
  loadTokenList();
}

/**
 * Setup swap form event listeners
 */
function setupSwapListeners() {
  // Swap direction button
  const swapDirectionBtn = document.getElementById('swap-direction-btn');
  if (swapDirectionBtn) {
    swapDirectionBtn.addEventListener('click', swapDirection);
  }
  
  // Input amount change
  const inputAmount = document.getElementById('swap-input-amount');
  if (inputAmount) {
    inputAmount.addEventListener('input', updateSwapPreview);
  }
  
  // Token selectors
  const inputTokenSelector = document.getElementById('input-token-selector');
  const outputTokenSelector = document.getElementById('output-token-selector');
  
  if (inputTokenSelector) {
    inputTokenSelector.addEventListener('click', () => openTokenSelector('input'));
  }
  
  if (outputTokenSelector) {
    outputTokenSelector.addEventListener('click', () => openTokenSelector('output'));
  }
  
  // Swap button
  const swapButton = document.getElementById('swap-execute-btn');
  if (swapButton) {
    swapButton.addEventListener('click', executeSwap);
  }
  
  // Slippage settings
  const slippageSelector = document.getElementById('slippage-selector');
  if (slippageSelector) {
    slippageSelector.addEventListener('click', toggleSlippageDropdown);
  }
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(event) {
    const slippageDropdown = document.querySelector('.slippage-dropdown');
    const slippageSelector = document.getElementById('slippage-selector');
    
    if (slippageDropdown && slippageDropdown.classList.contains('active') &&
        !slippageDropdown.contains(event.target) &&
        !slippageSelector.contains(event.target)) {
      slippageDropdown.classList.remove('active');
    }
    
    const tokenListContainer = document.getElementById('token-list-container');
    if (tokenListContainer && tokenListContainer.classList.contains('active') &&
        !tokenListContainer.contains(event.target)) {
      tokenListContainer.classList.remove('active');
    }
  });
}

/**
 * Load token list for swap
 */
async function loadTokenList() {
  try {
    // In a real implementation, this would fetch from Jupiter API
    // For demo purposes, we'll use placeholder data
    tokenList = [
      { symbol: 'SOL', name: 'Solana', logo: 'sol-icon.svg', address: 'So11111111111111111111111111111111111111112' },
      { symbol: 'USDC', name: 'USD Coin', logo: 'usdc-icon.svg', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
      { symbol: 'USDT', name: 'Tether USD', logo: 'usdt-icon.svg', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
      { symbol: 'JUP', name: 'Jupiter', logo: 'jup-icon.svg', address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' },
      { symbol: 'BONK', name: 'Bonk', logo: 'bonk-icon.svg', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
      { symbol: 'JTO', name: 'Jito', logo: 'jto-icon.svg', address: 'JTOA39kSQD4TdyMPL7uf3mx9eZxnXY8MVFHHreBQg75q' }
    ];
    
    // Set default tokens for swap
    setDefaultTokens();
    
    return true;
  } catch (error) {
    console.error('Error loading token list:', error);
    return false;
  }
}

/**
 * Set default tokens for swap interface
 */
function setDefaultTokens() {
  // Set default input token to SOL
  const solToken = tokenList.find(t => t.symbol === 'SOL');
  
  // Set default output token to USDC
  const usdcToken = tokenList.find(t => t.symbol === 'USDC');
  
  if (solToken && usdcToken) {
    updateTokenDisplay('input', solToken);
    updateTokenDisplay('output', usdcToken);
  }
}

/**
 * Update token display in swap interface
 */
function updateTokenDisplay(type, token) {
  const selector = document.getElementById(`${type}-token-selector`);
  if (!selector) return;
  
  const logoElement = selector.querySelector('.token-logo');
  const symbolElement = selector.querySelector('.token-symbol');
  
  if (logoElement) {
    logoElement.innerHTML = `<img src="${token.logo}" onerror="this.src='default-token-icon.svg'" alt="${token.symbol}">`;
  }
  
  if (symbolElement) {
    symbolElement.textContent = token.symbol;
  }
  
  // Store selected token in the element's dataset
  selector.dataset.token = token.symbol;
  selector.dataset.address = token.address;
  
  // Update swap preview when token changes
  updateSwapPreview();
}

/**
 * Open token selector dropdown
 */
function openTokenSelector(type) {
  const container = document.getElementById('token-list-container');
  if (!container) return;
  
  // Set active type
  container.dataset.activeType = type;
  
  // Show container
  container.classList.add('active');
  
  // Clear previous list
  const listElement = container.querySelector('.token-list');
  listElement.innerHTML = '';
  
  // Add header
  const header = document.createElement('div');
  header.classList.add('token-list-header');
  header.innerHTML = `
    <h3>Select a token</h3>
    <div class="close-token-list">&times;</div>
  `;
  listElement.appendChild(header);
  
  // Add search input
  const searchContainer = document.createElement('div');
  searchContainer.classList.add('token-search');
  searchContainer.innerHTML = `
    <input type="text" placeholder="Search symbol or paste address" id="token-search-input">
  `;
  listElement.appendChild(searchContainer);
  
  // Add tokens
  const tokensContainer = document.createElement('div');
  tokensContainer.classList.add('tokens-container');
  
  tokenList.forEach(token => {
    const tokenItem = document.createElement('div');
    tokenItem.classList.add('token-item');
    tokenItem.innerHTML = `
      <div class="token-logo">
        <img src="${token.logo}" onerror="this.src='default-token-icon.svg'" alt="${token.symbol}">
      </div>
      <div class="token-info">
        <div class="token-name">${token.name}</div>
        <div class="token-symbol">${token.symbol}</div>
      </div>
    `;
    
    // Add click event
    tokenItem.addEventListener('click', () => {
      updateTokenDisplay(type, token);
      container.classList.remove('active');
    });
    
    tokensContainer.appendChild(tokenItem);
  });
  
  listElement.appendChild(tokensContainer);
  
  // Add close event
  const closeButton = header.querySelector('.close-token-list');
  closeButton.addEventListener('click', () => {
    container.classList.remove('active');
  });
  
  // Add search functionality
  const searchInput = searchContainer.querySelector('#token-search-input');
  searchInput.addEventListener('input', event => {
    const searchTerm = event.target.value.toLowerCase();
    const tokenItems = tokensContainer.querySelectorAll('.token-item');
    
    tokenItems.forEach(item => {
      const name = item.querySelector('.token-name').textContent.toLowerCase();
      const symbol = item.querySelector('.token-symbol').textContent.toLowerCase();
      
      if (name.includes(searchTerm) || symbol.includes(searchTerm)) {
        item.style.display = 'flex';
      } else {
        item.style.display = 'none';
      }
    });
  });
  
  // Focus search input
  setTimeout(() => searchInput.focus(), 100);
}

/**
 * Toggle slippage settings dropdown
 */
function toggleSlippageDropdown(event) {
  event.stopPropagation();
  const dropdown = document.querySelector('.slippage-dropdown');
  dropdown.classList.toggle('active');
  
  // If in toggle, create slippage options
  if (dropdown.classList.contains('active')) {
    updateSlippageOptions();
  }
}

/**
 * Update slippage options in dropdown
 */
function updateSlippageOptions() {
  const dropdown = document.querySelector('.slippage-dropdown');
  dropdown.innerHTML = '';
  
  slippageOptions.forEach(option => {
    const slippageOption = document.createElement('div');
    slippageOption.classList.add('slippage-option');
    if (option === selectedSlippage) {
      slippageOption.classList.add('active');
    }
    slippageOption.textContent = `${option}%`;
    slippageOption.addEventListener('click', () => {
      selectedSlippage = option;
      document.querySelector('#slippage-value').textContent = `${option}%`;
      document.querySelectorAll('.slippage-option').forEach(opt => opt.classList.remove('active'));
      slippageOption.classList.add('active');
      updateSwapPreview();
    });
    
    dropdown.appendChild(slippageOption);
  });
  
  // Add custom option
  const customOption = document.createElement('div');
  customOption.classList.add('slippage-option', 'custom');
  customOption.innerHTML = `
    <input type="text" placeholder="Custom" id="custom-slippage">
    <span>%</span>
  `;
  dropdown.appendChild(customOption);
  
  // Add custom input functionality
  const customInput = customOption.querySelector('#custom-slippage');
  customInput.addEventListener('input', event => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value) && value > 0 && value <= 50) {
      selectedSlippage = value;
      document.querySelector('#slippage-value').textContent = `${value}%`;
      document.querySelectorAll('.slippage-option').forEach(opt => opt.classList.remove('active'));
    }
  });
}

/**
 * Swap input and output tokens
 */
function swapDirection() {
  const inputSelector = document.getElementById('input-token-selector');
  const outputSelector = document.getElementById('output-token-selector');
  
  if (!inputSelector || !outputSelector) return;
  
  const inputSymbol = inputSelector.dataset.token;
  const inputAddress = inputSelector.dataset.address;
  const outputSymbol = outputSelector.dataset.token;
  const outputAddress = outputSelector.dataset.address;
  
  const inputToken = tokenList.find(t => t.symbol === inputSymbol);
  const outputToken = tokenList.find(t => t.symbol === outputSymbol);
  
  if (inputToken && outputToken) {
    updateTokenDisplay('input', outputToken);
    updateTokenDisplay('output', inputToken);
    
    // Also swap amounts
    const inputAmount = document.getElementById('swap-input-amount').value;
    const outputAmount = document.getElementById('swap-output-amount').value;
    
    document.getElementById('swap-input-amount').value = outputAmount;
    
    updateSwapPreview();
  }
}

/**
 * Update swap preview based on input amount and tokens
 */
function updateSwapPreview() {
  const inputAmount = parseFloat(document.getElementById('swap-input-amount').value) || 0;
  const inputSelector = document.getElementById('input-token-selector');
  const outputSelector = document.getElementById('output-token-selector');
  
  if (inputAmount <= 0 || !inputSelector || !outputSelector) {
    document.getElementById('swap-output-amount').value = '';
    updateSwapDetails(null);
    return;
  }
  
  const inputSymbol = inputSelector.dataset.token;
  const outputSymbol = outputSelector.dataset.token;
  
  if (!inputSymbol || !outputSymbol) return;
  
  // In a real implementation, this would query Jupiter API for a quote
  // For demo purposes, we'll simulate a quote calculation
  
  let outputAmount;
  let price;
  let priceImpact;
  let swapFee;
  
  // Simulate different token pairs with different rates
  if (inputSymbol === 'SOL' && outputSymbol === 'USDC') {
    price = 167.64; // 1 SOL = $167.64 USDC
    outputAmount = inputAmount * price;
    priceImpact = inputAmount > 10 ? 0.3 : 0.1; // Higher amounts have more impact
    swapFee = outputAmount * 0.0035; // 0.35% fee
  } else if (inputSymbol === 'USDC' && outputSymbol === 'SOL') {
    price = 1 / 167.64; // 1 USDC = 0.00596 SOL
    outputAmount = inputAmount * price;
    priceImpact = inputAmount > 1000 ? 0.4 : 0.2;
    swapFee = outputAmount * 0.0035;
  } else if (inputSymbol === 'SOL' && outputSymbol === 'BONK') {
    price = 7000000; // 1 SOL = 7 million BONK
    outputAmount = inputAmount * price;
    priceImpact = 0.15;
    swapFee = outputAmount * 0.004;
  } else if (inputSymbol === 'SOL' && outputSymbol === 'JUP') {
    price = 13.5; // 1 SOL = 13.5 JUP
    outputAmount = inputAmount * price;
    priceImpact = 0.2;
    swapFee = outputAmount * 0.0035;
  } else {
    // Default calculation for other pairs
    price = 1.2; // Generic exchange rate
    outputAmount = inputAmount * price;
    priceImpact = 0.25;
    swapFee = outputAmount * 0.005;
  }
  
  // Apply slippage and price impact to output amount
  const slippageImpact = outputAmount * (selectedSlippage / 100);
  const minOutputAmount = outputAmount - slippageImpact;
  
  // Display output amount
  document.getElementById('swap-output-amount').value = outputAmount.toFixed(outputSymbol === 'BONK' ? 0 : 6);
  
  // Update swap details
  updateSwapDetails({
    price,
    priceImpact,
    swapFee,
    minOutputAmount,
    outputSymbol
  });
}

/**
 * Update swap details section
 */
function updateSwapDetails(details) {
  const detailsContainer = document.querySelector('.swap-details');
  if (!detailsContainer) return;
  
  if (!details) {
    detailsContainer.classList.add('hidden');
    return;
  }
  
  detailsContainer.classList.remove('hidden');
  
  // Update price
  const priceElement = document.getElementById('swap-price');
  if (priceElement) {
    const inputSymbol = document.getElementById('input-token-selector').dataset.token;
    const outputSymbol = document.getElementById('output-token-selector').dataset.token;
    
    if (details.price < 0.001) {
      priceElement.textContent = `1 ${inputSymbol} ≈ ${details.price.toFixed(8)} ${outputSymbol}`;
    } else if (details.price > 1000) {
      priceElement.textContent = `1 ${inputSymbol} ≈ ${Math.floor(details.price).toLocaleString()} ${outputSymbol}`;
    } else {
      priceElement.textContent = `1 ${inputSymbol} ≈ ${details.price.toFixed(4)} ${outputSymbol}`;
    }
  }
  
  // Update price impact
  const priceImpactElement = document.getElementById('price-impact');
  if (priceImpactElement) {
    priceImpactElement.textContent = `${details.priceImpact.toFixed(2)}%`;
    
    // Color based on impact
    if (details.priceImpact > 1) {
      priceImpactElement.classList.add('negative');
      priceImpactElement.classList.remove('neutral');
    } else {
      priceImpactElement.classList.add('neutral');
      priceImpactElement.classList.remove('negative');
    }
  }
  
  // Update minimum received
  const minReceivedElement = document.getElementById('minimum-received');
  if (minReceivedElement) {
    if (details.outputSymbol === 'BONK') {
      minReceivedElement.textContent = `${Math.floor(details.minOutputAmount).toLocaleString()} ${details.outputSymbol}`;
    } else {
      minReceivedElement.textContent = `${details.minOutputAmount.toFixed(6)} ${details.outputSymbol}`;
    }
  }
  
  // Update swap fee
  const swapFeeElement = document.getElementById('swap-fee');
  if (swapFeeElement) {
    swapFeeElement.textContent = `${details.swapFee.toFixed(4)} ${details.outputSymbol}`;
  }
  
  // Update swap button
  updateSwapButtonState();
}

/**
 * Update swap button state based on inputs
 */
function updateSwapButtonState() {
  const swapButton = document.getElementById('swap-execute-btn');
  if (!swapButton) return;
  
  const inputAmount = parseFloat(document.getElementById('swap-input-amount').value) || 0;
  const outputAmount = parseFloat(document.getElementById('swap-output-amount').value) || 0;
  const wallet = getCurrentWallet();
  
  if (!wallet) {
    swapButton.disabled = true;
    swapButton.textContent = 'Connect Wallet';
    return;
  }
  
  if (inputAmount <= 0 || outputAmount <= 0) {
    swapButton.disabled = true;
    swapButton.textContent = 'Enter an amount';
    return;
  }
  
  // Check if user has enough balance
  const inputSymbol = document.getElementById('input-token-selector').dataset.token;
  let userBalance = 0;
  
  if (inputSymbol === 'SOL') {
    userBalance = getSolBalance();
  } else {
    const tokenBalance = getTokenBalances().find(t => t.symbol === inputSymbol);
    userBalance = tokenBalance ? tokenBalance.amount : 0;
  }
  
  if (inputAmount > userBalance) {
    swapButton.disabled = true;
    swapButton.textContent = `Insufficient ${inputSymbol} balance`;
    return;
  }
  
  // Enable swap
  swapButton.disabled = false;
  swapButton.textContent = 'Swap';
}

/**
 * Execute token swap
 */
async function executeSwap() {
  const swapButton = document.getElementById('swap-execute-btn');
  const wallet = getCurrentWallet();
  
  if (!wallet || swapButton.disabled) {
    return;
  }
  
  const inputAmount = parseFloat(document.getElementById('swap-input-amount').value);
  const inputSymbol = document.getElementById('input-token-selector').dataset.token;
  const outputSymbol = document.getElementById('output-token-selector').dataset.token;
  const outputAmount = parseFloat(document.getElementById('swap-output-amount').value);
  
  try {
    // Disable button and show loading
    swapButton.disabled = true;
    swapButton.textContent = 'Swapping...';
    
    // In a real implementation, this would call Jupiter Swap API
    // For demo purposes, we'll simulate a successful swap
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Show success message
    showSuccessMessage(`Swap successful! You received ${outputAmount.toFixed(outputSymbol === 'BONK' ? 0 : 4)} ${outputSymbol}`);
    
    // Reset form
    document.getElementById('swap-input-amount').value = '';
    document.getElementById('swap-output-amount').value = '';
    updateSwapDetails(null);
    
    // Re-enable button
    swapButton.disabled = false;
    swapButton.textContent = 'Swap';
    
  } catch (error) {
    console.error('Swap error:', error);
    showErrorMessage('Swap failed. Please try again.');
    
    // Re-enable button
    swapButton.disabled = false;
    swapButton.textContent = 'Swap';
  }
}
