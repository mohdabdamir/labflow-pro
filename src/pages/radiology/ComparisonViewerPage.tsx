import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_RADIOLOGY_STUDIES } from '@/data/radiologyMockData';
import type { Study } from '@/types/radiology';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Link2, Link2Off, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

function CompareViewport({ study, linked, sliceIndex, onSliceChange }: {
  study: Study | null; linked: boolean; sliceIndex: number; onSliceChange: (v: number) => void;
}) {
  const [localSlice, setLocalSlice] = useState(0);
  const slice = linked ? sliceIndex : localSlice;
  const setSlice = linked ? onSliceChange : setLocalSlice;
  const series = study?.series[0];

  if (!study || !series) {
    return (
      <div className="flex-1 bg-[#050a12] flex items-center justify-center text-muted-foreground flex-col gap-2">
        <Layers className="h-8 w-8 opacity-30" />
        <span className="text-xs">No study loaded</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
      {/* Header */}
      <div className="h-8 bg-card/90 border-b border-border flex items-center gap-2 px-3 text-xs shrink-0">
        <span className="font-medium truncate">{study.patient.fullName}</span>
        <span className="text-muted-foreground shrink-0">{study.studyDate}</span>
        <span className="font-mono text-[10px] bg-muted px-1 rounded shrink-0">{series.modality}</span>
      </div>
      {/* Simulated viewport */}
      <div className="flex-1 bg-[#050a12] flex items-center justify-center relative">
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 50% 45%, ${series.color}80 0%, ${series.color}40 40%, #050a12 75%)`,
          }}
        >
          <div className="absolute inset-0 flex items-end justify-start p-3 pointer-events-none">
            <div className="font-mono text-[10px] text-white/50 space-y-0.5">
              <p>{series.description}</p>
              <p>{slice + 1}/{series.imageCount}</p>
              <p>{study.modality} · {study.bodyPart}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Slice control */}
      <div className="h-8 bg-card/90 border-t border-border flex items-center gap-2 px-3 shrink-0">
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSlice(Math.max(0, slice - 1))}>
          <ChevronLeft className="h-3 w-3" />
        </Button>
        <Slider
          value={[slice]}
          min={0}
          max={Math.max(0, series.imageCount - 1)}
          step={1}
          onValueChange={([v]) => setSlice(v)}
          className="flex-1 h-3"
        />
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSlice(Math.min(series.imageCount - 1, slice + 1))}>
          <ChevronRight className="h-3 w-3" />
        </Button>
        <span className="text-[10px] font-mono text-muted-foreground w-12 text-center">{slice + 1}/{series.imageCount}</span>
      </div>
    </div>
  );
}

export default function ComparisonViewerPage() {
  const navigate = useNavigate();
  const [linked, setLinked] = useState(true);
  const [syncedSlice, setSyncedSlice] = useState(0);
  const [layout, setLayout] = useState<2 | 3 | 4>(2);
  const [selectedIds, setSelectedIds] = useState<(string | null)[]>(['ST001', 'ST020', null, null]);

  const studies = selectedIds.map(id => id ? ALL_RADIOLOGY_STUDIES.find(s => s.id === id) ?? null : null);

  const slots = Array.from({ length: layout });

  return (
    <div className="h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 h-10 bg-card border-b border-border flex items-center gap-2 px-3">
        <span className="text-xs font-semibold text-muted-foreground">Comparison View</span>

        {/* Layout selector */}
        {([2, 3, 4] as const).map(n => (
          <Button
            key={n}
            variant={layout === n ? 'default' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setLayout(n)}
          >
            {n}-up
          </Button>
        ))}

        <div className="w-px h-5 bg-border" />

        {/* Sync toggle */}
        <Button
          variant={linked ? 'default' : 'ghost'}
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={() => setLinked(l => !l)}
        >
          {linked ? <Link2 className="h-3.5 w-3.5" /> : <Link2Off className="h-3.5 w-3.5" />}
          {linked ? 'Linked' : 'Unlinked'}
        </Button>

        {/* Study selectors */}
        <div className="ml-4 flex items-center gap-2 flex-wrap">
          {slots.map((_, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground">VP{i + 1}:</span>
              <Select
                value={selectedIds[i] ?? ''}
                onValueChange={v => setSelectedIds(prev => { const n = [...prev]; n[i] = v || null; return n; })}
              >
                <SelectTrigger className="h-7 w-44 text-xs">
                  <SelectValue placeholder="Select study…" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ALL_RADIOLOGY_STUDIES.slice(0, 15).map(s => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.patient.fullName} · {s.modality} · {s.studyDate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </div>

      {/* Viewports */}
      <div className="flex flex-1 overflow-hidden gap-0.5 bg-muted/30">
        {slots.map((_, i) => (
          <CompareViewport
            key={i}
            study={studies[i] ?? null}
            linked={linked}
            sliceIndex={syncedSlice}
            onSliceChange={setSyncedSlice}
          />
        ))}
      </div>
    </div>
  );
}
