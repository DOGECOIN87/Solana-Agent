/**
 * Solana AI Agent Dashboard - Analytics Module
 */
import { loadGenericChart, getRiskColor } from './utils.js';
import { getCurrentWallet } from './wallet.js';

/**
 * Initialize analytics module
 */
export function initAnalytics() {
  setupAnalyticsComponents();
}

/**
 * Setup analytics charts and components
 */
function setupAnalyticsComponents() {
  // Check if wallet is connected
  const wallet = getCurrentWallet();
  
  if (!wallet) {
    showWalletRequired();
    return;
  }
  
  // If wallet connected, load all analytics components
  loadNetworkAnalytics();
  loadWalletAnalytics();
  loadTokenAnalytics();
  
  // Set up tabs
  setupAnalyticsTabs();
}

/**
 * Show wallet required message when no wallet connected
 */
function showWalletRequired() {
  const analyticsContent = document.querySelector('.analytics-panel .panel-content');
  if (!analyticsContent) return;
  
  analyticsContent.innerHTML = `
    <div class="wallet-required">
      <div class="wallet-required-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
          <line x1="6" y1="1" x2="6" y2="4"></line>
          <line x1="10" y1="1" x2="10" y2="4"></line>
          <line x1="14" y1="1" x2="14" y2="4"></line>
        </svg>
      </div>
      <h3>Wallet Connection Required</h3>
      <p>Connect your wallet to view personalized analytics, including transaction history, token performance, and security insights.</p>
      <button id="analytics-connect-wallet-btn" class="primary-button">Connect Wallet</button>
    </div>
  `;
  
  // Add event listener to connect button
  const connectButton = document.getElementById('analytics-connect-wallet-btn');
  if (connectButton) {
    connectButton.addEventListener('click', () => {
      // Trigger wallet connect from header button
      document.getElementById('connect-wallet-btn').click();
      
      // Check periodically if wallet got connected
      const checkWalletInterval = setInterval(() => {
        if (getCurrentWallet()) {
          clearInterval(checkWalletInterval);
          setupAnalyticsComponents();
        }
      }, 1000);
      
      // Stop checking after 30 seconds
      setTimeout(() => clearInterval(checkWalletInterval), 30000);
    });
  }
}

/**
 * Setup analytics tabs
 */
function setupAnalyticsTabs() {
  const tabs = document.querySelectorAll('.analytics-tabs .tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  if (!tabs.length || !tabContents.length) return;
  
  // Add click event to tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      document.querySelector(`.tab-content[data-tab="${tabId}"]`).classList.add('active');
    });
  });
}

/**
 * Load network analytics section
 */
function loadNetworkAnalytics() {
  // Load TPS history chart
  loadTPSChart();
  
  // Load fee history chart
  loadFeeChart();
  
  // Load validator stats
  loadValidatorStats();
}

/**
 * Load TPS chart
 */
function loadTPSChart() {
  // Generate data for chart
  const labels = Array.from({length: 24}, (_, i) => `${i}:00`);
  const data = Array.from({length: 24}, () => Math.floor(Math.random() * 1500) + 1500);
  
  // Load chart
  loadGenericChart('tps-chart', 'line', labels, data, 'Transactions Per Second');
}

/**
 * Load fee chart
 */
function loadFeeChart() {
  // Generate data for chart
  const labels = Array.from({length: 30}, (_, i) => `Day ${i+1}`);
  const data = Array.from({length: 30}, () => (Math.random() * 0.0002 + 0.0001).toFixed(6));
  
  // Load chart
  loadGenericChart('fee-chart', 'line', labels, data, 'Average Fee (SOL)');
}

/**
 * Load validator stats
 */
function loadValidatorStats() {
  const statsContainer = document.getElementById('validator-stats');
  if (!statsContainer) return;
  
  // In a real implementation, this would fetch data from the network
  // For demo purposes, we'll use placeholder data
  
  const totalValidators = 3_104;
  const activeStake = 372_481_935;
  const averageAPY = 6.8;
  
  statsContainer.innerHTML = `
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-value">${totalValidators.toLocaleString()}</div>
        <div class="stat-label">Total Validators</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${(activeStake / 1_000_000).toFixed(1)}M</div>
        <div class="stat-label">Active Stake (SOL)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${averageAPY}%</div>
        <div class="stat-label">Average APY</div>
      </div>
    </div>
    <div class="validator-distribution">
      <h4>Stake Distribution</h4>
      <div class="distribution-chart">
        <div class="distribution-bar">
          <div class="bar-segment" style="width: 21%; background-color: #9945FF" title="Superminority (21%)"></div>
          <div class="bar-segment" style="width: 15%; background-color: #14F195" title="Large Validators (15%)"></div>
          <div class="bar-segment" style="width: 37%; background-color: #00C2FF" title="Medium Validators (37%)"></div>
          <div class="bar-segment" style="width: 27%; background-color: #FF5349" title="Small Validators (27%)"></div>
        </div>
        <div class="distribution-labels">
          <div class="label"><span class="color-dot" style="background-color: #9945FF"></span> Superminority (21%)</div>
          <div class="label"><span class="color-dot" style="background-color: #14F195"></span> Large (15%)</div>
          <div class="label"><span class="color-dot" style="background-color: #00C2FF"></span> Medium (37%)</div>
          <div class="label"><span class="color-dot" style="background-color: #FF5349"></span> Small (27%)</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Load wallet analytics section
 */
function loadWalletAnalytics() {
  const wallet = getCurrentWallet();
  if (!wallet) return;
  
  // Load transaction history
  loadTransactionHistory();
  
  // Load wallet risk score
  loadWalletRiskScore();
  
  // Load spending analysis
  loadSpendingAnalysis();
}

/**
 * Load transaction history
 */
function loadTransactionHistory() {
  const historyContainer = document.getElementById('transaction-history');
  if (!historyContainer) return;
  
  // In a real implementation, this would fetch transaction history from the blockchain
  // For demo purposes, we'll use placeholder data
  
  // Generate some fake transactions
  const transactions = [
    {
      signature: '5K1ys8BnBgGGpxBnYBFPvRd6dcXyRQUcgwLPuVXbfnwXaU6VGqSY42NsoubLYCcM5tQgKkmAqiZdr7jHHZfZy2vP',
      type: 'Swap',
      from: 'SOL',
      to: 'USDC',
      amount: '2.5 SOL',
      value: '$419.10',
      timestamp: '2025-05-20T08:45:12Z',
      status: 'success'
    },
    {
      signature: '3hzTJwP7SxgLsXnawXj7CmvJ5HuZ7SozpKGPn3KVkMsHwxpDkN3ViRmpAjLpBfBGbKhz5SLXVnN7DHNcHVvSVaXx',
      type: 'Send',
      from: 'My Wallet',
      to: 'Gw5zwide...L9XB',
      amount: '10 USDC',
      value: '$10.00',
      timestamp: '2025-05-19T15:23:45Z',
      status: 'success'
    },
    {
      signature: '4XBjmK8JwwHW1EMt6Ui7Cjb7Vh3Xvn9H13rLfKxbzJVvhJpx9Lu3HxgkgLNy8o9TgtKjhGpPmp7eLsANwTzUcxRY',
      type: 'NFT Purchase',
      from: 'Magic Eden',
      to: 'My Wallet',
      amount: '1 NFT',
      value: '3.2 SOL',
      timestamp: '2025-05-18T19:12:30Z',
      status: 'success'
    },
    {
      signature: '4CJKLk1ghvwEzxGw7hqzT7aEuUzAzQQ1FkFmTPFaqwtm78xHvT5XxQXKBmvPBL3yxkDLRc5jhHsW7i9QmTprfDPC',
      type: 'Swap',
      from: 'USDC',
      to: 'JUP',
      amount: '50 USDC',
      value: '$50.00',
      timestamp: '2025-05-18T12:45:22Z',
      status: 'success'
    },
    {
      signature: '3NL2QxoJJfRCFw1Bie8tspKfYGeC699xkgBx2NzdCgJeK8sLn4fGWpUccFBCPJ1vkTYRUkdR6PtGErhXiCtS3TXp',
      type: 'Receive',
      from: '7bzg4...9mVt',
      to: 'My Wallet',
      amount: '12.5 USDC',
      value: '$12.50',
      timestamp: '2025-05-16T09:32:54Z',
      status: 'success'
    }
  ];
  
  // Create table
  const table = document.createElement('table');
  table.classList.add('transaction-table');
  
  // Add header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Transaction</th>
      <th>Type</th>
      <th>Amount</th>
      <th>Time</th>
      <th>Status</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Add rows
  const tbody = document.createElement('tbody');
  
  transactions.forEach(tx => {
    const row = document.createElement('tr');
    
    // Format date
    const txDate = new Date(tx.timestamp);
    const formattedDate = txDate.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    row.innerHTML = `
      <td>
        <div class="tx-info">
          <div class="tx-signature">${tx.signature.slice(0, 6)}...${tx.signature.slice(-4)}</div>
          <div class="tx-addresses">
            <span>From: ${tx.from}</span>
            <span>To: ${tx.to}</span>
          </div>
        </div>
      </td>
      <td>${tx.type}</td>
      <td>
        <div class="tx-amount">${tx.amount}</div>
        <div class="tx-value">${tx.value}</div>
      </td>
      <td>${formattedDate}</td>
      <td><span class="tx-status ${tx.status}">${tx.status}</span></td>
    `;
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  historyContainer.appendChild(table);
  
  // Add view more button
  const viewMoreBtn = document.createElement('button');
  viewMoreBtn.classList.add('secondary-button');
  viewMoreBtn.textContent = 'View More Transactions';
  historyContainer.appendChild(viewMoreBtn);
}

/**
 * Load wallet risk score
 */
function loadWalletRiskScore() {
  const riskContainer = document.getElementById('wallet-risk');
  if (!riskContainer) return;
  
  // In a real implementation, this would calculate a risk score based on wallet activity
  // For demo purposes, we'll use a placeholder score
  
  const riskScore = 15; // Low risk (0-100 scale)
  const riskColor = getRiskColor(riskScore);
  
  riskContainer.innerHTML = `
    <div class="risk-score-container">
      <div class="risk-score" style="color: ${riskColor}">
        <div class="score-value">${riskScore}</div>
        <div class="score-label">Risk Score</div>
      </div>
      
      <div class="risk-meter">
        <div class="risk-gauge">
          <div class="risk-indicator" style="transform: rotate(${riskScore * 1.8}deg); background-color: ${riskColor};"></div>
        </div>
        <div class="risk-labels">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>
    </div>
    
    <div class="risk-details">
      <h4>Risk Assessment</h4>
      <ul>
        <li class="risk-good">✓ No interaction with flagged contracts</li>
        <li class="risk-good">✓ No unusual transaction patterns</li>
        <li class="risk-good">✓ Transactions with verified platforms only</li>
        <li class="risk-good">✓ Regular activity pattern</li>
        <li class="risk-warning">⚠️ Unlimited token approvals detected (1)</li>
      </ul>
      
      <div class="risk-actions">
        <button class="secondary-button">Scan for Vulnerabilities</button>
        <button class="text-button">View Detailed Report</button>
      </div>
    </div>
  `;
}

/**
 * Load spending analysis
 */
function loadSpendingAnalysis() {
  const spendingContainer = document.getElementById('spending-analysis');
  if (!spendingContainer) return;
  
  // In a real implementation, this would analyze wallet transactions
  // For demo purposes, we'll use placeholder data
  
  spendingContainer.innerHTML = `
    <div class="spending-chart-container">
      <canvas id="spending-chart"></canvas>
    </div>
    
    <div class="spending-breakdown">
      <h4>30-Day Spending Breakdown</h4>
      <div class="spending-categories">
        <div class="spending-category">
          <div class="category-info">
            <div class="category-color" style="background-color: #9945FF;"></div>
            <div class="category-name">Swaps</div>
          </div>
          <div class="category-value">$1,245.32</div>
          <div class="category-bar">
            <div class="bar-fill" style="width: 62%; background-color: #9945FF;"></div>
          </div>
        </div>
        
        <div class="spending-category">
          <div class="category-info">
            <div class="category-color" style="background-color: #14F195;"></div>
            <div class="category-name">NFT Purchases</div>
          </div>
          <div class="category-value">$536.80</div>
          <div class="category-bar">
            <div class="bar-fill" style="width: 27%; background-color: #14F195;"></div>
          </div>
        </div>
        
        <div class="spending-category">
          <div class="category-info">
            <div class="category-color" style="background-color: #00C2FF;"></div>
            <div class="category-name">Transfers</div>
          </div>
          <div class="category-value">$125.50</div>
          <div class="category-bar">
            <div class="bar-fill" style="width: 6%; background-color: #00C2FF;"></div>
          </div>
        </div>
        
        <div class="spending-category">
          <div class="category-info">
            <div class="category-color" style="background-color: #FF5349;"></div>
            <div class="category-name">Fees</div>
          </div>
          <div class="category-value">$98.45</div>
          <div class="category-bar">
            <div class="bar-fill" style="width: 5%; background-color: #FF5349;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load the spending chart
  setTimeout(() => {
    const ctx = document.getElementById('spending-chart').getContext('2d');
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Swaps', 'NFT Purchases', 'Transfers', 'Fees'],
        datasets: [{
          data: [62, 27, 6, 5],
          backgroundColor: ['#9945FF', '#14F195', '#00C2FF', '#FF5349'],
          borderColor: '#1A1A1A',
          borderWidth: 2
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
            backgroundColor: '#1E1E1E',
            titleColor: '#FFFFFF',
            bodyColor: '#B3B3B3',
            borderColor: '#333333',
            borderWidth: 1
          }
        }
      }
    });
  }, 100);
}

/**
 * Load token analytics section
 */
function loadTokenAnalytics() {
  const tokenAnalyticsContainer = document.getElementById('token-analytics-content');
  if (!tokenAnalyticsContainer) return;
  
  // In a real implementation, this would fetch token data from APIs
  // For demo purposes, we'll use placeholder data
  
  loadTokenPerformance();
  loadTokenComparison();
}

/**
 * Load token performance chart
 */
function loadTokenPerformance() {
  const performanceContainer = document.getElementById('token-performance');
  if (!performanceContainer) return;
  
  // Create chart container
  performanceContainer.innerHTML = `
    <div class="token-selection">
      <div class="token-selector active" data-token="sol">SOL</div>
      <div class="token-selector" data-token="jup">JUP</div>
      <div class="token-selector" data-token="bonk">BONK</div>
    </div>
    <div class="token-chart-container">
      <canvas id="token-performance-chart"></canvas>
    </div>
    <div class="time-selector">
      <div class="time-option active" data-time="1d">1D</div>
      <div class="time-option" data-time="1w">1W</div>
      <div class="time-option" data-time="1m">1M</div>
      <div class="time-option" data-time="3m">3M</div>
      <div class="time-option" data-time="1y">1Y</div>
      <div class="time-option" data-time="all">ALL</div>
    </div>
  `;
  
  // Generate chart data
  const dataPoints = 24;
  const labels = Array.from({length: dataPoints}, (_, i) => `${i}:00`);
  
  // Generate price data with some trend
  let solData = [];
  let startPrice = 165;
  for (let i = 0; i < dataPoints; i++) {
    // Create a slightly upward trend with some random variation
    const change = (Math.random() - 0.4) * 3; // Slightly biased toward positive
    startPrice += change;
    solData.push(startPrice);
  }
  
  // Load chart
  setTimeout(() => {
    const ctx = document.getElementById('token-performance-chart').getContext('2d');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'SOL Price (USD)',
          data: solData,
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
    
    // Add event listeners to token selectors
    document.querySelectorAll('.token-selector').forEach(selector => {
      selector.addEventListener('click', () => {
        document.querySelectorAll('.token-selector').forEach(s => s.classList.remove('active'));
        selector.classList.add('active');
        // In a real implementation, this would update the chart with the selected token's data
      });
    });
    
    // Add event listeners to time selectors
    document.querySelectorAll('.time-option').forEach(option => {
      option.addEventListener('click', () => {
        document.querySelectorAll('.time-option').forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        // In a real implementation, this would update the chart with the selected timeframe
      });
    });
  }, 100);
}

/**
 * Load token comparison chart
 */
function loadTokenComparison() {
  const comparisonContainer = document.getElementById('token-comparison');
  if (!comparisonContainer) return;
  
  comparisonContainer.innerHTML = `
    <div class="token-metrics">
      <div class="token-metric-card">
        <div class="token-metric-header">
          <div class="token-icon">
            <img src="sol-icon.svg" onerror="this.src='default-token-icon.svg'" alt="SOL">
          </div>
          <div class="token-info">
            <div class="token-name">Solana</div>
            <div class="token-symbol">SOL</div>
          </div>
          <div class="token-price">$167.64</div>
        </div>
        <div class="token-metric-body">
          <div class="metric">
            <div class="metric-name">Market Cap</div>
            <div class="metric-value">$89.3B</div>
          </div>
          <div class="metric">
            <div class="metric-name">24h Volume</div>
            <div class="metric-value">$2.1B</div>
          </div>
          <div class="metric">
            <div class="metric-name">24h Change</div>
            <div class="metric-value positive">+2.34%</div>
          </div>
        </div>
      </div>
      
      <div class="token-metric-card">
        <div class="token-metric-header">
          <div class="token-icon">
            <img src="jup-icon.svg" onerror="this.src='default-token-icon.svg'" alt="JUP">
          </div>
          <div class="token-info">
            <div class="token-name">Jupiter</div>
            <div class="token-symbol">JUP</div>
          </div>
          <div class="token-price">$12.47</div>
        </div>
        <div class="token-metric-body">
          <div class="metric">
            <div class="metric-name">Market Cap</div>
            <div class="metric-value">$5.2B</div>
          </div>
          <div class="metric">
            <div class="metric-name">24h Volume</div>
            <div class="metric-value">$842M</div>
          </div>
          <div class="metric">
            <div class="metric-name">24h Change</div>
            <div class="metric-value positive">+5.67%</div>
          </div>
        </div>
      </div>
      
      <div class="token-metric-card">
        <div class="token-metric-header">
          <div class="token-icon">
            <img src="bonk-icon.svg" onerror="this.src='default-token-icon.svg'" alt="BONK">
          </div>
          <div class="token-info">
            <div class="token-name">Bonk</div>
            <div class="token-symbol">BONK</div>
          </div>
          <div class="token-price">$0.00002341</div>
        </div>
        <div class="token-metric-body">
          <div class="metric">
            <div class="metric-name">Market Cap</div>
            <div class="metric-value">$1.4B</div>
          </div>
          <div class="metric">
            <div class="metric-name">24h Volume</div>
            <div class="metric-value">$521M</div>
          </div>
          <div class="metric">
            <div class="metric-name">24h Change</div>
            <div class="metric-value positive">+10.21%</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="comparison-chart-container">
      <h4>7-Day Performance Comparison</h4>
      <canvas id="comparison-chart"></canvas>
    </div>
  `;
  
  // Load comparison chart
  setTimeout(() => {
    const ctx = document.getElementById('comparison-chart').getContext('2d');
    
    // Generate data points for 7 days
    const labels = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Generate normalized price data (percentage change from day 0)
    function generatePriceChanges(volatility) {
      let result = [0]; // Start at 0% change
      let currentValue = 0;
      
      for (let i = 1; i < 7; i++) {
        // Create random change with specified volatility
        const change = (Math.random() - 0.4) * volatility; // Slightly positive bias
        currentValue += change;
        result.push(currentValue);
      }
      
      return result;
    }
    
    // Generate with different volatility for different tokens
    const solData = generatePriceChanges(2); // Low volatility
    const jupData = generatePriceChanges(5); // Medium volatility
    const bonkData = generatePriceChanges(12); // High volatility
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'SOL',
            data: solData,
            borderColor: '#9945FF',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4
          },
          {
            label: 'JUP',
            data: jupData,
            borderColor: '#14F195',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4
          },
          {
            label: 'BONK',
            data: bonkData,
            borderColor: '#FF5349',
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: '#1E1E1E',
            titleColor: '#FFFFFF',
            bodyColor: '#B3B3B3',
            borderColor: '#333333',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y.toFixed(2) + '%';
                }
                return label;
              }
            }
          },
          legend: {
            position: 'top',
            labels: {
              color: '#B3B3B3'
            }
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
  }, 100);
}
