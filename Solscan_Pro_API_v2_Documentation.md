
# Solscan Pro API v2.0 – Full Reference

> **Base URL:** `https://pro-api.solscan.io/v2.0`  
> **Auth:** All endpoints (except `chaininfo`) require an `Authorization: <API‑KEY>` header.  
> **Units:** Lamports for SOL, raw base‑unit integers for SPL tokens.  
> **Rate Limits:** Enforced by Compute Units (CU). Export endpoints are limited to 1 req/min.

---

## Table of Contents
1. Account APIs  
2. Token APIs  
3. NFT APIs  
4. Transaction APIs  
5. Block APIs  
6. Market APIs  
7. Program APIs  
8. Monitoring APIs  
9. Chain Information (public)

---

## 1 · Account APIs

### 1.1  GET `/account/detail`
Returns core account metadata and lamport balance.

| Param |Type|Required|Notes|
|-------|----|--------|-----|
|`address`|string|✔|Wallet address|

**Response**
```json
{
  "success": true,
  "data": {
    "account":       "111…",
    "lamports":      123456789,
    "type":          "account",
    "executable":    false,
    "owner_program": "BPFLoaderUpgradeab1e11111111111111111111111",
    "rent_epoch":    550,
    "is_oncurve":    1
  }
}
```

---

### 1.2  GET `/account/transfer`
Paginated SPL‑token/SOL transfer history with fine‑grained filters.

Key filters  

```
address=<wallet>
activity_type[]=ACTIVITY_SPL_TRANSFER
token=<mint>          # include SOL mint for native transfers
from_time=1700000000
to_time=1700600000
flow=in|out
page=1
page_size=40
```

Each record contains `block_id`, `trans_id`, `activity_type`, `from_address`,
`to_address`, `token_address`, `token_decimals`, `amount`, `flow`.

> **Export CSV** → `/account/transfer/export`  
> Same filters, returns a CSV file (≤ 5 000 rows, 1 req/min).

---

### 1.3  GET `/account/defi/activities`
Decoded DeFi actions (swaps, LP add/remove, vault deposit, stake, etc.).
Accepts `activity_type[]`, `platform[]`, `token`, time range, pagination.

Each entry exposes routed swaps via nested `routers → child_routers`.

---

### 1.4  GET `/account/balance_change`
Token/SOL balance‑delta feed. Negative `amount` values = outflow.

---

### 1.5  GET `/account/transactions`
Lightweight signature list (`slot`, `fee`, `tx_hash`, etc.).  
Pagination via `before=<signature>` cursor.

---

### 1.6  GET `/account/portfolio`
Aggregated USD value, plus per‑token breakdown:

```
{
  "native_balance": { "balance": 3.14, "token_price": 150, ... },
  "tokens": [
     { "token_address": "...", "balance": 42, "value": 1234.56, ... }
  ],
  "total_value": 15000.78
}
```

---

### 1.7  GET `/account/token-accounts`
List SPL token or NFT accounts; filter via `type=token|nft`, `hide_zero=true`.

---

### 1.8  GET `/account/stake`   ·   **1 req/min CSV** via `/account/reward/export`.

Stake account fields: `amount`, `voter`, `status`, `activation_epoch`, `total_reward`, etc.

---

### 1.9  GET `/account/metadata`
Labels/icons/tags/domains for the address.

### 1.10  GET `/account/leaderboard`
Global rich‑list. Sort by `sol_values | stake_values | token_values | total_values`.

---

## 2 · Token APIs

### 2.1  GET `/token/transfer`
Chain‑wide transfer feed for a given mint; identical filters to 1.2.

### 2.2  GET `/token/defi/activities`
DeFi events where the mint appears.

### 2.3  GET `/token/markets`
List LP/Serum markets containing the mint.

### 2.4  GET `/token/meta`  &  `/token/meta/multi`
Static token metadata (name, symbol, decimals, price, supply, creator, …).

### 2.5  GET `/token/price`  /  `/token/price/multi`
Daily OHLC‑style USD price time series.

### 2.6  GET `/token/holders`
Top holders, supports `from_amount` / `to_amount`.

### 2.7  GET `/token/list`
Sortable token directory (`holder`, `market_cap`, `created_time`).

### 2.8  GET `/token/top`
Default top‑N list (market‑cap ranked).

### 2.9  GET `/token/trending`
Hot tokens; optional `limit=N`.

---

## 3 · NFT APIs

*New NFT feed*, *Marketplace activities*, *Collection stats & items*:

| Endpoint|Purpose|
|---------|-------|
|`/nft/news`|Recent mints (`filter=created_time`)|
|`/nft/activities`|Sales / bids / listings (filter by `activity_type[]`, collection, price range)|
|`/nft/collection/lists`|Ranked collections (floor, volume, items)|
|`/nft/collection/items`|Items inside a collection with last trade data|

---

## 4 · Transaction APIs

*Latest tx*, *Detailed tx*, *Decoded actions*:

- `GET /transaction/last?limit=40&filter=exceptVote`
- `GET /transaction/detail?tx=<sig>`
- `GET /transaction/actions?tx=<sig>`

Detail response includes compute‑unit cost, inner instructions, SPL transfers, balance diffs.

---

## 5 · Block APIs

- `GET /block/last?limit=20`
- `GET /block/transactions?block=<slot>&exclude_vote=true`
- `GET /block/detail?block=<slot>`

---

## 6 · Market APIs

- `GET /market/list`   → filter by `program`, `token_address`
- `GET /market/info?address=<pool>`
- `GET /market/volume?address=<pool>&time[]=YYYYMMDD&time[]=YYYYMMDD`

---

## 7 · Program APIs

`GET /program/list`   Sort by `num_txs`, `success_rate`, `active_users_24h`, etc.

---

## 8 · Monitoring APIs

`GET /monitor/usage`   → Remaining CUs, total requests + success‑rate last 24h.

---

## 9 · Public Chain Info

`GET https://public-api.solscan.io/chaininfo`  
(Current TPS, slot, epoch, etc.)

---

### Error Schema (common)

```json
{
  "success": false,
  "errors": {
    "code": 400,
    "message": "invalid address"
  }
}
```

Common HTTP codes: **400** bad input, **401** auth failed, **429** too many requests, **500** server error.

---

### Export Endpoint Limits
| Endpoint | Limit |
|----------|-------|
|`/account/transfer/export`|≤ 5 000 rows, 1 req/min|
|`/account/reward/export`  |≤ 5 000 rows, 1 req/min|

---

### Compute Units (CU)
Each request consumes CU proportional to complexity; usage and remaining quota are visible via `/monitor/usage`.

---

*Generated 2025‑05‑20.  Sources: Solscan Pro API v2.0 reference.*