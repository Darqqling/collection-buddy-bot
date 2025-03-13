
import { useState, useMemo } from 'react';
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import FundraiserCard from '@/components/FundraiserCard';
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
import { FileText, Plus, Search } from 'lucide-react';
import { Fundraiser } from '@/utils/types';
import { useToast } from "@/components/ui/use-toast";

const mockFundraisers: Fundraiser[] = [
  {
    id: '1',
    title: 'Emergency Relief Fund',
    description: 'Support those affected by recent natural disasters in coastal regions. Funds will be used for food, shelter, and medical supplies.',
    goal: 10000,
    raised: 7500,
    creatorId: '1',
    creatorUsername: 'john_doe',
    status: 'active',
    createdAt: '2023-09-15T10:30:00Z',
    updatedAt: '2023-10-10T14:20:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1469571486292-b53601021a68?q=80&w=2874&auto=format&fit=crop'
  },
  {
    id: '2',
    title: 'Community Garden Project',
    description: 'Help us build a sustainable garden for the neighborhood that will provide fresh produce and educational opportunities for local schools.',
    goal: 5000,
    raised: 5000,
    creatorId: '2',
    creatorUsername: 'gardenlover',
    status: 'completed',
    createdAt: '2023-08-20T09:15:00Z',
    updatedAt: '2023-10-05T16:45:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2940&auto=format&fit=crop'
  },
  {
    id: '3',
    title: 'Medical Treatment Support',
    description: 'Support for critical medical procedures and ongoing treatment for patients who cannot afford healthcare costs.',
    goal: 15000,
    raised: 3000,
    creatorId: '3',
    creatorUsername: 'healthmatters',
    status: 'active',
    createdAt: '2023-10-01T11:20:00Z',
    updatedAt: '2023-10-12T13:10:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2880&auto=format&fit=crop'
  },
  {
    id: '4',
    title: 'Education Fund for Underprivileged Children',
    description: 'Provide educational resources, scholarships, and learning materials for children from low-income families.',
    goal: 8000,
    raised: 2500,
    creatorId: '4',
    creatorUsername: 'edusupporter',
    status: 'active',
    createdAt: '2023-09-25T08:45:00Z',
    updatedAt: '2023-10-11T09:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2922&auto=format&fit=crop'
  },
  {
    id: '5',
    title: 'Animal Shelter Renovation',
    description: 'Help renovate our local animal shelter to improve living conditions for rescued animals awaiting adoption.',
    goal: 12000,
    raised: 4800,
    creatorId: '5',
    creatorUsername: 'animalfriend',
    status: 'active',
    createdAt: '2023-09-10T13:20:00Z',
    updatedAt: '2023-10-09T15:40:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=2942&auto=format&fit=crop'
  },
  {
    id: '6',
    title: 'Sports Equipment for Youth Center',
    description: 'Purchase new sports equipment for the local youth center to promote physical activity and team building.',
    goal: 3000,
    raised: 3000,
    creatorId: '6',
    creatorUsername: 'sportscoach',
    status: 'completed',
    createdAt: '2023-08-15T10:10:00Z',
    updatedAt: '2023-09-20T11:25:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2940&auto=format&fit=crop'
  },
  {
    id: '7',
    title: 'Inappropriate Content Fundraiser',
    description: 'This fundraiser contains inappropriate content that violates our community guidelines.',
    goal: 5000,
    raised: 250,
    creatorId: '7',
    creatorUsername: 'spammer123',
    status: 'blocked',
    createdAt: '2023-10-02T16:50:00Z',
    updatedAt: '2023-10-03T09:15:00Z',
  },
];

const Fundraisers = () => {
  const { toast } = useToast();
  const [fundraisers, setFundraisers] = useState<Fundraiser[]>(mockFundraisers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const handleStatusChange = (fundraiserId: string, newStatus: 'active' | 'completed' | 'blocked') => {
    setFundraisers(prev => 
      prev.map(fundraiser => 
        fundraiser.id === fundraiserId 
          ? { ...fundraiser, status: newStatus, updatedAt: new Date().toISOString() }
          : fundraiser
      )
    );
  };
  
  const filteredFundraisers = useMemo(() => {
    return fundraisers.filter(fundraiser => {
      // Apply status filter
      if (statusFilter !== 'all' && fundraiser.status !== statusFilter) {
        return false;
      }
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          fundraiser.title.toLowerCase().includes(query) ||
          fundraiser.description.toLowerCase().includes(query) ||
          fundraiser.creatorUsername.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [fundraisers, searchQuery, statusFilter]);
  
  return (
    <div className="flex min-h-screen">
      <Navbar />
      
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <Header 
          title="Fundraisers" 
          description="Manage and monitor all fundraising campaigns"
          actions={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span>New Fundraiser</span>
            </Button>
          }
        />
        
        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search fundraisers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {filteredFundraisers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredFundraisers.map((fundraiser, index) => (
              <div 
                key={fundraiser.id} 
                className="animate-slide-up opacity-0" 
                style={{ 
                  animationDelay: `${index * 0.05}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <FundraiserCard 
                  fundraiser={fundraiser} 
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/30 rounded-lg border border-dashed animate-fade-in">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No fundraisers found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all'
                ? "Try adjusting your search or filter criteria"
                : "Create your first fundraiser to get started"}
            </p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span>New Fundraiser</span>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Fundraisers;
