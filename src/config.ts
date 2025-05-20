import "dotenv/config";
import { loadSettings } from "./settings.js";

// For backward compatibility
function getEnv(name: string, defaultValue?: string): string {
  const v = process.env[name];
  if (!v && defaultValue === undefined) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return v || defaultValue || "";
}

// Config with initial environment variables
export const config = {
  solscanKey: getEnv("SOLSCAN_API_KEY", ""),
  jupiterKey: getEnv("JUPITER_API_KEY", ""),
  rpcUrl: getEnv("SOLANA_RPC_URL", "https://api.mainnet-beta.solana.com"),
  privateKeyJSON: getEnv("SOLANA_PRIVATE_KEY", ""),
  port: Number(process.env.PORT || "3000"),
};

// Function to load user settings and override config values
export async function loadUserSettings() {
  try {
    const settings = await loadSettings();
    
    // Override config with user settings if they exist
    if (settings.solscanKey) config.solscanKey = settings.solscanKey;
    if (settings.jupiterKey) config.jupiterKey = settings.jupiterKey;
    if (settings.rpcUrl) config.rpcUrl = settings.rpcUrl;
    if (settings.privateKeyJSON) config.privateKeyJSON = settings.privateKeyJSON;
    
    console.log("User settings loaded successfully");
    
    // Validate required settings
    const missing = [];
    if (!config.solscanKey) missing.push("Solscan API Key");
    if (!config.jupiterKey) missing.push("Jupiter API Key");
    if (!config.privateKeyJSON) missing.push("Solana Private Key");
    
    if (missing.length > 0) {
      console.warn(`Missing required settings: ${missing.join(", ")}`);
    }
    
    return config;
  } catch (error) {
    console.error("Failed to load user settings:", error);
    return config;
  }
}
