// supabase/functions/telegram-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface TelegramUpdate {
  message?: {
    text?: string;
    chat?: { id: number };
    from?: { id: number; first_name?: string; username?: string };
  };
}

const TELEGRAM_TOKEN = Deno.env.get('TELEGRAM_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

if (!TELEGRAM_TOKEN || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing environment variables.');
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sendMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function handleCommand(text: string, chatId: number, userName: string) {
  switch (text) {
    case '/start':
      await sendMessage(chatId, `Привет, ${userName}! Я Collection Buddy Bot.`);
      break;
    case '/new':
      await sendMessage(chatId, 'Создание нового сбора. Введите название сбора.');
      break;
    case '/finish':
      await sendMessage(chatId, 'Сбор завершён.');
      break;
    case '/cancel':
      await sendMessage(chatId, 'Сбор отменён.');
      break;
    case '/paid':
      await sendMessage(chatId, 'Спасибо! Ваш платёж будет подтверждён организатором.');
      break;
    case '/history':
      await sendMessage(chatId, 'Вот список ваших прошлых сборов.');
      break;
    default:
      await sendMessage(chatId, 'Неизвестная команда. Попробуйте снова.');
      break;
  }
  console.log(`Processed command: ${text} from user: ${userName}`);
}

serve(async (req) => {
  try {
    const update: TelegramUpdate = await req.json();
    const message = update.message;

    if (message && message.text && message.chat && message.from) {
      const chatId = message.chat.id;
      const text = message.text;
      const userName = message.from.first_name || message.from.username || 'пользователь';

      console.log(`Received message: ${text} from ${userName} (chatId: ${chatId})`);

      await handleCommand(text, chatId, userName);
    }
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
  }

  return new Response('OK');
});