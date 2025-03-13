
import React from 'react';
import { Layout } from "@/components/Layout";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, Gift, Calendar, HelpCircle, Settings, Info } from 'lucide-react';

const TelegramBotCommands = () => {
  const commands = [
    {
      command: "/start",
      description: "Начать работу с ботом, получить приветственное сообщение",
      context: "любой",
      icon: <MessageSquare className="h-4 w-4" />,
      example: "/start",
      response: "Добро пожаловать в CollectionBoxBot! Я помогу вам организовать сборы средств на подарки и другие цели."
    },
    {
      command: "/help",
      description: "Показать справку по командам бота",
      context: "любой",
      icon: <HelpCircle className="h-4 w-4" />,
      example: "/help",
      response: "Список доступных команд:\n/start - Начать работу с ботом\n/help - Показать эту справку\n..."
    },
    {
      command: "/newfundraiser",
      description: "Создать новый сбор средств",
      context: "личный чат, группа",
      icon: <Gift className="h-4 w-4" />,
      example: "/newfundraiser",
      response: "Давайте создадим новый сбор средств! Пожалуйста, введите название сбора:"
    },
    {
      command: "/myfundraisers",
      description: "Показать список ваших активных сборов",
      context: "личный чат",
      icon: <Users className="h-4 w-4" />,
      example: "/myfundraisers",
      response: "Ваши активные сборы:\n1. День рождения Алексея (5000₽)\n2. Корпоратив (10000₽)"
    },
    {
      command: "/manage",
      description: "Управление существующим сбором",
      context: "личный чат",
      icon: <Settings className="h-4 w-4" />,
      example: "/manage 1",
      response: "Управление сбором \"День рождения Алексея\":\nСобрано: 3000₽ из 5000₽\nУчастников: 5"
    },
    {
      command: "/status",
      description: "Проверить статус сбора",
      context: "личный чат, группа",
      icon: <Info className="h-4 w-4" />,
      example: "/status 123456",
      response: "Статус сбора \"День рождения Алексея\":\nСобрано: 3000₽ из 5000₽ (60%)\nУчастников: 5\nОсталось дней: 7"
    },
    {
      command: "/deadline",
      description: "Изменить срок окончания сбора",
      context: "личный чат",
      icon: <Calendar className="h-4 w-4" />,
      example: "/deadline 1 31.12.2023",
      response: "Срок окончания сбора \"День рождения Алексея\" изменен на 31.12.2023"
    }
  ];

  return (
    <Layout>
      <Header 
        title="Команды Telegram бота" 
        description="Справочник по командам и функциям бота CollectionBoxBot"
      />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Доступные команды</CardTitle>
            <CardDescription>
              Список всех команд, поддерживаемых ботом CollectionBoxBot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Команда</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead className="w-[120px]">Контекст</TableHead>
                  <TableHead className="w-[200px]">Пример использования</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commands.map((cmd, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">
                      <div className="flex items-center gap-2">
                        {cmd.icon}
                        {cmd.command}
                      </div>
                    </TableCell>
                    <TableCell>{cmd.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cmd.context}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {cmd.example}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Примеры взаимодействия</CardTitle>
            <CardDescription>
              Примеры диалогов с ботом для основных сценариев использования
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Создание нового сбора</h3>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p><strong>Пользователь:</strong> /newfundraiser</p>
                <p><strong>Бот:</strong> Давайте создадим новый сбор средств! Пожалуйста, введите название сбора:</p>
                <p><strong>Пользователь:</strong> День рождения Алексея</p>
                <p><strong>Бот:</strong> Отлично! Теперь укажите целевую сумму сбора (только число, например: 5000):</p>
                <p><strong>Пользователь:</strong> 5000</p>
                <p><strong>Бот:</strong> Сумма установлена! Теперь введите описание сбора:</p>
                <p><strong>Пользователь:</strong> Собираем на подарок Алексею к дню рождения 15 декабря</p>
                <p><strong>Бот:</strong> Описание добавлено! Теперь укажите крайний срок сбора в формате ДД.ММ.ГГГГ:</p>
                <p><strong>Пользователь:</strong> 10.12.2023</p>
                <p><strong>Бот:</strong> Проверьте данные создаваемого сбора: ...</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Участие в сборе</h3>
              <div className="bg-muted p-4 rounded-md space-y-2">
                <p><strong>Бот:</strong> Вас пригласили принять участие в сборе "День рождения Алексея". Сумма сбора: 5000₽. Хотите присоединиться?</p>
                <p><strong>Пользователь:</strong> (нажимает кнопку "Участвовать")</p>
                <p><strong>Бот:</strong> Вы присоединились к сбору! Выберите сумму вашего взноса или введите свою:</p>
                <p><strong>Пользователь:</strong> 500</p>
                <p><strong>Бот:</strong> Вы выбрали сумму 500₽. Как вы хотите оплатить?</p>
                <p><strong>Пользователь:</strong> (нажимает кнопку "Я уже оплатил")</p>
                <p><strong>Бот:</strong> Спасибо! Ваш платеж ожидает подтверждения организатором сбора.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TelegramBotCommands;
