
/**
 * Process Payment Handler
 * 
 * This module handles processing of new payments from bot users
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Process a payment from a user
 * @param fundraiserId The ID of the fundraiser
 * @param userId The ID of the user making the payment
 * @param amount The payment amount
 * @param comment Optional payment comment
 * @returns A result object with success status and message
 */
export const processPayment = async (
  fundraiserId: string | number,
  userId: number,
  amount: number,
  comment: string = ""
): Promise<{ success: boolean; message: string; paymentId?: number }> => {
  try {
    console.log(`Processing payment for fundraiser ${fundraiserId}, user ${userId}, amount ${amount}`);

    // Convert fundraiserId to number if it's a string
    const fundraiserIdNum = typeof fundraiserId === 'string' ? parseInt(fundraiserId, 10) : fundraiserId;
    
    if (isNaN(fundraiserIdNum)) {
      console.error('Invalid fundraiser ID');
      return { 
        success: false, 
        message: 'Неверный идентификатор сбора. Пожалуйста, проверьте ID и попробуйте снова.' 
      };
    }

    // Check if fundraiser exists and is active
    const { data: fundraiser, error: fundraiserError } = await supabase
      .from('fundraisers')
      .select('*')
      .eq('id', fundraiserIdNum)
      .single();

    if (fundraiserError || !fundraiser) {
      console.error('Fundraiser not found:', fundraiserError);
      return {
        success: false,
        message: 'Сбор не найден. Пожалуйста, проверьте ID и попробуйте снова.'
      };
    }

    if (fundraiser.status !== 'active') {
      return {
        success: false,
        message: `Сбор "${fundraiser.title}" сейчас ${
          fundraiser.status === 'completed' ? 'завершен' : 
          fundraiser.status === 'cancelled' ? 'отменен' : 'не активен'
        }. Внесение платежей невозможно.`
      };
    }

    // Create new payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        fundraiser_id: fundraiserIdNum,
        user_id: userId,
        amount: amount,
        comment: comment,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return {
        success: false,
        message: 'Произошла ошибка при создании платежа. Пожалуйста, попробуйте позже.'
      };
    }

    return {
      success: true,
      message: `Ваш платеж на сумму ${amount} руб. для сбора "${fundraiser.title}" успешно создан и ожидает подтверждения организатором.`,
      paymentId: payment.id
    };
  } catch (error) {
    console.error('Error in processPayment:', error);
    return {
      success: false,
      message: 'Произошла системная ошибка. Пожалуйста, попробуйте позже.'
    };
  }
};
