import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from "@/components/Layout";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Fundraiser, Transaction, TransactionStatus, PaymentMethod, FundraiserStatus } from '@/utils/types';
import { useToast } from "@/hooks/use-toast";

// Mock fetch functions
const fetchUserDetails = async (userId: string): Promise<User> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id: userId,
    username: "john_doe",
    firstName: "John",
    lastName: "Doe",
    telegramId: 123456789,
    isAdmin: false,
    isBanned: false,
    createdAt: "2023-09-01T10:00:00Z",
    lastActive: "2023-11-15T14:30:00Z",
    totalFundraisersCreated: 5,
    totalDonationsAmount: 750
  };
};

const fetchUserFundraisers = async (userId: string): Promise<Fundraiser[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 700));
  
  return [
    {
      id: "1",
      title: "Birthday Gift for Alice",
      description: "Collecting funds for a surprise birthday gift for Alice.",
      goal: 300,
      raised: 250,
      creatorId: userId,
      creatorUsername: "john_doe",
      status: FundraiserStatus.ACTIVE,
      createdAt: "2023-10-01T10:00:00Z",
      updatedAt: "2023-10-10T15:30:00Z",
      donationsCount: 5
    },
    {
      id: "2",
      title: "Team Lunch Party",
      description: "Let's collect funds for our monthly team lunch.",
      goal: 500,
      raised: 500,
      creatorId: userId,
      creatorUsername: "john_doe",
      status: FundraiserStatus.COMPLETED,
      createdAt: "2023-09-01T10:00:00Z",
      updatedAt: "2023-09-15T12:00:00Z",
      completedAt: "2023-09-15T12:00:00Z",
      donationsCount: 10
    }
  ];
};

const fetchUserTransactions = async (userId: string): Promise<Transaction[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return [
    {
      id: "1",
      fundraiserId: "3",
      fundraiserTitle: "Office Christmas Party",
      donorId: userId,
      donorUsername: "john_doe",
      amount: 50,
      currency: "USD",
      status: TransactionStatus.CONFIRMED,
      paymentMethod: PaymentMethod.TELEGRAM_STARS,
      createdAt: "2023-11-01T09:45:00Z",
      confirmedAt: "2023-11-01T10:00:00Z"
    },
    {
      id: "2",
      fundraiserId: "4",
      fundraiserTitle: "Welcome Gift for New Manager",
      donorId: userId,
      donorUsername: "john_doe",
      amount: 25,
      currency: "USD",
      status: TransactionStatus.CONFIRMED,
      paymentMethod: PaymentMethod.TELEGRAM_STARS,
      createdAt: "2023-10-15T14:20:00Z",
      confirmedAt: "2023-10-15T14:30:00Z"
    },
    {
      id: "3",
      fundraiserId: "1",
      fundraiserTitle: "Birthday Gift for Alice",
      donorId: userId,
      donorUsername: "john_doe",
      amount: 30,
      currency: "USD",
      status: TransactionStatus.CONFIRMED,
      paymentMethod: PaymentMethod.TELEGRAM_STARS,
      createdAt: "2023-10-05T11:30:00Z",
      confirmedAt: "2023-10-05T11:40:00Z"
    }
  ];
};

interface UserDetailsProps {}

const UserDetails: React.FC<UserDetailsProps> = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    if (id) {
      fetchUserDetails(id)
        .then(userData => setUser(userData))
        .catch(error => {
          console.error("Failed to fetch user details:", error);
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить данные пользователя.",
            variant: "destructive",
          });
        });
        
      fetchUserFundraisers(id)
        .then(fundraiserData => setFundraisers(fundraiserData))
        .catch(error => console.error("Failed to fetch user fundraisers:", error));
        
      fetchUserTransactions(id)
        .then(transactionData => setTransactions(transactionData))
        .catch(error => console.error("Failed to fetch user transactions:", error));
    }
  }, [id, toast]);
  
  if (!id) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Ошибка</h2>
          <p className="text-muted-foreground">Не указан ID пользователя.</p>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Загрузка...</h2>
          <p className="text-muted-foreground">Пожалуйста, подождите, данные загружаются.</p>
        </div>
      </Layout>
    );
  }
  
  const handleBanUser = () => {
    setOpen(false);
    
    // Simulate API call
    setTimeout(() => {
      setUser(prevUser => prevUser ? { ...prevUser, isBanned: true } : null);
      
      toast({
        title: "Пользователь заблокирован",
        description: "Пользователь успешно заблокирован в системе.",
      });
    }, 500);
  };
  
  const handleUnbanUser = () => {
    setOpen(false);
    
    // Simulate API call
    setTimeout(() => {
      setUser(prevUser => prevUser ? { ...prevUser, isBanned: false } : null);
      
      toast({
        title: "Пользователь разблокирован",
        description: "Пользователь успешно разблокирован в системе.",
      });
    }, 500);
  };

  return (
    <Layout>
      <Header 
        title="Детали пользователя" 
        description="Просмотр и управление информацией о пользователе"
      />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Информация о пользователе</CardTitle>
            <CardDescription>
              Основные данные пользователя и его статус в системе
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={`https://avatar.vercel.sh/${user.username}.png`} />
              <AvatarFallback>{user.firstName[0]}{user.lastName ? user.lastName[0] : ''}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-lg font-semibold">{user.firstName} {user.lastName}</h4>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <div className="flex items-center space-x-2 mt-2">
                {user.isAdmin && <Badge>Администратор</Badge>}
                {user.isBanned && <Badge variant="destructive">Заблокирован</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Separator />
        
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Профиль</TabsTrigger>
            <TabsTrigger value="fundraisers">Сборы</TabsTrigger>
            <TabsTrigger value="transactions">Транзакции</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Детали профиля</CardTitle>
                <CardDescription>
                  Подробная информация о пользователе
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">ID:</p>
                    <p className="text-muted-foreground">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Telegram ID:</p>
                    <p className="text-muted-foreground">{user.telegramId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Дата регистрации:</p>
                    <p className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Последняя активность:</p>
                    <p className="text-muted-foreground">{user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Неизвестно'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Создано сборов:</p>
                    <p className="text-muted-foreground">{user.totalFundraisersCreated}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Сумма донатов:</p>
                    <p className="text-muted-foreground">{user.totalDonationsAmount} USD</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    {user.isBanned ? 'Разблокировать пользователя' : 'Заблокировать пользователя'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Подтверждение действия</AlertDialogTitle>
                    <AlertDialogDescription>
                      Вы уверены, что хотите {user.isBanned ? 'разблокировать' : 'заблокировать'} этого пользователя?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={user.isBanned ? handleUnbanUser : handleBanUser}>
                      {user.isBanned ? 'Разблокировать' : 'Заблокировать'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>
          
          <TabsContent value="fundraisers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Сборы пользователя</CardTitle>
                <CardDescription>
                  Список всех сборов, созданных пользователем
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fundraisers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fundraisers.map(fundraiser => (
                      <Card key={fundraiser.id}>
                        <CardHeader>
                          <CardTitle>{fundraiser.title}</CardTitle>
                          <CardDescription>
                            {fundraiser.description.substring(0, 50)}...
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm font-medium">Собрано:</p>
                          <p className="text-muted-foreground">{fundraiser.raised} / {fundraiser.goal} USD</p>
                          <p className="text-sm font-medium">Статус:</p>
                          <p className="text-muted-foreground">{fundraiser.status}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">У пользователя нет созданных сборов.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Транзакции пользователя</CardTitle>
                <CardDescription>
                  Список всех транзакций, связанных с пользователем
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {transactions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {transactions.map(transaction => (
                      <Card key={transaction.id}>
                        <CardHeader>
                          <CardTitle>{transaction.fundraiserTitle}</CardTitle>
                          <CardDescription>
                            Сумма: {transaction.amount} {transaction.currency}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm font-medium">Статус:</p>
                          <p className="text-muted-foreground">{transaction.status}</p>
                          <p className="text-sm font-medium">Метод оплаты:</p>
                          <p className="text-muted-foreground">{transaction.paymentMethod}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">У пользователя нет транзакций.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserDetails;
