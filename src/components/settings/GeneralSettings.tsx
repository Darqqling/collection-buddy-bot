
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const GeneralSettings = () => {
  const [adminEmail, setAdminEmail] = useState(
    localStorage.getItem('adminEmail') || "admin@collectionboxbot.com"
  );
  const { toast } = useToast();

  const handleSaveGeneral = () => {
    localStorage.setItem('adminEmail', adminEmail);
    toast({
      title: "Настройки сохранены",
      description: "Общие настройки были успешно обновлены.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Общие настройки</CardTitle>
        <CardDescription>
          Управление основными настройками CollectionBoxBot
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Email администратора</Label>
          <Input 
            id="admin-email" 
            value={adminEmail} 
            onChange={(e) => setAdminEmail(e.target.value)} 
          />
        </div>
        <Button onClick={handleSaveGeneral}>Сохранить настройки</Button>
      </CardContent>
    </Card>
  );
};

export default GeneralSettings;
