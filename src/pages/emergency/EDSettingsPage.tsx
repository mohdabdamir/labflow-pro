import React, { useState } from 'react';
import { useEmergencyData } from '@/hooks/useEmergencyData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, RotateCcw, Server, Shield, Clock, HeartPulse } from 'lucide-react';

export default function EDSettingsPage() {
  const { resetData } = useEmergencyData();
  const { toast } = useToast();

  const [ctasTargets, setCtasTargets] = useState({ 1: 0, 2: 15, 3: 30, 4: 60, 5: 120 });
  const [sirsThresholds, setSirsThresholds] = useState({ hr: 90, rr: 20, tempHigh: 38, tempLow: 36, wbcHigh: 12, wbcLow: 4, lactate: 2.0 });

  return (
    <div className="p-4 space-y-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Settings className="h-6 w-6" /> ED Configuration</h1>
        <p className="text-sm text-muted-foreground">CTAS targets, SIRS thresholds, zone definitions, FHIR endpoints</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> CTAS Wait-Time Targets (minutes)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {([1, 2, 3, 4, 5] as const).map(level => (
              <div key={level} className="flex items-center gap-3">
                <Label className="text-xs w-16">ESI {level}</Label>
                <Input type="number" value={ctasTargets[level]} onChange={e => setCtasTargets(t => ({ ...t, [level]: +e.target.value }))} className="h-8 text-sm w-24" />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            ))}
            <Button size="sm" variant="outline" className="mt-2" onClick={() => toast({ title: 'CTAS targets saved' })}>Save Targets</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><HeartPulse className="h-4 w-4" /> SIRS Criteria Thresholds</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'HR >', key: 'hr' }, { label: 'RR >', key: 'rr' },
              { label: 'Temp High >', key: 'tempHigh' }, { label: 'Temp Low <', key: 'tempLow' },
              { label: 'WBC High >', key: 'wbcHigh' }, { label: 'WBC Low <', key: 'wbcLow' },
              { label: 'Lactate >', key: 'lactate' },
            ].map(t => (
              <div key={t.key} className="flex items-center gap-3">
                <Label className="text-xs w-24">{t.label}</Label>
                <Input type="number" step="0.1" value={(sirsThresholds as any)[t.key]} onChange={e => setSirsThresholds(s => ({ ...s, [t.key]: +e.target.value }))} className="h-8 text-sm w-24" />
              </div>
            ))}
            <Button size="sm" variant="outline" className="mt-2" onClick={() => toast({ title: 'SIRS thresholds saved' })}>Save Thresholds</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Server className="h-4 w-4" /> FHIR / HL7 Endpoints (Simulated)</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'HIE FHIR Server', url: 'https://hie.example.org/fhir/r4' },
              { label: 'Lab Results Feed', url: 'wss://lab.internal/stream' },
              { label: 'ADT Event Bus', url: 'kafka://events.internal:9092/ed-adt' },
            ].map((ep, i) => (
              <div key={i} className="flex items-center gap-2">
                <Label className="text-xs w-32 shrink-0">{ep.label}</Label>
                <Input value={ep.url} readOnly className="h-8 text-xs font-mono" />
                <Badge variant="secondary" className="text-[9px] shrink-0">Simulated</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4" /> Data Management</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Reset all ED data to initial mock state. This clears patients, alerts, and handover tasks.</p>
            <Button variant="destructive" size="sm" className="gap-1" onClick={() => { resetData(); toast({ title: 'ED data reset to defaults' }); }}>
              <RotateCcw className="h-3 w-3" /> Reset All ED Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
