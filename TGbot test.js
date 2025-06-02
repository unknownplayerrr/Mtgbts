const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Get API keys from environment variables
const TELEGRAM_BOT_API = process.env.TELEGRAM_BOT_API;
const AI_API = process.env.AI_API;
const AI_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Create a bot instance
const bot = new TelegramBot(TELEGRAM_BOT_API, { polling: true });

console.log('Telegram bot started successfully!');

// Function to get AI response
async function getAIResponse(userMessage) {
  try {
    const response = await axios.post(AI_URL, {
      model: "gpt-3.5-turbo", // You can change this to other available models
      messages: [
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${AI_API}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling AI API:', error.response?.data || error.message);
    return 'Sorry, I encountered an error while processing your request. Please try again later.';
  }
}

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
Hello! 👋 I'm an AI-powered bot that can answer your questions.

Just send me any message and I'll do my best to help you!

Commands:
/start - Show this welcome message
/help - Get help information
  `;
  bot.sendMessage(chatId, welcomeMessage);
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
🤖 AI Bot Help

I can answer questions, provide explanations, help with various topics, and have conversations with you.

Simply type your question or message, and I'll respond using AI!

Examples:
• "What is the weather like?"
• "Explain quantum physics"
• "Write a poem about cats"
• "Help me with programming"

Type anything to get started! 🚀
  `;
  bot.sendMessage(chatId, helpMessage);
});

// Handle all text messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text;

  // Skip if it's a command (starts with /)
  if (userMessage.startsWith('/')) {
    return;
  }

  console.log(`Received message from ${msg.from.first_name}: ${userMessage}`);

  // Send typing indicator
  bot.sendChatAction(chatId, 'typing');

  try {
    // Get AI response
    const aiResponse = await getAIResponse(userMessage);
    
    // Send the AI response back to the user
    bot.sendMessage(chatId, aiResponse);
    
    console.log(`Sent AI response to ${msg.from.first_name}`);
  } catch (error) {
    console.error('Error handling message:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
  }
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Handle webhook errors
bot.on('webhook_error', (error) => {
  console.error('Webhook error:', error);
});

console.log('Bot is running... Send messages to start chatting!');
