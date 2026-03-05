// UserPermissionsMatrix — role-level permission management
import React, { useState, useEffect } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Module, Action, ROLE_PERMISSIONS } from '@/lib/permissions';
import type { UserRole } from '@/lib/permissions';

const ROLES: UserRole[] = ['admin', 'technician', 'pathologist', 'medical_director', 'receptionist', 'billing'];
const ACTIONS = [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT, Action.APPROVE, Action.ASSIGN];
const STORAGE_KEY = 'lis_role_permissions';

function loadPermissions(): Record<UserRole, Partial<Record<Module, Action[]>>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return ROLE_PERMISSIONS as Record<UserRole, Partial<Record<Module, Action[]>>>;
}

export function UserPermissionsMatrix() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>('technician');
  const [matrix, setMatrix] = useState<Record<UserRole, Partial<Record<Module, Action[]>>>>(loadPermissions);

  const toggle = (mod: Module, action: Action) => {
    setMatrix(prev => {
      const current = prev[selectedRole]?.[mod] ?? [];
      const has = current.includes(action);
      return {
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          [mod]: has ? current.filter(a => a !== action) : [...current, action],
        },
      };
    });
  };

  const isChecked = (mod: Module, action: Action) =>
    matrix[selectedRole]?.[mod]?.includes(action) ?? false;

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
      toast({ title: 'Permissions saved', description: `Role permissions for "${selectedRole}" updated.` });
    } catch {
      toast({ title: 'Save failed', variant: 'destructive' });
    }
  };

  const handleReset = () => {
    setMatrix(prev => ({ ...prev, [selectedRole]: ROLE_PERMISSIONS[selectedRole] }));
    toast({ title: 'Reset to defaults', description: `"${selectedRole}" permissions restored.` });
  };

  const roleLabel = (r: UserRole) => r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="space-y-4">
      {/* Role selector */}
      <div className="flex flex-wrap gap-2">
        {ROLES.map(role => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedRole === role
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {roleLabel(role)}
            {role === 'admin' && <Badge variant="outline" className="ml-1.5 text-[10px] px-1">Full</Badge>}
          </button>
        ))}
      </div>

      <Separator />

      {selectedRole === 'admin' ? (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
          Admin has <strong>unrestricted access</strong> to all modules and actions. Permissions cannot be restricted for this role.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Module</th>
                  {ACTIONS.map(a => (
                    <th key={a} className="px-3 py-3 font-medium text-muted-foreground capitalize text-center">{a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.values(Module).map((mod, i) => (
                  <tr key={mod} className={`border-b last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                    <td className="px-4 py-3 font-medium capitalize">{mod.replace('_', ' ')}</td>
                    {ACTIONS.map(action => (
                      <td key={action} className="px-3 py-3 text-center">
                        <Checkbox
                          checked={isChecked(mod, action)}
                          onCheckedChange={() => toggle(mod, action)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Role Permissions
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
