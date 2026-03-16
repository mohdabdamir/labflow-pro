import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePharmacyData } from '@/hooks/usePharmacyData';
import type { PharmacyPatient } from '@/types/pharmacy';
import {
  Search, User, AlertTriangle, Heart, Pill, FileText,
  Phone, Mail, Calendar, Shield, ChevronRight, X,
} from 'lucide-react';

export default function PatientSearchPage() {
  const { patients, prescriptions } = usePharmacyData();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PharmacyPatient | null>(null);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return !search ||
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      (p.insuranceId ?? '').toLowerCase().includes(q);
  });

  const patientRx = selected
    ? prescriptions.filter(rx => rx.patientId === selected.id)
    : [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Patient Search
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">Universal search by name, MRN, DOB, phone, or insurance ID</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Panel */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Name, MRN, phone, insurance..."
              className="pl-9 bg-card"
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => { setSearch(''); setSelected(null); }}>
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            {filtered.map(p => {
              const criticalAllergy = p.allergies.some(a => a.severity === 'life_threatening');
              const severeAllergy = p.allergies.some(a => a.severity === 'severe');
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={cn(
                    'w-full text-left p-3 rounded-xl border transition-all hover:shadow-sm',
                    selected?.id === p.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/30',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm text-foreground truncate">
                          {p.firstName} {p.lastName}
                        </p>
                        {criticalAllergy && <span className="shrink-0 text-[9px] font-bold px-1 py-0.5 rounded bg-destructive text-destructive-foreground">⚠ ALLERGY</span>}
                      </div>
                      <p className="text-xs text-muted-foreground">{p.mrn} · {p.gender === 'M' ? 'Male' : 'Female'} · {p.age}y</p>
                      {p.insurance && <p className="text-xs text-muted-foreground truncate">{p.insurance}</p>}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </button>
              );
            })}
            {search && filtered.length === 0 && (
              <p className="text-center py-6 text-muted-foreground text-sm">No patients found</p>
            )}
            {!search && (
              <p className="text-center py-6 text-muted-foreground text-sm">Search for a patient to see their profile</p>
            )}
          </div>
        </div>

        {/* Patient Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="space-y-4">
              {/* Patient Banner */}
              <Card className={cn(
                'overflow-hidden',
                selected.allergies.some(a => a.severity === 'life_threatening') && 'ring-2 ring-destructive',
              )}>
                {selected.allergies.some(a => a.severity === 'life_threatening') && (
                  <div className="bg-destructive text-destructive-foreground px-4 py-2 flex items-center gap-2 text-sm font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    ⚠ CRITICAL ALLERGY — VERIFY BEFORE DISPENSING
                  </div>
                )}
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-xl shrink-0">
                      {selected.firstName[0]}{selected.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold text-foreground">{selected.firstName} {selected.lastName}</h2>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" />{selected.mrn}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />DOB: {selected.dob} ({selected.age}y)</span>
                        <span>{selected.gender === 'M' ? '♂ Male' : '♀ Female'}</span>
                        <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{selected.phone}</span>
                        {selected.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{selected.email}</span>}
                      </div>
                      {selected.insurance && (
                        <div className="mt-2 text-sm">
                          <span className="text-muted-foreground">Insurance: </span>
                          <span className="font-medium text-foreground">{selected.insurance}</span>
                          {selected.insuranceId && <span className="text-muted-foreground"> · {selected.insuranceId}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Allergies */}
              {selected.allergies.length > 0 && (
                <Card className="border-destructive/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Allergy & Intolerance Record ({selected.allergies.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selected.allergies.map(a => (
                      <div key={a.id} className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border',
                        a.severity === 'life_threatening' ? 'bg-destructive/10 border-destructive/40' :
                          a.severity === 'severe' ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/30' :
                            'bg-amber-50 border-amber-200 dark:bg-amber-950/30',
                      )}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{a.allergen}</span>
                            <Badge variant="outline" className={cn('text-[10px]', a.severity === 'life_threatening' ? 'bg-destructive text-destructive-foreground border-destructive' : 'bg-amber-50 text-amber-700 border-amber-200')}>
                              {a.severity.replace('_', ' ').toUpperCase()}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground capitalize">{a.type}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">Reaction: {a.reaction}</p>
                          {a.onsetDate && <p className="text-[10px] text-muted-foreground">Onset: {a.onsetDate}</p>}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Medical Conditions */}
              {selected.conditions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Heart className="h-4 w-4 text-rose-500" />
                      Active Conditions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selected.conditions.map(c => (
                        <Badge key={c} variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Prescription History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Prescription History ({patientRx.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {patientRx.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">No prescriptions on file</p>
                  ) : (
                    patientRx.map(rx => (
                      <div key={rx.id} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/30">
                        <div>
                          <p className="text-sm font-medium text-foreground">{rx.rxNumber}</p>
                          <p className="text-xs text-muted-foreground">{rx.prescriberName} · {new Date(rx.receivedAt).toLocaleDateString()}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {rx.items.slice(0, 2).map(i => (
                              <span key={i.id} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{i.drugName}</span>
                            ))}
                            {rx.items.length > 2 && <span className="text-[10px] text-muted-foreground">+{rx.items.length - 2} more</span>}
                          </div>
                        </div>
                        <Badge variant="outline" className={cn('text-[10px] shrink-0',
                          rx.status === 'dispensed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400' :
                            rx.status === 'clinical_review' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400',
                        )}>
                          {rx.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center min-h-64 border border-dashed rounded-2xl text-muted-foreground">
              <div className="text-center space-y-2">
                <User className="h-10 w-10 mx-auto opacity-30" />
                <p className="text-sm">Select a patient to view their profile</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
