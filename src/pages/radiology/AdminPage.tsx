import React, { useState } from 'react';
import { RADIOLOGISTS, TECHNICIANS, REPORT_TEMPLATES } from '@/data/radiologyMockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Settings, User, Keyboard, FileText, Palette, Save, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme/ThemeProvider';

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
            <p className="text-sm text-muted-foreground">Admin settings for PACS viewer, reporting, and users.</p>
          </div>
          <Button onClick={handleSave} className="gap-2" size="sm">
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="preferences">
          <TabsList className="mb-4">
            <TabsTrigger value="preferences" className="gap-1.5 text-xs"><Settings className="h-3.5 w-3.5" />Preferences</TabsTrigger>
            <TabsTrigger value="protocols" className="gap-1.5 text-xs"><Palette className="h-3.5 w-3.5" />Hanging Protocols</TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Templates</TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs"><User className="h-3.5 w-3.5" />Users & Roles</TabsTrigger>
            <TabsTrigger value="shortcuts" className="gap-1.5 text-xs"><Keyboard className="h-3.5 w-3.5" />Shortcuts</TabsTrigger>
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
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
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
                        {['Radiologist', 'Technician', 'Referring Physician', 'Admin'].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
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
        </Tabs>
      </div>
    </div>
  );
}
