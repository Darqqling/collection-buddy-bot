
/**
 * Payment processing module for Telegram Bot
 * 
 * This module handles the processing of payments from fundraiser participants.
 */

import { TelegramMessage } from '../botService';
import { PaymentMethod, TransactionStatus } from '../../types';
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
        fundraiser_id: parsedId,
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
