import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, Beaker, AlertCircle, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateTubeId } from '@/lib/tubeIdGenerator';
import { generateId } from '@/data/mockData';
import type { Case, Sample, SampleType } from '@/types/lab';
import { toast } from 'sonner';

interface SampleCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  caseData: Case;
  onSave: (samples: Sample[]) => void;
}

interface SampleGroup {
  sampleType: SampleType;
  testIds: string[];
  testCodes: string[];
  tubeId: string;
  collected: boolean;
}

export function SampleCollectionDialog({ open, onClose, caseData, onSave }: SampleCollectionDialogProps) {
  const [collectorName, setCollectorName] = useState('');

  // Group tests by sample type
  const sampleGroups = useMemo(() => {
    const groups: Map<SampleType, { testIds: string[]; testCodes: string[] }> = new Map();
    
    caseData.tests.forEach(test => {
      const existing = groups.get(test.sampleType) || { testIds: [], testCodes: [] };
      existing.testIds.push(test.testId);
      existing.testCodes.push(test.testCode);
      groups.set(test.sampleType, existing);
    });

    const result: SampleGroup[] = [];
    groups.forEach((value, sampleType) => {
      // Check if sample already exists
      const existingSample = caseData.samples.find(s => s.sampleType === sampleType);
      result.push({
        sampleType,
        testIds: value.testIds,
        testCodes: value.testCodes,
        tubeId: existingSample?.tubeId || generateTubeId(sampleType),
        collected: existingSample?.status !== 'pending' && !!existingSample,
      });
    });

    return result;
  }, [caseData]);

  const [collectionState, setCollectionState] = useState<SampleGroup[]>(() => 
    sampleGroups.map(g => ({ ...g }))
  );

  const allCollected = collectionState.every(g => g.collected);
  const anyCollected = collectionState.some(g => g.collected);

  const toggleCollection = (sampleType: SampleType) => {
    setCollectionState(prev => 
      prev.map(g => 
        g.sampleType === sampleType 
          ? { ...g, collected: !g.collected }
          : g
      )
    );
  };

  const regenerateTubeId = (sampleType: SampleType) => {
    setCollectionState(prev =>
      prev.map(g =>
        g.sampleType === sampleType
          ? { ...g, tubeId: generateTubeId(sampleType) }
          : g
      )
    );
  };

  const copyTubeId = (tubeId: string) => {
    navigator.clipboard.writeText(tubeId);
    toast.success('Tube ID copied to clipboard');
  };

  const handleSave = () => {
    const now = new Date().toISOString();
    const samples: Sample[] = collectionState
      .filter(g => g.collected)
      .map(g => ({
        id: generateId('SM'),
        tubeId: g.tubeId,
        sampleType: g.sampleType,
        status: 'collected' as const,
        collectedAt: now,
        collectedBy: collectorName || undefined,
        testIds: g.testIds,
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
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Sample Collection - {caseData.caseNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Info */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="font-medium">{caseData.patientName}</p>
            <p className="text-sm text-muted-foreground">
              {caseData.patientAge}y / {caseData.patientGender} • {caseData.tests.length} tests
            </p>
          </div>

          {/* Collector Name */}
          <div>
            <Label htmlFor="collectorName">Collected By</Label>
            <Input
              id="collectorName"
              value={collectorName}
              onChange={(e) => setCollectorName(e.target.value)}
              placeholder="Phlebotomist name"
              className="mt-1"
            />
          </div>

          <Separator />

          {/* Sample Groups */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Required Samples ({collectionState.length} tubes)
            </p>

            {collectionState.map((group) => (
              <Card
                key={group.sampleType}
                className={cn(
                  'transition-all',
                  group.collected ? 'border-status-completed bg-status-completed/5' : ''
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={group.collected}
                        onCheckedChange={() => toggleCollection(group.sampleType)}
                        className="mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'w-3 h-3 rounded-full',
                              getSampleTypeColor(group.sampleType)
                            )}
                          />
                          <span className="font-medium">{group.sampleType}</span>
                          {group.collected && (
                            <Check className="h-4 w-4 text-status-completed" />
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {group.testCodes.map(code => (
                            <Badge key={code} variant="secondary" className="text-xs">
                              {code}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Tube ID */}
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Tube ID</p>
                      <div className="flex items-center gap-1">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {group.tubeId}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyTubeId(group.tubeId)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs h-auto p-0 mt-1"
                        onClick={() => regenerateTubeId(group.sampleType)}
                      >
                        Regenerate ID
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!anyCollected && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>Mark samples as collected to proceed with case processing</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!anyCollected}>
            <Check className="h-4 w-4 mr-1" />
            {allCollected ? 'Complete Collection' : 'Save Collection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
