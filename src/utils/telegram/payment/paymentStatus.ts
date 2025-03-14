
/**
 * Payment Status Handler
 * 
 * This module handles checking status of payments
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Get payment status
 * @param paymentId The ID of the payment to check
 * @param userId The ID of the user requesting status
 * @returns A result object with payment details
 */
export const getPaymentStatus = async (
  paymentId: string | number,
  userId: number
): Promise<{ success: boolean; message: string; payment?: any }> => {
  try {
    console.log(`Checking payment status for payment ${paymentId}, user ${userId}`);
    
    // Convert paymentId to number if it's a string
    const paymentIdNum = typeof paymentId === 'string' ? parseInt(paymentId, 10) : paymentId;
    
    if (isNaN(paymentIdNum)) {
      console.error('Invalid payment ID');
      return { 
        success: false, 
        message: 'Неверный идентификатор платежа. Пожалуйста, проверьте ID и попробуйте снова.' 
      };
    }

    // Get payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*, fundraisers(*)')
      .eq('id', paymentIdNum)
      .single();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      return {
        success: false,
        message: 'Платеж не найден. Пожалуйста, проверьте ID и попробуйте снова.'
      };
    }

    // Check if user has permission to view this payment
    const isOrganizer = payment.fundraisers.creator_id === userId;
    const isPaymentOwner = payment.user_id === userId;

    if (!isOrganizer && !isPaymentOwner) {
      return {
        success: false,
        message: 'У вас нет прав для просмотра информации об этом платеже.'
      };
    }

    // Format status
    const status = 
      payment.status === 'pending' ? 'ожидает подтверждения' :
      payment.status === 'confirmed' ? 'подтвержден' :
      payment.status === 'rejected' ? 'отклонен' : payment.status;

    const message = 
      `🧾 Информация о платеже #${payment.id}:\n\n` +
      `Сбор: ${payment.fundraisers.title}\n` +
      `Сумма: ${payment.amount} руб.\n` +
      `Статус: ${status}\n` +
      (payment.comment ? `Комментарий: ${payment.comment}\n` : '') +
      (payment.status === 'rejected' && payment.rejection_reason ? `Причина отклонения: ${payment.rejection_reason}\n` : '') +
      `Дата создания: ${new Date(payment.created_at).toLocaleString('ru-RU')}\n` +
      (payment.confirmed_at ? `Дата подтверждения: ${new Date(payment.confirmed_at).toLocaleString('ru-RU')}\n` : '') +
      (payment.rejected_at ? `Дата отклонения: ${new Date(payment.rejected_at).toLocaleString('ru-RU')}\n` : '');

    return {
      success: true,
      message: message,
      payment: payment
    };
  } catch (error) {
    console.error('Error in getPaymentStatus:', error);
    return {
      success: false,
      message: 'Произошла системная ошибка. Пожалуйста, попробуйте позже.'
    };
  }
};
