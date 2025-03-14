
/**
 * Payment rejection module for Telegram Bot
 * 
 * This module handles the rejection of payments by fundraiser organizers.
 */

import { TelegramMessage } from '../botService';
import { TransactionStatus } from '../../types';
import { supabase } from '@/integrations/supabase/client';

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
      .eq('id', parsedId);
    
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
