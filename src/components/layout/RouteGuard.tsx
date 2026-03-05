import React from 'react';
import { ShieldOff } from 'lucide-react';
import { useUserStore } from '@/hooks/useUserStore';
import { hasPageAccess } from '@/lib/permissions';
import type { UserRole } from '@/lib/permissions';

interface RouteGuardProps {
  path: string;
  children: React.ReactNode;
}

export function RouteGuard({ path, children }: RouteGuardProps) {
  const { currentUser } = useUserStore();

  if (!currentUser || !hasPageAccess(currentUser.role as UserRole, path)) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center space-y-4 p-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldOff className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">403 – Access Denied</h2>
            <p className="text-muted-foreground mt-2">
              You don't have permission to view this page.
            </p>
            {currentUser && (
              <p className="text-sm text-muted-foreground mt-1">
                Logged in as <span className="font-medium">{currentUser.fullName}</span> ({currentUser.role})
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
