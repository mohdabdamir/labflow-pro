import React, { useState } from 'react';
import { RADIOLOGISTS, TECHNICIANS, REPORT_TEMPLATES } from '@/data/radiologyMockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Settings, User, Keyboard, FileText, Palette, Save, Check, Network,
  Plus, RefreshCw, Loader2, CheckCircle2, XCircle, Wifi, WifiOff,
  ChevronDown, ChevronRight, AlertTriangle, Trash2, Edit2,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme/ThemeProvider';
import type { DicomNode } from '@/types/radiology';

// ─── Default data ─────────────────────────────────────────────────────────────
const DEFAULT_SHORTCUTS = [
  { action: 'Next Slice', key: '↓ / →' },
  { action: 'Prev Slice', key: '↑ / ←' },
  { action: 'Play/Pause Cine', key: 'Space' },
  { action: 'Full Screen', key: 'F' },
  { action: 'Window/Level Tool', key: 'W' },
  { action: 'Pan Tool', key: 'P' },
  { action: 'Zoom Tool', key: 'Z' },
  { action: 'Length Measure', key: 'L' },
  { action: 'Reset View', key: 'R' },
  { action: 'Next Series', key: 'N' },
];

const HANGING_PROTOCOLS = [
  { modality: 'CT Head', layout: '1×1', wl: 'Brain (W:80, L:40)' },
  { modality: 'CT Chest', layout: '1×2', wl: 'Lung (W:1500, L:-600)' },
  { modality: 'CT Abdomen', layout: '1×2', wl: 'Soft Tissue (W:400, L:50)' },
  { modality: 'MRI Brain', layout: '2×2', wl: 'Default' },
  { modality: 'X-Ray', layout: '1×1', wl: 'Default' },
  { modality: 'Mammography', layout: '1×2', wl: 'Default' },
];

const SEED_NODES: DicomNode[] = [
  { id: 'n1', name: 'CT Scanner 1', aeTitle: 'CT_SCAN_01', ip: '192.168.1.101', port: 104, modality: 'CT', type: 'SCU', status: 'Connected', lastPing: new Date().toISOString(), latencyMs: 12 },
  { id: 'n2', name: 'MRI Suite A', aeTitle: 'MR_SUITE_A', ip: '192.168.1.102', port: 104, modality: 'MR', type: 'SCU', status: 'Connected', lastPing: new Date().toISOString(), latencyMs: 8 },
  { id: 'n3', name: 'X-Ray Room 1', aeTitle: 'XR_ROOM_01', ip: '192.168.1.110', port: 104, modality: 'XR', type: 'SCU', status: 'Disconnected' },
  { id: 'n4', name: 'Ultrasound US1', aeTitle: 'US_UNIT_01', ip: '192.168.1.115', port: 104, modality: 'US', type: 'SCU', status: 'Disconnected' },
  { id: 'n5', name: 'Nuclear Medicine', aeTitle: 'NM_SCAN_01', ip: '192.168.1.120', port: 104, modality: 'NM', type: 'SCU', status: 'Error', errorMessage: 'Connection refused: port 104 unreachable', lastPing: new Date(Date.now() - 3600000).toISOString() },
  { id: 'n6', name: 'Modality Worklist', aeTitle: 'MWL_SERVER', ip: '192.168.1.200', port: 11112, modality: 'ALL', type: 'MWL', status: 'Connected', lastPing: new Date().toISOString(), latencyMs: 5 },
  { id: 'n7', name: 'PACS Archive', aeTitle: 'PACS_STORE', ip: '192.168.1.210', port: 11112, modality: 'ALL', type: 'SCP', status: 'Connected', lastPing: new Date().toISOString(), latencyMs: 18 },
  { id: 'n8', name: 'Fluoroscopy FL1', aeTitle: 'FL_UNIT_01', ip: '192.168.1.130', port: 104, modality: 'FL', type: 'SCU', status: 'Disconnected' },
];

interface DicomEvent {
  id: string;
  timestamp: string;
  nodeId: string;
  nodeName: string;
  type: 'info' | 'error' | 'warning' | 'success';
  message: string;
}

const SEED_EVENTS: DicomEvent[] = [
  { id: 'e1', timestamp: new Date(Date.now() - 120000).toISOString(), nodeId: 'n1', nodeName: 'CT Scanner 1', type: 'success', message: 'C-STORE received — AccessionNo: CT-20240315-001' },
  { id: 'e2', timestamp: new Date(Date.now() - 240000).toISOString(), nodeId: 'n5', nodeName: 'Nuclear Medicine', type: 'error', message: 'Association rejected by SCP — Reason: 1 (caller AE title not recognized)' },
  { id: 'e3', timestamp: new Date(Date.now() - 360000).toISOString(), nodeId: 'n6', nodeName: 'Modality Worklist', type: 'info', message: 'C-FIND response — 14 worklist items retrieved' },
  { id: 'e4', timestamp: new Date(Date.now() - 480000).toISOString(), nodeId: 'n7', nodeName: 'PACS Archive', type: 'success', message: 'C-MOVE completed — 128 instances stored' },
  { id: 'e5', timestamp: new Date(Date.now() - 600000).toISOString(), nodeId: 'n3', nodeName: 'X-Ray Room 1', type: 'warning', message: 'Echo timeout after 5000ms — node may be offline' },
];

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, latencyMs }: { status: DicomNode['status']; latencyMs?: number }) {
  if (status === 'Testing') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-400">
      <Loader2 className="h-3 w-3 animate-spin" /> Testing...
    </span>
  );
  if (status === 'Connected') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-500">
      <CheckCircle2 className="h-3 w-3" /> Connected
      {latencyMs !== undefined && <span className="text-muted-foreground ml-0.5">{latencyMs}ms</span>}
    </span>
  );
  if (status === 'Error') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive">
      <XCircle className="h-3 w-3" /> Error
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
      <WifiOff className="h-3 w-3" /> Disconnected
    </span>
  );
}

// ─── DICOM Tab ────────────────────────────────────────────────────────────────
function DicomTab() {
  const [nodes, setNodes] = useState<DicomNode[]>(SEED_NODES);
  const [events, setEvents] = useState<DicomEvent[]>(SEED_EVENTS);
  const [expandedError, setExpandedError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [testingAll, setTestingAll] = useState(false);
  const [newNode, setNewNode] = useState<Partial<DicomNode>>({
    name: '', aeTitle: '', ip: '', port: 104, modality: 'CT', type: 'SCU', status: 'Disconnected',
  });

  const addEvent = (nodeId: string, nodeName: string, type: DicomEvent['type'], message: string) => {
    const ev: DicomEvent = {
      id: `e${Date.now()}`,
      timestamp: new Date().toISOString(),
      nodeId, nodeName, type, message,
    };
    setEvents(prev => [ev, ...prev.slice(0, 49)]);
  };

  const testNode = (id: string) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'Testing' } : n));
    const node = nodes.find(n => n.id === id)!;
    addEvent(id, node.name, 'info', `C-ECHO SCU → ${node.aeTitle}@${node.ip}:${node.port}`);
    const delay = 1000 + Math.random() * 800;
    setTimeout(() => {
      const success = Math.random() > 0.25;
      const latency = Math.round(5 + Math.random() * 40);
      if (success) {
        setNodes(prev => prev.map(n => n.id === id
          ? { ...n, status: 'Connected', latencyMs: latency, lastPing: new Date().toISOString(), errorMessage: undefined }
          : n));
        addEvent(id, node.name, 'success', `C-ECHO successful — ${latency}ms response`);
        toast({ title: `${node.name} online`, description: `${latency}ms` });
      } else {
        const err = 'Association request rejected — no acceptable Presentation Contexts';
        setNodes(prev => prev.map(n => n.id === id
          ? { ...n, status: 'Error', errorMessage: err, lastPing: new Date().toISOString() }
          : n));
        addEvent(id, node.name, 'error', err);
        toast({ title: `${node.name} failed`, description: err, variant: 'destructive' });
      }
    }, delay);
  };

  const testAll = async () => {
    setTestingAll(true);
    for (const n of nodes) {
      testNode(n.id);
      await new Promise(r => setTimeout(r, 200));
    }
    setTimeout(() => setTestingAll(false), 3000);
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const addNode = () => {
    if (!newNode.name || !newNode.aeTitle || !newNode.ip) return;
    const n: DicomNode = {
      id: `n${Date.now()}`,
      name: newNode.name!,
      aeTitle: newNode.aeTitle!,
      ip: newNode.ip!,
      port: newNode.port ?? 104,
      modality: newNode.modality ?? 'CT',
      type: newNode.type as DicomNode['type'] ?? 'SCU',
      status: 'Disconnected',
    };
    setNodes(prev => [...prev, n]);
    setShowAddDialog(false);
    setNewNode({ name: '', aeTitle: '', ip: '', port: 104, modality: 'CT', type: 'SCU', status: 'Disconnected' });
    toast({ title: 'Modality added', description: `${n.name} (${n.aeTitle})` });
  };

  const connectedCount = nodes.filter(n => n.status === 'Connected').length;
  const errorCount = nodes.filter(n => n.status === 'Error').length;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Online', value: connectedCount, icon: Wifi, color: 'text-green-500' },
          { label: 'Offline', value: nodes.filter(n => n.status === 'Disconnected').length, icon: WifiOff, color: 'text-muted-foreground' },
          { label: 'Errors', value: errorCount, icon: AlertTriangle, color: 'text-destructive' },
        ].map(s => (
          <Card key={s.label} className="py-3">
            <CardContent className="p-0 px-4 flex items-center gap-3">
              <s.icon className={cn('h-5 w-5 shrink-0', s.color)} />
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Node table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Modality Connections</CardTitle>
              <CardDescription className="text-xs">{nodes.length} nodes configured</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                onClick={testAll} disabled={testingAll}>
                {testingAll ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                Test All
              </Button>
              <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setShowAddDialog(true)}>
                <Plus className="h-3 w-3" /> Add Modality
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Name', 'AE Title', 'IP : Port', 'Modality', 'Type', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nodes.map(node => (
                <React.Fragment key={node.id}>
                  <tr className={cn(
                    'border-b border-border/40 hover:bg-muted/30 transition-colors',
                    node.status === 'Error' && 'bg-destructive/5'
                  )}>
                    <td className="py-2 px-3 text-xs font-medium">{node.name}</td>
                    <td className="py-2 px-3 text-xs font-mono text-muted-foreground">{node.aeTitle}</td>
                    <td className="py-2 px-3 text-xs font-mono text-muted-foreground">{node.ip}:{node.port}</td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono">{node.modality}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={cn(
                        'text-[10px] px-1.5 py-0.5 rounded font-medium',
                        node.type === 'SCP' ? 'bg-blue-500/10 text-blue-400' :
                        node.type === 'MWL' ? 'bg-purple-500/10 text-purple-400' :
                        node.type === 'Store' ? 'bg-orange-500/10 text-orange-400' :
                        'bg-muted text-muted-foreground'
                      )}>{node.type}</span>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={node.status} latencyMs={node.latencyMs} />
                        {node.status === 'Error' && (
                          <button onClick={() => setExpandedError(expandedError === node.id ? null : node.id)}>
                            {expandedError === node.id
                              ? <ChevronDown className="h-3 w-3 text-muted-foreground" />
                              : <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="ghost" className="h-6 w-6"
                          onClick={() => testNode(node.id)}
                          disabled={node.status === 'Testing'}>
                          {node.status === 'Testing'
                            ? <Loader2 className="h-3 w-3 animate-spin" />
                            : <RefreshCw className="h-3 w-3" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive/70 hover:text-destructive"
                          onClick={() => deleteNode(node.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {/* Error expansion row */}
                  {expandedError === node.id && node.errorMessage && (
                    <tr className="bg-destructive/5 border-b border-border/40">
                      <td colSpan={7} className="px-4 py-2">
                        <div className="flex items-start gap-2">
                          <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs text-destructive font-mono">{node.errorMessage}</p>
                            {node.lastPing && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Last attempt: {new Date(node.lastPing).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Event log */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">DICOM Event Log</CardTitle>
            <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setEvents([])}>
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-56 overflow-y-auto scrollbar-thin">
            {events.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">No events recorded.</p>
            )}
            {events.map(ev => (
              <div key={ev.id} className="flex items-start gap-2 px-3 py-2 border-b border-border/40 hover:bg-muted/20">
                <span className={cn('h-2 w-2 rounded-full mt-1.5 shrink-0',
                  ev.type === 'success' ? 'bg-green-500' :
                  ev.type === 'error' ? 'bg-destructive' :
                  ev.type === 'warning' ? 'bg-orange-500' :
                  'bg-blue-400')} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-foreground">{ev.nodeName}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono truncate">{ev.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add modality dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Add Modality Node</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {[
              { label: 'Display Name', key: 'name', placeholder: 'CT Scanner 2' },
              { label: 'AE Title', key: 'aeTitle', placeholder: 'CT_SCAN_02' },
              { label: 'IP Address', key: 'ip', placeholder: '192.168.1.105' },
            ].map(f => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs font-medium">{f.label}</label>
                <Input
                  className="h-8 text-sm"
                  placeholder={f.placeholder}
                  value={(newNode as Record<string, string>)[f.key] ?? ''}
                  onChange={e => setNewNode(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Port</label>
                <Input
                  type="number"
                  className="h-8 text-sm"
                  value={newNode.port ?? 104}
                  onChange={e => setNewNode(p => ({ ...p, port: parseInt(e.target.value) }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Modality</label>
                <Select value={newNode.modality ?? 'CT'} onValueChange={v => setNewNode(p => ({ ...p, modality: v }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['CT', 'MR', 'XR', 'US', 'PET', 'NM', 'MG', 'FL', 'ALL'].map(m => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-medium">Connection Type</label>
                <Select value={newNode.type ?? 'SCU'} onValueChange={v => setNewNode(p => ({ ...p, type: v as DicomNode['type'] }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCU">SCU — Service Class User (sends images)</SelectItem>
                    <SelectItem value="SCP">SCP — Service Class Provider (receives images)</SelectItem>
                    <SelectItem value="MWL">MWL — Modality Worklist</SelectItem>
                    <SelectItem value="Store">Store — DICOM Storage SCP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={addNode}
              disabled={!newNode.name || !newNode.aeTitle || !newNode.ip}>
              Add Node
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const { theme, setTheme } = useTheme();
  const [role, setRole] = useState('Radiologist');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast({ title: 'Settings saved', description: 'Your preferences have been updated.' });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-56px)] overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Radiology Configuration</h2>
            <p className="text-sm text-muted-foreground">Admin settings for PACS viewer, reporting, and connectivity.</p>
          </div>
          <Button onClick={handleSave} className="gap-2" size="sm">
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="preferences">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="preferences" className="gap-1.5 text-xs"><Settings className="h-3.5 w-3.5" />Preferences</TabsTrigger>
            <TabsTrigger value="protocols" className="gap-1.5 text-xs"><Palette className="h-3.5 w-3.5" />Hanging Protocols</TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Templates</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs"><User className="h-3.5 w-3.5" />Users & Roles</TabsTrigger>
            <TabsTrigger value="shortcuts" className="gap-1.5 text-xs"><Keyboard className="h-3.5 w-3.5" />Shortcuts</TabsTrigger>
            <TabsTrigger value="dicom" className="gap-1.5 text-xs"><Network className="h-3.5 w-3.5" />DICOM</TabsTrigger>
          </TabsList>

          {/* Preferences */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Display Settings</CardTitle>
                <CardDescription className="text-xs">Customize the viewer appearance and defaults.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Theme</label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark (Recommended)</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Default Layout</label>
                    <Select defaultValue="1x1">
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['1×1', '1×2', '2×2', '1×3', '3×3'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Cine Default Speed</label>
                    <Select defaultValue="8">
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[4, 8, 12, 16, 24, 30].map(fps => <SelectItem key={fps} value={`${fps}`}>{fps} fps</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Default User Role</label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['Radiologist', 'Technician', 'Referring Physician', 'Admin'].map(r =>
                          <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Auto-advance to next study after signing', key: 'autoAdvance' },
                    { label: 'Show AI findings panel by default', key: 'showAI' },
                    { label: 'Enable measurement overlay on load', key: 'measurements' },
                    { label: 'Display DICOM tags overlay', key: 'dicomTags' },
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hanging Protocols */}
          <TabsContent value="protocols">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Default Hanging Protocols</CardTitle>
                <CardDescription className="text-xs">Configure auto-layout and window/level per study type.</CardDescription>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 text-xs font-semibold text-muted-foreground pb-3">Study Type</th>
                      <th className="text-left py-2 text-xs font-semibold text-muted-foreground pb-3">Layout</th>
                      <th className="text-left py-2 text-xs font-semibold text-muted-foreground pb-3">Default W/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HANGING_PROTOCOLS.map((p, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-2.5 text-xs font-medium">{p.modality}</td>
                        <td className="py-2.5">
                          <Select defaultValue={p.layout}>
                            <SelectTrigger className="h-7 w-24 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {['1×1', '1×2', '2×2'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-2.5">
                          <Select defaultValue={p.wl}>
                            <SelectTrigger className="h-7 w-44 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Default">Default</SelectItem>
                              <SelectItem value="Brain (W:80, L:40)">Brain</SelectItem>
                              <SelectItem value="Lung (W:1500, L:-600)">Lung</SelectItem>
                              <SelectItem value="Soft Tissue (W:400, L:50)">Soft Tissue</SelectItem>
                              <SelectItem value="Bone (W:1800, L:400)">Bone</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates" className="space-y-3">
            {REPORT_TEMPLATES.map(t => (
              <Card key={t.id}>
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{t.name}</CardTitle>
                    <div className="flex gap-1">
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 rounded">{t.modality}</span>
                      <span className="text-[10px] bg-muted text-muted-foreground px-1.5 rounded">{t.bodyPart}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Findings Template</label>
                    <Textarea defaultValue={t.content.findings} className="text-xs mt-1 min-h-[60px] font-mono" />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Impression Template</label>
                    <Textarea defaultValue={t.content.impression} className="text-xs mt-1 min-h-[40px] font-mono" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Radiology Staff</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Radiologists</p>
                  {RADIOLOGISTS.map(r => (
                    <div key={r} className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm">{r}</span>
                      <Select defaultValue="Radiologist">
                        <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Radiologist">Radiologist</SelectItem>
                          <SelectItem value="Fellow">Fellow</SelectItem>
                          <SelectItem value="Resident">Resident</SelectItem>
                          <SelectItem value="Admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <div className="pt-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Technicians</p>
                  {TECHNICIANS.map(t => (
                    <div key={t} className="flex items-center justify-between py-2 border-b border-border/50">
                      <span className="text-sm">{t}</span>
                      <Select defaultValue="Technician">
                        <SelectTrigger className="h-7 w-36 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technician">Technician</SelectItem>
                          <SelectItem value="Senior Tech">Senior Tech</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shortcuts */}
          <TabsContent value="shortcuts">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
                <CardDescription className="text-xs">These shortcuts are active in the study viewer.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEFAULT_SHORTCUTS.map(s => (
                    <div key={s.action} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                      <span className="text-xs text-muted-foreground">{s.action}</span>
                      <kbd className="text-[11px] font-mono bg-card border border-border rounded px-1.5 py-0.5">{s.key}</kbd>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DICOM */}
          <TabsContent value="dicom">
            <DicomTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
