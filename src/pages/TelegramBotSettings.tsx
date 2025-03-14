
import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import WebhookSetup from "@/components/WebhookSetup";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { TelegramWebhookConfig } from '@/utils/types';
import { supabase } from "@/integrations/supabase/client";
import { Bot, Eye, EyeOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const TelegramBotSettings = () => {
  const { toast } = useToast();
  const [webhookConfig, setWebhookConfig] = useState<TelegramWebhookConfig>({
    url: '',
    isActive: false
  });
  const [botToken, setBotToken] = useState('');
  const [isBotTokenVisible, setIsBotTokenVisible] = useState(false);
  const [isSavingToken, setIsSavingToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error' | 'testing'>('idle');
  const [botInfo, setBotInfo] = useState<any>(null);
  const [isBotActive, setIsBotActive] = useState(false);

  useEffect(() => {
    // Fetch current config from database
    fetchConfig();
  }, []);

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
        
        // If we have a bot token, check if it's still valid
        if (data.bot_token) {
          validateBotToken(data.bot_token);
          setIsBotActive(true);
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

  const handleWebhookUpdate = (config: TelegramWebhookConfig) => {
    setWebhookConfig(config);
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
        setIsSavingToken(false);
        return;
      }
      
      setBotInfo(response.data.bot);
      setIsSavingToken(false);
      setIsBotActive(true);
      
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

  const testBotConnection = async () => {
    setIsTesting(true);
    setTestStatus('testing');
    
    try {
      const { data, error } = await supabase
        .from('bot_config')
        .select('bot_token')
        .eq('id', 1)
        .single();
        
      if (error || !data.bot_token) {
        throw new Error('Bot token not found');
      }
      
      const response = await fetch(`https://api.telegram.org/bot${data.bot_token}/getMe`);
      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.description || 'Failed to connect to Telegram');
      }
      
      setTestStatus('success');
      setBotInfo(result.result);
      
      toast({
        title: "Connection successful",
        description: `Connected to @${result.result.username}`,
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestStatus('error');
      
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const toggleTokenVisibility = () => {
    setIsBotTokenVisible(!isBotTokenVisible);
  };

  const toggleBotStatus = async () => {
    try {
      const newStatus = !isBotActive;
      
      // In a real application, this would make an API call to enable/disable the bot
      // For now, we'll just update the state
      setIsBotActive(newStatus);
      
      toast({
        title: newStatus ? "Bot activated" : "Bot deactivated",
        description: newStatus 
          ? "The bot is now active and processing messages"
          : "The bot is now inactive and not processing messages",
      });
    } catch (error) {
      console.error('Error toggling bot status:', error);
      
      toast({
        title: "Error",
        description: "Failed to update bot status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      <Navbar />
      
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Header 
          title="Telegram Bot Settings" 
          description="Configure and manage your CollectionBoxBot Telegram bot"
        />
        
        <Separator className="my-6" />
        
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
                  <CheckCircle2 className="h-4 w-4" />
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
                      type={isBotTokenVisible ? "text" : "password"}
                    />
                    <Button 
                      variant="outline" 
                      onClick={toggleTokenVisibility}
                    >
                      {isBotTokenVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can get a token by talking to @BotFather on Telegram.
                  </p>
                </div>
              )}
              
              {botInfo && (
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="bot-status" className="flex flex-col space-y-1">
                    <span>Bot Status</span>
                    <span className="font-normal text-muted-foreground text-sm">
                      {isBotActive ? 'Active' : 'Inactive'}
                    </span>
                  </Label>
                  <Switch 
                    id="bot-status" 
                    checked={isBotActive}
                    onCheckedChange={toggleBotStatus}
                  />
                </div>
              )}
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
              {!botInfo ? (
                <Button 
                  onClick={saveBotToken}
                  disabled={!botToken || isSavingToken}
                  className="w-full sm:w-auto"
                >
                  {isSavingToken ? "Saving..." : "Save Token"}
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  onClick={testBotConnection} 
                  disabled={isTesting}
                  className="w-full sm:w-auto gap-2"
                >
                  {testStatus === 'testing' ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : testStatus === 'success' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Test Connection</span>
                    </>
                  ) : testStatus === 'error' ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span>Test Connection</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span>Test Connection</span>
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <WebhookSetup
            initialConfig={webhookConfig}
            onUpdate={handleWebhookUpdate}
          />
        </div>
      </main>
    </div>
  );
};

export default TelegramBotSettings;
