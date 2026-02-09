import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Beaker, AlertCircle, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Case, Sample, SampleType, CaseTest } from '@/types/lab';
import { toast } from 'sonner';

interface SampleCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  caseData: Case;
  onSave: (samples: Sample[]) => void;
}

interface TubeGroup {
  tubeId: string;
  sampleType: SampleType;
  tests: CaseTest[];
  collected: boolean;
}

export function SampleCollectionDialog({ open, onClose, caseData, onSave }: SampleCollectionDialogProps) {
  const [collectorName, setCollectorName] = useState('');

  // Group tests by tube ID (from samples)
  const tubeGroups = useMemo((): TubeGroup[] => {
    const groups: TubeGroup[] = [];

    if (caseData.samples.length > 0) {
      // Use existing samples as tube groups
      caseData.samples.forEach(sample => {
        const tests = caseData.tests.filter(t => sample.testIds.includes(t.testId));
        groups.push({
          tubeId: sample.tubeId,
          sampleType: sample.sampleType,
          tests,
          collected: sample.status !== 'pending',
        });
      });
    } else {
      // Group by sample type (fallback)
      const typeMap = new Map<SampleType, CaseTest[]>();
      caseData.tests.forEach(t => {
        const existing = typeMap.get(t.sampleType) || [];
        existing.push(t);
        typeMap.set(t.sampleType, existing);
      });
      typeMap.forEach((tests, sampleType) => {
        groups.push({
          tubeId: tests[0]?.tubeId || 'N/A',
          sampleType,
          tests,
          collected: false,
        });
      });
    }

    return groups;
  }, [caseData]);

  const [collectionState, setCollectionState] = useState<TubeGroup[]>(() =>
    tubeGroups.map(g => ({ ...g }))
  );

  const allCollected = collectionState.every(g => g.collected);
  const anyCollected = collectionState.some(g => g.collected);

  const toggleCollection = (tubeId: string) => {
    setCollectionState(prev =>
      prev.map(g => g.tubeId === tubeId ? { ...g, collected: !g.collected } : g)
    );
  };

  const copyTubeId = (tubeId: string) => {
    navigator.clipboard.writeText(tubeId);
    toast.success('Tube ID copied');
  };

  // Group tests for display: show profile headers, then list tests
  const renderTestsForTube = (tests: CaseTest[]) => {
    const profileGroups = new Map<string, CaseTest[]>();
    const singleTests: CaseTest[] = [];

    tests.forEach(test => {
      if (test.profileId && test.profileName) {
        const existing = profileGroups.get(test.profileId) || [];
        existing.push(test);
        profileGroups.set(test.profileId, existing);
      } else {
        singleTests.push(test);
      }
    });

    return (
      <div className="space-y-1 mt-2">
        {Array.from(profileGroups.entries()).map(([profileId, profileTests]) => (
          <div key={profileId}>
            <p className="text-xs font-semibold text-primary">{profileTests[0]?.profileName}</p>
            <div className="flex flex-wrap gap-1 ml-3">
              {profileTests.map(t => (
                <Badge key={t.testId} variant="secondary" className="text-xs">{t.testCode} - {t.testName}</Badge>
              ))}
            </div>
          </div>
        ))}
        {singleTests.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {singleTests.map(t => (
              <Badge key={t.testId} variant="secondary" className="text-xs">{t.testCode} - {t.testName}</Badge>
            ))}
          </div>
        )}
      </div>
    );
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const samples: Sample[] = collectionState.map(g => ({
      id: caseData.samples.find(s => s.tubeId === g.tubeId)?.id || `SM-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tubeId: g.tubeId,
      sampleType: g.sampleType,
      status: g.collected ? 'collected' as const : 'pending' as const,
      collectedAt: g.collected ? now : undefined,
      collectedBy: g.collected ? (collectorName || undefined) : undefined,
      testIds: g.tests.map(t => t.testId),
    }));

    onSave(samples);
    onClose();
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
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Sample Collection - {caseData.caseNumber}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-4">
            {/* Patient Info */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{caseData.patientName}</p>
              <p className="text-sm text-muted-foreground">
                {caseData.patientAge}y / {caseData.patientGender} • {caseData.tests.length} tests • {collectionState.length} tubes
              </p>
            </div>

            <div>
              <Label htmlFor="collectorName">Collected By</Label>
              <Input id="collectorName" value={collectorName} onChange={(e) => setCollectorName(e.target.value)} placeholder="Phlebotomist name" className="mt-1" />
            </div>

            <Separator />

            {/* Tube groups */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Tubes ({collectionState.length})</p>

              {collectionState.map(group => (
                <Card key={group.tubeId} className={cn('transition-all', group.collected ? 'border-status-completed bg-status-completed/5' : '')}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox checked={group.collected} onCheckedChange={() => toggleCollection(group.tubeId)} className="mt-1" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn('w-3 h-3 rounded-full', getSampleTypeColor(group.sampleType))} />
                            <span className="font-medium">{group.sampleType}</span>
                            {group.collected && <Check className="h-4 w-4 text-status-completed" />}
                          </div>
                          {renderTestsForTube(group.tests)}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground mb-1">Tube ID</p>
                        <div className="flex items-center gap-1">
                          <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{group.tubeId}</code>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyTubeId(group.tubeId)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!anyCollected && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>Mark tubes as collected to proceed</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!anyCollected}>
            <Check className="h-4 w-4 mr-1" />
            {allCollected ? 'Complete Collection' : 'Save Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
