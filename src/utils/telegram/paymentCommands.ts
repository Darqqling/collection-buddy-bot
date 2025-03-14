
/**
 * Payment Command Handlers for Telegram Bot
 * 
 * This module contains handlers for commands related to payment processing.
 */

import { TelegramMessage } from './botService';
import { PaymentMethod, TransactionStatus } from '../types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Обработать платеж от участника сбора
 * @param message Объект сообщения Telegram
 * @param fundraiserId ID сбора
 * @param amount Сумма платежа
 * @param comment Комментарий к платежу
 * @returns Promise с текстом ответного сообщения
 */
export const processPayment = async (message: TelegramMessage, fundraiserId: string, amount: number, comment?: string): Promise<string> => {
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  try {
    // Проверяем, существует ли сбор и активен ли он
    const { data: fundraiser, error } = await supabase
      .from('fundraisers')
      .select('*')
      .eq('id', fundraiserId)
      .single();
    
    if (error || !fundraiser) {
      return "Сбор не найден или был удален.";
    }
    
    if (fundraiser.status !== 'active') {
      return `Сбор "${fundraiser.title}" ${fundraiser.status === 'completed' ? 'уже завершен' : 'отменен'} и не принимает платежей.`;
    }
    
    // Проверяем, не является ли пользователь создателем сбора
    if (message.from.id === fundraiser.creator_id) {
      return "Вы не можете внести взнос в собственный сбор.";
    }
    
    // Проверяем корректность суммы
    if (isNaN(amount) || amount <= 0) {
      return "Пожалуйста, укажите корректную сумму платежа больше нуля.";
    }
    
    // Создаем запись о транзакции
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        fundraiser_id: parseInt(fundraiserId),
        donor_id: message.from.id,
        donor_username: message.from.username || message.from.first_name,
        amount: amount,
        currency: 'RUB',
        payment_method: PaymentMethod.TELEGRAM_STARS,
        status: TransactionStatus.PENDING,
        notes: comment || 'Без комментария'
      })
      .select()
      .single();
    
    if (transactionError) {
      console.error('Ошибка создания транзакции:', transactionError);
      return "Произошла ошибка при обработке платежа. Пожалуйста, попробуйте позже.";
    }
    
    // Отправляем уведомление организатору сбора (в реальном приложении)
    
    return `Спасибо! Ваш платеж на сумму ${amount} руб. для сбора "${fundraiser.title}" ожидает подтверждения организатором.\n\n` +
      `Идентификатор транзакции: ${transaction.id}\n` +
      "Вы получите уведомление, когда платеж будет подтвержден.";
  } catch (error) {
    console.error('Ошибка при обработке платежа:', error);
    return "Произошла ошибка при обработке платежа. Пожалуйста, попробуйте позже.";
  }
};

/**
 * Подтвердить платеж организатором сбора
 * @param message Объект сообщения Telegram
 * @param transactionId ID транзакции
 * @returns Promise с текстом ответного сообщения
 */
export const confirmPayment = async (message: TelegramMessage, transactionId: string): Promise<string> => {
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  try {
    // Получаем информацию о транзакции
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*, fundraisers(*)')
      .eq('id', transactionId)
      .single();
    
    if (error || !transaction) {
      return "Транзакция не найдена или была удалена.";
    }
    
    // Проверяем, является ли пользователь организатором сбора
    if (message.from.id !== transaction.fundraisers.creator_id) {
      return "У вас нет прав для подтверждения этой транзакции.";
    }
    
    // Проверяем статус транзакции
    if (transaction.status !== TransactionStatus.PENDING) {
      return `Эта транзакция уже ${transaction.status === TransactionStatus.CONFIRMED ? 'подтверждена' : 'отклонена'}.`;
    }
    
    // Обновляем статус транзакции
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: TransactionStatus.CONFIRMED,
        confirmed_at: new Date().toISOString()
      })
      .eq('id', transactionId);
    
    if (updateError) {
      console.error('Ошибка обновления статуса транзакции:', updateError);
      return "Произошла ошибка при подтверждении платежа. Пожалуйста, попробуйте позже.";
    }
    
    // Обновляем сумму собранных средств в сборе
    const newRaisedAmount = (transaction.fundraisers.raised || 0) + transaction.amount;
    
    const { error: fundraiserUpdateError } = await supabase
      .from('fundraisers')
      .update({
        raised: newRaisedAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', transaction.fundraiser_id);
    
    if (fundraiserUpdateError) {
      console.error('Ошибка обновления суммы сбора:', fundraiserUpdateError);
    }
    
    // В реальном приложении здесь отправили бы уведомление донору
    
    return `Платеж на сумму ${transaction.amount} ${transaction.currency || 'руб.'} успешно подтвержден.\n\n` +
      `Сбор "${transaction.fundraisers.title}" теперь имеет ${newRaisedAmount}/${transaction.fundraisers.goal} руб.\n` +
      "Участник получит уведомление о подтверждении платежа.";
  } catch (error) {
    console.error('Ошибка при подтверждении платежа:', error);
    return "Произошла ошибка при подтверждении платежа. Пожалуйста, попробуйте позже.";
  }
};

/**
 * Отклонить платеж организатором сбора
 * @param message Объект сообщения Telegram
 * @param transactionId ID транзакции
 * @param reason Причина отклонения
 * @returns Promise с текстом ответного сообщения
 */
export const rejectPayment = async (message: TelegramMessage, transactionId: string, reason?: string): Promise<string> => {
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  try {
    // Получаем информацию о транзакции
    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*, fundraisers(*)')
      .eq('id', transactionId)
      .single();
    
    if (error || !transaction) {
      return "Транзакция не найдена или была удалена.";
    }
    
    // Проверяем, является ли пользователь организатором сбора
    if (message.from.id !== transaction.fundraisers.creator_id) {
      return "У вас нет прав для отклонения этой транзакции.";
    }
    
    // Проверяем статус транзакции
    if (transaction.status !== TransactionStatus.PENDING) {
      return `Эта транзакция уже ${transaction.status === TransactionStatus.CONFIRMED ? 'подтверждена' : 'отклонена'}.`;
    }
    
    // Обновляем статус транзакции
    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        status: TransactionStatus.REJECTED,
        rejected_at: new Date().toISOString(),
        notes: reason ? `${transaction.notes || ''}\nПричина отклонения: ${reason}` : transaction.notes
      })
      .eq('id', transactionId);
    
    if (updateError) {
      console.error('Ошибка обновления статуса транзакции:', updateError);
      return "Произошла ошибка при отклонении платежа. Пожалуйста, попробуйте позже.";
    }
    
    // В реальном приложении здесь отправили бы уведомление донору
    
    return `Платеж на сумму ${transaction.amount} ${transaction.currency || 'руб.'} отклонен.\n\n` +
      `Причина: ${reason || 'Не указана'}\n` +
      "Участник получит уведомление об отклонении платежа.";
  } catch (error) {
    console.error('Ошибка при отклонении платежа:', error);
    return "Произошла ошибка при отклонении платежа. Пожалуйста, попробуйте позже.";
  }
};

/**
 * Получить статус платежей пользователя
 * @param userId ID пользователя в Telegram
 * @returns Promise с текстом ответного сообщения
 */
export const getPaymentStatus = async (userId: number): Promise<string> => {
  try {
    // Получаем транзакции пользователя
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*, fundraisers(title)')
      .eq('donor_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Ошибка получения статуса платежей:', error);
      return "Произошла ошибка при получении статуса платежей. Пожалуйста, попробуйте позже.";
    }
    
    if (!transactions || transactions.length === 0) {
      return "У вас пока нет совершенных платежей.";
    }
    
    let statusText = "Статус ваших платежей:\n\n";
    let totalAmount = 0;
    
    transactions.forEach((t, index) => {
      const status = t.status === TransactionStatus.CONFIRMED ? 'Подтвержден' 
        : t.status === TransactionStatus.REJECTED ? 'Отклонен' 
        : 'Ожидает подтверждения';
      
      statusText += `${index + 1}. ${t.fundraisers.title} - ${t.amount} ${t.currency || 'руб.'} (${status})\n`;
      
      if (t.status === TransactionStatus.CONFIRMED) {
        totalAmount += t.amount;
      }
    });
    
    statusText += `\nОбщая сумма ваших подтвержденных взносов: ${totalAmount} руб.`;
    
    return statusText;
  } catch (error) {
    console.error('Ошибка при получении статуса платежей:', error);
    return "Произошла ошибка при получении статуса платежей. Пожалуйста, попробуйте позже.";
  }
};
