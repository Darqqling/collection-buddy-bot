
/**
 * Payment status module for Telegram Bot
 * 
 * This module handles retrieving payment status information.
 */

import { TransactionStatus } from '../../types';
import { supabase } from '@/integrations/supabase/client';

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
