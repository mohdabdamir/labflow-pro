import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAPCases } from '@/hooks/useAPData';
import type { APCase, APSpecimen, APCaseBillingEntry } from '@/types/anatomicPathology';
import { mockAPBillingCodes } from '@/data/apMockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ChevronRight, ChevronLeft, User, Building2,
  FlaskConical, DollarSign, Check, Plus, Trash2,
  Microscope, FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const STEPS = [
  { id: 1, label: 'Client & Physician', icon: Building2 },
  { id: 2, label: 'Patient',            icon: User },
  { id: 3, label: 'Case Details',       icon: Microscope },
  { id: 4, label: 'Billing Codes',      icon: DollarSign },
];

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const SPECIMEN_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CASE_TYPES = [
  'Biopsy', 'Resection', 'Cytology', 'Autopsy', 'Frozen Section',
  'Bone Marrow', 'Fine Needle Aspiration', 'Excision', 'Curettage',
];

const CLIENTS = [
  { id: 'CLT001', name: 'Gulf Medical Hospital', type: 'B2B' as const },
  { id: 'CLT002', name: 'National Health Clinic', type: 'B2B' as const },
  { id: 'CLT003', name: 'Al-Hilal Medical Centre', type: 'B2B' as const },
  { id: 'CLT004', name: 'Bahrain Specialist Hospital', type: 'B2B' as const },
  { id: 'SELF',   name: 'Walk-In / Self-Pay', type: 'B2C' as const },
];

const PHYSICIANS = ['Dr. Sarah Al-Rashidi', 'Dr. Khalid Al-Dosari', 'Dr. Hana Al-Zayani', 'Dr. Ali Al-Saeedi', 'Dr. Fawzi Al-Qasim', 'Dr. Mariam Al-Nasser', 'Dr. Yousif Al-Mannai'];

type FormState = {
  // Step 1
  clientId: string;
  clientName: string;
  clientType: 'B2C' | 'B2B';
  treatingPhysician: string;
  referringPhysician: string;
  ccPhysicians: string;
  // Step 2
  patientId: string;
  patientName: string;
  patientDob: string;
  patientAge: string;
  patientGender: 'M' | 'F' | 'Unknown';
  patientMobile: string;
  patientEmail: string;
  // Step 3
  caseType: string;
  clinicalHistory: string;
  clinicalIndication: string;
  priority: 'routine' | 'urgent' | 'stat';
  numberOfSpecimens: number;
  specimensData: Array<{ specimenName: string; deficiencies: string }>;
  notes: string;
  // Step 4
  billingEntries: APCaseBillingEntry[];
};

export default function APCaseCreation() {
  const navigate = useNavigate();
  const { addCase, cases } = useAPCases();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState<FormState>({
    clientId: '', clientName: '', clientType: 'B2B',
    treatingPhysician: '', referringPhysician: '', ccPhysicians: '',
    patientId: '', patientName: '', patientDob: '', patientAge: '',
    patientGender: 'M', patientMobile: '', patientEmail: '',
    caseType: 'Biopsy', clinicalHistory: '', clinicalIndication: '',
    priority: 'routine', numberOfSpecimens: 1,
    specimensData: [{ specimenName: '', deficiencies: '' }],
    notes: '',
    billingEntries: [],
  });

  const set = (field: keyof FormState, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const handleSpecimenCount = (n: number) => {
    const clamped = Math.min(26, Math.max(1, n));
    const cur = form.specimensData;
    const next = Array.from({ length: clamped }, (_, i) => cur[i] ?? { specimenName: '', deficiencies: '' });
    set('numberOfSpecimens', clamped);
    set('specimensData', next);
  };

  const handleClientChange = (clientId: string) => {
    const client = CLIENTS.find(c => c.id === clientId);
    if (client) {
      set('clientId', clientId);
      set('clientName', client.name);
      set('clientType', client.type);
    }
  };

  const addBillingEntry = (codeId: string) => {
    const code = mockAPBillingCodes.find(c => c.id === codeId);
    if (!code) return;
    if (form.billingEntries.find(e => e.billingCodeId === codeId)) return;
    const price = form.clientType === 'B2B' ? code.b2bPrice : code.b2cPrice;
    const vat = price * 0.1;
    const entry: APCaseBillingEntry = {
      id: genId(), billingCodeId: code.id, billingCode: code.code,
      description: code.description, quantity: 1, unitPrice: price,
      discountPercent: 0, discountAmount: 0, vatPercent: 10,
      vatAmount: vat, total: price + vat,
      insured: false, patientAmount: price + vat, insuranceAmount: 0,
    };
    set('billingEntries', [...form.billingEntries, entry]);
  };

  const updateBillingEntry = (id: string, qty: number) => {
    set('billingEntries', form.billingEntries.map(e => {
      if (e.id !== id) return e;
      const subtotal = e.unitPrice * qty;
      const vat = subtotal * 0.1;
      return { ...e, quantity: qty, vatAmount: vat, total: subtotal + vat, patientAmount: subtotal + vat };
    }));
  };

  const removeBillingEntry = (id: string) => set('billingEntries', form.billingEntries.filter(e => e.id !== id));

  const subtotal = form.billingEntries.reduce((s, e) => s + e.unitPrice * e.quantity, 0);
  const vat = form.billingEntries.reduce((s, e) => s + e.vatAmount, 0);
  const total = subtotal + vat;

  const canNext = () => {
    if (step === 1) return form.clientId && form.treatingPhysician;
    if (step === 2) return form.patientId && form.patientName && form.patientGender;
    if (step === 3) return form.caseType && form.numberOfSpecimens >= 1;
    return true;
  };

  const handleSubmit = () => {
    const id = genId();
    const caseNum = `AP-${new Date().getFullYear()}-${String(cases.length + 1).padStart(4, '0')}`;
    const specimens: APSpecimen[] = form.specimensData.map((s, i) => ({
      id: genId(), specimenIndex: i + 1, specimenLabel: SPECIMEN_LABELS[i],
      specimenName: s.specimenName || `Specimen ${SPECIMEN_LABELS[i]}`,
      deficiencies: s.deficiencies, numberOfBlocks: 1,
      blocks: [{ id: genId(), blockLabel: `${SPECIMEN_LABELS[i]}1`, description: 'Initial block' }],
      ancillaryStudies: [], frozenSections: [],
    }));

    const newCase: APCase = {
      id, caseNumber: caseNum,
      clientId: form.clientId, clientName: form.clientName, clientType: form.clientType,
      treatingPhysician: form.treatingPhysician,
      referringPhysician: form.referringPhysician || undefined,
      ccPhysicians: form.ccPhysicians ? form.ccPhysicians.split(',').map(s => s.trim()).filter(Boolean) : [],
      patientId: form.patientId, patientName: form.patientName,
      patientDob: form.patientDob || undefined,
      patientAge: form.patientAge ? parseInt(form.patientAge) : undefined,
      patientGender: form.patientGender,
      patientMobile: form.patientMobile || undefined,
      patientEmail: form.patientEmail || undefined,
      caseType: form.caseType as APCase['caseType'],
      clinicalHistory: form.clinicalHistory || undefined,
      clinicalIndication: form.clinicalIndication || undefined,
      numberOfSpecimens: form.numberOfSpecimens,
      specimens,
      status: 'registered',
      deliveryStatus: 'pending',
      billingEntries: form.billingEntries,
      subtotal, discountAmount: 0, vatAmount: vat, totalAmount: total,
      paymentStatus: 'pending', paidAmount: 0,
      messages: [],
      registeredAt: new Date().toISOString(),
      priority: form.priority,
      notes: form.notes || undefined,
    };

    addCase(newCase);
    toast({ title: 'Case registered', description: `${caseNum} created successfully.` });
    navigate(`/ap/cases/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">New AP Case</h1>
        <p className="text-muted-foreground text-sm mt-1">Register a new anatomic pathology case</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8 gap-0">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = step > s.id;
          const active = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={cn(
                  'h-9 w-9 rounded-full flex items-center justify-center border-2 transition-all',
                  done ? 'bg-primary border-primary text-primary-foreground' :
                  active ? 'bg-primary/10 border-primary text-primary' :
                  'bg-muted border-border text-muted-foreground',
                )}>
                  {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={cn('text-[11px] font-medium hidden sm:block', active ? 'text-primary' : done ? 'text-foreground' : 'text-muted-foreground')}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mb-5 mx-2 transition-all', step > s.id ? 'bg-primary' : 'bg-border')} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <Card className="border-border">
        <CardContent className="pt-6 pb-8 space-y-5">

          {/* ── Step 1: Client & Physician ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Client <span className="text-destructive">*</span></Label>
                  <Select value={form.clientId} onValueChange={handleClientChange}>
                    <SelectTrigger><SelectValue placeholder="Select client..." /></SelectTrigger>
                    <SelectContent>
                      {CLIENTS.map(c => <SelectItem key={c.id} value={c.id}>{c.name} <span className="text-muted-foreground text-xs">({c.type})</span></SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Client Type</Label>
                  <Input value={form.clientType} disabled className="bg-muted" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Treating Physician <span className="text-destructive">*</span></Label>
                  <Select value={form.treatingPhysician} onValueChange={v => set('treatingPhysician', v)}>
                    <SelectTrigger><SelectValue placeholder="Select physician..." /></SelectTrigger>
                    <SelectContent>
                      {PHYSICIANS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Referring Physician</Label>
                  <Input value={form.referringPhysician} onChange={e => set('referringPhysician', e.target.value)} placeholder="Optional" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>CC Physicians <span className="text-xs text-muted-foreground">(comma-separated)</span></Label>
                <Input value={form.ccPhysicians} onChange={e => set('ccPhysicians', e.target.value)} placeholder="Dr. A, Dr. B, ..." />
              </div>
            </div>
          )}

          {/* ── Step 2: Patient ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Patient ID <span className="text-destructive">*</span></Label>
                  <Input value={form.patientId} onChange={e => set('patientId', e.target.value)} placeholder="e.g. PAT-00123" />
                </div>
                <div className="space-y-1.5">
                  <Label>Full Name <span className="text-destructive">*</span></Label>
                  <Input value={form.patientName} onChange={e => set('patientName', e.target.value)} placeholder="Patient full name" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={form.patientDob} onChange={e => set('patientDob', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Age (years)</Label>
                  <Input type="number" value={form.patientAge} onChange={e => set('patientAge', e.target.value)} placeholder="Or enter DOB" />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender <span className="text-destructive">*</span></Label>
                  <Select value={form.patientGender} onValueChange={v => set('patientGender', v as 'M' | 'F' | 'Unknown')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                      <SelectItem value="Unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Mobile</Label>
                  <Input value={form.patientMobile} onChange={e => set('patientMobile', e.target.value)} placeholder="+973-..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" value={form.patientEmail} onChange={e => set('patientEmail', e.target.value)} placeholder="patient@email.com" />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Case Details ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Case Type <span className="text-destructive">*</span></Label>
                  <Select value={form.caseType} onValueChange={v => set('caseType', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CASE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Number of Specimens <span className="text-destructive">*</span></Label>
                  <Input type="number" min={1} max={26} value={form.numberOfSpecimens}
                    onChange={e => handleSpecimenCount(parseInt(e.target.value) || 1)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Priority</Label>
                  <Select value={form.priority} onValueChange={v => set('priority', v as 'routine' | 'urgent' | 'stat')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Clinical History</Label>
                <Textarea value={form.clinicalHistory} onChange={e => set('clinicalHistory', e.target.value)} rows={2} placeholder="Relevant clinical history..." />
              </div>
              <div className="space-y-1.5">
                <Label>Clinical Indication</Label>
                <Textarea value={form.clinicalIndication} onChange={e => set('clinicalIndication', e.target.value)} rows={2} placeholder="Reason for submission / indication..." />
              </div>

              {/* Per-specimen fields */}
              <Separator />
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                Specimen Details ({form.numberOfSpecimens} specimen{form.numberOfSpecimens > 1 ? 's' : ''})
              </h3>
              <div className="space-y-3">
                {form.specimensData.map((sp, i) => (
                  <div key={i} className="border border-border rounded-lg p-4 space-y-3 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{SPECIMEN_LABELS[i]}</span>
                      <span className="font-medium text-sm text-foreground">Specimen {SPECIMEN_LABELS[i]}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Specimen Name / Description</Label>
                        <Input
                          value={sp.specimenName}
                          onChange={e => {
                            const upd = [...form.specimensData];
                            upd[i] = { ...upd[i], specimenName: e.target.value };
                            set('specimensData', upd);
                          }}
                          placeholder="e.g. Right breast core biopsy"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Specimen Deficiencies</Label>
                        <Input
                          value={sp.deficiencies}
                          onChange={e => {
                            const upd = [...form.specimensData];
                            upd[i] = { ...upd[i], deficiencies: e.target.value };
                            set('specimensData', upd);
                          }}
                          placeholder="e.g. Container not labeled, inadequate fixation"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label>Additional Notes</Label>
                <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Any other relevant information..." />
              </div>
            </div>
          )}

          {/* ── Step 4: Billing Codes ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-1">Add Billing Codes</h3>
                <p className="text-xs text-muted-foreground mb-3">Select applicable billing codes for this case. Prices shown are {form.clientType} rates.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                  {mockAPBillingCodes.filter(c => c.isActive).map(code => {
                    const already = form.billingEntries.some(e => e.billingCodeId === code.id);
                    const price = form.clientType === 'B2B' ? code.b2bPrice : code.b2cPrice;
                    return (
                      <button
                        key={code.id}
                        type="button"
                        onClick={() => already ? removeBillingEntry(form.billingEntries.find(e => e.billingCodeId === code.id)!.id) : addBillingEntry(code.id)}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                          already ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50',
                        )}
                      >
                        <div className={cn('mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0', already ? 'bg-primary border-primary' : 'border-muted-foreground')}>
                          {already && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{code.code}</p>
                          <p className="text-[11px] text-muted-foreground leading-snug">{code.description}</p>
                          <p className="text-[11px] font-bold text-primary mt-0.5">BD {price.toFixed(2)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {form.billingEntries.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold text-sm text-foreground mb-3">Selected Codes</h3>
                    <div className="space-y-2">
                      {form.billingEntries.map(e => (
                        <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">{e.billingCode}</p>
                            <p className="text-[11px] text-muted-foreground">{e.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Label className="text-xs text-muted-foreground">Qty</Label>
                            <Input type="number" min={1} max={20} value={e.quantity}
                              onChange={ev => updateBillingEntry(e.id, parseInt(ev.target.value) || 1)}
                              className="w-14 h-7 text-xs text-center" />
                            <span className="text-xs font-semibold text-foreground w-20 text-right">BD {e.total.toFixed(2)}</span>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeBillingEntry(e.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <div className="text-right space-y-1">
                        <p className="text-xs text-muted-foreground">Subtotal: <span className="font-medium text-foreground">BD {subtotal.toFixed(2)}</span></p>
                        <p className="text-xs text-muted-foreground">VAT (10%): <span className="font-medium text-foreground">BD {vat.toFixed(2)}</span></p>
                        <p className="text-sm font-bold text-foreground">Total: BD {total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/ap')} className="gap-2">
          <ChevronLeft className="h-4 w-4" />{step === 1 ? 'Cancel' : 'Back'}
        </Button>
        {step < 4 ? (
          <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="gap-2">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="gap-2">
            <Check className="h-4 w-4" />Register Case
          </Button>
        )}
      </div>
    </div>
  );
}
