import React, { useState } from 'react';
import { Plus, Trash2, Check, X, ArrowUp, ArrowDown, ShieldAlert } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SearchableSelect } from '@/components/ap/SearchableSelect';
import {
  useAPConfig, TEMPLATE_FIELDS, MASTER_LABELS, AP_ACTIONS, AP_ROLES,
  type APTemplateField, type APMasterKey, type APAction,
} from '@/hooks/useAPConfig';
import { useUsers } from '@/hooks/useLabData';

export default function APSettings() {
  const { config, can, update, newId } = useAPConfig();
  const canT = can('manageTemplates'), canM = can('manageMasters'), canA = can('approvePhysician');
  const isAdmin = can('manageTemplates') && can('manageMasters') && can('approvePhysician') && can('finalizeReport');
  const pending = config.requests.filter(r => r.status === 'pending').length;

  if (!canT && !canM && !canA) {
    return <div className="p-10 text-center text-muted-foreground"><ShieldAlert className="mx-auto h-10 w-10 mb-2" />You don't have access to AP settings.</div>;
  }
  const first = canT ? 'templates' : canM ? 'masters' : 'approvals';
  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto w-full min-w-0">
      <h1 className="text-2xl font-bold text-foreground">Anatomic Pathology Settings</h1>
      <Tabs defaultValue={first}>
        <TabsList className="flex-wrap h-auto">
          {canT && <TabsTrigger value="templates">Templates</TabsTrigger>}
          {canM && <TabsTrigger value="masters">Masters</TabsTrigger>}
          {canM && <TabsTrigger value="clients">Clients & Physicians</TabsTrigger>}
          {canA && <TabsTrigger value="approvals">Physician Approvals {pending > 0 && <Badge className="ml-1.5 h-5 px-1.5">{pending}</Badge>}</TabsTrigger>}
          {isAdmin && <TabsTrigger value="perms">Permissions</TabsTrigger>}
        </TabsList>
        {canT && <TabsContent value="templates"><TemplatesTab /></TabsContent>}
        {canM && <TabsContent value="masters"><MastersTab /></TabsContent>}
        {canM && <TabsContent value="clients"><ClientsTab /></TabsContent>}
        {canA && <TabsContent value="approvals"><ApprovalsTab /></TabsContent>}
        {isAdmin && <TabsContent value="perms"><PermsTab /></TabsContent>}
      </Tabs>
    </div>
  );

  function TemplatesTab() {
    const [field, setField] = useState<APTemplateField | 'all'>('all');
    const [q, setQ] = useState('');
    const [edit, setEdit] = useState<{ id?: string; field: APTemplateField; name: string; body: string } | null>(null);
    const list = config.templates.filter(t => (field === 'all' || t.field === field) && t.name.toLowerCase().includes(q.toLowerCase()));
    const save = () => {
      if (!edit || !edit.name.trim() || !edit.body.trim()) return;
      update(s => ({ ...s, templates: edit.id
        ? s.templates.map(t => t.id === edit.id ? { ...t, ...edit, id: t.id } : t)
        : [...s.templates, { id: newId(), field: edit.field, name: edit.name, body: edit.body, active: true }] }));
      setEdit(null);
    };
    return (
      <div className="grid md:grid-cols-[minmax(0,1fr)_380px] gap-4 mt-3">
        <Card><CardContent className="pt-4 space-y-3">
          <div className="flex gap-2">
            <div className="w-56"><SearchableSelect value={field} onChange={v => setField(v as APTemplateField | 'all')}
              options={[{ value: 'all', label: 'All fields' }, ...TEMPLATE_FIELDS.map(f => ({ value: f.key, label: f.label }))]} /></div>
            <Input placeholder="Search name..." value={q} onChange={e => setQ(e.target.value)} />
            <Button onClick={() => setEdit({ field: field === 'all' ? 'clinicalHistory' : field, name: '', body: '' })}><Plus className="h-4 w-4 mr-1" />New</Button>
          </div>
          <div className="divide-y border rounded-md max-h-[520px] overflow-auto">
            {list.map(t => (
              <div key={t.id} className="p-2.5 flex items-start gap-3 hover:bg-muted/40 cursor-pointer" onClick={() => setEdit({ ...t })}>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{t.name} <Badge variant="outline" className="ml-1 text-[10px]">{TEMPLATE_FIELDS.find(f => f.key === t.field)?.label}</Badge></div>
                  <div className="text-xs text-muted-foreground truncate">{t.body}</div>
                </div>
                <Switch checked={t.active} onClick={e => e.stopPropagation()} onCheckedChange={v => update(s => ({ ...s, templates: s.templates.map(x => x.id === t.id ? { ...x, active: v } : x) }))} />
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={e => { e.stopPropagation(); update(s => ({ ...s, templates: s.templates.filter(x => x.id !== t.id) })); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            {!list.length && <div className="p-6 text-center text-sm text-muted-foreground">No templates.</div>}
          </div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">{edit?.id ? 'Edit template' : edit ? 'New template' : 'Select or create a template'}</CardTitle></CardHeader>
          {edit && <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Field</Label>
              <SearchableSelect value={edit.field} onChange={v => setEdit({ ...edit, field: v as APTemplateField })} options={TEMPLATE_FIELDS.map(f => ({ value: f.key, label: f.label }))} /></div>
            <div className="space-y-1"><Label>Name</Label><Input value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} /></div>
            <div className="space-y-1"><Label>Body text</Label><Textarea rows={8} value={edit.body} onChange={e => setEdit({ ...edit, body: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save</Button></div>
          </CardContent>}
        </Card>
      </div>
    );
  }

  function MastersTab() {
    const [key, setKey] = useState<APMasterKey>('caseTypes');
    const [val, setVal] = useState('');
    const items = config.masters[key];
    const setItems = (fn: (a: typeof items) => typeof items) => update(s => ({ ...s, masters: { ...s.masters, [key]: fn(s.masters[key]) } }));
    const move = (i: number, d: number) => setItems(a => { const b = [...a]; const j = i + d; if (j < 0 || j >= b.length) return a; [b[i], b[j]] = [b[j], b[i]]; return b; });
    return (
      <Card className="mt-3"><CardContent className="pt-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MASTER_LABELS) as APMasterKey[]).map(k => (
            <Button key={k} size="sm" variant={k === key ? 'default' : 'outline'} onClick={() => setKey(k)}>{MASTER_LABELS[k]}</Button>
          ))}
        </div>
        <div className="flex gap-2 max-w-md">
          <Input placeholder={`New ${MASTER_LABELS[key].toLowerCase().slice(0, -1)}...`} value={val} onChange={e => setVal(e.target.value)} />
          <Button onClick={() => { if (val.trim()) { setItems(a => [...a, { id: newId(), value: val.trim(), active: true }]); setVal(''); } }}><Plus className="h-4 w-4" /></Button>
        </div>
        <div className="border rounded-md divide-y max-w-2xl">
          {items.map((it, i) => (
            <div key={it.id} className="flex items-center gap-2 p-2">
              <Input className="h-8" value={it.value} onChange={e => setItems(a => a.map(x => x.id === it.id ? { ...x, value: e.target.value } : x))} />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(i, -1)}><ArrowUp className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(i, 1)}><ArrowDown className="h-4 w-4" /></Button>
              <Switch checked={it.active} onCheckedChange={v => setItems(a => a.map(x => x.id === it.id ? { ...x, active: v } : x))} />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setItems(a => a.filter(x => x.id !== it.id))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent></Card>
    );
  }

  function ClientsTab() {
    const [cid, setCid] = useState(config.clients[0]?.id ?? '');
    const [nc, setNc] = useState('');
    const client = config.clients.find(c => c.id === cid);
    const setClient = (fn: (c: NonNullable<typeof client>) => NonNullable<typeof client>) =>
      update(s => ({ ...s, clients: s.clients.map(c => c.id === cid ? fn(c) : c) }));
    return (
      <Card className="mt-3"><CardContent className="pt-4 space-y-3">
        <div className="flex gap-2 flex-wrap">
          <div className="w-72"><SearchableSelect value={cid} onChange={setCid} options={config.clients.map(c => ({ value: c.id, label: c.name, hint: c.type }))} /></div>
          <Input className="w-64" placeholder="New client name" value={nc} onChange={e => setNc(e.target.value)} />
          <Button variant="outline" onClick={() => { if (!nc.trim()) return; const id = newId(); update(s => ({ ...s, clients: [...s.clients, { id, name: nc.trim(), type: 'B2B', active: true, physicians: [] }] })); setCid(id); setNc(''); }}><Plus className="h-4 w-4 mr-1" />Add client</Button>
        </div>
        {client && <>
          <div className="flex items-center gap-3 text-sm">
            <Label>Type</Label>
            <Button size="sm" variant={client.type === 'B2B' ? 'default' : 'outline'} onClick={() => setClient(c => ({ ...c, type: 'B2B' }))}>B2B</Button>
            <Button size="sm" variant={client.type === 'B2C' ? 'default' : 'outline'} onClick={() => setClient(c => ({ ...c, type: 'B2C' }))}>B2C</Button>
            <Label className="ml-4">Active</Label><Switch checked={client.active} onCheckedChange={v => setClient(c => ({ ...c, active: v }))} />
          </div>
          <div className="border rounded-md divide-y">
            <div className="grid grid-cols-[1fr_1fr_1fr_90px_40px] gap-2 p-2 text-xs font-medium text-muted-foreground"><span>Name</span><span>Mobile</span><span>Email</span><span>Status</span><span /></div>
            {client.physicians.map(p => (
              <div key={p.id} className="grid grid-cols-[1fr_1fr_1fr_90px_40px] gap-2 p-2 items-center">
                {(['name', 'mobile', 'email'] as const).map(k => (
                  <Input key={k} className="h-8 text-xs" value={p[k]} onChange={e => setClient(c => ({ ...c, physicians: c.physicians.map(x => x.id === p.id ? { ...x, [k]: e.target.value } : x) }))} />
                ))}
                {p.pending ? <Badge variant="outline">Pending</Badge> : <Badge variant="secondary">Approved</Badge>}
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setClient(c => ({ ...c, physicians: c.physicians.filter(x => x.id !== p.id) }))}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
            <div className="p-2"><Button size="sm" variant="ghost" onClick={() => setClient(c => ({ ...c, physicians: [...c.physicians, { id: newId(), name: 'Dr. ', mobile: '', email: '' }] }))}><Plus className="h-4 w-4 mr-1" />Add physician</Button></div>
          </div>
        </>}
      </CardContent></Card>
    );
  }

  function ApprovalsTab() {
    const { toast } = useToast();
    const [reasons, setReasons] = useState<Record<string, string>>({});
    const { currentUser } = useAPConfig();
    const decide = (rid: string, ok: boolean) => {
      const r = config.requests.find(x => x.id === rid);
      if (!r) return;
      if (!ok && !reasons[rid]?.trim()) { toast({ title: 'Reason required', description: 'Enter why the request is rejected.', variant: 'destructive' }); return; }
      update(s => ({
        ...s,
        requests: s.requests.map(x => x.id === rid ? { ...x, status: ok ? 'approved' : 'rejected', decidedBy: currentUser?.fullName, decidedAt: new Date().toISOString(), reason: reasons[rid] } : x),
        clients: s.clients.map(c => c.id !== r.clientId ? c : {
          ...c, physicians: ok ? c.physicians.map(p => p.id === rid ? { ...p, pending: false } : p) : c.physicians.filter(p => p.id !== rid),
        }),
      }));
      toast({ title: ok ? 'Physician approved' : 'Request rejected', description: r.name });
    };
    const sorted = [...config.requests].sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1) || b.requestedAt.localeCompare(a.requestedAt));
    return (
      <Card className="mt-3"><CardContent className="pt-4">
        {!sorted.length && <div className="p-8 text-center text-sm text-muted-foreground">No physician requests yet.</div>}
        <div className="divide-y">
          {sorted.map(r => (
            <div key={r.id} className="py-3 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[240px]">
                <div className="font-medium">{r.name} <span className="text-xs text-muted-foreground">· {r.clientName}</span></div>
                <div className="text-xs text-muted-foreground">{r.mobile} · {r.email} · requested by {r.requestedBy} on {new Date(r.requestedAt).toLocaleString()}</div>
                {r.status !== 'pending' && <div className="text-xs text-muted-foreground">{r.status} by {r.decidedBy}{r.reason ? ` — ${r.reason}` : ''}</div>}
              </div>
              {r.status === 'pending' ? <>
                <Input className="w-56 h-8 text-xs" placeholder="Reason (required to reject)" value={reasons[r.id] ?? ''} onChange={e => setReasons({ ...reasons, [r.id]: e.target.value })} />
                <Button size="sm" onClick={() => decide(r.id, true)}><Check className="h-4 w-4 mr-1" />Approve</Button>
                <Button size="sm" variant="outline" onClick={() => decide(r.id, false)}><X className="h-4 w-4 mr-1" />Reject</Button>
              </> : <Badge variant={r.status === 'approved' ? 'secondary' : 'destructive'}>{r.status}</Badge>}
            </div>
          ))}
        </div>
      </CardContent></Card>
    );
  }

  function PermsTab() {
    const { users } = useUsers();
    const [uid, setUid] = useState('');
    const user = users.find(u => u.id === uid);
    const toggleRole = (role: string, a: APAction) => update(s => {
      const cur = s.rolePerms[role] ?? [];
      return { ...s, rolePerms: { ...s.rolePerms, [role]: cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a] } };
    });
    const userList = user ? (config.userPerms[user.id] ?? null) : null;
    const toggleUser = (a: APAction) => user && update(s => {
      const cur = s.userPerms[user.id] ?? s.rolePerms[user.role] ?? [];
      return { ...s, userPerms: { ...s.userPerms, [user.id]: cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a] } };
    });
    return (
      <div className="space-y-4 mt-3">
        <Card><CardHeader><CardTitle className="text-base">Role permissions</CardTitle></CardHeader><CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b"><th className="text-left p-2">Role</th>{AP_ACTIONS.map(a => <th key={a.key} className="p-2 text-xs font-medium text-muted-foreground">{a.label}</th>)}</tr></thead>
            <tbody>{AP_ROLES.map(r => (
              <tr key={r} className="border-b last:border-0">
                <td className="p-2 capitalize">{r.replace('_', ' ')}</td>
                {AP_ACTIONS.map(a => <td key={a.key} className="p-2 text-center">
                  <Checkbox disabled={r === 'admin'} checked={r === 'admin' || (config.rolePerms[r] ?? []).includes(a.key)} onCheckedChange={() => toggleRole(r, a.key)} />
                </td>)}
              </tr>
            ))}</tbody>
          </table>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Per-user override</CardTitle></CardHeader><CardContent className="space-y-3">
          <div className="w-80"><SearchableSelect value={uid} onChange={setUid} placeholder="Pick a user..." options={users.map(u => ({ value: u.id, label: u.fullName, hint: u.role }))} /></div>
          {user && user.role !== 'admin' && <>
            <div className="text-xs text-muted-foreground">{userList ? 'Custom permissions in use.' : `Inheriting from role "${user.role}".`}</div>
            <div className="flex flex-wrap gap-4">
              {AP_ACTIONS.map(a => (
                <label key={a.key} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={(userList ?? config.rolePerms[user.role] ?? []).includes(a.key)} onCheckedChange={() => toggleUser(a.key)} />{a.label}
                </label>
              ))}
            </div>
            {userList && <Button size="sm" variant="outline" onClick={() => update(s => { const u = { ...s.userPerms }; delete u[user.id]; return { ...s, userPerms: u }; })}>Reset to role defaults</Button>}
          </>}
          {user?.role === 'admin' && <div className="text-sm text-muted-foreground">Admins always have full access.</div>}
        </CardContent></Card>
      </div>
    );
  }
}
