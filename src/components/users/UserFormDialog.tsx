// UserFormDialog — full shadcn-based user create/edit form
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import type { User } from '@/types/lab';
import { Module, Action, ROLE_PERMISSIONS } from '@/lib/permissions';
import type { UserRole } from '@/lib/permissions';

const ROLES: UserRole[] = ['admin', 'technician', 'pathologist', 'medical_director', 'receptionist', 'billing'];
const DEPARTMENTS = ['Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Pathology', 'Urinalysis', 'Administration'];
const ACTIONS = [Action.CREATE, Action.READ, Action.UPDATE, Action.DELETE, Action.EXPORT, Action.APPROVE];

const schema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-z0-9_]+$/, 'Lowercase, numbers, underscores only'),
  email: z.string().email('Valid email required').optional().or(z.literal('')),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(['admin', 'technician', 'pathologist', 'medical_director', 'receptionist', 'billing']),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user?: User | null;
  onSave: (data: Partial<User>) => void;
}

export function UserFormDialog({ open, onOpenChange, user, onSave }: Props) {
  const isEdit = !!user;

  // Custom permissions state
  const [customPerms, setCustomPerms] = React.useState<Partial<Record<Module, Action[]>>>({});
  const [useCustomPerms, setUseCustomPerms] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      jobTitle: '',
      department: '',
      role: 'technician',
      isActive: true,
    },
  });

  const watchedRole = form.watch('role') as UserRole;

  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName,
        username: user.username,
        email: (user as any).email ?? '',
        phone: (user as any).phone ?? '',
        jobTitle: (user as any).jobTitle ?? '',
        department: user.department ?? '',
        role: user.role as UserRole,
        isActive: user.isActive,
      });
      setCustomPerms(user.permissions ?? {});
      setUseCustomPerms(Object.keys(user.permissions ?? {}).length > 0);
    } else {
      form.reset();
      setCustomPerms({});
      setUseCustomPerms(false);
    }
  }, [user, open]);

  const togglePerm = (module: Module, action: Action) => {
    setCustomPerms(prev => {
      const current = prev[module] ?? [];
      const has = current.includes(action);
      return {
        ...prev,
        [module]: has ? current.filter(a => a !== action) : [...current, action],
      };
    });
  };

  const isChecked = (module: Module, action: Action): boolean => {
    if (!useCustomPerms) {
      return ROLE_PERMISSIONS[watchedRole]?.[module]?.includes(action) ?? false;
    }
    return customPerms[module]?.includes(action) ?? false;
  };

  const handleSubmit = (values: FormValues) => {
    const permissions = useCustomPerms ? customPerms : {};
    onSave({
      ...user,
      ...values,
      permissions,
    } as Partial<User>);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-0">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl><Input placeholder="Dr. John Smith" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username *</FormLabel>
                      <FormControl><Input placeholder="jsmith" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="john@pathlab.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input placeholder="+1 555-0100" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="jobTitle" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl><Input placeholder="Senior Technician" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </TabsContent>

              {/* Account Tab */}
              <TabsContent value="account" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {ROLES.map(r => (
                            <SelectItem key={r} value={r}>
                              {r.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="department" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">— None —</SelectItem>
                          {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="isActive" render={({ field }) => (
                    <FormItem className="flex items-center gap-3 col-span-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">
                        Account {field.value ? <Badge variant="default" className="ml-1">Active</Badge> : <Badge variant="secondary" className="ml-1">Inactive</Badge>}
                      </FormLabel>
                    </FormItem>
                  )} />
                </div>
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions" className="pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Permission Overrides</p>
                    <p className="text-xs text-muted-foreground">
                      {useCustomPerms ? 'Custom permissions active' : `Inheriting from role: ${watchedRole}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Use custom</Label>
                    <Switch checked={useCustomPerms} onCheckedChange={v => {
                      setUseCustomPerms(v);
                      if (v) setCustomPerms(ROLE_PERMISSIONS[watchedRole] as Partial<Record<Module, Action[]>>);
                    }} />
                  </div>
                </div>
                <Separator />
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Module</th>
                        {ACTIONS.map(a => (
                          <th key={a} className="px-2 py-2 font-medium text-muted-foreground capitalize">{a}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.values(Module).map(mod => (
                        <tr key={mod} className="border-b last:border-0 hover:bg-muted/30">
                          <td className="py-2 pr-4 font-medium capitalize">{mod.replace('_', ' ')}</td>
                          {ACTIONS.map(action => (
                            <td key={action} className="px-2 py-2 text-center">
                              <Checkbox
                                checked={isChecked(mod, action)}
                                disabled={!useCustomPerms}
                                onCheckedChange={() => togglePerm(mod, action)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-6 border-t mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit">{isEdit ? 'Save Changes' : 'Create User'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
