
/**
 * Payment confirmation module for Telegram Bot
 * 
 * This module handles the confirmation of payments by fundraiser organizers.
 */

import { TelegramMessage } from '../botService';
import { TransactionStatus } from '../../types';
import { supabase } from '@/integrations/supabase/client';

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
    const parsedId = parseInt(transactionId, 10);
    if (isNaN(parsedId)) {
      return "Некорректный ID транзакции. Пожалуйста, используйте числовой ID.";
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*, fundraisers(*)')
      .eq('id', parsedId)
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
      .eq('id', parsedId);
    
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
