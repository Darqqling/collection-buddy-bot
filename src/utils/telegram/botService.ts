
/**
 * Telegram Bot Service
 * 
 * This service handles the core functionality of the Telegram bot,
 * including message handling, command processing, and webhook management.
 */

import { supabase } from "@/integrations/supabase/client";

// Define types for Telegram bot messages and updates
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  // Other message fields can be added as needed
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  // Other update types can be added as needed
}

/**
 * Initialize the Telegram bot with the provided token
 * @param token The Telegram bot token
 * @returns A promise that resolves when the bot is initialized
 */
export const initializeBot = async (token: string): Promise<boolean> => {
  try {
    if (!token || token.length < 20) {
      console.error('Invalid bot token');
      return false;
    }

    // Validate the token with Telegram API
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    
    if (!data.ok) {
      console.error('Error validating bot token:', data.description);
      return false;
    }
    
    console.log('Bot initialized:', data.result.username);
    return true;
  } catch (error) {
    console.error('Error initializing bot:', error);
    return false;
  }
};

/**
 * Set up a webhook for the Telegram bot
 * @param token The Telegram bot token
 * @param webhookUrl The URL to receive webhook updates
 * @returns A promise that resolves when the webhook is set up
 */
export const setWebhook = async (token: string, webhookUrl: string): Promise<boolean> => {
  try {
    if (!token || !webhookUrl) {
      console.error('Token and webhook URL are required');
      return false;
    }

    // Use Supabase function to set the webhook
    const { data, error } = await supabase.functions.invoke('set-webhook', {
      body: { 
        webhookUrl 
      }
    });

    if (error) {
      console.error('Error setting webhook:', error);
      return false;
    }

    return data.success;
  } catch (error) {
    console.error('Error setting webhook:', error);
    return false;
  }
};

/**
 * Process incoming updates from Telegram
 * @param update The update object from Telegram
 * @returns A promise that resolves when the update is processed
 */
export const processUpdate = async (update: TelegramUpdate): Promise<void> => {
  try {
    // Process the update based on its type
    if (update.message && update.message.text) {
      await handleMessage(update.message);
    }
    // Handle other update types as needed
  } catch (error) {
    console.error('Error processing update:', error);
  }
};

/**
 * Handle a message from Telegram
 * @param message The message object from Telegram
 * @returns A promise that resolves when the message is handled
 */
const handleMessage = async (message: TelegramMessage): Promise<void> => {
  try {
    // Check if the message is a command
    if (message.text && message.text.startsWith('/')) {
      await handleCommand(message);
    } else {
      // Handle regular messages
      console.log('Received message:', message.text);
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
};

/**
 * Handle a command from Telegram
 * @param message The message object containing the command
 * @returns A promise that resolves when the command is handled
 */
const handleCommand = async (message: TelegramMessage): Promise<void> => {
  if (!message.text) return;
  
  const commandParts = message.text.split(' ');
  const command = commandParts[0].toLowerCase();
  
  switch (command) {
    case '/start':
      // Handle start command
      console.log('Handling start command');
      break;
    case '/help':
      // Handle help command
      console.log('Handling help command');
      break;
    case '/newfundraiser':
      // Handle new fundraiser command
      console.log('Handling new fundraiser command');
      break;
    default:
      // Handle unknown command
      console.log('Unknown command:', command);
      break;
  }
};

/**
 * Send a message to a Telegram chat
 * @param token The Telegram bot token
 * @param chatId The ID of the chat to send the message to
 * @param text The text of the message
 * @returns A promise that resolves when the message is sent
 */
export const sendMessage = async (token: string, chatId: number, text: string): Promise<boolean> => {
  try {
    // Call Telegram sendMessage API
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });
    
    const result = await response.json();
    
    if (!result.ok) {
      console.error('Error sending message:', result);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    return false;
  }
};

/**
 * Get info about the current bot
 * @param token The Telegram bot token
 * @returns A promise that resolves with bot info
 */
export const getBotInfo = async (token: string): Promise<any> => {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.description || 'Failed to get bot info');
    }
    
    return data.result;
  } catch (error) {
    console.error('Error getting bot info:', error);
    throw error;
  }
};
