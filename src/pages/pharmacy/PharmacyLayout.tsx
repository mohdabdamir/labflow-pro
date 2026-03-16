import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme';
import {
  Pill, LayoutDashboard, ClipboardList, Package, BarChart3,
  Settings, Home, ChevronLeft, ChevronRight, Bell, Radio,
  Users, FlaskConical, AlertTriangle, Wifi,
} from 'lucide-react';
import { usePharmacyData } from '@/hooks/usePharmacyData';

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/pharmacy' },
  { label: 'Action Queue', icon: ClipboardList, href: '/pharmacy/prescriptions' },
  { label: 'Inventory', icon: Package, href: '/pharmacy/inventory' },
  { label: 'Patients', icon: Users, href: '/pharmacy/patients' },
  { label: 'Clinical CDS', icon: FlaskConical, href: '/pharmacy/cds' },
  { label: 'Analytics', icon: BarChart3, href: '/pharmacy/analytics' },
  { label: 'Integrations', icon: Wifi, href: '/pharmacy/integrations' },
  { label: 'Settings', icon: Settings, href: '/pharmacy/settings' },
];

export default function PharmacyLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { queueStats, rxStats, inventoryStats, reorderAlerts, hl7Connections } = usePharmacyData();

  const isActive = (href: string) => {
    if (href === '/pharmacy') return location.pathname === '/pharmacy';
    return location.pathname.startsWith(href);
  };

  const disconnectedHL7 = hl7Connections.filter(h => h.status === 'disconnected' || h.status === 'error').length;

  const getBadge = (href: string) => {
    if (href === '/pharmacy/prescriptions') {
      const urgent = rxStats.clinicalReview + rxStats.clarification + rxStats.urgentCount;
      return urgent > 0 ? { count: urgent, color: 'bg-destructive' } : null;
    }
    if (href === '/pharmacy') {
      return queueStats.urgent > 0 ? { count: queueStats.urgent, color: 'bg-amber-500' } : null;
    }
    if (href === '/pharmacy/inventory') {
      const alerts = inventoryStats.outOfStock + inventoryStats.lowStock;
      return alerts > 0 ? { count: alerts, color: 'bg-amber-500' } : null;
    }
    if (href === '/pharmacy/integrations') {
      return disconnectedHL7 > 0 ? { count: disconnectedHL7, color: 'bg-destructive' } : null;
    }
    return null;
  };

  const NavItem = ({ item }: { item: typeof NAV[0] }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    const badge = getBadge(item.href);
    const content = (
      <button
        onClick={() => navigate(item.href)}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative',
          'hover:bg-sidebar-accent group',
          active
            ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
            : 'text-sidebar-foreground/75 hover:text-sidebar-foreground',
        )}
      >
        <Icon className={cn('h-5 w-5 shrink-0', active && 'text-sidebar-primary')} />
        {!collapsed && <span className="truncate text-sm">{item.label}</span>}
        {!collapsed && badge && (
          <span className={cn('ml-auto text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center', badge.color)}>
            {badge.count}
          </span>
        )}
        {collapsed && badge && (
          <span className={cn('absolute -top-1 -right-1 text-[9px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center', badge.color)}>
            {badge.count}
          </span>
        )}
      </button>
    );
    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.label}
            {badge && <span className={cn('text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full', badge.color)}>{badge.count}</span>}
          </TooltipContent>
        </Tooltip>
      );
    }
    return content;
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 shrink-0',
        collapsed ? 'w-[68px]' : 'w-64',
      )}>
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 px-4 border-b border-sidebar-border shrink-0',
          collapsed ? 'justify-center' : 'justify-between',
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-green-600 rounded-lg">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground text-sm leading-none">PharmaCare</h1>
                <p className="text-[10px] text-sidebar-foreground/55 mt-0.5">Pharmacy Management</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="p-1.5 bg-green-600 rounded-lg">
              <Pill className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="px-3 pt-3">
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <button onClick={() => navigate('/')} className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
                  <Home className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">All Modules</TooltipContent>
            </Tooltip>
          ) : (
            <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-xs font-medium">
              <Home className="h-3.5 w-3.5" /><span>All Modules</span>
            </button>
          )}
        </div>

        <div className="mx-3 mt-2 mb-1 border-t border-sidebar-border/40" />

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
          {NAV.map(item => <NavItem key={item.href} item={item} />)}
        </nav>

        {/* System Status */}
        {!collapsed && (
          <div className="mx-3 mb-2 p-2 rounded-lg bg-sidebar-accent/50 border border-sidebar-border/50 text-[11px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sidebar-foreground/60 font-medium uppercase tracking-wide text-[10px]">System Status</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sidebar-foreground/70">HL7 Engine</span>
                <span className={cn('font-semibold', disconnectedHL7 > 0 ? 'text-amber-400' : 'text-green-400')}>
                  {disconnectedHL7 > 0 ? `${disconnectedHL7} issues` : 'All Connected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sidebar-foreground/70">Robot</span>
                <span className="text-green-400 font-semibold">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sidebar-foreground/70">Queue</span>
                <span className="text-sidebar-foreground/90 font-semibold">{queueStats.total} active</span>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 border-t border-sidebar-border shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setCollapsed(c => !c)}
            className="w-full justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs">
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4 mr-1.5" />Collapse</>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn('flex-1 flex flex-col min-h-screen overflow-hidden transition-all duration-300', collapsed ? 'ml-[68px]' : 'ml-64')}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-14 bg-card/90 backdrop-blur border-b border-border flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <Pill className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-sm text-foreground">Pharmacy Management System</span>
            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
              Phase 1 · Live
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {queueStats.urgent > 0 && (
              <button
                onClick={() => navigate('/pharmacy')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold border border-amber-200 dark:border-amber-800 hover:bg-amber-200 transition-colors"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {queueStats.urgent} URGENT
              </button>
            )}
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => navigate('/pharmacy/prescriptions')}>
              <ClipboardList className="h-3.5 w-3.5" />
              Action Queue
              {(rxStats.clinicalReview + rxStats.clarification) > 0 && (
                <Badge className="ml-1 h-4 px-1 text-[10px] bg-destructive text-destructive-foreground">
                  {rxStats.clinicalReview + rxStats.clarification}
                </Badge>
              )}
            </Button>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
