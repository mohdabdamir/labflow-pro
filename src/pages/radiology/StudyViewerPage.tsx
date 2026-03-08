import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_RADIOLOGY_STUDIES, WINDOW_LEVEL_PRESETS } from '@/data/radiologyMockData';
import type { Study, ImageSeries, Measurement } from '@/types/radiology';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2,
  Ruler, Circle, Type, ArrowRight, Undo2, Redo2,
  ChevronLeft, ChevronRight, Play, Pause, Settings2,
  Layers, SplitSquareVertical, Brain,
  Copy, Trash2, LayoutGrid, FileText,
} from 'lucide-react';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

// ─── Simulated Image Canvas ────────────────────────────────────────────────
function SimulatedImage({ series, sliceIndex, zoom, windowLevel, className }: {
  series: ImageSeries; sliceIndex: number; zoom: number;
  windowLevel: { window: number; level: number }; className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#050a12';
    ctx.fillRect(0, 0, W, H);

    // Simulate grayscale intensity based on W/L
    const brightness = Math.min(255, Math.max(0, (windowLevel.level / 400) * 200 + 55));
    const contrast = Math.min(255, Math.max(50, (2000 / windowLevel.window) * 120));

    // Body silhouette
    const cx = W / 2, cy = H / 2;
    const bodyColor = series.color;

    if (series.pattern === 'axial') {
      // Axial brain slice simulation
      const radius = Math.min(W, H) * 0.4 * (1 + sliceIndex * 0.002);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, adjustBrightness(bodyColor, brightness + 40));
      grad.addColorStop(0.5, adjustBrightness(bodyColor, brightness + 20));
      grad.addColorStop(0.8, adjustBrightness(bodyColor, brightness));
      grad.addColorStop(1, '#050a12');
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius * 0.85, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Skull ring
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius + 8, (radius + 8) * 0.85, 0, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = adjustBrightness('#ffffff', contrast);
      ctx.stroke();

      // Inner structures (ventricles, etc.)
      if (sliceIndex > 5 && sliceIndex < 30) {
        ctx.beginPath();
        ctx.ellipse(cx - 15, cy - 5, 14, 8, -0.3, 0, Math.PI * 2);
        ctx.ellipse(cx + 15, cy - 5, 14, 8, 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#050a12';
        ctx.fill();
      }

      // Midline
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius * 0.7);
      ctx.lineTo(cx, cy + radius * 0.7);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(255,255,255,0.08)`;
      ctx.stroke();

    } else if (series.pattern === 'sagittal') {
      // Sagittal - elongated shape
      const rX = W * 0.3, rY = H * 0.42;
      const grad = ctx.createRadialGradient(cx, cy * 0.9, 0, cx, cy * 0.9, rY);
      grad.addColorStop(0, adjustBrightness(bodyColor, brightness + 30));
      grad.addColorStop(0.6, adjustBrightness(bodyColor, brightness));
      grad.addColorStop(1, '#050a12');
      ctx.beginPath();
      ctx.ellipse(cx, cy * 0.9, rX, rY, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    } else if (series.pattern === 'coronal') {
      // Coronal
      const rX = W * 0.38, rY = H * 0.38;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rX);
      grad.addColorStop(0, adjustBrightness(bodyColor, brightness + 30));
      grad.addColorStop(0.7, adjustBrightness(bodyColor, brightness));
      grad.addColorStop(1, '#050a12');
      ctx.beginPath();
      ctx.ellipse(cx, cy, rX, rY, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    } else {
      // Scout
      ctx.fillStyle = adjustBrightness(bodyColor, brightness - 20);
      ctx.fillRect(W * 0.15, H * 0.1, W * 0.7, H * 0.8);
      // Spine line
      ctx.beginPath();
      ctx.moveTo(cx, H * 0.1);
      ctx.lineTo(cx, H * 0.9);
      ctx.lineWidth = 2;
      ctx.strokeStyle = adjustBrightness('#ffffff', contrast + 30);
      ctx.stroke();
    }

    // Noise texture for realism
    const imgData = ctx.getImageData(0, 0, W, H);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const noise = (Math.random() - 0.5) * 8;
      if (d[i + 3] > 0) {
        d[i] = clamp(d[i] + noise);
        d[i + 1] = clamp(d[i + 1] + noise);
        d[i + 2] = clamp(d[i + 2] + noise);
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // DICOM overlay text
    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(`${series.description}`, 10, 18);
    ctx.fillText(`Slice: ${sliceIndex + 1}/${series.imageCount}`, 10, 33);
    ctx.fillText(`W:${windowLevel.window} L:${windowLevel.level}`, 10, H - 18);
    ctx.fillText(`Z:${Math.round(zoom * 100)}%`, W - 55, H - 18);

  }, [series, sliceIndex, zoom, windowLevel]);

  return (
    <canvas
      ref={canvasRef}
      width={512}
      height={512}
      className={cn('w-full h-full object-contain', className)}
    />
  );
}

function adjustBrightness(hexColor: string, brightness: number): string {
  const b = Math.min(255, Math.max(0, brightness));
  return `rgb(${Math.round(b * 0.35)},${Math.round(b * 0.4)},${Math.round(b * 0.5)})`;
}
function clamp(v: number) { return Math.min(255, Math.max(0, Math.round(v))); }

// ─── Tool Types ───────────────────────────────────────────────────────────────
type Tool = 'pan' | 'zoom' | 'wl' | 'length' | 'angle' | 'circle' | 'text' | 'arrow';

const TOOLS: { id: Tool; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'wl', icon: Settings2, label: 'Window/Level' },
  { id: 'pan', icon: ArrowRight, label: 'Pan' },
  { id: 'zoom', icon: ZoomIn, label: 'Zoom' },
  { id: 'length', icon: Ruler, label: 'Length' },
  { id: 'angle', icon: Layers, label: 'Angle' },
  { id: 'circle', icon: Circle, label: 'Circle ROI' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
];

const LAYOUTS = [
  { rows: 1, cols: 1, label: '1×1', icon: '⬜' },
  { rows: 1, cols: 2, label: '1×2', icon: '⬜⬜' },
  { rows: 2, cols: 2, label: '2×2', icon: '⬜⬜\n⬜⬜' },
  { rows: 1, cols: 3, label: '1×3', icon: '⬜⬜⬜' },
  { rows: 3, cols: 3, label: '3×3', icon: '3×3' },
];

export default function StudyViewerPage() {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const study = ALL_RADIOLOGY_STUDIES.find(s => s.id === studyId) ?? ALL_RADIOLOGY_STUDIES[0];

  const [activeSeries, setActiveSeries] = useState(0);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [wl, setWl] = useState(WINDOW_LEVEL_PRESETS[0]);
  const [activeTool, setActiveTool] = useState<Tool>('wl');
  const [playing, setPlaying] = useState(false);
  const [cineSpeed, setCineSpeed] = useState(8);
  const [fullscreen, setFullscreen] = useState(false);
  const [layout, setLayout] = useState(LAYOUTS[0]);
  const [showAI, setShowAI] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [history, setHistory] = useState<number[]>([]);

  const currentSeries = study.series[activeSeries];
  const totalSlices = currentSeries?.imageCount ?? 1;

  // Cine loop
  useEffect(() => {
    if (!playing || !currentSeries) return;
    const id = setInterval(() => {
      setSliceIndex(i => (i + 1) % totalSlices);
    }, 1000 / cineSpeed);
    return () => clearInterval(id);
  }, [playing, totalSlices, cineSpeed, currentSeries]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setSliceIndex(i => Math.min(totalSlices - 1, i + 1));
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setSliceIndex(i => Math.max(0, i - 1));
      if (e.key === 'f') setFullscreen(f => !f);
      if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [totalSlices]);

  const addMeasurement = useCallback(() => {
    const m: Measurement = {
      id: `M${Date.now()}`,
      type: activeTool === 'circle' ? 'roi' : activeTool === 'angle' ? 'angle' : 'length',
      value: Math.round(Math.random() * 30 + 5),
      unit: activeTool === 'circle' ? 'cm²' : 'mm',
      seriesId: currentSeries?.id ?? '',
      sliceIndex,
      x1: 100, y1: 100, x2: 200, y2: 150,
    };
    setMeasurements(prev => [...prev, m]);
    toast({ title: 'Measurement added', description: `${m.value} ${m.unit}` });
  }, [activeTool, currentSeries, sliceIndex]);

  if (!study.series.length) {
    return (
      <div className="h-[calc(100vh-56px)] flex items-center justify-center flex-col gap-4 text-muted-foreground">
        <Layers className="h-12 w-12 opacity-30" />
        <p className="text-sm">No series available for this study.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/radiology')}>Back to Worklist</Button>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-[calc(100vh-56px)]', fullscreen && 'fixed inset-0 z-50 bg-background')}>
      {/* Viewer toolbar */}
      <div className="shrink-0 h-10 bg-card border-b border-border flex items-center gap-1 px-2">
        {/* Patient info */}
        <div className="text-xs text-muted-foreground hidden sm:block px-2 border-r border-border mr-1">
          <span className="font-semibold text-foreground">{study.patient.fullName}</span>
          <span className="ml-2">{study.patient.mrn}</span>
          <span className="ml-2 opacity-60">{study.accessionNumber}</span>
        </div>

        {/* Tools */}
        {TOOLS.map(t => (
          <Tooltip key={t.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === t.id ? 'default' : 'ghost'}
                size="icon"
                className="h-7 w-7"
                onClick={() => setActiveTool(t.id)}
              >
                <t.icon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.label}</TooltipContent>
          </Tooltip>
        ))}

        <div className="w-px h-5 bg-border mx-1" />

        {/* W/L Presets */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              <Brain className="h-3.5 w-3.5" />
              {wl.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="text-xs">Window/Level Presets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {WINDOW_LEVEL_PRESETS.map(p => (
              <DropdownMenuItem key={p.name} onClick={() => setWl(p)} className="text-xs">
                <span className="w-24">{p.name}</span>
                <span className="text-muted-foreground ml-2">W:{p.window} L:{p.level}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Layout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="text-xs">Layout</DropdownMenuLabel>
            {LAYOUTS.map(l => (
              <DropdownMenuItem key={l.label} onClick={() => setLayout(l)} className="text-xs">
                {l.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Measurement actions */}
        {['length', 'circle', 'angle', 'text'].includes(activeTool) && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addMeasurement}>
            + Add
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMeasurements([])}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>

        {/* AI */}
        <Button
          variant={showAI ? 'default' : 'ghost'}
          size="sm"
          className="h-7 text-xs ml-1"
          onClick={() => setShowAI(!showAI)}
        >
          AI {study.aiFindings?.length ? `(${study.aiFindings.length})` : ''}
        </Button>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigate(`/radiology/reports/${study.id}`)}>
            <FileText className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFullscreen(f => !f)}>
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnail strip */}
        <div className="w-28 shrink-0 bg-card border-r border-border flex flex-col overflow-y-auto scrollbar-thin gap-1 p-1">
          {study.series.map((s, i) => (
            <button
              key={s.id}
              onClick={() => { setActiveSeries(i); setSliceIndex(0); }}
              className={cn(
                'relative w-full aspect-square rounded overflow-hidden border-2 transition-all text-[9px] text-white font-mono',
                activeSeries === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
              )}
            >
              <div
                className="w-full h-full flex items-end justify-start p-1"
                style={{ background: `linear-gradient(135deg, ${s.color} 0%, #050a12 100%)` }}
              >
                <span className="leading-tight text-left line-clamp-2">{s.description}</span>
              </div>
              <div className="absolute top-1 right-1 bg-black/60 rounded text-[8px] px-0.5">{s.imageCount}</div>
            </button>
          ))}
        </div>

        {/* Main viewport grid */}
        <div
          className="flex-1 overflow-hidden bg-[#050a12]"
          style={{ display: 'grid', gridTemplateRows: `repeat(${layout.rows}, 1fr)`, gridTemplateColumns: `repeat(${layout.cols}, 1fr)`, gap: '2px' }}
        >
          {Array.from({ length: layout.rows * layout.cols }).map((_, vpIdx) => {
            const si = (activeSeries + vpIdx) % study.series.length;
            const s = study.series[si];
            if (!s) return <div key={vpIdx} className="bg-black" />;
            return (
              <div key={vpIdx} className="relative overflow-hidden flex items-center justify-center bg-[#050a12] group/vp">
                <SimulatedImage
                  series={s}
                  sliceIndex={vpIdx === 0 ? sliceIndex : Math.floor(s.imageCount / 2)}
                  zoom={zoom}
                  windowLevel={wl}
                  className="select-none"
                />
                {/* AI overlay */}
                {showAI && vpIdx === 0 && study.aiFindings?.map(f => (
                  <div key={f.id} className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="h-10 w-10 rounded-full border-2 border-yellow-400 border-dashed opacity-80 animate-pulse" />
                  </div>
                ))}
                {/* Measurements overlay */}
                {vpIdx === 0 && measurements.filter(m => m.seriesId === s.id).map(m => (
                  <div key={m.id} className="absolute top-1/2 left-1/2 text-yellow-400 text-[10px] font-mono pointer-events-none">
                    {m.value}{m.unit}
                  </div>
                ))}
                {/* Viewport label */}
                <div className="absolute top-2 left-2 text-[10px] text-white/40 font-mono pointer-events-none">
                  {s.modality} {s.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right panel: AI findings (conditional) */}
        {showAI && study.aiFindings && study.aiFindings.length > 0 && (
          <div className="w-56 shrink-0 bg-card border-l border-border flex flex-col overflow-y-auto scrollbar-thin">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-semibold">AI Findings</p>
              <p className="text-[10px] text-muted-foreground">{study.aiFindings.length} detected</p>
            </div>
            {study.aiFindings.map((f, fi) => (
              <div key={f.id} className="p-2 border-b border-border/50 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <span className={cn('h-2 w-2 rounded-full mt-0.5 shrink-0', f.severity === 'high' ? 'bg-destructive' : f.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500')} />
                  <p className="text-[11px] font-medium leading-tight">{f.description}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{f.location}</span>
                  <span className="font-mono text-primary">{Math.round(f.confidence * 100)}%</span>
                </div>
                {/* Confidence bar */}
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${f.confidence * 100}%` }} />
                </div>
                <div className="flex gap-1 pt-0.5">
                  <Button size="sm" variant="outline" className="h-5 text-[10px] px-2 flex-1 text-green-600 border-green-200">Accept</Button>
                  <Button size="sm" variant="ghost" className="h-5 text-[10px] px-2 flex-1 text-destructive">Reject</Button>
                </div>
              </div>
            ))}
            <div className="p-2 mt-auto border-t border-border">
              <Button size="sm" className="w-full h-7 text-xs">Accept All → Report</Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="shrink-0 h-10 bg-card border-t border-border flex items-center gap-3 px-3">
        {/* Slice navigation */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSliceIndex(i => Math.max(0, i - 1))}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <div className="flex-1 max-w-xs">
          <Slider
            value={[sliceIndex]}
            min={0}
            max={Math.max(0, totalSlices - 1)}
            step={1}
            onValueChange={([v]) => setSliceIndex(v)}
            className="h-4"
          />
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSliceIndex(i => Math.min(totalSlices - 1, i + 1))}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
        <span className="text-[10px] text-muted-foreground font-mono w-16 text-center">
          {sliceIndex + 1} / {totalSlices}
        </span>

        <div className="w-px h-5 bg-border" />

        {/* Cine */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setPlaying(p => !p)}>
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </Button>
        <div className="w-20">
          <Slider value={[cineSpeed]} min={1} max={30} step={1} onValueChange={([v]) => setCineSpeed(v)} className="h-4" />
        </div>
        <span className="text-[10px] text-muted-foreground">{cineSpeed} fps</span>

        <div className="w-px h-5 bg-border" />

        {/* Zoom */}
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <span className="text-[10px] w-10 text-center text-muted-foreground">{Math.round(zoom * 100)}%</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setZoom(z => Math.min(4, z + 0.1))}>
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setZoom(1); setSliceIndex(0); }}>
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>

        {/* W/L sliders */}
        <div className="hidden xl:flex items-center gap-2 ml-4">
          <span className="text-[10px] text-muted-foreground w-4">W</span>
          <div className="w-24">
            <Slider value={[wl.window]} min={1} max={4000} onValueChange={([v]) => setWl(p => ({ ...p, window: v }))} className="h-4" />
          </div>
          <span className="text-[10px] text-muted-foreground w-4">L</span>
          <div className="w-24">
            <Slider value={[wl.level]} min={-1000} max={1000} onValueChange={([v]) => setWl(p => ({ ...p, level: v }))} className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
