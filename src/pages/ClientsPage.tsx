import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, Search, MoreHorizontal, Edit, Trash2, Building2, User, Home
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClients } from '@/hooks/useLabData';
import type { Client, ClientType } from '@/types/lab';
import { generateId } from '@/data/mockData';
import { cn } from '@/lib/utils';

const clientTypes: ClientType[] = ['B2C', 'B2B'];

const clientTypeIcons: Record<ClientType, React.ComponentType<{ className?: string }>> = {
  B2C: User,
  B2B: Building2,
};

export default function ClientsPage() {
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ClientType | 'all'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'B2B' as ClientType,
    email: '',
    phone: '',
    address: '',
    city: '',
    creditLimit: 0,
  });

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = 
        client.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.email?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'all' || client.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [clients, searchQuery, typeFilter]);

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        code: client.code,
        name: client.name,
        type: client.type,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        city: client.city || '',
        creditLimit: client.creditLimit || 0,
      });
    } else {
      setEditingClient(null);
      setFormData({ code: '', name: '', type: 'B2B', email: '', phone: '', address: '', city: '', creditLimit: 0 });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingClient) {
      updateClient(editingClient.id, formData);
    } else {
      const newClient: Client = {
        id: generateId('C'),
        ...formData,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      addClient(newClient);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this client?')) deleteClient(id);
  };

  return (
    <MainLayout title="Clients">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by code, name, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ClientType | 'all')}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {clientTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" /> Add Client</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card><CardContent className="pt-4 pb-3"><p className="text-xs text-muted-foreground">Total Clients</p><p className="text-2xl font-bold">{clients.length}</p></CardContent></Card>
          {clientTypes.map(type => {
            const Icon = clientTypeIcons[type];
            const count = clients.filter(c => c.type === type).length;
            return (
              <Card key={type}><CardContent className="pt-4 pb-3"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-muted-foreground" /><p className="text-xs text-muted-foreground">{type}</p></div><p className="text-2xl font-bold">{count}</p></CardContent></Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead><TableHead>Name</TableHead><TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead><TableHead>Location</TableHead>
                  <TableHead className="text-right">Credit Limit</TableHead><TableHead>Status</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map(client => {
                  const TypeIcon = clientTypeIcons[client.type];
                  return (
                    <TableRow key={client.id} className={!client.isActive ? 'opacity-50' : ''}>
                      <TableCell className="font-mono font-medium">{client.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{client.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded',
                          client.type === 'B2C' ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        )}>
                          {client.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {client.email && <p>{client.email}</p>}
                          {client.phone && <p className="text-muted-foreground">{client.phone}</p>}
                          {!client.email && !client.phone && <span className="text-muted-foreground">-</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{client.city || client.address || '-'}</TableCell>
                      <TableCell className="text-right font-medium">{client.creditLimit ? `$${client.creditLimit.toLocaleString()}` : '-'}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-medium ${client.isActive ? 'text-status-completed' : 'text-muted-foreground'}`}>
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(client)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(client.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredClients.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No clients found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Client Code</Label>
                  <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} placeholder="e.g., CITYHSP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as ClientType })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{clientTypes.map(type => (<SelectItem key={type} value={type}>{type}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name or organization name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="address">Address</Label><Input id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="creditLimit">Credit Limit ($)</Label><Input id="creditLimit" type="number" value={formData.creditLimit} onChange={(e) => setFormData({ ...formData, creditLimit: parseInt(e.target.value) || 0 })} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingClient ? 'Save Changes' : 'Add Client'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
