
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

serve(async (req: Request) => {
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
      .select('bot_token')
      .eq('id', 1)
      .single();

    if (configError || !configData.bot_token) {
      console.error('Error fetching bot token:', configError);
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      await saveUser(supabase, message.from);
      
      // Handle commands
      if (message.text && message.text.startsWith('/')) {
        await handleCommand(supabase, message, botToken);
      } else {
        // Handle regular message (for fundraiser creation flow etc)
        await handleMessage(supabase, message, botToken);
      }
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
}

// Handle bot commands
async function handleCommand(supabase: any, message: TelegramMessage, botToken: string) {
  const text = message.text || '';
  const command = text.split(' ')[0].toLowerCase();
  
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
      // In a real implementation, this would set up a state machine for the user
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
      
      let message = 'Ваши сборы средств:\n\n';
      fundraisers.forEach((f, index) => {
        message += `${index + 1}. ${f.title} - ${f.raised}/${f.goal} руб. (${Math.round((f.raised / f.goal) * 100)}%)\n`;
      });
      
      await sendTelegramMessage(botToken, message.chat.id, message);
      break;
      
    default:
      await sendTelegramMessage(
        botToken,
        message.chat.id,
        'Извините, я не понимаю эту команду. Для получения списка доступных команд используйте /help'
      );
  }
}

// Handle regular messages (for dialog flows like fundraiser creation)
async function handleMessage(supabase: any, message: TelegramMessage, botToken: string) {
  // Here would be the implementation of state-based conversations
  // For MVP, just respond with a default message
  await sendTelegramMessage(
    botToken,
    message.chat.id,
    'Для взаимодействия со мной, пожалуйста, используйте команды. Введите /help для получения списка доступных команд.'
  );
}

// Send a message to a Telegram chat
async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
      console.error('Error sending Telegram message:', result);
    }
    
    return result;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return null;
  }
}
