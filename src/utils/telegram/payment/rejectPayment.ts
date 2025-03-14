
/**
 * Reject Payment Handler
 * 
 * This module handles rejecting pending payments by organizers
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Reject a payment
 * @param paymentId The ID of the payment to reject
 * @param organizerId The ID of the organizer rejecting the payment
 * @param reason Optional reason for rejection
 * @returns A result object with success status and message
 */
export const rejectPayment = async (
  paymentId: string | number,
  organizerId: number,
  reason: string = ""
): Promise<{ success: boolean; message: string; payment?: any }> => {
  try {
    console.log(`Rejecting payment ${paymentId} by organizer ${organizerId}`);
    
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

    // Check if payment is already confirmed or rejected
    if (payment.status === 'confirmed') {
      return {
        success: false,
        message: 'Этот платеж уже подтвержден и не может быть отклонен.'
      };
    }

    if (payment.status === 'rejected') {
      return {
        success: false,
        message: 'Этот платеж уже был отклонен.'
      };
    }

    // Check if organizer has permission to reject this payment
    if (payment.fundraisers.creator_id !== organizerId) {
      return {
        success: false,
        message: 'У вас нет прав для отклонения этого платежа.'
      };
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejected_at: new Date().toISOString()
      })
      .eq('id', paymentIdNum);

    if (updateError) {
      console.error('Error rejecting payment:', updateError);
      return {
        success: false,
        message: 'Произошла ошибка при отклонении платежа. Пожалуйста, попробуйте позже.'
      };
    }

    return {
      success: true,
      message: `Платеж на сумму ${payment.amount} руб. был отклонен.`,
      payment: payment
    };
  } catch (error) {
    console.error('Error in rejectPayment:', error);
    return {
      success: false,
      message: 'Произошла системная ошибка. Пожалуйста, попробуйте позже.'
    };
  }
};
