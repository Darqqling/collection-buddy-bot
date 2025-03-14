
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { webhookUrl } = await req.json();
    
    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: 'Webhook URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the bot token from the database
    const { data: configData, error: configError } = await supabase
      .from('bot_config')
      .select('bot_token')
      .eq('id', 1)
      .single();

    if (configError || !configData.bot_token) {
      return new Response(
        JSON.stringify({ error: 'Bot token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const botToken = configData.bot_token;

    // Call Telegram API to set the webhook
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      }),
    });

    const telegramData = await telegramResponse.json();

    if (!telegramData.ok) {
      // Update the database with the error
      await supabase
        .from('bot_config')
        .update({
          webhook_url: webhookUrl,
          webhook_active: false,
          last_webhook_check: new Date().toISOString(),
          webhook_error: telegramData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      return new Response(
        JSON.stringify({ error: telegramData.description }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update the database with the successful webhook setup
    const { error: updateError } = await supabase
      .from('bot_config')
      .update({
        webhook_url: webhookUrl,
        webhook_active: true,
        last_webhook_check: new Date().toISOString(),
        webhook_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (updateError) {
      console.error('Error updating webhook config:', updateError);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook set successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error setting webhook:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
