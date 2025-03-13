
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
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronDown, Download, Eye, Filter, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminAction, AdminActionType } from "@/utils/types";

// Mock function for fetching admin logs - would be replaced with actual API call
const fetchAdminLogs = async (): Promise<AdminAction[]> => {
  // Simulated API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    {
      id: "log-1",
      adminId: "admin-1",
      adminUsername: "superadmin",
      actionType: AdminActionType.BLOCK,
      targetType: "fundraiser",
      targetId: "fund-5",
      details: "Заблокирован сбор из-за нарушений правил платформы",
      createdAt: "2023-11-01T15:20:33Z",
    },
    {
      id: "log-2",
      adminId: "admin-2",
      adminUsername: "moderator1",
      actionType: AdminActionType.CONFIRM_PAYMENT,
      targetType: "transaction",
      targetId: "tr-8",
      details: "Подтверждена транзакция на сумму 1200 RUB",
      createdAt: "2023-11-01T14:48:12Z",
    },
    {
      id: "log-3",
      adminId: "admin-1",
      adminUsername: "superadmin",
      actionType: AdminActionType.UNBLOCK,
      targetType: "user",
      targetId: "user-42",
      details: "Разблокирован пользователь после подтверждения личности",
      createdAt: "2023-11-01T12:36:54Z",
    },
    {
      id: "log-4",
      adminId: "admin-3",
      adminUsername: "support_manager",
      actionType: AdminActionType.UPDATE,
      targetType: "fundraiser",
      targetId: "fund-3",
      details: "Обновлено описание сбора по запросу организатора",
      createdAt: "2023-10-31T09:12:40Z",
    },
    {
      id: "log-5",
      adminId: "admin-2",
      adminUsername: "moderator1",
      actionType: AdminActionType.REJECT_PAYMENT,
      targetType: "transaction",
      targetId: "tr-6",
      details: "Отклонена подозрительная транзакция на сумму 10000 RUB",
      createdAt: "2023-10-30T18:22:51Z",
    },
  ];
};

const AdminLogs = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  
  const { data: logs, isLoading } = useQuery({
    queryKey: ['adminLogs'],
    queryFn: fetchAdminLogs,
  });

  const getActionTypeBadge = (actionType: AdminActionType) => {
    switch (actionType) {
      case AdminActionType.CREATE:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Создание</Badge>;
      case AdminActionType.UPDATE:
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Обновление</Badge>;
      case AdminActionType.DELETE:
        return <Badge variant="destructive">Удаление</Badge>;
      case AdminActionType.BLOCK:
        return <Badge variant="destructive">Блокировка</Badge>;
      case AdminActionType.UNBLOCK:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Разблокировка</Badge>;
      case AdminActionType.LOGIN:
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Вход</Badge>;
      case AdminActionType.LOGOUT:
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Выход</Badge>;
      case AdminActionType.CONFIRM_PAYMENT:
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Подтверждение платежа</Badge>;
      case AdminActionType.REJECT_PAYMENT:
        return <Badge variant="destructive">Отклонение платежа</Badge>;
      default:
        return <Badge variant="secondary">Неизвестно</Badge>;
    }
  };

  const getTargetTypeLabel = (targetType: string) => {
    switch (targetType) {
      case 'user':
        return 'Пользователь';
      case 'fundraiser':
        return 'Сбор';
      case 'transaction':
        return 'Транзакция';
      case 'system':
        return 'Система';
      default:
        return 'Неизвестно';
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
        title="Журнал администратора" 
        description="Отслеживание действий администраторов и модераторов системы."
        actions={
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Экспорт логов
          </Button>
        }
      />
      
      <div className="mt-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Поиск по деталям или админу..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <Select 
              value={actionTypeFilter}
              onValueChange={setActionTypeFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Тип действия" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все действия</SelectItem>
                <SelectItem value={AdminActionType.CREATE}>Создание</SelectItem>
                <SelectItem value={AdminActionType.UPDATE}>Обновление</SelectItem>
                <SelectItem value={AdminActionType.DELETE}>Удаление</SelectItem>
                <SelectItem value={AdminActionType.BLOCK}>Блокировка</SelectItem>
                <SelectItem value={AdminActionType.UNBLOCK}>Разблокировка</SelectItem>
                <SelectItem value={AdminActionType.CONFIRM_PAYMENT}>Подтверждение платежа</SelectItem>
                <SelectItem value={AdminActionType.REJECT_PAYMENT}>Отклонение платежа</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-4 w-4" />
              Период
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
                  <TableHead>Администратор</TableHead>
                  <TableHead>Действие</TableHead>
                  <TableHead>Объект</TableHead>
                  <TableHead>Детали</TableHead>
                  <TableHead>Дата и время</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Загрузка журнала действий...
                    </TableCell>
                  </TableRow>
                ) : logs && logs.length > 0 ? (
                  logs
                    .filter(log => actionTypeFilter === 'all' || log.actionType === actionTypeFilter)
                    .filter(log => 
                      searchQuery === '' || 
                      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      log.adminUsername.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">{log.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{log.adminUsername}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getActionTypeBadge(log.actionType)}</TableCell>
                        <TableCell>
                          {getTargetTypeLabel(log.targetType)}
                          {log.targetId && <span className="ml-1 text-xs text-muted-foreground">({log.targetId})</span>}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate" title={log.details}>
                          {log.details}
                        </TableCell>
                        <TableCell>{formatDate(log.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Записи не найдены
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

export default AdminLogs;
