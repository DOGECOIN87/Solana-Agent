import fetch from "node-fetch";

export interface QuoteOptions {
      inputMint:  string;
        outputMint: string;
          amount:     string;
            slippageBps?: number;
              restrictIntermediateTokens?: string[];   // ✅ typo fixed
}

export async function getQuote(opts: QuoteOptions) {
      const url = "https://quote-api.jup.ag/v6/quote";
        const params = new URLSearchParams({
                ...opts,
                    slippageBps: String(opts.slippageBps ?? 50)
        });
          if (opts.restrictIntermediateTokens)
              params.append("restrictIntermediateTokens", opts.restrictIntermediateTokens.join(","));

                const r = await fetch(`${url}?${params.toString()}`);
                  if (!r.ok) throw new Error(`Jupiter error ${r.status}`);
                    return r.json();
}
