import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/hooks/useUserStore';
import { hasPageAccess } from '@/lib/permissions';
import type { UserRole } from '@/lib/permissions';

interface RouteGuardProps {
  path: string;
  children: React.ReactNode;
}

// Normalize /lab/* paths to base paths for permission checks
function normalizePathForGuard(path: string): string {
  if (path === '/lab') return '/';
  return path.replace(/^\/lab/, '');
}

export function RouteGuard({ path, children }: RouteGuardProps) {
  const { currentUser } = useUserStore();
  const navigate = useNavigate();

  const normalizedPath = normalizePathForGuard(path);

  if (!currentUser || !hasPageAccess(currentUser.role as UserRole, normalizedPath)) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-background">
        <div className="text-center space-y-6 p-8 max-w-md">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
            <ShieldOff className="h-10 w-10 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground mt-2">
              You don't have permission to access this page.
            </p>
            {currentUser && (
              <p className="text-sm text-muted-foreground mt-1">
                Signed in as <span className="font-medium text-foreground">{currentUser.fullName}</span>
                {' '}·{' '}
                <span className="capitalize">{currentUser.role.replace('_', ' ')}</span>
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <Button onClick={() => navigate('/lab')} className="gap-2">
              Go to Lab
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
