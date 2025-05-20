/**
 * Solana Blockchain Dashboard Interface Module
 * 
 * This module provides functions to generate a rich console-based dashboard
 * for visualizing Solana blockchain data and insights.
 */

import Table from 'cli-table3';
import chalk from 'chalk';
import * as analytics from './analytics.js';
import * as jupiterApi from './jupiter.js';
import { PublicKey } from '@solana/web3.js';
import ora from 'ora';
import figlet from 'figlet';
import { format } from 'date-fns';

/**
 * Generate a styled title banner for the dashboard
 * 
 * @returns Formatted title banner text
 */
export function generateDashboardTitle() {
  const title = figlet.textSync('Solana AI Agent', {
    font: 'Standard',
    horizontalLayout: 'full'
  });
  
  return `
${chalk.cyan(title)}
${chalk.yellow('=')}${chalk.yellow('=').repeat(80)}${chalk.yellow('=')}
${chalk.green('◆')} ${chalk.bold('Advanced Blockchain Analytics Dashboard')}
${chalk.yellow('=')}${chalk.yellow('=').repeat(80)}${chalk.yellow('=')}
`;
}

/**
 * Format a number as USD currency
 * 
 * @param value - Number to format
 * @returns Formatted currency string
 */
function formatUSD(value: number): string {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Format a number as compact representation
 * 
 * @param value - Number to format
 * @returns Formatted compact string
 */
function formatCompact(value: number): string {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(2)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(2)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  } else {
    return value.toFixed(2);
  }
}

/**
 * Generate dashboard network overview section
 * 
 * @returns Promise resolved with network overview text
 */
export async function generateNetworkOverview(): Promise<string> {
  const spinner = ora('Fetching network stats...').start();
  try {
    const networkStats = await analytics.getSolanaNetworkStats();
    
    spinner.succeed('Network stats loaded');
    
    if (!networkStats.success) {
      return chalk.red(`Error fetching network stats: ${networkStats.error}`);
    }
    
    const { data } = networkStats;
    
    const table = new Table({
      head: [chalk.cyan('Metric'), chalk.cyan('Value')],
      colWidths: [25, 25]
    });
    
    table.push(
      [chalk.bold('Current Slot'), data.absoluteSlot?.toLocaleString() || 'Unknown'],
      [chalk.bold('TPS'), data.currentTPS?.toFixed(2) || 'Unknown'],
      [chalk.bold('Transaction Count'), data.transactionCount?.toLocaleString() || 'Unknown'],
      [chalk.bold('Epoch'), `${data.currentEpoch || '?'} / ${data.maxEpoch || '?'}`],
      [chalk.bold('SOL Price'), data.solPrice ? formatUSD(data.solPrice) : 'Unknown'],
      [chalk.bold('Market Cap'), data.marketCap ? formatUSD(data.marketCap) : 'Unknown']
    );
    
    const timeNow = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    
    return `
${chalk.bold.green('Network Overview')} ${chalk.dim(`(as of ${timeNow})`)}
${table.toString()}
`;
  } catch (error: any) {
    spinner.fail('Failed to fetch network stats');
    return chalk.red(`Error generating network overview: ${error.message}`);
  }
}

/**
 * Generate trending tokens table
 * 
 * @param limit - Maximum number of tokens to show
 * @returns Promise resolved with trending tokens table text
 */
export async function generateTrendingTokens(limit: number = 5): Promise<string> {
  const spinner = ora('Fetching trending tokens...').start();
  
  try {
    const trendingResponse = await analytics.getTrendingTokens(limit);
    
    spinner.succeed('Trending tokens loaded');
    
    if (!trendingResponse.success) {
      return chalk.red(`Error fetching trending tokens: ${trendingResponse.error}`);
    }
    
    const { tokens } = trendingResponse;
    
    if (!tokens || tokens.length === 0) {
      return chalk.yellow('No trending token data available');
    }
    
    const table = new Table({
      head: [
        chalk.cyan('#'),
        chalk.cyan('Token'),
        chalk.cyan('Symbol'),
        chalk.cyan('Price'),
        chalk.cyan('24h Change'),
        chalk.cyan('Volume (24h)')
      ],
      colWidths: [5, 20, 10, 15, 15, 20]
    });
    
    tokens.slice(0, limit).forEach((token: any, index: number) => {
      const changeColor = parseFloat(token.priceChange24h || 0) >= 0 ? chalk.green : chalk.red;
      const changeSymbol = parseFloat(token.priceChange24h || 0) >= 0 ? '▲' : '▼';
      const changeText = token.priceChange24h ? `${changeSymbol} ${Math.abs(parseFloat(token.priceChange24h)).toFixed(2)}%` : 'N/A';
      
      table.push([
        index + 1,
        token.name || 'Unknown',
        token.symbol || '?',
        token.price ? formatUSD(parseFloat(token.price)) : 'Unknown',
        changeColor(changeText),
        token.volume24h ? formatUSD(parseFloat(token.volume24h)) : 'Unknown'
      ]);
    });
    
    return `
${chalk.bold.green('Trending Tokens')}
${table.toString()}
`;
  } catch (error: any) {
    spinner.fail('Failed to fetch trending tokens');
    return chalk.red(`Error generating trending tokens: ${error.message}`);
  }
}

/**
 * Generate wallet overview section
 * 
 * @param address - Wallet address to analyze
 * @returns Promise resolved with wallet overview text
 */
export async function generateWalletOverview(address: string): Promise<string> {
  if (!address || !address.trim()) {
    return chalk.red('Please provide a valid wallet address');
  }
  
  try {
    // Validate address format
    new PublicKey(address);
  } catch (error) {
    return chalk.red('Invalid Solana wallet address format');
  }
  
  const spinner = ora(`Analyzing wallet ${address.substring(0, 6)}...${address.substring(address.length - 4)}`).start();
  
  try {
    // Fetch portfolio data
    const portfolioResponse = await analytics.getAccountPortfolio(address);
    
    if (!portfolioResponse.success) {
      spinner.fail('Failed to fetch wallet data');
      return chalk.red(`Error: ${portfolioResponse.error}`);
    }
    
    const { portfolio } = portfolioResponse;
    
    // Format the data for display
    spinner.succeed('Wallet analysis complete');
    
    const table = new Table({
      head: [chalk.cyan('Asset'), chalk.cyan('Balance'), chalk.cyan('Value (USD)')],
      colWidths: [25, 20, 20]
    });
    
    // Add SOL balance
    if (portfolio.native_balance) {
      table.push([
        chalk.bold('SOL'),
        portfolio.native_balance.balance || '0',
        formatUSD(parseFloat(portfolio.native_balance.value || '0'))
      ]);
    }
    
    // Add token balances
    if (portfolio.tokens && Array.isArray(portfolio.tokens)) {
      portfolio.tokens.forEach((token: any) => {
        const tokenSymbol = token.symbol || 'Unknown';
        const tokenBalance = token.balance || '0';
        const tokenValue = token.value ? formatUSD(parseFloat(token.value)) : '$0.00';
        
        table.push([tokenSymbol, tokenBalance, tokenValue]);
      });
    }
    
    return `
${chalk.bold.green('Wallet Overview')} ${chalk.dim(address)}
${chalk.bold('Total Value:')} ${formatUSD(parseFloat(portfolio.total_value || '0'))}

${table.toString()}
`;
  } catch (error: any) {
    spinner.fail('Failed to analyze wallet');
    return chalk.red(`Error generating wallet overview: ${error.message}`);
  }
}

/**
 * Generate swap analysis for a potential token swap
 * 
 * @param fromToken - Source token mint address
 * @param toToken - Destination token mint address
 * @param amount - Amount to swap in raw units
 * @returns Promise resolved with swap analysis text
 */
export async function generateSwapAnalysis(fromToken: string, toToken: string, amount: string): Promise<string> {
  const spinner = ora('Analyzing swap options...').start();
  
  try {
    const routeInfo = await jupiterApi.getBestRoute(fromToken, toToken, amount);
    
    if (!routeInfo.success) {
      spinner.fail('Failed to get swap route');
      return chalk.red(`Error: ${routeInfo.error}`);
    }
    
    spinner.succeed('Swap analysis complete');
    
    // Make sure routes array exists
    if (!routeInfo.routes || !Array.isArray(routeInfo.routes)) {
      routeInfo.routes = [];
    }
    
    // Get token information for display
    const popularTokens = jupiterApi.listPopularTokens();
    const fromTokenInfo = popularTokens.find(t => t.mint === fromToken) || { symbol: 'Unknown', name: 'Unknown Token' };
    const toTokenInfo = popularTokens.find(t => t.mint === toToken) || { symbol: 'Unknown', name: 'Unknown Token' };
    
    const routeTable = new Table({
      head: [
        chalk.cyan('Step'),
        chalk.cyan('Source'),
        chalk.cyan('Input'),
        chalk.cyan('Output'),
        chalk.cyan('Fee')
      ],
      colWidths: [6, 15, 15, 15, 10]
    });
    
    routeInfo.routes.forEach((route: any) => {
      routeTable.push([
        route.step,
        route.source,
        formatCompact(parseFloat(route.inAmount)),
        formatCompact(parseFloat(route.outAmount)),
        route.fee ? formatCompact(parseFloat(route.fee)) : 'N/A'
      ]);
    });
    
    const priceImpact = parseFloat(routeInfo.priceImpactPct || '0');
    const priceImpactColor = priceImpact < 1 ? chalk.green : priceImpact < 5 ? chalk.yellow : chalk.red;
    
    return `
${chalk.bold.green('Swap Analysis')}
${chalk.bold('From:')} ${fromTokenInfo.name} (${fromTokenInfo.symbol})
${chalk.bold('To:')} ${toTokenInfo.name} (${toTokenInfo.symbol})
${chalk.bold('Amount:')} ${formatCompact(parseFloat(amount))} ${fromTokenInfo.symbol}
${chalk.bold('Receiving:')} ${routeInfo.outAmount ? formatCompact(parseFloat(routeInfo.outAmount)) : 'N/A'} ${toTokenInfo.symbol}
${chalk.bold('Price Impact:')} ${priceImpactColor(`${priceImpact}%`)}
${chalk.bold('Minimum Received:')} ${routeInfo.otherAmountThreshold ? formatCompact(parseFloat(routeInfo.otherAmountThreshold)) : 'N/A'} ${toTokenInfo.symbol}

${chalk.bold('Routing Path:')}
${routeTable.toString()}
`;
  } catch (error: any) {
    spinner.fail('Failed to analyze swap');
    return chalk.red(`Error generating swap analysis: ${error.message}`);
  }
}

/**
 * Generate token risk analysis
 * 
 * @param tokenAddress - Token mint address to analyze
 * @returns Promise resolved with token risk analysis text
 */
export async function generateTokenRiskAnalysis(tokenAddress: string): Promise<string> {
  const spinner = ora('Analyzing token risk metrics...').start();
  
  try {
    const riskResponse = await analytics.calculateTokenRiskMetrics(tokenAddress);
    
    if (!riskResponse.success) {
      spinner.fail('Failed to analyze token risk');
      return chalk.red(`Error: ${riskResponse.error}`);
    }
    
    spinner.succeed('Token risk analysis complete');
    
    const { riskMetrics } = riskResponse;
    
    if (!riskMetrics) {
      return chalk.red('Unable to retrieve risk metrics for this token');
    }
    
    const getRiskColor = (score: number) => {
      if (score < 30) return chalk.green;
      if (score < 60) return chalk.yellow;
      return chalk.red;
    };
    
    const table = new Table({
      head: [chalk.cyan('Risk Metric'), chalk.cyan('Score'), chalk.cyan('Level'), chalk.cyan('Details')],
      colWidths: [20, 10, 15, 30]
    });
    
    // Concentration risk
    const concentrationRisk = riskMetrics.concentrationRisk.score;
    table.push([
      chalk.bold('Holder Concentration'),
      getRiskColor(concentrationRisk)(`${concentrationRisk.toFixed(1)}`),
      getRiskColor(concentrationRisk)(concentrationRisk < 30 ? 'Low' : concentrationRisk < 60 ? 'Medium' : 'High'),
      `Top 3 holders: ${riskMetrics.concentrationRisk.topThreeHoldersPercent.toFixed(1)}% of supply`
    ]);
    
    // Age risk
    const ageRisk = riskMetrics.ageRisk.score;
    table.push([
      chalk.bold('Token Age'),
      getRiskColor(ageRisk)(`${ageRisk.toFixed(1)}`),
      getRiskColor(ageRisk)(ageRisk < 30 ? 'Low' : ageRisk < 60 ? 'Medium' : 'High'),
      `${Math.floor(riskMetrics.ageRisk.ageInDays)} days old`
    ]);
    
    // Liquidity risk
    const liquidityRisk = riskMetrics.liquidityRisk.score;
    table.push([
      chalk.bold('Liquidity'),
      getRiskColor(liquidityRisk)(`${liquidityRisk.toFixed(1)}`),
      getRiskColor(liquidityRisk)(liquidityRisk < 30 ? 'Low' : liquidityRisk < 60 ? 'Medium' : 'High'),
      `24h volume: ${formatUSD(parseFloat(riskMetrics.liquidityRisk.volume24h || '0'))}`
    ]);
    
    // Overall risk
    const overallRisk = riskMetrics.overallRisk.score;
    table.push([
      chalk.bold('OVERALL RISK'),
      getRiskColor(overallRisk)(`${overallRisk.toFixed(1)}`),
      getRiskColor(overallRisk)(riskMetrics.overallRisk.riskLevel),
      'Weighted average of all metrics'
    ]);
    
    // Create risk gauge display
    const riskGauge = createRiskGauge(overallRisk);
    
    return `
${chalk.bold.green('Token Risk Analysis')}
${chalk.dim(tokenAddress)}

${table.toString()}

${chalk.bold('Risk Gauge:')}
${riskGauge}

${chalk.dim('Lower scores are better. <30 = Low Risk, 30-60 = Medium Risk, >60 = High Risk')}
`;
  } catch (error: any) {
    spinner.fail('Failed to analyze token risk');
    return chalk.red(`Error generating token risk analysis: ${error.message}`);
  }
}

/**
 * Create a visual risk gauge
 * 
 * @param score - Risk score (0-100)
 * @returns ASCII risk gauge
 */
function createRiskGauge(score: number): string {
  const width = 50;
  const position = Math.min(width - 1, Math.floor((score / 100) * width));
  
  let gauge = '';
  
  // Low risk zone (green)
  for (let i = 0; i < width/3; i++) {
    if (i === position) {
      gauge += chalk.black.bgGreen('▼');
    } else {
      gauge += chalk.green('▬');
    }
  }
  
  // Medium risk zone (yellow)
  for (let i = Math.floor(width/3); i < Math.floor(2*width/3); i++) {
    if (i === position) {
      gauge += chalk.black.bgYellow('▼');
    } else {
      gauge += chalk.yellow('▬');
    }
  }
  
  // High risk zone (red)
  for (let i = Math.floor(2*width/3); i < width; i++) {
    if (i === position) {
      gauge += chalk.black.bgRed('▼');
    } else {
      gauge += chalk.red('▬');
    }
  }
  
  return gauge;
}

/**
 * Generate full dashboard text with all sections
 * 
 * @param walletAddress - Optional wallet address to include in analysis
 * @returns Promise resolved with complete dashboard text
 */
export async function generateFullDashboard(walletAddress?: string): Promise<string> {
  let dashboard = generateDashboardTitle();
  
  // Add network overview
  const networkOverview = await generateNetworkOverview();
  dashboard += networkOverview + '\n';
  
  // Add trending tokens
  const trendingTokens = await generateTrendingTokens();
  dashboard += trendingTokens + '\n';
  
  // Add wallet overview if address provided
  if (walletAddress) {
    const walletOverview = await generateWalletOverview(walletAddress);
    dashboard += walletOverview + '\n';
  }
  
  return dashboard;
}
