import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAPCases } from '@/hooks/useAPData';
import type { APSpecimen, APAncillaryStudy, APFrozenSection, APCancerType } from '@/types/anatomicPathology';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft, Save, CheckCircle2, Plus, Trash2,
  AlertTriangle, FlaskConical, FileText, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/hooks/useUserStore';
import { APReportPreviewDialog } from '@/components/ap/APReportPreviewDialog';

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

const CANCER_OPTIONS: { value: APCancerType; label: string; color: string }[] = [
  { value: 'benign',       label: 'Benign',       color: 'text-emerald-600' },
  { value: 'intermediate', label: 'Intermediate', color: 'text-amber-600' },
  { value: 'malignant',    label: 'Malignant',    color: 'text-destructive' },
  { value: 'pending',      label: 'Pending',      color: 'text-muted-foreground' },
];

const COMMON_STAINS = [
  'H&E', 'PAS', 'Masson Trichrome', 'Alcian Blue', 'Reticulin', 'Congo Red',
  'ER', 'PR', 'HER2', 'Ki-67', 'p53', 'p16', 'p63', 'HMWCK', 'CD3', 'CD20', 'CD30',
  'CD45', 'CD138', 'SOX10', 'S100', 'HMB45', 'Melan-A', 'SMA', 'Desmin',
  'AMACR', 'PSA', 'PIN4', 'MLH1', 'MSH2', 'MSH6', 'PMS2',
  'CDX2', 'CK7', 'CK20', 'TTF-1', 'Napsin A', 'Synaptophysin', 'Chromogranin',
  'FISH (HER2)', 'FISH (ALK)',
];

export default function APTranscription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCaseById, updateCase } = useAPCases();
  const { toast } = useToast();
  const { currentUser } = useUserStore();
  const apCase = getCaseById(id ?? '');

  const [specimens, setSpecimens] = useState<APSpecimen[]>(apCase?.specimens ?? []);
  const [comment, setComment] = useState(apCase?.pathologistComment ?? '');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeSpecimen, setActiveSpecimen] = useState(0);

  if (!apCase) return <div className="p-8 text-muted-foreground">Case not found.</div>;

  const updateSpecimen = (idx: number, field: keyof APSpecimen, value: unknown) =>
    setSpecimens(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));

  // Ancillary studies
  const addAncillary = (sIdx: number) => {
    const sp = specimens[sIdx];
    const study: APAncillaryStudy = {
      id: genId(), specimenIndex: sp.specimenIndex, blockNumber: '', stainName: '', result: '',
      interpretation: '', performedAt: new Date().toISOString(), performedBy: currentUser?.fullName,
    };
    updateSpecimen(sIdx, 'ancillaryStudies', [...(sp.ancillaryStudies ?? []), study]);
  };
  const updateAncillary = (sIdx: number, aIdx: number, field: keyof APAncillaryStudy, val: string) => {
    const sp = specimens[sIdx];
    const updated = (sp.ancillaryStudies ?? []).map((a, i) => i === aIdx ? { ...a, [field]: val } : a);
    updateSpecimen(sIdx, 'ancillaryStudies', updated);
  };
  const removeAncillary = (sIdx: number, aIdx: number) => {
    const sp = specimens[sIdx];
    updateSpecimen(sIdx, 'ancillaryStudies', (sp.ancillaryStudies ?? []).filter((_, i) => i !== aIdx));
  };

  // Frozen sections
  const addFrozen = (sIdx: number) => {
    const sp = specimens[sIdx];
    const fs: APFrozenSection = {
      id: genId(), specimenIndex: sp.specimenIndex,
      requestedAt: new Date().toISOString(), diagnosis: '', communicatedTo: '',
    };
    updateSpecimen(sIdx, 'frozenSections', [...(sp.frozenSections ?? []), fs]);
  };
  const updateFrozen = (sIdx: number, fIdx: number, field: keyof APFrozenSection, val: string) => {
    const sp = specimens[sIdx];
    const updated = (sp.frozenSections ?? []).map((f, i) => i === fIdx ? { ...f, [field]: val } : f);
    updateSpecimen(sIdx, 'frozenSections', updated);
  };
  const removeFrozen = (sIdx: number, fIdx: number) => {
    const sp = specimens[sIdx];
    updateSpecimen(sIdx, 'frozenSections', (sp.frozenSections ?? []).filter((_, i) => i !== fIdx));
  };

  const overallCancer = (): APCancerType => {
    if (specimens.some(s => s.cancerType === 'malignant')) return 'malignant';
    if (specimens.some(s => s.cancerType === 'intermediate')) return 'intermediate';
    if (specimens.every(s => s.cancerType === 'benign')) return 'benign';
    return 'pending';
  };

  const handleSave = (finalize = false) => {
    const now = new Date().toISOString();
    updateCase(apCase.id, {
      specimens,
      pathologistComment: comment,
      overallCancerType: overallCancer(),
      status: finalize ? 'review' : 'transcription',
      transcriptionStartedAt: apCase.transcriptionStartedAt || now,
    });
    toast({ title: finalize ? 'Sent for review' : 'Saved', description: finalize ? 'Case moved to Review.' : 'Transcription saved.' });
    if (finalize) navigate(`/ap/cases/${apCase.id}`);
  };

  const sp = specimens[activeSpecimen];

  return (
    <div className="flex h-full">
      {/* Specimen sidebar */}
      <div className="w-48 border-r border-border bg-muted/20 p-3 space-y-1 flex-shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Specimens</p>
        {specimens.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveSpecimen(i)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors',
              activeSpecimen === i ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-muted text-foreground',
            )}
          >
            <span className={cn(
              'h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
              s.cancerType === 'malignant' ? 'bg-destructive text-destructive-foreground' :
              s.cancerType === 'intermediate' ? 'bg-amber-500 text-white' :
              s.cancerType === 'benign' ? 'bg-emerald-500 text-white' : 'bg-muted-foreground/30 text-foreground',
            )}>{s.specimenLabel}</span>
            <span className="truncate">{s.specimenName || `Specimen ${s.specimenLabel}`}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/ap/cases/${apCase.id}`)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Transcription — {apCase.caseNumber}</h1>
            <p className="text-sm text-muted-foreground">{apCase.patientName}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="gap-1.5"><Eye className="h-3.5 w-3.5" />Preview PDF</Button>
            <Button variant="outline" size="sm" onClick={() => handleSave(false)} className="gap-1.5"><Save className="h-3.5 w-3.5" />Save</Button>
            <Button size="sm" onClick={() => handleSave(true)} className="gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Send for Review</Button>
          </div>
        </div>

        {sp && (
          <>
            {/* Specimen Header */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">{sp.specimenLabel}</span>
                  {sp.specimenName}
                  <span className="text-xs font-normal text-muted-foreground">{sp.site}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Microscopic Findings */}
                <div className="space-y-1.5">
                  <Label className="font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4" />Microscopic Findings</Label>
                  <Textarea
                    value={sp.microscopicFindings ?? ''}
                    onChange={e => updateSpecimen(activeSpecimen, 'microscopicFindings', e.target.value)}
                    rows={5}
                    placeholder="Describe microscopic findings in detail..."
                    className="text-sm font-mono"
                  />
                </div>

                {/* Diagnosis */}
                <div className="space-y-1.5">
                  <Label className="font-semibold flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" />Diagnosis</Label>
                  <Textarea
                    value={sp.diagnosis ?? ''}
                    onChange={e => updateSpecimen(activeSpecimen, 'diagnosis', e.target.value)}
                    rows={3}
                    placeholder="Enter the final diagnosis for this specimen..."
                    className="text-sm font-semibold"
                  />
                </div>

                {/* Cancer classification */}
                <div className="flex items-center gap-4">
                  <Label className="font-semibold text-sm shrink-0">Cancer Classification:</Label>
                  <div className="flex gap-2">
                    {CANCER_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => updateSpecimen(activeSpecimen, 'cancerType', opt.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                          sp.cancerType === opt.value
                            ? `border-current ${opt.color} bg-current/10`
                            : 'border-border text-muted-foreground hover:border-current/50',
                          opt.color,
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {sp.cancerType === 'malignant' && (
                    <Badge className="bg-destructive/10 text-destructive border-0 animate-pulse ml-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />MALIGNANT
                    </Badge>
                  )}
                  {sp.cancerType === 'intermediate' && (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-0 ml-2">
                      INTERMEDIATE
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Frozen Sections */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Frozen Section Reports ({(sp.frozenSections ?? []).length})</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => addFrozen(activeSpecimen)}>
                    <Plus className="h-3.5 w-3.5" />Add Frozen Section
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(sp.frozenSections ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No frozen sections for this specimen.</p>
                ) : (
                  <div className="space-y-3">
                    {(sp.frozenSections ?? []).map((fs, fi) => (
                      <div key={fs.id} className="grid grid-cols-2 gap-2 p-3 rounded-lg border border-border bg-muted/20">
                        <div className="col-span-2 flex justify-between items-center">
                          <span className="text-xs font-semibold text-foreground">Frozen Section {fi + 1}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFrozen(activeSpecimen, fi)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Requested By</Label>
                          <Input value={fs.requestedBy ?? ''} onChange={e => updateFrozen(activeSpecimen, fi, 'requestedBy', e.target.value)} className="h-7 text-xs" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px]">Communicated To</Label>
                          <Input value={fs.communicatedTo ?? ''} onChange={e => updateFrozen(activeSpecimen, fi, 'communicatedTo', e.target.value)} className="h-7 text-xs" />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-[10px]">Frozen Section Diagnosis</Label>
                          <Textarea value={fs.diagnosis} onChange={e => updateFrozen(activeSpecimen, fi, 'diagnosis', e.target.value)} rows={2} className="text-xs" />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-[10px]">Notes</Label>
                          <Input value={fs.notes ?? ''} onChange={e => updateFrozen(activeSpecimen, fi, 'notes', e.target.value)} className="h-7 text-xs" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ancillary Studies */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Ancillary Studies / Special Stains ({(sp.ancillaryStudies ?? []).length})</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => addAncillary(activeSpecimen)}>
                    <Plus className="h-3.5 w-3.5" />Add Study
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(sp.ancillaryStudies ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No ancillary studies for this specimen.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground">
                          <th className="text-left pb-2 pr-2">Block</th>
                          <th className="text-left pb-2 pr-2">Stain / Marker</th>
                          <th className="text-left pb-2 pr-2">Result</th>
                          <th className="text-left pb-2 pr-2">Interpretation</th>
                          <th className="text-left pb-2 pr-2">Performed By</th>
                          <th className="pb-2" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(sp.ancillaryStudies ?? []).map((a, ai) => (
                          <tr key={a.id}>
                            <td className="py-1.5 pr-2">
                              <Select value={a.blockNumber || sp.blocks[0]?.blockLabel} onValueChange={v => updateAncillary(activeSpecimen, ai, 'blockNumber', v)}>
                                <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {sp.blocks.map(b => <SelectItem key={b.id} value={b.blockLabel}>{b.blockLabel}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-1.5 pr-2">
                              <Select value={a.stainName} onValueChange={v => updateAncillary(activeSpecimen, ai, 'stainName', v)}>
                                <SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="Select stain..." /></SelectTrigger>
                                <SelectContent className="max-h-48">
                                  {COMMON_STAINS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-1.5 pr-2">
                              <Input value={a.result} onChange={e => updateAncillary(activeSpecimen, ai, 'result', e.target.value)} className="h-7 w-28 text-xs" placeholder="Positive / Negative" />
                            </td>
                            <td className="py-1.5 pr-2">
                              <Input value={a.interpretation ?? ''} onChange={e => updateAncillary(activeSpecimen, ai, 'interpretation', e.target.value)} className="h-7 w-36 text-xs" placeholder="Optional" />
                            </td>
                            <td className="py-1.5 pr-2">
                              <Input value={a.performedBy ?? ''} onChange={e => updateAncillary(activeSpecimen, ai, 'performedBy', e.target.value)} className="h-7 w-28 text-xs" />
                            </td>
                            <td className="py-1.5">
                              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeAncillary(activeSpecimen, ai)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Pathologist Comment (global) */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pathologist Comment <span className="text-muted-foreground font-normal">(appears on report)</span></CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Enter clinical comments, recommendations, suggestions for further investigation, MDT referral note..."
            />
          </CardContent>
        </Card>
      </div>

      {previewOpen && (
        <APReportPreviewDialog
          apCase={{ ...apCase, specimens, pathologistComment: comment, overallCancerType: overallCancer() }}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
