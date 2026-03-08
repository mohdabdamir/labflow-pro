import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme';
import {
  LayoutDashboard, Eye, GitCompare, FileText, Settings,
  ChevronLeft, Radiation, Menu, X,
} from 'lucide-react';

const NAV = [
  { label: 'Worklist', icon: LayoutDashboard, path: '/radiology' },
  { label: 'Viewer', icon: Eye, path: '/radiology/viewer' },
  { label: 'Compare', icon: GitCompare, path: '/radiology/compare' },
  { label: 'Reports', icon: FileText, path: '/radiology/reports' },
  { label: 'Admin', icon: Settings, path: '/radiology/admin' },
];

export default function RadiologyLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="h-14 bg-card border-b border-border flex items-center gap-3 px-4 shrink-0 z-30 sticky top-0">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div className="p-1 bg-orange-500/15 rounded-md">
            <Radiation className="h-4 w-4 text-orange-500" />
          </div>
          <span className="font-bold text-sm text-foreground">Radiology</span>
          <span className="text-xs text-muted-foreground hidden sm:block">— PACS & RIS</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {NAV.map(n => {
            const Icon = n.icon;
            const active = n.path === '/radiology'
              ? location.pathname === '/radiology'
              : location.pathname.startsWith(n.path);
            return (
              <Button
                key={n.path}
                variant={active ? 'default' : 'ghost'}
                size="sm"
                className={cn('gap-1.5 h-8 text-xs', active && 'bg-primary text-primary-foreground')}
                onClick={() => navigate(n.path)}
              >
                <Icon className="h-3.5 w-3.5" />
                {n.label}
              </Button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {/* Mobile nav toggle */}
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Mobile nav dropdown */}
      {collapsed && (
        <div className="md:hidden bg-card border-b border-border px-4 py-2 flex flex-col gap-1 z-20">
          {NAV.map(n => {
            const Icon = n.icon;
            const active = n.path === '/radiology'
              ? location.pathname === '/radiology'
              : location.pathname.startsWith(n.path);
            return (
              <Button key={n.path} variant={active ? 'default' : 'ghost'} size="sm"
                className="justify-start gap-2 h-9 text-sm"
                onClick={() => { navigate(n.path); setCollapsed(false); }}>
                <Icon className="h-4 w-4" />{n.label}
              </Button>
            );
          })}
        </div>
      )}

      {/* Page content */}
      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
