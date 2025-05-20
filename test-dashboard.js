#!/usr/bin/env node

/**
 * Solana AI Agent Dashboard Demo
 * This script demonstrates the dashboard UI capabilities of the Solana AI Agent.
 */

import * as dashboard from './build/dashboard.js';
import ora from 'ora';
import chalk from 'chalk';

// Demo wallet address (Solana Foundation)
const DEMO_WALLET = "3xxgYc3jXPdjqpMdrRyKtcddh6SUUerhVTEwuKkVii3M";
const DEMO_TOKEN = "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"; // Jupiter

async function main() {
  console.clear();
  
  // Display welcome message
  console.log(dashboard.generateDashboardTitle());
  
  // Network Overview
  const spinner1 = ora('Generating network overview...').start();
  const networkOverview = await dashboard.generateNetworkOverview();
  spinner1.stop();
  console.log(networkOverview);
  
  // Trending Tokens
  const spinner2 = ora('Fetching trending tokens...').start();
  const trendingTokens = await dashboard.generateTrendingTokens();
  spinner2.stop();
  console.log(trendingTokens);
  
  // Token Risk Analysis
  const spinner3 = ora(`Analyzing token risk for ${DEMO_TOKEN}...`).start();
  const tokenRisk = await dashboard.generateTokenRiskAnalysis(DEMO_TOKEN);
  spinner3.stop();
  console.log(tokenRisk);
  
  // Wallet Analysis
  const spinner4 = ora(`Analyzing wallet ${DEMO_WALLET}...`).start();
  const walletAnalysis = await dashboard.generateWalletOverview(DEMO_WALLET);
  spinner4.stop();
  console.log(walletAnalysis);
  
  // Swap Analysis
  const spinner5 = ora('Generating swap analysis...').start();
  const swapAnalysis = await dashboard.generateSwapAnalysis(
    "So11111111111111111111111111111111111111112", // SOL
    "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
    "1000000000" // 1 SOL in lamports
  );
  spinner5.stop();
  console.log(swapAnalysis);
  
  console.log(`
${chalk.green('=')}${chalk.green('=').repeat(80)}${chalk.green('=')}
${chalk.bold('Solana AI Agent Dashboard Demo Complete')}
${chalk.green('=')}${chalk.green('=').repeat(80)}${chalk.green('=')}
  `);
}

main().catch(err => {
  console.error(chalk.red('Error in dashboard demo:'), err);
  process.exit(1);
});
