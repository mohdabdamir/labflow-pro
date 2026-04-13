import React, { useState, useEffect } from 'react';
import { useEmergencyData } from '@/hooks/useEmergencyData';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  Ambulance, AlertTriangle, WifiOff, Wifi,
  Plus, Shield, Radio, RefreshCw,
} from 'lucide-react';

const MCI_COLORS = {
  green: { label: 'GREEN — Minor', bg: 'bg-green-500', text: 'text-white', border: 'border-green-500' },
  yellow: { label: 'YELLOW — Delayed', bg: 'bg-yellow-500', text: 'text-black', border: 'border-yellow-500' },
  red: { label: 'RED — Immediate', bg: 'bg-red-600', text: 'text-white', border: 'border-red-600' },
  black: { label: 'BLACK — Deceased', bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-900' },
};

export default function MCIPage() {
  const { mciActive, mciPatients, activateMCI, deactivateMCI, registerMCIPatient, offlineMode, offlineQueue, toggleOfflineMode, syncOfflineQueue } = useEmergencyData();
  const { toast } = useToast();
  const [form, setForm] = useState({ color: 'green' as keyof typeof MCI_COLORS, complaint: '', notes: '' });

  // Hotkey: Ctrl+Alt+M
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        if (!mciActive) { activateMCI(); toast({ title: '🚨 MCI Protocol ACTIVATED', variant: 'destructive' }); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mciActive, activateMCI, toast]);

  const handleRegister = () => {
    if (!form.complaint) return;
    const p = registerMCIPatient(form.color, form.complaint, undefined, form.notes);
    toast({ title: `Registered ${p.mciTag}` });
    setForm({ color: 'green', complaint: '', notes: '' });
  };

  const grouped = {
    red: mciPatients.filter(p => p.triageColor === 'red'),
    yellow: mciPatients.filter(p => p.triageColor === 'yellow'),
    green: mciPatients.filter(p => p.triageColor === 'green'),
    black: mciPatients.filter(p => p.triageColor === 'black'),
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ambulance className="h-6 w-6 text-destructive" />
            Mass Casualty Incident (MCI)
          </h1>
          <p className="text-sm text-muted-foreground">Triage-only mode • No insurance verification • Standing trauma orders • Ctrl+Alt+M to activate</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={offlineMode ? 'destructive' : 'outline'} size="sm" className="gap-1" onClick={toggleOfflineMode}>
            {offlineMode ? <WifiOff className="h-3 w-3" /> : <Wifi className="h-3 w-3" />}
            {offlineMode ? 'Offline' : 'Online'}
          </Button>
          {!mciActive ? (
            <Button variant="destructive" size="sm" className="gap-1" onClick={() => { activateMCI(); toast({ title: '🚨 MCI Protocol ACTIVATED', variant: 'destructive' }); }}>
              <Shield className="h-3 w-3" /> Activate MCI Protocol
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-1" onClick={() => { deactivateMCI(); toast({ title: 'MCI Protocol deactivated' }); }}>
              Deactivate MCI
            </Button>
          )}
        </div>
      </div>

      {/* Offline queue status */}
      {offlineMode && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Offline Mode Active</p>
                <p className="text-xs text-muted-foreground">{offlineQueue.length} events queued for sync</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => { syncOfflineQueue(); toast({ title: `${offlineQueue.length} events synced` }); }} disabled={offlineQueue.length === 0}>
              <RefreshCw className="h-3 w-3" /> Force Sync
            </Button>
          </CardContent>
        </Card>
      )}

      {!mciActive ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center space-y-4">
            <Ambulance className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
            <h2 className="text-xl font-semibold text-muted-foreground">MCI Protocol Inactive</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">Ctrl + Alt + M</kbd> or click "Activate MCI Protocol" to enter mass casualty triage mode.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* MCI Banner */}
          <div className="bg-destructive text-destructive-foreground p-4 rounded-lg flex items-center gap-3 animate-pulse">
            <AlertTriangle className="h-8 w-8" />
            <div>
              <h2 className="text-lg font-bold">🚨 MCI PROTOCOL ACTIVE</h2>
              <p className="text-sm opacity-80">Insurance verification SUSPENDED • Standing trauma panel orders ENABLED • Triage-only registration</p>
            </div>
            <Badge className="ml-auto bg-white text-destructive text-sm">{mciPatients.length} Registered</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Quick register */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4" /> Rapid Triage Registration</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Triage Color *</Label>
                  <Select value={form.color} onValueChange={v => setForm(f => ({ ...f, color: v as any }))}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(MCI_COLORS).map(([key, cfg]) => (
                        <SelectItem key={key} value={key}><span className={cn('font-bold', key === 'green' ? 'text-green-600' : key === 'yellow' ? 'text-yellow-600' : key === 'red' ? 'text-red-600' : 'text-gray-600')}>{cfg.label}</span></SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Chief Complaint *</Label>
                  <Input value={form.complaint} onChange={e => setForm(f => ({ ...f, complaint: e.target.value }))} placeholder="Brief injury description" className="h-8 text-sm" />
                </div>
                <div>
                  <Label className="text-xs">Notes</Label>
                  <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="text-sm" placeholder="Location, mechanism..." />
                </div>
                <Button className="w-full" onClick={handleRegister} disabled={!form.complaint}>
                  Register MCI Patient
                </Button>
              </CardContent>
            </Card>

            {/* MCI Patient Board */}
            <div className="lg:col-span-2 space-y-3">
              {(['red', 'yellow', 'green', 'black'] as const).map(color => {
                const cfg = MCI_COLORS[color];
                const pts = grouped[color];
                return (
                  <Card key={color} className={cn(pts.length > 0 && `border-l-4 ${cfg.border}`)}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <span className={cn('px-2 py-0.5 rounded text-xs font-bold', cfg.bg, cfg.text)}>{cfg.label}</span>
                        <Badge variant="secondary" className="text-[10px]">{pts.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {pts.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No patients</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {pts.map(p => (
                            <div key={p.id} className="border rounded p-2 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={cn('font-bold px-1.5 py-0.5 rounded', cfg.bg, cfg.text)}>{p.mciTag}</span>
                                <span className="text-muted-foreground">{new Date(p.registeredAt).toLocaleTimeString()}</span>
                              </div>
                              <p>{p.chiefComplaint}</p>
                              {p.notes && <p className="text-muted-foreground">{p.notes}</p>}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
