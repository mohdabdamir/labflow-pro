import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Settings2, Plus, Pencil, Save } from 'lucide-react';
import type { Client } from '@/types/lab';
import type { InvoicePrefixConfig } from '@/types/billing';
import { toast } from 'sonner';

interface PrefixConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  b2bClients: Client[];
  prefixConfigs: InvoicePrefixConfig[];
  onSaveConfig: (config: InvoicePrefixConfig) => void;
}

export function PrefixConfigDialog({
  open, onOpenChange, b2bClients, prefixConfigs, onSaveConfig,
}: PrefixConfigDialogProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [prefix, setPrefix] = useState('');
  const [startSequence, setStartSequence] = useState(1);

  const configuredClientIds = new Set(prefixConfigs.map(p => p.clientId));
  const unconfiguredClients = b2bClients.filter(c => !configuredClientIds.has(c.id));

  const handleAdd = () => {
    if (!selectedClientId || !prefix.trim()) {
      toast.error('Client and prefix are required');
      return;
    }
    // Check prefix uniqueness
    if (prefixConfigs.some(p => p.prefix === prefix.trim().toUpperCase())) {
      toast.error('This prefix is already in use');
      return;
    }
    onSaveConfig({
      id: `PFX${Date.now()}`,
      clientId: selectedClientId,
      prefix: prefix.trim().toUpperCase(),
      currentSequence: startSequence,
      year: new Date().getFullYear(),
    });
    setAddMode(false);
    setSelectedClientId('');
    setPrefix('');
    setStartSequence(1);
    toast.success('Prefix configured');
  };

  const handleEdit = (config: InvoicePrefixConfig) => {
    setEditingId(config.id);
    setPrefix(config.prefix);
  };

  const handleSaveEdit = (config: InvoicePrefixConfig) => {
    if (!prefix.trim()) { toast.error('Prefix is required'); return; }
    if (prefixConfigs.some(p => p.prefix === prefix.trim().toUpperCase() && p.id !== config.id)) {
      toast.error('This prefix is already in use');
      return;
    }
    onSaveConfig({ ...config, prefix: prefix.trim().toUpperCase() });
    setEditingId(null);
    setPrefix('');
    toast.success('Prefix updated');
  };

  const getClientName = (clientId: string) =>
    b2bClients.find(c => c.id === clientId)?.name || 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            B2B Invoice Prefix Configuration
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {prefixConfigs.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Client</TableHead>
                    <TableHead className="text-xs">Prefix</TableHead>
                    <TableHead className="text-xs">Next Number</TableHead>
                    <TableHead className="text-xs w-20">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prefixConfigs.map(cfg => (
                    <TableRow key={cfg.id}>
                      <TableCell className="text-sm">{getClientName(cfg.clientId)}</TableCell>
                      <TableCell>
                        {editingId === cfg.id ? (
                          <Input value={prefix} onChange={e => setPrefix(e.target.value)}
                            className="h-7 w-24 text-xs font-mono uppercase" />
                        ) : (
                          <Badge variant="outline" className="font-mono">{cfg.prefix}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {cfg.prefix}-{cfg.year}-{String(cfg.currentSequence).padStart(4, '0')}
                      </TableCell>
                      <TableCell>
                        {editingId === cfg.id ? (
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleSaveEdit(cfg)}>
                            <Save className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(cfg)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {addMode ? (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Client</Label>
                    <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                      <SelectTrigger className="mt-1 h-8 text-xs">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {unconfiguredClients.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Prefix</Label>
                    <Input value={prefix} onChange={e => setPrefix(e.target.value)}
                      placeholder="e.g. ABC" className="mt-1 h-8 text-xs font-mono uppercase" />
                  </div>
                  <div>
                    <Label className="text-xs">Start Seq</Label>
                    <Input type="number" min={1} value={startSequence}
                      onChange={e => setStartSequence(parseInt(e.target.value) || 1)}
                      className="mt-1 h-8 text-xs" />
                  </div>
                </div>
                {selectedClientId && prefix && (
                  <p className="text-xs text-muted-foreground">
                    Preview: <span className="font-mono font-medium">{prefix.toUpperCase()}-{new Date().getFullYear()}-{String(startSequence).padStart(4, '0')}</span>
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAdd}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => { setAddMode(false); setPrefix(''); setSelectedClientId(''); }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            unconfiguredClients.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setAddMode(true)}>
                <Plus className="h-4 w-4 mr-2" /> Add Prefix
              </Button>
            )
          )}

          {prefixConfigs.length === 0 && !addMode && (
            <div className="text-center py-6 text-muted-foreground">
              <Settings2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No prefixes configured. Add a prefix for each B2B client.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
