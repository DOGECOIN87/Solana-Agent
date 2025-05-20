# Jupiter Swap API – Full Reference

> **Base URL:** `https://api.jup.ag` (paid tiers)  
> **Free Tier Base URL:** `https://lite-api.jup.ag`  
> **Auth:**  
> • Free tier – *no key required*  
> • Paid tiers – send header `x-api-key: <YOUR_API_KEY>`  
> **Units:** Raw integer units (lamports for SOL, raw decimals for SPL tokens).  
> **Rate Limits:** Free ≈ 60 req / min (1 rps). Paid plans 600 → 30 000 req / min depending on tier.

---

## Table of Contents
1. Overview  
2. Installation & Setup  
3. Quote API (`GET /quote`)  
4. Swap API (`POST /swap`)  
5. Signing & Broadcasting  
6. Example MCP Tool Handlers  
7. Rate Limits & Headers  
8. Security & Best Practices

---

## 1 · Overview

Jupiter is Solana’s leading on‑chain liquidity aggregator.  
The Swap API lets integrators:

* Get **real‑time swap quotes** with optimal routed paths  
* **Build unsigned transactions** that perform the swap on‑chain  
* **Execute swaps** by signing & submitting the transaction  
* Optionally **collect integrator fees** with `feeBps` + `feeAccount`

All pricing & routing logic happens server‑side; you keep custody of the
wallet key and send the signed tx yourself.

---

## 2 · Installation & Setup

```bash
npm install @jup-ag/api           # Jupiter client
npm install @solana/web3.js@1     # Solana web3
npm install bs58 dotenv           # utils
```

```ts
import {{ createJupiterApiClient }} from "@jup-ag/api";
import {{ Connection, Keypair, clusterApiUrl }} from "@solana/web3.js";
import bs58 from "bs58";
import dotenv from "dotenv";
dotenv.config();

// Jupiter client
const jupiter = createJupiterApiClient(
  process.env.API_KEY
    ? {{ apiKey: process.env.API_KEY, basePath: "https://api.jup.ag" }}
    : {{ basePath: "https://lite-api.jup.ag" }}
);

// Solana RPC
const RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl("mainnet-beta");
const connection = new Connection(RPC_URL, {{ commitment: "confirmed" }});

// Wallet
const userKey = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY!));
```

---

## 3 · Quote API  `GET /quote`

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `inputMint`  | string | ✔ | Mint you **send** |
| `outputMint` | string | ✔ | Mint you **receive** |
| `amount`     | string | ✔ | Integer in raw units |
| `slippageBps`| number | ✔ | 50 = 0.5 % slippage |
| `swapMode`   | `"ExactIn" \| "ExactOut"` | ✖ | Default `"ExactIn"` |
| `feeBps`     | number | ✖ | 0–100 (= 0–1 %) integrator fee |
| `restrictIntermediateTokens` | boolean | ✖ | Safer routing |

```ts
const quote = await jupiter.quoteGet({{
  inputMint:  "So11111111111111111111111111111111111111112", // SOL
  outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  amount:      "100000000",   // 1 SOL
  slippageBps: 50,
  restrictIntermediateTokens: true
}});
```

**Response (excerpt)**

```jsonc
{{
  "inAmount": "100000000",
  "outAmount": "16198753",
  "otherAmountThreshold": "16117760",
  "swapMode": "ExactIn",
  "priceImpactPct": "0.12",
  "routePlan": [ {{ "swapInfo": {{ /* … */ }} }} ]
}}
```

---

## 4 · Swap API  `POST /swap`

### Request Body

| Field | Required | Description |
|-------|----------|-------------|
| `quoteResponse` | ✔ | Entire quote object from **/quote** |
| `userPublicKey` | ✔ | Wallet address performing swap |
| `wrapAndUnwrapSol` | ✖ | Auto‑wrap SOL → WSOL (default **true**) |
| `feeAccount` | ✖ | SPL token account to receive fee |
| `asLegacyTransaction` | ✖ | Return **legacy** TX instead of v0 |

```ts
const {{ swapTransaction }} = await jupiter.swapPost({{
  swapRequest: {{
    quoteResponse: quote,
    userPublicKey: userKey.publicKey.toBase58(),
    wrapAndUnwrapSol: true
  }}
}});
```

**Response**

```jsonc
{{
  "swapTransaction": "BASE64_UNSIGNED_TX=="
}}
```

---

## 5 · Signing & Broadcasting

```ts
import {{ VersionedTransaction }} from "@solana/web3.js";

const txBuf = Buffer.from(swapTransaction, "base64");
const tx = VersionedTransaction.deserialize(txBuf);
tx.sign([userKey]);

const txid = await connection.sendRawTransaction(tx.serialize(), {{
  skipPreflight: true,
  maxRetries: 2
}});

await connection.confirmTransaction(txid, "confirmed");
console.log(`https://solscan.io/tx/${{txid}}`);
```

If `asLegacyTransaction: true`, deserialize with `Transaction` instead.

---

## 6 · Example MCP Tool Handlers

```ts
export async function jupiterGetQuote({{ inputMint, outputMint, amount, slippage }}) {{
  return await jupiter.quoteGet({{
    inputMint,
    outputMint,
    amount: amount.toString(),
    slippageBps: slippage * 100
  }});
}}

export async function jupiterExecuteSwap({{ quote }}) {{
  const {{ swapTransaction }} = await jupiter.swapPost({{
    swapRequest: {{
      quoteResponse: quote,
      userPublicKey: userKey.publicKey.toBase58(),
      wrapAndUnwrapSol: true
    }}
  }});
  const tx = VersionedTransaction.deserialize(Buffer.from(swapTransaction, "base64"));
  tx.sign([userKey]);
  return await connection.sendRawTransaction(tx.serialize(), {{ skipPreflight: true }});
}}
```

---

## 7 · Rate Limits & Headers

| Tier | Host | Auth Header | Limit |
|------|------|-------------|-------|
| Free | `lite-api.jup.ag` | *none* | ~60 req / min |
| Pro  | `api.jup.ag` | `x-api-key: <key>` | 600 → 30 000 req / min |

Handle **HTTP 429** with exponential backoff and retry.

---

## 8 · Security & Best Practices

* **Keep private keys off Git** — store in `.env`, vault, or KMS/HSM.  
* Use a **dedicated wallet** with limited funds for automated agents.  
* Validate `quote.outAmount` before signing to avoid bad routes.  
* Monitor `sendRawTransaction` failures (slippage, blockhash) and pull a fresh quote if needed.  
* Prefer **versioned transactions** for large multi‑hop swaps.  
* Test on devnet or with small amounts before mainnet.

---

*Generated 2025‑05‑20.*
