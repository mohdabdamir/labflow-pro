import React, { useState } from 'react';
import { useEmergencyData } from '@/hooks/useEmergencyData';
import { ACUITY_CONFIG } from '@/types/emergency';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Shield, CheckCircle, Send, Calendar, AlertTriangle,
  Pill, UserCheck, Weight, Clock,
} from 'lucide-react';

export default function DischargePage() {
  const { activePatients, dischargeWorkflows, initiateDischarge, completeDischarge } = useEmergencyData();
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<Record<string, string>>({});

  const dischargeReady = activePatients.filter(p => p.status === 'discharge_ready' || p.status === 'pending_disposition');
  const activeWorkflows = dischargeWorkflows.filter(w => w.status !== 'completed');
  const completedWorkflows = dischargeWorkflows.filter(w => w.status === 'completed');

  const handleInitiate = (patientId: string) => {
    initiateDischarge(patientId);
    toast({ title: 'Discharge workflow initiated' });
  };

  const handleComplete = (patientId: string) => {
    completeDischarge(patientId, instructions[patientId] || 'Standard discharge instructions provided.');
    toast({ title: 'Patient discharged', description: 'Rx sent, follow-up scheduled, instructions provided.' });
  };

  // Pediatric patients needing weight check
  const pedPatients = activePatients.filter(p => p.isPediatric);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-6 w-6" /> Discharge Orchestration</h1>
        <p className="text-sm text-muted-foreground">Automated e-Rx push • Follow-up scheduling • PCP gap detection</p>
      </div>

      {/* Pediatric Guardian Mode */}
      {pedPatients.length > 0 && (
        <Card className="border-pink-300 dark:border-pink-700 bg-pink-50 dark:bg-pink-950/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-pink-700 dark:text-pink-400"><Weight className="h-4 w-4" /> Pediatric Guardian Mode</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {pedPatients.map(p => {
              const weightAge = p.weightDate ? Math.floor((Date.now() - new Date(p.weightDate).getTime()) / 86400000) : null;
              return (
                <div key={p.id} className="flex items-center justify-between text-xs p-2 bg-white/50 dark:bg-black/20 rounded">
                  <div>
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-muted-foreground ml-2">Age: {p.age}y</span>
                    <span className="text-muted-foreground ml-2">Weight: {p.weight ? `${p.weight} kg` : 'Not recorded'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.weight && (
                      <Badge variant="outline" className="text-[10px]">
                        Dosing base: {p.weight} kg → mL calculation active
                      </Badge>
                    )}
                    {weightAge !== null && weightAge > 14 && (
                      <Badge variant="destructive" className="text-[10px] animate-pulse">
                        ⚠️ Weight is {weightAge} days old. Re-weigh recommended.
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Eligible for discharge */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Ready for Discharge ({dischargeReady.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {dischargeReady.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No patients pending discharge</p>}
            {dischargeReady.map(p => {
              const wf = dischargeWorkflows.find(w => w.patientId === p.id);
              return (
                <div key={p.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded text-white', ACUITY_CONFIG[p.acuity].bgColor)}>ESI {p.acuity}</span>
                      <span className="font-semibold text-sm">{p.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{p.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.chiefComplaint}</p>

                  {!wf ? (
                    <Button size="sm" className="w-full h-7 text-xs" onClick={() => handleInitiate(p.id)}>
                      Initiate Discharge Workflow
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      {/* Automated steps */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <Pill className={cn('h-3 w-3', wf.prescriptionSent ? 'text-green-500' : 'text-muted-foreground')} />
                          <span className={wf.prescriptionSent ? 'line-through text-muted-foreground' : ''}>Push e-Prescription to pharmacy</span>
                          {!wf.prescriptionSent && <Badge variant="secondary" className="text-[9px]">Auto-sending...</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className={cn('h-3 w-3', wf.followUpScheduled ? 'text-green-500' : 'text-muted-foreground')} />
                          <span className={wf.followUpScheduled ? 'line-through text-muted-foreground' : ''}>Schedule follow-up appointment</span>
                        </div>
                        {wf.pcpGapAlert && (
                          <div className="flex items-center gap-2 text-xs text-amber-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span>⚠️ No PCP on file — Auto-referral to ED Follow-Up Clinic</span>
                          </div>
                        )}
                      </div>

                      {/* Instructions */}
                      <Textarea
                        placeholder="Discharge instructions..."
                        value={instructions[p.id] || ''}
                        onChange={e => setInstructions(prev => ({ ...prev, [p.id]: e.target.value }))}
                        rows={2} className="text-xs"
                      />
                      <Button size="sm" className="w-full h-7 text-xs gap-1" onClick={() => handleComplete(p.id)}>
                        <Send className="h-3 w-3" /> Complete Discharge & Send Instructions
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Completed discharges */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Completed Discharges ({completedWorkflows.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {completedWorkflows.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No completed discharges yet</p>}
            {completedWorkflows.map(w => {
              const p = activePatients.find(pt => pt.id === w.patientId);
              return (
                <div key={w.patientId} className="border rounded-lg p-2 text-xs space-y-1 opacity-70">
                  <div className="font-semibold">{p?.name || w.patientId}</div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="h-3 w-3 text-green-500" /> Rx sent
                    <CheckCircle className="h-3 w-3 text-green-500" /> Follow-up scheduled
                    {w.completedAt && <span>• {new Date(w.completedAt).toLocaleTimeString()}</span>}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
