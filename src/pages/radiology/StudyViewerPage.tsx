import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_RADIOLOGY_STUDIES, WINDOW_LEVEL_PRESETS } from '@/data/radiologyMockData';
import type { Study, ImageSeries, Measurement } from '@/types/radiology';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2,
  Ruler, Circle, Type, ArrowRight, Trash2, LayoutGrid,
  FileText, Layers, SplitSquareVertical, Brain, Play, Pause,
  ChevronLeft, ChevronRight, Settings2, Crosshair, Move,
  Activity, FlipHorizontal2,
} from 'lucide-react';
import {
  Tooltip, TooltipContent, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function adjustBrightness(_hex: string, brightness: number): string {
  const b = Math.min(255, Math.max(0, brightness));
  return `rgb(${Math.round(b * 0.35)},${Math.round(b * 0.4)},${Math.round(b * 0.5)})`;
}
function clamp(v: number) { return Math.min(255, Math.max(0, Math.round(v))); }

const PIXEL_SPACING_MM = 0.5; // simulated 0.5 mm/pixel

// ─── SimulatedImage (canvas renderer, exposing ref) ──────────────────────────
interface SimulatedImageProps {
  series: ImageSeries;
  sliceIndex: number;
  zoom: number;
  windowLevel: { window: number; level: number };
  className?: string;
}
const SimulatedImage = forwardRef<HTMLCanvasElement, SimulatedImageProps>(
  ({ series, sliceIndex, zoom, windowLevel, className }, ref) => {
    const internalRef = useRef<HTMLCanvasElement>(null);
    const canvasRef = (ref as React.RefObject<HTMLCanvasElement>) ?? internalRef;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#050a12';
      ctx.fillRect(0, 0, W, H);

      const brightness = Math.min(255, Math.max(0, (windowLevel.level / 400) * 200 + 55));
      const contrast = Math.min(255, Math.max(50, (2000 / windowLevel.window) * 120));
      const cx = W / 2, cy = H / 2;
      const bodyColor = series.color;

      if (series.pattern === 'axial') {
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
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius + 8, (radius + 8) * 0.85, 0, 0, Math.PI * 2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = adjustBrightness('#ffffff', contrast);
        ctx.stroke();
        if (sliceIndex > 5 && sliceIndex < 30) {
          ctx.beginPath();
          ctx.ellipse(cx - 15, cy - 5, 14, 8, -0.3, 0, Math.PI * 2);
          ctx.ellipse(cx + 15, cy - 5, 14, 8, 0.3, 0, Math.PI * 2);
          ctx.fillStyle = '#050a12';
          ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(cx, cy - radius * 0.7);
        ctx.lineTo(cx, cy + radius * 0.7);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.stroke();
      } else if (series.pattern === 'sagittal') {
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
        ctx.fillStyle = adjustBrightness(bodyColor, brightness - 20);
        ctx.fillRect(W * 0.15, H * 0.1, W * 0.7, H * 0.8);
        ctx.beginPath();
        ctx.moveTo(cx, H * 0.1);
        ctx.lineTo(cx, H * 0.9);
        ctx.lineWidth = 2;
        ctx.strokeStyle = adjustBrightness('#ffffff', contrast + 30);
        ctx.stroke();
      }

      // Noise
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

      // DICOM overlay
      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(series.description, 10, 18);
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
);
SimulatedImage.displayName = 'SimulatedImage';

// ─── Types ───────────────────────────────────────────────────────────────────
type Tool = 'pan' | 'zoom' | 'wl' | 'length' | 'angle' | 'circle' | 'text' | 'arrow' | 'hu';

interface Point { x: number; y: number; }
interface DrawMeasurement extends Measurement { p1: Point; p2: Point; }
interface HUReading { x: number; y: number; value: number; }

const TOOLS: { id: Tool; icon: React.ComponentType<{ className?: string }>; label: string }[] = [
  { id: 'wl', icon: Settings2, label: 'Window/Level (drag)' },
  { id: 'pan', icon: Move, label: 'Pan' },
  { id: 'zoom', icon: ZoomIn, label: 'Zoom' },
  { id: 'length', icon: Ruler, label: 'Length Measure' },
  { id: 'angle', icon: FlipHorizontal2, label: 'Angle' },
  { id: 'circle', icon: Circle, label: 'Circle ROI' },
  { id: 'hu', icon: Activity, label: 'HU Probe' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
];

const LAYOUTS = [
  { rows: 1, cols: 1, label: '1×1' },
  { rows: 1, cols: 2, label: '1×2' },
  { rows: 2, cols: 2, label: '2×2' },
  { rows: 1, cols: 3, label: '1×3' },
  { rows: 3, cols: 3, label: '3×3' },
];

// ─── MPR Viewport ─────────────────────────────────────────────────────────────
function MPRViewport({
  series, sliceIndex, label, windowLevel, zoom,
  crosshairX, crosshairY, onCrosshairMove,
}: {
  series: ImageSeries; sliceIndex: number; label: string;
  windowLevel: { window: number; level: number }; zoom: number;
  crosshairX: number; crosshairY: number;
  onCrosshairMove: (x: number, y: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onCrosshairMove(x, y);
  };

  return (
    <div ref={containerRef} className="relative flex-1 bg-[#050a12] overflow-hidden cursor-crosshair"
      onMouseMove={handleMouseMove}>
      <SimulatedImage series={series} sliceIndex={sliceIndex} zoom={zoom}
        windowLevel={windowLevel} className="w-full h-full" />
      {/* Crosshair SVG overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <line x1={`${crosshairX * 100}%`} y1="0%" x2={`${crosshairX * 100}%`} y2="100%"
          stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.7" />
        <line x1="0%" y1={`${crosshairY * 100}%`} x2="100%" y2={`${crosshairY * 100}%`}
          stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.7" />
        <circle cx={`${crosshairX * 100}%`} cy={`${crosshairY * 100}%`} r="4"
          fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.9" />
      </svg>
      {/* Label */}
      <div className="absolute top-2 right-2 bg-black/70 text-primary text-[10px] font-bold px-2 py-0.5 rounded font-mono">
        {label}
      </div>
    </div>
  );
}

// ─── Main Viewer ─────────────────────────────────────────────────────────────
export default function StudyViewerPage() {
  const { studyId } = useParams<{ studyId: string }>();
  const navigate = useNavigate();
  const study = ALL_RADIOLOGY_STUDIES.find(s => s.id === studyId) ?? ALL_RADIOLOGY_STUDIES[0];

  const [activeSeries, setActiveSeries] = useState(0);
  const [sliceIndex, setSliceIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [wl, setWl] = useState(WINDOW_LEVEL_PRESETS[0]);
  const [wlInput, setWlInput] = useState({ w: WINDOW_LEVEL_PRESETS[0].window, l: WINDOW_LEVEL_PRESETS[0].level });
  const [activeTool, setActiveTool] = useState<Tool>('wl');
  const [playing, setPlaying] = useState(false);
  const [cineSpeed, setCineSpeed] = useState(8);
  const [fullscreen, setFullscreen] = useState(false);
  const [layout, setLayout] = useState(LAYOUTS[0]);
  const [showAI, setShowAI] = useState(false);
  const [mprMode, setMprMode] = useState(false);

  // Measurements: DrawMeasurement with actual canvas coords
  const [measurements, setMeasurements] = useState<DrawMeasurement[]>([]);
  const [drawStart, setDrawStart] = useState<Point | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<Point | null>(null);

  // HU state
  const [huLive, setHuLive] = useState<number | null>(null);
  const [huReadings, setHuReadings] = useState<HUReading[]>([]);
  const [huCursorPos, setHuCursorPos] = useState<{ x: number; y: number } | null>(null);

  // W/L drag
  const wlDragRef = useRef<{ startX: number; startY: number; startW: number; startL: number } | null>(null);

  // Canvas ref (for HU sampling)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // MPR crosshair
  const [mprCrosshair, setMprCrosshair] = useState({ x: 0.5, y: 0.5 });

  const currentSeries = study.series[activeSeries];
  const totalSlices = currentSeries?.imageCount ?? 1;

  // Sync wlInput when wl changes via preset
  useEffect(() => {
    setWlInput({ w: wl.window, l: wl.level });
  }, [wl]);

  // Cine loop
  useEffect(() => {
    if (!playing || !currentSeries) return;
    const id = setInterval(() => setSliceIndex(i => (i + 1) % totalSlices), 1000 / cineSpeed);
    return () => clearInterval(id);
  }, [playing, totalSlices, cineSpeed, currentSeries]);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setSliceIndex(i => Math.min(totalSlices - 1, i + 1));
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setSliceIndex(i => Math.max(0, i - 1));
      if (e.key === 'f') setFullscreen(f => !f);
      if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
      if (e.key === 'Escape') { setDrawStart(null); setDrawCurrent(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [totalSlices]);

  // ── Convert DOM coords → canvas 512×512 coords ──────────────────────────
  const domToCanvas = useCallback((domX: number, domY: number, rect: DOMRect): Point => {
    const scaleX = 512 / rect.width;
    const scaleY = 512 / rect.height;
    return { x: domX * scaleX, y: domY * scaleY };
  }, []);

  // ── Sample HU from canvas ─────────────────────────────────────────────────
  const sampleHU = useCallback((cx: number, cy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const px = Math.round(clamp(cx));
    const py = Math.round(clamp(cy));
    try {
      const data = ctx.getImageData(px, py, 1, 1).data;
      const gray = (data[0] + data[1] + data[2]) / 3;
      const hu = Math.round((gray / 255) * wl.window + (wl.level - wl.window / 2));
      return hu;
    } catch { return null; }
  }, [wl]);

  // ── Mouse handlers for viewport ───────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const domX = e.clientX - rect.left;
    const domY = e.clientY - rect.top;
    const cp = domToCanvas(domX, domY, rect);

    if (activeTool === 'wl') {
      wlDragRef.current = { startX: e.clientX, startY: e.clientY, startW: wl.window, startL: wl.level };
    } else if (activeTool === 'length' || activeTool === 'circle' || activeTool === 'angle') {
      setDrawStart(cp);
      setDrawCurrent(cp);
    } else if (activeTool === 'hu') {
      const hu = sampleHU(cp.x, cp.y);
      if (hu !== null) {
        setHuReadings(prev => [...prev.slice(-9), { x: domX, y: domY, value: hu }]);
        toast({ title: `HU Value: ${hu}`, description: `Position (${Math.round(cp.x)}, ${Math.round(cp.y)})` });
      }
    }
  }, [activeTool, domToCanvas, sampleHU, wl]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const domX = e.clientX - rect.left;
    const domY = e.clientY - rect.top;
    const cp = domToCanvas(domX, domY, rect);

    // W/L drag
    if (activeTool === 'wl' && wlDragRef.current && e.buttons === 1) {
      const dx = e.clientX - wlDragRef.current.startX;
      const dy = e.clientY - wlDragRef.current.startY;
      const newW = Math.max(1, wlDragRef.current.startW + dx * 4);
      const newL = wlDragRef.current.startL - dy * 2;
      setWl(p => ({ ...p, window: Math.round(newW), level: Math.round(newL) }));
      setWlInput({ w: Math.round(newW), l: Math.round(newL) });
      return;
    }

    // Measurement draw
    if (drawStart && e.buttons === 1) {
      setDrawCurrent(cp);
    }

    // HU live probe
    if (activeTool === 'hu') {
      const hu = sampleHU(cp.x, cp.y);
      if (hu !== null) {
        setHuLive(hu);
        setHuCursorPos({ x: domX, y: domY });
      }
    }
  }, [activeTool, domToCanvas, drawStart, sampleHU]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    wlDragRef.current = null;

    if (!drawStart || !drawCurrent) return;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    const dx = drawCurrent.x - drawStart.x;
    const dy = drawCurrent.y - drawStart.y;
    const pixelDist = Math.sqrt(dx * dx + dy * dy);
    const mmDist = pixelDist * PIXEL_SPACING_MM;

    if (pixelDist < 5) { setDrawStart(null); setDrawCurrent(null); return; }

    const type = activeTool === 'circle' ? 'roi' : activeTool === 'angle' ? 'angle' : 'length';
    const unit = activeTool === 'circle' ? 'cm²' : 'mm';
    const value = activeTool === 'circle'
      ? parseFloat((Math.PI * (mmDist / 2) * (mmDist / 2) / 100).toFixed(1))
      : parseFloat(mmDist.toFixed(1));

    const m: DrawMeasurement = {
      id: `M${Date.now()}`,
      type, value, unit,
      seriesId: currentSeries?.id ?? '',
      sliceIndex,
      x1: drawStart.x, y1: drawStart.y,
      x2: drawCurrent.x, y2: drawCurrent.y,
      p1: drawStart, p2: drawCurrent,
    };

    setMeasurements(prev => [...prev, m]);
    toast({ title: 'Measurement saved', description: `${value} ${unit}` });
    setDrawStart(null);
    setDrawCurrent(null);
  }, [drawStart, drawCurrent, activeTool, currentSeries, sliceIndex]);

  const handleMouseLeave = useCallback(() => {
    setHuLive(null);
    setHuCursorPos(null);
  }, []);

  // Canvas-to-DOM scale for SVG overlay
  const svgScale = useCallback((cp: Point, rect: DOMRect): Point => ({
    x: (cp.x / 512) * rect.width,
    y: (cp.y / 512) * rect.height,
  }), []);

  const currentMeasurements = measurements.filter(
    m => m.seriesId === currentSeries?.id && m.sliceIndex === sliceIndex
  );

  // MPR series: use first 3 series if available, or simulate patterns
  const mprSeries = (): { axial: ImageSeries; sagittal: ImageSeries; coronal: ImageSeries } => {
    const base = study.series[0];
    const axial = study.series.find(s => s.pattern === 'axial') ?? { ...base, pattern: 'axial' as const };
    const sagittal = study.series.find(s => s.pattern === 'sagittal') ?? { ...base, pattern: 'sagittal' as const, description: 'SAG Recon' };
    const coronal = study.series.find(s => s.pattern === 'coronal') ?? { ...base, pattern: 'coronal' as const, description: 'COR Recon' };
    return { axial, sagittal, coronal };
  };

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
      {/* ─── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 h-10 bg-card border-b border-border flex items-center gap-1 px-2 overflow-x-auto">
        {/* Patient info */}
        <div className="text-xs text-muted-foreground hidden sm:block px-2 border-r border-border mr-1 shrink-0">
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
                className="h-7 w-7 shrink-0"
                onClick={() => setActiveTool(t.id)}
              >
                <t.icon className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.label}</TooltipContent>
          </Tooltip>
        ))}

        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* MPR toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={mprMode ? 'default' : 'ghost'}
              size="sm"
              className="h-7 text-xs gap-1 shrink-0"
              onClick={() => setMprMode(m => !m)}
            >
              <SplitSquareVertical className="h-3.5 w-3.5" />
              MPR
            </Button>
          </TooltipTrigger>
          <TooltipContent>Multi-Planar Reconstruction</TooltipContent>
        </Tooltip>

        {/* W/L Presets */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 shrink-0">
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

        {/* Layout (hidden in MPR mode) */}
        {!mprMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel className="text-xs">Layout</DropdownMenuLabel>
              {LAYOUTS.map(l => (
                <DropdownMenuItem key={l.label} onClick={() => setLayout(l)} className="text-xs">{l.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <div className="w-px h-5 bg-border mx-1 shrink-0" />

        {/* Clear measurements */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"
              onClick={() => { setMeasurements([]); setHuReadings([]); }}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear All Annotations</TooltipContent>
        </Tooltip>

        {/* AI */}
        <Button
          variant={showAI ? 'default' : 'ghost'}
          size="sm"
          className="h-7 text-xs ml-1 shrink-0"
          onClick={() => setShowAI(!showAI)}
        >
          AI {study.aiFindings?.length ? `(${study.aiFindings.length})` : ''}
        </Button>

        <div className="ml-auto flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7"
            onClick={() => navigate(`/radiology/reports/${study.id}`)}>
            <FileText className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setFullscreen(f => !f)}>
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Thumbnail strip ────────────────────────────────────────────── */}
        {!mprMode && (
          <div className="w-28 shrink-0 bg-card border-r border-border flex flex-col overflow-y-auto scrollbar-thin gap-1 p-1">
            {study.series.map((s, i) => (
              <button key={s.id} onClick={() => { setActiveSeries(i); setSliceIndex(0); }}
                className={cn(
                  'relative w-full aspect-square rounded overflow-hidden border-2 transition-all text-[9px] text-white font-mono',
                  activeSeries === i ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                )}>
                <div className="w-full h-full flex items-end justify-start p-1"
                  style={{ background: `linear-gradient(135deg, ${s.color} 0%, #050a12 100%)` }}>
                  <span className="leading-tight text-left line-clamp-2">{s.description}</span>
                </div>
                <div className="absolute top-1 right-1 bg-black/60 rounded text-[8px] px-0.5">{s.imageCount}</div>
              </button>
            ))}
          </div>
        )}

        {/* ─── MPR Mode ────────────────────────────────────────────────────── */}
        {mprMode ? (
          <div className="flex-1 flex bg-[#050a12] gap-0.5 overflow-hidden">
            {(() => {
              const { axial, sagittal, coronal } = mprSeries();
              return (
                <>
                  <MPRViewport series={axial} sliceIndex={sliceIndex} label="AX"
                    windowLevel={wl} zoom={zoom}
                    crosshairX={mprCrosshair.x} crosshairY={mprCrosshair.y}
                    onCrosshairMove={(x, y) => setMprCrosshair({ x, y })} />
                  <div className="w-0.5 bg-border" />
                  <MPRViewport series={sagittal} sliceIndex={Math.floor(sliceIndex * 0.7)} label="SAG"
                    windowLevel={wl} zoom={zoom}
                    crosshairX={mprCrosshair.y} crosshairY={mprCrosshair.x}
                    onCrosshairMove={(x, y) => setMprCrosshair({ x: y, y: x })} />
                  <div className="w-0.5 bg-border" />
                  <MPRViewport series={coronal} sliceIndex={Math.floor(sliceIndex * 0.5)} label="COR"
                    windowLevel={wl} zoom={zoom}
                    crosshairX={mprCrosshair.x} crosshairY={1 - mprCrosshair.y}
                    onCrosshairMove={(x, y) => setMprCrosshair({ x, y: 1 - y })} />
                </>
              );
            })()}
          </div>
        ) : (
          /* ─── Normal viewport grid ─────────────────────────────────────── */
          <div
            className="flex-1 overflow-hidden bg-[#050a12]"
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
              gap: '2px',
            }}
          >
            {Array.from({ length: layout.rows * layout.cols }).map((_, vpIdx) => {
              const si = (activeSeries + vpIdx) % study.series.length;
              const s = study.series[si];
              if (!s) return <div key={vpIdx} className="bg-black" />;

              const isPrimary = vpIdx === 0;
              const vpMeasurements = isPrimary ? currentMeasurements : [];

              return (
                <div
                  key={vpIdx}
                  ref={isPrimary ? viewportRef : undefined}
                  className={cn(
                    'relative overflow-hidden flex items-center justify-center bg-[#050a12]',
                    isPrimary && 'cursor-crosshair'
                  )}
                  onMouseDown={isPrimary ? handleMouseDown : undefined}
                  onMouseMove={isPrimary ? handleMouseMove : undefined}
                  onMouseUp={isPrimary ? handleMouseUp : undefined}
                  onMouseLeave={isPrimary ? handleMouseLeave : undefined}
                >
                  <SimulatedImage
                    ref={isPrimary ? canvasRef : undefined}
                    series={s}
                    sliceIndex={vpIdx === 0 ? sliceIndex : Math.floor(s.imageCount / 2)}
                    zoom={zoom}
                    windowLevel={wl}
                    className="select-none"
                  />

                  {/* SVG overlay for measurements */}
                  {isPrimary && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      {/* In-progress line */}
                      {drawStart && drawCurrent && viewportRef.current && (() => {
                        const rect = viewportRef.current.getBoundingClientRect();
                        const p1 = svgScale(drawStart, rect);
                        const p2 = svgScale(drawCurrent, rect);
                        const mx = (p1.x + p2.x) / 2;
                        const my = (p1.y + p2.y) / 2;
                        const dx = p2.x - p1.x;
                        const dy = p2.y - p1.y;
                        const dist = (Math.sqrt(dx * dx + dy * dy) * PIXEL_SPACING_MM).toFixed(1);
                        return (
                          <g>
                            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                              stroke="#facc15" strokeWidth="1.5" strokeDasharray="4,3" />
                            <circle cx={p1.x} cy={p1.y} r="3" fill="#facc15" />
                            <circle cx={p2.x} cy={p2.y} r="3" fill="#facc15" />
                            <text x={mx + 4} y={my - 4} fill="#facc15" fontSize="11"
                              fontFamily="monospace" className="select-none">
                              {dist} mm
                            </text>
                          </g>
                        );
                      })()}

                      {/* Saved measurements */}
                      {vpMeasurements.map(m => {
                        if (!viewportRef.current) return null;
                        const rect = viewportRef.current.getBoundingClientRect();
                        const p1 = svgScale(m.p1, rect);
                        const p2 = svgScale(m.p2, rect);
                        const mx = (p1.x + p2.x) / 2;
                        const my = (p1.y + p2.y) / 2;
                        if (m.type === 'roi') {
                          const dx = p2.x - p1.x, dy = p2.y - p1.y;
                          const r = Math.sqrt(dx * dx + dy * dy) / 2;
                          const cx = (p1.x + p2.x) / 2, cy = (p1.y + p2.y) / 2;
                          return (
                            <g key={m.id}>
                              <circle cx={cx} cy={cy} r={r}
                                stroke="#38bdf8" strokeWidth="1.5" fill="rgba(56,189,248,0.08)" />
                              <text x={cx} y={cy - r - 4} fill="#38bdf8" fontSize="11"
                                fontFamily="monospace" textAnchor="middle" className="select-none">
                                {m.value} {m.unit}
                              </text>
                            </g>
                          );
                        }
                        return (
                          <g key={m.id}>
                            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                              stroke="#facc15" strokeWidth="1.5" />
                            <circle cx={p1.x} cy={p1.y} r="3" fill="#facc15" />
                            <circle cx={p2.x} cy={p2.y} r="3" fill="#facc15" />
                            <text x={mx + 4} y={my - 4} fill="#facc15" fontSize="11"
                              fontFamily="monospace" className="select-none">
                              {m.value} {m.unit}
                            </text>
                          </g>
                        );
                      })}

                      {/* HU readings */}
                      {huReadings.map((hr, i) => (
                        <g key={i}>
                          <circle cx={hr.x} cy={hr.y} r="5"
                            stroke="#a78bfa" strokeWidth="1.5" fill="rgba(167,139,250,0.15)" />
                          <text x={hr.x + 8} y={hr.y - 4} fill="#a78bfa" fontSize="11"
                            fontFamily="monospace" className="select-none">
                            HU: {hr.value}
                          </text>
                        </g>
                      ))}
                    </svg>
                  )}

                  {/* HU live cursor tooltip */}
                  {isPrimary && activeTool === 'hu' && huLive !== null && huCursorPos && (
                    <div
                      className="absolute pointer-events-none bg-black/90 border border-purple-500/60 rounded px-2 py-1 text-[11px] font-mono text-purple-300 z-10"
                      style={{ left: huCursorPos.x + 12, top: huCursorPos.y - 20 }}
                    >
                      HU: {huLive}
                    </div>
                  )}

                  {/* AI overlay */}
                  {showAI && isPrimary && study.aiFindings?.map(f => (
                    <div key={f.id} className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="h-10 w-10 rounded-full border-2 border-yellow-400 border-dashed opacity-80 animate-pulse" />
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
        )}

        {/* ─── AI panel ──────────────────────────────────────────────────── */}
        {showAI && study.aiFindings && study.aiFindings.length > 0 && (
          <div className="w-56 shrink-0 bg-card border-l border-border flex flex-col overflow-y-auto scrollbar-thin">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs font-semibold">AI Findings</p>
              <p className="text-[10px] text-muted-foreground">{study.aiFindings.length} detected</p>
            </div>
            {study.aiFindings.map(f => (
              <div key={f.id} className="p-2 border-b border-border/50 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <span className={cn('h-2 w-2 rounded-full mt-0.5 shrink-0',
                    f.severity === 'high' ? 'bg-destructive' :
                    f.severity === 'medium' ? 'bg-orange-500' : 'bg-yellow-500')} />
                  <p className="text-[11px] font-medium leading-tight">{f.description}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>{f.location}</span>
                  <span className="font-mono text-primary">{Math.round(f.confidence * 100)}%</span>
                </div>
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

      {/* ─── Bottom controls ───────────────────────────────────────────────── */}
      <div className="shrink-0 bg-card border-t border-border">
        {/* HU summary bar (visible when HU tool) */}
        {activeTool === 'hu' && (
          <div className="flex items-center gap-3 px-3 py-1 border-b border-border/50 bg-purple-950/20">
            <Activity className="h-3 w-3 text-purple-400 shrink-0" />
            <span className="text-[10px] font-mono text-purple-300">
              Live HU: {huLive !== null ? huLive : '—'}
            </span>
            {huReadings.length > 0 && (
              <>
                <span className="text-border">|</span>
                <span className="text-[10px] text-muted-foreground">
                  Samples: {huReadings.length} &nbsp;
                  Min: {Math.min(...huReadings.map(h => h.value))} &nbsp;
                  Max: {Math.max(...huReadings.map(h => h.value))} &nbsp;
                  Mean: {Math.round(huReadings.reduce((a, b) => a + b.value, 0) / huReadings.length)}
                </span>
              </>
            )}
            <Button variant="ghost" size="sm" className="h-5 text-[10px] ml-auto"
              onClick={() => setHuReadings([])}>Clear HU</Button>
          </div>
        )}

        <div className="h-10 flex items-center gap-2 px-3">
          {/* Slice navigation */}
          <Button variant="ghost" size="icon" className="h-6 w-6"
            onClick={() => setSliceIndex(i => Math.max(0, i - 1))}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <div className="flex-1 max-w-xs">
            <Slider value={[sliceIndex]} min={0} max={Math.max(0, totalSlices - 1)} step={1}
              onValueChange={([v]) => setSliceIndex(v)} className="h-4" />
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6"
            onClick={() => setSliceIndex(i => Math.min(totalSlices - 1, i + 1))}>
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
          <div className="w-16">
            <Slider value={[cineSpeed]} min={1} max={30} step={1}
              onValueChange={([v]) => setCineSpeed(v)} className="h-4" />
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

          {/* W/L inline numeric inputs */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[10px] text-muted-foreground font-mono">W</span>
            <Input
              type="number"
              value={wlInput.w}
              onChange={e => {
                const v = parseInt(e.target.value) || 1;
                setWlInput(p => ({ ...p, w: v }));
                setWl(p => ({ ...p, window: Math.max(1, v), name: 'Custom' }));
              }}
              className="h-6 w-16 text-[10px] font-mono px-1.5 text-center"
            />
            <span className="text-[10px] text-muted-foreground font-mono">L</span>
            <Input
              type="number"
              value={wlInput.l}
              onChange={e => {
                const v = parseInt(e.target.value) || 0;
                setWlInput(p => ({ ...p, l: v }));
                setWl(p => ({ ...p, level: v, name: 'Custom' }));
              }}
              className="h-6 w-16 text-[10px] font-mono px-1.5 text-center"
            />
          </div>

          {/* W/L sliders */}
          <div className="hidden lg:flex items-center gap-2 ml-1">
            <div className="w-20">
              <Slider value={[wl.window]} min={1} max={4000}
                onValueChange={([v]) => { setWl(p => ({ ...p, window: v, name: 'Custom' })); setWlInput(p => ({ ...p, w: v })); }}
                className="h-4" />
            </div>
            <div className="w-20">
              <Slider value={[wl.level]} min={-1000} max={1000}
                onValueChange={([v]) => { setWl(p => ({ ...p, level: v, name: 'Custom' })); setWlInput(p => ({ ...p, l: v })); }}
                className="h-4" />
            </div>
          </div>

          {/* Measurement count badge */}
          {currentMeasurements.length > 0 && (
            <span className="ml-1 text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded px-1.5 font-mono">
              {currentMeasurements.length} meas
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
