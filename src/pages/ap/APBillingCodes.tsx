import React, { useState } from 'react';
import { useAPBillingCodes } from '@/hooks/useAPData';
import type { APBillingCode, APClientPrice } from '@/types/anatomicPathology';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, DollarSign, Building2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function APBillingCodes() {
  const { codes, addCode, updateCode, deleteCode, clientPrices, addClientPrice, deleteClientPrice } = useAPBillingCodes();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [editCode, setEditCode] = useState<APBillingCode | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<APBillingCode>>({});
  const [clientForm, setClientForm] = useState<Partial<APClientPrice>>({});
  const [clientDialogOpen, setClientDialogOpen] = useState(false);

  const filtered = codes.filter(c =>
    !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()) || c.category.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setForm({ isActive: true }); setEditCode(null); setDialogOpen(true); };
  const openEdit = (c: APBillingCode) => { setForm(c); setEditCode(c); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.code || !form.description || form.b2cPrice === undefined || form.b2bPrice === undefined) {
      toast({ title: 'Please fill in all required fields.', variant: 'destructive' }); return;
    }
    if (editCode) { updateCode(editCode.id, form); toast({ title: 'Billing code updated' }); }
    else { addCode({ ...form, id: genId(), code: form.code!, description: form.description!, category: form.category ?? 'General', b2cPrice: form.b2cPrice!, b2bPrice: form.b2bPrice!, isActive: true }); toast({ title: 'Billing code created' }); }
    setDialogOpen(false);
  };

  const handleAddClientPrice = () => {
    if (!clientForm.billingCodeId || !clientForm.clientName || clientForm.customPrice === undefined) return;
    addClientPrice({ ...clientForm, id: genId(), effectiveFrom: new Date().toISOString().slice(0, 10) } as APClientPrice);
    setClientForm({});
    setClientDialogOpen(false);
    toast({ title: 'Client price added' });
  };

  const uniqueCategories = [...new Set(codes.map(c => c.category))];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AP Billing Codes</h1>
          <p className="text-sm text-muted-foreground">Manage billing codes, B2C/B2B rates, and client-specific pricing</p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5"><Plus className="h-3.5 w-3.5" />New Code</Button>
      </div>

      <Tabs defaultValue="codes">
        <TabsList>
          <TabsTrigger value="codes">Master Codes</TabsTrigger>
          <TabsTrigger value="client">Client Pricing</TabsTrigger>
        </TabsList>

        <TabsContent value="codes" className="space-y-4 pt-4">
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search codes..." className="pl-9 h-9" />
            </div>
          </div>

          {uniqueCategories.map(cat => {
            const catCodes = filtered.filter(c => c.category === cat);
            if (!catCodes.length) return null;
            return (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{cat}</h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="bg-muted/40 border-b border-border text-xs text-muted-foreground"><th className="text-left px-4 py-2.5 font-medium">Code</th><th className="text-left px-4 py-2.5 font-medium">Description</th><th className="text-right px-4 py-2.5 font-medium">B2C Price</th><th className="text-right px-4 py-2.5 font-medium">B2B Price</th><th className="px-4 py-2.5 text-center font-medium">Active</th><th className="px-4 py-2.5" /></tr></thead>
                    <tbody className="divide-y divide-border">
                      {catCodes.map(c => (
                        <tr key={c.id} className="hover:bg-muted/20">
                          <td className="px-4 py-2.5 font-mono text-xs font-semibold text-primary">{c.code}</td>
                          <td className="px-4 py-2.5 text-foreground">{c.description}</td>
                          <td className="px-4 py-2.5 text-right text-foreground">BD {c.b2cPrice.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-right text-foreground">BD {c.b2bPrice.toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-center"><Switch checked={c.isActive} onCheckedChange={v => updateCode(c.id, { isActive: v })} /></td>
                          <td className="px-4 py-2.5"><div className="flex gap-1"><Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}><Edit className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { deleteCode(c.id); toast({ title: 'Deleted' }); }}><Trash2 className="h-3.5 w-3.5" /></Button></div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="client" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Override prices for specific clients</p>
            <Button size="sm" variant="outline" onClick={() => setClientDialogOpen(true)} className="gap-1.5"><Plus className="h-3.5 w-3.5" />Add Client Price</Button>
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/40 border-b border-border text-xs text-muted-foreground"><th className="text-left px-4 py-2.5 font-medium">Client</th><th className="text-left px-4 py-2.5 font-medium">Billing Code</th><th className="text-right px-4 py-2.5 font-medium">Custom Price</th><th className="text-left px-4 py-2.5 font-medium">Effective From</th><th className="px-4 py-2.5" /></tr></thead>
              <tbody className="divide-y divide-border">
                {clientPrices.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No client-specific prices configured.</td></tr>
                ) : clientPrices.map(p => {
                  const code = codes.find(c => c.id === p.billingCodeId);
                  return (
                    <tr key={p.id} className="hover:bg-muted/20">
                      <td className="px-4 py-2.5 text-foreground font-medium">{p.clientName}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-primary">{code?.code ?? p.billingCodeId}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-foreground">BD {p.customPrice.toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{p.effectiveFrom}</td>
                      <td className="px-4 py-2.5"><Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteClientPrice(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit/Add Code Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editCode ? 'Edit Billing Code' : 'New Billing Code'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[{l:'Code *',f:'code',ph:'e.g. AP-BIOPSY-1'},{l:'Description *',f:'description',ph:'Full description'},{l:'Category',f:'category',ph:'e.g. Histopathology'}].map(({l,f,ph}) => (
              <div key={f} className="space-y-1"><Label className="text-xs">{l}</Label><Input value={(form as Record<string,string|number|boolean|undefined>)[f] as string ?? ''} onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))} placeholder={ph} className="h-8 text-sm" /></div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-xs">B2C Price (BD) *</Label><Input type="number" value={form.b2cPrice ?? ''} onChange={e => setForm(p => ({ ...p, b2cPrice: parseFloat(e.target.value) }))} className="h-8 text-sm" /></div>
              <div className="space-y-1"><Label className="text-xs">B2B Price (BD) *</Label><Input type="number" value={form.b2bPrice ?? ''} onChange={e => setForm(p => ({ ...p, b2bPrice: parseFloat(e.target.value) }))} className="h-8 text-sm" /></div>
            </div>
            <Button onClick={handleSave} className="w-full">{editCode ? 'Update Code' : 'Create Code'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Price Dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Client-Specific Price</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label className="text-xs">Client Name</Label><Input value={clientForm.clientName ?? ''} onChange={e => setClientForm(p => ({ ...p, clientName: e.target.value }))} className="h-8 text-sm" /></div>
            <div className="space-y-1"><Label className="text-xs">Billing Code</Label>
              <select className="w-full h-8 text-sm border border-input rounded-md px-2 bg-background" value={clientForm.billingCodeId ?? ''} onChange={e => setClientForm(p => ({ ...p, billingCodeId: e.target.value }))}>
                <option value="">Select code...</option>
                {codes.map(c => <option key={c.id} value={c.id}>{c.code} — {c.description}</option>)}
              </select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Custom Price (BD)</Label><Input type="number" value={clientForm.customPrice ?? ''} onChange={e => setClientForm(p => ({ ...p, customPrice: parseFloat(e.target.value) }))} className="h-8 text-sm" /></div>
            <Button onClick={handleAddClientPrice} className="w-full">Add Price</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
