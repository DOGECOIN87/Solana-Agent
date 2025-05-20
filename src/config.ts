import "dotenv/config";

function requireEnv(name: string): string {
    const v = process.env[name];
      if (!v) throw new Error(`Missing environment variable: ${name}`);
        return v;
}

export const config = {
    solscanKey:           requireEnv("SOLSCAN_API_KEY"),
      jupiterKey:           requireEnv("JUPITER_API_KEY"),
        rpcUrl:               requireEnv("SOLANA_RPC_URL"),
          privateKeyJSON:       requireEnv("SOLANA_PRIVATE_KEY"),
            port:                 Number(process.env.PORT || "3000")
};
