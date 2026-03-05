// lib/permissions.ts — Pure TypeScript permission engine
import React from 'react';
import { useUserStore } from '@/hooks/useUserStore';

export enum Module {
  DASHBOARD = 'dashboard',
  CASES = 'cases',
  USERS = 'users',
  BILLING = 'billing',
  SERVICES = 'services',
  PROFILES = 'profiles',
  PACKAGES = 'packages',
  CLIENTS = 'clients',
  PRICE_LISTS = 'pricelists',
  NORMAL_RANGES = 'normalranges',
  SETTINGS = 'settings',
  REPORTS = 'reports',
  AUDIT = 'audit',
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
  IMPORT = 'import',
  APPROVE = 'approve',
  REJECT = 'reject',
  ASSIGN = 'assign',
}

export type UserRole = 'admin' | 'technician' | 'pathologist' | 'medical_director' | 'receptionist' | 'billing';

// Route → allowed roles map
const PAGE_ACCESS: Record<string, UserRole[]> = {
  '/': ['admin', 'technician', 'pathologist', 'medical_director', 'receptionist', 'billing'],
  '/cases': ['admin', 'receptionist', 'technician', 'pathologist', 'medical_director'],
  '/billing': ['admin', 'billing'],
  '/users': ['admin'],
  '/services': ['admin', 'medical_director'],
  '/profiles': ['admin', 'medical_director'],
  '/packages': ['admin', 'medical_director'],
  '/clients': ['admin', 'medical_director'],
  '/pricelists': ['admin', 'medical_director'],
  '/normalranges': ['admin', 'medical_director'],
  '/settings': ['admin'],
};

// Default role permissions
export const ROLE_PERMISSIONS: Record<UserRole, Partial<Record<Module, Action[]>>> = {
  admin: {
    [Module.DASHBOARD]: [Action.READ],
    [Module.CASES]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT],
    [Module.USERS]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
    [Module.BILLING]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT],
    [Module.SERVICES]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
    [Module.PROFILES]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
    [Module.PACKAGES]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
    [Module.CLIENTS]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
    [Module.PRICE_LISTS]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
    [Module.NORMAL_RANGES]: [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE],
    [Module.SETTINGS]: [Action.READ, Action.UPDATE],
    [Module.REPORTS]: [Action.CREATE, Action.READ, Action.EXPORT],
    [Module.AUDIT]: [Action.READ],
  },
  technician: {
    [Module.DASHBOARD]: [Action.READ],
    [Module.CASES]: [Action.READ, Action.UPDATE],
    [Module.SERVICES]: [Action.READ],
    [Module.PROFILES]: [Action.READ],
    [Module.PACKAGES]: [Action.READ],
  },
  pathologist: {
    [Module.DASHBOARD]: [Action.READ],
    [Module.CASES]: [Action.READ, Action.UPDATE, Action.APPROVE],
    [Module.SERVICES]: [Action.READ],
    [Module.PROFILES]: [Action.READ],
    [Module.PACKAGES]: [Action.READ],
    [Module.REPORTS]: [Action.CREATE, Action.READ],
  },
  medical_director: {
    [Module.DASHBOARD]: [Action.READ],
    [Module.CASES]: [Action.READ, Action.UPDATE, Action.APPROVE, Action.EXPORT],
    [Module.SERVICES]: [Action.CREATE, Action.READ, Action.UPDATE],
    [Module.PROFILES]: [Action.CREATE, Action.READ, Action.UPDATE],
    [Module.PACKAGES]: [Action.CREATE, Action.READ, Action.UPDATE],
    [Module.CLIENTS]: [Action.READ, Action.UPDATE],
    [Module.PRICE_LISTS]: [Action.READ, Action.UPDATE],
    [Module.NORMAL_RANGES]: [Action.CREATE, Action.READ, Action.UPDATE],
    [Module.REPORTS]: [Action.CREATE, Action.READ, Action.EXPORT],
  },
  receptionist: {
    [Module.DASHBOARD]: [Action.READ],
    [Module.CASES]: [Action.CREATE, Action.READ, Action.UPDATE],
    [Module.CLIENTS]: [Action.READ],
    [Module.SERVICES]: [Action.READ],
  },
  billing: {
    [Module.DASHBOARD]: [Action.READ],
    [Module.BILLING]: [Action.CREATE, Action.READ, Action.UPDATE, Action.EXPORT],
    [Module.CASES]: [Action.READ],
    [Module.CLIENTS]: [Action.READ],
    [Module.REPORTS]: [Action.READ, Action.EXPORT],
  },
};

export function hasPageAccess(role: UserRole, path: string): boolean {
  const cleanPath = path.split('?')[0].split('#')[0];
  const allowed = PAGE_ACCESS[cleanPath];
  if (!allowed) return role === 'admin';
  return allowed.includes(role);
}

export function hasPermission(
  role: UserRole,
  module: Module,
  action: Action,
  customPermissions?: Partial<Record<Module, Action[]>>
): boolean {
  if (role === 'admin') return true;
  if (customPermissions?.[module]) {
    return customPermissions[module]!.includes(action);
  }
  const rolePerms = ROLE_PERMISSIONS[role];
  return rolePerms[module]?.includes(action) ?? false;
}

// React hook
export function usePermissions() {
  const { currentUser } = useUserStore();

  const check = (module: Module, action: Action): boolean => {
    if (!currentUser) return false;
    return hasPermission(
      currentUser.role as UserRole,
      module,
      action,
      currentUser.permissions as Partial<Record<Module, Action[]>>
    );
  };

  const hasAny = (checks: Array<[Module, Action]>): boolean =>
    checks.some(([m, a]) => check(m, a));

  const hasAll = (checks: Array<[Module, Action]>): boolean =>
    checks.every(([m, a]) => check(m, a));

  return { hasPermission: check, hasAnyPermission: hasAny, hasAllPermissions: hasAll };
}

// RequirePermission wrapper component (no JSX — .ts file)
export const RequirePermission: React.FC<{
  module: Module;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ module, action, children, fallback = null }) => {
  const { hasPermission: check } = usePermissions();
  if (!check(module, action)) return React.createElement(React.Fragment, null, fallback);
  return React.createElement(React.Fragment, null, children);
};
