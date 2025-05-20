import "dotenv/config";
import { Connection, Keypair } from "@solana/web3.js";
import { getQuote } from "./jupiter.js";
import { fetchFromSolscan } from "./solscan.js";

const {
      SOLANA_RPC_URL,
        SOLANA_PRIVATE_KEY
} = process.env;

if (!SOLANA_PRIVATE_KEY) throw new Error("Missing SOLANA_PRIVATE_KEY");

const secret = Uint8Array.from(JSON.parse(SOLANA_PRIVATE_KEY));
const wallet = Keypair.fromSecretKey(secret);
const connection = new Connection(SOLANA_RPC_URL!, "confirmed");

(async () => {
      const quote = await getQuote({
            inputMint:  "So11111111111111111111111111111111111111112", // SOL
                outputMint: "USDCE1zkH1C2oyJBKiyFJbtEyyiRKyy56pDXGfYC9t1", // USDC
                    amount:     "1000000"
      });
        console.log("Best Quote", quote);

          const acct = await fetchFromSolscan(wallet.publicKey.toBase58());
            console.log("Account info", acct);
})();
