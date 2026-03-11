import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAPCases } from '@/hooks/useAPData';
import { APCaseCommunication } from '@/components/ap/APCaseCommunication';
import { APReportPreviewDialog } from '@/components/ap/APReportPreviewDialog';
import type { APCaseMessage } from '@/types/anatomicPathology';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft, Edit, FlaskConical, FileText, DollarSign,
  MessageCircle, Eye, Download, CheckCircle2, AlertTriangle,
  Clock, Mail, Upload, User, Building2, Microscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/hooks/useUserStore';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  registered:    { label: 'Registered',    color: 'text-blue-700 dark:text-blue-300',     bg: 'bg-blue-100 dark:bg-blue-900/30' },
  grossing:      { label: 'Grossing',      color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  processing:    { label: 'Processing',    color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  embedding:     { label: 'Embedding',     color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  sectioning:    { label: 'Sectioning',    color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  staining:      { label: 'Staining',      color: 'text-cyan-700 dark:text-cyan-300',     bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
  transcription: { label: 'Transcription', color: 'text-violet-700 dark:text-violet-300', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  review:        { label: 'Review',        color: 'text-amber-700 dark:text-amber-300',   bg: 'bg-amber-100 dark:bg-amber-900/30' },
  finalized:     { label: 'Finalized',     color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  amended:       { label: 'Amended',       color: 'text-rose-700 dark:text-rose-300',     bg: 'bg-rose-100 dark:bg-rose-900/30' },
  cancelled:     { label: 'Cancelled',     color: 'text-muted-foreground',                bg: 'bg-muted' },
};

const CANCER_COLORS: Record<string, string> = {
  benign: 'text-emerald-600', intermediate: 'text-amber-600', malignant: 'text-destructive',
};

const WORKFLOW_STEPS = ['registered','grossing','processing','embedding','sectioning','staining','transcription','review','finalized'];

export default function APCaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCaseById, updateCase } = useAPCases();
  const { toast } = useToast();
  const { currentUser } = useUserStore();
  const [previewOpen, setPreviewOpen] = useState(false);
  const apCase = getCaseById(id ?? '');

  if (!apCase) return <div className="p-8 text-muted-foreground">Case not found.</div>;

  const sc = STATUS_CONFIG[apCase.status];
  const stepIdx = WORKFLOW_STEPS.indexOf(apCase.status);

  const handleFinalize = () => {
    updateCase(apCase.id, {
      status: 'finalized',
      finalizedAt: new Date().toISOString(),
      reportedAt: new Date().toISOString(),
      reportedBy: currentUser?.fullName,
    });
    toast({ title: 'Report finalized', description: `${apCase.caseNumber} has been finalized.` });
  };

  const handleMarkDelivered = (method: 'emailed' | 'portal_uploaded') => {
    const now = new Date().toISOString();
    const cur = apCase.deliveryStatus;
    const next = (cur === 'both' || (cur === 'emailed' && method === 'portal_uploaded') || (cur === 'portal_uploaded' && method === 'emailed')) ? 'both' : method;
    updateCase(apCase.id, {
      deliveryStatus: next,
      emailedAt: method === 'emailed' ? now : apCase.emailedAt,
      portalUploadedAt: method === 'portal_uploaded' ? now : apCase.portalUploadedAt,
    });
    toast({ title: `Marked as ${method === 'emailed' ? 'emailed' : 'uploaded to portal'}` });
  };

  const handleMessages = (msgs: APCaseMessage[]) => updateCase(apCase.id, { messages: msgs, unreadMessageCount: 0 });

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/ap')}><ChevronLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{apCase.caseNumber}</h1>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', sc.bg, sc.color)}>{sc.label}</span>
            {apCase.priority === 'stat' && <span className="text-[10px] font-black bg-destructive text-destructive-foreground px-2 py-0.5 rounded">STAT</span>}
            {apCase.priority === 'urgent' && <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded">URGENT</span>}
            {apCase.isCritical && <Badge className="bg-destructive/10 text-destructive border-0 text-xs"><AlertTriangle className="h-3 w-3 mr-1" />Critical</Badge>}
            {apCase.overallCancerType && apCase.overallCancerType !== 'pending' && (
              <span className={cn('text-xs font-bold capitalize', CANCER_COLORS[apCase.overallCancerType])}>{apCase.overallCancerType}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{apCase.patientName} · {apCase.caseType} · {apCase.numberOfSpecimens} specimen(s) · {apCase.clientName}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {apCase.status !== 'finalized' && apCase.status !== 'cancelled' && (
            <>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/ap/cases/${apCase.id}/grossing`)}><FlaskConical className="h-3.5 w-3.5" />Grossing</Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/ap/cases/${apCase.id}/transcription`)}><Edit className="h-3.5 w-3.5" />Transcription</Button>
            </>
          )}
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreviewOpen(true)}><Eye className="h-3.5 w-3.5" />Preview PDF</Button>
          {apCase.status === 'review' && (
            <Button size="sm" className="gap-1.5" onClick={handleFinalize}><CheckCircle2 className="h-3.5 w-3.5" />Finalize Report</Button>
          )}
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {WORKFLOW_STEPS.map((s, i) => {
          const done = i < stepIdx;
          const active = i === stepIdx;
          const sc2 = STATUS_CONFIG[s];
          return (
            <React.Fragment key={s}>
              <div className={cn('text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all shrink-0',
                done ? 'bg-primary/10 text-primary' : active ? `${sc2.bg} ${sc2.color}` : 'bg-muted text-muted-foreground')}>
                {done && '✓ '}{sc2.label}
              </div>
              {i < WORKFLOW_STEPS.length - 1 && <div className={cn('w-4 h-0.5 shrink-0', i < stepIdx ? 'bg-primary' : 'bg-border')} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Critical note */}
      {apCase.isCritical && apCase.criticalNote && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span><strong>Critical Finding:</strong> {apCase.criticalNote}</span>
        </div>
      )}

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Case Details</TabsTrigger>
          <TabsTrigger value="specimens">Specimens</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="communication" className="relative">
            Communication
            {(apCase.unreadMessageCount ?? 0) > 0 && (
              <span className="ml-1.5 h-4 w-4 text-[9px] font-bold rounded-full bg-destructive text-destructive-foreground inline-flex items-center justify-center">{apCase.unreadMessageCount}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><User className="h-4 w-4" />Patient</CardTitle></CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {[['Name', apCase.patientName],['ID', apCase.patientId],['DOB', apCase.patientDob ?? '—'],['Age / Gender', `${apCase.patientAge}y / ${apCase.patientGender === 'M' ? 'Male' : 'Female'}`],['Mobile', apCase.patientMobile ?? '—'],['Email', apCase.patientEmail ?? '—']].map(([l,v]) => (
                  <div key={l} className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">{l}:</span><span className="text-foreground font-medium">{v}</span></div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Building2 className="h-4 w-4" />Client & Referral</CardTitle></CardHeader>
              <CardContent className="space-y-1.5 text-sm">
                {[['Client', apCase.clientName],['Type', apCase.clientType],['Treating Dr', apCase.treatingPhysician],['Referring Dr', apCase.referringPhysician ?? '—'],['CC', (apCase.ccPhysicians ?? []).join(', ') || '—']].map(([l,v]) => (
                  <div key={l} className="flex gap-2"><span className="text-muted-foreground w-28 shrink-0">{l}:</span><span className="text-foreground font-medium">{v}</span></div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-border md:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1.5"><Microscope className="h-4 w-4" />Clinical</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                {apCase.clinicalHistory && <div><span className="text-muted-foreground">Clinical History: </span><span className="text-foreground">{apCase.clinicalHistory}</span></div>}
                {apCase.clinicalIndication && <div><span className="text-muted-foreground">Indication: </span><span className="text-foreground">{apCase.clinicalIndication}</span></div>}
                {apCase.pathologistComment && <div className="mt-2 p-3 rounded-lg bg-muted/30 border border-border"><span className="text-xs font-semibold text-muted-foreground block mb-1">Pathologist Comment</span><p className="text-foreground italic text-sm">{apCase.pathologistComment}</p></div>}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Specimens Tab */}
        <TabsContent value="specimens">
          <div className="space-y-3">
            {apCase.specimens.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-xl">
                <FlaskConical className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p>No specimen data yet. Start grossing to add specimen details.</p>
              </div>
            ) : apCase.specimens.map(sp => (
              <Card key={sp.id} className="border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{sp.specimenLabel}</span>
                    {sp.specimenName}
                    {sp.cancerType && sp.cancerType !== 'pending' && (
                      <span className={cn('text-xs font-bold capitalize ml-auto', CANCER_COLORS[sp.cancerType])}>{sp.cancerType}</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  {sp.grossDescription && <p><span className="font-semibold text-foreground">Gross: </span>{sp.grossDescription}</p>}
                  {sp.microscopicFindings && <p><span className="font-semibold text-foreground">Micro: </span>{sp.microscopicFindings}</p>}
                  {sp.diagnosis && <p className="text-foreground font-semibold border-l-2 border-primary pl-2">{sp.diagnosis}</p>}
                  {(sp.ancillaryStudies ?? []).length > 0 && (
                    <div><span className="font-semibold text-foreground">Ancillary studies: </span>{sp.ancillaryStudies!.map(a => `${a.stainName} (${a.result})`).join(' · ')}</div>
                  )}
                  {(sp.frozenSections ?? []).length > 0 && (
                    <div><span className="font-semibold text-foreground">Frozen sections: </span>{sp.frozenSections!.length} reported</div>
                  )}
                  <div className="flex gap-2 flex-wrap mt-1">
                    {sp.blocks.map(b => <span key={b.id} className="text-[10px] px-2 py-0.5 bg-muted rounded-full font-mono">{b.blockLabel}</span>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          <Card className="border-border">
            <CardContent className="pt-5">
              {apCase.billingEntries.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-6">No billing codes assigned.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="text-left pb-2">Code</th><th className="text-left pb-2">Description</th><th className="text-right pb-2">Qty</th><th className="text-right pb-2">Unit Price</th><th className="text-right pb-2">VAT</th><th className="text-right pb-2">Total</th></tr></thead>
                  <tbody className="divide-y divide-border">
                    {apCase.billingEntries.map(e => (
                      <tr key={e.id}><td className="py-2 font-mono text-xs">{e.billingCode}</td><td className="py-2 text-xs">{e.description}</td><td className="py-2 text-right">{e.quantity}</td><td className="py-2 text-right">BD {e.unitPrice.toFixed(2)}</td><td className="py-2 text-right text-muted-foreground">BD {e.vatAmount.toFixed(2)}</td><td className="py-2 text-right font-semibold">BD {e.total.toFixed(2)}</td></tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="border-t-2 border-border"><td colSpan={5} className="pt-2 text-right text-sm font-bold">Total:</td><td className="pt-2 text-right text-sm font-bold text-primary">BD {apCase.totalAmount.toFixed(2)}</td></tr></tfoot>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delivery Tab */}
        <TabsContent value="delivery">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { label: 'Email to Client/Physician', icon: Mail, method: 'emailed' as const, done: ['emailed','both'].includes(apCase.deliveryStatus), time: apCase.emailedAt },
              { label: 'Upload to Client Portal', icon: Upload, method: 'portal_uploaded' as const, done: ['portal_uploaded','both'].includes(apCase.deliveryStatus), time: apCase.portalUploadedAt },
            ]).map(item => (
              <Card key={item.method} className={cn('border-border', item.done && 'border-emerald-300 dark:border-emerald-700')}>
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <item.icon className={cn('h-5 w-5', item.done ? 'text-emerald-600' : 'text-muted-foreground')} />
                    <span className="font-semibold text-sm text-foreground">{item.label}</span>
                    {item.done && <CheckCircle2 className="h-4 w-4 text-emerald-600 ml-auto" />}
                  </div>
                  {item.done ? (
                    <p className="text-xs text-muted-foreground">Delivered at {item.time ? format(parseISO(item.time), 'dd MMM yyyy HH:mm') : '—'}</p>
                  ) : (
                    <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={() => handleMarkDelivered(item.method)} disabled={apCase.status !== 'finalized'}>
                      {item.method === 'emailed' ? <Mail className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                      Mark as {item.method === 'emailed' ? 'Emailed' : 'Uploaded'}
                    </Button>
                  )}
                  {apCase.status !== 'finalized' && !item.done && <p className="text-[10px] text-muted-foreground">Available after finalization</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication">
          <APCaseCommunication
            caseId={apCase.id}
            messages={apCase.messages}
            onUpdate={handleMessages}
          />
        </TabsContent>
      </Tabs>

      {previewOpen && (
        <APReportPreviewDialog apCase={apCase} open={previewOpen} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}
