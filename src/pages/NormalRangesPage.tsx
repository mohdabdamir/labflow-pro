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
import { useNormalRanges, useServices } from '@/hooks/useLabData';
import type { NormalRange, Gender, AgeUnit } from '@/types/lab';
import { generateId } from '@/data/mockData';
import { cn } from '@/lib/utils';

const genders: Gender[] = ['All', 'Male', 'Female'];
const ageUnits: AgeUnit[] = ['days', 'months', 'years'];

export default function NormalRangesPage() {
  const { normalRanges, addNormalRange, updateNormalRange, deleteNormalRange } = useNormalRanges();
  const { services } = useServices();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRange, setEditingRange] = useState<NormalRange | null>(null);

  const [formData, setFormData] = useState({
    serviceId: '',
    gender: 'All' as Gender,
    ageMin: undefined as number | undefined,
    ageMax: undefined as number | undefined,
    ageUnit: 'years' as AgeUnit,
    normalLow: 0,
    normalHigh: 0,
    criticalLow: undefined as number | undefined,
    criticalHigh: undefined as number | undefined,
    unit: '',
  });

  const filteredRanges = useMemo(() => {
    return normalRanges.filter(range => {
      const service = services.find(s => s.id === range.serviceId);
      return service?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             service?.code.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [normalRanges, services, searchQuery]);

  const getServiceInfo = (serviceId: string) => {
    return services.find(s => s.id === serviceId);
  };

  const handleOpenDialog = (range?: NormalRange) => {
    if (range) {
      setEditingRange(range);
      setFormData({
        serviceId: range.serviceId,
        gender: range.gender,
        ageMin: range.ageMin,
        ageMax: range.ageMax,
        ageUnit: range.ageUnit || 'years',
        normalLow: range.normalLow,
        normalHigh: range.normalHigh,
        criticalLow: range.criticalLow,
        criticalHigh: range.criticalHigh,
        unit: range.unit,
      });
    } else {
      setEditingRange(null);
      setFormData({
        serviceId: '',
        gender: 'All',
        ageMin: undefined,
        ageMax: undefined,
        ageUnit: 'years',
        normalLow: 0,
        normalHigh: 0,
        criticalLow: undefined,
        criticalHigh: undefined,
        unit: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    const data = {
      ...formData,
      ageMin: formData.ageMin || undefined,
      ageMax: formData.ageMax || undefined,
      criticalLow: formData.criticalLow || undefined,
      criticalHigh: formData.criticalHigh || undefined,
    };

    if (editingRange) {
      updateNormalRange(editingRange.id, data);
    } else {
      const newRange: NormalRange = {
        id: generateId('NR'),
        ...data,
      };
      addNormalRange(newRange);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this normal range?')) {
      deleteNormalRange(id);
    }
  };

  const activeServices = services.filter(s => s.isActive);

  return (
    <MainLayout title="Normal Ranges">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by test name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Normal Range
          </Button>
        </div>

        {/* Normal Ranges Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Age Range</TableHead>
                  <TableHead>Normal Range</TableHead>
                  <TableHead>Critical Range</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRanges.map((range) => {
                  const service = getServiceInfo(range.serviceId);
                  return (
                    <TableRow key={range.id}>
                      <TableCell>
                        <div>
                          <p className="font-mono text-sm font-medium">{service?.code || range.serviceId}</p>
                          <p className="text-xs text-muted-foreground">{service?.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded',
                          range.gender === 'Male' && 'bg-primary/10 text-primary',
                          range.gender === 'Female' && 'bg-status-reported/10 text-status-reported',
                          range.gender === 'All' && 'bg-muted text-muted-foreground'
                        )}>
                          {range.gender}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {range.ageMin !== undefined || range.ageMax !== undefined ? (
                          <span>
                            {range.ageMin ?? '0'} - {range.ageMax ?? '∞'} {range.ageUnit}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">All ages</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-result-normal">
                          {range.normalLow} - {range.normalHigh}
                        </span>
                      </TableCell>
                      <TableCell>
                        {range.criticalLow !== undefined || range.criticalHigh !== undefined ? (
                          <span className="font-medium text-result-critical">
                            &lt;{range.criticalLow ?? '-'} / &gt;{range.criticalHigh ?? '-'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{range.unit}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(range)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(range.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredRanges.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No normal ranges found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRange ? 'Edit Normal Range' : 'Add New Normal Range'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="service">Test/Service</Label>
                <Select 
                  value={formData.serviceId} 
                  onValueChange={(v) => {
                    const service = services.find(s => s.id === v);
                    setFormData({ 
                      ...formData, 
                      serviceId: v,
                      unit: service?.unit || formData.unit
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a test" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeServices.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        <span className="font-mono text-xs mr-2">{service.code}</span>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={formData.gender} 
                    onValueChange={(v) => setFormData({ ...formData, gender: v as Gender })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g., mg/dL"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageMin">Age Min</Label>
                  <Input
                    id="ageMin"
                    type="number"
                    value={formData.ageMin ?? ''}
                    onChange={(e) => setFormData({ ...formData, ageMin: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageMax">Age Max</Label>
                  <Input
                    id="ageMax"
                    type="number"
                    value={formData.ageMax ?? ''}
                    onChange={(e) => setFormData({ ...formData, ageMax: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageUnit">Age Unit</Label>
                  <Select 
                    value={formData.ageUnit} 
                    onValueChange={(v) => setFormData({ ...formData, ageUnit: v as AgeUnit })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ageUnits.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="normalLow">Normal Low</Label>
                  <Input
                    id="normalLow"
                    type="number"
                    step="any"
                    value={formData.normalLow}
                    onChange={(e) => setFormData({ ...formData, normalLow: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="normalHigh">Normal High</Label>
                  <Input
                    id="normalHigh"
                    type="number"
                    step="any"
                    value={formData.normalHigh}
                    onChange={(e) => setFormData({ ...formData, normalHigh: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="criticalLow">Critical Low (optional)</Label>
                  <Input
                    id="criticalLow"
                    type="number"
                    step="any"
                    value={formData.criticalLow ?? ''}
                    onChange={(e) => setFormData({ ...formData, criticalLow: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="criticalHigh">Critical High (optional)</Label>
                  <Input
                    id="criticalHigh"
                    type="number"
                    step="any"
                    value={formData.criticalHigh ?? ''}
                    onChange={(e) => setFormData({ ...formData, criticalHigh: e.target.value ? parseFloat(e.target.value) : undefined })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!formData.serviceId}>
                {editingRange ? 'Save Changes' : 'Add Range'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
