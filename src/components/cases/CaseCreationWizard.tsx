import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  User, Building, TestTubes, Beaker, ChevronRight, ChevronLeft, Check, Search,
  AlertCircle, Printer, Zap, Clock, AlertTriangle, X, Plus, Home, UserCheck,
  Stethoscope, CreditCard, Banknote, Smartphone, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useServices, useClients, useProfiles, usePackages, usePriceLists, usePatients, useUsers, useCaseTypes, useVATConfig } from '@/hooks/useLabData';
import { generateId, generateCaseNumber, generatePatientId } from '@/data/mockData';
import { generateTubeId } from '@/lib/tubeIdGenerator';
import { printZPLLabels, type LabelData } from '@/lib/zplLabelGenerator';
import type { Case, CaseTest, Gender, SampleType, Department, AgeInputMode, Sample, PaymentMethod, PaymentEntry } from '@/types/lab';
import { toast } from 'sonner';

interface CaseCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (newCase: Case) => void;
}

type WizardStep = 'client' | 'patient' | 'tests' | 'tubes';

const steps: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
  { key: 'client', label: 'Client', icon: <Building className="h-4 w-4" /> },
  { key: 'patient', label: 'Patient', icon: <User className="h-4 w-4" /> },
  { key: 'tests', label: 'Tests & Billing', icon: <TestTubes className="h-4 w-4" /> },
  { key: 'tubes', label: 'Tubes & Print', icon: <Beaker className="h-4 w-4" /> },
];

interface PatientData {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  mrno: string;
  gender: Gender;
  dob: string;
  age: string;
  ageInputMode: AgeInputMode;
  phone: string;
  email: string;
  isExisting: boolean;
}

interface BillingRow {
  testId: string;
  discountPercent: number;
  insured: boolean;
  insuranceDiscountPercent: number;
  copayPercent: number;
}

interface SearchableItem {
  id: string;
  type: 'test' | 'profile' | 'package';
  code: string;
  name: string;
  department?: string;
  price: number;
  testCount?: number;
}

const emptyPatient: PatientData = {
  id: '', firstName: '', middleName: '', lastName: '', mrno: '',
  gender: 'Male', dob: '', age: '', ageInputMode: 'age',
  phone: '', email: '', isExisting: false,
};

export function CaseCreationWizard({ open, onClose, onSave }: CaseCreationWizardProps) {
  const { services } = useServices();
  const { clients } = useClients();
  const { profiles } = useProfiles();
  const { packages } = usePackages();
  const { priceLists } = usePriceLists();
  const { addPatient, getPatientById, getPatientByMrno } = usePatients();
  const { getPathologists, getTechnicians } = useUsers();
  const { caseTypes } = useCaseTypes();
  const { getActiveVAT } = useVATConfig();

  const [currentStep, setCurrentStep] = useState<WizardStep>('client');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');

  // Client
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [selectedPhysicianId, setSelectedPhysicianId] = useState('');
  const [selectedPathologistId, setSelectedPathologistId] = useState('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');

  // Patient
  const [patient, setPatient] = useState<PatientData>({ ...emptyPatient });
  const [patientIdSearch, setPatientIdSearch] = useState('');

  // Tests
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [showTestDropdown, setShowTestDropdown] = useState(false);
  const [selectedCaseTypeId, setSelectedCaseTypeId] = useState('');

  // Per-test billing
  const [billingRows, setBillingRows] = useState<Map<string, BillingRow>>(new Map());
  const [discountComment, setDiscountComment] = useState('');

  // Payment
  const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>([]);
  const [showPayment, setShowPayment] = useState(false);

  // Tubes
  const [generatedSamples, setGeneratedSamples] = useState<Sample[]>([]);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientPriceList = priceLists.find(p => p.id === selectedClient?.priceListId);
  const isB2C = selectedClient?.type === 'B2C';
  const vatPercent = getActiveVAT();
  const pathologists = getPathologists();
  const technicians = getTechnicians();
  const physicians = selectedClient?.physicians || [];

  const filteredClients = useMemo(() => {
    return clients.filter(c =>
      c.isActive &&
      (c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
       c.code.toLowerCase().includes(clientSearchQuery.toLowerCase()))
    );
  }, [clients, clientSearchQuery]);

  // Build unified search list
  const searchableItems = useMemo((): SearchableItem[] => {
    const items: SearchableItem[] = [];
    packages.filter(p => p.isActive).forEach(pkg => {
      items.push({ id: pkg.id, type: 'package', code: pkg.code, name: pkg.name, price: pkg.price,
        testCount: pkg.profiles.reduce((sum, pid) => { const p = profiles.find(pr => pr.id === pid); return sum + (p ? p.tests.length : 0); }, 0) + pkg.tests.length });
    });
    profiles.filter(p => p.isActive).forEach(profile => {
      items.push({ id: profile.id, type: 'profile', code: profile.code, name: profile.name, department: profile.department, price: profile.price, testCount: profile.tests.length });
    });
    services.filter(s => s.isActive).forEach(svc => {
      items.push({ id: svc.id, type: 'test', code: svc.code, name: svc.name, department: svc.department, price: svc.price });
    });
    return items;
  }, [services, profiles, packages]);

  const filteredSearchItems = useMemo(() => {
    if (!testSearchQuery.trim()) return searchableItems.slice(0, 15);
    const q = testSearchQuery.toLowerCase();
    return searchableItems.filter(item => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)).slice(0, 20);
  }, [searchableItems, testSearchQuery]);

  // Resolve all individual tests
  const allSelectedTests = useMemo(() => {
    const testIdsSet = new Set<string>(selectedTestIds);
    const testMeta: Map<string, { profileId?: string; profileName?: string; packageId?: string }> = new Map();

    selectedProfileIds.forEach(profileId => {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) profile.tests.forEach(tid => { testIdsSet.add(tid); testMeta.set(tid, { ...(testMeta.get(tid) || {}), profileId, profileName: profile.name }); });
    });
    selectedPackageIds.forEach(pkgId => {
      const pkg = packages.find(p => p.id === pkgId);
      if (pkg) {
        pkg.tests.forEach(tid => { testIdsSet.add(tid); testMeta.set(tid, { ...(testMeta.get(tid) || {}), packageId: pkgId }); });
        pkg.profiles.forEach(profileId => {
          const profile = profiles.find(p => p.id === profileId);
          if (profile) profile.tests.forEach(tid => { testIdsSet.add(tid); testMeta.set(tid, { ...(testMeta.get(tid) || {}), profileId, profileName: profile.name, packageId: pkgId }); });
        });
      }
    });

    return Array.from(testIdsSet).map(tid => {
      const svc = services.find(s => s.id === tid);
      return svc ? { ...svc, meta: testMeta.get(tid) || {} } : null;
    }).filter(Boolean) as (typeof services[0] & { meta: { profileId?: string; profileName?: string; packageId?: string } })[];
  }, [selectedTestIds, selectedProfileIds, selectedPackageIds, services, profiles, packages]);

  // Initialize billing rows when tests change
  useEffect(() => {
    const clientDiscount = clientPriceList?.discountPercent || 0;
    setBillingRows(prev => {
      const newMap = new Map(prev);
      allSelectedTests.forEach(t => {
        if (!newMap.has(t.id)) {
          newMap.set(t.id, { testId: t.id, discountPercent: clientDiscount, insured: false, insuranceDiscountPercent: 0, copayPercent: 20 });
        }
      });
      // Remove stale
      for (const key of newMap.keys()) {
        if (!allSelectedTests.find(t => t.id === key)) newMap.delete(key);
      }
      return newMap;
    });
  }, [allSelectedTests, clientPriceList]);

  // Calculate per-test billing
  const billingDetails = useMemo(() => {
    let totalPatient = 0, totalInsurance = 0, totalVatPatient = 0, totalVatInsurance = 0, totalDiscount = 0;
    const rows = allSelectedTests.map(test => {
      const row = billingRows.get(test.id) || { testId: test.id, discountPercent: 0, insured: false, insuranceDiscountPercent: 0, copayPercent: 20 };
      const price = test.price;
      const discAmt = price * row.discountPercent / 100;
      const net = price - discAmt;
      let patientAmt: number, insAmt: number;

      if (row.insured) {
        const afterInsDisc = net * (1 - row.insuranceDiscountPercent / 100);
        patientAmt = afterInsDisc * row.copayPercent / 100;
        insAmt = afterInsDisc - patientAmt;
      } else {
        patientAmt = net;
        insAmt = 0;
      }

      const pVat = patientAmt * vatPercent / 100;
      const iVat = insAmt * vatPercent / 100;

      totalPatient += patientAmt;
      totalInsurance += insAmt;
      totalVatPatient += pVat;
      totalVatInsurance += iVat;
      totalDiscount += discAmt;

      return { testId: test.id, testCode: test.code, testName: test.name, price, discountPercent: row.discountPercent, discountAmt: discAmt, insured: row.insured, insuranceDiscountPercent: row.insuranceDiscountPercent, copayPercent: row.copayPercent, patientAmt, insAmt, pVat, iVat, patientTotal: patientAmt + pVat, insTotal: insAmt + iVat };
    });

    const subtotal = allSelectedTests.reduce((s, t) => s + t.price, 0);
    const grandPatient = totalPatient + totalVatPatient;
    const grandInsurance = totalInsurance + totalVatInsurance;
    const grandTotal = grandPatient + grandInsurance;
    const totalPaid = paymentEntries.reduce((s, p) => s + p.amount, 0);
    const hasDiscount = totalDiscount > 0;

    return { rows, subtotal, totalDiscount, totalPatient, totalInsurance, totalVatPatient, totalVatInsurance, grandPatient, grandInsurance, grandTotal, totalPaid, balance: grandPatient - totalPaid, hasDiscount };
  }, [allSelectedTests, billingRows, vatPercent, paymentEntries]);

  const updateBillingRow = (testId: string, updates: Partial<BillingRow>) => {
    setBillingRows(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(testId);
      if (existing) newMap.set(testId, { ...existing, ...updates });
      return newMap;
    });
  };

  // Payment management
  const addPaymentEntry = (method: PaymentMethod) => {
    setPaymentEntries(prev => [...prev, { method, amount: 0 }]);
  };
  const updatePaymentEntry = (index: number, updates: Partial<PaymentEntry>) => {
    setPaymentEntries(prev => prev.map((p, i) => i === index ? { ...p, ...updates } : p));
  };
  const removePaymentEntry = (index: number) => {
    setPaymentEntries(prev => prev.filter((_, i) => i !== index));
  };

  // Generate tubes
  const generateTubes = useCallback(() => {
    const tubeMap = new Map<SampleType, string[]>();
    allSelectedTests.forEach(test => {
      const st = test.sampleType as SampleType;
      const existing = tubeMap.get(st) || [];
      existing.push(test.id);
      tubeMap.set(st, existing);
    });
    const samples: Sample[] = [];
    tubeMap.forEach((testIds, sampleType) => {
      samples.push({ id: generateId('SM'), tubeId: generateTubeId(sampleType), sampleType, status: 'pending', testIds });
    });
    setGeneratedSamples(samples);
  }, [allSelectedTests]);

  // Patient lookup
  const handlePatientIdSearch = useCallback(() => {
    if (!patientIdSearch.trim()) return;
    const found = getPatientById(patientIdSearch.trim()) || getPatientByMrno(patientIdSearch.trim());
    if (found) {
      setPatient({
        id: found.id, firstName: found.firstName || '', middleName: found.middleName || '',
        lastName: found.lastName || '', mrno: found.mrno || '', gender: found.gender,
        dob: found.dob || '', age: found.age?.toString() || '', ageInputMode: found.ageInputMode,
        phone: found.phone || '', email: found.email || '', isExisting: true,
      });
      toast.success(`Patient "${found.name}" loaded`);
    } else {
      setPatient(prev => ({ ...prev, id: patientIdSearch.trim(), isExisting: false }));
      toast.info('New patient - fill in details');
    }
  }, [patientIdSearch, getPatientById, getPatientByMrno]);

  // DOB → age calc
  useEffect(() => {
    if (patient.ageInputMode === 'dob' && patient.dob) {
      const bd = new Date(patient.dob);
      const today = new Date();
      let age = today.getFullYear() - bd.getFullYear();
      const m = today.getMonth() - bd.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
      setPatient(prev => ({ ...prev, age: age.toString() }));
    }
  }, [patient.dob, patient.ageInputMode]);

  // Reset physician when client changes
  useEffect(() => {
    setSelectedPhysicianId('');
  }, [selectedClientId]);

  const addSearchItem = (item: SearchableItem) => {
    if (item.type === 'test' && !selectedTestIds.includes(item.id)) setSelectedTestIds(prev => [...prev, item.id]);
    else if (item.type === 'profile' && !selectedProfileIds.includes(item.id)) setSelectedProfileIds(prev => [...prev, item.id]);
    else if (item.type === 'package' && !selectedPackageIds.includes(item.id)) setSelectedPackageIds(prev => [...prev, item.id]);
    setTestSearchQuery('');
    setShowTestDropdown(false);
  };

  const removeItem = (type: string, id: string) => {
    if (type === 'test') setSelectedTestIds(prev => prev.filter(i => i !== id));
    else if (type === 'profile') setSelectedProfileIds(prev => prev.filter(i => i !== id));
    else if (type === 'package') setSelectedPackageIds(prev => prev.filter(i => i !== id));
  };

  const fullName = [patient.firstName, patient.middleName, patient.lastName].filter(Boolean).join(' ');

  const canProceed = () => {
    switch (currentStep) {
      case 'client': return !!selectedClientId;
      case 'patient': return patient.firstName.trim() && patient.lastName.trim() && patient.gender && (patient.ageInputMode === 'none' || patient.age);
      case 'tests': return allSelectedTests.length > 0;
      case 'tubes': return true;
      default: return false;
    }
  };

  const goToNextStep = () => {
    const idx = steps.findIndex(s => s.key === currentStep);
    if (idx < steps.length - 1) {
      const nextStep = steps[idx + 1].key;
      if (nextStep === 'tubes') generateTubes();
      setCurrentStep(nextStep);
    }
  };

  const goToPrevStep = () => {
    const idx = steps.findIndex(s => s.key === currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1].key);
  };

  const handlePrintLabels = () => {
    const caseNo = generateCaseNumber();
    const labels: LabelData[] = generatedSamples.map(s => ({
      patientName: fullName, patientId: patient.id || generatePatientId(),
      caseNumber: caseNo, dateCreated: new Date().toISOString(),
      tubeId: s.tubeId, sampleType: s.sampleType,
    }));
    printZPLLabels(labels);
    toast.success(`${labels.length} label(s) sent to printer`);
  };

  const handleSave = () => {
    const patientId = patient.id || generatePatientId();
    const caseNumber = generateCaseNumber();
    const now = new Date().toISOString();
    const selectedPathologist = pathologists.find(p => p.id === selectedPathologistId);
    const selectedTechnician = technicians.find(t => t.id === selectedTechnicianId);
    const selectedPhysician = physicians.find(p => p.id === selectedPhysicianId);

    addPatient({
      id: patientId, firstName: patient.firstName, middleName: patient.middleName || undefined,
      lastName: patient.lastName, name: fullName, mrno: patient.mrno || undefined,
      gender: patient.gender, dob: patient.dob || undefined,
      age: parseInt(patient.age) || undefined, ageInputMode: patient.ageInputMode,
      phone: patient.phone || undefined, email: patient.email || undefined, createdAt: now,
    });

    const tubeAssignment = new Map<string, string>();
    generatedSamples.forEach(s => s.testIds.forEach(tid => tubeAssignment.set(tid, s.tubeId)));

    const caseTests: CaseTest[] = allSelectedTests.map(test => {
      const br = billingRows.get(test.id);
      const detail = billingDetails.rows.find(r => r.testId === test.id);
      return {
        testId: test.id, testCode: test.code, testName: test.name,
        department: test.department as Department, sampleType: test.sampleType as SampleType,
        price: test.price, status: 'pending' as const, unit: test.unit,
        tubeId: tubeAssignment.get(test.id),
        profileId: test.meta?.profileId, profileName: test.meta?.profileName, packageId: test.meta?.packageId,
        discountPercent: br?.discountPercent, discountAmount: detail?.discountAmt,
        insured: br?.insured, insuranceDiscountPercent: br?.insuranceDiscountPercent,
        copayPercent: br?.copayPercent, patientAmount: detail?.patientAmt,
        insuranceAmount: detail?.insAmt, vatPercent,
        patientVat: detail?.pVat, insuranceVat: detail?.iVat,
      };
    });

    const newCase: Case = {
      id: generateId('CS'), caseNumber, patientName: fullName, patientId,
      patientAge: parseInt(patient.age) || 0, patientGender: patient.gender,
      patientDob: patient.dob || undefined, patientPhone: patient.phone || undefined,
      patientEmail: patient.email || undefined, patientMrno: patient.mrno || undefined,
      clientId: selectedClientId, clientName: selectedClient?.name || '',
      physicianId: selectedPhysicianId || undefined, physicianName: selectedPhysician?.name,
      pathologistId: selectedPathologistId || undefined, pathologistName: selectedPathologist?.fullName,
      technicianId: selectedTechnicianId || undefined, technicianName: selectedTechnician?.fullName,
      caseTypeId: selectedCaseTypeId || undefined,
      status: 'registered', priority, registeredDate: now,
      tests: caseTests, samples: generatedSamples,
      orderedProfileIds: selectedProfileIds.length > 0 ? selectedProfileIds : undefined,
      orderedPackageIds: selectedPackageIds.length > 0 ? selectedPackageIds : undefined,
      subtotal: billingDetails.subtotal, discountPercent: 0, discountAmount: billingDetails.totalDiscount,
      vatPercent, vatAmount: billingDetails.totalVatPatient + billingDetails.totalVatInsurance,
      totalAmount: billingDetails.grandTotal, patientTotal: billingDetails.grandPatient,
      insuranceTotal: billingDetails.grandInsurance,
      paymentStatus: billingDetails.totalPaid >= billingDetails.grandPatient ? 'paid' : billingDetails.totalPaid > 0 ? 'partial' : 'pending',
      paidAmount: billingDetails.totalPaid, paymentRequired: isB2C,
      paymentEntries: paymentEntries.length > 0 ? paymentEntries : undefined,
      discountComment: discountComment || undefined,
    };

    onSave(newCase);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep('client'); setPatient({ ...emptyPatient }); setPatientIdSearch('');
    setSelectedClientId(''); setSelectedPhysicianId(''); setSelectedPathologistId(''); setSelectedTechnicianId('');
    setSelectedTestIds([]); setSelectedProfileIds([]); setSelectedPackageIds([]);
    setBillingRows(new Map()); setDiscountComment(''); setPaymentEntries([]); setShowPayment(false);
    setPriority('routine'); setGeneratedSamples([]); setClientSearchQuery(''); setTestSearchQuery('');
    setSelectedCaseTypeId('');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'package': return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700';
      case 'profile': return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700';
      case 'test': return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      default: return '';
    }
  };

  const getSampleTypeColor = (type: SampleType) => {
    switch (type) {
      case 'EDTA Blood': return 'bg-purple-500';
      case 'Serum': return 'bg-amber-500';
      case 'Plasma': return 'bg-blue-400';
      case 'Urine': return 'bg-yellow-500';
      default: return 'bg-muted-foreground';
    }
  };

  const paymentMethodConfig: { method: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { method: 'cash', label: 'Cash', icon: <Banknote className="h-4 w-4" /> },
    { method: 'benefitpay', label: 'BenefitPay', icon: <Smartphone className="h-4 w-4" /> },
    { method: 'card', label: 'Card', icon: <CreditCard className="h-4 w-4" /> },
  ];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { onClose(); resetForm(); } }}>
      <DialogContent className="max-w-5xl max-h-[92vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">Create New Case</DialogTitle>
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.key}>
                <button
                  onClick={() => { const curIdx = steps.findIndex(s => s.key === currentStep); if (index <= curIdx) setCurrentStep(step.key); }}
                  className={cn('flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                    currentStep === step.key ? 'bg-primary text-primary-foreground'
                    : steps.findIndex(s => s.key === currentStep) > index ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                  )}
                >
                  {steps.findIndex(s => s.key === currentStep) > index ? <Check className="h-4 w-4" /> : step.icon}
                  <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                </button>
                {index < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(92vh-220px)]">
            <div className="p-6">

              {/* ===== STEP 1: CLIENT ===== */}
              {currentStep === 'client' && (
                <div className="space-y-5">
                  {/* Priority */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Priority</Label>
                    <div className="flex gap-3">
                      {([
                        { value: 'routine' as const, label: 'Routine', icon: <Clock className="h-4 w-4" />, color: 'border-muted-foreground/30 hover:border-primary' },
                        { value: 'urgent' as const, label: 'Urgent', icon: <AlertTriangle className="h-4 w-4" />, color: 'border-orange-400 hover:border-orange-500' },
                        { value: 'stat' as const, label: 'STAT', icon: <Zap className="h-4 w-4" />, color: 'border-destructive hover:border-destructive' },
                      ]).map(p => (
                        <button key={p.value} onClick={() => setPriority(p.value)}
                          className={cn('flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all flex-1 justify-center font-medium',
                            priority === p.value
                              ? p.value === 'stat' ? 'bg-destructive/10 border-destructive text-destructive'
                                : p.value === 'urgent' ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400'
                                : 'bg-primary/10 border-primary text-primary'
                              : `bg-card ${p.color} text-muted-foreground`
                          )}>
                          {p.icon} {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Client search */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Select Client</Label>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Search clients..." value={clientSearchQuery} onChange={(e) => setClientSearchQuery(e.target.value)} className="pl-10" />
                    </div>
                    <div className="grid gap-2 max-h-[240px] overflow-y-auto">
                      {filteredClients.map(client => (
                        <Card key={client.id} className={cn('cursor-pointer transition-all hover:border-primary/50', selectedClientId === client.id && 'border-primary bg-primary/5')}
                          onClick={() => setSelectedClientId(client.id)}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', client.type === 'B2C' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400')}>
                                  {client.type === 'B2C' ? (client.code === 'HOMEVISIT' ? <Home className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />) : <Building className="h-4 w-4" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{client.name}</span>
                                    <Badge variant="outline" className="text-xs">{client.code}</Badge>
                                    <Badge className={cn('text-xs', client.type === 'B2C' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-0' : 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-0')}>{client.type}</Badge>
                                  </div>
                                  {client.priceListId && <p className="text-xs text-primary mt-0.5">{priceLists.find(p => p.id === client.priceListId)?.name}</p>}
                                  {client.physicians && client.physicians.length > 0 && <p className="text-xs text-muted-foreground mt-0.5">{client.physicians.length} physician(s)</p>}
                                </div>
                              </div>
                              {selectedClientId === client.id && <Check className="h-5 w-5 text-primary" />}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Physician, Pathologist, Technician selections */}
                  {selectedClient && (
                    <div className="space-y-4">
                      <div className="p-3 bg-muted rounded-lg text-sm">
                        <span className="text-muted-foreground">Price scheme: </span>
                        <span className="font-medium">{clientPriceList ? clientPriceList.name : 'Standard Pricing'}
                          {clientPriceList && clientPriceList.discountPercent > 0 && <span className="text-primary ml-1">(-{clientPriceList.discountPercent}%)</span>}
                        </span>
                        {isB2C && <p className="text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Payment required at billing</p>}
                      </div>

                      {/* Physician */}
                      {physicians.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium mb-1 block flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5" /> Referring Physician</Label>
                          <Select value={selectedPhysicianId} onValueChange={setSelectedPhysicianId}>
                            <SelectTrigger><SelectValue placeholder="Select physician..." /></SelectTrigger>
                            <SelectContent>
                              {physicians.map(ph => (
                                <SelectItem key={ph.id} value={ph.id}>
                                  {ph.name}{ph.specialization ? ` — ${ph.specialization}` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Pathologist</Label>
                          <Select value={selectedPathologistId} onValueChange={setSelectedPathologistId}>
                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                              {pathologists.map(p => <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium mb-1 block">Lab Technologist</Label>
                          <Select value={selectedTechnicianId} onValueChange={setSelectedTechnicianId}>
                            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                              {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.fullName}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===== STEP 2: PATIENT ===== */}
              {currentStep === 'patient' && (
                <div className="space-y-5">
                  {/* Patient ID / MRNO lookup */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Patient ID / MRNO</Label>
                    <div className="flex gap-2">
                      <Input value={patientIdSearch} onChange={(e) => setPatientIdSearch(e.target.value)}
                        placeholder="Enter patient ID or MRNO to search..." onKeyDown={(e) => e.key === 'Enter' && handlePatientIdSearch()} />
                      <Button variant="secondary" onClick={handlePatientIdSearch}><Search className="h-4 w-4 mr-1" /> Lookup</Button>
                    </div>
                    {patient.isExisting && <p className="text-xs text-primary mt-1 flex items-center gap-1"><Check className="h-3 w-3" /> Existing patient loaded</p>}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>First Name *</Label>
                      <Input value={patient.firstName} onChange={(e) => setPatient({ ...patient, firstName: e.target.value })} placeholder="First name" className="mt-1" />
                    </div>
                    <div>
                      <Label>Middle Name</Label>
                      <Input value={patient.middleName} onChange={(e) => setPatient({ ...patient, middleName: e.target.value })} placeholder="Middle name" className="mt-1" />
                    </div>
                    <div>
                      <Label>Last Name *</Label>
                      <Input value={patient.lastName} onChange={(e) => setPatient({ ...patient, lastName: e.target.value })} placeholder="Last name" className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>MRNO</Label>
                      <Input value={patient.mrno} onChange={(e) => setPatient({ ...patient, mrno: e.target.value })} placeholder="Medical Record #" className="mt-1" />
                    </div>
                    <div>
                      <Label>Gender *</Label>
                      <Select value={patient.gender} onValueChange={(v) => setPatient({ ...patient, gender: v as Gender })}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="mb-1 block">Age Input</Label>
                      <RadioGroup value={patient.ageInputMode} onValueChange={(v) => setPatient({ ...patient, ageInputMode: v as AgeInputMode })} className="flex gap-4 mt-2">
                        <div className="flex items-center gap-1.5"><RadioGroupItem value="dob" id="dob" /><Label htmlFor="dob" className="text-sm cursor-pointer">DOB</Label></div>
                        <div className="flex items-center gap-1.5"><RadioGroupItem value="age" id="age-direct" /><Label htmlFor="age-direct" className="text-sm cursor-pointer">Age</Label></div>
                        <div className="flex items-center gap-1.5"><RadioGroupItem value="none" id="none" /><Label htmlFor="none" className="text-sm cursor-pointer">N/A</Label></div>
                      </RadioGroup>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {patient.ageInputMode === 'dob' && (
                      <div>
                        <Label>Date of Birth</Label>
                        <Input type="date" value={patient.dob} onChange={(e) => setPatient({ ...patient, dob: e.target.value })} className="mt-1" />
                        {patient.age && <p className="text-xs text-muted-foreground mt-1">Age: {patient.age}y</p>}
                      </div>
                    )}
                    {patient.ageInputMode === 'age' && (
                      <div>
                        <Label>Age (years) *</Label>
                        <Input type="number" min="0" max="150" value={patient.age} onChange={(e) => setPatient({ ...patient, age: e.target.value })} className="mt-1" />
                      </div>
                    )}
                    <div>
                      <Label>Mobile</Label>
                      <Input value={patient.phone} onChange={(e) => setPatient({ ...patient, phone: e.target.value })} placeholder="Mobile number" className="mt-1" />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input type="email" value={patient.email} onChange={(e) => setPatient({ ...patient, email: e.target.value })} placeholder="Email address" className="mt-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== STEP 3: TESTS & BILLING ===== */}
              {currentStep === 'tests' && (
                <div className="space-y-5">
                  {/* Case Type */}
                  <div>
                    <Label className="text-sm font-medium mb-1 block">Case Type (Report Title)</Label>
                    <Select value={selectedCaseTypeId} onValueChange={setSelectedCaseTypeId}>
                      <SelectTrigger><SelectValue placeholder="Select case type..." /></SelectTrigger>
                      <SelectContent>
                        {caseTypes.filter(ct => ct.isActive).map(ct => (
                          <SelectItem key={ct.id} value={ct.id}>{ct.name} — "{ct.reportTitle}"</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Test search */}
                  <div className="relative">
                    <Label className="text-sm font-medium mb-2 block">Search & Add Tests, Profiles, or Packages</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Type to search..." value={testSearchQuery}
                        onChange={(e) => { setTestSearchQuery(e.target.value); setShowTestDropdown(true); }}
                        onFocus={() => setShowTestDropdown(true)} className="pl-10" />
                    </div>
                    {showTestDropdown && (
                      <Card className="absolute z-50 w-full mt-1 max-h-[250px] overflow-y-auto shadow-lg border">
                        <CardContent className="p-1">
                          {filteredSearchItems.map(item => {
                            const isSelected = (item.type === 'test' && selectedTestIds.includes(item.id)) || (item.type === 'profile' && selectedProfileIds.includes(item.id)) || (item.type === 'package' && selectedPackageIds.includes(item.id));
                            return (
                              <button key={`${item.type}-${item.id}`}
                                className={cn('w-full text-left px-3 py-2 rounded-md flex items-center justify-between hover:bg-accent text-sm transition-colors', isSelected && 'bg-primary/10')}
                                onClick={() => addSearchItem(item)} disabled={isSelected}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <Badge variant="outline" className={cn('text-[10px] shrink-0', getTypeColor(item.type))}>
                                    {item.type === 'package' ? '📦 PKG' : item.type === 'profile' ? '🧪 PFL' : '🔬 TST'}
                                  </Badge>
                                  <div className="min-w-0">
                                    <span className="font-medium truncate block">{item.name}</span>
                                    <span className="text-xs text-muted-foreground">{item.code}{item.department ? ` • ${item.department}` : ''}{item.testCount ? ` • ${item.testCount} tests` : ''}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="font-medium">${item.price}</span>
                                  {isSelected ? <Check className="h-4 w-4 text-primary" /> : <Plus className="h-4 w-4 text-muted-foreground" />}
                                </div>
                              </button>
                            );
                          })}
                          {filteredSearchItems.length === 0 && <p className="text-center py-4 text-sm text-muted-foreground">No results found</p>}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  {showTestDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowTestDropdown(false)} />}

                  {/* Selected items badges */}
                  {(selectedPackageIds.length > 0 || selectedProfileIds.length > 0 || selectedTestIds.length > 0) && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Selected Items</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPackageIds.map(id => { const pkg = packages.find(p => p.id === id); return pkg && (
                          <Badge key={`pkg-${id}`} variant="outline" className={cn('gap-1 pr-1', getTypeColor('package'))}>📦 {pkg.name} <button onClick={() => removeItem('package', id)} className="ml-1 hover:bg-background/50 rounded-full p-0.5"><X className="h-3 w-3" /></button></Badge>
                        ); })}
                        {selectedProfileIds.map(id => { const profile = profiles.find(p => p.id === id); const inPkg = selectedPackageIds.some(pkgId => packages.find(p => p.id === pkgId)?.profiles.includes(id)); return profile && !inPkg && (
                          <Badge key={`pfl-${id}`} variant="outline" className={cn('gap-1 pr-1', getTypeColor('profile'))}>🧪 {profile.name} <button onClick={() => removeItem('profile', id)} className="ml-1 hover:bg-background/50 rounded-full p-0.5"><X className="h-3 w-3" /></button></Badge>
                        ); })}
                        {selectedTestIds.map(id => { const svc = services.find(s => s.id === id); const inProfile = selectedProfileIds.some(pid => profiles.find(p => p.id === pid)?.tests.includes(id)); const inPkg = selectedPackageIds.some(pkgId => { const pkg = packages.find(p => p.id === pkgId); if (pkg?.tests.includes(id)) return true; return pkg?.profiles.some(pid => profiles.find(p => p.id === pid)?.tests.includes(id)); }); return svc && !inProfile && !inPkg && (
                          <Badge key={`tst-${id}`} variant="outline" className={cn('gap-1 pr-1', getTypeColor('test'))}>🔬 {svc.name} <button onClick={() => removeItem('test', id)} className="ml-1 hover:bg-background/50 rounded-full p-0.5"><X className="h-3 w-3" /></button></Badge>
                        ); })}
                      </div>
                      <p className="text-xs text-muted-foreground">{allSelectedTests.length} total tests</p>
                    </div>
                  )}

                  <Separator />

                  {/* ===== BILLING GRID ===== */}
                  {allSelectedTests.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Per-Test Billing (VAT: {vatPercent}%)</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="text-left p-2 font-medium min-w-[140px]">Test</th>
                                <th className="text-right p-2 font-medium w-[60px]">Price</th>
                                <th className="text-center p-2 font-medium w-[60px]">Disc%</th>
                                <th className="text-right p-2 font-medium w-[55px]">Disc$</th>
                                <th className="text-center p-2 font-medium w-[50px]">Ins?</th>
                                <th className="text-center p-2 font-medium w-[60px]">Ins D%</th>
                                <th className="text-center p-2 font-medium w-[60px]">CoPay%</th>
                                <th className="text-right p-2 font-medium w-[65px]">Patient</th>
                                <th className="text-right p-2 font-medium w-[65px]">Insure</th>
                                <th className="text-right p-2 font-medium w-[55px]">VAT(P)</th>
                                <th className="text-right p-2 font-medium w-[55px]">VAT(I)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {billingDetails.rows.map(row => {
                                const br = billingRows.get(row.testId);
                                return (
                                  <tr key={row.testId} className="border-b hover:bg-muted/30">
                                    <td className="p-2">
                                      <span className="font-medium">{row.testCode}</span>
                                      <span className="text-muted-foreground ml-1 hidden sm:inline">{row.testName.length > 18 ? row.testName.slice(0, 18) + '…' : row.testName}</span>
                                    </td>
                                    <td className="text-right p-2">{row.price.toFixed(0)}</td>
                                    <td className="p-1">
                                      <Input type="number" min="0" max="100" className="h-7 w-14 text-xs text-center p-1"
                                        value={br?.discountPercent || 0}
                                        onChange={(e) => updateBillingRow(row.testId, { discountPercent: parseFloat(e.target.value) || 0 })} />
                                    </td>
                                    <td className="text-right p-2 text-muted-foreground">{row.discountAmt > 0 ? `-${row.discountAmt.toFixed(0)}` : '—'}</td>
                                    <td className="p-1 text-center">
                                      <Checkbox checked={br?.insured || false}
                                        onCheckedChange={(checked) => updateBillingRow(row.testId, { insured: !!checked })} />
                                    </td>
                                    <td className="p-1">
                                      <Input type="number" min="0" max="100" className="h-7 w-14 text-xs text-center p-1"
                                        value={br?.insuranceDiscountPercent || 0} disabled={!br?.insured}
                                        onChange={(e) => updateBillingRow(row.testId, { insuranceDiscountPercent: parseFloat(e.target.value) || 0 })} />
                                    </td>
                                    <td className="p-1">
                                      <Input type="number" min="0" max="100" className="h-7 w-14 text-xs text-center p-1"
                                        value={br?.copayPercent || 0} disabled={!br?.insured}
                                        onChange={(e) => updateBillingRow(row.testId, { copayPercent: parseFloat(e.target.value) || 0 })} />
                                    </td>
                                    <td className="text-right p-2 font-medium">{row.patientAmt.toFixed(1)}</td>
                                    <td className="text-right p-2 font-medium text-blue-600 dark:text-blue-400">{row.insAmt > 0 ? row.insAmt.toFixed(1) : '—'}</td>
                                    <td className="text-right p-2 text-muted-foreground">{row.pVat.toFixed(1)}</td>
                                    <td className="text-right p-2 text-muted-foreground">{row.iVat > 0 ? row.iVat.toFixed(1) : '—'}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 font-medium text-sm">
                                <td className="p-2" colSpan={2}>Totals</td>
                                <td className="p-2" colSpan={2} />
                                <td className="p-2" colSpan={3} />
                                <td className="text-right p-2">{billingDetails.totalPatient.toFixed(1)}</td>
                                <td className="text-right p-2 text-blue-600 dark:text-blue-400">{billingDetails.totalInsurance.toFixed(1)}</td>
                                <td className="text-right p-2">{billingDetails.totalVatPatient.toFixed(1)}</td>
                                <td className="text-right p-2">{billingDetails.totalVatInsurance.toFixed(1)}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>

                        {/* Billing summary */}
                        <div className="p-4 space-y-2 border-t">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between"><span>Subtotal</span><span>${billingDetails.subtotal.toFixed(2)}</span></div>
                              {billingDetails.totalDiscount > 0 && <div className="flex justify-between text-destructive"><span>Total Discount</span><span>-${billingDetails.totalDiscount.toFixed(2)}</span></div>}
                              <div className="flex justify-between"><span>VAT ({vatPercent}%)</span><span>${(billingDetails.totalVatPatient + billingDetails.totalVatInsurance).toFixed(2)}</span></div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm p-2 bg-primary/10 rounded font-medium"><span>Patient Total</span><span>${billingDetails.grandPatient.toFixed(2)}</span></div>
                              {billingDetails.grandInsurance > 0 && (
                                <div className="flex justify-between text-sm p-2 bg-blue-500/10 rounded font-medium text-blue-700 dark:text-blue-300"><span>Insurance Total</span><span>${billingDetails.grandInsurance.toFixed(2)}</span></div>
                              )}
                              <div className="flex justify-between text-base font-bold p-2 bg-muted rounded-lg"><span>Grand Total</span><span>${billingDetails.grandTotal.toFixed(2)}</span></div>
                            </div>
                          </div>

                          {/* Discount comment */}
                          {billingDetails.hasDiscount && (
                            <div>
                              <Label className="text-xs">Discount Reason (required)</Label>
                              <Input value={discountComment} onChange={(e) => setDiscountComment(e.target.value)} placeholder="Explain discount reason..." className="mt-1 text-sm" />
                            </div>
                          )}

                          {/* Payment Section */}
                          {isB2C && (
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium flex items-center gap-1"><Banknote className="h-4 w-4" /> Payment</Label>
                                <div className="flex gap-1">
                                  {paymentMethodConfig.map(pm => (
                                    <Button key={pm.method} variant="outline" size="sm" className="text-xs h-7 gap-1"
                                      onClick={() => addPaymentEntry(pm.method)}>
                                      {pm.icon} {pm.label}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              {paymentEntries.map((entry, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Badge variant="outline" className="shrink-0 text-xs gap-1">
                                    {paymentMethodConfig.find(p => p.method === entry.method)?.icon}
                                    {paymentMethodConfig.find(p => p.method === entry.method)?.label}
                                  </Badge>
                                  <Input type="number" min="0" value={entry.amount || ''} placeholder="Amount"
                                    onChange={(e) => updatePaymentEntry(idx, { amount: parseFloat(e.target.value) || 0 })} className="w-28 h-8 text-sm" />
                                  {(entry.method === 'card' || entry.method === 'benefitpay') && (
                                    <Input value={entry.reference || ''} placeholder="Reference #"
                                      onChange={(e) => updatePaymentEntry(idx, { reference: e.target.value })} className="flex-1 h-8 text-sm" />
                                  )}
                                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removePaymentEntry(idx)}><X className="h-3 w-3" /></Button>
                                </div>
                              ))}

                              {paymentEntries.length > 0 && (
                                <div className={cn('flex justify-between text-sm font-medium p-2 rounded-lg',
                                  billingDetails.balance > 0.01 ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400')}>
                                  <span>Balance</span><span>${billingDetails.balance.toFixed(2)}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {!isB2C && <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle className="h-3 w-3" /> B2B client — payment on credit terms</p>}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ===== STEP 4: TUBES ===== */}
              {currentStep === 'tubes' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Required Tubes</h3>
                      <p className="text-sm text-muted-foreground">{generatedSamples.length} tube(s) auto-generated</p>
                    </div>
                    <Button onClick={handlePrintLabels}><Printer className="h-4 w-4 mr-2" /> Print Labels (ZPL)</Button>
                  </div>

                  {generatedSamples.map(sample => (
                    <Card key={sample.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={cn('w-3 h-3 rounded-full', getSampleTypeColor(sample.sampleType))} />
                            <span className="font-medium">{sample.sampleType}</span>
                            <Badge variant="outline" className="text-xs">Pending Collection</Badge>
                          </div>
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{sample.tubeId}</code>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {sample.testIds.map(tid => { const svc = services.find(s => s.id === tid); return svc && <Badge key={tid} variant="secondary" className="text-xs">{svc.code}</Badge>; })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Tubes auto-generated. Collection status tracked after case creation.</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={currentStep === 'client' ? () => { onClose(); resetForm(); } : goToPrevStep}>
            <ChevronLeft className="h-4 w-4 mr-1" /> {currentStep === 'client' ? 'Cancel' : 'Back'}
          </Button>
          <Button onClick={currentStep === 'tubes' ? handleSave : goToNextStep} disabled={!canProceed()}>
            {currentStep === 'tubes' ? <><Check className="h-4 w-4 mr-1" /> Create Case</> : <>Next <ChevronRight className="h-4 w-4 ml-1" /></>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
