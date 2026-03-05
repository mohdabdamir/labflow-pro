import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  TestTubes,
  Layers,
  Package,
  Users,
  UsersRound,
  DollarSign,
  Activity,
  Settings,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  Receipt,
  ClipboardList,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/hooks/useUserStore';
import { hasPageAccess } from '@/lib/permissions';
import type { UserRole } from '@/lib/permissions';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

const allNavItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Cases', icon: FileText, href: '/cases' },
  { label: 'Services', icon: TestTubes, href: '/services' },
  { label: 'Profiles', icon: Layers, href: '/profiles' },
  { label: 'Packages', icon: Package, href: '/packages' },
  { label: 'Clients', icon: Users, href: '/clients' },
  { label: 'Price Lists', icon: ClipboardList, href: '/pricelists' },
  { label: 'Normal Ranges', icon: Activity, href: '/normalranges' },
  { label: 'Billing', icon: Receipt, href: '/billing' },
  { label: 'Users', icon: UsersRound, href: '/users' },
];

const bottomItems: NavItem[] = [
  { label: 'Settings', icon: Settings, href: '/settings' },
];

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-destructive/20 text-destructive',
  technician: 'bg-blue-500/20 text-blue-500',
  pathologist: 'bg-purple-500/20 text-purple-500',
  medical_director: 'bg-primary/20 text-primary',
  receptionist: 'bg-green-500/20 text-green-500',
  billing: 'bg-yellow-500/20 text-yellow-600',
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { currentUser } = useUserStore();

  // Filter nav items based on current user's role
  const navItems = allNavItems.filter(item =>
    currentUser ? hasPageAccess(currentUser.role as UserRole, item.href) : false
  );
  const visibleBottomItems = bottomItems.filter(item =>
    currentUser ? hasPageAccess(currentUser.role as UserRole, item.href) : false
  );

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    const linkContent = (
      <Link
        to={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
          'hover:bg-sidebar-accent group',
          isActive && 'bg-sidebar-accent text-sidebar-primary',
          !isActive && 'text-sidebar-foreground/80 hover:text-sidebar-foreground'
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />
        {!collapsed && <span className="font-medium truncate">{item.label}</span>}
        {!collapsed && item.badge && (
          <span className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
        </Tooltip>
      );
    }
    return linkContent;
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border',
      'flex flex-col transition-all duration-300 ease-in-out',
      collapsed ? 'w-[68px]' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-sidebar-border',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sidebar-primary rounded-lg">
              <FlaskConical className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-sidebar-foreground text-sm">PathLab</h1>
              <p className="text-[10px] text-sidebar-foreground/60">Laboratory System</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="p-1.5 bg-sidebar-primary rounded-lg">
            <FlaskConical className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(item => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* Current User Info */}
      {currentUser && !collapsed && (
        <div className="px-3 pb-2">
          <div className="rounded-lg bg-sidebar-accent/60 p-2.5 flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold shrink-0">
              {currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{currentUser.fullName}</p>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[currentUser.role] ?? 'bg-muted text-muted-foreground'}`}>
                {currentUser.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Items */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {visibleBottomItems.map(item => <NavLink key={item.href} item={item} />)}
        <Button
          variant="ghost" size="sm" onClick={onToggle}
          className={cn(
            'w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground',
            'hover:bg-sidebar-accent'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <><ChevronLeft className="h-4 w-4 mr-2" /><span>Collapse</span></>
          )}
        </Button>
      </div>
    </aside>
  );
}
