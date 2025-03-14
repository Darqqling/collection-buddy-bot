
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, RefreshCw, Globe, Bot } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { TelegramWebhookConfig } from '@/utils/types';
import { supabase } from "@/integrations/supabase/client";

interface WebhookSetupProps {
  initialConfig?: TelegramWebhookConfig;
  onUpdate?: (config: TelegramWebhookConfig) => void;
}

const WebhookSetup = ({ initialConfig, onUpdate }: WebhookSetupProps) => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [botToken, setBotToken] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [isSettingWebhook, setIsSettingWebhook] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookConfig, setWebhookConfig] = useState<TelegramWebhookConfig>({
    url: '',
    isActive: false
  });
  const [botInfo, setBotInfo] = useState<any>(null);

  useEffect(() => {
    if (initialConfig) {
      setWebhookConfig(initialConfig);
      setWebhookUrl(initialConfig.url);
    }
    
    // Fetch current config from database
    fetchConfig();
  }, [initialConfig]);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('bot_config')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching config:', error);
        return;
      }

      if (data) {
        setWebhookConfig({
          url: data.webhook_url || '',
          isActive: data.webhook_active || false,
          lastChecked: data.last_webhook_check,
          error: data.webhook_error
        });
        
        if (data.webhook_url) {
          setWebhookUrl(data.webhook_url);
        }
        
        // If we have a bot token, check if it's still valid
        if (data.bot_token) {
          validateBotToken(data.bot_token);
        }
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };
  
  const validateBotToken = async (token: string) => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await response.json();
      
      if (data.ok) {
        setBotInfo(data.result);
      }
    } catch (error) {
      console.error('Error validating token:', error);
    }
  };

  const saveBotToken = async () => {
    if (!botToken) {
      toast({
        title: "Token is required",
        description: "Please enter a valid Telegram bot token",
        variant: "destructive",
      });
      return;
    }
    
    setIsSavingToken(true);
    
    try {
      const response = await supabase.functions.invoke('save-bot-token', {
        body: { botToken },
      });
      
      if (response.error) {
        toast({
          title: "Error saving token",
          description: response.error,
          variant: "destructive",
        });
        return;
      }
      
      setBotInfo(response.data.bot);
      setIsSavingToken(false);
      
      toast({
        title: "Bot token saved",
        description: `Successfully connected to @${response.data.bot.username}`,
      });
      
      // Clear the input
      setBotToken('');
      
      // Refresh the config
      fetchConfig();
    } catch (error) {
      console.error('Error saving token:', error);
      
      toast({
        title: "Error saving token",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      
      setIsSavingToken(false);
    }
  };

  const setWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Webhook URL is required",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      });
      return;
    }
    
    setIsSettingWebhook(true);
    
    try {
      const response = await supabase.functions.invoke('set-webhook', {
        body: { webhookUrl },
      });
      
      if (response.error) {
        toast({
          title: "Error setting webhook",
          description: response.error,
          variant: "destructive",
        });
        setIsSettingWebhook(false);
        return;
      }
      
      setIsSettingWebhook(false);
      
      toast({
        title: "Webhook set successfully",
        description: "The Telegram bot webhook has been configured",
      });
      
      // Refresh the config
      fetchConfig();
      
      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate({
          url: webhookUrl,
          isActive: true,
          lastChecked: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error setting webhook:', error);
      
      toast({
        title: "Error setting webhook",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      
      setIsSettingWebhook(false);
    }
  };
  
  const testWebhook = async () => {
    setIsTestingWebhook(true);
    
    try {
      // For now, we'll just check if the webhook URL is accessible
      const response = await fetch(webhookUrl, {
        method: 'OPTIONS',
      });
      
      if (response.ok) {
        toast({
          title: "Webhook is accessible",
          description: "The webhook URL is reachable",
        });
      } else {
        throw new Error(`HTTP error ${response.status}`);
      }
    } catch (error) {
      console.error('Error testing webhook:', error);
      
      toast({
        title: "Webhook test failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <span>Telegram Bot Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure your Telegram bot by providing its API token
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {botInfo ? (
            <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center gap-2">
                <span>Connected to @{botInfo.username} ({botInfo.first_name})</span>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="bot-token">Bot Token</Label>
              <div className="flex space-x-2">
                <Input
                  id="bot-token"
                  placeholder="123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  type="password"
                />
                <Button 
                  onClick={saveBotToken}
                  disabled={!botToken || isSavingToken}
                >
                  {isSavingToken ? "Saving..." : "Save"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                You can get a token by talking to @BotFather on Telegram.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <span>Telegram Webhook Setup</span>
          </CardTitle>
          <CardDescription>
            Configure the webhook URL for your Telegram bot to receive real-time updates
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              placeholder="https://your-server.com/telegram/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This URL must be publicly accessible, use HTTPS, and point to your deployed Supabase Edge Function.
              Example: https://yaxkzkjpqvpgyyyaybri.supabase.co/functions/v1/telegram-webhook
            </p>
          </div>
          
          {webhookConfig.isActive && (
            <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center gap-2">
                <span>Webhook is active and receiving updates</span>
              </AlertDescription>
            </Alert>
          )}
          
          {webhookConfig.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {webhookConfig.error}
              </AlertDescription>
            </Alert>
          )}
          
          {webhookConfig.lastChecked && (
            <p className="text-xs text-muted-foreground">
              Last checked: {new Date(webhookConfig.lastChecked).toLocaleString()}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto gap-2" 
            onClick={testWebhook}
            disabled={!webhookUrl || isTestingWebhook || !botInfo}
          >
            {isTestingWebhook ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Test Webhook</span>
              </>
            )}
          </Button>
          
          <Button 
            className="w-full sm:w-auto" 
            onClick={setWebhook}
            disabled={!webhookUrl || isSettingWebhook || !botInfo}
          >
            {isSettingWebhook ? "Setting..." : "Set Webhook"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WebhookSetup;
