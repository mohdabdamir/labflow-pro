import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  CalendarDays, LayoutDashboard, Users, Clock, ClipboardList,
  BarChart3, Settings, ChevronLeft, Bell, Search, HeartPulse,
  CalendarClock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme';
import { useAppointmentsData } from '@/hooks/useAppointmentsData';

const NAV_ITEMS = [
  { path: '/appointments', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/appointments/calendar', label: 'Calendar', icon: CalendarDays },
  { path: '/appointments/schedule', label: 'Physician Schedule', icon: CalendarClock },
  { path: '/appointments/queue', label: 'Patient Queue', icon: Clock },
  { path: '/appointments/waitlist', label: 'Waitlist', icon: ClipboardList },
  { path: '/appointments/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { path: '/appointments/settings', label: 'Settings', icon: Settings },
];

export default function AppointmentsLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { stats } = useAppointmentsData();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300 shrink-0',
        collapsed ? 'w-16' : 'w-60'
      )}>
        {/* Logo */}
        <div className={cn(
          'h-16 flex items-center border-b border-border px-4 gap-3',
          collapsed && 'justify-center px-2'
        )}>
          <div className="p-1.5 bg-rose-500 rounded-lg shrink-0">
            <CalendarDays className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-foreground text-sm leading-tight">Appointments</p>
              <p className="text-[10px] text-muted-foreground">Scheduling Module</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path) && !item.exact
                ? location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.path === '/appointments/queue' && stats.scheduled > 0 && (
                  <Badge variant="default" className="ml-auto h-5 px-1.5 text-[10px] bg-rose-500 hover:bg-rose-500">
                    {stats.scheduled}
                  </Badge>
                )}
                {!collapsed && item.path === '/appointments/waitlist' && stats.waitlisted > 0 && (
                  <Badge variant="outline" className="ml-auto h-5 px-1.5 text-[10px]">
                    {stats.waitlisted}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-border p-3 flex flex-col gap-2">
          <button
            onClick={() => navigate('/')}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Back to Portal</span>}
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <ChevronLeft className={cn('h-4 w-4 shrink-0 transition-transform', collapsed && 'rotate-180')} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <HeartPulse className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-semibold text-foreground">
              {NAV_ITEMS.find(n =>
                n.exact ? location.pathname === n.path : location.pathname.startsWith(n.path)
              )?.label ?? 'Appointments'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-lg px-3 py-1.5">
              <Search className="h-3.5 w-3.5" />
              <span>Quick search...</span>
              <kbd className="bg-background px-1.5 py-0.5 rounded text-[10px] font-mono">⌘K</kbd>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full" />
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
