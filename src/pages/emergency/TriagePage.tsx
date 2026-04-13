import React, { useState, useMemo } from 'react';
import { useEmergencyData, suggestAcuity } from '@/hooks/useEmergencyData';
import { ACUITY_CONFIG, EDPatient, Vitals, FHIRHistoryItem } from '@/types/emergency';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle, FileText, Search, Clock, Brain,
  Heart, Activity, Thermometer,
} from 'lucide-react';

const SIMULATED_FHIR_HISTORY: Record<string, FHIRHistoryItem[]> = {
  'chest pain': [
    { date: '2025-11-15', type: 'EKG', description: '12-lead EKG - Normal sinus rhythm', provider: 'City Cardiology', result: 'NSR, no ST changes' },
    { date: '2025-08-22', type: 'Lab', description: 'Troponin I', provider: 'General Hospital', result: '0.01 ng/mL (Normal)' },
    { date: '2024-06-10', type: 'Procedure', description: 'Cardiac Catheterization', provider: 'Heart Center', result: '30% LAD stenosis, no intervention' },
    { date: '2024-03-15', type: 'Imaging', description: 'Stress Echo', provider: 'City Cardiology', result: 'Normal wall motion, EF 60%' },
  ],
  'headache': [
    { date: '2025-09-01', type: 'Imaging', description: 'CT Head w/o contrast', provider: 'General Hospital', result: 'No acute findings' },
    { date: '2025-05-20', type: 'Visit', description: 'Neurology consult', provider: 'Brain & Spine Clinic', result: 'Migraine with aura diagnosis' },
  ],
  'abdominal pain': [
    { date: '2025-10-05', type: 'Imaging', description: 'CT Abdomen/Pelvis', provider: 'General Hospital', result: 'Unremarkable' },
    { date: '2025-07-14', type: 'Lab', description: 'Lipase', provider: 'Urgent Care', result: '45 U/L (Normal)' },
  ],
};

function lookupFHIRHistory(complaint: string): FHIRHistoryItem[] {
  const c = complaint.toLowerCase();
  for (const [key, items] of Object.entries(SIMULATED_FHIR_HISTORY)) {
    if (c.includes(key)) return items;
  }
  return [];
}

export default function TriagePage() {
  const { addPatient, activePatients, physicians, nurses } = useEmergencyData();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: '', mrn: '', age: '', gender: 'M' as 'M' | 'F' | 'O', dob: '',
    chiefComplaint: '',
    hr: '', rr: '', sbp: '', dbp: '', temp: '', spo2: '', painScale: '', gcs: '',
    allergies: '', medications: '',
    assignedMD: '', assignedRN: '',
    notes: '',
  });
  const [selectedAcuity, setSelectedAcuity] = useState<number | null>(null);
  const [fhirHistory, setFhirHistory] = useState<FHIRHistoryItem[]>([]);
  const [fhirLoading, setFhirLoading] = useState(false);
  const [varianceOverride, setVarianceOverride] = useState(false);

  const vitalsObj: Vitals | undefined = useMemo(() => {
    if (!form.hr) return undefined;
    return {
      id: 'temp', timestamp: new Date(),
      hr: +form.hr, rr: +form.rr, sbp: +form.sbp, dbp: +form.dbp,
      temp: +form.temp, spo2: +form.spo2, painScale: +form.painScale,
      ...(form.gcs ? { gcs: +form.gcs } : {}),
    };
  }, [form]);

  const suggested = useMemo(() => {
    if (!form.chiefComplaint || !form.age) return null;
    return suggestAcuity(form.chiefComplaint, +form.age, vitalsObj);
  }, [form.chiefComplaint, form.age, vitalsObj]);

  const handleComplaintChange = (val: string) => {
    setForm(f => ({ ...f, chiefComplaint: val }));
    if (val.length > 5) {
      setFhirLoading(true);
      setTimeout(() => {
        setFhirHistory(lookupFHIRHistory(val));
        setFhirLoading(false);
      }, 800);
    } else {
      setFhirHistory([]);
    }
  };

  const handleAcuitySelect = (a: number) => {
    setSelectedAcuity(a);
    if (suggested !== null && a > suggested) {
      setVarianceOverride(true);
    } else {
      setVarianceOverride(false);
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.chiefComplaint || !selectedAcuity) {
      toast({ title: 'Missing required fields', variant: 'destructive' });
      return;
    }
    const patient: EDPatient = {
      id: `ED-${Date.now()}`, mrn: form.mrn || `MRN-${Date.now()}`,
      name: form.name, age: +form.age || 0, gender: form.gender, dob: form.dob,
      acuity: selectedAcuity as any, status: 'triage',
      zone: selectedAcuity <= 2 ? 'resuscitation' : selectedAcuity === 3 ? 'acute' : 'minor',
      arrivalTime: new Date(), triageTime: new Date(),
      assignedMD: form.assignedMD || undefined, assignedRN: form.assignedRN || undefined,
      chiefComplaint: form.chiefComplaint,
      triage: {
        chiefComplaint: form.chiefComplaint,
        suggestedAcuity: suggested || selectedAcuity as any,
        assignedAcuity: selectedAcuity as any,
        varianceOverride,
        vitals: vitalsObj || { id: 'v0', timestamp: new Date(), hr: 0, rr: 0, sbp: 0, dbp: 0, temp: 0, spo2: 0, painScale: 0 },
        allergies: form.allergies.split(',').map(a => a.trim()).filter(Boolean),
        medications: form.medications.split(',').map(m => m.trim()).filter(Boolean),
        notes: form.notes, triageNurse: form.assignedRN || 'Nurse',
        timestamp: new Date(), nlpHistory: fhirHistory,
      },
      vitals: vitalsObj ? [vitalsObj] : [],
      labs: [], orders: [],
      predictedDischargeScore: selectedAcuity >= 4 ? 80 : selectedAcuity === 3 ? 50 : 15,
      hasCriticalResult: false,
      isPediatric: +form.age < 18,
      insuranceVerified: false,
      allergies: form.allergies.split(',').map(a => a.trim()).filter(Boolean),
      events: [
        { id: `E-${Date.now()}`, patientId: `ED-${Date.now()}`, type: 'TRIAGE', description: `ESI ${selectedAcuity} assigned${varianceOverride ? ' (VARIANCE OVERRIDE)' : ''}`, timestamp: new Date() },
      ],
    };
    addPatient(patient);
    toast({ title: 'Patient triaged', description: `${form.name} — ESI ${selectedAcuity}` });
    setForm({ name: '', mrn: '', age: '', gender: 'M', dob: '', chiefComplaint: '', hr: '', rr: '', sbp: '', dbp: '', temp: '', spo2: '', painScale: '', gcs: '', allergies: '', medications: '', assignedMD: '', assignedRN: '', notes: '' });
    setSelectedAcuity(null);
    setFhirHistory([]);
    setVarianceOverride(false);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Triage & Intake</h1>
        <p className="text-sm text-muted-foreground">Zero-click data aggregation • NLP-assisted history pull</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Demographics */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Patient Demographics</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" className="h-8 text-sm" /></div>
              <div><Label className="text-xs">MRN</Label><Input value={form.mrn} onChange={e => setForm(f => ({ ...f, mrn: e.target.value }))} placeholder="Auto-gen" className="h-8 text-sm" /></div>
              <div><Label className="text-xs">Age *</Label><Input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} className="h-8 text-sm" /></div>
              <div>
                <Label className="text-xs">Gender</Label>
                <Select value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v as any }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="M">Male</SelectItem><SelectItem value="F">Female</SelectItem><SelectItem value="O">Other</SelectItem></SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Chief Complaint */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4" /> Chief Complaint (NLP-Enabled)</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                value={form.chiefComplaint}
                onChange={e => handleComplaintChange(e.target.value)}
                placeholder='Type complaint (e.g., "Chest pain radiating to left arm")...'
                className="text-sm"
                rows={2}
              />
              {fhirLoading && <p className="text-xs text-muted-foreground mt-2 animate-pulse">🔍 Querying HIE / FHIR records...</p>}
            </CardContent>
          </Card>

          {/* Vitals */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Vital Signs</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'HR (bpm)', key: 'hr', icon: Heart },
                { label: 'RR (/min)', key: 'rr', icon: Activity },
                { label: 'SBP (mmHg)', key: 'sbp', icon: Activity },
                { label: 'DBP (mmHg)', key: 'dbp', icon: Activity },
                { label: 'Temp (°C)', key: 'temp', icon: Thermometer },
                { label: 'SpO₂ (%)', key: 'spo2', icon: Activity },
                { label: 'Pain (0-10)', key: 'painScale', icon: AlertTriangle },
                { label: 'GCS (3-15)', key: 'gcs', icon: Brain },
              ].map(v => (
                <div key={v.key}>
                  <Label className="text-xs">{v.label}</Label>
                  <Input type="number" value={(form as any)[v.key]} onChange={e => setForm(f => ({ ...f, [v.key]: e.target.value }))} className="h-8 text-sm" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Acuity Selection */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Acuity Assignment (ESI/CTAS)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {suggested !== null && (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm">
                  <span className="text-muted-foreground">System Suggestion:</span>
                  <span className={cn('font-bold px-2 py-0.5 rounded text-white text-xs', ACUITY_CONFIG[suggested].bgColor)}>ESI {suggested} — {ACUITY_CONFIG[suggested].label}</span>
                </div>
              )}
              <div className="flex gap-2">
                {([1, 2, 3, 4, 5] as const).map(a => (
                  <Button
                    key={a}
                    variant={selectedAcuity === a ? 'default' : 'outline'}
                    className={cn('flex-1', selectedAcuity === a && ACUITY_CONFIG[a].bgColor)}
                    onClick={() => handleAcuitySelect(a)}
                  >
                    <span className="text-xs font-bold">ESI {a}</span>
                  </Button>
                ))}
              </div>
              {varianceOverride && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded text-xs text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span><strong>Variance Override:</strong> Nurse selected ESI {selectedAcuity} vs system-suggested ESI {suggested}. This will be logged for QA review.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Additional Information</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label className="text-xs">Allergies (comma-separated)</Label><Input value={form.allergies} onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} className="h-8 text-sm" /></div>
              <div><Label className="text-xs">Current Medications</Label><Input value={form.medications} onChange={e => setForm(f => ({ ...f, medications: e.target.value }))} className="h-8 text-sm" /></div>
              <div>
                <Label className="text-xs">Assign MD</Label>
                <Select value={form.assignedMD} onValueChange={v => setForm(f => ({ ...f, assignedMD: v }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{physicians.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Assign RN</Label>
                <Select value={form.assignedRN} onValueChange={v => setForm(f => ({ ...f, assignedRN: v }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{nurses.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2"><Label className="text-xs">Triage Notes</Label><Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="text-sm" /></div>
            </CardContent>
          </Card>

          <Button className="w-full" onClick={handleSubmit} disabled={!form.name || !form.chiefComplaint || !selectedAcuity}>
            Complete Triage & Register Patient
          </Button>
        </div>

        {/* Sidebar: FHIR history & queue */}
        <div className="space-y-4">
          {/* FHIR History */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" /> External Record Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {fhirHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground">Type a chief complaint to auto-query FHIR/HIE records...</p>
              ) : (
                <ScrollArea className="h-60">
                  <div className="space-y-2">
                    {fhirHistory.map((item, i) => (
                      <div key={i} className="border-l-2 border-primary/30 pl-3 py-1">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-[9px] h-4">{item.type}</Badge>
                          <span className="text-[10px] text-muted-foreground">{item.date}</span>
                        </div>
                        <p className="text-xs font-medium mt-0.5">{item.description}</p>
                        {item.result && <p className="text-[10px] text-muted-foreground">{item.result}</p>}
                        <p className="text-[10px] text-muted-foreground">{item.provider}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Current queue snapshot */}
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Current ED Census</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-1">
                {([1, 2, 3, 4, 5] as const).map(a => {
                  const count = activePatients.filter(p => p.acuity === a).length;
                  return (
                    <div key={a} className="flex items-center justify-between text-xs">
                      <span className={cn('font-medium px-1.5 py-0.5 rounded text-white', ACUITY_CONFIG[a].bgColor)}>ESI {a}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  );
                })}
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Total Active</span>
                  <span>{activePatients.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
