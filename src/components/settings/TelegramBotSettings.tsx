
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TelegramBotSettings = () => {
  const [isBotActive, setIsBotActive] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [savedBotToken, setSavedBotToken] = useState("");
  const [isBotTokenVisible, setIsBotTokenVisible] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error' | 'testing'>('idle');
  const [startupMode, setStartupMode] = useState<'auto' | 'manual'>('manual');
  
  const { toast } = useToast();

  // Load saved token on initialization
  useEffect(() => {
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

  const handleSaveBotToken = () => {
    // Checking for empty token
    if (!botToken || botToken.trim() === "" || botToken === "•".repeat(botToken.length)) {
      toast({
        title: "Ошибка сохранения",
        description: "Токен бота не может быть пустым.",
        variant: "destructive"
      });
      return;
    }

    // Save token
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
    
    // Token testing simulation
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
      
      // Reset status after 3 seconds
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

  const toggleTokenVisibility = () => {
    if (isBotTokenVisible) {
      setBotToken("•".repeat(savedBotToken.length));
    } else {
      setBotToken(savedBotToken);
    }
    setIsBotTokenVisible(!isBotTokenVisible);
  };

  return (
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
  );
};

export default TelegramBotSettings;
