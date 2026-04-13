import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme';
import {
  LayoutDashboard, ClipboardList, HeartPulse, ArrowLeftRight,
  Settings, Home, ChevronLeft, ChevronRight, Bell, Shield,
  Ambulance, AlertTriangle, WifiOff, Wifi,
} from 'lucide-react';
import { useEmergencyData } from '@/hooks/useEmergencyData';

const NAV = [
  { label: 'Tracking Board', icon: LayoutDashboard, href: '/emergency' },
  { label: 'Triage', icon: ClipboardList, href: '/emergency/triage' },
  { label: 'Sepsis Monitor', icon: HeartPulse, href: '/emergency/sepsis' },
  { label: 'Handover', icon: ArrowLeftRight, href: '/emergency/handover' },
  { label: 'Discharge', icon: Shield, href: '/emergency/discharge' },
  { label: 'MCI Mode', icon: Ambulance, href: '/emergency/mci' },
  { label: 'Settings', icon: Settings, href: '/emergency/settings' },
];

export default function EmergencyLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { criticalAlerts, pendingHandovers, mciActive, offlineMode, activePatients } = useEmergencyData();

  const isActive = (href: string) => {
    if (href === '/emergency') return location.pathname === '/emergency';
    return location.pathname.startsWith(href);
  };

  const getBadge = (href: string) => {
    if (href === '/emergency') {
      const critical = activePatients.filter(p => p.hasCriticalResult).length;
      return critical > 0 ? { count: critical, color: 'bg-destructive' } : null;
    }
    if (href === '/emergency/sepsis') return criticalAlerts.length > 0 ? { count: criticalAlerts.length, color: 'bg-destructive' } : null;
    if (href === '/emergency/handover') return pendingHandovers.length > 0 ? { count: pendingHandovers.length, color: 'bg-amber-500' } : null;
    if (href === '/emergency/mci') return mciActive ? { count: 1, color: 'bg-destructive animate-pulse' } : null;
    return null;
  };

  const NavItem = ({ item }: { item: typeof NAV[0] }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const badge = getBadge(item.href);
    const btn = (
      <Button
        variant={active ? 'secondary' : 'ghost'}
        className={cn('w-full justify-start gap-3 relative', collapsed && 'justify-center px-2')}
        onClick={() => navigate(item.href)}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
        {badge && (
          <span className={cn('absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold', badge.color, collapsed && 'right-0 -top-1 translate-y-0')}>
            {badge.count}
          </span>
        )}
      </Button>
    );
    return collapsed ? (
      <Tooltip><TooltipTrigger asChild>{btn}</TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip>
    ) : btn;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn('flex flex-col border-r bg-card transition-all duration-300', collapsed ? 'w-16' : 'w-60')}>
        {/* Header */}
        <div className="p-3 border-b flex items-center gap-2">
          {!collapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <HeartPulse className="h-5 w-5 text-destructive shrink-0" />
              <span className="font-bold text-sm truncate">Emergency Dept</span>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Status bar */}
        {!collapsed && (
          <div className="px-3 py-2 border-b space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Active</span>
              <Badge variant="secondary" className="text-[10px] h-5">{activePatients.length}</Badge>
            </div>
            {mciActive && (
              <div className="flex items-center gap-1 text-xs text-destructive font-bold animate-pulse">
                <Ambulance className="h-3 w-3" /> MCI ACTIVE
              </div>
            )}
            {offlineMode && (
              <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold">
                <WifiOff className="h-3 w-3" /> OFFLINE
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {NAV.map(item => <NavItem key={item.href} item={item} />)}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t space-y-1">
          <Button variant="ghost" className={cn('w-full justify-start gap-3', collapsed && 'justify-center px-2')} onClick={() => navigate('/')}>
            <Home className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Home</span>}
          </Button>
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'justify-between px-2')}>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top alert bar */}
        {criticalAlerts.length > 0 && (
          <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">{criticalAlerts.length} unacknowledged critical alert(s)</span>
            <Button variant="destructive" size="sm" className="ml-auto h-7 text-xs" onClick={() => navigate('/emergency/sepsis')}>
              <Bell className="h-3 w-3 mr-1" /> Review Alerts
            </Button>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
