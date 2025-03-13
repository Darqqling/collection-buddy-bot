
import { useState } from 'react';
import { Fundraiser } from '@/utils/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ExternalLink, MoreHorizontal } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface FundraiserCardProps {
  fundraiser: Fundraiser;
  onStatusChange?: (id: string, status: 'active' | 'completed' | 'blocked') => void;
}

const FundraiserCard = ({ fundraiser, onStatusChange }: FundraiserCardProps) => {
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  
  const progress = Math.min(Math.round((fundraiser.raised / fundraiser.goal) * 100), 100);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };
  
  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  
  const handleStatusChange = (status: 'active' | 'completed' | 'blocked') => {
    if (onStatusChange) {
      onStatusChange(fundraiser.id, status);
      toast({
        title: "Status updated",
        description: `Fundraiser status changed to ${status}`,
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
      {fundraiser.imageUrl && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={fundraiser.imageUrl} 
            alt={fundraiser.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out"
            style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge 
            variant="outline" 
            className={cn(
              "mb-2 font-normal",
              statusColors[fundraiser.status]
            )}
          >
            {fundraiser.status.charAt(0).toUpperCase() + fundraiser.status.slice(1)}
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => handleStatusChange('active')}
                disabled={fundraiser.status === 'active'}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Mark as Active</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusChange('completed')}
                disabled={fundraiser.status === 'completed'}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <span>Mark as Completed</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleStatusChange('blocked')}
                disabled={fundraiser.status === 'blocked'}
                className="flex items-center gap-2 text-destructive"
              >
                <XCircle className="h-4 w-4" />
                <span>Block Fundraiser</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <CardTitle className="line-clamp-2">{fundraiser.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          by <span className="font-medium">@{fundraiser.creatorUsername}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm line-clamp-3">{fundraiser.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Raised</span>
            <span className="font-medium">${fundraiser.raised.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Goal</span>
            <span className="font-medium">${fundraiser.goal.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Created {formatDate(fundraiser.createdAt)}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full gap-2" asChild>
          <a href={`https://t.me/CollectiveBoxBot?start=fund_${fundraiser.id}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            <span>View in Telegram</span>
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FundraiserCard;
