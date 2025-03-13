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
  Ban, 
  CalendarDays, 
  ChevronRight, 
  Hand, 
  Landmark, 
  ListFilter, 
  PiggyBank, 
  ShieldAlert, 
  Unlock, 
  UserCog
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Fundraiser, FundraiserStatus, Transaction, TransactionStatus, PaymentMethod, User } from "@/utils/types";
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

// Mock function for fetching user transactions
const fetchUserTransactions = async (userId: string): Promise<Transaction[]> => {
  // Simulated API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: "tr-56",
      fundraiserId: "fund-15",
      fundraiserTitle: "Помощь приюту для животных",
      donorId: userId,
      donorUsername: "ivan_petrov",
      amount: 1000,
      currency: "RUB",
      status: TransactionStatus.CONFIRMED,
      paymentMethod: PaymentMethod.TELEGRAM_STARS,
      createdAt: "2023-10-28T18:12:30Z",
      confirmedAt: "2023-10-28T18:20:15Z"
    },
    {
      id: "tr-42",
      fundraiserId: "fund-9",
      fundraiserTitle: "Помощь погорельцам",
      donorId: userId,
      donorUsername: "ivan_petrov",
      amount: 2500,
      currency: "RUB",
      status: TransactionStatus.CONFIRMED,
      paymentMethod: PaymentMethod.TELEGRAM_STARS,
      createdAt: "2023-10-15T12:45:33Z",
      confirmedAt: "2023-10-15T13:05:22Z"
    },
    {
      id: "tr-38",
      fundraiserId: "fund-7",
      fundraiserTitle: "Сбор на лечение",
      donorId: userId,
      donorUsername: "ivan_petrov",
      amount: 1500,
      currency: "RUB",
      status: TransactionStatus.CONFIRMED,
      paymentMethod: PaymentMethod.TELEGRAM_STARS,
      createdAt: "2023-10-10T09:33:45Z",
      confirmedAt: "2023-10-10T10:02:18Z"
    },
  ];
};

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserDetails(id || ''),
    enabled: !!id,
  });
  
  const { data: fundraisers, isLoading: isLoadingFundraisers } = useQuery({
    queryKey: ['user-fundraisers', id],
    queryFn: () => fetchUserFundraisers(id || ''),
    enabled: !!id,
  });
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['user-transactions', id],
    queryFn: () => fetchUserTransactions(id || ''),
    enabled: !!id,
  });

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

  const getFundraiserStatusBadge = (status: FundraiserStatus) => {
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
          <p className="text-muted-foreground">Загрузка информации о пользователе...</p>
        </div>
      </div>
    );
  }

  if (!user) {
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
          <p className="text-muted-foreground">Пользователь не найден</p>
        </div>
      </div>
    );
  }

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
        <span className="text-muted-foreground">Детали пользователя</span>
      </div>
      
      <Header 
        title={`${user.firstName} ${user.lastName || ''}`}
        description={`@${user.username} • ID: ${user.id}`}
        actions={
          <div className="flex gap-2">
            {user.isBanned ? (
              <Button variant="outline" className="gap-2">
                <Unlock className="h-4 w-4" />
                Разблокировать
              </Button>
            ) : (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Ban className="h-4 w-4" />
                    Заблокировать
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Заблокировать пользователя?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Блокировка пользователя запретит ему создавать новые сборы и делать пожертвования. 
                      Все его активные сборы будут скрыты. Эта операция будет записана в журнал действий.
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
            )}
            
            <Button variant="outline" className="gap-2">
              <UserCog className="h-4 w-4" />
              Изменить роль
            </Button>
          </div>
        }
      />
      
      <div className="grid gap-6 md:grid-cols-7 mt-6">
        <div className="col-span-7 md:col-span-5 space-y-6">
          <Tabs defaultValue="fundraisers" className="w-full">
            <TabsList>
              <TabsTrigger value="fundraisers">Сборы средств</TabsTrigger>
              <TabsTrigger value="donations">Пожертвования</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fundraisers">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Сборы пользователя</CardTitle>
                    <CardDescription>
                      Все сборы, созданные этим пользователем
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ListFilter className="h-4 w-4" />
                    Фильтр
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingFundraisers ? (
                    <div className="h-32 flex items-center justify-center">
                      <p className="text-muted-foreground">Загрузка сборов...</p>
                    </div>
                  ) : fundraisers && fundraisers.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Цель</TableHead>
                            <TableHead>Собрано</TableHead>
                            <TableHead>Дата создания</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fundraisers.map((fundraiser) => (
                            <TableRow key={fundraiser.id}>
                              <TableCell className="font-medium">{fundraiser.title}</TableCell>
                              <TableCell>{fundraiser.goal.toLocaleString()} ₽</TableCell>
                              <TableCell>{fundraiser.raised.toLocaleString()} ₽</TableCell>
                              <TableCell>{formatDate(fundraiser.createdAt)}</TableCell>
                              <TableCell>{getFundraiserStatusBadge(fundraiser.status)}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => navigate(`/fundraisers/${fundraiser.id}`)}
                                >
                                  Открыть
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center">
                      <p className="text-muted-foreground">Пользователь не создавал сборов</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="donations">
              <Card>
                <CardHeader>
                  <CardTitle>Пожертвования пользователя</CardTitle>
                  <CardDescription>
                    Транзакции, выполненные этим пользователем
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
                            <TableHead>Сбор</TableHead>
                            <TableHead>Сумма</TableHead>
                            <TableHead>Дата</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                              <TableCell className="font-medium">{transaction.fundraiserTitle}</TableCell>
                              <TableCell>{transaction.amount.toLocaleString()} {transaction.currency}</TableCell>
                              <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => navigate(`/fundraisers/${transaction.fundraiserId}`)}
                                >
                                  Перейти к сбору
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center">
                      <p className="text-muted-foreground">Пользователь не делал пожертвований</p>
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
              <CardTitle>Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Telegram ID</span>
                  <span className="font-medium">{user.telegramId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Статус</span>
                  {user.isBanned ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Ban className="h-3 w-3" /> Заблокирован
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Активен
                    </Badge>
                  )}
                </div>
                {user.isAdmin && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Роль</span>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      Администратор
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Дата регистрации</span>
                  <span className="text-sm">{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Последняя активность</span>
                  <span className="text-sm">{user.lastActive ? formatDate(user.lastActive) : 'Н/Д'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <PiggyBank className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Создано сборов</p>
                  <p className="text-2xl font-bold">{user.totalFundraisersCreated || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Hand className="h-5 w-5 text-muted-foreground mr-2" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Сумма пожертвований</p>
                  <p className="text-2xl font-bold">{(user.totalDonationsAmount || 0).toLocaleString()} ₽</p>
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
                <Landmark className="mr-2 h-4 w-4" />
                Транзакции
              </Button>
              
              <Button variant="outline" className="w-full justify-start">
                <CalendarDays className="mr-2 h-4 w-4" />
                История активности
              </Button>
              
              <Button variant="outline" className="w-full justify-start text-amber-600 hover:text-amber-700">
                <ShieldAlert className="mr-2 h-4 w-4" />
                Отметить как подозрительный
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
