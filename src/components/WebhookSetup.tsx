
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, RefreshCw, Globe } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { TelegramWebhookConfig } from '@/utils/types';

interface WebhookSetupProps {
  webhookConfig: TelegramWebhookConfig;
  onUpdate: (config: TelegramWebhookConfig) => void;
}

const WebhookSetup = ({ webhookConfig, onUpdate }: WebhookSetupProps) => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState(webhookConfig.url);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newConfig: TelegramWebhookConfig = {
        url: webhookUrl,
        isActive: true,
        lastChecked: new Date().toISOString(),
      };
      
      onUpdate(newConfig);
      
      toast({
        title: "Webhook URL updated",
        description: "The Telegram bot webhook URL has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error updating webhook",
        description: "Failed to update the webhook URL. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const testWebhook = async () => {
    setIsTestingWebhook(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Randomly succeed or fail for demonstration
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        toast({
          title: "Webhook test successful",
          description: "The webhook URL is valid and accessible.",
        });
        
        onUpdate({
          ...webhookConfig,
          isActive: true,
          lastChecked: new Date().toISOString(),
          error: undefined,
        });
      } else {
        throw new Error("Webhook URL is not accessible");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Webhook test failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      onUpdate({
        ...webhookConfig,
        isActive: false,
        lastChecked: new Date().toISOString(),
        error: errorMessage,
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };
  
  return (
    <Card className="animate-fade-in">
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
            This URL must be publicly accessible and use HTTPS.
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
          disabled={!webhookUrl || isTestingWebhook}
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
          onClick={handleSave}
          disabled={!webhookUrl || webhookUrl === webhookConfig.url || isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebhookSetup;
