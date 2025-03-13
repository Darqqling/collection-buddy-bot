
import React from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Calendar, DollarSign, PlayCircle, Star, TrendingUp, UserPlus, Users } from "lucide-react";
import { SystemStats } from "@/utils/types";

// Mock function for getting system stats - would be replaced with actual API call
const fetchSystemStats = async (): Promise<SystemStats> => {
  // Simulated API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    activeFundraisers: 12,
    completedFundraisers: 28,
    blockedFundraisers: 3,
    totalUsers: 152,
    totalRaised: 127850,
    recentTransactions: 18
  };
};

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['systemStats'],
    queryFn: fetchSystemStats,
  });

  return (
    <div className="container mx-auto py-6">
      <Header 
        title="Dashboard" 
        description="Основные показатели работы CollectionBoxBot и статистика по сборам средств."
      />
      
      <Tabs defaultValue="overview" className="w-full mt-6">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="activity">Активность</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard 
              title="Активные сборы" 
              value={isLoading ? "—" : stats?.activeFundraisers.toString() || "0"}
              description="Текущие активные кампании"
              icon={<PlayCircle className="h-5 w-5 text-blue-500" />}
            />
            
            <DashboardCard 
              title="Завершенные сборы" 
              value={isLoading ? "—" : stats?.completedFundraisers.toString() || "0"}
              description="Успешно завершенные кампании"
              icon={<Calendar className="h-5 w-5 text-green-500" />}
            />
            
            <DashboardCard 
              title="Всего пользователей" 
              value={isLoading ? "—" : stats?.totalUsers.toString() || "0"}
              description="Зарегистрированные участники"
              icon={<Users className="h-5 w-5 text-indigo-500" />}
            />
            
            <DashboardCard 
              title="Недавние транзакции" 
              value={isLoading ? "—" : stats?.recentTransactions.toString() || "0"}
              description="За последние 24 часа"
              icon={<Star className="h-5 w-5 text-amber-500" />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Динамика сборов</CardTitle>
                <CardDescription>Общая сумма собранных средств за последние 30 дней</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                  <BarChart className="h-8 w-8 mr-2" />
                  <span>Данные о динамике сборов будут загружены здесь</span>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Общая статистика</CardTitle>
                <CardDescription>Общие показатели платформы</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-medium">Всего собрано</span>
                    </div>
                    <span className="font-semibold">
                      {isLoading ? "—" : `${(stats?.totalRaised || 0).toLocaleString()} ₽`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-medium">Средняя сумма сбора</span>
                    </div>
                    <span className="font-semibold">
                      {isLoading ? "—" : stats ? `${Math.round(stats.totalRaised / (stats.completedFundraisers + stats.activeFundraisers)).toLocaleString()} ₽` : "0 ₽"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserPlus className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm font-medium">Новые пользователи</span>
                    </div>
                    <span className="font-semibold">+12 за 7 дней</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="h-[400px] flex items-center justify-center text-muted-foreground">
          Подробная информация об активности пользователей будет доступна здесь
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const DashboardCard = ({ title, value, description, icon }: DashboardCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default Dashboard;
