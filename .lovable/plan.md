
## What exists now

The `StudyViewerPage.tsx` is a ~508-line file with:
- A `SimulatedImage` canvas renderer that draws anatomy shapes using Window/Level values
- Basic tool state (`pan`, `zoom`, `wl`, `length`, `angle`, `circle`, `text`, `arrow`)
- Measurement state stored but drawn as a static yellow label overlay (not interactive canvas lines)
- W/L sliders exist in the bottom bar but only adjust display values — no canvas mouse interaction
- No HU calculation, no MPR planes, no DICOM connection configuration

The `AdminPage.tsx` has preferences, hanging protocols, templates, users, shortcuts tabs — no DICOM machine configuration tab.

`RadiologyLayout.tsx` nav: Worklist, Viewer, Compare, Reports, Admin.

---

## Plan: 5 Major Feature Areas

### 1. Interactive Measurement Tool (canvas-drawn lines with labels)
**Where**: `StudyViewerPage.tsx` — rewrite the canvas interaction layer

**What changes**:
- Add `mousedown`/`mousemove`/`mouseup` event handlers to the viewport `<div>` (not the canvas, to allow overlay)
- When tool is `length`: on mousedown store `startPoint`, on mousemove draw a temporary line overlay, on mouseup finalize the measurement and compute pixel distance → convert to mm using a simulated pixel spacing (e.g. 0.5mm/pixel for CT)
- Render all saved measurements as SVG overlay on top of the canvas (positioned absolutely), showing: line from P1→P2 + numeric label in mm at midpoint
- Measurements persist per series+slice, filtered on render

### 2. Hounsfield Unit (HU) Display
**Where**: `StudyViewerPage.tsx` — add HU calculation on canvas click/hover

**What changes**:
- Add a `huProbe` tool to the toolbar
- On canvas mousemove (when HU tool active), sample the pixel at cursor position from the canvas `ImageData` and derive a simulated HU value: `HU = (pixelGrayscale / 255) * (wl.window) + (wl.level - wl.window/2)`
- For ROI circle: compute min/max/mean HU inside the circle region
- Display a small HU readout badge near cursor (absolute positioned tooltip-style) showing current HU, and in a side panel for ROI
- Add persistent HU display in the bottom bar showing last sampled value

### 3. Enhanced Windowing Panel
**Where**: `StudyViewerPage.tsx` bottom bar + a dedicated collapsible WL panel

**What changes**:
- Already has basic W/L sliders in the bottom bar. Enhance:
  - Make sliders always visible (not just `xl:flex`)
  - Add current numeric inputs next to sliders so user can type exact values
  - Add a "Custom" preset entry that saves current WW/WC values with a user-supplied name to localStorage
  - Show W/L values in the canvas overlay (already exists as text overlay)
  - Add drag-to-adjust: when `wl` tool is active, mouse drag left/right adjusts WC (level), up/down adjusts WW (window) — this is the standard DICOM viewer interaction

### 4. MPR (Multi-Planar Reconstruction) Panel
**Where**: New dedicated panel/mode in `StudyViewerPage.tsx`

**What changes**:
- Add an `mpr` toggle button in the toolbar
- When MPR is enabled, the layout switches to a 3-panel view (Axial | Sagittal | Coronal) side by side regardless of layout setting
- Each panel renders the `SimulatedImage` with the matching series pattern (`axial`, `sagittal`, `coronal`) — if only one series is present, the pattern is synthetically adjusted
- A crosshair cursor line is shown in each plane (the intersection point of the other two planes)
- Slice navigation in one panel updates the crosshair position in the other two panels (synchronized crosshair)
- MPR panel header labels: "AX", "SAG", "COR" with current slice number

### 5. DICOM Connectivity Configuration Page
**Where**: New tab in `AdminPage.tsx` — "DICOM" tab added to the existing Tabs component

**What changes**:
- Add `DicomNode` type: `{ id, name, aeTitle, ip, port, modality, type: 'SCU'|'SCP'|'MWL', status: 'Connected'|'Disconnected'|'Error'|'Testing', lastPing?: string, errorMessage?: string }`
- Seed ~8 mock modality nodes (CT1, MR1, XR1, US1, NM1, Worklist, PACS Archive, etc.)
- Store in component state (simulated localStorage persistence)
- UI: a table of modality nodes, each row showing: Name, AE Title, IP, Port, Modality, Type, Status badge, Test button
- "Test Connection" button → sets status to `Testing` with a spinner for 1.5 seconds, then randomly resolves to `Connected` or `Error` with a simulated latency value and timestamp
- "Add Modality" button → opens a Dialog form: Name, AE Title, IP, Port, Modality (multi-select), Type (SCU/SCP/MWL/Store)
- Status badges: green=Connected, red=Error, gray=Disconnected, blue/pulsing=Testing
- Error detail expandable row showing last error message and timestamp
- A "Test All" button at top that queues all nodes
- Error log section below the table showing recent DICOM events with timestamps

---

## Files to change

| File | Change |
|---|---|
| `src/pages/radiology/StudyViewerPage.tsx` | Rewrite with: interactive canvas measurement (SVG overlay), HU probe tool, WL drag interaction, MPR mode |
| `src/pages/radiology/AdminPage.tsx` | Add DICOM tab with connectivity configuration |
| `src/types/radiology.ts` | Add `DicomNode`, `HUReading` types, extend `Measurement` |

---

## Technical approach for canvas interaction

The viewport `<div>` gets `onMouseDown`, `onMouseMove`, `onMouseUp` handlers. Over it sits an `<svg>` absolutely positioned overlay (full dimensions) that renders:
- In-progress measurement line (dashed, while dragging)
- Finalized measurement lines with endpoint dots and mm label
- HU probe cursor readout

Canvas coordinates are translated from DOM mouse events using `getBoundingClientRect()` + scale factor (DOM size vs canvas 512×512).

For HU: sample `ctx.getImageData(x, y, 1, 1)` from the canvas element directly (not the React component — accessed via `canvasRef` forwarded from `SimulatedImage`).

For MPR: `SimulatedImage` stays the same, MPR mode just forces 3 viewports always showing axial/sagittal/coronal patterns of the study's series.
