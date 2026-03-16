import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { usePharmacyData } from '@/hooks/usePharmacyData';
import type { Prescription, PrescriptionStatus } from '@/types/pharmacy';
import {
  Search, Filter, ClipboardList, AlertTriangle, CheckCircle2,
  Clock, MessageCircle, ChevronRight, Eye, ShieldAlert,
  User, Pill, Hash, Building2, X, Stethoscope, FileText,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const ACTION_TYPE_CONFIG = {
  new:              { label: 'New Rx',           bg: 'bg-blue-500',    light: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800' },
  clinical_review:  { label: 'Clinical Review',  bg: 'bg-orange-500',  light: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400' },
  counseling:       { label: 'Counseling Req.',  bg: 'bg-purple-500',  light: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400' },
  clarification:    { label: 'Dr. Clarification',bg: 'bg-destructive', light: 'bg-destructive/10 text-destructive border-destructive/30' },
  refill:           { label: 'Refill',           bg: 'bg-teal-500',    light: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400' },
  urgent:           { label: 'URGENT / STAT',    bg: 'bg-red-600',     light: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400' },
};

const STATUS_FLOW: Record<PrescriptionStatus, PrescriptionStatus | null> = {
  received: 'verification',
  clinical_review: 'verification',
  verification: 'dispensing',
  dispensing: 'ready',
  ready: 'dispensed',
  dispensed: null,
  cancelled: null,
  on_hold: 'verification',
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'action', label: 'Needs Action' },
  { key: 'dispensing', label: 'Dispensing' },
  { key: 'ready', label: 'Ready' },
  { key: 'dispensed', label: 'Dispensed' },
];

export default function PrescriptionQueue() {
  const { prescriptions, updatePrescriptionStatus, dispenseItem, rxStats } = usePharmacyData();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [dispensingStep, setDispensingStep] = useState<'verify' | 'dispense' | 'confirm'>('verify');
  const [verifyChecked, setVerifyChecked] = useState(false);
  const [pharmacistNotes, setPharmacistNotes] = useState('');

  const filtered = prescriptions.filter(rx => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      rx.rxNumber.toLowerCase().includes(q) ||
      rx.patient.firstName.toLowerCase().includes(q) ||
      rx.patient.lastName.toLowerCase().includes(q) ||
      rx.patient.mrn.toLowerCase().includes(q) ||
      rx.prescriberName.toLowerCase().includes(q) ||
      rx.items.some(i => i.drugName.toLowerCase().includes(q));

    const matchTab = filterTab === 'all' ? true
      : filterTab === 'action' ? ['received', 'clinical_review', 'verification', 'on_hold'].includes(rx.status) || rx.actionType === 'urgent'
      : filterTab === 'dispensing' ? rx.status === 'dispensing'
      : filterTab === 'ready' ? rx.status === 'ready'
      : filterTab === 'dispensed' ? rx.status === 'dispensed'
      : true;

    return matchSearch && matchTab;
  });

  function openRx(rx: Prescription) {
    setSelectedRx(rx);
    setDispensingStep('verify');
    setVerifyChecked(false);
    setPharmacistNotes('');
  }

  function advanceStatus(rx: Prescription) {
    const next = STATUS_FLOW[rx.status];
    if (!next) return;
    updatePrescriptionStatus(rx.id, next, pharmacistNotes || undefined);
    toast({ title: `Rx ${rx.rxNumber}`, description: `Status updated to ${next.replace('_', ' ')}` });
    if (next === 'ready') {
      setSelectedRx(null);
      toast({ title: '✅ Ready for Collection!', description: `Ticket notified. Patient: ${rx.patient.firstName} ${rx.patient.lastName}` });
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header + Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Prescription Action Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and process incoming prescriptions
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <StatChip color="blue" label="New" count={rxStats.new} />
          <StatChip color="orange" label="Review" count={rxStats.clinicalReview} />
          <StatChip color="red" label="Clarify" count={rxStats.clarification} />
          <StatChip color="green" label="Ready" count={rxStats.ready} />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Rx#, patient name, MRN, drug, prescriber..."
          className="pl-9 bg-card"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}>
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={filterTab} onValueChange={setFilterTab}>
        <TabsList className="h-9">
          {FILTER_TABS.map(t => (
            <TabsTrigger key={t.key} value={t.key} className="text-xs px-3">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Prescription Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
            No prescriptions match your filter
          </div>
        )}
        {filtered.map(rx => (
          <PrescriptionCard key={rx.id} rx={rx} onOpen={() => openRx(rx)} onAdvance={() => advanceStatus(rx)} />
        ))}
      </div>

      {/* Dispensing Dialog */}
      {selectedRx && (
        <DispensingDialog
          rx={selectedRx}
          step={dispensingStep}
          verifyChecked={verifyChecked}
          pharmacistNotes={pharmacistNotes}
          onNotesChange={setPharmacistNotes}
          onVerifyCheck={setVerifyChecked}
          onStepChange={setDispensingStep}
          onAdvance={() => advanceStatus(selectedRx)}
          onDispenseItem={(itemId) => dispenseItem(selectedRx.id, itemId)}
          onClose={() => setSelectedRx(null)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Prescription Card
// ─────────────────────────────────────────────────────────────
function PrescriptionCard({ rx, onOpen, onAdvance }: {
  rx: Prescription;
  onOpen: () => void;
  onAdvance: () => void;
}) {
  const cfg = ACTION_TYPE_CONFIG[rx.actionType];
  const hasAllergy = rx.patient.allergies.some(a => a.severity === 'life_threatening' || a.severity === 'severe');
  const hasInteractions = rx.interactions.length > 0;
  const nextStatus = STATUS_FLOW[rx.status];

  return (
    <Card className={cn(
      'overflow-hidden transition-all hover:shadow-md border',
      rx.actionType === 'urgent' && 'ring-2 ring-destructive/40',
      rx.actionType === 'clarification' && 'ring-1 ring-destructive/25',
    )}>
      {/* Color Strip */}
      <div className={cn('h-1', cfg.bg)} />

      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Left: Patient + Alerts */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground">
                {rx.patient.firstName} {rx.patient.lastName}
              </span>
              {hasAllergy && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground">
                  ⚠ ALLERGY
                </span>
              )}
              {hasInteractions && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500 text-white">
                  ⚡ INTERACTION
                </span>
              )}
              {rx.highRiskFlag && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-600 text-white">
                  HIGH RISK
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{rx.rxNumber}</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" />MRN: {rx.patient.mrn}</span>
              <span className="flex items-center gap-1"><Stethoscope className="h-3 w-3" />{rx.prescriberName}</span>
              <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{rx.prescriberDept}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {Math.floor((Date.now() - new Date(rx.receivedAt).getTime()) / 60000)}m ago
              </span>
            </div>

            {/* Items */}
            <div className="flex flex-wrap gap-1.5">
              {rx.items.map(item => (
                <div key={item.id} className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border',
                  item.status === 'dispensed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400' :
                    item.status === 'on_hold' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-muted text-muted-foreground border-border',
                )}>
                  <Pill className="h-3 w-3 shrink-0" />
                  {item.drugName} × {item.quantity}
                  {item.status === 'dispensed' && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                </div>
              ))}
            </div>

            {/* Interaction Alerts */}
            {hasInteractions && rx.interactions.map(i => (
              <div key={i.id} className={cn(
                'flex items-start gap-2 text-xs p-2 rounded-lg border',
                i.severity === 'contraindicated' ? 'bg-destructive/10 border-destructive/30 text-destructive' :
                  i.severity === 'significant' ? 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400' :
                    'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
              )}>
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span><strong>{i.type.replace('_', '-').toUpperCase()}</strong>: {i.description}</span>
              </div>
            ))}
          </div>

          {/* Right: Status + Actions */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Badge variant="outline" className={cn('text-[10px]', cfg.light)}>
              {cfg.label}
            </Badge>
            <Badge variant="outline" className="text-[10px] text-muted-foreground">
              {rx.status.replace('_', ' ').toUpperCase()}
            </Badge>

            <div className="flex flex-col gap-1.5 mt-1">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onOpen}>
                <Eye className="h-3 w-3" />
                View / Dispense
              </Button>
              {nextStatus && (
                <Button
                  size="sm"
                  className={cn('h-7 text-xs gap-1', rx.actionType === 'urgent' ? 'bg-destructive hover:bg-destructive/90' : '')}
                  onClick={onAdvance}
                >
                  <ChevronRight className="h-3 w-3" />
                  → {nextStatus.replace('_', ' ')}
                </Button>
              )}
            </div>

            {/* Payment */}
            <div className="text-right text-xs mt-1">
              <p className="font-semibold text-foreground">SAR {rx.totalCost.toFixed(2)}</p>
              <p className="text-muted-foreground">Copay: {rx.patientCopay.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────
// Dispensing Dialog (3-step)
// ─────────────────────────────────────────────────────────────
function DispensingDialog({
  rx, step, verifyChecked, pharmacistNotes,
  onNotesChange, onVerifyCheck, onStepChange, onAdvance, onDispenseItem, onClose,
}: {
  rx: Prescription;
  step: 'verify' | 'dispense' | 'confirm';
  verifyChecked: boolean;
  pharmacistNotes: string;
  onNotesChange: (v: string) => void;
  onVerifyCheck: (v: boolean) => void;
  onStepChange: (s: any) => void;
  onAdvance: () => void;
  onDispenseItem: (id: string) => void;
  onClose: () => void;
}) {
  const { toast } = useToast();

  function handleFinalDispense() {
    onAdvance();
    toast({
      title: '✅ Dispensed Successfully',
      description: `${rx.patient.firstName} ${rx.patient.lastName} — ${rx.rxNumber}`,
    });
    onClose();
  }

  const hasAllergy = rx.patient.allergies.some(a => a.severity === 'life_threatening' || a.severity === 'severe');

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Dispensing Workflow — {rx.rxNumber}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2 text-xs">
          {['verify', 'dispense', 'confirm'].map((s, i) => (
            <React.Fragment key={s}>
              <span className={cn(
                'px-3 py-1 rounded-full font-semibold',
                step === s ? 'bg-primary text-primary-foreground' : i < ['verify', 'dispense', 'confirm'].indexOf(step) ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400' : 'bg-muted text-muted-foreground',
              )}>
                {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-border" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Verify */}
        {step === 'verify' && (
          <div className="space-y-4">
            {/* Patient Banner */}
            <div className={cn('p-3 rounded-xl border-2', hasAllergy ? 'bg-destructive/10 border-destructive' : 'bg-muted border-border')}>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-foreground/70" />
                <div>
                  <p className="font-bold text-foreground">{rx.patient.firstName} {rx.patient.lastName}</p>
                  <p className="text-xs text-muted-foreground">MRN: {rx.patient.mrn} · DOB: {rx.patient.dob} · {rx.patient.gender === 'M' ? 'Male' : 'Female'}</p>
                </div>
                {hasAllergy && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-bold text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    CRITICAL ALLERGY
                  </span>
                )}
              </div>
              {rx.patient.allergies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rx.patient.allergies.map(a => (
                    <span key={a.id} className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', a.severity === 'life_threatening' || a.severity === 'severe' ? 'bg-destructive text-destructive-foreground' : 'bg-amber-500 text-white')}>
                      {a.allergen} ({a.reaction})
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Medications */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Medications to Dispense</p>
              {rx.items.map(item => (
                <div key={item.id} className="p-3 rounded-lg border border-border bg-card space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{item.drugName}</p>
                      <p className="text-xs text-muted-foreground">{item.genericName} · NDC: {item.ndc}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-foreground">Qty: {item.quantity}</p>
                      <p className="text-muted-foreground">{item.daysSupply}d supply</p>
                    </div>
                  </div>
                  <p className="text-xs bg-muted rounded px-2 py-1 text-foreground/80 italic">{item.directions}</p>
                  {item.lot && <p className="text-[10px] text-muted-foreground">Lot: {item.lot} · Exp: {item.expiry}</p>}
                </div>
              ))}
            </div>

            {/* Prescriber */}
            <div className="text-sm text-muted-foreground flex gap-4">
              <span><strong className="text-foreground">Prescriber:</strong> {rx.prescriberName}</span>
              <span><strong className="text-foreground">Dept:</strong> {rx.prescriberDept}</span>
            </div>

            {/* Interaction Alerts */}
            {rx.interactions.length > 0 && (
              <div className="space-y-2">
                {rx.interactions.map(i => (
                  <div key={i.id} className={cn('p-3 rounded-xl border text-sm', i.severity === 'contraindicated' ? 'bg-destructive/10 border-destructive' : 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800')}>
                    <p className="font-bold flex items-center gap-1.5 mb-1">
                      <ShieldAlert className="h-4 w-4" />
                      {i.severity.toUpperCase()} — {i.type.replace('_', '-').toUpperCase()}
                    </p>
                    <p className="text-xs">{i.description}</p>
                    <p className="text-xs mt-1 italic">{i.managementRecommendation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Mandatory Verification Checkbox */}
            <label className={cn(
              'flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors',
              verifyChecked ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : 'border-border hover:border-primary/50',
            )}>
              <input type="checkbox" checked={verifyChecked} onChange={e => onVerifyCheck(e.target.checked)} className="mt-0.5 h-4 w-4 accent-green-600" />
              <span className="text-sm font-medium text-foreground">
                I have verified that the medication(s) match the prescription exactly, including drug name, strength, dosage form, quantity, and patient identity.
              </span>
            </label>

            {/* Pharmacist Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs">Pharmacist Notes (optional)</Label>
              <Textarea
                placeholder="Add clinical notes, counseling reminders, or override reasons..."
                className="text-sm"
                rows={2}
                value={pharmacistNotes}
                onChange={e => onNotesChange(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Dispense Items */}
        {step === 'dispense' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Mark each item as dispensed. Scan barcode or click manually:</p>
            <div className="space-y-3">
              {rx.items.map(item => (
                <div key={item.id} className={cn(
                  'flex items-center justify-between p-3 rounded-xl border-2 transition-all',
                  item.status === 'dispensed' ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : 'border-border bg-card',
                )}>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{item.drugName}</p>
                    <p className="text-xs text-muted-foreground">{item.strength} · Qty: {item.quantity} · {item.dosageForm}</p>
                    {item.lot && <p className="text-[10px] text-muted-foreground">Lot: {item.lot} · Exp: {item.expiry}</p>}
                  </div>
                  {item.status === 'dispensed' ? (
                    <span className="flex items-center gap-1 text-green-700 dark:text-green-400 text-sm font-semibold">
                      <CheckCircle2 className="h-5 w-5" /> Dispensed
                    </span>
                  ) : (
                    <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-xs" onClick={() => onDispenseItem(item.id)}>
                      ✓ Mark Dispensed
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && (
          <div className="space-y-4 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">Ready for Collection</h3>
              <p className="text-muted-foreground text-sm mt-1">
                All items prepared for {rx.patient.firstName} {rx.patient.lastName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Patient notification will be sent automatically
              </p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-left space-y-2 text-sm">
              <p><strong>Rx Number:</strong> {rx.rxNumber}</p>
              <p><strong>Patient:</strong> {rx.patient.firstName} {rx.patient.lastName}</p>
              <p><strong>Items:</strong> {rx.items.length} medication(s)</p>
              <p><strong>Patient Copay:</strong> SAR {rx.patientCopay.toFixed(2)}</p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          {step === 'verify' && (
            <Button
              disabled={!verifyChecked}
              onClick={() => onStepChange('dispense')}
            >
              Proceed to Dispense →
            </Button>
          )}
          {step === 'dispense' && (
            <>
              <Button variant="outline" onClick={() => onStepChange('verify')}>← Back</Button>
              <Button onClick={() => onStepChange('confirm')}>Confirm All →</Button>
            </>
          )}
          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => onStepChange('dispense')}>← Back</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleFinalDispense}>
                ✓ Complete & Notify Patient
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatChip({ color, label, count }: { color: string; label: string; count: number }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400',
    orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400',
    red: 'bg-destructive/10 text-destructive border-destructive/30',
    green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400',
  };
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold border', colors[color] ?? colors.blue)}>
      {count} {label}
    </span>
  );
}
