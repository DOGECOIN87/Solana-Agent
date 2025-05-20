import fetch from "node-fetch";
import { config } from "./config.js";

export async function fetchFromSolscan(address: string) {
    const r = await fetch(`https://pro-api.solscan.io/v2/account/${address}`, {
          headers: { Authorization: `Bearer ${config.solscanKey}` }
    });
      if (!r.ok) throw new Error(`Solscan HTTP ${r.status}`);
        return r.json();
}
