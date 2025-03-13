
import { useState, useMemo } from 'react';
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import UserCard from '@/components/UserCard';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Users as UsersIcon, Search } from 'lucide-react';
import { User } from '@/utils/types';
import { useToast } from "@/components/ui/use-toast";

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
  {
    id: '5',
    username: 'generous_user',
    firstName: 'Sarah',
    lastName: 'Williams',
    telegramId: 56789012,
    isAdmin: false,
    isBanned: false,
    createdAt: '2023-08-20T13:15:00Z',
    lastActive: '2023-10-09T11:30:00Z',
  },
  {
    id: '6',
    username: 'charity_lover',
    firstName: 'David',
    lastName: 'Brown',
    telegramId: 67890123,
    isAdmin: false,
    isBanned: false,
    createdAt: '2023-09-10T10:00:00Z',
    lastActive: '2023-10-08T14:45:00Z',
  },
  {
    id: '7',
    username: 'eco_friend',
    firstName: 'Emily',
    lastName: 'Davis',
    telegramId: 78901234,
    isAdmin: false,
    isBanned: false,
    createdAt: '2023-08-25T15:30:00Z',
    lastActive: '2023-10-07T09:15:00Z',
  },
  {
    id: '8',
    username: 'health_supporter',
    firstName: 'Daniel',
    lastName: 'Wilson',
    telegramId: 89012345,
    isAdmin: false,
    isBanned: false,
    createdAt: '2023-09-15T11:45:00Z',
    lastActive: '2023-10-06T16:30:00Z',
  },
];

const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const handleBanChange = (userId: string, isBanned: boolean) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isBanned }
          : user
      )
    );
  };
  
  const handleAdminChange = (userId: string, isAdmin: boolean) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isAdmin }
          : user
      )
    );
  };
  
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Apply type filter
      if (typeFilter === 'admins' && !user.isAdmin) {
        return false;
      }
      if (typeFilter === 'banned' && !user.isBanned) {
        return false;
      }
      if (typeFilter === 'regular' && (user.isAdmin || user.isBanned)) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          user.username.toLowerCase().includes(query) ||
          user.firstName.toLowerCase().includes(query) ||
          (user.lastName && user.lastName.toLowerCase().includes(query)) ||
          user.telegramId.toString().includes(query)
        );
      }
      
      return true;
    });
  }, [users, searchQuery, typeFilter]);
  
  return (
    <div className="flex min-h-screen">
      <Navbar />
      
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Header 
          title="Users" 
          description="Manage users and permissions"
        />
        
        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="admins">Admins</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="regular">Regular Users</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
            {filteredUsers.map((user, index) => (
              <div 
                key={user.id} 
                className="animate-slide-up opacity-0" 
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <UserCard 
                  user={user} 
                  onBanChange={handleBanChange}
                  onAdminChange={handleAdminChange}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed animate-fade-in">
            <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No users found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || typeFilter !== 'all'
                ? "Try adjusting your search or filter criteria"
                : "Users will appear here once they start using your bot"}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default UsersPage;
