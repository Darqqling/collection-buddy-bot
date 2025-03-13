
import { useState } from 'react';
import { User } from '@/utils/types';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Ban, 
  Shield, 
  ExternalLink,
  UserCheck,
  CornerDownLeft
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface UserCardProps {
  user: User;
  onBanChange?: (id: string, isBanned: boolean) => void;
  onAdminChange?: (id: string, isAdmin: boolean) => void;
}

const UserCard = ({ user, onBanChange, onAdminChange }: UserCardProps) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  const getInitials = (firstName: string, lastName?: string) => {
    const firstInitial = firstName.charAt(0);
    const lastInitial = lastName ? lastName.charAt(0) : '';
    return (firstInitial + lastInitial).toUpperCase();
  };
  
  const handleBanChange = (isBanned: boolean) => {
    if (onBanChange) {
      onBanChange(user.id, isBanned);
      toast({
        title: isBanned ? "User banned" : "User unbanned",
        description: `${user.username} has been ${isBanned ? 'banned' : 'unbanned'}`,
      });
    }
  };
  
  const handleAdminChange = (isAdmin: boolean) => {
    if (onAdminChange) {
      onAdminChange(user.id, isAdmin);
      toast({
        title: isAdmin ? "Admin rights granted" : "Admin rights revoked",
        description: `${user.username} is ${isAdmin ? 'now an admin' : 'no longer an admin'}`,
      });
    }
  };
  
  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300 border hover:shadow-elevation-2",
        isHovered ? "translate-y-[-2px]" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-base">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-muted-foreground">@{user.username}</div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user.isBanned ? (
              <DropdownMenuItem 
                onClick={() => handleBanChange(false)}
                className="flex items-center gap-2 text-green-600 dark:text-green-400"
              >
                <UserCheck className="h-4 w-4" />
                <span>Unban User</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => handleBanChange(true)}
                className="flex items-center gap-2 text-destructive"
              >
                <Ban className="h-4 w-4" />
                <span>Ban User</span>
              </DropdownMenuItem>
            )}
            
            {user.isAdmin ? (
              <DropdownMenuItem 
                onClick={() => handleAdminChange(false)}
                className="flex items-center gap-2"
              >
                <CornerDownLeft className="h-4 w-4" />
                <span>Remove Admin</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => handleAdminChange(true)}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                <span>Make Admin</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mt-2">
          {user.isAdmin && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Admin
            </Badge>
          )}
          {user.isBanned && (
            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
              Banned
            </Badge>
          )}
        </div>
        
        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Telegram ID</span>
            <span>{user.telegramId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Joined</span>
            <span>{formatDate(user.createdAt)}</span>
          </div>
          {user.lastActive && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Active</span>
              <span>{formatDate(user.lastActive)}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full gap-2" asChild>
          <a href={`https://t.me/${user.username}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            <span>View in Telegram</span>
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserCard;
