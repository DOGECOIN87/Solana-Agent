
# Cline Model Context Protocol (MCP) – Full Reference

> **Spec Version:** MCP&nbsp;1.1  
> **Applies To:** Cline AI IDE, VS Code Extension, Cursor, Claude Desktop (and any LLM client that implements the Model Context Protocol)  
> **Transports:** `STDIO` (local) &nbsp;·&nbsp; `SSE` (remote)  
> **Auth:** Local STDIO servers inherit the user’s permissions. Remote SSE servers typically require an API key or bearer token in the `Authorization` header.  
> **Rate Limits:** Determined by each server/tool or the upstream API it calls. See individual servers for limits.

---

## Table of Contents
1. MCP Overview  
2. Adding MCP Servers from GitHub  
3. Configuring MCP Servers  
4. Connecting to a Remote Server  
5. MCP Made Easy (Marketplace)  
6. MCP Server Development Protocol  
7. MCP Transport Mechanisms  

---

## 1 · MCP Overview
Model Context Protocol (MCP) standardises how LLM applications expose *tools* (functions) and *resources* (read‑only data) to the model.  
An **MCP Server** is a standalone program that hosts these tools/resources; an **MCP Host** (e.g. Cline) discovers and invokes them.

**Key Concepts**

| Concept | Purpose |
|---------|---------|
|**Tool**|Callable function (`name`, `description`, JSON schema I/O) executed by the server.|
|**Resource**|Static or generated data the model can pull into context without running code.|
|**STDIO Transport**|Local server → spawned as child‑process; JSON‑RPC over stdin/stdout.|
|**SSE Transport**|Remote server → HTTP POST for requests, Server‑Sent Events stream for responses.|

> **Security Model:** Credentials stay inside the MCP server. Cline will always prompt before a tool runs unless explicitly auto‑approved in `cline_mcp_settings.json`.

**Typical Use‑Cases**
- **APIs / Web‑services →** Post issues to GitHub, fetch tweets, query weather.
- **Browser Automation →** Crawl sites, run end‑to‑end tests, capture screenshots.
- **Database Reports →** Generate sales dashboards, run SQL, export CSVs.
- **Dev‑Ops →** Provision infrastructure, deploy builds, monitor uptime.
- **Local Utilities →** Manipulate files, control media players, search documents.

---

## 2 · Adding MCP Servers from GitHub
Use this flow when a server’s source lives on GitHub.

### Quick Steps
1. **Find a Repo**  
   Browse the *Model Context Protocol Servers* organisation or community “Awesome MCP Servers” list.
2. **Tell Cline to Add It**  
   ```plain
   > Add the MCP server at https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search
   ```
3. **Cline Automates Build & Config**  
   - Clones repo into `~/Documents/Cline/MCP/<server‑name>/`  
   - Runs `npm install` / `pip install` as required  
   - Prompts for env‑vars (API keys, executable paths)  
   - Inserts entry into `cline_mcp_settings.json`
4. **Verify with MCP Inspector**  
   Confirm each tool responds before first use.

### GitHub Sources & Directories
| Resource | URL / Notes |
|----------|-------------|
|Official servers monorepo|`github.com/modelcontextprotocol/servers`|
|Awesome MCP Servers list|`github.com/sindresorhus/awesome-mcp-servers`|
|Community directories|`mcpservers.org`, `mcp.so`, `glama.ai/mcp/servers`|

> **Tip:** Provide the `README.md` to Cline early – richer docs improve code‑generation accuracy.

---

## 3 · Configuring MCP Servers
Open **Cline › MCP Servers → Installed** for per‑server controls.

| Setting | Action |
|---------|--------|
|🗑 **Delete** | Removes server & its config instantly. No undo. |
|🔄 **Restart**| Stops & relaunches the process (fixes crashes, picks up code changes). |
|⏯ **Enable / Disable**| Toggle tool availability without deleting config. |
|⏱ **Network Timeout**| 30 s → 60 min wait for server responses. |
|⚙ **Advanced Settings**| Opens `cline_mcp_settings.json` for manual edits.|

### `cline_mcp_settings.json` Snippet (STDIO)
```json
{
  "mcpServers": {
    "local-search": {
      "command": "node",
      "args": ["dist/index.js"],
      "env": { "OPENAI_API_KEY": "sk-…" },
      "alwaysAllow": ["search_files"],
      "disabled": false
    }
  }
}
```

### `cline_mcp_settings.json` Snippet (SSE)
```json
{
  "mcpServers": {
    "figma-cloud": {
      "url": "https://figma-proxy.example.com/mcp",
      "headers": { "Authorization": "Bearer <TOKEN>" },
      "autoApprove": ["export_design"],
      "timeout": 45
    }
  }
}
```

---

## 4 · Connecting to a Remote Server
1. **Cline › MCP Servers → Remote Servers → Add**  
2. Fill **Name** + **URL** (`https://host.com/mcp`) → **Add Server**  
3. If status = 🟥 error → check network, auth headers, CORS.

> Only connect to servers you trust; remote tools can execute actions on your behalf.

---

## 5 · MCP Made Easy (Marketplace)
The built‑in Marketplace offers one‑click installs.

### Workflow
1. **Browse Categories:** Search, Dev‑Ops, Media, Finance…  
2. **Install:** Cline fetches code, handles deps & prompts for keys.  
3. **Ready:** Tools auto‑appear in chat; invoke in natural language.

**Pre‑reqs**

| Dependency | Minimum Version |
|------------|-----------------|
|Node.js | 18 LTS |
|Python | 3.10 |
|UV | 0.1.0 |

---

## 6 · MCP Server Development Protocol
A `.clinerules` file enforces a 4‑phase workflow:

| Phase | Goal | Key Rules |
|-------|------|----------|
|**PLAN**|Define APIs, auth, tool list.|No coding allowed; clarify requirements first.|
|**ACT**|Implement with MCP SDK.|Comprehensive logging, strong typing, error handling.|
|**TEST**|Validate every tool.|Must manually run & verify each tool before finalisation.|
|**COMPLETE**|Ship & document.|Only allowed after all tests pass.|

### Bootstrapping (TypeScript example)
```bash
npx @modelcontextprotocol/create-server stock-mcp
cd stock-mcp
npm install
npm run build
```

### Tool Definition Snippet
```ts
server.tool("get_stock_overview", {
  description: "Fetch current price & fundamentals",
  inputSchema: { "type": "object", "properties": { "symbol": { "type": "string" } }, "required": ["symbol"] },
  handler: async ({ symbol }) => {
    const data = await alphaVantage.fetch(symbol);
    return formatStockMarkdown(data);
  }
});
```

---

## 7 · MCP Transport Mechanisms

| Transport | Use‑Case | Pros | Cons |
|-----------|----------|------|------|
|**STDIO**|Local, single‑user|⚡ Low latency<br>🔒 No network exposure|Per‑user install<br>Not shareable|
|**SSE**|Remote, multi‑user|🌐 Centralised deployment<br>🧑‍🤝‍🧑 Many clients|Higher latency<br>Need server hosting & auth|

### STDIO Lifecycle
- Cline spawns the server → communicates via stdin/stdout.
- Process ends when Cline exits or on manual restart.

### SSE Lifecycle
- Client `GET /events` (stream)  
- Client `POST /message` { jsonrpc }  
- Server pushes result over stream → client feeds model.

---

### Error Schema (common to all servers)
```json
{
  "success": false,
  "error": {
    "code": 400,
    "message": "invalid parameters"
  }
}
```
Typical codes: **400** bad input, **401** unauth’d, **429** rate limit, **500** server error.

---

### Quick‑Reference CLI Commands
| Action | Command |
|--------|---------|
|Scaffold TS server|`npx @modelcontextprotocol/create-server <name>`|
|Install Python SDK|`pip install mcp --upgrade`|
|Launch local server|`node dist/index.js` *or* `python server.py`|
|Open settings file|Cline → MCP Servers → Configure|

---

*Generated 2025-05-20.*
