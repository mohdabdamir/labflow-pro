import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAPCases } from '@/hooks/useAPData';
import type { APSpecimen, APBlock } from '@/types/anatomicPathology';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Save, FlaskConical, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUserStore } from '@/hooks/useUserStore';

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

export default function APGrossing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCaseById, updateCase } = useAPCases();
  const { toast } = useToast();
  const { currentUser } = useUserStore();
  const apCase = getCaseById(id ?? '');

  const [specimens, setSpecimens] = useState<APSpecimen[]>(apCase?.specimens ?? []);

  if (!apCase) return <div className="p-8 text-muted-foreground">Case not found.</div>;

  const updateSpecimen = (idx: number, field: keyof APSpecimen, value: unknown) => {
    setSpecimens(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const addBlock = (specimenIdx: number) => {
    setSpecimens(prev => prev.map((s, i) => {
      if (i !== specimenIdx) return s;
      const nextLabel = `${s.specimenLabel}${s.blocks.length + 1}`;
      return { ...s, numberOfBlocks: s.numberOfBlocks + 1, blocks: [...s.blocks, { id: genId(), blockLabel: nextLabel, description: '' }] };
    }));
  };

  const updateBlock = (specimenIdx: number, blockIdx: number, field: keyof APBlock, value: string) => {
    setSpecimens(prev => prev.map((s, i) => {
      if (i !== specimenIdx) return s;
      return { ...s, blocks: s.blocks.map((b, j) => j === blockIdx ? { ...b, [field]: value } : b) };
    }));
  };

  const removeBlock = (specimenIdx: number, blockIdx: number) => {
    setSpecimens(prev => prev.map((s, i) => {
      if (i !== specimenIdx || s.blocks.length <= 1) return s;
      return { ...s, blocks: s.blocks.filter((_, j) => j !== blockIdx), numberOfBlocks: s.numberOfBlocks - 1 };
    }));
  };

  const handleSave = (finalize = false) => {
    const now = new Date().toISOString();
    const updatedSpecimens = specimens.map(s => ({
      ...s,
      grossedBy: s.grossedBy || currentUser?.fullName || 'Pathologist',
      grossedAt: s.grossedAt || now,
    }));
    updateCase(apCase.id, {
      specimens: updatedSpecimens,
      status: finalize ? 'processing' : 'grossing',
      grossingStartedAt: apCase.grossingStartedAt || now,
    });
    toast({ title: finalize ? 'Grossing complete' : 'Progress saved', description: finalize ? 'Case moved to Processing.' : 'Grossing data saved.' });
    if (finalize) navigate(`/ap/cases/${apCase.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/ap/cases/${apCase.id}`)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Grossing — {apCase.caseNumber}</h1>
          <p className="text-sm text-muted-foreground">{apCase.patientName} · {apCase.caseType} · {apCase.numberOfSpecimens} specimen(s)</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave(false)} className="gap-1.5"><Save className="h-3.5 w-3.5" />Save Draft</Button>
          <Button size="sm" onClick={() => handleSave(true)} className="gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" />Complete Grossing</Button>
        </div>
      </div>

      {specimens.map((sp, si) => (
        <Card key={sp.id} className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">{sp.specimenLabel}</span>
              <span>Specimen {sp.specimenLabel}: {sp.specimenName}</span>
              {sp.deficiencies && <Badge variant="destructive" className="text-[10px] ml-2">Deficiency noted</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sp.deficiencies && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
                <span className="font-semibold">Specimen Deficiency: </span>{sp.deficiencies}
              </div>
            )}

            {/* Block management */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Blocks ({sp.blocks.length})</Label>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => addBlock(si)}>
                  <Plus className="h-3.5 w-3.5" />Add Block
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {sp.blocks.map((blk, bi) => (
                  <div key={blk.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20">
                    <span className="text-xs font-bold text-primary w-6 shrink-0">{blk.blockLabel}</span>
                    <Input
                      value={blk.description}
                      onChange={e => updateBlock(si, bi, 'description', e.target.value)}
                      placeholder="Block description..."
                      className="h-7 text-xs flex-1"
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => removeBlock(si, bi)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Gross Description */}
            <div className="space-y-1.5">
              <Label className="font-semibold">Gross Description</Label>
              <Textarea
                value={sp.grossDescription ?? ''}
                onChange={e => updateSpecimen(si, 'grossDescription', e.target.value)}
                rows={4}
                placeholder="Describe the specimen macroscopically — size, shape, color, consistency, margins, measurements, lesion characteristics..."
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Specimen Name</Label>
                <Input value={sp.specimenName} onChange={e => updateSpecimen(si, 'specimenName', e.target.value)} className="h-8 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Site / Location</Label>
                <Input value={sp.site ?? ''} onChange={e => updateSpecimen(si, 'site', e.target.value)} className="h-8 text-xs" placeholder="e.g. Right breast" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Fixative</Label>
                <Input value={sp.fixative ?? ''} onChange={e => updateSpecimen(si, 'fixative', e.target.value)} className="h-8 text-xs" placeholder="e.g. 10% NBF" />
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              {sp.grossedBy ? `Grossed by ${sp.grossedBy}` : ''}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
