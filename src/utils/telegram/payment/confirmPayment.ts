
/**
 * Confirm Payment Handler
 * 
 * This module handles confirming pending payments by organizers
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Confirm a payment
 * @param paymentId The ID of the payment to confirm
 * @param organizerId The ID of the organizer confirming the payment
 * @returns A result object with success status and message
 */
export const confirmPayment = async (
  paymentId: string | number,
  organizerId: number
): Promise<{ success: boolean; message: string; payment?: any }> => {
  try {
    console.log(`Confirming payment ${paymentId} by organizer ${organizerId}`);
    
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
        message: 'Этот платеж уже подтвержден.'
      };
    }

    if (payment.status === 'rejected') {
      return {
        success: false,
        message: 'Этот платеж был отклонен и не может быть подтвержден.'
      };
    }

    // Check if organizer has permission to confirm this payment
    if (payment.fundraisers.creator_id !== organizerId) {
      return {
        success: false,
        message: 'У вас нет прав для подтверждения этого платежа.'
      };
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
      .eq('id', paymentIdNum);

    if (updateError) {
      console.error('Error confirming payment:', updateError);
      return {
        success: false,
        message: 'Произошла ошибка при подтверждении платежа. Пожалуйста, попробуйте позже.'
      };
    }

    // Update fundraiser raised amount
    const { error: fundraiserError } = await supabase
      .from('fundraisers')
      .update({
        raised: payment.fundraisers.raised + payment.amount
      })
      .eq('id', payment.fundraiser_id);

    if (fundraiserError) {
      console.error('Error updating fundraiser amount:', fundraiserError);
      // We don't return error here since the payment is already confirmed
      // But we log it to fix it later
    }

    return {
      success: true,
      message: `Платеж на сумму ${payment.amount} руб. успешно подтвержден.`,
      payment: payment
    };
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    return {
      success: false,
      message: 'Произошла системная ошибка. Пожалуйста, попробуйте позже.'
    };
  }
};
