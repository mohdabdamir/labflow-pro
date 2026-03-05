// Full Users Management Page — admin only
import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  UserPlus, Search, MoreHorizontal, Pencil, PowerOff, Power,
  KeyRound, Shield, Users, CheckCircle, XCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUsers } from '@/hooks/useLabData';
import { UserFormDialog } from '@/components/users/UserFormDialog';
import { UserPermissionsMatrix } from '@/components/users/UserPermissionsMatrix';
import type { User } from '@/types/lab';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-destructive/10 text-destructive',
  technician: 'bg-blue-500/10 text-blue-600',
  pathologist: 'bg-purple-500/10 text-purple-600',
  medical_director: 'bg-primary/10 text-primary',
  receptionist: 'bg-green-500/10 text-green-600',
  billing: 'bg-yellow-500/10 text-yellow-600',
};

function roleLabel(role: string) {
  return role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function UsersPage() {
  const { users, addUser, updateUser } = useUsers();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const matchSearch = !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.department ?? '').toLowerCase().includes(q);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' ? u.isActive : !u.isActive);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    inactive: users.filter(u => !u.isActive).length,
  }), [users]);

  const handleSave = (data: Partial<User>) => {
    if (data.id) {
      updateUser(data.id, data);
      toast({ title: 'User updated', description: `${data.fullName} has been updated.` });
    } else {
      const newUser: User = {
        id: `U${Date.now()}`,
        username: data.username ?? '',
        fullName: data.fullName ?? '',
        role: data.role ?? 'technician',
        isActive: data.isActive ?? true,
        department: data.department as any,
        email: data.email,
        phone: data.phone,
        jobTitle: data.jobTitle,
        permissions: data.permissions ?? {},
      };
      addUser(newUser);
      toast({ title: 'User created', description: `${newUser.fullName} has been added.` });
    }
  };

  const toggleActive = (user: User) => {
    updateUser(user.id, { isActive: !user.isActive });
    toast({
      title: user.isActive ? 'User deactivated' : 'User activated',
      description: `${user.fullName} is now ${user.isActive ? 'inactive' : 'active'}.`,
    });
  };

  const handleResetPassword = (user: User) => {
    // In a real system this would call an API; here we just confirm
    setResetTarget(null);
    toast({ title: 'Password reset', description: `Password for ${user.fullName} has been reset.` });
  };

  return (
    <MainLayout title="User Master">
      <div className="p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.total, icon: Users },
            { label: 'Active', value: stats.active, icon: CheckCircle },
            { label: 'Inactive', value: stats.inactive, icon: XCircle },
            { label: 'Admins', value: stats.admins, icon: Shield },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border bg-card p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />User List
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Shield className="h-4 w-4 mr-2" />Roles & Permissions
            </TabsTrigger>
          </TabsList>

          {/* USER LIST TAB */}
          <TabsContent value="users" className="space-y-4 mt-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex gap-2 flex-1 min-w-0">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {['admin', 'technician', 'pathologist', 'medical_director', 'receptionist', 'billing'].map(r => (
                      <SelectItem key={r} value={r}>{roleLabel(r)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="All status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => { setEditingUser(null); setDialogOpen(true); }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* Table */}
            <div className="rounded-lg border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead>Name</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                            {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-foreground">{user.fullName}</p>
                            {(user as any).email && (
                              <p className="text-xs text-muted-foreground">{(user as any).email}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{user.username}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_COLORS[user.role] ?? 'bg-muted text-muted-foreground'}`}>
                          {roleLabel(user.role)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.department ?? '—'}</TableCell>
                      <TableCell>
                        {user.isActive
                          ? <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-200">Active</Badge>
                          : <Badge variant="secondary">Inactive</Badge>
                        }
                      </TableCell>
                      <TableCell>
                        {Object.keys(user.permissions ?? {}).length > 0
                          ? <Badge variant="outline" className="text-xs">Custom</Badge>
                          : <span className="text-xs text-muted-foreground">Role default</span>
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingUser(user); setDialogOpen(true); }}>
                              <Pencil className="h-4 w-4 mr-2" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleActive(user)}>
                              {user.isActive
                                ? <><PowerOff className="h-4 w-4 mr-2" />Deactivate</>
                                : <><Power className="h-4 w-4 mr-2" />Activate</>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setResetTarget(user)}
                            >
                              <KeyRound className="h-4 w-4 mr-2" />Reset Password
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* PERMISSIONS TAB */}
          <TabsContent value="permissions" className="mt-4">
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4">
                <h3 className="font-semibold text-foreground">Role Permission Matrix</h3>
                <p className="text-sm text-muted-foreground">
                  Configure default permissions per role. Individual users can have custom overrides set in their profile.
                </p>
              </div>
              <UserPermissionsMatrix />
            </div>
          </TabsContent>
        </Tabs>

        {/* User Form Dialog */}
        <UserFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          user={editingUser}
          onSave={handleSave}
        />

        {/* Reset Password Confirmation */}
        <AlertDialog open={!!resetTarget} onOpenChange={v => !v && setResetTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Password</AlertDialogTitle>
              <AlertDialogDescription>
                Reset the password for <strong>{resetTarget?.fullName}</strong>? They will need to set a new password on next login.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => resetTarget && handleResetPassword(resetTarget)}>
                Reset Password
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
