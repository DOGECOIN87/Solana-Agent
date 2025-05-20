# Solanaâ€‘Agent â€” Repair & Configuration Hardening Oneâ€‘Shot Prompt
# Paste **everything** below into your AI Code Editor (Cline in VSÂ Code) and execute.
# The AI must run each TERMINAL block in order and overwrite each FILE exactly as shown.

#################################################################
# TERMINAL 1 â€” clean up duplicate server & standardise port
#################################################################
cd ~/Projects/Solana-Agent-main

# Remove second, conflicting Webâ€‘UI server script
rm -f src/web-ui/serve.js

# Install missing runtime dependencies & types
npm install chalk@^5 node-fetch@^3 @types/chalk --save

#################################################################
# TERMINAL 2 â€” create / update environment template
#################################################################
cat <<'EOF' > .env.example
# ========= Runtime Credentials =========
SOLSCAN_API_KEY=
JUPITER_API_KEY=
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PRIVATE_KEY=   # JSON array of 64 numbers
PORT=3000             # Port the HTTP server should bind to
EOF

#################################################################
# FILE: tsconfig.json  (OVERWRITE ENTIRE FILE)
#################################################################
{
      "compilerOptions": {
            "target": "ES2022",
                "module": "Node16",
                    "moduleResolution": "Node16",
                        "moduleSuffixes": [".js"],
                            "esModuleInterop": true,
                                "verbatimModuleSyntax": true,
                                    "strict": true,
                                        "rootDir": "src",
                                            "outDir": "build",
                                                "resolveJsonModule": true,
                                                    "skipLibCheck": true
      },
        "include": ["src/**/*"]
}

#################################################################
# FILE: serve.js  (OVERWRITE ENTIRE FILE)
#################################################################
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "src", "web-ui");

const MIME = {
      ".html": "text/html",
        ".js":   "text/javascript",
          ".css":  "text/css",
            ".map":  "application/json",
              ".png":  "image/png",
                ".svg":  "image/svg+xml"
};

const PORT = process.env.PORT || 3000;

http.createServer(async (req, res) => {
      try {
            let filePath = req.url === "/" ? "/index.html" : req.url;
                filePath = path.join(root, filePath);
                    await stat(filePath);                                 // throws on 404

                        const data = await readFile(filePath);
                            const ext  = path.extname(filePath);
                                res.writeHead(200, { "Content-Type": MIME[ext] ?? "text/plain" });
                                    res.end(data);
      } catch {
            res.writeHead(404).end("404 Not Found");
      }
}).listen(PORT, "0.0.0.0", () =>
  console.log(`â–¶ Static UI available on http://localhost:${PORT}`)
  );

  #################################################################
  # FILE: src/config.ts  (NEW FILE)
  #################################################################
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

  #################################################################
  # FILE: src/index.ts  (OVERWRITE ENTIRE FILE)
  #################################################################
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

  #################################################################
  # FILE: src/jupiter.ts  (OVERWRITE ENTIRE FILE)
  #################################################################
  import fetch from "node-fetch";
  import { config } from "./config.js";

  export interface QuoteOptions {
      inputMint: string;
        outputMint: string;
          amount: string;
            slippageBps?: number;
              restrictIntermediateTokens?: string[];
  }

  export async function getQuote(opts: QuoteOptions) {
      const url = "https://quote-api.jup.ag/v6/quote";
        const params = new URLSearchParams({
                ...opts,
                    slippageBps: String(opts.slippageBps ?? 50)
        });
          if (opts.restrictIntermediateTokens)
              params.append("restrictIntermediateTokens", opts.restrictIntermediateTokens.join(","));

                const r = await fetch(`${url}?${params.toString()}`, {
                        headers: { Authorization: `Bearer ${config.jupiterKey}` }
                });
                  if (!r.ok) throw new Error(`Jupiter error ${r.status}`);
                    return r.json();
  }

  #################################################################
  # FILE: src/solscan.ts  (OVERWRITE ENTIRE FILE)
  #################################################################
  import fetch from "node-fetch";
  import { config } from "./config.js";

  export async function fetchFromSolscan(address: string) {
      const r = await fetch(`https://pro-api.solscan.io/v2/account/${address}`, {
            headers: { Authorization: `Bearer ${config.solscanKey}` }
      });
        if (!r.ok) throw new Error(`Solscan HTTP ${r.status}`);
          return r.json();
  }

  #################################################################
  # FILE: package.json  â€” adjust paths only
  #################################################################
  # AIâ€‘editor: Search & replace every occurrence of "build/" with "build/"
  #            and every occurrence of "dist/" with "build/" inside:
  #            â€¢ "scripts" section
  #            â€¢ "bin" field
  #            â€¢ any hardâ€‘coded import paths in test files

  #################################################################
  # TERMINAL 3 â€” build & run validate
  #################################################################
  npm run build              # compiles TS to ./build
  node serve.js              # serves UI
  node build/index.js        # backend demo

  # End of prompt
      })
  }
                })
        })
  }
  }
      })
  })
  }
  }
      }
      }
})
}
      }
}