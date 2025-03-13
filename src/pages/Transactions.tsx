
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  ChevronDown, 
  Download, 
  Filter, 
  MoreHorizontal, 
  Search, 
  Star, 
  XCircle 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Transaction, TransactionStatus, PaymentMethod } from "@/utils/types";

// Mock function for fetching transactions - would be replaced with actual API call
const fetchTransactions = async (): Promise<Transaction[]> => {
  // Simulated API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: "tr-1",
      fundraiserId: "fund-1",
      fundraiserTitle: "Помощь бездомным животным",
      donorId: "user-12",
      donorUsername: "alexey87",
      amount: 1000,
      currency: "RUB",
      status: TransactionStatus.PENDING,
      paymentMethod: PaymentMethod.TELEGRAM_STARS,
      createdAt: "2023-11-01T14:32:21Z",
    },
    {
      id: "tr-2",
      fundraiserId: "fund-2",
      fundraiserTitle: "Сбор на лечение",
      donorId: "user-5",
      donorUsername: "marina_ivanova",
      amount: 500,
      currency: "RUB",
      status: TransactionStatus.CONFIRMED,
      paymentMethod: PaymentMethod.TELEGRAM_STARS,
      createdAt: "2023-11-01T13:18:44Z",
      confirmedAt: "2023-11-01T14:05:11Z",
    },
    {
      id: "tr-3",
      fundraiserId: "fund-3",
      fundraiserTitle: "Помощь пострадавшим",
      donorId: "user-8",
      donorUsername: "denis_petrov",
      amount: 2000,
      currency: "RUB",
      status: TransactionStatus.REJECTED,
      paymentMethod: PaymentMethod.TELEGRAM_STARS,
      createdAt: "2023-10-31T17:42:33Z",
      rejectedAt: "2023-10-31T18:30:05Z",
      notes: "Ошибка при обработке платежа",
    },
    {
      id: "tr-4",
      fundraiserId: "fund-1",
      fundraiserTitle: "Помощь бездомным животным",
      donorId: "user-15",
      donorUsername: "katerina2000",
      amount: 750,
      currency: "RUB",
      status: TransactionStatus.CONFIRMED,
      paymentMethod: PaymentMethod.TELEGRAM_STARS,
      createdAt: "2023-10-30T09:12:51Z",
      confirmedAt: "2023-10-30T10:08:22Z",
    },
    {
      id: "tr-5",
      fundraiserId: "fund-4",
      fundraiserTitle: "Сбор на школьные принадлежности",
      donorId: "user-21",
      donorUsername: "sergey_m",
      amount: 1500,
      currency: "RUB",
      status: TransactionStatus.PENDING,
      paymentMethod: PaymentMethod.TELEGRAM_STARS,
      createdAt: "2023-10-29T20:55:33Z",
    },
  ];
};

const Transactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.CONFIRMED:
        return <Badge variant="success" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Подтверждена</Badge>;
      case TransactionStatus.PENDING:
        return <Badge variant="outline" className="flex items-center gap-1">В обработке</Badge>;
      case TransactionStatus.REJECTED:
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Отклонена</Badge>;
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

  return (
    <div className="container mx-auto py-6">
      <Header 
        title="Транзакции" 
        description="Управление и модерация транзакций, подтверждение/отклонение пожертвований."
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Экспорт
          </Button>
        }
      />
      
      <div className="mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск по ID или пользователю..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Фильтры
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Сбор</TableHead>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Сумма</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Метод</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Загрузка транзакций...
                    </TableCell>
                  </TableRow>
                ) : transactions && transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-xs">{transaction.id}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={transaction.fundraiserTitle}>
                        {transaction.fundraiserTitle}
                      </TableCell>
                      <TableCell className="font-medium">{transaction.donorUsername}</TableCell>
                      <TableCell>{transaction.amount} {transaction.currency}</TableCell>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-sm">Telegram Stars</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {transaction.status === TransactionStatus.PENDING && (
                              <>
                                <DropdownMenuItem>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> 
                                  Подтвердить
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" /> 
                                  Отклонить
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            
                            <DropdownMenuItem>Просмотреть детали</DropdownMenuItem>
                            <DropdownMenuItem>Посмотреть пользователя</DropdownMenuItem>
                            <DropdownMenuItem>Перейти к сбору</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Транзакции не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;
