import fetch from "node-fetch";
const { SOLSCAN_API_KEY } = process.env;

export async function fetchFromSolscan(address: string) {
      const r = await fetch(`https://pro-api.solscan.io/v2/account/${address}`, {
            headers: { Authorization: `Bearer ${SOLSCAN_API_KEY}` }
      });
        if (!r.ok) throw new Error(`Solscan HTTP ${r.status}`);
          const data = await r.json();
            return data;
}
