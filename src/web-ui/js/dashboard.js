/**
 * Solana AI Agent Dashboard - Dashboard Panel
 */
import { generateFakePriceData, generateFakeNetworkData } from './utils.js';

/**
 * Initialize dashboard panel
 */
export function initDashboard() {
  // Load dashboard data on initialization
  loadDashboardData();
}

/**
 * Load dashboard data
 */
export async function loadDashboardData() {
  try {
    // Load network stats
    await loadNetworkStats();
    
    // Load trending tokens
    await loadTrendingTokens();
    
    // Load price chart data
    loadPriceChart();
    
    // Load network activity chart
    loadNetworkActivityChart();
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Error handling can use the imported showErrorMessage from utils if needed
  }
}

/**
 * Load network stats
 */
async function loadNetworkStats() {
  try {
    // In a real implementation, this would fetch from backend API
    // For demo purposes, we'll use placeholder data
    
    // Format with commas for large numbers
    const formatNumber = num => new Intl.NumberFormat().format(num);
    
    // Update UI
    document.getElementById('sol-price').textContent = '$167.64';
    document.getElementById('sol-change').textContent = '+2.34%';
    document.getElementById('slot-height').textContent = formatNumber(225738419);
    document.getElementById('slot-time').textContent = 'Last: 20s ago';
    document.getElementById('current-tps').textContent = '3,421 tps';
    document.getElementById('tps-detail').textContent = '24h avg: 2,950 tps';
    document.getElementById('market-cap').textContent = '$89.3B';
    
    return true;
  } catch (error) {
    console.error('Error loading network stats:', error);
    return false;
  }
}

/**
 * Load trending tokens
 */
async function loadTrendingTokens() {
  try {
    // In a real implementation, this would fetch from the backend API
    // For demo purposes, we'll use placeholder data
    const trendingTokens = [
      { name: 'Solana', symbol: 'SOL', price: '$167.64', change: '+2.34%', volume: '$2.1B', marketCap: '$89.3B' },
      { name: 'Jupiter', symbol: 'JUP', price: '$12.47', change: '+5.67%', volume: '$842M', marketCap: '$5.2B' },
      { name: 'Bonk', symbol: 'BONK', price: '$0.00002341', change: '+10.21%', volume: '$521M', marketCap: '$1.4B' },
      { name: 'Tensor', symbol: 'TNSR', price: '$4.32', change: '-1.24%', volume: '$358M', marketCap: '$952M' },
      { name: 'Jito', symbol: 'JTO', price: '$9.78', change: '+3.87%', volume: '$297M', marketCap: '$1.1B' }
    ];
    
    const tableBody = document.querySelector('#trending-tokens tbody');
    tableBody.innerHTML = '';
    
    trendingTokens.forEach(token => {
      const row = document.createElement('tr');
      
      // Format token name cell with icon
      const nameCell = document.createElement('td');
      nameCell.innerHTML = `<div class="token-name"><img src="${token.symbol.toLowerCase()}-icon.svg" onerror="this.src='default-token-icon.svg'" alt="${token.symbol}"> <span>${token.name} <span class="token-symbol">${token.symbol}</span></span></div>`;
      
      // Format price cell
      const priceCell = document.createElement('td');
      priceCell.textContent = token.price;
      
      // Format change cell with color
      const changeCell = document.createElement('td');
      const isPositive = token.change.startsWith('+');
      changeCell.innerHTML = `<span class="${isPositive ? 'positive' : 'negative'}">${token.change}</span>`;
      
      // Format volume and marketcap cells
      const volumeCell = document.createElement('td');
      volumeCell.textContent = token.volume;
      
      const marketCapCell = document.createElement('td');
      marketCapCell.textContent = token.marketCap;
      
      // Add all cells to the row
      row.appendChild(nameCell);
      row.appendChild(priceCell);
      row.appendChild(changeCell);
      row.appendChild(volumeCell);
      row.appendChild(marketCapCell);
      
      tableBody.appendChild(row);
    });
    
    return true;
  } catch (error) {
    console.error('Error loading trending tokens:', error);
    return false;
  }
}

/**
 * Load price chart
 */
function loadPriceChart() {
  const ctx = document.getElementById('price-chart').getContext('2d');
  
  // Generate some fake data for the chart
  const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
  const data = generateFakePriceData(160, 170, 24);
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'SOL Price (USD)',
        data,
        borderColor: '#9945FF',
        backgroundColor: 'rgba(153, 69, 255, 0.1)',
        borderWidth: 2,
        fill: true,
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
 * Load network activity chart
 */
function loadNetworkActivityChart() {
  const ctx = document.getElementById('network-chart').getContext('2d');
  
  // Generate some fake data for the chart
  const labels = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });
  
  const transactionsData = generateFakeNetworkData(2800, 3500, 7);
  const tpsData = generateFakeNetworkData(2500, 3200, 7);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Transactions (millions)',
          data: transactionsData,
          backgroundColor: '#9945FF',
          borderRadius: 4
        },
        {
          label: 'Avg TPS',
          data: tpsData,
          backgroundColor: '#00C2FF',
          borderRadius: 4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#B3B3B3'
          }
        },
        tooltip: {
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
          position: 'left',
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#737373'
          },
          title: {
            display: true,
            text: 'Transactions (M)',
            color: '#B3B3B3'
          }
        },
        y1: {
          position: 'right',
          grid: {
            display: false
          },
          ticks: {
            color: '#737373'
          },
          title: {
            display: true,
            text: 'Avg TPS',
            color: '#B3B3B3'
          }
        }
      }
    }
  });
}
