import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Microscope, LayoutDashboard, FolderOpen, DollarSign,
  Settings, Home, ChevronLeft, ChevronRight, MessageCircle,
  FileText, Users, Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme';
import { Badge } from '@/components/ui/badge';

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/ap' },
  { label: 'Cases', icon: FolderOpen, href: '/ap/cases' },
  { label: 'New Case', icon: FileText, href: '/ap/cases/new' },
  { label: 'Billing Codes', icon: DollarSign, href: '/ap/billing-codes' },
  { label: 'Settings', icon: Settings, href: '/ap/settings' },
];

export default function APLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (href: string) => {
    if (href === '/ap') return location.pathname === '/ap';
    return location.pathname.startsWith(href);
  };

  const NavItem = ({ item }: { item: typeof NAV[0] }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const link = (
      <Link
        to={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
          'hover:bg-sidebar-accent group',
          active ? 'bg-sidebar-accent text-sidebar-primary font-semibold' : 'text-sidebar-foreground/80 hover:text-sidebar-foreground',
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', active && 'text-sidebar-primary')} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }
    return link;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-64',
      )}>
        {/* Logo */}
        <div className={cn('flex items-center h-16 px-4 border-b border-sidebar-border', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-600 rounded-lg">
                <Microscope className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground text-sm">PathLab AP</h1>
                <p className="text-[10px] text-sidebar-foreground/60">Anatomic Pathology</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="p-1.5 bg-purple-600 rounded-lg">
              <Microscope className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="px-3 pt-3">
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={() => navigate('/')} className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                  <Home className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">All Modules</TooltipContent>
            </Tooltip>
          ) : (
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-xs font-medium">
              <Home className="h-3.5 w-3.5" /><span>All Modules</span>
            </button>
          )}
        </div>

        <div className="mx-3 mt-2 mb-1 border-t border-sidebar-border/50" />

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(item => <NavItem key={item.href} item={item} />)}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(c => !c)}
            className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 mr-2" /><span>Collapse</span></>}
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className={cn('flex-1 flex flex-col min-h-screen transition-all duration-300', collapsed ? 'ml-[68px]' : 'ml-64')}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 bg-card/90 backdrop-blur border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-purple-600" />
            <span className="font-semibold text-sm text-foreground">Anatomic Pathology</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate('/ap/cases/new')}>
              <FileText className="h-3.5 w-3.5" />New Case
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
