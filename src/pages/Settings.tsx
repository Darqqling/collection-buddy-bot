
import React, { useState, useEffect } from 'react';
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
import { 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Save,
  RefreshCw
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("telegram");
  const [webhookConfig, setWebhookConfig] = useState<TelegramWebhookConfig>({
    url: "https://example.com/api/webhook",
    isActive: true,
    lastChecked: new Date().toISOString(),
  });

  const [isBotActive, setIsBotActive] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [adminEmail, setAdminEmail] = useState("admin@collectionboxbot.com");
  const [botToken, setBotToken] = useState("");
  const [savedBotToken, setSavedBotToken] = useState("");
  const [isBotTokenVisible, setIsBotTokenVisible] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error' | 'testing'>('idle');
  const [startupMode, setStartupMode] = useState<'auto' | 'manual'>('manual');
  
  const { toast } = useToast();

  // Имитация загрузки сохраненного токена при инициализации
  useEffect(() => {
    // В реальном приложении здесь будет запрос к API для получения токена
    const savedToken = localStorage.getItem('telegramBotToken');
    if (savedToken) {
      setSavedBotToken(savedToken);
      setBotToken("•".repeat(savedToken.length));
    }
    
    const botActiveStatus = localStorage.getItem('telegramBotActive') === 'true';
    setIsBotActive(botActiveStatus);
    
    const startMode = localStorage.getItem('telegramBotStartMode') || 'manual';
    setStartupMode(startMode as 'auto' | 'manual');
  }, []);

  const handleSaveGeneral = () => {
    localStorage.setItem('adminEmail', adminEmail);
    toast({
      title: "Настройки сохранены",
      description: "Общие настройки были успешно обновлены.",
    });
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
    toast({
      title: "Настройки уведомлений сохранены",
      description: `Уведомления теперь ${notificationsEnabled ? 'включены' : 'отключены'}.`,
    });
  };

  const handleSaveBotToken = () => {
    // Проверка на пустой токен
    if (!botToken || botToken.trim() === "" || botToken === "•".repeat(botToken.length)) {
      toast({
        title: "Ошибка сохранения",
        description: "Токен бота не может быть пустым.",
        variant: "destructive"
      });
      return;
    }

    // Сохраняем токен
    localStorage.setItem('telegramBotToken', botToken);
    setSavedBotToken(botToken);
    setBotToken("•".repeat(botToken.length));
    setIsBotTokenVisible(false);
    
    toast({
      title: "Токен бота сохранен",
      description: "Токен Telegram бота успешно сохранен.",
    });
  };

  const handleTestBotToken = () => {
    setIsTesting(true);
    setTestStatus('testing');
    
    // Имитация тестирования токена
    setTimeout(() => {
      setIsTesting(false);
      
      if (savedBotToken && savedBotToken.length > 10) {
        setTestStatus('success');
        toast({
          title: "Тест успешен",
          description: "Соединение с Telegram API установлено успешно.",
        });
      } else {
        setTestStatus('error');
        toast({
          title: "Ошибка соединения",
          description: "Не удалось подключиться к Telegram API с указанным токеном.",
          variant: "destructive"
        });
      }
      
      // Сбрасываем статус через 3 секунды
      setTimeout(() => setTestStatus('idle'), 3000);
    }, 1500);
  };

  const toggleBotStatus = () => {
    const newStatus = !isBotActive;
    setIsBotActive(newStatus);
    localStorage.setItem('telegramBotActive', newStatus.toString());
    
    toast({
      title: newStatus ? "Бот активирован" : "Бот деактивирован",
      description: newStatus 
        ? "Telegram бот теперь активен и обрабатывает сообщения."
        : "Telegram бот остановлен и не обрабатывает сообщения.",
    });
  };

  const handleChangeStartupMode = (value: string) => {
    const mode = value as 'auto' | 'manual';
    setStartupMode(mode);
    localStorage.setItem('telegramBotStartMode', mode);
    
    toast({
      title: "Режим запуска обновлен",
      description: mode === 'auto'
        ? "Бот будет автоматически запускаться при старте приложения."
        : "Бот будет запускаться только вручную.",
    });
  };

  const handleWebhookUpdate = (newConfig: TelegramWebhookConfig) => {
    setWebhookConfig(newConfig);
    toast({
      title: "Webhook обновлен",
      description: "Конфигурация вебхука успешно обновлена.",
    });
  };

  const toggleTokenVisibility = () => {
    if (isBotTokenVisible) {
      setBotToken("•".repeat(savedBotToken.length));
    } else {
      setBotToken(savedBotToken);
    }
    setIsBotTokenVisible(!isBotTokenVisible);
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
            <Card>
              <CardHeader>
                <CardTitle>Настройки Telegram Бота</CardTitle>
                <CardDescription>
                  Управление параметрами подключения к Telegram API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="bot-status" className="flex flex-col space-y-1">
                    <span>Статус бота</span>
                    <span className="font-normal text-muted-foreground text-sm">
                      {isBotActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </Label>
                  <Switch 
                    id="bot-status" 
                    checked={isBotActive}
                    onCheckedChange={toggleBotStatus}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bot-token">Токен Telegram Бота</Label>
                  <div className="flex space-x-2">
                    <Input 
                      id="bot-token" 
                      type={isBotTokenVisible ? "text" : "password"}
                      value={botToken} 
                      onChange={(e) => setBotToken(e.target.value)} 
                      className="flex-1"
                      placeholder="Введите токен бота от BotFather"
                    />
                    <Button 
                      variant="outline" 
                      onClick={toggleTokenVisibility}
                    >
                      {isBotTokenVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Получите токен у <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">@BotFather</a> в Telegram
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startup-mode">Режим запуска</Label>
                  <Select value={startupMode} onValueChange={handleChangeStartupMode}>
                    <SelectTrigger id="startup-mode">
                      <SelectValue placeholder="Выберите режим запуска" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Автоматический запуск</SelectItem>
                      <SelectItem value="manual">Ручной запуск</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Определяет, будет ли бот автоматически запускаться при старте приложения
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button onClick={handleSaveBotToken} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Сохранить токен
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleTestBotToken} 
                    disabled={isTesting || !savedBotToken}
                    className="flex items-center gap-2"
                  >
                    {testStatus === 'testing' ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : testStatus === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : testStatus === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Тестировать соединение
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="webhook" className="space-y-4">
            <WebhookSetup webhookConfig={webhookConfig} onUpdate={handleWebhookUpdate} />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Настройки уведомлений</CardTitle>
                <CardDescription>
                  Настройте параметры уведомлений о системных событиях
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="notifications" className="flex flex-col space-y-1">
                    <span>Email уведомления</span>
                    <span className="font-normal text-muted-foreground text-sm">
                      Получать уведомления о важных событиях по email
                    </span>
                  </Label>
                  <Switch 
                    id="notifications" 
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                <Button onClick={handleSaveNotifications}>Сохранить настройки</Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Общие настройки</CardTitle>
                <CardDescription>
                  Управление основными настройками CollectionBoxBot
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Email администратора</Label>
                  <Input 
                    id="admin-email" 
                    value={adminEmail} 
                    onChange={(e) => setAdminEmail(e.target.value)} 
                  />
                </div>
                <Button onClick={handleSaveGeneral}>Сохранить настройки</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
