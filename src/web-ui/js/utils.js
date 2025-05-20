/**
 * Solana AI Agent Dashboard - Utility Functions
 */

/**
 * Format an address to a shortened display format
 * @param {string} address - The full address
 * @returns {string} Shortened address
 */
export function formatAddress(address) {
  if (!address) return '';
  if (address.length < 10) return address;
  
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
}

/**
 * Show a success message toast notification
 * @param {string} message - Message to display
 */
export function showSuccessMessage(message) {
  showToast(message, 'success');
}

/**
 * Show an error message toast notification
 * @param {string} message - Error message to display
 */
export function showErrorMessage(message) {
  showToast(message, 'error');
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error, info)
 */
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Add appropriate icon
  let iconSvg = '';
  
  if (type === 'success') {
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
    `;
  } else if (type === 'error') {
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
      </svg>
    `;
  } else {
    iconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      </svg>
    `;
  }
  
  // Set toast content
  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${message}</div>
    <div class="toast-close">&times;</div>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Add close functionality
  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', () => {
    toast.classList.add('toast-closing');
    setTimeout(() => {
      toast.remove();
    }, 300);
  });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.classList.add('toast-closing');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 5000);
}

/**
 * Generate fake price data for charts
 * @param {number} min - Minimum price
 * @param {number} max - Maximum price
 * @param {number} points - Number of data points
 * @returns {Array<number>} Array of price data
 */
export function generateFakePriceData(min, max, points) {
  const data = [];
  let lastValue = min + Math.random() * (max - min);
  
  for (let i = 0; i < points; i++) {
    // Calculate a random change, biased slightly upward
    const changePercent = (Math.random() - 0.45) * 0.02; // Between -0.9% and +1.1%
    const change = lastValue * changePercent;
    
    // Add change to last value, but keep within min/max
    lastValue += change;
    lastValue = Math.max(min, Math.min(max, lastValue));
    
    data.push(lastValue);
  }
  
  return data;
}

/**
 * Generate fake network data for charts
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} points - Number of data points
 * @returns {Array<number>} Array of network data
 */
export function generateFakeNetworkData(min, max, points) {
  const data = [];
  
  for (let i = 0; i < points; i++) {
    data.push(Math.floor(min + Math.random() * (max - min)));
  }
  
  return data;
}

/**
 * Load a generic chart with common options
 * @param {string} canvasId - Canvas element ID
 * @param {string} type - Chart type ('line', 'bar', etc.)
 * @param {Array<string>} labels - Chart labels
 * @param {Array<number>} data - Chart data
 * @param {string} label - Data series label
 * @param {string} color - Chart color (optional)
 */
export function loadGenericChart(canvasId, type, labels, data, label, color = '#9945FF') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  new Chart(ctx, {
    type: type,
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: type === 'line' ? 'rgba(153, 69, 255, 0.1)' : color,
        borderWidth: 2,
        fill: type === 'line' ? true : false,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#1E1E1E',
          titleColor: '#FFFFFF',
          bodyColor: '#B3B3B3',
          borderColor: '#333333',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#737373'
          }
        },
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#737373'
          }
        }
      }
    }
  });
}

/**
 * Get a color based on risk score
 * @param {number} score - Risk score (0-100)
 * @returns {string} Color in hex format
 */
export function getRiskColor(score) {
  if (score < 20) {
    return '#14F195'; // Green - Low risk
  } else if (score < 50) {
    return '#FFC107'; // Yellow - Medium risk
  } else {
    return '#FF5349'; // Red - High risk
  }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}

/**
 * Format a number with thousands separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return new Intl.NumberFormat().format(num);
}

/**
 * Format currency value
 * @param {number} value - Value to format
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted currency value
 */
export function formatCurrency(value, decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Truncate a string if it exceeds max length
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncateString(str, maxLength) {
  if (!str || str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Format date to a readable string
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format time to a readable string
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted time
 */
export function formatTime(date) {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Format datetime to a readable string
 * @param {Date|string|number} date - Date to format
 * @returns {string} Formatted datetime
 */
export function formatDateTime(date) {
  const d = new Date(date);
  return `${formatDate(d)} ${formatTime(d)}`;
}
