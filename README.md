# Solana AI Agent - Advanced Blockchain Dashboard

A powerful AI agent that provides comprehensive analysis and insights into the Solana blockchain through an advanced dashboard interface.

## Features

### Blockchain Analytics
- **Network Overview**: Real-time stats on Solana network performance, TPS, and key metrics
- **Token Analysis**: Deep dive into token metrics, holders, and market data
- **Risk Assessment**: Advanced token risk metrics including concentration risk, age analysis, and liquidity scoring
- **Wallet Analysis**: Comprehensive portfolio breakdown with USD valuations

### Trading & DeFi Tools
- **Jupiter Swap Integration**: Get optimal swap routes and quotes via Jupiter Aggregator
- **Swap Analysis**: Advanced swap path visualization and price impact metrics
- **Popular Tokens Directory**: Quick access to commonly used tokens and addresses

### Advanced Dashboard
- **Rich Console Interface**: Beautiful CLI-based dashboard with colored tables and charts
- **Real-time Data**: Up-to-date blockchain and market information
- **Portfolio Tracking**: Track your wallet's performance and holdings

## Architecture

The agent is built as an MCP (Model Context Protocol) server with multiple specialized modules:

1. **Core API Integration**: Direct connection to Solscan Pro API v2 and Jupiter Swap API
2. **Analytics Engine**: Advanced data analysis algorithms for portfolio and token risk assessment
3. **Dashboard Generator**: Rich console interface with styled tables and visualizations
4. **MCP Server**: Exposes all functionality as tools for AI assistants

## Getting Started

### Prerequisites
- Node.js v18+ 
- Solscan Pro API key
- (Optional) Jupiter API key for enhanced swap capabilities

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/solscan-agent.git
cd solscan-agent
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create .env file with your API keys
echo "SOLSCAN_API_KEY=your_solscan_api_key" > .env
echo "JUPITER_API_KEY=your_jupiter_api_key" >> .env
```

4. Build the project
```bash
npm run build
```

5. Start the MCP server
```bash
node build/index.js
```

## Using the Agent

### With Claude Desktop / Cursor / VS Code Extension
1. Add the server to your `claude_desktop_config.json` file:
```json
{
  "mcpServers": {
    "solscan-agent": {
      "command": "/path/to/solscan-agent/build/index.js"
    }
  }
}
```

2. Start asking questions about Solana in your AI assistant, such as:
- "Show me the network overview for Solana"
- "Analyze this wallet address: [address]"
- "What are the trending tokens today?"
- "Check the risk metrics for the JUP token"
- "What's the optimal swap route from SOL to USDC for 1 SOL?"

### Available Tools

The agent provides multiple tools for Solana blockchain interaction:

#### Account & Token Tools
- `get_account_info`: Get detailed information about a Solana account
- `get_token_info`: Get metadata for an SPL token
- `get_transaction_history`: Get transaction history for an account

#### Dashboard Tools
- `get_network_overview`: Get comprehensive Solana network stats
- `get_trending_tokens`: List trending tokens with price and volume data
- `analyze_wallet`: Generate in-depth analysis of wallet holdings and activity
- `analyze_token_risk`: Calculate risk metrics for a token

#### Jupiter Swap Tools
- `get_swap_quote`: Get optimal swap quotes between tokens
- `analyze_swap`: Get detailed routing insights for a potential swap
- `list_popular_tokens`: List popular tokens with their addresses

## Development

### Project Structure
- `src/index.ts`: MCP server entry point and tool handlers
- `src/jupiter.ts`: Jupiter Swap API integration
- `src/analytics.ts`: Advanced analytics and metrics calculations
- `src/dashboard.ts`: Dashboard UI and visualization components

### Building
```bash
npm run build
```

### Testing
```bash
# Check wallet connection
node check-wallet.js

# Test agent functionality
node test-agent.js
```

## License

MIT

## Acknowledgements
- [Solscan Pro API](https://solscan.io/)
- [Jupiter Aggregator](https://jup.ag/)
- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Model Context Protocol](https://modelcontextprotocol.github.io/)
