
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const NotificationSettings = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    localStorage.getItem('notificationsEnabled') !== 'false'
  );
  const { toast } = useToast();

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString());
    toast({
      title: "Настройки уведомлений сохранены",
      description: `Уведомления теперь ${notificationsEnabled ? 'включены' : 'отключены'}.`,
    });
  };

  return (
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
  );
};

export default NotificationSettings;
