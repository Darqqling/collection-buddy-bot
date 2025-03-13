
/**
 * Payment Command Handlers for Telegram Bot
 * 
 * This module contains handlers for commands related to payment processing.
 */

import { TelegramMessage } from './botService';
import { PaymentMethod, TransactionStatus } from '../types';

/**
 * Process a payment confirmation from a user
 * @param message The Telegram message object
 * @param fundraiserId The ID of the fundraiser
 * @returns A promise that resolves with the response message
 */
export const confirmPayment = async (message: TelegramMessage, fundraiserId: string): Promise<string> => {
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  // In a real app, would create a transaction record in the database
  const transactionId = Date.now().toString(); // Simple mock ID
  
  // Log the mock transaction
  console.log('Payment confirmation:', {
    fundraiserId,
    donorId: message.from.id.toString(),
    donorUsername: message.from.username || message.from.first_name,
    status: TransactionStatus.PENDING,
    paymentMethod: PaymentMethod.TELEGRAM_STARS,
    createdAt: new Date().toISOString()
  });
  
  // For MVP, just return a success message
  return "Спасибо! Ваш платеж ожидает подтверждения организатором сбора.\n\n" +
    `Идентификатор транзакции: ${transactionId}\n` +
    "Вы получите уведомление, когда платеж будет подтвержден.";
};

/**
 * Process payment approval by a fundraiser organizer
 * @param message The Telegram message object
 * @param transactionId The ID of the transaction to approve
 * @returns A promise that resolves with the response message
 */
export const approvePayment = async (message: TelegramMessage, transactionId: string): Promise<string> => {
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  // In a real app, would update the transaction status in the database
  
  // Log the mock approval
  console.log('Payment approval:', {
    transactionId,
    approverId: message.from.id.toString(),
    approverUsername: message.from.username || message.from.first_name,
    status: TransactionStatus.CONFIRMED,
    confirmedAt: new Date().toISOString()
  });
  
  // For MVP, just return a success message
  return `Платеж с идентификатором ${transactionId} успешно подтвержден.\n\n` +
    "Участник получит уведомление о подтверждении платежа.";
};

/**
 * Process payment rejection by a fundraiser organizer
 * @param message The Telegram message object
 * @param transactionId The ID of the transaction to reject
 * @param reason The reason for rejection
 * @returns A promise that resolves with the response message
 */
export const rejectPayment = async (message: TelegramMessage, transactionId: string, reason?: string): Promise<string> => {
  if (!message.from) {
    return "Извините, не удалось определить отправителя сообщения.";
  }
  
  // In a real app, would update the transaction status in the database
  
  // Log the mock rejection
  console.log('Payment rejection:', {
    transactionId,
    rejecterId: message.from.id.toString(),
    rejectorUsername: message.from.username || message.from.first_name,
    status: TransactionStatus.REJECTED,
    rejectedAt: new Date().toISOString(),
    reason: reason || 'No reason provided'
  });
  
  // For MVP, just return a success message
  return `Платеж с идентификатором ${transactionId} отклонен.\n\n` +
    `Причина: ${reason || 'Не указана'}\n\n` +
    "Участник получит уведомление об отклонении платежа.";
};

/**
 * Get payment status for a user
 * @param userId The Telegram user ID
 * @returns A promise that resolves with the payment status as a string
 */
export const getPaymentStatus = async (userId: number): Promise<string> => {
  // In a real app, would fetch from database
  // For MVP, return a mock response
  return "Статус ваших платежей:\n\n" +
    "1. День рождения Алексея - 500₽ (Подтвержден)\n" +
    "2. Корпоратив - 1000₽ (Ожидает подтверждения)\n\n" +
    "Общая сумма ваших взносов: 1500₽";
};
