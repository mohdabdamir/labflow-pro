import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Construction, Wrench, Clock } from 'lucide-react';

const MODULE_NAMES: Record<string, { name: string; eta: string }> = {
  '/anatomic-pathology': { name: 'Anatomic Pathology', eta: 'Q3 2026' },
  '/radiology': { name: 'Radiology', eta: 'Q3 2026' },
  '/pharmacy': { name: 'Pharmacy', eta: 'Q4 2026' },
  '/appointments': { name: 'Appointments', eta: 'Q2 2026' },
  '/emergency': { name: 'Emergency Unit', eta: 'Q4 2026' },
  '/outpatient': { name: 'Outpatient Clinic', eta: 'Q3 2026' },
  '/inpatient': { name: 'Inpatient (Ward)', eta: 'Q1 2027' },
};

const FEATURES: Record<string, string[]> = {
  '/anatomic-pathology': ['Histopathology slide management', 'Cytology reporting', 'Autopsy documentation', 'Frozen section workflow'],
  '/radiology': ['DICOM/PACS integration', 'RIS workflow', 'Radiologist reporting', 'Multi-modality support'],
  '/pharmacy': ['Prescription management', 'Drug inventory tracking', 'Interaction checker', 'Dispensing workflow'],
  '/appointments': ['Online booking portal', 'Multi-doctor scheduling', 'SMS/Email reminders', 'Waiting room management'],
  '/emergency': ['Triage scoring system', 'Real-time ER board', 'Critical alert system', 'Handover documentation'],
  '/outpatient': ['OPD queue management', 'Consultation notes', 'Referral system', 'Follow-up tracking'],
  '/inpatient': ['Bed management', 'Nursing notes', 'Admission/discharge workflow', 'Daily rounds documentation'],
};

export default function UnderConstruction() {
  const navigate = useNavigate();
  const location = useLocation();

  const moduleInfo = MODULE_NAMES[location.pathname] ?? { name: 'This Module', eta: '2026' };
  const features = FEATURES[location.pathname] ?? [];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative mx-auto h-28 w-28">
          <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center">
            <Construction className="h-14 w-14 text-primary/40" />
          </div>
          <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center">
            <Wrench className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border">
            <Clock className="h-3.5 w-3.5" />
            Expected: {moduleInfo.eta}
          </div>
          <h1 className="text-3xl font-bold text-foreground">{moduleInfo.name}</h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            This module is currently under active development and will be available soon. 
            Our team is building a comprehensive solution tailored for your clinical workflows.
          </p>
        </div>

        {/* Features coming */}
        {features.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 text-left">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Features in development
            </p>
            <ul className="space-y-2">
              {features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <span className="mt-1 h-4 w-4 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <Button onClick={() => navigate('/lab')} className="gap-2">
            Open Clinical Lab
          </Button>
        </div>
      </div>
    </div>
  );
}
