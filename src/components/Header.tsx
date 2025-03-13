
import React from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  description,
  actions,
  className,
}) => {
  return (
    <div className={cn("py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4", className)}>
      <div className="space-y-1 animate-slide-down">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground max-w-3xl">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 animate-fade-in">{actions}</div>
      )}
    </div>
  );
};

export default Header;
