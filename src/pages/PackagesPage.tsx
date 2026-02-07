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
  Package
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePackages, useProfiles, useServices } from '@/hooks/useLabData';
import type { Package as PackageType } from '@/types/lab';
import { generateId } from '@/data/mockData';

export default function PackagesPage() {
  const { packages, addPackage, updatePackage, deletePackage } = usePackages();
  const { profiles } = useProfiles();
  const { services } = useServices();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    profiles: [] as string[],
    tests: [] as string[],
    price: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: '',
  });

  const filteredPackages = useMemo(() => {
    return packages.filter(pkg => 
      pkg.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [packages, searchQuery]);

  const getIncludedItems = (pkg: PackageType) => {
    const profileNames = pkg.profiles.map(id => {
      const profile = profiles.find(p => p.id === id);
      return profile?.code || id;
    });
    const testNames = pkg.tests.map(id => {
      const service = services.find(s => s.id === id);
      return service?.code || id;
    });
    return [...profileNames, ...testNames].join(', ');
  };

  const handleOpenDialog = (pkg?: PackageType) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        code: pkg.code,
        name: pkg.name,
        description: pkg.description || '',
        profiles: pkg.profiles,
        tests: pkg.tests,
        price: pkg.price,
        validFrom: pkg.validFrom.split('T')[0],
        validTo: pkg.validTo?.split('T')[0] || '',
      });
    } else {
      setEditingPackage(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        profiles: [],
        tests: [],
        price: 0,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPackage) {
      updatePackage(editingPackage.id, {
        ...formData,
        validTo: formData.validTo || undefined,
      });
    } else {
      const newPackage: PackageType = {
        id: generateId('PK'),
        ...formData,
        validTo: formData.validTo || undefined,
        isActive: true,
      };
      addPackage(newPackage);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      deletePackage(id);
    }
  };

  const handleProfileToggle = (profileId: string) => {
    setFormData(prev => ({
      ...prev,
      profiles: prev.profiles.includes(profileId)
        ? prev.profiles.filter(id => id !== profileId)
        : [...prev.profiles, profileId]
    }));
  };

  const handleTestToggle = (testId: string) => {
    setFormData(prev => ({
      ...prev,
      tests: prev.tests.includes(testId)
        ? prev.tests.filter(id => id !== testId)
        : [...prev.tests, testId]
    }));
  };

  const activeProfiles = profiles.filter(p => p.isActive);
  const activeServices = services.filter(s => s.isActive);

  return (
    <MainLayout title="Packages">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>

        {/* Packages Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Package Name</TableHead>
                  <TableHead>Included Items</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.map((pkg) => (
                  <TableRow key={pkg.id} className={!pkg.isActive ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-accent" />
                        <span className="font-mono font-medium">{pkg.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{pkg.name}</p>
                        {pkg.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{pkg.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {getIncludedItems(pkg)}
                        </p>
                        <p className="text-xs text-primary">
                          {pkg.profiles.length} profiles, {pkg.tests.length} tests
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p>From: {new Date(pkg.validFrom).toLocaleDateString()}</p>
                        {pkg.validTo && (
                          <p className="text-muted-foreground">To: {new Date(pkg.validTo).toLocaleDateString()}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      ${pkg.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium ${pkg.isActive ? 'text-result-normal' : 'text-muted-foreground'}`}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
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
                          <DropdownMenuItem onClick={() => handleOpenDialog(pkg)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(pkg.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPackages.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No packages found.
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
              <DialogTitle>{editingPackage ? 'Edit Package' : 'Add New Package'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Package Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., COMP-HEALTH"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Package Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Package Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Comprehensive Health Checkup"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTo">Valid To (optional)</Label>
                  <Input
                    id="validTo"
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Include Profiles</Label>
                <div className="border rounded-lg p-4 max-h-32 overflow-y-auto space-y-2">
                  {activeProfiles.map(profile => (
                    <div key={profile.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`profile-${profile.id}`}
                        checked={formData.profiles.includes(profile.id)}
                        onCheckedChange={() => handleProfileToggle(profile.id)}
                      />
                      <label htmlFor={`profile-${profile.id}`} className="text-sm cursor-pointer">
                        <span className="font-mono text-xs text-muted-foreground mr-2">{profile.code}</span>
                        {profile.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Include Individual Tests</Label>
                <div className="border rounded-lg p-4 max-h-32 overflow-y-auto space-y-2">
                  {activeServices.map(service => (
                    <div key={service.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`test-${service.id}`}
                        checked={formData.tests.includes(service.id)}
                        onCheckedChange={() => handleTestToggle(service.id)}
                      />
                      <label htmlFor={`test-${service.id}`} className="text-sm cursor-pointer">
                        <span className="font-mono text-xs text-muted-foreground mr-2">{service.code}</span>
                        {service.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingPackage ? 'Save Changes' : 'Add Package'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
