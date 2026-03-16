import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePharmacyData } from '@/hooks/usePharmacyData';
import {
  FlaskConical, AlertTriangle, ShieldAlert, CheckCircle2,
  Activity, Pill, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SEVERITY_CONFIG = {
  contraindicated: { cls: 'bg-destructive/10 border-destructive/40 text-destructive', badge: 'bg-destructive text-destructive-foreground', label: 'CONTRAINDICATED' },
  significant:     { cls: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800', badge: 'bg-orange-500 text-white', label: 'SIGNIFICANT' },
  moderate:        { cls: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800', badge: 'bg-amber-500 text-white', label: 'MODERATE' },
  minor:           { cls: 'bg-muted border-border', badge: 'bg-muted-foreground text-white', label: 'MINOR' },
};

export default function CDSPage() {
  const { prescriptions, patients } = usePharmacyData();

  const allInteractions = prescriptions.flatMap(rx =>
    rx.interactions.map(i => ({ ...i, rxNumber: rx.rxNumber, patientName: `${rx.patient.firstName} ${rx.patient.lastName}` }))
  );

  const highRiskRx = prescriptions.filter(rx => rx.highRiskFlag);
  const counselingRequired = prescriptions.filter(rx => rx.counselingRequired && rx.status !== 'dispensed');

  const labAlerts = [
    { id: 'L1', patient: 'Ahmed Al-Rashid', test: 'Creatinine', value: '1.8 mg/dL', flag: 'High', relevantDrug: 'Metformin', recommendation: 'Consider holding Metformin — Creatinine > 1.5', severity: 'significant' as const },
    { id: 'L2', patient: 'James Morrison', test: 'INR', value: '3.8', flag: 'Supratherapeutic', relevantDrug: 'Warfarin', recommendation: 'INR above therapeutic range (2-3). Warfarin dose review needed.', severity: 'contraindicated' as const },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          Clinical Decision Support
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time drug interaction alerts, dose checking, and lab-drug integration
        </p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={cn(allInteractions.some(i => i.severity === 'contraindicated') && 'ring-2 ring-destructive/40')}>
          <CardContent className="p-4">
            <ShieldAlert className="h-5 w-5 text-destructive mb-2" />
            <p className="text-2xl font-bold text-foreground">{allInteractions.filter(i => i.severity === 'contraindicated').length}</p>
            <p className="text-xs text-muted-foreground">Contraindicated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <AlertTriangle className="h-5 w-5 text-orange-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{allInteractions.filter(i => i.severity === 'significant' || i.severity === 'moderate').length}</p>
            <p className="text-xs text-muted-foreground">Sig./Moderate Interactions</p>
          </CardContent>
        </Card>
        <Card className={cn(highRiskRx.length > 0 && 'ring-1 ring-purple-500/30')}>
          <CardContent className="p-4">
            <Activity className="h-5 w-5 text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{highRiskRx.length}</p>
            <p className="text-xs text-muted-foreground">High-Risk Rx</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-foreground">{counselingRequired.length}</p>
            <p className="text-xs text-muted-foreground">Counseling Required</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Drug Interactions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              Active Drug Interactions
              {allInteractions.length > 0 && <Badge className="bg-destructive text-destructive-foreground text-[10px] ml-auto">{allInteractions.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allInteractions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                No active interactions
              </div>
            ) : (
              allInteractions.map(i => {
                const sc = SEVERITY_CONFIG[i.severity];
                return (
                  <div key={i.id} className={cn('p-3 rounded-xl border text-sm', sc.cls)}>
                    <div className="flex items-start gap-2 mb-1">
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', sc.badge)}>{sc.label}</span>
                      <span className="text-xs text-muted-foreground">{i.rxNumber} · {i.patientName}</span>
                    </div>
                    <p className="font-semibold text-foreground">{i.drug1} ↔ {i.drug2}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{i.description}</p>
                    <p className="text-xs mt-1 italic">{i.managementRecommendation}</p>
                    {i.overridable && (
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] mt-1 text-muted-foreground hover:text-foreground">
                        Override with reason →
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Lab-Drug Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-blue-500" />
              Lab-Drug Monitoring Alerts
              <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 ml-auto">
                {labAlerts.length} active
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {labAlerts.map(alert => {
              const sc = SEVERITY_CONFIG[alert.severity];
              return (
                <div key={alert.id} className={cn('p-3 rounded-xl border text-sm', sc.cls)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', sc.badge)}>{sc.label}</span>
                    <span className="text-xs text-muted-foreground">{alert.patient}</span>
                  </div>
                  <p className="font-semibold text-foreground">{alert.test}: <span className="text-destructive">{alert.value}</span></p>
                  <p className="text-xs text-muted-foreground">Related drug: <strong>{alert.relevantDrug}</strong></p>
                  <p className="text-xs mt-1 italic">{alert.recommendation}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* High Risk Medications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Pill className="h-4 w-4 text-purple-500" />
              High-Risk Medications on Active Rx
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {highRiskRx.map(rx => (
              <div key={rx.id} className="p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 text-sm">
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px] bg-purple-600 text-white">HIGH RISK</Badge>
                  <span className="font-semibold text-foreground">{rx.patient.firstName} {rx.patient.lastName}</span>
                  <span className="text-xs text-muted-foreground">{rx.rxNumber}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {rx.items.map(item => (
                    <span key={item.id} className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded font-medium">
                      {item.drugName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {highRiskRx.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No high-risk medications on active prescriptions</p>}
          </CardContent>
        </Card>

        {/* Counseling Queue */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4 text-teal-500" />
              Counseling Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {counselingRequired.map(rx => (
              <div key={rx.id} className="flex items-center justify-between p-2.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30">
                <div>
                  <p className="text-sm font-semibold text-foreground">{rx.patient.firstName} {rx.patient.lastName}</p>
                  <p className="text-xs text-muted-foreground">{rx.rxNumber} · {rx.prescriberName}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {rx.items.map(i => (
                      <span key={i.id} className="text-[10px] text-teal-700 dark:text-teal-400">{i.drugName}</span>
                    ))}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-xs border-teal-300 dark:border-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900/30">
                  Start Counseling
                </Button>
              </div>
            ))}
            {counselingRequired.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No counseling sessions pending</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
