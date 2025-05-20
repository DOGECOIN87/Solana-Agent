import { Connection, Keypair } from "@solana/web3.js";
import { getQuote } from "./jupiter.js";
import { fetchFromSolscan } from "./solscan.js";
import { config, loadUserSettings } from "./config.js";

// Main function to run the application
async function main() {
  try {
    // Load user settings first
    console.log("Loading user settings...");
    await loadUserSettings();
    
    // Now use the updated config
    console.log("Initializing wallet and connection...");
    
    if (!config.privateKeyJSON) {
      throw new Error("Missing privateKeyJSON – set it in the UI or .env");
    }
    
    const secret = Uint8Array.from(JSON.parse(config.privateKeyJSON));
    const wallet = Keypair.fromSecretKey(secret);
    const connection = new Connection(config.rpcUrl, "confirmed");
    
    console.log("Fetching quote from Jupiter...");
    const quote = await getQuote({
      inputMint: "So11111111111111111111111111111111111111112", // SOL
      outputMint: "USDCE1zkH1C2oyJBKiyFJbtEyyiRKyy56pDXGfYC9t1", // USDC
      amount: "1000000"
    });
    console.log("Best Quote", quote);
    
    console.log("Fetching account info from Solscan...");
    const acct = await fetchFromSolscan(wallet.publicKey.toBase58());
    console.log("Account info", acct);
    
    return { quote, acct };
  } catch (error) {
    console.error("Application error:", error);
    throw error;
  }
}

// Execute main function
main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
