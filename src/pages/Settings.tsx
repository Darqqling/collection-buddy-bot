
import React, { useState } from 'react';
import { Layout } from "@/components/Layout";
import Header from "@/components/Header";
import WebhookSetup from "@/components/WebhookSetup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { TelegramWebhookConfig } from '@/utils/types';

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [webhookConfig, setWebhookConfig] = useState<TelegramWebhookConfig>({
    url: "https://example.com/api/webhook",
    isActive: true,
    lastChecked: new Date().toISOString(),
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [adminEmail, setAdminEmail] = useState("admin@collectionboxbot.com");
  const [botToken, setBotToken] = useState("••••••••••••••••••••••••••••••");

  const handleSaveGeneral = () => {
    toast({
      title: "Settings saved",
      description: "General settings have been updated successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings saved",
      description: `Notifications are now ${notificationsEnabled ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleSaveAPI = () => {
    toast({
      title: "API settings saved",
      description: "Your API settings have been updated successfully.",
    });
  };

  return (
    <Layout>
      <Header 
        title="Settings" 
        description="Configure your CollectionBoxBot system settings"
      />
      
      <div className="space-y-6">
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="webhook">Webhook</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="api">API Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage your basic CollectionBoxBot settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input 
                    id="admin-email" 
                    value={adminEmail} 
                    onChange={(e) => setAdminEmail(e.target.value)} 
                  />
                </div>
                <Button onClick={handleSaveGeneral}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="webhook" className="space-y-4">
            <WebhookSetup />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive notifications about system events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="notifications" className="flex flex-col space-y-1">
                    <span>Email Notifications</span>
                    <span className="font-normal text-muted-foreground text-sm">
                      Receive email notifications for important events
                    </span>
                  </Label>
                  <Switch 
                    id="notifications" 
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                <Button onClick={handleSaveNotifications}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>
                  Manage your Telegram bot token and API configurations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bot-token">Telegram Bot Token</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="bot-token" 
                      type="password"
                      value={botToken} 
                      onChange={(e) => setBotToken(e.target.value)} 
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => setBotToken(prev => prev.startsWith("•") ? "1234567890:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghi" : "••••••••••••••••••••••••••••••")}
                    >
                      {botToken.startsWith("•") ? "Show" : "Hide"}
                    </Button>
                  </div>
                </div>
                <Button onClick={handleSaveAPI}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
