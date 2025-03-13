
/**
 * Fundraiser Command Handlers for Telegram Bot
 * 
 * This module contains handlers for commands related to fundraiser management.
 */

import { TelegramMessage } from './botService';
import { Fundraiser, FundraiserStatus } from '../types';

// Temporary storage for fundraisers being created (in a real app, this would be in a database)
interface FundraiserCreationState {
  chatId: number;
  userId: number;
  step: 'title' | 'amount' | 'description' | 'deadline' | 'confirmation';
  data: Partial<Fundraiser>;
}

const fundraiserCreationStates: Record<string, FundraiserCreationState> = {};

/**
 * Start the fundraiser creation process
 * @param message The Telegram message object
 * @returns A promise that resolves when the process is started
 */
export const startFundraiserCreation = async (message: TelegramMessage): Promise<string> => {
  // Check if the user has permission to create fundraisers
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  const chatId = message.chat.id;
  const userId = message.from.id;
  const stateKey = `${userId}_${chatId}`;
  
  // Initialize the creation state
  fundraiserCreationStates[stateKey] = {
    chatId,
    userId,
    step: 'title',
    data: {
      creatorId: userId.toString(),
      creatorUsername: message.from.username || message.from.first_name,
      status: FundraiserStatus.ACTIVE,
      raised: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  };
  
  return "Давайте создадим новый сбор средств!\n\nПожалуйста, введите название сбора:";
};

/**
 * Process the next step in fundraiser creation
 * @param message The Telegram message object
 * @returns A promise that resolves with the response message
 */
export const processFundraiserCreationStep = async (message: TelegramMessage): Promise<string> => {
  if (!message.from || !message.text) {
    return "Извините, произошла ошибка. Пожалуйста, попробуйте снова.";
  }
  
  const chatId = message.chat.id;
  const userId = message.from.id;
  const stateKey = `${userId}_${chatId}`;
  const state = fundraiserCreationStates[stateKey];
  
  if (!state) {
    return "Извините, не удалось найти информацию о создаваемом сборе. Пожалуйста, начните снова с команды /newfundraiser";
  }
  
  let response = "";
  
  switch (state.step) {
    case 'title':
      state.data.title = message.text;
      state.step = 'amount';
      response = "Отлично! Теперь укажите целевую сумму сбора (только число, например: 5000):";
      break;
      
    case 'amount':
      const amount = parseInt(message.text.replace(/[^\d]/g, ''), 10);
      if (isNaN(amount) || amount <= 0) {
        response = "Пожалуйста, введите корректную сумму (только число, например: 5000):";
      } else {
        state.data.goal = amount;
        state.step = 'description';
        response = "Сумма установлена! Теперь введите описание сбора:";
      }
      break;
      
    case 'description':
      state.data.description = message.text;
      state.step = 'deadline';
      response = "Описание добавлено! Теперь укажите крайний срок сбора в формате ДД.ММ.ГГГГ:";
      break;
      
    case 'deadline':
      // Simple date validation - in a real app would be more robust
      const dateParts = message.text.split('.');
      if (dateParts.length !== 3) {
        response = "Пожалуйста, введите дату в формате ДД.ММ.ГГГГ:";
      } else {
        // Store deadline in data (would be validated properly in real app)
        // For MVP just store as string, in real app convert to proper date
        state.data.completedAt = message.text;
        state.step = 'confirmation';
        
        // Prepare confirmation message
        response = `Проверьте данные создаваемого сбора:\n\n` +
          `Название: ${state.data.title}\n` +
          `Сумма: ${state.data.goal} руб.\n` +
          `Описание: ${state.data.description}\n` +
          `Срок: ${state.data.completedAt}\n\n` +
          `Всё верно? Ответьте "Да" для создания сбора или "Нет" для отмены.`;
      }
      break;
      
    case 'confirmation':
      if (message.text.toLowerCase() === "да") {
        // In a real app, would save to database here
        const fundraiserId = Date.now().toString(); // Generate a simple ID
        
        // Clear the creation state
        delete fundraiserCreationStates[stateKey];
        
        response = `Сбор "${state.data.title}" успешно создан!\n\n` +
          `Ссылка для участников: https://t.me/collection_box_bot?start=fund_${fundraiserId}\n\n` +
          `Участники могут внести средства, присоединившись к боту по этой ссылке.`;
      } else {
        // Clear the creation state
        delete fundraiserCreationStates[stateKey];
        
        response = "Создание сбора отменено. Вы можете начать снова с команды /newfundraiser";
      }
      break;
  }
  
  return response;
};

/**
 * List fundraisers for a user
 * @param userId The Telegram user ID
 * @returns A promise that resolves with the list of fundraisers as a string
 */
export const listUserFundraisers = async (userId: number): Promise<string> => {
  // In a real app, would fetch from database
  // For MVP, return a mock response
  return "Ваши активные сборы:\n\n" +
    "1. День рождения Алексея - 5000₽ (собрано 3000₽)\n" +
    "2. Корпоратив - 10000₽ (собрано 7500₽)\n\n" +
    "Для управления сбором, отправьте команду /manage [номер сбора]";
};

/**
 * Get details of a specific fundraiser
 * @param fundraiserId The ID of the fundraiser
 * @returns A promise that resolves with the fundraiser details as a string
 */
export const getFundraiserDetails = async (fundraiserId: string): Promise<string> => {
  // In a real app, would fetch from database
  // For MVP, return a mock response
  return "Информация о сборе:\n\n" +
    "Название: День рождения Алексея\n" +
    "Сумма: 5000₽\n" +
    "Собрано: 3000₽ (60%)\n" +
    "Срок: 31.12.2023\n" +
    "Участников: 5\n\n" +
    "Для управления сбором используйте кнопки ниже.";
};
