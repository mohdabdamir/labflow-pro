import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAPConfig, type APPhysician } from '@/hooks/useAPConfig';

export function NewPhysicianDialog({ open, onOpenChange, clientId, onCreated }: {
  open: boolean; onOpenChange: (o: boolean) => void; clientId: string; onCreated: (p: APPhysician) => void;
}) {
  const { config, can, update, newId, addPhysicianToClient, currentUser } = useAPConfig();
  const { toast } = useToast();
  const [f, setF] = useState({ name: '', mobile: '', email: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const client = config.clients.find(c => c.id === clientId);

  const submit = () => {
    const e: Record<string, string> = {};
    if (f.name.trim().length < 3) e.name = 'Enter the full name';
    if (!/^\+?[\d\s-]{7,15}$/.test(f.mobile.trim())) e.mobile = 'Enter a valid mobile number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email';
    setErr(e);
    if (Object.keys(e).length || !client) return;
    const name = f.name.trim().startsWith('Dr') ? f.name.trim() : `Dr. ${f.name.trim()}`;
    const pid = newId();
    if (can('approvePhysician')) {
      const p = { id: pid, name, mobile: f.mobile.trim(), email: f.email.trim() };
      addPhysicianToClient(client.id, p);
      toast({ title: 'Physician added', description: `${name} added to ${client.name}.` });
      onCreated(p);
    } else {
      const p = { id: pid, name, mobile: f.mobile.trim(), email: f.email.trim(), pending: true };
      update(s => ({ ...s, requests: [...s.requests, {
        id: pid, clientId: client.id, clientName: client.name, name, mobile: p.mobile, email: p.email,
        requestedBy: currentUser?.fullName ?? 'Unknown', requestedAt: new Date().toISOString(), status: 'pending',
      }] }));
      addPhysicianToClient(client.id, p);
      toast({ title: 'Sent for approval', description: `${name} can be used now and is marked pending approval.` });
      onCreated(p);
    }
    setF({ name: '', mobile: '', email: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Physician</DialogTitle>
          <DialogDescription>For {client?.name ?? 'selected client'}. {can('approvePhysician') ? 'Will be added immediately.' : 'Will be sent to an approver.'}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {(['name', 'mobile', 'email'] as const).map(k => (
            <div key={k} className="space-y-1">
              <Label className="capitalize">{k} <span className="text-destructive">*</span></Label>
              <Input value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })}
                placeholder={k === 'name' ? 'Dr. Full Name' : k === 'mobile' ? '+973 3xxx xxxx' : 'doctor@clinic.com'} />
              {err[k] && <p className="text-xs text-destructive">{err[k]}</p>}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{can('approvePhysician') ? 'Add Physician' : 'Send for Approval'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
