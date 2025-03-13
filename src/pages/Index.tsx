
import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  FileText, 
  CreditCard, 
  BarChart4, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Ban,
  XCircle,
  ArrowUpRight,
  LineChart,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Fundraiser, Transaction, User, FundraiserStatus, TransactionStatus, PaymentMethod } from '@/utils/types';

const mockFundraisers: Fundraiser[] = [
  {
    id: '1',
    title: 'Emergency Relief Fund',
    description: 'Support those affected by recent natural disasters',
    goal: 10000,
    raised: 7500,
    creatorId: '1',
    creatorUsername: 'john_doe',
    status: FundraiserStatus.ACTIVE,
    createdAt: '2023-09-15T10:30:00Z',
    updatedAt: '2023-10-10T14:20:00Z',
  },
  {
    id: '2',
    title: 'Community Garden Project',
    description: 'Help us build a sustainable garden for the neighborhood',
    goal: 5000,
    raised: 5000,
    creatorId: '2',
    creatorUsername: 'gardenlover',
    status: FundraiserStatus.COMPLETED,
    createdAt: '2023-08-20T09:15:00Z',
    updatedAt: '2023-10-05T16:45:00Z',
  },
  {
    id: '3',
    title: 'Medical Treatment Support',
    description: 'Support for critical medical procedures',
    goal: 15000,
    raised: 3000,
    creatorId: '3',
    creatorUsername: 'healthmatters',
    status: FundraiserStatus.ACTIVE,
    createdAt: '2023-10-01T11:20:00Z',
    updatedAt: '2023-10-12T13:10:00Z',
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    fundraiserId: '1',
    donorId: '5',
    donorUsername: 'generous_user',
    amount: 500,
    currency: 'USD',
    status: TransactionStatus.PENDING,
    paymentMethod: PaymentMethod.TELEGRAM_STARS,
    createdAt: '2023-10-10T15:30:00Z',
  },
  {
    id: '2',
    fundraiserId: '1',
    donorId: '6',
    donorUsername: 'charity_lover',
    amount: 250,
    currency: 'USD',
    status: TransactionStatus.CONFIRMED,
    paymentMethod: PaymentMethod.TELEGRAM_STARS,
    createdAt: '2023-10-09T10:15:00Z',
    confirmedAt: '2023-10-09T10:45:00Z',
  },
  {
    id: '3',
    fundraiserId: '2',
    donorId: '7',
    donorUsername: 'eco_friend',
    amount: 1000,
    currency: 'USD',
    status: TransactionStatus.CONFIRMED,
    paymentMethod: PaymentMethod.TELEGRAM_STARS,
    createdAt: '2023-10-08T09:20:00Z',
    confirmedAt: '2023-10-08T09:50:00Z',
  },
  {
    id: '4',
    fundraiserId: '3',
    donorId: '8',
    donorUsername: 'health_supporter',
    amount: 750,
    currency: 'USD',
    status: TransactionStatus.REJECTED,
    paymentMethod: PaymentMethod.TELEGRAM_STARS,
    createdAt: '2023-10-07T14:45:00Z',
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    firstName: 'John',
    lastName: 'Doe',
    telegramId: 12345678,
    isAdmin: true,
    isBanned: false,
    createdAt: '2023-08-10T09:00:00Z',
    lastActive: '2023-10-12T15:30:00Z',
  },
  {
    id: '2',
    username: 'gardenlover',
    firstName: 'Jane',
    lastName: 'Smith',
    telegramId: 23456789,
    isAdmin: false,
    isBanned: false,
    createdAt: '2023-08-15T11:30:00Z',
    lastActive: '2023-10-11T10:15:00Z',
  },
  {
    id: '3',
    username: 'healthmatters',
    firstName: 'Michael',
    lastName: 'Johnson',
    telegramId: 34567890,
    isAdmin: false,
    isBanned: false,
    createdAt: '2023-09-01T14:45:00Z',
    lastActive: '2023-10-10T16:20:00Z',
  },
  {
    id: '4',
    username: 'spammer',
    firstName: 'Spam',
    lastName: 'Bot',
    telegramId: 45678901,
    isAdmin: false,
    isBanned: true,
    createdAt: '2023-09-05T08:30:00Z',
    lastActive: '2023-09-05T09:45:00Z',
  },
];

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
}

const StatCard = ({ title, value, description, icon, trend, trendValue }: StatCardProps) => (
  <Card className="overflow-hidden transition-all duration-300 hover:shadow-elevation-1">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="h-8 w-8 rounded-md bg-primary/10 p-1.5 text-primary">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {trend && trendValue && (
        <div className={cn(
          "flex items-center text-xs mt-2",
          trend === 'up' ? "text-green-600" : "text-red-600"
        )}>
          {trend === 'up' ? (
            <ArrowUpRight className="h-3 w-3 mr-1" />
          ) : (
            <ArrowUpRight className="h-3 w-3 mr-1 rotate-180" />
          )}
          <span>{trendValue} from last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

interface RecentActivityProps {
  title: string;
  time: string;
  description: string;
  icon: React.ReactNode;
  iconColor?: string;
}

const RecentActivity = ({ title, time, description, icon, iconColor = "bg-primary/10 text-primary" }: RecentActivityProps) => (
  <div className="flex items-start space-x-4 mb-4 animate-slide-up opacity-0" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
    <div className={cn("h-8 w-8 rounded-full p-1.5 flex items-center justify-center mt-0.5", iconColor)}>
      {icon}
    </div>
    <div className="space-y-1">
      <div className="flex items-center">
        <h4 className="font-medium">{title}</h4>
        <span className="text-xs text-muted-foreground ml-2">• {time}</span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate mock recent activities based on transactions and users
    const activities = [
      {
        title: "New Donation Received",
        time: "10 minutes ago",
        description: `${mockTransactions[0].donorUsername} donated $${mockTransactions[0].amount} to ${mockFundraisers[0].title}`,
        icon: <CreditCard className="h-4 w-4" />,
        iconColor: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      },
      {
        title: "Fundraiser Completed",
        time: "Yesterday",
        description: `${mockFundraisers[1].title} reached its goal of $${mockFundraisers[1].goal}`,
        icon: <CheckCircle2 className="h-4 w-4" />,
        iconColor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      },
      {
        title: "User Banned",
        time: "2 days ago",
        description: `${mockUsers[3].username} was banned for suspicious activity`,
        icon: <Ban className="h-4 w-4" />,
        iconColor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      },
      {
        title: "Payment Rejected",
        time: "3 days ago",
        description: `Payment of $${mockTransactions[3].amount} from ${mockTransactions[3].donorUsername} was rejected`,
        icon: <XCircle className="h-4 w-4" />,
        iconColor: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      },
      {
        title: "New User Registered",
        time: "5 days ago",
        description: `${mockUsers[2].username} joined the platform`,
        icon: <Users className="h-4 w-4" />,
        iconColor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      },
    ];
    
    setRecentActivities(activities);
  }, []);
  
  return (
    <div className="flex min-h-screen">
      <Navbar />
      
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Header 
          title="Dashboard" 
          description="Overview of your CollectionBoxBot activity"
        />
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
          <StatCard 
            title="Total Fundraisers" 
            value={mockFundraisers.length.toString()}
            description="Active and completed fundraisers"
            icon={<FileText className="h-4 w-4" />}
            trend="up"
            trendValue="20%"
          />
          <StatCard 
            title="Total Users" 
            value={mockUsers.length.toString()}
            description="Registered bot users"
            icon={<Users className="h-4 w-4" />}
            trend="up"
            trendValue="12%"
          />
          <StatCard 
            title="Total Raised" 
            value={`$${mockTransactions.reduce((acc, tx) => tx.status === 'confirmed' ? acc + tx.amount : acc, 0).toLocaleString()}`}
            description="Confirmed donations"
            icon={<BarChart4 className="h-4 w-4" />}
            trend="up"
            trendValue="35%"
          />
          <StatCard 
            title="Pending Approvals" 
            value={mockTransactions.filter(tx => tx.status === 'pending').length.toString()}
            description="Transactions awaiting confirmation"
            icon={<Clock className="h-4 w-4" />}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                <span>Fundraising Overview</span>
              </CardTitle>
              <CardDescription>
                Fundraising activity over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center bg-secondary/30 rounded-md">
                <div className="text-center px-4">
                  <Activity className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Chart visualization would display here with donation trends, fundraiser progress, and user activity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
              <CardDescription>
                Latest actions and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentActivities.map((activity, index) => (
                  <RecentActivity
                    key={index}
                    title={activity.title}
                    time={activity.time}
                    description={activity.description}
                    icon={activity.icon}
                    iconColor={activity.iconColor}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="pending" className="w-full animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="pending" className="gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Pending Approvals</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="gap-2">
                <Clock className="h-4 w-4" />
                <span>Recent Transactions</span>
              </TabsTrigger>
            </TabsList>
            
            <Button variant="outline" size="sm" asChild>
              <a href="/fundraisers">View All Transactions</a>
            </Button>
          </div>
          
          <TabsContent value="pending" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-left py-3 px-4 font-medium">Fundraiser</th>
                        <th className="text-left py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                        <th className="text-left py-3 px-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTransactions
                        .filter(tx => tx.status === 'pending')
                        .map((tx) => {
                          const fundraiser = mockFundraisers.find(f => f.id === tx.fundraiserId);
                          
                          return (
                            <tr key={tx.id} className="border-b hover:bg-muted/30">
                              <td className="py-3 px-4">@{tx.donorUsername}</td>
                              <td className="py-3 px-4 max-w-[200px] truncate">
                                {fundraiser?.title || 'Unknown Fundraiser'}
                              </td>
                              <td className="py-3 px-4">${tx.amount}</td>
                              <td className="py-3 px-4">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button variant="default" size="sm">Confirm</Button>
                                  <Button variant="outline" size="sm">Reject</Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  
                  {mockTransactions.filter(tx => tx.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending transactions to display
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0">
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">User</th>
                        <th className="text-left py-3 px-4 font-medium">Fundraiser</th>
                        <th className="text-left py-3 px-4 font-medium">Amount</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                        <th className="text-left py-3 px-4 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTransactions
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map((tx) => {
                          const fundraiser = mockFundraisers.find(f => f.id === tx.fundraiserId);
                          
                          return (
                            <tr key={tx.id} className="border-b hover:bg-muted/30">
                              <td className="py-3 px-4">@{tx.donorUsername}</td>
                              <td className="py-3 px-4 max-w-[200px] truncate">
                                {fundraiser?.title || 'Unknown Fundraiser'}
                              </td>
                              <td className="py-3 px-4">${tx.amount}</td>
                              <td className="py-3 px-4">
                                <span className={cn(
                                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                                  tx.status === 'confirmed' 
                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                    : tx.status === 'pending'
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                )}>
                                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                {new Date(tx.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
