
import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import WebhookSetup from "@/components/WebhookSetup";
import { Separator } from "@/components/ui/separator";
import { TelegramWebhookConfig } from '@/utils/types';

const TelegramBotSettings = () => {
  const [webhookConfig, setWebhookConfig] = useState<TelegramWebhookConfig>({
    url: '',
    isActive: false
  });

  const handleWebhookUpdate = (config: TelegramWebhookConfig) => {
    setWebhookConfig(config);
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
        
        <WebhookSetup
          initialConfig={webhookConfig}
          onUpdate={handleWebhookUpdate}
        />
      </main>
    </div>
  );
};

export default TelegramBotSettings;
