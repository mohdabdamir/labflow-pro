import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Building, TestTubes, CreditCard, 
  ChevronRight, ChevronLeft, Check, Search,
  AlertCircle, Percent
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useServices, useClients, useProfiles, usePriceLists } from '@/hooks/useLabData';
import { generateId, generateCaseNumber, generatePatientId } from '@/data/mockData';
import type { Case, CaseTest, Gender, SampleType, Department } from '@/types/lab';

interface CaseCreationWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (newCase: Case) => void;
}

type WizardStep = 'patient' | 'client' | 'tests' | 'billing';

interface PatientData {
  name: string;
  age: string;
  gender: Gender;
  dob: string;
  phone: string;
  email: string;
  address: string;
  referringDoctor: string;
  clinicalNotes: string;
}

const steps: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
  { key: 'patient', label: 'Patient Info', icon: <User className="h-4 w-4" /> },
  { key: 'client', label: 'Client', icon: <Building className="h-4 w-4" /> },
  { key: 'tests', label: 'Tests', icon: <TestTubes className="h-4 w-4" /> },
  { key: 'billing', label: 'Billing', icon: <CreditCard className="h-4 w-4" /> },
];

export function CaseCreationWizard({ open, onClose, onSave }: CaseCreationWizardProps) {
  const { services } = useServices();
  const { clients } = useClients();
  const { profiles } = useProfiles();
  const { priceLists } = usePriceLists();

  const [currentStep, setCurrentStep] = useState<WizardStep>('patient');
  const [priority, setPriority] = useState<'routine' | 'urgent' | 'stat'>('routine');
  
  // Patient data
  const [patient, setPatient] = useState<PatientData>({
    name: '',
    age: '',
    gender: 'Male',
    dob: '',
    phone: '',
    email: '',
    address: '',
    referringDoctor: '',
    clinicalNotes: '',
  });

  // Client selection
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  // Test selection
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [selectedProfileIds, setSelectedProfileIds] = useState<string[]>([]);
  const [testSearchQuery, setTestSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Billing
  const [manualDiscount, setManualDiscount] = useState<string>('0');
  const [paymentReceived, setPaymentReceived] = useState<string>('0');

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const clientPriceList = priceLists.find(p => p.id === selectedClient?.priceListId);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.isActive && 
      (c.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
       c.code.toLowerCase().includes(clientSearchQuery.toLowerCase()))
    );
  }, [clients, clientSearchQuery]);

  // Get all tests including from profiles
  const allSelectedTests = useMemo(() => {
    const testIdsFromProfiles: string[] = [];
    selectedProfileIds.forEach(profileId => {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        testIdsFromProfiles.push(...profile.tests);
      }
    });
    
    const uniqueTestIds = [...new Set([...selectedTestIds, ...testIdsFromProfiles])];
    return services.filter(s => uniqueTestIds.includes(s.id));
  }, [selectedTestIds, selectedProfileIds, services, profiles]);

  // Filter services
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      if (!s.isActive) return false;
      const matchesSearch = 
        s.name.toLowerCase().includes(testSearchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(testSearchQuery.toLowerCase());
      const matchesDept = departmentFilter === 'all' || s.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [services, testSearchQuery, departmentFilter]);

  // Calculate totals
  const billing = useMemo(() => {
    let subtotal = 0;
    
    // Add individual test prices
    selectedTestIds.forEach(id => {
      const service = services.find(s => s.id === id);
      if (service) subtotal += service.price;
    });
    
    // Add profile prices (profiles have their own pricing)
    selectedProfileIds.forEach(id => {
      const profile = profiles.find(p => p.id === id);
      if (profile) subtotal += profile.price;
    });

    const clientDiscountPercent = clientPriceList?.discountPercent || 0;
    const manualDiscountPercent = parseFloat(manualDiscount) || 0;
    const totalDiscountPercent = Math.min(clientDiscountPercent + manualDiscountPercent, 100);
    const discountAmount = (subtotal * totalDiscountPercent) / 100;
    const totalAmount = subtotal - discountAmount;
    const paid = parseFloat(paymentReceived) || 0;

    return {
      subtotal,
      clientDiscountPercent,
      manualDiscountPercent,
      totalDiscountPercent,
      discountAmount,
      totalAmount,
      paid,
      balance: totalAmount - paid,
    };
  }, [selectedTestIds, selectedProfileIds, services, profiles, clientPriceList, manualDiscount, paymentReceived]);

  const departments = [...new Set(services.map(s => s.department))];

  const toggleTest = (testId: string) => {
    setSelectedTestIds(prev => 
      prev.includes(testId) 
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  const toggleProfile = (profileId: string) => {
    setSelectedProfileIds(prev => 
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'patient':
        return patient.name.trim() && patient.age && patient.gender;
      case 'client':
        return !!selectedClientId;
      case 'tests':
        return selectedTestIds.length > 0 || selectedProfileIds.length > 0;
      case 'billing':
        return true;
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    const stepIndex = steps.findIndex(s => s.key === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].key);
    }
  };

  const goToPrevStep = () => {
    const stepIndex = steps.findIndex(s => s.key === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].key);
    }
  };

  const handleSave = () => {
    // Build tests array
    const caseTests: CaseTest[] = allSelectedTests.map(service => ({
      testId: service.id,
      testCode: service.code,
      testName: service.name,
      department: service.department as Department,
      sampleType: service.sampleType as SampleType,
      price: service.price,
      status: 'pending' as const,
      unit: service.unit,
    }));

    const newCase: Case = {
      id: generateId('CS'),
      caseNumber: generateCaseNumber(),
      patientName: patient.name,
      patientId: generatePatientId(),
      patientAge: parseInt(patient.age),
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
      registeredDate: new Date().toISOString(),
      tests: caseTests,
      samples: [],
      subtotal: billing.subtotal,
      discountPercent: billing.totalDiscountPercent,
      discountAmount: billing.discountAmount,
      totalAmount: billing.totalAmount,
      paymentStatus: billing.paid >= billing.totalAmount ? 'paid' : billing.paid > 0 ? 'partial' : 'pending',
      paidAmount: billing.paid,
    };

    onSave(newCase);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep('patient');
    setPatient({ name: '', age: '', gender: 'Male', dob: '', phone: '', email: '', address: '', referringDoctor: '', clinicalNotes: '' });
    setSelectedClientId('');
    setSelectedTestIds([]);
    setSelectedProfileIds([]);
    setManualDiscount('0');
    setPaymentReceived('0');
    setPriority('routine');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { onClose(); resetForm(); } }}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">Create New Case</DialogTitle>
          
          {/* Step indicator */}
          <div className="flex items-center justify-between mt-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.key}>
                <button
                  onClick={() => setCurrentStep(step.key)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
                    currentStep === step.key 
                      ? 'bg-primary text-primary-foreground'
                      : steps.findIndex(s => s.key === currentStep) > index
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {steps.findIndex(s => s.key === currentStep) > index ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    step.icon
                  )}
                  <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </React.Fragment>
            ))}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-220px)]">
            <div className="p-6">
              {/* Patient Info Step */}
              {currentStep === 'patient' && (
                <div className="space-y-6">
                  {/* Priority Selection */}
                  <div className="flex gap-2 mb-4">
                    {(['routine', 'urgent', 'stat'] as const).map((p) => (
                      <Button
                        key={p}
                        variant={priority === p ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPriority(p)}
                        className={cn(
                          priority === p && p === 'stat' && 'bg-destructive hover:bg-destructive/90',
                          priority === p && p === 'urgent' && 'bg-orange-500 hover:bg-orange-600'
                        )}
                      >
                        {p.toUpperCase()}
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="patientName">Patient Name *</Label>
                      <Input
                        id="patientName"
                        value={patient.name}
                        onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                        placeholder="Full name"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="patientAge">Age *</Label>
                      <Input
                        id="patientAge"
                        type="number"
                        min="0"
                        max="150"
                        value={patient.age}
                        onChange={(e) => setPatient({ ...patient, age: e.target.value })}
                        placeholder="Years"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="patientGender">Gender *</Label>
                      <Select 
                        value={patient.gender} 
                        onValueChange={(v) => setPatient({ ...patient, gender: v as Gender })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="patientDob">Date of Birth</Label>
                      <Input
                        id="patientDob"
                        type="date"
                        value={patient.dob}
                        onChange={(e) => setPatient({ ...patient, dob: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="patientPhone">Phone</Label>
                      <Input
                        id="patientPhone"
                        value={patient.phone}
                        onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                        placeholder="Phone number"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="patientEmail">Email</Label>
                      <Input
                        id="patientEmail"
                        type="email"
                        value={patient.email}
                        onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                        placeholder="Email address"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="referringDoctor">Referring Doctor</Label>
                      <Input
                        id="referringDoctor"
                        value={patient.referringDoctor}
                        onChange={(e) => setPatient({ ...patient, referringDoctor: e.target.value })}
                        placeholder="Doctor name"
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="patientAddress">Address</Label>
                      <Input
                        id="patientAddress"
                        value={patient.address}
                        onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                        placeholder="Full address"
                        className="mt-1"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="clinicalNotes">Clinical Notes</Label>
                      <Textarea
                        id="clinicalNotes"
                        value={patient.clinicalNotes}
                        onChange={(e) => setPatient({ ...patient, clinicalNotes: e.target.value })}
                        placeholder="Clinical history, symptoms, etc."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Client Selection Step */}
              {currentStep === 'client' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search clients by name or code..."
                      value={clientSearchQuery}
                      onChange={(e) => setClientSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="grid gap-3">
                    {filteredClients.map((client) => (
                      <Card
                        key={client.id}
                        className={cn(
                          'cursor-pointer transition-all hover:border-primary/50',
                          selectedClientId === client.id && 'border-primary bg-primary/5'
                        )}
                        onClick={() => setSelectedClientId(client.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{client.name}</span>
                                <Badge variant="outline" className="text-xs">{client.code}</Badge>
                                <Badge variant="secondary" className="text-xs">{client.type}</Badge>
                              </div>
                              {(client.email || client.phone) && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {[client.phone, client.email].filter(Boolean).join(' • ')}
                                </p>
                              )}
                              {client.priceListId && (
                                <p className="text-xs text-primary mt-1">
                                  {priceLists.find(p => p.id === client.priceListId)?.name}
                                </p>
                              )}
                            </div>
                            {selectedClientId === client.id && (
                              <Check className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tests Selection Step */}
              {currentStep === 'tests' && (
                <div className="space-y-4">
                  {/* Profiles Section */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Test Profiles / Panels</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {profiles.filter(p => p.isActive).map((profile) => (
                          <div
                            key={profile.id}
                            className={cn(
                              'flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all',
                              selectedProfileIds.includes(profile.id)
                                ? 'border-primary bg-primary/5'
                                : 'hover:border-primary/50'
                            )}
                            onClick={() => toggleProfile(profile.id)}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox checked={selectedProfileIds.includes(profile.id)} />
                              <div>
                                <p className="font-medium text-sm">{profile.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {profile.tests.length} tests • {profile.department}
                                </p>
                              </div>
                            </div>
                            <span className="font-medium text-sm">${profile.price}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Separator />

                  {/* Individual Tests */}
                  <div>
                    <div className="flex gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search tests..."
                          value={testSearchQuery}
                          onChange={(e) => setTestSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                      {filteredServices.map((service) => (
                        <div
                          key={service.id}
                          className={cn(
                            'flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all',
                            selectedTestIds.includes(service.id)
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-primary/50'
                          )}
                          onClick={() => toggleTest(service.id)}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox checked={selectedTestIds.includes(service.id)} />
                            <div>
                              <p className="font-medium text-sm">{service.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {service.code} • {service.department}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium text-sm">${service.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Selected Summary */}
                  {allSelectedTests.length > 0 && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <p className="text-sm font-medium mb-2">
                          Selected: {allSelectedTests.length} tests
                          {selectedProfileIds.length > 0 && ` (${selectedProfileIds.length} profiles)`}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {allSelectedTests.map(t => (
                            <Badge key={t.id} variant="secondary" className="text-xs">
                              {t.code}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Billing Step */}
              {currentStep === 'billing' && (
                <div className="space-y-6">
                  {/* Order Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedProfileIds.map(id => {
                        const profile = profiles.find(p => p.id === id);
                        return profile && (
                          <div key={id} className="flex justify-between text-sm">
                            <span>{profile.name} (Profile)</span>
                            <span>${profile.price.toFixed(2)}</span>
                          </div>
                        );
                      })}
                      {selectedTestIds.map(id => {
                        const service = services.find(s => s.id === id);
                        return service && (
                          <div key={id} className="flex justify-between text-sm">
                            <span>{service.name}</span>
                            <span>${service.price.toFixed(2)}</span>
                          </div>
                        );
                      })}
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Subtotal</span>
                        <span>${billing.subtotal.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Discounts */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Percent className="h-4 w-4" />
                        Discounts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {billing.clientDiscountPercent > 0 && (
                        <div className="flex justify-between text-sm p-3 bg-primary/10 rounded-lg">
                          <span>Client Price List Discount</span>
                          <span className="text-primary font-medium">
                            -{billing.clientDiscountPercent}%
                          </span>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="manualDiscount">Additional Discount (%)</Label>
                        <Input
                          id="manualDiscount"
                          type="number"
                          min="0"
                          max="100"
                          value={manualDiscount}
                          onChange={(e) => setManualDiscount(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div className="flex justify-between text-sm font-medium text-destructive">
                        <span>Total Discount ({billing.totalDiscountPercent}%)</span>
                        <span>-${billing.discountAmount.toFixed(2)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-lg font-bold p-3 bg-primary/10 rounded-lg">
                        <span>Total Amount</span>
                        <span>${billing.totalAmount.toFixed(2)}</span>
                      </div>

                      <div>
                        <Label htmlFor="paymentReceived">Amount Received</Label>
                        <Input
                          id="paymentReceived"
                          type="number"
                          min="0"
                          value={paymentReceived}
                          onChange={(e) => setPaymentReceived(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <div className={cn(
                        'flex justify-between text-sm font-medium p-3 rounded-lg',
                        billing.balance > 0 ? 'bg-orange-500/10 text-orange-600' : 'bg-status-completed/10 text-status-completed'
                      )}>
                        <span>Balance Due</span>
                        <span>${billing.balance.toFixed(2)}</span>
                      </div>

                      {billing.balance > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <AlertCircle className="h-4 w-4" />
                          <span>Case will be marked as {billing.paid > 0 ? 'Partial' : 'Pending'} payment</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/30">
          <Button
            variant="outline"
            onClick={currentStep === 'patient' ? onClose : goToPrevStep}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {currentStep === 'patient' ? 'Cancel' : 'Back'}
          </Button>

          <Button
            onClick={currentStep === 'billing' ? handleSave : goToNextStep}
            disabled={!canProceed()}
          >
            {currentStep === 'billing' ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Create Case
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
