
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

interface TelegramChat {
  id: number;
  type: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: any;
}

// User conversation states
interface UserState {
  chatId: number;
  userId: number;
  state: string;
  data: Record<string, any>;
  lastUpdated: number;
}

// In-memory state storage (for MVP, in production would use database)
const userStates: Record<string, UserState> = {};

serve(async (req: Request) => {
  // For logging and debugging
  console.log("Received request at telegram-webhook");
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Get bot token from database
    const { data: configData, error: configError } = await supabase
      .from('bot_config')
      .select('bot_token, webhook_active')
      .eq('id', 1)
      .single();

    if (configError || !configData.bot_token) {
      console.error('Error fetching bot token:', configError);
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if bot is active
    if (!configData.webhook_active) {
      console.log('Bot is not active, ignoring request');
      return new Response(
        JSON.stringify({ message: 'Bot is currently inactive' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botToken = configData.bot_token;

    // Parse the incoming update from Telegram
    const update: TelegramUpdate = await req.json();
    
    console.log('Received update:', JSON.stringify(update));

    // Process the update
    if (update.message) {
      const message = update.message;
      const chatId = message.chat.id;
      
      // Save or update user
      if (message.from) {
        await saveUser(supabase, message.from);
      }
      
      // Handle commands
      if (message.text && message.text.startsWith('/')) {
        await handleCommand(supabase, message, botToken);
      } else {
        // Handle regular message (for fundraiser creation flow etc)
        await handleMessage(supabase, message, botToken);
      }
    } else if (update.callback_query) {
      // Handle callback queries (button clicks)
      await handleCallbackQuery(supabase, update.callback_query, botToken);
    }
    
    // Return a 200 OK response to Telegram
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Save or update a Telegram user
async function saveUser(supabase: any, telegramUser: TelegramUser) {
  try {
    console.log(`Saving user ${telegramUser.id} (${telegramUser.username || telegramUser.first_name})`);
    
    const { data, error } = await supabase
      .from('telegram_users')
      .upsert({
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        last_active: new Date().toISOString()
      }, {
        onConflict: 'telegram_id',
        returning: 'minimal'
      });

    if (error) {
      console.error('Error saving user:', error);
    }
    
    return data;
  } catch (error) {
    console.error('Error in saveUser function:', error);
    throw error;
  }
}

// Handle bot commands
async function handleCommand(supabase: any, message: TelegramMessage, botToken: string) {
  try {
    const text = message.text || '';
    const command = text.split(' ')[0].toLowerCase();
    
    console.log(`Handling command: ${command} from user: ${message.from.id}, chat: ${message.chat.id}`);
    
    switch (command) {
      case '/start':
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `Привет, ${message.from.first_name}! 👋\n\nЯ бот для создания сборов средств. С моей помощью вы можете создавать сборы и получать пожертвования от участников.\n\nДля создания нового сбора используйте команду /newfundraiser.\nДля просмотра ваших сборов используйте /myfundraisers.\nДля получения помощи используйте /help.`
        );
        break;
      
      case '/help':
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          `Список доступных команд:\n\n/start - Начать работу с ботом\n/newfundraiser - Создать новый сбор средств\n/myfundraisers - Показать ваши сборы\n/help - Показать эту справку`
        );
        break;
      
      case '/newfundraiser':
        // Start fundraiser creation flow
        const userId = message.from.id;
        const stateKey = `${userId}_${message.chat.id}`;
        
        userStates[stateKey] = {
          chatId: message.chat.id,
          userId: userId,
          state: 'awaiting_title',
          data: {},
          lastUpdated: Date.now()
        };
        
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          'Давайте создадим новый сбор средств! Пожалуйста, введите название сбора:'
        );
        break;
        
      case '/myfundraisers':
        // Fetch and display user's fundraisers
        const { data: fundraisers, error } = await supabase
          .from('fundraisers')
          .select('*')
          .eq('creator_id', message.from.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching fundraisers:', error);
          await sendTelegramMessage(
            botToken,
            message.chat.id,
            'Произошла ошибка при получении списка сборов. Пожалуйста, попробуйте позже.'
          );
          return;
        }
        
        if (!fundraisers || fundraisers.length === 0) {
          await sendTelegramMessage(
            botToken,
            message.chat.id,
            'У вас пока нет активных сборов. Создайте новый сбор с помощью команды /newfundraiser'
          );
          return;
        }
        
        let fundraisersText = 'Ваши сборы средств:\n\n';
        fundraisers.forEach((f: any, index: number) => {
          const percentRaised = f.goal > 0 ? Math.round((f.raised / f.goal) * 100) : 0;
          fundraisersText += `${index + 1}. ${f.title} - ${f.raised}/${f.goal} руб. (${percentRaised}%)\n`;
        });
        
        await sendTelegramMessage(botToken, message.chat.id, fundraisersText);
        break;
        
      default:
        await sendTelegramMessage(
          botToken,
          message.chat.id,
          'Извините, я не понимаю эту команду. Для получения списка доступных команд используйте /help'
        );
    }
  } catch (error) {
    console.error('Error in handleCommand function:', error);
    throw error;
  }
}

// Handle regular messages (for dialog flows like fundraiser creation)
async function handleMessage(supabase: any, message: TelegramMessage, botToken: string) {
  try {
    if (!message.from || !message.text) {
      return;
    }
    
    const userId = message.from.id;
    const chatId = message.chat.id;
    const stateKey = `${userId}_${chatId}`;
    const userState = userStates[stateKey];
    
    if (!userState) {
      // No active flow, send default message
      await sendTelegramMessage(
        botToken,
        chatId,
        'Для взаимодействия со мной, пожалуйста, используйте команды. Введите /help для получения списка доступных команд.'
      );
      return;
    }
    
    console.log(`Processing message in state: ${userState.state}`);
    
    // Handle based on current state
    switch (userState.state) {
      case 'awaiting_title':
        userState.data.title = message.text;
        userState.state = 'awaiting_amount';
        userState.lastUpdated = Date.now();
        
        await sendTelegramMessage(
          botToken,
          chatId,
          'Отлично! Теперь укажите целевую сумму сбора (только число, например: 5000):'
        );
        break;
        
      case 'awaiting_amount':
        const amount = parseInt(message.text.replace(/[^\d]/g, ''), 10);
        
        if (isNaN(amount) || amount <= 0) {
          await sendTelegramMessage(
            botToken,
            chatId,
            'Пожалуйста, введите корректную сумму (только число, например: 5000):'
          );
          return;
        }
        
        userState.data.goal = amount;
        userState.state = 'awaiting_description';
        userState.lastUpdated = Date.now();
        
        await sendTelegramMessage(
          botToken,
          chatId,
          'Сумма установлена! Теперь введите описание сбора:'
        );
        break;
        
      case 'awaiting_description':
        userState.data.description = message.text;
        userState.state = 'confirmation';
        userState.lastUpdated = Date.now();
        
        // Prepare confirmation message
        const confirmationText = `Проверьте данные создаваемого сбора:\n\n` +
          `Название: ${userState.data.title}\n` +
          `Сумма: ${userState.data.goal} руб.\n` +
          `Описание: ${userState.data.description}\n\n` +
          `Всё верно? Ответьте "Да" для создания сбора или "Нет" для отмены.`;
        
        await sendTelegramMessage(
          botToken,
          chatId,
          confirmationText
        );
        break;
        
      case 'confirmation':
        if (message.text.toLowerCase() === "да") {
          // Save fundraiser to database
          const { data, error } = await supabase
            .from('fundraisers')
            .insert({
              title: userState.data.title,
              goal: userState.data.goal,
              description: userState.data.description,
              creator_id: userId,
              creator_username: message.from.username || message.from.first_name,
              status: 'active',
              raised: 0
            })
            .select()
            .single();
          
          if (error) {
            console.error('Error creating fundraiser:', error);
            await sendTelegramMessage(
              botToken,
              chatId,
              'Произошла ошибка при создании сбора. Пожалуйста, попробуйте позже.'
            );
          } else {
            await sendTelegramMessage(
              botToken,
              chatId,
              `Сбор "${userState.data.title}" успешно создан!\n\n` +
              `ID сбора: ${data.id}\n\n` +
              `Участники могут внести средства, присоединившись к боту.`
            );
          }
        } else {
          await sendTelegramMessage(
            botToken,
            chatId,
            'Создание сбора отменено. Вы можете начать снова с команды /newfundraiser'
          );
        }
        
        // Clear user state
        delete userStates[stateKey];
        break;
        
      default:
        // Unknown state, reset
        delete userStates[stateKey];
        await sendTelegramMessage(
          botToken,
          chatId,
          'Произошла ошибка в диалоге. Пожалуйста, начните сначала.'
        );
    }
  } catch (error) {
    console.error('Error in handleMessage function:', error);
    throw error;
  }
}

// Handle callback queries (button clicks)
async function handleCallbackQuery(supabase: any, callbackQuery: any, botToken: string) {
  try {
    console.log('Handling callback query', callbackQuery);
    
    // Acknowledge the callback query
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callback_query_id: callbackQuery.id,
      }),
    });
    
    // Parse the callback data
    const data = callbackQuery.data;
    
    // Process based on the callback data format
    // For example: "view_fundraiser:123"
    if (data.startsWith('view_fundraiser:')) {
      const fundraiserId = data.split(':')[1];
      // Logic to show fundraiser details
      // ...
    }
    // Add more callback handlers as needed
  } catch (error) {
    console.error('Error in handleCallbackQuery function:', error);
    throw error;
  }
}

// Send a message to a Telegram chat
async function sendTelegramMessage(botToken: string, chatId: number, text: string, extra: any = {}) {
  try {
    console.log(`Sending message to chat ${chatId}: ${text.substring(0, 50)}...`);
    
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
        ...extra
      }),
    });
    
    const result = await response.json();
    
    if (!result.ok) {
      console.error('Error sending Telegram message:', result);
    }
    
    return result;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return null;
  }
}

// Set an interval to clean up old user states (older than 30 minutes)
setInterval(() => {
  const now = Date.now();
  const timeoutMs = 30 * 60 * 1000; // 30 minutes
  
  for (const key in userStates) {
    if (now - userStates[key].lastUpdated > timeoutMs) {
      console.log(`Cleaning up state for user ${userStates[key].userId}`);
      delete userStates[key];
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes
