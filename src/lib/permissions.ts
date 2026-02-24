// lib/permissions.ts
export enum Module {
  DASHBOARD = 'dashboard',
  USERS = 'users',
  ROLES = 'roles',
  INVOICING = 'invoicing',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  AUDIT = 'audit',
  INTEGRATIONS = 'integrations'
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
  ASSIGN = 'assign'
}

// Permission matrix component
const PermissionMatrix: React.FC = () => {
  const modules = Object.values(Module);
  const actions = Object.values(Action);

  return (
    <Table
      title={() => 'Permission Matrix'}
      columns={[
        { title: 'Module', dataIndex: 'module' },
        ...actions.map(action => ({
          title: action.toUpperCase(),
          dataIndex: action,
          render: (allowed: boolean) => (
            <Checkbox checked={allowed} />
          )
        }))
      ]}
      dataSource={modules.map(module => ({
        module,
        ...Object.fromEntries(actions.map(action => [action, false]))
      }))}
    />
  );
};

// Role-based access control hook
export const usePermissions = () => {
  const { user } = useAuth();
  
  const hasPermission = (module: Module, action: Action): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Check user's permissions
    return user.permissions.some(
      p => p.module === module && p.actions.includes(action)
    );
  };
  
  const hasAnyPermission = (permissions: Array<[Module, Action]>): boolean => {
    return permissions.some(([module, action]) => hasPermission(module, action));
  };
  
  const hasAllPermissions = (permissions: Array<[Module, Action]>): boolean => {
    return permissions.every(([module, action]) => hasPermission(module, action));
  };
  
  return { hasPermission, hasAnyPermission, hasAllPermissions };
};

// Protected component wrapper
export const RequirePermission: React.FC<{
  module: Module;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ module, action, children, fallback = null }) => {
  const { hasPermission } = usePermissions();
  
  if (!hasPermission(module, action)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};