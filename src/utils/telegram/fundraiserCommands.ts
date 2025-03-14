/**
 * Fundraiser Command Handlers for Telegram Bot
 * 
 * This module contains handlers for commands related to fundraiser management.
 */

import { TelegramMessage } from './botService';
import { Fundraiser, FundraiserStatus } from '../types';
import { supabase } from '@/integrations/supabase/client';

// Временное хранилище для создаваемых сборов (в реальном приложении это было бы в базе данных)
interface FundraiserCreationState {
  chatId: number;
  userId: number;
  step: 'title' | 'amount' | 'description' | 'deadline' | 'confirmation';
  data: Partial<Fundraiser>;
}

const fundraiserCreationStates: Record<string, FundraiserCreationState> = {};

/**
 * Начать процесс создания сбора средств
 * @param message Объект сообщения Telegram
 * @returns Promise с текстом ответного сообщения
 */
export const startFundraiserCreation = async (message: TelegramMessage): Promise<string> => {
  // Проверяем, есть ли у пользователя права на создание сборов
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  const chatId = message.chat.id;
  const userId = message.from.id;
  const stateKey = `${userId}_${chatId}`;
  
  // Инициализируем состояние создания
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
 * Обработать следующий шаг в создании сбора
 * @param message Объект сообщения Telegram
 * @returns Promise с текстом ответного сообщения
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
    return "Извините, не удалось найти информацию о создаваемом сборе. Пожалуйста, начните снова с команды /new";
  }
  
  let response = "";
  
  switch (state.step) {
    case 'title':
      state.data.title = message.text;
      state.step = 'description';
      response = "Отлично! Теперь введите описание сбора:";
      break;
    
    case 'description':
      state.data.description = message.text;
      state.step = 'amount';
      response = "Описание добавлено! Теперь укажите целевую сумму сбора (только число, например: 5000):";
      break;
      
    case 'amount':
      const amount = parseInt(message.text.replace(/[^\d]/g, ''), 10);
      if (isNaN(amount) || amount <= 0) {
        response = "Пожалуйста, введите корректную сумму (только число, например: 5000):";
      } else {
        state.data.goal = amount;
        state.step = 'deadline';
        response = "Сумма установлена! Теперь укажите крайний срок сбора в формате ДД.ММ.ГГГГ:";
      }
      break;
      
    case 'deadline':
      // Простая валидация даты - в реальном приложении была бы более надежной
      const dateParts = message.text.split('.');
      if (dateParts.length !== 3) {
        response = "Пожалуйста, введите дату в формате ДД.ММ.ГГГГ:";
      } else {
        // Сохраняем дедлайн (в реальном приложении была бы правильная валидация)
        state.data.completedAt = message.text;
        state.step = 'confirmation';
        
        // Готовим сообщение для подтверждения
        response = `Проверьте данные создаваемого сбора:\n\n` +
          `Название: ${state.data.title}\n` +
          `Описание: ${state.data.description}\n` +
          `Сумма: ${state.data.goal} руб.\n` +
          `Срок: ${state.data.completedAt}\n\n` +
          `Всё верно? Ответьте "Да" для создания сбора или "Нет" для отмены.`;
      }
      break;
      
    case 'confirmation':
      if (message.text.toLowerCase() === "да") {
        try {
          // Сохраняем в базу данных
          const { data, error } = await supabase
            .from('fundraisers')
            .insert({
              title: state.data.title,
              description: state.data.description,
              goal: state.data.goal,
              creator_id: parseInt(state.data.creatorId as string),
              creator_username: state.data.creatorUsername,
              status: 'active',
              raised: 0,
              completed_at: state.data.completedAt
            })
            .select()
            .single();
          
          if (error) {
            console.error('Ошибка создания сбора:', error);
            response = "Произошла ошибка при создании сбора. Пожалуйста, попробуйте позже.";
          } else {
            // Очищаем состояние создания
            delete fundraiserCreationStates[stateKey];
            
            response = `Сбор "${state.data.title}" успешно создан!\n\n` +
              `ID сбора: ${data.id}\n` +
              `Используйте команду /start_collection ${data.id} чтобы запустить сбор.`;
          }
        } catch (error) {
          console.error('Ошибка при сохранении сбора:', error);
          response = "Произошла ошибка при создании сбора. Пожалуйста, попробуйте позже.";
        }
      } else {
        // Очищаем состояние создания
        delete fundraiserCreationStates[stateKey];
        
        response = "Создание сбора отменено. Вы можете начать снова с команды /new";
      }
      break;
  }
  
  return response;
};

/**
 * Запуск активного сбора средств
 * @param message Объект сообщения Telegram
 * @param fundraiserId ID сбора
 * @returns Promise с текстом ответного сообщения
 */
export const startCollection = async (message: TelegramMessage, fundraiserId: string): Promise<string> => {
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  try {
    // Проверяем, существует ли сбор и принадлежит ли он пользователю
    const parsedId = parseInt(fundraiserId, 10);
    if (isNaN(parsedId)) {
      return "Некорректный ID сбора. Пожалуйста, используйте числовой ID.";
    }

    const { data: fundraiser, error } = await supabase
      .from('fundraisers')
      .select('*')
      .eq('id', parsedId)
      .eq('creator_id', message.from.id)
      .single();
    
    if (error || !fundraiser) {
      return "Сбор не найден или у вас нет прав для его запуска.";
    }
    
    if (fundraiser.status !== 'active') {
      return `Сбор "${fundraiser.title}" уже ${fundraiser.status === 'completed' ? 'завершен' : 'отменен'}.`;
    }
    
    // Обновляем статус сбора
    const { error: updateError } = await supabase
      .from('fundraisers')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', parsedId);
    
    if (updateError) {
      console.error('Ошибка обновления статуса сбора:', updateError);
      return "Произошла ошибка при запуске сбора. Пожалуйста, попробуйте позже.";
    }
    
    // В реальном приложении здесь можно отправить уведомления участникам
    
    return `Сбор "${fundraiser.title}" успешно запущен!\n\n` +
      `Участники получат уведомления о начале сбора.`;
  } catch (error) {
    console.error('Ошибка при запуске сбора:', error);
    return "Произошла ошибка при запуске сбора. Пожалуйста, попробуйте позже.";
  }
};

/**
 * Завершение сбора средств
 * @param message Объект сообщения Telegram
 * @param fundraiserId ID сбора
 * @returns Promise с текстом ответного сообщения
 */
export const finishCollection = async (message: TelegramMessage, fundraiserId: string): Promise<string> => {
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  try {
    // Проверяем, существует ли сбор и принадлежит ли он пользователю
    const parsedId = parseInt(fundraiserId, 10);
    if (isNaN(parsedId)) {
      return "Некорректный ID сбора. Пожалуйста, используйте числовой ID.";
    }

    const { data: fundraiser, error } = await supabase
      .from('fundraisers')
      .select('*')
      .eq('id', parsedId)
      .eq('creator_id', message.from.id)
      .single();
    
    if (error || !fundraiser) {
      return "Сбор не найден или у вас нет прав для его завершения.";
    }
    
    if (fundraiser.status !== 'active') {
      return `Сбор "${fundraiser.title}" уже ${fundraiser.status === 'completed' ? 'завершен' : 'отменен'}.`;
    }
    
    // Обновляем статус сбора
    const { error: updateError } = await supabase
      .from('fundraisers')
      .update({ 
        status: 'completed', 
        updated_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      })
      .eq('id', parsedId);
    
    if (updateError) {
      console.error('Ошибка обновления статуса сбора:', updateError);
      return "Произошла ошибка при завершении сбора. Пожалуйста, попробуйте позже.";
    }
    
    // В реальном приложении здесь можно отправить уведомления участникам
    
    return `Сбор "${fundraiser.title}" успешно завершен!\n\n` +
      `Собрано: ${fundraiser.raised || 0}/${fundraiser.goal} руб.\n` +
      `Участники получат уведомления о завершении сбора.`;
  } catch (error) {
    console.error('Ошибка при завершении сбора:', error);
    return "Произошла ошибка при завершении сбора. Пожалуйста, попробуйте позже.";
  }
};

/**
 * Отмена сбора средств
 * @param message Объект сообщения Telegram
 * @param fundraiserId ID сбора
 * @returns Promise с текстом ответного сообщения
 */
export const cancelCollection = async (message: TelegramMessage, fundraiserId: string): Promise<string> => {
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  try {
    // Проверяем, существует ли сбор и принадлежит ли он пользователю
    const parsedId = parseInt(fundraiserId, 10);
    if (isNaN(parsedId)) {
      return "Некорректный ID сбора. Пожалуйста, используйте числовой ID.";
    }

    const { data: fundraiser, error } = await supabase
      .from('fundraisers')
      .select('*')
      .eq('id', parsedId)
      .eq('creator_id', message.from.id)
      .single();
    
    if (error || !fundraiser) {
      return "Сбор не найден или у вас нет прав для его отмены.";
    }
    
    if (fundraiser.status !== 'active') {
      return `Сбор "${fundraiser.title}" уже ${fundraiser.status === 'completed' ? 'завершен' : 'отменен'}.`;
    }
    
    // Обновляем статус сбора
    const { error: updateError } = await supabase
      .from('fundraisers')
      .update({ 
        status: 'blocked', // Используем "blocked" как статус для отмененных сборов
        updated_at: new Date().toISOString()
      })
      .eq('id', parsedId);
    
    if (updateError) {
      console.error('Ошибка обновления статуса сбора:', updateError);
      return "Произошла ошибка при отмене сбора. Пожалуйста, попробуйте позже.";
    }
    
    // В реальном приложении здесь можно отправить уведомления участникам
    
    return `Сбор "${fundraiser.title}" успешно отменен!\n\n` +
      `Участники получат уведомления об отмене сбора.`;
  } catch (error) {
    console.error('Ошибка при отмене сбора:', error);
    return "Произошла ошибка при отмене сбора. Пожалуйста, попробуйте позже.";
  }
};

/**
 * Получение списка сборов пользователя
 * @param userId ID пользователя в Telegram
 * @returns Promise с текстом ответного сообщения
 */
export const listUserFundraisers = async (userId: number): Promise<string> => {
  try {
    // Получаем сборы пользователя из базы данных
    const { data: fundraisers, error } = await supabase
      .from('fundraisers')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Ошибка получения списка сборов:', error);
      return "Произошла ошибка при получении списка сборов. Пожалуйста, попробуйте позже.";
    }
    
    if (!fundraisers || fundraisers.length === 0) {
      return "У вас пока нет активных сборов. Создайте новый сбор с помощью команды /new";
    }
    
    let fundraisersText = "Ваши сборы средств:\n\n";
    
    fundraisers.forEach((f, index) => {
      const percentRaised = f.goal > 0 ? Math.round((f.raised / f.goal) * 100) : 0;
      const status = f.status === 'active' ? 'Активен' : f.status === 'completed' ? 'Завершен' : 'Отменен';
      
      fundraisersText += `${index + 1}. ${f.title}\n` +
        `   Статус: ${status}\n` +
        `   Собрано: ${f.raised}/${f.goal} руб. (${percentRaised}%)\n` +
        `   ID: ${f.id}\n\n`;
    });
    
    fundraisersText += "Для управления сбором используйте команды:\n" +
      "/start_collection [ID] - запустить сбор\n" +
      "/finish [ID] - завершить сбор\n" +
      "/cancel [ID] - отменить сбор\n" +
      "/list_payments [ID] - просмотреть взносы\n";
    
    return fundraisersText;
  } catch (error) {
    console.error('Ошибка при получении списка сборов:', error);
    return "Произошла ошибка при получении списка сборов. Пожалуйста, попробуйте позже.";
  }
};

/**
 * Получение списка взносов для конкретного сбора
 * @param message Объект сообщения Telegram
 * @param fundraiserId ID сбора
 * @returns Promise с текстом ответного сообщения
 */
export const listPayments = async (message: TelegramMessage, fundraiserId: string): Promise<string> => {
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  try {
    // Проверяем, существует ли сбор и принадлежит ли он пользователю
    const parsedId = parseInt(fundraiserId, 10);
    if (isNaN(parsedId)) {
      return "Некорректный ID сбора. Пожалуйста, используйте числовой ID.";
    }

    const { data: fundraiser, error } = await supabase
      .from('fundraisers')
      .select('*')
      .eq('id', parsedId)
      .eq('creator_id', message.from.id)
      .single();
    
    if (error || !fundraiser) {
      return "Сбор не найден или у вас нет прав для просмотра взносов.";
    }
    
    // Получаем взносы для данного сбора
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('fundraiser_id', parsedId)
      .order('created_at', { ascending: false });
    
    if (transactionsError) {
      console.error('Ошибка получения списка взносов:', transactionsError);
      return "Произошла ошибка при получении списка взносов. Пожалуйста, попробуйте позже.";
    }
    
    if (!transactions || transactions.length === 0) {
      return `Для сбора "${fundraiser.title}" пока нет взносов.`;
    }
    
    let paymentsText = `Взносы для сбора "${fundraiser.title}":\n\n`;
    
    transactions.forEach((t, index) => {
      const status = t.status === 'confirmed' ? 'Подтвержден' 
        : t.status === 'rejected' ? 'Отклонен' 
        : 'Ожидает подтверждения';
      
      paymentsText += `${index + 1}. От: ${t.donor_username || 'Аноним'}\n` +
        `   Сумма: ${t.amount} ${t.currency || 'руб.'}\n` +
        `   Статус: ${status}\n` +
        `   Дата: ${new Date(t.created_at).toLocaleDateString()}\n` +
        `   ID транзакции: ${t.id}\n\n`;
    });
    
    paymentsText += "Для подтверждения взноса используйте:\n" +
      "/confirm [ID транзакции]\n\n" +
      "Для отклонения взноса используйте:\n" +
      "/reject [ID транзакции] [причина]";
    
    return paymentsText;
  } catch (error) {
    console.error('Ошибка при получении списка взносов:', error);
    return "Произошла ошибка при получении списка взносов. Пожалуйста, попробуйте позже.";
  }
};

/**
 * Получение детальной информации о сборе
 * @param message Объект сообщения Telegram
 * @param fundraiserId ID сбора
 * @returns Promise с текстом ответного сообщения
 */
export const getFundraiserDetails = async (message: TelegramMessage, fundraiserId: string): Promise<{text: string, showJoinButton: boolean}> => {
  try {
    // Получаем информацию о сборе из базы данных
    const parsedId = parseInt(fundraiserId, 10);
    if (isNaN(parsedId)) {
      return {
        text: "Некорректный ID сбора. Пожалуйста, используйте числовой ID.",
        showJoinButton: false
      };
    }

    const { data: fundraiser, error } = await supabase
      .from('fundraisers')
      .select('*')
      .eq('id', parsedId)
      .single();
    
    if (error || !fundraiser) {
      return {
        text: "Сбор не найден или был удален.",
        showJoinButton: false
      };
    }
    
    // Проверяем, является ли текущий пользователь создателем сбора
    const isCreator = message.from && message.from.id === fundraiser.creator_id;
    
    // Получаем количество участников
    const { count: participantsCount, error: countError } = await supabase
      .from('transactions')
      .select('donor_id', { count: 'exact', head: true })
      .eq('fundraiser_id', parsedId);
    
    if (countError) {
      console.error('Ошибка при подсчете участников:', countError);
    }
    
    const percentRaised = fundraiser.goal > 0 ? Math.round((fundraiser.raised / fundraiser.goal) * 100) : 0;
    const status = fundraiser.status === 'active' ? 'Активен' 
      : fundraiser.status === 'completed' ? 'Завершен' 
      : 'Отменен';
    
    let detailsText = `Информация о сборе:\n\n` +
      `Название: ${fundraiser.title}\n` +
      `Описание: ${fundraiser.description || 'Нет описания'}\n` +
      `Статус: ${status}\n` +
      `Сумма: ${fundraiser.goal} руб.\n` +
      `Собрано: ${fundraiser.raised || 0} руб. (${percentRaised}%)\n` +
      `Участников: ${participantsCount || 0}\n` +
      `Организатор: ${fundraiser.creator_username}\n`;
    
    if (fundraiser.completed_at) {
      detailsText += `Срок: ${fundraiser.completed_at}\n`;
    }
    
    // Добавляем разные инструкции в зависимости от того, 
    // является ли пользователь создателем сбора
    if (isCreator) {
      detailsText += "\nКоманды для управления сбором:\n" +
        `/start_collection ${fundraiserId} - запустить сбор\n` +
        `/finish ${fundraiserId} - завершить сбор\n` +
        `/cancel ${fundraiserId} - отменить сбор\n` +
        `/list_payments ${fundraiserId} - просмотреть взносы\n`;
    } else {
      // Показываем кнопку присоединения только если сбор активен
      const showJoinButton = fundraiser.status === 'active';
      
      if (showJoinButton) {
        detailsText += "\nДля участия в сборе нажмите кнопку 'Присоединиться' ниже или используйте команду:\n" +
          `/join ${fundraiserId}\n`;
      } else {
        detailsText += "\nЭтот сбор уже не принимает новых участников.";
      }
      
      return {
        text: detailsText,
        showJoinButton: showJoinButton
      };
    }
    
    return {
      text: detailsText,
      showJoinButton: false
    };
  } catch (error) {
    console.error('Ошибка при получении информации о сборе:', error);
    return {
      text: "Произошла ошибка при получении информации о сборе. Пожалуйста, попробуйте позже.",
      showJoinButton: false
    };
  }
};

/**
 * Присоединение к сбору средств в качестве участника
 * @param message Объект сообщения Telegram
 * @param fundraiserId ID сбора
 * @returns Promise с текстом ответного сообщения
 */
export const joinFundraiser = async (message: TelegramMessage, fundraiserId: string): Promise<string> => {
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  try {
    // Получаем информацию о сборе из базы данных
    const parsedId = parseInt(fundraiserId, 10);
    if (isNaN(parsedId)) {
      return "Некорректный ID сбора. Пожалуйста, используйте числовой ID.";
    }

    const { data: fundraiser, error } = await supabase
      .from('fundraisers')
      .select('*')
      .eq('id', parsedId)
      .single();
    
    if (error || !fundraiser) {
      return "Сбор не найден или был удален.";
    }
    
    if (fundraiser.status !== 'active') {
      return `Сбор "${fundraiser.title}" ${fundraiser.status === 'completed' ? 'уже завершен' : 'отменен'} и не принимает новых участников.`;
    }
    
    // Проверяем, является ли пользователь создателем сбора
    if (message.from.id === fundraiser.creator_id) {
      return "Вы не можете присоединиться к собственному сбору в качестве участника.";
    }
    
    // В реальном приложении здесь можно добавить пользователя в список участников
    // Для MVP просто отвечаем успешным сообщением
    
    return `Вы успешно присоединились к сбору "${fundraiser.title}"!\n\n` +
      `Для внесения взноса используйте команду:\n` +
      `/paid ${fundraiserId} [сумма]\n\n` +
      `Например: /paid ${fundraiserId} 500`;
  } catch (error) {
    console.error('Ошибка при присоединении к сбору:', error);
    return "Произошла ошибка при присоединении к сбору. Пожалуйста, попробуйте позже.";
  }
};

/**
 * Получить историю сборов пользователя
 * @param userId ID пользователя в Telegram
 * @returns Promise с текстом ответного сообщения
 */
export const getUserFundraiserHistory = async (userId: number): Promise<string> => {
  try {
    // Получаем завершенные и отмененные сборы пользователя
    const { data: fundraisers, error } = await supabase
      .from('fundraisers')
      .select('*')
      .eq('creator_id', userId)
      .in('status', ['completed', 'blocked']) // Получаем только завершенные или отмененные сборы
      .order('completed_at', { ascending: false });
    
    if (error) {
      console.error('Ошибка получения истории сборов:', error);
      return "Произошла ошибка при получении истории сборов. Пожалуйста, попробуйте позже.";
    }
    
    if (!fundraisers || fundraisers.length === 0) {
      return "У вас пока нет завершенных сборов в истории.";
    }
    
    let historyText = "История ваших сборов:\n\n";
    
    fundraisers.forEach((f, index) => {
      const percentRaised = f.goal > 0 ? Math.round((f.raised / f.goal) * 100) : 0;
      const status = f.status === 'completed' ? 'Завершен' : 'Отменен';
      const completedDate = f.completed_at ? new Date(f.completed_at).toLocaleDateString() : 'Не указано';
      
      historyText += `${index + 1}. ${f.title}\n` +
        `   Статус: ${status}\n` +
        `   Собрано: ${f.raised || 0}/${f.goal} руб. (${percentRaised}%)\n` +
        `   Дата завершения: ${completedDate}\n` +
        `   ID: ${f.id}\n\n`;
    });
    
    return historyText;
  } catch (error) {
    console.error('Ошибка при получении истории сборов:', error);
    return "Произошла ошибка при получении истории сборов. Пожалуйста, попробуйте позже.";
  }
};
