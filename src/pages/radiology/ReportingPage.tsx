import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_RADIOLOGY_STUDIES, REPORT_TEMPLATES, RADS_SYSTEMS } from '@/data/radiologyMockData';
import type { RadiologyReport, ReportStatus, RADSScore } from '@/types/radiology';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText, CheckCircle2, AlertTriangle, Pen, Clock, History,
  Copy, Printer, ChevronDown, Eye, Save, Send, Star, X,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const STATUS_COLORS: Record<ReportStatus, string> = {
  Draft: 'bg-muted text-muted-foreground',
  Preliminary: 'bg-blue-500/15 text-blue-600',
  Final: 'bg-green-500/15 text-green-600',
  Addendum: 'bg-orange-500/15 text-orange-600',
};

const RADS_OPTIONS = ['BI-RADS', 'PI-RADS', 'LI-RADS', 'Lung-RADS', 'NI-RADS'] as const;

export default function ReportingPage() {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const study = ALL_RADIOLOGY_STUDIES.find(s => s.id === studyId) ?? ALL_RADIOLOGY_STUDIES[0];

  const [report, setReport] = useState<RadiologyReport>(study.report ?? {
    id: `RPT-${study.id}`,
    studyId: study.id,
    status: 'Draft',
    findings: '',
    impression: '',
    criticalFindings: false,
    draftedAt: new Date().toISOString(),
    versions: [],
  });

  const [selectedRads, setSelectedRads] = useState<string>('');
  const [radsScore, setRadsScore] = useState<number>(0);
  const [radsDialogOpen, setRadsDialogOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [signed, setSigned] = useState(!!report.signedBy);

  const relevantTemplates = REPORT_TEMPLATES.filter(t =>
    t.modality === 'ALL' || t.modality === study.modality || t.bodyPart.toLowerCase().includes(study.bodyPart.toLowerCase())
  );

  const save = (newStatus?: ReportStatus) => {
    const s = newStatus ?? report.status;
    setReport(r => ({ ...r, status: s }));
    toast({ title: `Report ${s === 'Final' ? 'finalized' : 'saved'}`, description: `Status: ${s}` });
  };

  const sign = () => {
    setReport(r => ({ ...r, status: 'Final', signedBy: 'Dr. Alexandra Reeves', signedAt: new Date().toISOString() }));
    setSigned(true);
    toast({ title: '✓ Report Signed', description: 'Report finalized and signed by Dr. Alexandra Reeves.' });
  };

  const applyTemplate = (templateId: string) => {
    const t = REPORT_TEMPLATES.find(t => t.id === templateId);
    if (!t) return;
    setReport(r => ({ ...r, findings: t.content.findings, impression: t.content.impression }));
    setTemplateOpen(false);
    toast({ title: 'Template applied', description: t.name });
  };

  const applyRads = () => {
    const system = selectedRads as RADSScore['system'];
    const desc = (RADS_SYSTEMS as any)[system]?.find((d: any) => d.score === radsScore);
    if (!desc) return;
    const rads: RADSScore = { system, score: radsScore, descriptor: desc.descriptor, recommendation: desc.recommendation };
    setReport(r => ({
      ...r,
      radsScore: rads,
      impression: r.impression + `\n\n${system} ${radsScore}: ${desc.descriptor}. ${desc.recommendation}.`,
    }));
    setRadsDialogOpen(false);
    toast({ title: `${system} ${radsScore} applied` });
  };

  const copyToClipboard = () => {
    const text = `RADIOLOGY REPORT\n\nPatient: ${study.patient.fullName}\nMRN: ${study.patient.mrn}\nStudy: ${study.description}\nDate: ${study.studyDate}\n\nFINDINGS:\n${report.findings}\n\nIMPRESSION:\n${report.impression}`;
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <div className="h-[calc(100vh-56px)] flex overflow-hidden">
      {/* Left: Patient Context */}
      <div className="w-64 shrink-0 bg-card border-r border-border flex flex-col overflow-y-auto scrollbar-thin">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Patient Context</p>
        </div>
        {/* Patient info */}
        <div className="px-4 py-3 border-b border-border space-y-1">
          <p className="font-semibold text-sm">{study.patient.fullName}</p>
          <p className="text-xs text-muted-foreground">{study.patient.mrn} · {study.patient.age}y {study.patient.gender}</p>
          <p className="text-xs text-muted-foreground">DOB: {study.patient.dob}</p>
          <p className="text-xs text-muted-foreground">Blood: {study.patient.bloodType}</p>
          {study.patient.allergies.length > 0 && (
            <div className="mt-1">
              {study.patient.allergies.map(a => (
                <span key={a} className="inline-block text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded mr-1 mb-1 border border-destructive/20">{a}</span>
              ))}
            </div>
          )}
        </div>
        {/* Study info */}
        <div className="px-4 py-3 border-b border-border space-y-1.5">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase">Current Study</p>
          <p className="text-xs font-medium">{study.description}</p>
          <p className="text-xs text-muted-foreground">{study.accessionNumber}</p>
          <p className="text-xs text-muted-foreground">{study.studyDate} {study.studyTime}</p>
          <Badge className="text-[10px]" variant="outline">{study.modality}</Badge>
        </div>
        {/* Clinical indication */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Clinical Indication</p>
          <p className="text-xs text-foreground leading-relaxed">{study.clinicalHistory}</p>
        </div>
        {/* Ordering physician */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Ordering Physician</p>
          <p className="text-xs font-medium">{study.orderingPhysician}</p>
          <p className="text-xs text-muted-foreground">{study.referringDepartment}</p>
        </div>
        {/* Prior studies */}
        {study.hasPriors && (
          <div className="px-4 py-3">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-2">Prior Studies</p>
            {ALL_RADIOLOGY_STUDIES.filter(s => study.priorStudyIds?.includes(s.id)).map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/radiology/reports/${p.id}`)}
                className="w-full text-left flex items-start gap-2 p-1.5 rounded hover:bg-muted transition-colors"
              >
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 shrink-0',
                  p.modality === 'CT' ? 'bg-blue-500/15 text-blue-600' : p.modality === 'MR' ? 'bg-purple-500/15 text-purple-600' : 'bg-muted text-muted-foreground')}>
                  {p.modality}
                </span>
                <div>
                  <p className="text-[11px] font-medium leading-tight line-clamp-1">{p.description}</p>
                  <p className="text-[10px] text-muted-foreground">{p.studyDate}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main: Report editor */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Report header */}
        <div className="shrink-0 px-6 py-3 border-b border-border bg-card flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-sm">Radiology Report</span>
          </div>
          <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[report.status])}>
            {report.status}
          </span>
          {report.criticalFindings && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-destructive px-2 py-0.5 bg-destructive/10 rounded-full border border-destructive/20">
              <AlertTriangle className="h-3 w-3" />Critical
            </span>
          )}
          {signed && (
            <span className="flex items-center gap-1 text-[11px] text-green-600 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-200 dark:border-green-900">
              <CheckCircle2 className="h-3 w-3" />Signed: {report.signedBy}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={copyToClipboard}>
              <Copy className="h-3.5 w-3.5" />Copy
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              <Printer className="h-3.5 w-3.5" />Print
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => save()}>
              <Save className="h-3.5 w-3.5" />Save Draft
            </Button>
            {!signed ? (
              <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700" onClick={sign}>
                <Pen className="h-3.5 w-3.5" />Sign & Finalize
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => { setSigned(false); setReport(r => ({ ...r, status: 'Addendum' })); }}>
                + Addendum
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-4">
          {/* Template + RADS bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setTemplateOpen(true)}>
              <FileText className="h-3.5 w-3.5" />Templates
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setRadsDialogOpen(true)}>
              <Star className="h-3.5 w-3.5" />RADS Score
            </Button>
            <div className="flex items-center gap-1 ml-auto">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={report.criticalFindings}
                  onChange={e => setReport(r => ({ ...r, criticalFindings: e.target.checked }))}
                  className="rounded"
                />
                <AlertTriangle className="h-3 w-3 text-destructive" />
                Critical Finding
              </label>
            </div>
          </div>

          {/* Report form */}
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Patient & Study Information</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-muted-foreground">Patient:</span> <span className="font-medium">{study.patient.fullName}</span></div>
              <div><span className="text-muted-foreground">MRN:</span> <span className="font-medium">{study.patient.mrn}</span></div>
              <div><span className="text-muted-foreground">Study:</span> <span className="font-medium">{study.description}</span></div>
              <div><span className="text-muted-foreground">Date:</span> <span className="font-medium">{study.studyDate}</span></div>
              <div><span className="text-muted-foreground">Ordering:</span> <span className="font-medium">{study.orderingPhysician}</span></div>
              <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{study.patientLocation}</span></div>
            </CardContent>
          </Card>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">FINDINGS</label>
            <Textarea
              value={report.findings}
              onChange={e => setReport(r => ({ ...r, findings: e.target.value }))}
              placeholder="Describe imaging findings in detail…"
              className="min-h-[180px] text-sm font-mono leading-relaxed resize-none"
              disabled={signed}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">IMPRESSION</label>
            <Textarea
              value={report.impression}
              onChange={e => setReport(r => ({ ...r, impression: e.target.value }))}
              placeholder="Summarize key findings and recommendations…"
              className="min-h-[120px] text-sm font-mono leading-relaxed resize-none"
              disabled={signed}
            />
          </div>

          {/* RADS score display */}
          {report.radsScore && (
            <Card className="border-primary/30">
              <CardContent className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{report.radsScore.system} {report.radsScore.score}</span>
                  <span className="text-xs text-muted-foreground">— {report.radsScore.descriptor}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Recommendation: {report.radsScore.recommendation}</p>
              </CardContent>
            </Card>
          )}

          {/* Version history */}
          {report.versions.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-2"><History className="h-3.5 w-3.5" />Version History</p>
              {report.versions.map(v => (
                <div key={v.id} className="flex items-center gap-2 text-xs py-1.5 border-t border-border/50">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{new Date(v.timestamp).toLocaleString()}</span>
                  <span className={cn('px-1.5 rounded-full text-[10px]', STATUS_COLORS[v.status])}>{v.status}</span>
                  <span>{v.author}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template Dialog */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Select Report Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {relevantTemplates.map(t => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t.name}</span>
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 rounded">{t.modality} · {t.bodyPart}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.content.impression}</p>
              </button>
            ))}
            {relevantTemplates.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No templates for this modality.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* RADS Dialog */}
      <Dialog open={radsDialogOpen} onOpenChange={setRadsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">RADS Scoring Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">RADS System</label>
              <Select value={selectedRads} onValueChange={setSelectedRads}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select system…" />
                </SelectTrigger>
                <SelectContent>
                  {RADS_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {selectedRads && (
              <div className="space-y-2">
                <label className="text-xs font-medium">Score</label>
                {((RADS_SYSTEMS as any)[selectedRads] ?? []).map((d: any) => (
                  <button
                    key={d.score}
                    onClick={() => setRadsScore(d.score)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg border transition-colors text-xs',
                      radsScore === d.score ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm w-6">{d.score}</span>
                      <span className="font-medium">{d.descriptor}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5 ml-8">{d.recommendation}</p>
                  </button>
                ))}
              </div>
            )}
            <Button className="w-full" onClick={applyRads} disabled={!selectedRads || !radsScore}>
              Apply Score to Report
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
