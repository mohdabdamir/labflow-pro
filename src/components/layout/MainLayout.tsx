import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children?: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'ml-[68px]' : 'ml-64'
      )}>
        <Header title={title} />
        
        <main className="p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
