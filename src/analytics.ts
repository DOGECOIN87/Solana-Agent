/**
 * Advanced Blockchain Analytics Module
 * 
 * This module provides functions for analyzing Solana blockchain data
 * and extracting insights for the dashboard interface.
 */

import axios from "axios";
import * as web3 from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

// Configure Solscan API
const SOLSCAN_API_KEY = process.env.SOLSCAN_API_KEY;
const SOLSCAN_API_BASE = 'https://pro-api.solscan.io/v2.0';

// Initialize Solana connection
const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));

/**
 * Get general Solana network stats
 * 
 * @returns Current TPS, price, market cap, etc.
 */
export async function getSolanaNetworkStats() {
  try {
    const response = await axios.get('https://public-api.solscan.io/chaininfo');
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error("Error fetching Solana network stats:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get detailed account portfolio with USD values
 * 
 * @param address - Solana account address
 * @returns Portfolio with token balances and USD values
 */
export async function getAccountPortfolio(address: string) {
  try {
    const endpoint = '/account/portfolio';
    const url = `${SOLSCAN_API_BASE}${endpoint}?address=${encodeURIComponent(address)}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': SOLSCAN_API_KEY
      }
    });
    
    if (response.data.success === false) {
      throw new Error(response.data.errors?.message || 'API request failed');
    }
    
    return {
      success: true,
      portfolio: response.data.data
    };
  } catch (error: any) {
    console.error("Error fetching account portfolio:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get token transfer history with analysis
 * 
 * @param address - Account or token address
 * @param isToken - Whether the address is a token mint
 * @param limit - Maximum number of transfers to retrieve
 * @returns Transfer history with analysis
 */
export async function getTransferHistory(address: string, isToken: boolean = false, limit: number = 20) {
  try {
    const endpoint = isToken ? '/token/transfer' : '/account/transfer';
    const params = isToken ? { token: address } : { address };
    
    const queryParams = {
      limit: limit.toString(),
      ...(isToken ? { token: address } : { address })
    };
    
    const url = `${SOLSCAN_API_BASE}${endpoint}?${new URLSearchParams(queryParams).toString()}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': SOLSCAN_API_KEY
      }
    });
    
    if (response.data.success === false) {
      throw new Error(response.data.errors?.message || 'API request failed');
    }
    
    const transfers = response.data.data;
    
    // Calculate transfer metrics
    let inflow = 0;
    let outflow = 0;
    const valueByTime: Record<string, number> = {};
    
    transfers.forEach((transfer: any) => {
      const amount = parseFloat(transfer.amount) || 0;
      const timestamp = new Date(transfer.block_time * 1000).toISOString().split('T')[0];
      
      if (transfer.flow === 'in') {
        inflow += amount;
      } else {
        outflow += amount;
      }
      
      if (!valueByTime[timestamp]) {
        valueByTime[timestamp] = 0;
      }
      valueByTime[timestamp] += transfer.flow === 'in' ? amount : -amount;
    });
    
    // Convert to time series data
    const timeSeriesData = Object.entries(valueByTime).map(([date, value]) => ({
      date,
      netValue: value
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      success: true,
      transfers,
      analysis: {
        totalInflow: inflow,
        totalOutflow: outflow,
        netFlow: inflow - outflow,
        timeSeriesData
      }
    };
  } catch (error: any) {
    console.error("Error fetching transfer history:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get top token holders for a specified token
 * 
 * @param tokenAddress - Token mint address
 * @param limit - Maximum number of holders to retrieve
 * @returns List of top token holders with balances
 */
export async function getTopTokenHolders(tokenAddress: string, limit: number = 20) {
  try {
    const url = `${SOLSCAN_API_BASE}/token/holders?address=${encodeURIComponent(tokenAddress)}&limit=${limit}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': SOLSCAN_API_KEY
      }
    });
    
    if (response.data.success === false) {
      throw new Error(response.data.errors?.message || 'API request failed');
    }
    
    return {
      success: true,
      holders: response.data.data
    };
  } catch (error: any) {
    console.error("Error fetching top token holders:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get trending tokens on Solana
 * 
 * @param limit - Maximum number of trending tokens to retrieve
 * @returns List of trending tokens with price and volume data
 */
export async function getTrendingTokens(limit: number = 10) {
  try {
    const url = `${SOLSCAN_API_BASE}/token/trending?limit=${limit}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': SOLSCAN_API_KEY
      }
    });
    
    if (response.data.success === false) {
      throw new Error(response.data.errors?.message || 'API request failed');
    }
    
    return {
      success: true,
      tokens: response.data.data
    };
  } catch (error: any) {
    console.error("Error fetching trending tokens:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get DeFi activities for an account
 * 
 * @param address - Account address
 * @param limit - Maximum number of activities to retrieve
 * @returns List of DeFi activities with detailed information
 */
export async function getDefiActivities(address: string, limit: number = 20) {
  try {
    const url = `${SOLSCAN_API_BASE}/account/defi/activities?address=${encodeURIComponent(address)}&limit=${limit}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': SOLSCAN_API_KEY
      }
    });
    
    if (response.data.success === false) {
      throw new Error(response.data.errors?.message || 'API request failed');
    }
    
    // Group activities by platform for analysis
    const activities = response.data.data;
    const platformStats: Record<string, { count: number, totalValue: number }> = {};
    
    activities.forEach((activity: any) => {
      const platform = activity.platform || 'Unknown';
      if (!platformStats[platform]) {
        platformStats[platform] = { count: 0, totalValue: 0 };
      }
      
      platformStats[platform].count++;
      if (activity.usd_amount) {
        platformStats[platform].totalValue += parseFloat(activity.usd_amount);
      }
    });
    
    return {
      success: true,
      activities,
      platformAnalysis: Object.entries(platformStats).map(([platform, stats]) => ({
        platform,
        activityCount: stats.count,
        totalValueUSD: stats.totalValue
      }))
    };
  } catch (error: any) {
    console.error("Error fetching DeFi activities:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate risk metrics for a token
 * 
 * @param tokenAddress - Token mint address
 * @returns Risk metrics including liquidity, concentration, and age
 */
export async function calculateTokenRiskMetrics(tokenAddress: string) {
  try {
    // Get token metadata
    const metaUrl = `${SOLSCAN_API_BASE}/token/meta?address=${encodeURIComponent(tokenAddress)}`;
    const metaResponse = await axios.get(metaUrl, {
      headers: {
        'Authorization': SOLSCAN_API_KEY
      }
    });
    
    if (metaResponse.data.success === false) {
      throw new Error(metaResponse.data.errors?.message || 'API request failed');
    }
    
    const tokenData = metaResponse.data.data;
    
    // Get token holders to calculate concentration
    const holdersUrl = `${SOLSCAN_API_BASE}/token/holders?address=${encodeURIComponent(tokenAddress)}&limit=10`;
    const holdersResponse = await axios.get(holdersUrl, {
      headers: {
        'Authorization': SOLSCAN_API_KEY
      }
    });
    
    if (holdersResponse.data.success === false) {
      throw new Error(holdersResponse.data.errors?.message || 'API request failed');
    }
    
    const holders = holdersResponse.data.data;
    
    // Calculate holder concentration (% held by top 3 holders)
    let topThreeHoldings = 0;
    let totalSupply = parseFloat(tokenData.supply || '0');
    
    for (let i = 0; i < Math.min(3, holders.length); i++) {
      topThreeHoldings += parseFloat(holders[i].amount || '0');
    }
    
    const concentrationRisk = totalSupply > 0 ? (topThreeHoldings / totalSupply) * 100 : 0;
    
    // Calculate age risk (newer tokens are higher risk)
    const createdTime = tokenData.created_at || Date.now() / 1000;
    const ageInDays = (Date.now() / 1000 - createdTime) / (60 * 60 * 24);
    const ageRisk = Math.max(0, Math.min(100, 100 - (ageInDays / 365) * 100));
    
    // Calculate liquidity risk
    const liquidityScore = tokenData.volume_24h ? Math.min(100, Math.max(0, 100 - (parseFloat(tokenData.volume_24h) / 1000000) * 10)) : 80;
    
    // Overall risk score (lower is better)
    const overallRisk = (concentrationRisk * 0.4) + (ageRisk * 0.3) + (liquidityScore * 0.3);
    
    return {
      success: true,
      riskMetrics: {
        concentrationRisk: {
          score: concentrationRisk,
          topThreeHoldersPercent: (topThreeHoldings / totalSupply) * 100
        },
        ageRisk: {
          score: ageRisk,
          ageInDays
        },
        liquidityRisk: {
          score: liquidityScore,
          volume24h: tokenData.volume_24h
        },
        overallRisk: {
          score: overallRisk,
          riskLevel: overallRisk < 30 ? 'Low' : overallRisk < 60 ? 'Medium' : 'High'
        }
      }
    };
  } catch (error: any) {
    console.error("Error calculating token risk metrics:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
