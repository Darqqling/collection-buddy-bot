import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Menu,
  X,
  LogOut,
  DollarSign,
  BarChart,
  CreditCard,
  MessageSquare,
  Bot
} from 'lucide-react';
import { Button } from "@/components/ui/button";

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick?: () => void;
}

const NavItem = ({ to, label, icon, isActive, onClick }: NavItemProps) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
        isActive 
          ? "bg-primary text-primary-foreground" 
          : "hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <div className="w-5 h-5">{icon}</div>
      <span className="font-medium">{label}</span>
      {isActive && (
        <ChevronRight className="w-4 h-4 ml-auto" />
      )}
    </Link>
  );
};

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [animateNavbar, setAnimateNavbar] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setAnimateNavbar(true);
    const timer = setTimeout(() => setAnimateNavbar(false), 500);
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    {
      title: "Dashboard",
      icon: <BarChart className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "Fundraisers",
      icon: <DollarSign className="h-5 w-5" />,
      href: "/fundraisers",
    },
    {
      title: "Users",
      icon: <Users className="h-5 w-5" />,
      href: "/users",
    },
    {
      title: "Transactions",
      icon: <CreditCard className="h-5 w-5" />,
      href: "/transactions",
    },
    {
      title: "Admin Logs",
      icon: <FileText className="h-5 w-5" />,
      href: "/admin-logs",
    },
    {
      title: "Bot Commands",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/telegram-commands",
    },
    {
      title: "Bot Settings",
      icon: <Bot className="h-5 w-5" />,
      href: "/telegram-bot-settings",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="bg-background/80 backdrop-blur-sm border shadow-sm"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      
      {/* Sidebar navigation - desktop */}
      <aside className={cn(
        "hidden md:flex flex-col w-64 p-6 border-r border-border h-screen sticky top-0 left-0 transition-transform duration-200 ease-spring",
        animateNavbar ? "translate-x-0" : ""
      )}>
        <div className="space-y-1 mb-8">
          <h2 className="text-xl font-semibold text-foreground">CollectionBoxBot</h2>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              to={item.href}
              label={item.title}
              icon={item.icon}
              isActive={isActive(item.href)}
            />
          ))}
        </nav>
        
        <Button variant="outline" className="mt-auto gap-2">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </aside>
      
      {/* Mobile navigation overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMobileMenu}
      />
      
      {/* Mobile navigation menu */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 w-64 h-screen p-6 bg-background border-r border-border transition-transform duration-300 ease-spring md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="space-y-1 mb-8">
          <h2 className="text-xl font-semibold text-foreground">CollectionBoxBot</h2>
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
        </div>
        
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              to={item.href}
              label={item.title}
              icon={item.icon}
              isActive={isActive(item.href)}
              onClick={closeMobileMenu}
            />
          ))}
        </nav>
        
        <Button variant="outline" className="mt-auto gap-2">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </aside>
    </>
  );
};

export default Navbar;
