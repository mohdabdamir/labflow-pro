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
import { 
  User, Building, TestTubes, Beaker,
  ChevronRight, ChevronLeft, Check, Search,
  AlertCircle, Percent, Printer, Zap, Clock,
  AlertTriangle, X, Plus, Home, UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useServices, useClients, useProfiles, usePackages, usePriceLists, usePatients } from '@/hooks/useLabData';
import { generateId, generateCaseNumber, generatePatientId } from '@/data/mockData';
import { generateTubeId } from '@/lib/tubeIdGenerator';
import { printZPLLabels, type LabelData } from '@/lib/zplLabelGenerator';
import type { Case, CaseTest, Gender, SampleType, Department, AgeInputMode, Sample } from '@/types/lab';
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
  name: string;
  gender: Gender;
  dob: string;
  age: string;
  ageInputMode: AgeInputMode;
  phone: string;
  email: string;
  address: string;
  referringDoctor: string;
  clinicalNotes: string;
  isExisting: boolean;
}

// Searchable item for the unified dropdown
interface SearchableItem {
  id: string;
  type: 'test' | 'profile' | 'package';
  code: string;
  name: string;
  department?: string;
  price: number;
  testCount?: number;
}

export function CaseCreationWizard({ open, onClose, onSave }: CaseCreationWizardProps) {
  const { services } = useServices();
  const { clients } = useClients();
  const { profiles } = useProfiles();
  const { packages } = usePackages();
  const { priceLists } = usePriceLists();
  const { patients, addPatient, getPatientById } = usePatients();

  const [currentStep, setCurrentStep] = useState<WizardStep>('client');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  
  // Client selection
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Patient data
  const [patient, setPatient] = useState<PatientData>({
    id: '', name: '', gender: 'Male', dob: '', age: '',
    ageInputMode: 'age', phone: '', email: '', address: '',
    referringDoctor: '', clinicalNotes: '', isExisting: false,
  });
  const [patientIdSearch, setPatientIdSearch] = useState('');

  // Test selection - unified
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [showTestDropdown, setShowTestDropdown] = useState(false);

  // Billing
  const [manualDiscount, setManualDiscount] = useState<string>('0');
  const [paymentReceived, setPaymentReceived] = useState<string>('0');

  // Tubes (auto-generated)
  const [generatedSamples, setGeneratedSamples] = useState<Sample[]>([]);

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientPriceList = priceLists.find(p => p.id === selectedClient?.priceListId);
  const isB2C = selectedClient?.type === 'B2C';

  // Filter clients
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
    
    // Packages
    packages.filter(p => p.isActive).forEach(pkg => {
      items.push({
        id: pkg.id, type: 'package', code: pkg.code,
        name: pkg.name, price: pkg.price,
        testCount: pkg.profiles.reduce((sum, pid) => {
          const p = profiles.find(pr => pr.id === pid);
          return sum + (p ? p.tests.length : 0);
        }, 0) + pkg.tests.length,
      });
    });

    // Profiles
    profiles.filter(p => p.isActive).forEach(profile => {
      items.push({
        id: profile.id, type: 'profile', code: profile.code,
        name: profile.name, department: profile.department,
        price: profile.price, testCount: profile.tests.length,
      });
    });

    // Individual tests
    services.filter(s => s.isActive).forEach(svc => {
      items.push({
        id: svc.id, type: 'test', code: svc.code,
        name: svc.name, department: svc.department,
        price: svc.price,
      });
    });

    return items;
  }, [services, profiles, packages]);

  const filteredSearchItems = useMemo(() => {
    if (!testSearchQuery.trim()) return searchableItems.slice(0, 15);
    const q = testSearchQuery.toLowerCase();
    return searchableItems.filter(item =>
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q)
    ).slice(0, 20);
  }, [searchableItems, testSearchQuery]);

  // Get all resolved tests from selections
  const allSelectedTests = useMemo(() => {
    const testIdsSet = new Set<string>(selectedTestIds);
    const testMeta: Map<string, { profileId?: string; profileName?: string; packageId?: string }> = new Map();

    // From profiles
    selectedProfileIds.forEach(profileId => {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        profile.tests.forEach(tid => {
          testIdsSet.add(tid);
          testMeta.set(tid, { ...(testMeta.get(tid) || {}), profileId, profileName: profile.name });
        });
      }
    });

    // From packages
    selectedPackageIds.forEach(pkgId => {
      const pkg = packages.find(p => p.id === pkgId);
      if (pkg) {
        pkg.tests.forEach(tid => {
          testIdsSet.add(tid);
          testMeta.set(tid, { ...(testMeta.get(tid) || {}), packageId: pkgId });
        });
        pkg.profiles.forEach(profileId => {
          const profile = profiles.find(p => p.id === profileId);
          if (profile) {
            profile.tests.forEach(tid => {
              testIdsSet.add(tid);
              testMeta.set(tid, { ...(testMeta.get(tid) || {}), profileId, profileName: profile.name, packageId: pkgId });
            });
          }
        });
      }
    });

    return Array.from(testIdsSet).map(tid => {
      const svc = services.find(s => s.id === tid);
      return svc ? { ...svc, meta: testMeta.get(tid) || {} } : null;
    }).filter(Boolean) as (typeof services[0] & { meta: { profileId?: string; profileName?: string; packageId?: string } })[];
  }, [selectedTestIds, selectedProfileIds, selectedPackageIds, services, profiles, packages]);

  // Calculate billing
  const billing = useMemo(() => {
    let subtotal = 0;

    // Package prices
    selectedPackageIds.forEach(id => {
      const pkg = packages.find(p => p.id === id);
      if (pkg) subtotal += pkg.price;
    });

    // Profile prices (only non-package)
    selectedProfileIds.forEach(id => {
      const profile = profiles.find(p => p.id === id);
      // Skip if this profile is already part of a selected package
      const inPackage = selectedPackageIds.some(pkgId => {
        const pkg = packages.find(p => p.id === pkgId);
        return pkg?.profiles.includes(id);
      });
      if (profile && !inPackage) subtotal += profile.price;
    });

    // Individual test prices (only non-profile, non-package)
    selectedTestIds.forEach(id => {
      const svc = services.find(s => s.id === id);
      const inProfile = selectedProfileIds.some(pid => {
        const profile = profiles.find(p => p.id === pid);
        return profile?.tests.includes(id);
      });
      const inPackage = selectedPackageIds.some(pkgId => {
        const pkg = packages.find(p => p.id === pkgId);
        if (pkg?.tests.includes(id)) return true;
        return pkg?.profiles.some(pid => {
          const profile = profiles.find(p => p.id === pid);
          return profile?.tests.includes(id);
        });
      });
      if (svc && !inProfile && !inPackage) subtotal += svc.price;
    });

    const clientDiscountPercent = clientPriceList?.discountPercent || 0;
    const manualDiscountPercent = parseFloat(manualDiscount) || 0;
    const totalDiscountPercent = Math.min(clientDiscountPercent + manualDiscountPercent, 100);
    const discountAmount = (subtotal * totalDiscountPercent) / 100;
    const totalAmount = subtotal - discountAmount;
    const paid = parseFloat(paymentReceived) || 0;

    return { subtotal, clientDiscountPercent, manualDiscountPercent, totalDiscountPercent, discountAmount, totalAmount, paid, balance: totalAmount - paid };
  }, [selectedTestIds, selectedProfileIds, selectedPackageIds, services, profiles, packages, clientPriceList, manualDiscount, paymentReceived]);

  // Generate tubes when moving to tubes step
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
      const tubeId = generateTubeId(sampleType);
      samples.push({
        id: generateId('SM'),
        tubeId,
        sampleType,
        status: 'pending',
        testIds,
      });
    });

    setGeneratedSamples(samples);
  }, [allSelectedTests]);

  // Patient ID lookup
  const handlePatientIdSearch = useCallback(() => {
    if (!patientIdSearch.trim()) return;
    const found = getPatientById(patientIdSearch.trim());
    if (found) {
      setPatient({
        id: found.id,
        name: found.name,
        gender: found.gender,
        dob: found.dob || '',
        age: found.age?.toString() || '',
        ageInputMode: found.ageInputMode,
        phone: found.phone || '',
        email: found.email || '',
        address: found.address || '',
        referringDoctor: '',
        clinicalNotes: '',
        isExisting: true,
      });
      toast.success(`Patient "${found.name}" loaded`);
    } else {
      setPatient(prev => ({ ...prev, id: patientIdSearch.trim(), isExisting: false }));
      toast.info('New patient ID - fill in details');
    }
  }, [patientIdSearch, getPatientById]);

  // Calculate age from DOB
  useEffect(() => {
    if (patient.ageInputMode === 'dob' && patient.dob) {
      const birthDate = new Date(patient.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      setPatient(prev => ({ ...prev, age: age.toString() }));
    }
  }, [patient.dob, patient.ageInputMode]);

  const addSearchItem = (item: SearchableItem) => {
    if (item.type === 'test') {
      if (!selectedTestIds.includes(item.id)) {
        setSelectedTestIds(prev => [...prev, item.id]);
      }
    } else if (item.type === 'profile') {
      if (!selectedProfileIds.includes(item.id)) {
        setSelectedProfileIds(prev => [...prev, item.id]);
      }
    } else if (item.type === 'package') {
      if (!selectedPackageIds.includes(item.id)) {
        setSelectedPackageIds(prev => [...prev, item.id]);
      }
    }
    setTestSearchQuery('');
    setShowTestDropdown(false);
  };

  const removeItem = (type: string, id: string) => {
    if (type === 'test') setSelectedTestIds(prev => prev.filter(i => i !== id));
    else if (type === 'profile') setSelectedProfileIds(prev => prev.filter(i => i !== id));
    else if (type === 'package') setSelectedPackageIds(prev => prev.filter(i => i !== id));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'client': return !!selectedClientId;
      case 'patient': return patient.name.trim() && patient.gender && (patient.ageInputMode === 'none' || patient.age);
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
    const patientAge = parseInt(patient.age) || 0;
    const caseNo = generateCaseNumber();
    const labels: LabelData[] = generatedSamples.map(s => ({
      patientName: patient.name,
      patientId: patient.id || generatePatientId(),
      caseNumber: caseNo,
      dateCreated: new Date().toISOString(),
      tubeId: s.tubeId,
      sampleType: s.sampleType,
    }));
    printZPLLabels(labels);
    toast.success(`${labels.length} label(s) sent to printer`);
  };

  const handleSave = () => {
    const patientId = patient.id || generatePatientId();
    const caseNumber = generateCaseNumber();
    const now = new Date().toISOString();

    // Save patient for future lookup
    addPatient({
      id: patientId,
      name: patient.name,
      gender: patient.gender,
      dob: patient.dob || undefined,
      age: parseInt(patient.age) || undefined,
      ageInputMode: patient.ageInputMode,
      phone: patient.phone || undefined,
      email: patient.email || undefined,
      address: patient.address || undefined,
      createdAt: now,
    });

    // Build CaseTest array with tubeId assignments
    const tubeAssignment = new Map<string, string>();
    generatedSamples.forEach(s => {
      s.testIds.forEach(tid => tubeAssignment.set(tid, s.tubeId));
    });

    const caseTests: CaseTest[] = allSelectedTests.map(test => ({
      testId: test.id,
      testCode: test.code,
      testName: test.name,
      department: test.department as Department,
      sampleType: test.sampleType as SampleType,
      price: test.price,
      status: 'pending' as const,
      unit: test.unit,
      tubeId: tubeAssignment.get(test.id),
      profileId: test.meta?.profileId,
      profileName: test.meta?.profileName,
      packageId: test.meta?.packageId,
    }));

    const newCase: Case = {
      id: generateId('CS'),
      caseNumber,
      patientName: patient.name,
      patientId,
      patientAge: parseInt(patient.age) || 0,
      patientGender: patient.gender,
      patientDob: patient.dob || undefined,
      patientPhone: patient.phone || undefined,
      patientEmail: patient.email || undefined,
      patientAddress: patient.address || undefined,
      referringDoctor: patient.referringDoctor || undefined,
      clinicalNotes: patient.clinicalNotes || undefined,
      clientId: selectedClientId,
      clientName: selectedClient?.name || '',
      status: 'registered',
      priority,
      registeredDate: now,
      tests: caseTests,
      samples: generatedSamples,
      orderedProfileIds: selectedProfileIds.length > 0 ? selectedProfileIds : undefined,
      orderedPackageIds: selectedPackageIds.length > 0 ? selectedPackageIds : undefined,
      subtotal: billing.subtotal,
      discountPercent: billing.totalDiscountPercent,
      discountAmount: billing.discountAmount,
      totalAmount: billing.totalAmount,
      paymentStatus: billing.paid >= billing.totalAmount ? 'paid' : billing.paid > 0 ? 'partial' : 'pending',
      paidAmount: billing.paid,
      paymentRequired: isB2C,
    };

    onSave(newCase);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep('client');
    setPatient({ id: '', name: '', gender: 'Male', dob: '', age: '', ageInputMode: 'age', phone: '', email: '', address: '', referringDoctor: '', clinicalNotes: '', isExisting: false });
    setPatientIdSearch('');
    setSelectedClientId('');
    setSelectedTestIds([]);
    setSelectedProfileIds([]);
    setSelectedPackageIds([]);
    setManualDiscount('0');
    setPaymentReceived('0');
    setPriority('routine');
    setGeneratedSamples([]);
    setClientSearchQuery('');
    setTestSearchQuery('');
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

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { onClose(); resetForm(); } }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">Create New Case</DialogTitle>
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.key}>
                <button
                  onClick={() => {
                    const curIdx = steps.findIndex(s => s.key === currentStep);
                    if (index <= curIdx) setCurrentStep(step.key);
                  }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                    currentStep === step.key
                      ? 'bg-primary text-primary-foreground'
                      : steps.findIndex(s => s.key === currentStep) > index
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {steps.findIndex(s => s.key === currentStep) > index
                    ? <Check className="h-4 w-4" />
                    : step.icon}
                  <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                </button>
                {index < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </React.Fragment>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-220px)]">
            <div className="p-6">

              {/* ===== STEP 1: CLIENT ===== */}
              {currentStep === 'client' && (
                <div className="space-y-5">
                  {/* Priority Selection with icons */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Priority</Label>
                    <div className="flex gap-3">
                      {([
                        { value: 'routine' as const, label: 'Routine', icon: <Clock className="h-4 w-4" />, color: 'border-muted-foreground/30 hover:border-primary' },
                        { value: 'urgent' as const, label: 'Urgent', icon: <AlertTriangle className="h-4 w-4" />, color: 'border-orange-400 hover:border-orange-500' },
                        { value: 'stat' as const, label: 'STAT', icon: <Zap className="h-4 w-4" />, color: 'border-destructive hover:border-destructive' },
                      ]).map(p => (
                        <button
                          key={p.value}
                          onClick={() => setPriority(p.value)}
                          className={cn(
                            'flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all flex-1 justify-center font-medium',
                            priority === p.value
                              ? p.value === 'stat' ? 'bg-destructive/10 border-destructive text-destructive'
                                : p.value === 'urgent' ? 'bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400'
                                : 'bg-primary/10 border-primary text-primary'
                              : `bg-card ${p.color} text-muted-foreground`
                          )}
                        >
                          {p.icon}
                          {p.label}
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
                      <Input
                        placeholder="Search clients..."
                        value={clientSearchQuery}
                        onChange={(e) => setClientSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="grid gap-2 max-h-[320px] overflow-y-auto">
                      {filteredClients.map(client => (
                        <Card
                          key={client.id}
                          className={cn(
                            'cursor-pointer transition-all hover:border-primary/50',
                            selectedClientId === client.id && 'border-primary bg-primary/5'
                          )}
                          onClick={() => setSelectedClientId(client.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  'h-9 w-9 rounded-lg flex items-center justify-center',
                                  client.type === 'B2C' ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                                )}>
                                  {client.type === 'B2C' 
                                    ? (client.code === 'HOMEVISIT' ? <Home className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />)
                                    : <Building className="h-4 w-4" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{client.name}</span>
                                    <Badge variant="outline" className="text-xs">{client.code}</Badge>
                                    <Badge className={cn('text-xs', client.type === 'B2C' ? 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-0' : 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-0')}>
                                      {client.type}
                                    </Badge>
                                  </div>
                                  {client.priceListId && (
                                    <p className="text-xs text-primary mt-0.5">
                                      {priceLists.find(p => p.id === client.priceListId)?.name}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {selectedClientId === client.id && <Check className="h-5 w-5 text-primary" />}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Selected client info */}
                  {selectedClient && (
                    <div className="p-3 bg-muted rounded-lg text-sm">
                      <span className="text-muted-foreground">Price scheme: </span>
                      <span className="font-medium">
                        {clientPriceList ? clientPriceList.name : 'Standard Pricing'}
                        {clientPriceList && clientPriceList.discountPercent > 0 && (
                          <span className="text-primary ml-1">(-{clientPriceList.discountPercent}%)</span>
                        )}
                      </span>
                      {isB2C && (
                        <p className="text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Payment required at billing
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ===== STEP 2: PATIENT ===== */}
              {currentStep === 'patient' && (
                <div className="space-y-5">
                  {/* Patient ID lookup */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Patient ID</Label>
                    <div className="flex gap-2">
                      <Input
                        value={patientIdSearch}
                        onChange={(e) => setPatientIdSearch(e.target.value)}
                        placeholder="Enter patient ID to search..."
                        onKeyDown={(e) => e.key === 'Enter' && handlePatientIdSearch()}
                      />
                      <Button variant="secondary" onClick={handlePatientIdSearch}>
                        <Search className="h-4 w-4 mr-1" />
                        Lookup
                      </Button>
                    </div>
                    {patient.isExisting && (
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Existing patient loaded
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Patient Name *</Label>
                      <Input value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })} placeholder="Full name" className="mt-1" />
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

                    {/* Age input mode */}
                    <div>
                      <Label className="mb-2 block">Age Input</Label>
                      <RadioGroup
                        value={patient.ageInputMode}
                        onValueChange={(v) => setPatient({ ...patient, ageInputMode: v as AgeInputMode })}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-1.5">
                          <RadioGroupItem value="dob" id="dob" />
                          <Label htmlFor="dob" className="text-sm cursor-pointer">DOB</Label>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <RadioGroupItem value="age" id="age-direct" />
                          <Label htmlFor="age-direct" className="text-sm cursor-pointer">Age</Label>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <RadioGroupItem value="none" id="none" />
                          <Label htmlFor="none" className="text-sm cursor-pointer">N/A</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {patient.ageInputMode === 'dob' && (
                      <div>
                        <Label>Date of Birth</Label>
                        <Input type="date" value={patient.dob} onChange={(e) => setPatient({ ...patient, dob: e.target.value })} className="mt-1" />
                        {patient.age && <p className="text-xs text-muted-foreground mt-1">Calculated age: {patient.age} years</p>}
                      </div>
                    )}

                    {patient.ageInputMode === 'age' && (
                      <div>
                        <Label>Age (years) *</Label>
                        <Input type="number" min="0" max="150" value={patient.age} onChange={(e) => setPatient({ ...patient, age: e.target.value })} placeholder="Years" className="mt-1" />
                      </div>
                    )}

                    <div>
                      <Label>Phone</Label>
                      <Input value={patient.phone} onChange={(e) => setPatient({ ...patient, phone: e.target.value })} placeholder="Phone" className="mt-1" />
                    </div>
                    <div>
                      <Label>Referring Doctor</Label>
                      <Input value={patient.referringDoctor} onChange={(e) => setPatient({ ...patient, referringDoctor: e.target.value })} placeholder="Doctor name" className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Address</Label>
                      <Input value={patient.address} onChange={(e) => setPatient({ ...patient, address: e.target.value })} placeholder="Full address" className="mt-1" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Clinical Notes</Label>
                      <Textarea value={patient.clinicalNotes} onChange={(e) => setPatient({ ...patient, clinicalNotes: e.target.value })} placeholder="Clinical history, symptoms..." className="mt-1" rows={2} />
                    </div>
                  </div>
                </div>
              )}

              {/* ===== STEP 3: TESTS & BILLING ===== */}
              {currentStep === 'tests' && (
                <div className="space-y-5">
                  {/* Unified search dropdown */}
                  <div className="relative">
                    <Label className="text-sm font-medium mb-2 block">Search & Add Tests, Profiles, or Packages</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Type to search tests, profiles, packages..."
                        value={testSearchQuery}
                        onChange={(e) => { setTestSearchQuery(e.target.value); setShowTestDropdown(true); }}
                        onFocus={() => setShowTestDropdown(true)}
                        className="pl-10"
                      />
                    </div>

                    {showTestDropdown && (
                      <Card className="absolute z-50 w-full mt-1 max-h-[280px] overflow-y-auto shadow-lg border">
                        <CardContent className="p-1">
                          {filteredSearchItems.map(item => {
                            const isSelected = 
                              (item.type === 'test' && selectedTestIds.includes(item.id)) ||
                              (item.type === 'profile' && selectedProfileIds.includes(item.id)) ||
                              (item.type === 'package' && selectedPackageIds.includes(item.id));
                            return (
                              <button
                                key={`${item.type}-${item.id}`}
                                className={cn(
                                  'w-full text-left px-3 py-2 rounded-md flex items-center justify-between hover:bg-accent text-sm transition-colors',
                                  isSelected && 'bg-primary/10'
                                )}
                                onClick={() => addSearchItem(item)}
                                disabled={isSelected}
                              >
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
                          {filteredSearchItems.length === 0 && (
                            <p className="text-center py-4 text-sm text-muted-foreground">No results found</p>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Click outside to close dropdown */}
                  {showTestDropdown && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowTestDropdown(false)} />
                  )}

                  {/* Selected items */}
                  {(selectedPackageIds.length > 0 || selectedProfileIds.length > 0 || selectedTestIds.length > 0) && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Selected Items</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPackageIds.map(id => {
                          const pkg = packages.find(p => p.id === id);
                          return pkg && (
                            <Badge key={`pkg-${id}`} variant="outline" className={cn('gap-1 pr-1', getTypeColor('package'))}>
                              📦 {pkg.name} (${pkg.price})
                              <button onClick={() => removeItem('package', id)} className="ml-1 hover:bg-background/50 rounded-full p-0.5">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                        {selectedProfileIds.map(id => {
                          const profile = profiles.find(p => p.id === id);
                          const inPackage = selectedPackageIds.some(pkgId => packages.find(p => p.id === pkgId)?.profiles.includes(id));
                          return profile && !inPackage && (
                            <Badge key={`pfl-${id}`} variant="outline" className={cn('gap-1 pr-1', getTypeColor('profile'))}>
                              🧪 {profile.name} (${profile.price})
                              <button onClick={() => removeItem('profile', id)} className="ml-1 hover:bg-background/50 rounded-full p-0.5">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                        {selectedTestIds.map(id => {
                          const svc = services.find(s => s.id === id);
                          const inProfile = selectedProfileIds.some(pid => profiles.find(p => p.id === pid)?.tests.includes(id));
                          const inPackage = selectedPackageIds.some(pkgId => {
                            const pkg = packages.find(p => p.id === pkgId);
                            if (pkg?.tests.includes(id)) return true;
                            return pkg?.profiles.some(pid => profiles.find(p => p.id === pid)?.tests.includes(id));
                          });
                          return svc && !inProfile && !inPackage && (
                            <Badge key={`tst-${id}`} variant="outline" className={cn('gap-1 pr-1', getTypeColor('test'))}>
                              🔬 {svc.name} (${svc.price})
                              <button onClick={() => removeItem('test', id)} className="ml-1 hover:bg-background/50 rounded-full p-0.5">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">{allSelectedTests.length} total tests</p>
                    </div>
                  )}

                  <Separator />

                  {/* Billing Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Billing Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Line items */}
                      {selectedPackageIds.map(id => {
                        const pkg = packages.find(p => p.id === id);
                        return pkg && <div key={id} className="flex justify-between text-sm"><span>📦 {pkg.name}</span><span>${pkg.price.toFixed(2)}</span></div>;
                      })}
                      {selectedProfileIds.map(id => {
                        const profile = profiles.find(p => p.id === id);
                        const inPkg = selectedPackageIds.some(pkgId => packages.find(p => p.id === pkgId)?.profiles.includes(id));
                        return profile && !inPkg && <div key={id} className="flex justify-between text-sm"><span>🧪 {profile.name}</span><span>${profile.price.toFixed(2)}</span></div>;
                      })}
                      {selectedTestIds.map(id => {
                        const svc = services.find(s => s.id === id);
                        const inProfile = selectedProfileIds.some(pid => profiles.find(p => p.id === pid)?.tests.includes(id));
                        const inPkg = selectedPackageIds.some(pkgId => {
                          const pkg = packages.find(p => p.id === pkgId);
                          if (pkg?.tests.includes(id)) return true;
                          return pkg?.profiles.some(pid => profiles.find(p => p.id === pid)?.tests.includes(id));
                        });
                        return svc && !inProfile && !inPkg && <div key={id} className="flex justify-between text-sm"><span>🔬 {svc.name}</span><span>${svc.price.toFixed(2)}</span></div>;
                      })}

                      <Separator />
                      <div className="flex justify-between font-medium"><span>Subtotal</span><span>${billing.subtotal.toFixed(2)}</span></div>

                      {billing.clientDiscountPercent > 0 && (
                        <div className="flex justify-between text-sm p-2 bg-primary/10 rounded"><span>Client Discount</span><span className="text-primary">-{billing.clientDiscountPercent}%</span></div>
                      )}

                      <div className="flex items-center gap-3">
                        <Label className="text-sm whitespace-nowrap">Extra Discount (%)</Label>
                        <Input type="number" min="0" max="100" value={manualDiscount} onChange={(e) => setManualDiscount(e.target.value)} className="w-24" />
                      </div>

                      {billing.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-destructive"><span>Total Discount ({billing.totalDiscountPercent}%)</span><span>-${billing.discountAmount.toFixed(2)}</span></div>
                      )}

                      <div className="flex justify-between text-lg font-bold p-3 bg-primary/10 rounded-lg"><span>Total</span><span>${billing.totalAmount.toFixed(2)}</span></div>

                      {/* Payment - only required for B2C */}
                      {isB2C && (
                        <>
                          <div className="flex items-center gap-3">
                            <Label className="text-sm whitespace-nowrap">Amount Received</Label>
                            <Input type="number" min="0" value={paymentReceived} onChange={(e) => setPaymentReceived(e.target.value)} className="w-32" />
                          </div>
                          <div className={cn(
                            'flex justify-between text-sm font-medium p-2 rounded-lg',
                            billing.balance > 0 ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400' : 'bg-status-completed/10 text-status-completed'
                          )}>
                            <span>Balance</span><span>${billing.balance.toFixed(2)}</span>
                          </div>
                        </>
                      )}

                      {!isB2C && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle className="h-3 w-3" /> B2B client - payment on credit terms</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ===== STEP 4: TUBES & PRINT ===== */}
              {currentStep === 'tubes' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Required Tubes</h3>
                      <p className="text-sm text-muted-foreground">{generatedSamples.length} tube(s) auto-generated</p>
                    </div>
                    <Button onClick={handlePrintLabels} variant="default">
                      <Printer className="h-4 w-4 mr-2" />
                      Print Labels (ZPL)
                    </Button>
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
                          {sample.testIds.map(tid => {
                            const svc = services.find(s => s.id === tid);
                            return svc && (
                              <Badge key={tid} variant="secondary" className="text-xs">{svc.code}</Badge>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Tubes are auto-generated. Collection status will be tracked after case creation.</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={currentStep === 'client' ? () => { onClose(); resetForm(); } : goToPrevStep}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentStep === 'client' ? 'Cancel' : 'Back'}
          </Button>
          <Button onClick={currentStep === 'tubes' ? handleSave : goToNextStep} disabled={!canProceed()}>
            {currentStep === 'tubes' ? (
              <><Check className="h-4 w-4 mr-1" /> Create Case</>
            ) : (
              <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
