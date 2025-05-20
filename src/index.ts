import { Connection, Keypair } from "@solana/web3.js";
import { getQuote } from "./jupiter.js";
import { fetchFromSolscan } from "./solscan.js";
import { config } from "./config.js";

const secret = Uint8Array.from(JSON.parse(config.privateKeyJSON));
const wallet = Keypair.fromSecretKey(secret);
const connection = new Connection(config.rpcUrl, "confirmed");

(async () => {
    const quote = await getQuote({
          inputMint:  "So11111111111111111111111111111111111111112",       // SOL
              outputMint: "USDCE1zkH1C2oyJBKiyFJbtEyyiRKyy56pDXGfYC9t1",       // USDC
                  amount:     "1000000"
    });
      console.log("Best Quote", quote);

        const acct = await fetchFromSolscan(wallet.publicKey.toBase58());
          console.log("Account info", acct);
})();
