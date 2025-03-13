
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Calendar, 
  ChevronRight, 
  Edit, 
  ImageIcon, 
  LockIcon, 
  Star, 
  Trash, 
  UnlockIcon, 
  User
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Fundraiser, FundraiserStatus, Transaction } from "@/utils/types";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Mock function for fetching fundraiser data - would be replaced with actual API call
const fetchFundraiserDetails = async (id: string): Promise<Fundraiser> => {
  // Simulated API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    id,
    title: "Помощь приюту для бездомных животных",
    description: "Сбор средств для приюта 'Верный друг'. Средства пойдут на закупку корма, лекарств и оплаты услуг ветеринаров. Приют содержит более 50 животных, которые нуждаются в постоянном уходе и внимании. Благодаря вашей поддержке, мы сможем обеспечить животным комфортные условия проживания и необходимый уход.",
    goal: 50000,
    raised: 32500,
    creatorId: "user-7",
    creatorUsername: "anna_petrova",
    status: FundraiserStatus.ACTIVE,
    createdAt: "2023-10-15T10:25:00Z",
    updatedAt: "2023-11-01T14:30:00Z",
    imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1",
    donationsCount: 28
  };
};

// Mock function for fetching fundraiser transactions
const fetchFundraiserTransactions = async (id: string): Promise<Transaction[]> => {
  // Simulated API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: "tr-101",
      fundraiserId: id,
      donorId: "user-12",
      donorUsername: "alexey87",
      amount: 1000,
      currency: "RUB",
      status: "confirmed",
      paymentMethod: "telegram_stars",
      createdAt: "2023-11-01T14:32:21Z",
      confirmedAt: "2023-11-01T14:45:30Z"
    },
    {
      id: "tr-98",
      fundraiserId: id,
      donorId: "user-5",
      donorUsername: "marina_ivanova",
      amount: 500,
      currency: "RUB",
      status: "confirmed",
      paymentMethod: "telegram_stars",
      createdAt: "2023-11-01T13:18:44Z",
      confirmedAt: "2023-11-01T14:05:11Z"
    },
    {
      id: "tr-82",
      fundraiserId: id,
      donorId: "user-28",
      donorUsername: "vladimir_k",
      amount: 2000,
      currency: "RUB",
      status: "confirmed",
      paymentMethod: "telegram_stars",
      createdAt: "2023-10-28T09:42:33Z",
      confirmedAt: "2023-10-28T10:15:22Z"
    },
  ];
};

const FundraiserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: fundraiser, isLoading } = useQuery({
    queryKey: ['fundraiser', id],
    queryFn: () => fetchFundraiserDetails(id || ''),
    enabled: !!id,
  });
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['fundraiser-transactions', id],
    queryFn: () => fetchFundraiserTransactions(id || ''),
    enabled: !!id,
  });

  const getStatusBadge = (status: FundraiserStatus) => {
    switch (status) {
      case FundraiserStatus.ACTIVE:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Активный</Badge>;
      case FundraiserStatus.COMPLETED:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Завершен</Badge>;
      case FundraiserStatus.BLOCKED:
        return <Badge variant="destructive">Заблокирован</Badge>;
      default:
        return <Badge variant="secondary">Неизвестно</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
        <div className="h-[500px] flex items-center justify-center">
          <p className="text-muted-foreground">Загрузка информации о сборе...</p>
        </div>
      </div>
    );
  }

  if (!fundraiser) {
    return (
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
        <div className="h-[500px] flex items-center justify-center">
          <p className="text-muted-foreground">Сбор не найден</p>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min(Math.round((fundraiser.raised / fundraiser.goal) * 100), 100);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
        <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Детали сбора</span>
      </div>
      
      <Header 
        title={fundraiser.title}
        description={`ID: ${fundraiser.id}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Edit className="h-4 w-4" />
              Редактировать
            </Button>
            
            {fundraiser.status === FundraiserStatus.ACTIVE ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <LockIcon className="h-4 w-4" />
                    Заблокировать
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Заблокировать сбор?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Блокировка сбора приведет к его скрытию из общего списка и запрету 
                      на новые пожертвования. Эта операция будет записана в журнал действий.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground">
                      Заблокировать
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : fundraiser.status === FundraiserStatus.BLOCKED ? (
              <Button variant="outline" className="gap-2">
                <UnlockIcon className="h-4 w-4" />
                Разблокировать
              </Button>
            ) : null}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить сбор?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие невозможно отменить. Сбор будет полностью удален из системы.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground">
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />
      
      <div className="grid gap-6 md:grid-cols-7 mt-6">
        <div className="col-span-7 md:col-span-5 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Информация</TabsTrigger>
              <TabsTrigger value="donations">Пожертвования</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Основная информация</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Статус</p>
                      <p className="mt-1">{getStatusBadge(fundraiser.status)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Создатель</p>
                      <p className="mt-1 flex items-center gap-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <a href={`/users/${fundraiser.creatorId}`} className="text-primary hover:underline">
                          {fundraiser.creatorUsername}
                        </a>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Дата создания</p>
                      <p className="mt-1 flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(fundraiser.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Последнее обновление</p>
                      <p className="mt-1">{formatDate(fundraiser.updatedAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Описание</p>
                    <p className="mt-1 text-sm whitespace-pre-line">{fundraiser.description}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Изображение</CardTitle>
                  <CardDescription>Изображение для этого сбора</CardDescription>
                </CardHeader>
                <CardContent>
                  {fundraiser.imageUrl ? (
                    <div className="relative aspect-video rounded-md overflow-hidden">
                      <img 
                        src={fundraiser.imageUrl} 
                        alt={fundraiser.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted aspect-video rounded-md flex items-center justify-center">
                      <div className="flex flex-col items-center text-muted-foreground">
                        <ImageIcon className="h-10 w-10 mb-2" />
                        <p>Нет изображения</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="donations">
              <Card>
                <CardHeader>
                  <CardTitle>Список пожертвований</CardTitle>
                  <CardDescription>
                    Все транзакции для данного сбора
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingTransactions ? (
                    <div className="h-32 flex items-center justify-center">
                      <p className="text-muted-foreground">Загрузка пожертвований...</p>
                    </div>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Пользователь</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead>Метод</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                              <TableCell className="font-medium">{transaction.donorUsername}</TableCell>
                              <TableCell>{transaction.amount} {transaction.currency}</TableCell>
                              <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Star className="h-3.5 w-3.5 text-amber-500" />
                                  <span className="text-sm">Telegram Stars</span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center">
                      <p className="text-muted-foreground">Пожертвования отсутствуют</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="col-span-7 md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Прогресс сбора</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Собрано</span>
                  <span className="font-medium">{fundraiser.raised.toLocaleString()} ₽</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Цель</span>
                  <span className="font-medium">{fundraiser.goal.toLocaleString()} ₽</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Процент</span>
                  <span className="font-medium">{progressPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Пожертвований</span>
                  <span className="font-medium">{fundraiser.donationsCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <User className="mr-2 h-4 w-4" />
                Профиль создателя
              </Button>
              
              {fundraiser.status === FundraiserStatus.ACTIVE && (
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  Завершить сбор
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FundraiserDetails;
