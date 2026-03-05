import React from 'react';
import { Bell, Search, ArrowLeftRight, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme';
import { useUserStore } from '@/hooks/useUserStore';
import { useUsers } from '@/hooks/useLabData';

interface HeaderProps {
  title?: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  technician: 'bg-blue-500/10 text-blue-600 border-blue-200',
  pathologist: 'bg-purple-500/10 text-purple-600 border-purple-200',
  medical_director: 'bg-primary/10 text-primary border-primary/20',
  receptionist: 'bg-green-500/10 text-green-600 border-green-200',
  billing: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
};

function roleLabel(role: string) {
  return role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function Header({ title }: HeaderProps) {
  const { currentUser, setCurrentUser, logout } = useUserStore();
  const { users } = useUsers();

  return (
    <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold text-foreground">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search cases, patients..."
            className="w-64 pl-9 bg-background"
          />
        </div>

        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">3</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">Critical Result Alert</span>
              <span className="text-xs text-muted-foreground">Patient John Doe - Glucose: 450 mg/dL</span>
              <span className="text-xs text-muted-foreground">2 min ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <span className="font-medium text-sm">STAT Case Received</span>
              <span className="text-xs text-muted-foreground">Case LAB-2024-00006 from City Hospital</span>
              <span className="text-xs text-muted-foreground">15 min ago</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Switch User (demo) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Switch User
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-2">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">Demo — switch active user</p>
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => setCurrentUser(u)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-muted ${currentUser?.id === u.id ? 'bg-primary/10' : ''}`}
              >
                <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{u.fullName}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel(u.role)}</p>
                </div>
                {currentUser?.id === u.id && (
                  <Badge variant="default" className="text-[10px] px-1.5">Active</Badge>
                )}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">
                  {currentUser?.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) ?? 'A'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{currentUser?.fullName ?? 'Unknown'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${ROLE_COLORS[currentUser?.role ?? ''] ?? 'bg-muted text-muted-foreground'}`}>
                    {roleLabel(currentUser?.role ?? '')}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Help & Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
