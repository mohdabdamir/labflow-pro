import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProfiles, useServices } from '@/hooks/useLabData';
import { DepartmentBadge } from '@/components/cases';
import type { Profile, Department } from '@/types/lab';
import { generateId } from '@/data/mockData';

const departments: Department[] = ['Hematology', 'Biochemistry', 'Microbiology', 'Immunology', 'Pathology', 'Urinalysis'];

export default function ProfilesPage() {
  const { profiles, addProfile, updateProfile, deleteProfile } = useProfiles();
  const { services } = useServices();
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState<Department | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    department: 'Biochemistry' as Department,
    tests: [] as string[],
    price: 0,
  });

  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      const matchesSearch = 
        profile.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = deptFilter === 'all' || profile.department === deptFilter;

      return matchesSearch && matchesDept;
    });
  }, [profiles, searchQuery, deptFilter]);

  const getTestNames = (testIds: string[]) => {
    return testIds.map(id => {
      const service = services.find(s => s.id === id);
      return service?.code || id;
    }).join(', ');
  };

  const handleOpenDialog = (profile?: Profile) => {
    if (profile) {
      setEditingProfile(profile);
      setFormData({
        code: profile.code,
        name: profile.name,
        description: profile.description || '',
        department: profile.department,
        tests: profile.tests,
        price: profile.price,
      });
    } else {
      setEditingProfile(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        department: 'Biochemistry',
        tests: [],
        price: 0,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingProfile) {
      updateProfile(editingProfile.id, formData);
    } else {
      const newProfile: Profile = {
        id: generateId('P'),
        ...formData,
        isActive: true,
      };
      addProfile(newProfile);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      deleteProfile(id);
    }
  };

  const handleTestToggle = (testId: string) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.includes(testId)
        ? prev.tests.filter(id => id !== testId)
        : [...prev.tests, testId]
    }));
  };

  const departmentServices = useMemo(() => {
    return services.filter(s => s.department === formData.department && s.isActive);
  }, [services, formData.department]);

  return (
    <MainLayout title="Test Profiles (Panels)">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v as Department | 'all')}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Profile
          </Button>
        </div>

        {/* Profiles Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Profile Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Tests Included</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id} className={!profile.isActive ? 'opacity-50' : ''}>
                    <TableCell className="font-mono font-medium">{profile.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{profile.name}</p>
                        {profile.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{profile.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DepartmentBadge department={profile.department} size="sm" />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {getTestNames(profile.tests)}
                        </p>
                        <p className="text-xs text-primary">{profile.tests.length} tests</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${profile.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium ${profile.isActive ? 'text-result-normal' : 'text-muted-foreground'}`}>
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(profile)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(profile.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProfiles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No profiles found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProfile ? 'Edit Profile' : 'Add New Profile'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Profile Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., LFT"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(v) => setFormData({ ...formData, department: v as Department, tests: [] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Profile Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Liver Function Test"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this profile"
                />
              </div>
              <div className="space-y-2">
                <Label>Select Tests</Label>
                <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
                  {departmentServices.length > 0 ? (
                    departmentServices.map(service => (
                      <div key={service.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={service.id}
                          checked={formData.tests.includes(service.id)}
                          onCheckedChange={() => handleTestToggle(service.id)}
                        />
                        <label
                          htmlFor={service.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          <span className="font-mono text-xs text-muted-foreground mr-2">{service.code}</span>
                          {service.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tests available for this department.</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{formData.tests.length} tests selected</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Profile Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingProfile ? 'Save Changes' : 'Add Profile'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
