import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'org_manager':
        return 'Organization Manager';
      case 'substitute':
        return 'Substitute Teacher';
      default:
        return role;
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Substitute Finder</h1>
          <p className="text-sm text-muted-foreground">Admin Panel</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm font-medium">
              <UserIcon className="w-4 h-4" />
              {user.first_name} {user.last_name}
            </div>
            <div className="text-xs text-muted-foreground">
              {getRoleLabel(user.role)}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}