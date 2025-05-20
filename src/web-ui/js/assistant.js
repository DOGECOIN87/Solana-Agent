/**
 * Solana AI Agent Dashboard - AI Assistant Module
 */
import { showSuccessMessage, showErrorMessage } from './utils.js';
import { getCurrentWallet } from './wallet.js';

// Store chat history
let chatHistory = [];
let isProcessing = false;

/**
 * Initialize AI assistant module
 */
export function initAssistant() {
  setupAssistantListeners();
  
  // Add welcome message
  addBotMessage(getWelcomeMessage());
}

/**
 * Setup assistant event listeners
 */
function setupAssistantListeners() {
  // Chat input form
  const chatForm = document.getElementById('chat-form');
  if (chatForm) {
    chatForm.addEventListener('submit', handleChatSubmit);
  }
  
  // Chat input field - handle Enter key
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleChatSubmit(event);
      }
    });
  }
  
  // Clear chat button
  const clearChatButton = document.getElementById('clear-chat-btn');
  if (clearChatButton) {
    clearChatButton.addEventListener('click', clearChat);
  }
}

/**
 * Get a personalized welcome message
 */
function getWelcomeMessage() {
  const wallet = getCurrentWallet();
  
  if (wallet) {
    return `Hello! I'm your Solana AI Assistant. I can help you with information about Solana blockchain, tokens, and transactions. I can also help you analyze your wallet and provide insights. What would you like to know today?`;
  } else {
    return `Hello! I'm your Solana AI Assistant. I can help you with information about Solana blockchain, tokens, and transactions. Connect your wallet for personalized assistance. How can I help you today?`;
  }
}

/**
 * Handle chat form submission
 */
async function handleChatSubmit(event) {
  event.preventDefault();
  
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  
  // Don't send empty messages
  if (!message || isProcessing) return;
  
  // Clear input
  input.value = '';
  
  // Add user message to chat
  addUserMessage(message);
  
  // Start processing indicator
  isProcessing = true;
  showTypingIndicator();
  
  try {
    // In a real implementation, this would call the AI backend
    // For demo purposes, we'll simulate a response
    const response = await simulateAIResponse(message);
    
    // Remove typing indicator
    hideTypingIndicator();
    
    // Add bot response
    addBotMessage(response);
    
  } catch (error) {
    console.error('Error getting AI response:', error);
    hideTypingIndicator();
    addBotMessage("I'm sorry, I encountered an error while processing your request. Please try again.");
  } finally {
    isProcessing = false;
  }
}

/**
 * Add a user message to the chat
 */
function addUserMessage(message) {
  const chatMessages = document.getElementById('chat-messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chat-message', 'user-message');
  
  messageDiv.innerHTML = `
    <div class="message-avatar">
      <div class="user-avatar">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
        </svg>
      </div>
    </div>
    <div class="message-content">
      <div class="message-text">${formatMessageText(message)}</div>
      <div class="message-time">${getCurrentTime()}</div>
    </div>
  `;
  
  chatMessages.appendChild(messageDiv);
  
  // Save to history
  chatHistory.push({
    role: 'user',
    message,
    timestamp: new Date().toISOString()
  });
  
  // Scroll to bottom
  scrollToBottom();
}

/**
 * Add a bot message to the chat
 */
function addBotMessage(message) {
  const chatMessages = document.getElementById('chat-messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('chat-message', 'bot-message');
  
  messageDiv.innerHTML = `
    <div class="message-avatar">
      <div class="bot-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="12" fill="#9945FF"/>
          <path d="M19.5 11.5H17.5V8.5C17.5 7.4 16.6 6.5 15.5 6.5H12.5V4.5C12.5 3.95 12.05 3.5 11.5 3.5H11C10.45 3.5 10 3.95 10 4.5V6.5H7C5.9 6.5 5 7.4 5 8.5V11H7V8.5H17V15.5H12V17.5H15.5C16.6 17.5 17.5 16.6 17.5 15.5V12.5H19.5C20.05 12.5 20.5 12.05 20.5 11.5V12C20.5 11.45 20.05 11 19.5 11V11.5ZM6.5 13H4.5C3.95 13 3.5 13.45 3.5 14V14.5C3.5 15.05 3.95 15.5 4.5 15.5H6.5V17.5C6.5 18.6 7.4 19.5 8.5 19.5H10.5V17.5H8.5V13.5C8.5 13.22 8.28 13 8 13H6.5Z" fill="white"/>
        </svg>
      </div>
    </div>
    <div class="message-content">
      <div class="message-text">${formatMessageText(message)}</div>
      <div class="message-time">${getCurrentTime()}</div>
    </div>
  `;
  
  chatMessages.appendChild(messageDiv);
  
  // Save to history
  chatHistory.push({
    role: 'assistant',
    message,
    timestamp: new Date().toISOString()
  });
  
  // Scroll to bottom
  scrollToBottom();
}

/**
 * Show typing indicator
 */
function showTypingIndicator() {
  const chatMessages = document.getElementById('chat-messages');
  
  const indicatorDiv = document.createElement('div');
  indicatorDiv.id = 'typing-indicator';
  indicatorDiv.classList.add('chat-message', 'bot-message');
  
  indicatorDiv.innerHTML = `
    <div class="message-avatar">
      <div class="bot-avatar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="24" height="24" rx="12" fill="#9945FF"/>
          <path d="M19.5 11.5H17.5V8.5C17.5 7.4 16.6 6.5 15.5 6.5H12.5V4.5C12.5 3.95 12.05 3.5 11.5 3.5H11C10.45 3.5 10 3.95 10 4.5V6.5H7C5.9 6.5 5 7.4 5 8.5V11H7V8.5H17V15.5H12V17.5H15.5C16.6 17.5 17.5 16.6 17.5 15.5V12.5H19.5C20.05 12.5 20.5 12.05 20.5 11.5V12C20.5 11.45 20.05 11 19.5 11V11.5ZM6.5 13H4.5C3.95 13 3.5 13.45 3.5 14V14.5C3.5 15.05 3.95 15.5 4.5 15.5H6.5V17.5C6.5 18.6 7.4 19.5 8.5 19.5H10.5V17.5H8.5V13.5C8.5 13.22 8.28 13 8 13H6.5Z" fill="white"/>
        </svg>
      </div>
    </div>
    <div class="message-content">
      <div class="message-text typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;
  
  chatMessages.appendChild(indicatorDiv);
  
  // Scroll to bottom
  scrollToBottom();
}

/**
 * Hide typing indicator
 */
function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Format message text with markdown-like syntax
 */
function formatMessageText(text) {
  // Handle code blocks
  text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  
  // Handle inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Handle bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italics
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Handle links
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Replace newlines with <br>
  text = text.replace(/\n/g, '<br>');
  
  return text;
}

/**
 * Get current time for message timestamp
 */
function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Scroll chat to bottom
 */
function scrollToBottom() {
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Clear chat history
 */
function clearChat() {
  const chatMessages = document.getElementById('chat-messages');
  
  // Clear UI
  chatMessages.innerHTML = '';
  
  // Clear history
  chatHistory = [];
  
  // Add welcome message
  addBotMessage(getWelcomeMessage());
}

/**
 * Simulate AI response (for demo purposes)
 */
async function simulateAIResponse(message) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
  
  // Convert the message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();
  
  // Check if wallet is connected
  const wallet = getCurrentWallet();
  const walletConnected = !!wallet;
  
  // Match against common questions
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi ')) {
    return `Hello there! How can I assist you with Solana today?`;
  }
  
  if (lowerMessage.includes('what can you do') || lowerMessage.includes('help me')) {
    return `I can help you with:
    
1. **Solana Blockchain Information** - General questions about Solana, its consensus mechanism, etc.
2. **Token Information** - Details about various tokens on Solana
3. **Transaction Explanations** - Help understanding transaction details
4. **DeFi Concepts** - Explain staking, yield farming, and other DeFi concepts
5. **Wallet Analysis** - Provide insights about your wallet (if connected)
6. **Price Information** - Current market prices and trends
7. **Security Tips** - Best practices for securing your crypto assets

What would you like to know about?`;
  }
  
  if (lowerMessage.includes('what is solana')) {
    return `Solana is a high-performance blockchain platform designed to enable scalable, user-friendly apps for the world. It's known for:

1. **High Throughput**: Capable of processing 65,000+ transactions per second
2. **Low Fees**: Transaction costs typically less than $0.01
3. **Fast Finality**: Transactions finalize in about 400 milliseconds
4. **Energy Efficiency**: Uses a unique Proof of History + Proof of Stake consensus
5. **Smart Contracts**: Supports Rust, C, C++, and other languages for program development

Solana achieves this performance through several innovations, including Proof of History, Tower BFT consensus, Turbine block propagation, and more.`;
  }
  
  if (lowerMessage.includes('what is jupiter')) {
    return `Jupiter is the key liquidity aggregator for Solana, designed to provide the best swap rates across all decentralized exchanges on the network.

Key features of Jupiter:
1. **Aggregated Liquidity**: Finds the best prices across all DEXs
2. **Route Optimization**: Creates multi-hop routes when necessary for best execution
3. **Low Slippage**: Minimizes price impact for large trades
4. **Token Support**: Access to all SPL tokens on Solana
5. **API Access**: Provides APIs for developers to integrate swap functionality

Jupiter has processed over $50B in trading volume, making it the most used swap infrastructure on Solana.`;
  }
  
  if (lowerMessage.includes('current sol price') || (lowerMessage.includes('price') && lowerMessage.includes('sol'))) {
    return `The current SOL price is approximately $167.64, up 2.34% in the last 24 hours. 

Market Statistics:
• Market Cap: $89.3 Billion
• 24h Trading Volume: $2.1 Billion
• Circulating Supply: 532.4M SOL
• Total Supply: 569.7M SOL

Would you like me to tell you more about Solana tokenomics or recent price trends?`;
  }
  
  if ((lowerMessage.includes('wallet') || lowerMessage.includes('balance')) && !walletConnected) {
    return `It looks like you don't have a wallet connected yet. To view your wallet details and get personalized information, please connect your wallet using the "Connect Wallet" button in the top right corner.

Once connected, I can provide you with:
• Detailed balance information
• Token holdings analysis
• Transaction history insights
• Personalized recommendations`;
  }
  
  if ((lowerMessage.includes('wallet') || lowerMessage.includes('balance')) && walletConnected) {
    return `Your wallet (${wallet.displayName}) currently holds:

• 45.72 SOL (≈ $7,664.64)
• 1,250.73 USDC (≈ $1,250.73)
• 423.5 JUP (≈ $5,281.25)
• 42,000,000 BONK (≈ $983.40)
• 12.8 JTO (≈ $125.18)

Total Portfolio Value: Approximately $15,305.20

Would you like me to analyze your portfolio distribution or provide recommendations?`;
  }
  
  if (lowerMessage.includes('how to swap')) {
    return `To swap tokens using our platform:

1. Navigate to the Swap panel in the sidebar
2. Connect your wallet if you haven't already
3. Select the input token you want to swap from
4. Select the output token you want to receive
5. Enter the amount you want to swap
6. Review the swap details (price, impact, min received)
7. Adjust slippage tolerance if needed (default is 1%)
8. Click the "Swap" button to execute the transaction
9. Confirm the transaction in your wallet

The swap uses Jupiter's aggregation protocol to find the best price across all Solana DEXs. Want me to explain any specific part in more detail?`;
  }
  
  if (lowerMessage.includes('defi') || lowerMessage.includes('yield')) {
    return `DeFi (Decentralized Finance) on Solana offers various ways to earn passive income:

1. **Staking SOL**: Earn around 5-7% APY by staking SOL with validators
2. **Liquidity Provision**: Provide tokens to DEXs like Orca or Raydium to earn trading fees
3. **Lending**: Lend assets on platforms like Solend to earn interest
4. **Yield Farming**: Supply liquidity and earn additional token rewards
5. **Liquid Staking**: Use solutions like Marinade or Lido to stake SOL while retaining liquidity
6. **Options & Derivatives**: Trade on platforms like Zeta Markets
7. **Automated Strategies**: Use yield optimizers like Tulip Protocol

Would you like more information about any specific DeFi strategy?`;
  }
  
  if (lowerMessage.includes('nft')) {
    return `Solana has a vibrant NFT ecosystem with several advantages over other blockchains:

Key NFT Platforms on Solana:
• **Magic Eden**: The largest marketplace for Solana NFTs
• **Tensor**: Advanced NFT trading platform with analytics
• **Solanart**: One of the earliest Solana NFT marketplaces
• **FormFunction**: Focused on art and 1/1 pieces
• **Exchange.Art**: Curated art platform with royalty enforcement

Notable Solana NFT Collections:
• DeGods
• Okay Bears
• y00ts
• Solana Monkey Business
• Claynosaurz
• Mad Lads

Benefits of Solana for NFTs:
• Low transaction fees (typically less than $0.01)
• Fast transaction finality (seconds vs minutes/hours)
• Carbon-neutral operations
• Rich metadata support

Would you like information about minting, trading, or storing Solana NFTs?`;
  }
  
  if (lowerMessage.includes('security') || lowerMessage.includes('secure')) {
    return `Here are essential security tips for Solana users:

1. **Hardware Wallets**: Use Ledger or other hardware wallets for large holdings
2. **Seed Phrase Storage**: Store your seed phrase offline, never digitally
3. **Verify Transactions**: Always check transaction details before signing
4. **Wallet Separation**: Use different wallets for trading vs long-term storage
5. **Bookmark Official Sites**: Avoid phishing by using bookmarks for DeFi sites
6. **Revoke Approvals**: Regularly check and revoke unnecessary token approvals
7. **Be Wary of Airdrops**: Unknown tokens in your wallet might be scams
8. **Update Software**: Keep wallet software and browsers updated
9. **Enable 2FA**: Use two-factor authentication wherever available
10. **Test Small Transactions**: Send small amounts first when using new services

Remember: Never share your seed phrase or private keys with anyone, including support staff.`;
  }
  
  // Default fallback response
  return `Thanks for your question about "${message}". 

While I'm just a demo AI assistant in this interface, a real Solana AI Agent would be able to provide detailed information about:

• Solana blockchain stats and performance
• Token details and price information
• Market trends and analysis
• Wallet insights and recommendations
• Transaction explanations
• DeFi opportunities
• Gas optimization strategies
• And much more...

Feel free to ask me any other questions about Solana!`;
}
