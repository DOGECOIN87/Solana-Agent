#!/usr/bin/env node

/**
 * Solscan Agent MCP Server
 * This server provides tools to interact with the Solscan API and Solana blockchain.
 * It demonstrates:
 * - Fetching Solana account and token information
 * - Transaction history lookups
 * - Wallet integration for signing transactions
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import axios from "axios";
import * as web3 from "@solana/web3.js";
import * as jupiterApi from "./jupiter.js";
import * as analytics from "./analytics.js";
import * as dashboard from "./dashboard.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Load environment variables
dotenv.config();

// Configure Solscan API
const SOLSCAN_API_KEY = process.env.SOLSCAN_API_KEY;
const SOLSCAN_API_BASE = 'https://pro-api.solscan.io/v2.0';
const SOLANA_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY;

// Initialize Solana connection to mainnet-beta
const connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));

// Initialize wallet with a fixed seed for consistent address across restarts
// In a real-world scenario, you would use a secure private key from keystore
let wallet: web3.Keypair;
try {
  // Use a fixed seed for consistent wallet address (FOR DEMO ONLY)
  const seed = Uint8Array.from(
    Array(32).fill(0).map((_, i) => i + 1)
  );
  wallet = web3.Keypair.fromSeed(seed);
  console.log('Using test wallet for demonstration purposes');
  console.log(`Wallet address: ${wallet.publicKey.toString()}`);
} catch (error) {
  console.error('Failed to initialize wallet:', error);
  process.exit(1);
}

// In-memory cache for recent API responses
const cache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_TTL = 60 * 1000; // 1 minute

/**
 * Helper function to make API requests to Solscan with caching
 */
async function fetchFromSolscan(endpoint: string, params: Record<string, any> = {}) {
  const queryString = Object.keys(params)
    .filter(key => params[key] !== undefined)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  
  const url = `${SOLSCAN_API_BASE}${endpoint}${queryString ? '?' + queryString : ''}`;
  const cacheKey = url;
  
  // Check cache first
  if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp) < CACHE_TTL) {
    return cache[cacheKey].data;
  }
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': SOLSCAN_API_KEY
      }
    });
    
    if (response.data.success === false) {
      throw new Error(response.data.errors?.message || 'API request failed');
    }
    
    // Cache the response
    cache[cacheKey] = {
      data: response.data,
      timestamp: Date.now()
    };
    
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Solscan API error: ${error.response?.data?.errors?.message || error.message}`);
    }
    throw error;
  }
}

/**
 * Create an MCP server with capabilities for resources and tools
 * that interact with the Solscan API and Solana blockchain
 */
const server = new Server(
  {
    name: "solscan-agent",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

/**
 * Handler for listing available Solscan resources
 * Provides account and token information as resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const walletAddress = wallet?.publicKey.toString();
  
  return {
    resources: [
      {
        uri: `solscan://chaininfo`,
        mimeType: "application/json",
        name: "Solana Chain Info",
        description: "Current Solana network status and statistics"
      },
      ...(walletAddress ? [{
        uri: `solscan://wallet/${walletAddress}`,
        mimeType: "application/json",
        name: "Connected Wallet",
        description: `Information about the connected wallet: ${walletAddress}`
      }] : [])
    ]
  };
});

/**
 * Handler for reading Solscan resources
 * Fetches data from Solscan API based on the requested URI
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const resourceType = url.pathname.replace(/^\//, '');

  if (resourceType === 'chaininfo') {
    try {
      const response = await axios.get('https://public-api.solscan.io/chaininfo');
      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch chain info: ${error.message}`);
    }
  } else if (resourceType.startsWith('wallet/')) {
    const address = resourceType.replace('wallet/', '');
    try {
      const accountData = await fetchFromSolscan('/account/detail', { address });
      return {
        contents: [{
          uri: request.params.uri,
          mimeType: "application/json",
          text: JSON.stringify(accountData, null, 2)
        }]
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch wallet info: ${error.message}`);
    }
  }

  throw new Error(`Resource not found: ${resourceType}`);
});

/**
 * Handler that lists available tools for Solscan and Solana interactions
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
    // Account Tools
    {
      name: "get_account_info",
      description: "Get detailed information about a Solana account",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Solana account address"
          }
        },
        required: ["address"]
      }
    },
    {
      name: "get_token_info",
      description: "Get information about a Solana SPL token",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Token mint address"
          }
        },
        required: ["address"]
      }
    },
    {
      name: "get_transaction_history",
      description: "Get transaction history for an account",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Solana account address"
          },
          limit: {
            type: "number",
            description: "Maximum number of transactions to return (default: 10)"
          }
        },
        required: ["address"]
      }
    },

    // Dashboard Tools
    {
      name: "get_network_overview",
      description: "Get a comprehensive overview of the Solana network",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    },
    {
      name: "get_trending_tokens",
      description: "Get trending tokens on Solana with price and volume data",
      inputSchema: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of trending tokens to retrieve (default: 5)"
          }
        },
        required: []
      }
    },
    {
      name: "analyze_wallet",
      description: "Generate a comprehensive analysis of a wallet's holdings and activity",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Solana wallet address to analyze"
          }
        },
        required: ["address"]
      }
    },
    
    // Advanced Analytics Tools
    {
      name: "analyze_token_risk",
      description: "Get detailed risk metrics for a token including concentration, liquidity, and age analysis",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Token mint address to analyze"
          }
        },
        required: ["address"]
      }
    },
    
    // Jupiter Swap Tools
    {
      name: "get_swap_quote",
      description: "Get a swap quote for trading between two tokens via Jupiter",
      inputSchema: {
        type: "object",
        properties: {
          inputMint: {
            type: "string",
            description: "Input token mint address"
          },
          outputMint: {
            type: "string",
            description: "Output token mint address"
          },
          amount: {
            type: "string",
            description: "Amount to swap in raw units (based on token decimals)"
          },
          slippageBps: {
            type: "number",
            description: "Slippage tolerance in basis points (e.g., 50 = 0.5%)"
          }
        },
        required: ["inputMint", "outputMint", "amount"]
      }
    },
    {
      name: "analyze_swap",
      description: "Analyze a potential swap between two tokens with detailed routing insights",
      inputSchema: {
        type: "object",
        properties: {
          fromToken: {
            type: "string",
            description: "Source token mint address"
          },
          toToken: {
            type: "string",
            description: "Destination token mint address"
          },
          amount: {
            type: "string",
            description: "Amount to swap in raw units"
          }
        },
        required: ["fromToken", "toToken", "amount"]
      }
    },
    {
      name: "list_popular_tokens",
      description: "List popular tokens on Solana with their addresses",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    }
  ];
  
  // Add wallet-specific tools if a wallet is connected
  if (wallet) {
    tools.push({
      name: "get_wallet_balance",
      description: "Get the balance of the connected wallet",
      inputSchema: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "Optional wallet address (uses connected wallet if not provided)"
          }
        },
        required: []
      }
    });
    
    tools.push({
      name: "generate_wallet_dashboard",
      description: "Generate a complete dashboard for the connected wallet with all metrics",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      }
    });
  }
  
  return { tools };
});

/**
 * Handler for Solscan and Solana tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "get_account_info": {
      const address = String(request.params.arguments?.address);
      if (!address) {
        throw new Error("Address is required");
      }
      
      try {
        const data = await fetchFromSolscan('/account/detail', { address });
        return {
          content: [{
            type: "text",
            text: `## Account Information for ${address}\n\n` +
                  `**Type:** ${data.data.type}\n` +
                  `**Balance:** ${data.data.lamports / 1e9} SOL\n` +
                  `**Owner Program:** ${data.data.owner_program}\n` +
                  `**Executable:** ${data.data.executable ? 'Yes' : 'No'}\n`
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to get account info: ${error.message}`);
      }
    }
    
    case "get_token_info": {
      const address = String(request.params.arguments?.address);
      if (!address) {
        throw new Error("Token mint address is required");
      }
      
      try {
        const data = await fetchFromSolscan('/token/meta', { address });
        return {
          content: [{
            type: "text",
            text: `## Token Information for ${address}\n\n` +
                  `**Name:** ${data.data.name || 'Unknown'}\n` +
                  `**Symbol:** ${data.data.symbol || 'Unknown'}\n` +
                  `**Decimals:** ${data.data.decimals}\n` +
                  `**Total Supply:** ${data.data.supply}\n` +
                  `**Price (USD):** $${data.data.price || 'Unknown'}\n`
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to get token info: ${error.message}`);
      }
    }
    
    case "get_transaction_history": {
      const address = String(request.params.arguments?.address);
      const limit = Number(request.params.arguments?.limit) || 10;
      
      if (!address) {
        throw new Error("Address is required");
      }
      
      try {
        const data = await fetchFromSolscan('/account/transactions', { 
          account: address, 
          limit
        });
        
        let responseText = `## Transaction History for ${address}\n\n`;
        
        if (data.data && data.data.length > 0) {
          data.data.forEach((tx: any, index: number) => {
            responseText += `${index + 1}. **Signature:** ${tx.txHash}\n`;
            responseText += `   **Slot:** ${tx.slot}\n`;
            responseText += `   **Fee:** ${tx.fee / 1e9} SOL\n`;
            responseText += `   **Status:** ${tx.status === 'Success' ? '✅ Success' : '❌ Failed'}\n\n`;
          });
        } else {
          responseText += "No transactions found for this address.";
        }
        
        return {
          content: [{
            type: "text",
            text: responseText
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to get transaction history: ${error.message}`);
      }
    }
    
    case "get_wallet_balance": {
      if (!wallet) {
        throw new Error("No wallet is connected");
      }
      
      try {
        const address = wallet.publicKey.toString();
        const balance = await connection.getBalance(wallet.publicKey);
        
        return {
          content: [{
            type: "text",
            text: `## Connected Wallet Balance\n\n` +
                  `**Address:** ${address}\n` +
                  `**Balance:** ${balance / 1e9} SOL\n`
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to get wallet balance: ${error.message}`);
      }
    }
    
    // Dashboard Tools
    case "get_network_overview": {
      try {
        const networkOverviewText = await dashboard.generateNetworkOverview();
        return {
          content: [{
            type: "text",
            text: networkOverviewText
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to generate network overview: ${error.message}`);
      }
    }
    
    case "get_trending_tokens": {
      const limit = Number(request.params.arguments?.limit) || 5;
      
      try {
        const trendingTokensText = await dashboard.generateTrendingTokens(limit);
        return {
          content: [{
            type: "text",
            text: trendingTokensText
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to get trending tokens: ${error.message}`);
      }
    }
    
    case "analyze_wallet": {
      const address = String(request.params.arguments?.address);
      if (!address) {
        throw new Error("Wallet address is required");
      }
      
      try {
        const walletAnalysisText = await dashboard.generateWalletOverview(address);
        return {
          content: [{
            type: "text",
            text: walletAnalysisText
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to analyze wallet: ${error.message}`);
      }
    }
    
    case "analyze_token_risk": {
      const address = String(request.params.arguments?.address);
      if (!address) {
        throw new Error("Token address is required");
      }
      
      try {
        const riskAnalysisText = await dashboard.generateTokenRiskAnalysis(address);
        return {
          content: [{
            type: "text",
            text: riskAnalysisText
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to analyze token risk: ${error.message}`);
      }
    }
    
    // Jupiter Swap Tools
    case "get_swap_quote": {
      const inputMint = String(request.params.arguments?.inputMint);
      const outputMint = String(request.params.arguments?.outputMint);
      const amount = String(request.params.arguments?.amount);
      const slippageBps = Number(request.params.arguments?.slippageBps) || 50;
      
      if (!inputMint || !outputMint || !amount) {
        throw new Error("Input mint, output mint, and amount are required");
      }
      
      try {
        const quoteResponse = await jupiterApi.getSwapQuote(
          inputMint,
          outputMint,
          amount,
          slippageBps
        );
        
        if (!quoteResponse.success || !quoteResponse.quote) {
          throw new Error(quoteResponse.error || "Failed to get valid quote");
        }
        
        const quote = quoteResponse.quote;
        
        return {
          content: [{
            type: "text",
            text: `## Swap Quote\n\n` +
                  `**Input:** ${amount} (${inputMint})\n` +
                  `**Output:** ${quote.outAmount} (${outputMint})\n` +
                  `**Min. Received:** ${quote.otherAmountThreshold}\n` +
                  `**Price Impact:** ${quote.priceImpactPct}%\n` +
                  `**Route Steps:** ${quote.routePlan.length}\n`
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to get swap quote: ${error.message}`);
      }
    }
    
    case "analyze_swap": {
      const fromToken = String(request.params.arguments?.fromToken);
      const toToken = String(request.params.arguments?.toToken);
      const amount = String(request.params.arguments?.amount);
      
      if (!fromToken || !toToken || !amount) {
        throw new Error("From token, to token, and amount are required");
      }
      
      try {
        const swapAnalysisText = await dashboard.generateSwapAnalysis(
          fromToken,
          toToken, 
          amount
        );
        
        return {
          content: [{
            type: "text",
            text: swapAnalysisText
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to analyze swap: ${error.message}`);
      }
    }
    
    case "list_popular_tokens": {
      try {
        const tokens = jupiterApi.listPopularTokens();
        let responseText = `## Popular Tokens on Solana\n\n`;
        
        tokens.forEach((token, index) => {
          responseText += `${index + 1}. **${token.name} (${token.symbol})** - \`${token.mint}\`\n`;
        });
        
        return {
          content: [{
            type: "text",
            text: responseText
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to list popular tokens: ${error.message}`);
      }
    }
    
    case "generate_wallet_dashboard": {
      if (!wallet) {
        throw new Error("No wallet is connected");
      }
      
      try {
        const walletAddress = wallet.publicKey.toString();
        const fullDashboardText = await dashboard.generateFullDashboard(walletAddress);
        
        return {
          content: [{
            type: "text",
            text: fullDashboardText
          }]
        };
      } catch (error: any) {
        throw new Error(`Failed to generate wallet dashboard: ${error.message}`);
      }
    }
    
    default:
      throw new Error("Unknown tool");
  }
});

/**
 * Start the server using stdio transport.
 * This allows the server to communicate via standard input/output streams.
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
