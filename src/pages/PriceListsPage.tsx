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
import { usePriceLists } from '@/hooks/useLabData';
import type { PriceList } from '@/types/lab';
import { generateId } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function PriceListsPage() {
  const { priceLists, addPriceList, updatePriceList, deletePriceList } = usePriceLists();
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPriceList, setEditingPriceList] = useState<PriceList | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    discountPercent: 0,
    isDefault: false,
  });

  const filteredPriceLists = useMemo(() => {
    return priceLists.filter(pl => 
      pl.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pl.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [priceLists, searchQuery]);

  const handleOpenDialog = (priceList?: PriceList) => {
    if (priceList) {
      setEditingPriceList(priceList);
      setFormData({
        code: priceList.code,
        name: priceList.name,
        description: priceList.description || '',
        effectiveFrom: priceList.effectiveFrom.split('T')[0],
        effectiveTo: priceList.effectiveTo?.split('T')[0] || '',
        discountPercent: priceList.discountPercent,
        isDefault: priceList.isDefault,
      });
    } else {
      setEditingPriceList(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
        discountPercent: 0,
        isDefault: false,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingPriceList) {
      updatePriceList(editingPriceList.id, {
        ...formData,
        effectiveTo: formData.effectiveTo || undefined,
      });
    } else {
      const newPriceList: PriceList = {
        id: generateId('PL'),
        ...formData,
        effectiveTo: formData.effectiveTo || undefined,
        isActive: true,
      };
      addPriceList(newPriceList);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this price list?')) {
      deletePriceList(id);
    }
  };

  return (
    <MainLayout title="Price Lists">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search price lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Price List
          </Button>
        </div>

        {/* Price Lists Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Effective Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPriceLists.map((priceList) => (
                  <TableRow key={priceList.id} className={!priceList.isActive ? 'opacity-50' : ''}>
                    <TableCell className="font-mono font-medium">{priceList.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{priceList.name}</span>
                        {priceList.isDefault && (
                          <span className="px-1.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded">
                            Default
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {priceList.description || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'font-medium',
                        priceList.discountPercent > 0 ? 'text-result-normal' : 'text-muted-foreground'
                      )}>
                        {priceList.discountPercent}%
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p>From: {new Date(priceList.effectiveFrom).toLocaleDateString()}</p>
                        {priceList.effectiveTo && (
                          <p className="text-muted-foreground">
                            To: {new Date(priceList.effectiveTo).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium ${priceList.isActive ? 'text-result-normal' : 'text-muted-foreground'}`}>
                        {priceList.isActive ? 'Active' : 'Inactive'}
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
                          <DropdownMenuItem onClick={() => handleOpenDialog(priceList)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(priceList.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredPriceLists.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No price lists found.
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
              <DialogTitle>{editingPriceList ? 'Edit Price List' : 'Add New Price List'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., INST-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount %</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Institution 10% Discount"
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
                  <Label htmlFor="effectiveFrom">Effective From</Label>
                  <Input
                    id="effectiveFrom"
                    type="date"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="effectiveTo">Effective To (optional)</Label>
                  <Input
                    id="effectiveTo"
                    type="date"
                    value={formData.effectiveTo}
                    onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-input"
                />
                <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
                  Set as default price list
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>
                {editingPriceList ? 'Save Changes' : 'Add Price List'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
