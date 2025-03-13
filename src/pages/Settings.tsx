
import React, { useState } from 'react';
import { Layout } from "@/components/Layout";
import Header from "@/components/Header";
import WebhookSetup from "@/components/WebhookSetup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TelegramWebhookConfig } from '@/utils/types';
import { useToast } from "@/hooks/use-toast";

// Import the new component files
import TelegramBotSettings from '@/components/settings/TelegramBotSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import GeneralSettings from '@/components/settings/GeneralSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState("telegram");
  const [webhookConfig, setWebhookConfig] = useState<TelegramWebhookConfig>({
    url: "https://example.com/api/webhook",
    isActive: true,
    lastChecked: new Date().toISOString(),
  });
  
  const { toast } = useToast();

  const handleWebhookUpdate = (newConfig: TelegramWebhookConfig) => {
    setWebhookConfig(newConfig);
    toast({
      title: "Webhook обновлен",
      description: "Конфигурация вебхука успешно обновлена.",
    });
  };

  return (
    <Layout>
      <Header 
        title="Настройки" 
        description="Настройте параметры системы CollectionBoxBot"
      />
      
      <div className="space-y-6">
        <Tabs defaultValue="telegram" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="telegram">Telegram Бот</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="notifications">Уведомления</TabsTrigger>
            <TabsTrigger value="general">Общие</TabsTrigger>
          </TabsList>
          
          <TabsContent value="telegram" className="space-y-4">
            <TelegramBotSettings />
          </TabsContent>
          
          <TabsContent value="webhook" className="space-y-4">
            <WebhookSetup webhookConfig={webhookConfig} onUpdate={handleWebhookUpdate} />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <NotificationSettings />
          </TabsContent>
          
          <TabsContent value="general" className="space-y-4">
            <GeneralSettings />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
