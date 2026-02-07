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
  DollarSign,
  Activity,
  Settings,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Cases', icon: FileText, href: '/cases' },
  { label: 'Services', icon: TestTubes, href: '/services' },
  { label: 'Profiles', icon: Layers, href: '/profiles' },
  { label: 'Packages', icon: Package, href: '/packages' },
  { label: 'Clients', icon: Users, href: '/clients' },
  { label: 'Price Lists', icon: DollarSign, href: '/pricelists' },
  { label: 'Normal Ranges', icon: Activity, href: '/normalranges' },
];

const bottomItems: NavItem[] = [
  { label: 'Settings', icon: Settings, href: '/settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

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
        <Icon className={cn(
          'h-5 w-5 shrink-0',
          isActive && 'text-sidebar-primary'
        )} />
        {!collapsed && (
          <span className="font-medium truncate">{item.label}</span>
        )}
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
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border',
        'flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
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
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      {/* Bottom Items */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
        
        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            'w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground',
            'hover:bg-sidebar-accent'
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
