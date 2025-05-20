/**
 * Jupiter Swap API Integration Module
 * 
 * This module provides functions to interact with Jupiter's Swap API
 * for token swaps on Solana blockchain.
 */

import axios from "axios";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { createJupiterApiClient } from "@jup-ag/api";
import bs58 from "bs58";
import dotenv from "dotenv";

dotenv.config();

// Constants
const JUPITER_API_KEY = process.env.JUPITER_API_KEY;
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// Initialize Jupiter API client
const jupiter = createJupiterApiClient(
  JUPITER_API_KEY
    ? { apiKey: JUPITER_API_KEY, basePath: "https://api.jup.ag" }
    : { basePath: "https://lite-api.jup.ag" }
);

// Initialize Solana connection
const connection = new Connection(SOLANA_RPC_URL, { commitment: "confirmed" });

/**
 * Get a swap quote from Jupiter
 * 
 * @param inputMint - Mint address of the token to swap from
 * @param outputMint - Mint address of the token to swap to
 * @param amount - Amount to swap in raw units
 * @param slippageBps - Slippage tolerance in basis points (e.g., 50 = 0.5%)
 * @param swapMode - ExactIn or ExactOut
 * @returns Swap quote response
 */
export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: string,
  slippageBps: number = 50,
  swapMode: "ExactIn" | "ExactOut" = "ExactIn"
) {
  try {
    const quote = await jupiter.quoteGet({
      inputMint,
      outputMint,
      amount: parseInt(amount),
      slippageBps,
      swapMode,
      restrictIntermediateTokens: true
    });
    
    return {
      success: true,
      quote
    };
  } catch (error: any) {
    console.error("Error getting swap quote:", error);
    return {
      success: false,
      error: error.message || "Failed to get swap quote"
    };
  }
}

/**
 * Build a swap transaction from a quote
 * 
 * @param quote - Quote response from getSwapQuote
 * @param walletPublicKey - Public key of the wallet performing the swap
 * @returns Base64 encoded unsigned transaction
 */
export async function buildSwapTransaction(
  quote: any,
  walletPublicKey: string
) {
  try {
    const { swapTransaction } = await jupiter.swapPost({
      swapRequest: {
        quoteResponse: quote,
        userPublicKey: walletPublicKey,
        wrapAndUnwrapSol: true
      }
    });
    
    return {
      success: true,
      swapTransaction
    };
  } catch (error: any) {
    console.error("Error building swap transaction:", error);
    return {
      success: false,
      error: error.message || "Failed to build swap transaction"
    };
  }
}

/**
 * Calculate price impact for a swap
 * 
 * @param inputAmount - Amount of input token in raw units
 * @param inputDecimals - Decimals of input token
 * @param outputAmount - Amount of output token in raw units
 * @param outputDecimals - Decimals of output token
 * @param inputPrice - USD price of input token
 * @param outputPrice - USD price of output token
 * @returns Price impact percentage
 */
export function calculatePriceImpact(
  inputAmount: string,
  inputDecimals: number,
  outputAmount: string,
  outputDecimals: number,
  inputPrice: number,
  outputPrice: number
) {
  // Calculate the value in USD
  const inputValue = (parseFloat(inputAmount) / (10 ** inputDecimals)) * inputPrice;
  const outputValue = (parseFloat(outputAmount) / (10 ** outputDecimals)) * outputPrice;
  
  // Calculate price impact
  const priceImpact = ((inputValue - outputValue) / inputValue) * 100;
  
  return Math.max(0, priceImpact);
}

/**
 * Get the best route for a token swap
 * 
 * @param inputMint - Mint address of the input token
 * @param outputMint - Mint address of the output token
 * @param amount - Amount to swap in raw units
 * @returns The best route for the swap
 */
export async function getBestRoute(
  inputMint: string,
  outputMint: string,
  amount: string
) {
  try {
    const quoteResponse = await getSwapQuote(inputMint, outputMint, amount);
    
    if (!quoteResponse.success) {
      throw new Error(quoteResponse.error);
    }
    
    if (!quoteResponse.quote) {
      throw new Error("Unable to get quote information");
    }

    // Extract route information from the quote
    const quote = quoteResponse.quote;
    const routePlan = quote.routePlan || [];
    const outAmount = quote.outAmount;
    const otherAmountThreshold = quote.otherAmountThreshold;
    const priceImpactPct = quote.priceImpactPct;
    
    // Format route information
    const routes = routePlan.map((route: any, index: number) => {
      const { swapInfo } = route;
      return {
        step: index + 1,
        source: swapInfo.label || "Unknown",
        inputMint: swapInfo.inputMint,
        outputMint: swapInfo.outputMint,
        inAmount: swapInfo.inAmount,
        outAmount: swapInfo.outAmount,
        fee: swapInfo.fee
      };
    });
    
    return {
      success: true,
      routes,
      outAmount,
      otherAmountThreshold,
      priceImpactPct
    };
  } catch (error: any) {
    console.error("Error getting best route:", error);
    return {
      success: false,
      error: error.message || "Failed to get best route"
    };
  }
}

/**
 * List popular tokens on Solana with their addresses
 * 
 * @returns List of popular tokens with their addresses
 */
export function listPopularTokens() {
  // Common tokens on Solana
  return [
    { symbol: "SOL", name: "Solana", mint: "So11111111111111111111111111111111111111112" },
    { symbol: "USDC", name: "USD Coin", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
    { symbol: "USDT", name: "Tether USD", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" },
    { symbol: "BONK", name: "Bonk", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
    { symbol: "JUP", name: "Jupiter", mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" }
  ];
}
