

# Emergency Department Module — Implementation Plan

## Architecture Summary

This is a client-side, event-driven Emergency Department module under `/emergency/*` with simulated real-time events using `setInterval` + reactive state. Since the project is localStorage-based with no backend, all "event streams," "WebSocket connections," and "Kafka" references are simulated with in-memory event emitters and interval-based state mutations. The module will feel real-time while being fully frontend.

## Files to Create

| File | Purpose |
|---|---|
| `src/types/emergency.ts` | All ED types: EDPatient, TriageRecord, Vitals, SepsisSIRS, HandoverTask, MCIPatient, BPAAlert, DischargeWorkflow, AcuityLevel (1-5 ESI) |
| `src/data/emergencyMockData.ts` | Seed ~12 ED patients at various acuity/stages, vitals streams, lab results, pending orders |
| `src/hooks/useEmergencyData.ts` | Central state hook: patient registry, event bus (pub/sub pattern), SIRS background listener, auto-escalation timers, discharge orchestrator, MCI mode toggle, offline queue |
| `src/pages/emergency/EmergencyLayout.tsx` | Sidebar layout (matches Pharmacy/Appointments pattern) with nav: Tracking Board, Triage, Handover, Discharge, MCI, Settings. Live alert badges. |
| `src/pages/emergency/TrackingBoard.tsx` | **Part 1** — The visual command center. Dynamic patient tiles with acuity color bands, real-time timers (time-since-triage, time-since-last-lab), yellow/red escalation highlights, zone grouping (Resus/Acute/Minor/Fast Track). Surge View toggle re-sorts by predicted discharge likelihood. |
| `src/pages/emergency/TriagePage.tsx` | **Part 2** — Triage intake form. Chief complaint with NLP-style auto-suggestion (simulated FHIR history pull showing collapsed cardiology timeline for "chest pain"). Vitals entry. ESI/CTAS acuity suggestion algorithm based on vitals+age+complaint. Variance Override logging when nurse downgrades. |
| `src/pages/emergency/SepsisMonitor.tsx` | **Part 3** — Background SIRS sentinel dashboard. Shows all active BPA alerts. Continuous listener checks vitals+labs against SIRS criteria (HR>90, RR>20, Temp>38, WBC>12/<4, Lactate>2). One-click "Order Sepsis Bundle" button. Alert feed with timestamps. |
| `src/pages/emergency/HandoverPage.tsx` | **Part 4** — Shift handover wizard. Structured pending-actions per patient (not free text). Stale Result Escrow: detects orders placed near shift-end without results acknowledged. Mandatory Acknowledgement Tasks for incoming shift. Sign-off workflow. |
| `src/pages/emergency/DischargePage.tsx` | **Part 5** — Discharge orchestration engine. Triggered on discharge order. Auto-generates: e-prescription push, follow-up slot query, PCP gap alert. Pediatric Guardian Mode: floating weight-based dosing calculator with stale-weight warning. |
| `src/pages/emergency/MCIPage.tsx` | **Part 6** — Mass Casualty Incident mode. Activated via button or Ctrl+Alt+M. Triage-only UI: registers as MCI-GREEN-001, MCI-YELLOW-002, etc. No insurance checks. Standing trauma panel orders. Offline event queue with retry indicator. |
| `src/pages/emergency/EDSettingsPage.tsx` | Configuration: CTAS wait-time targets, zone definitions, sepsis rule thresholds, MCI protocol presets, FHIR/HL7 endpoint config (simulated). |

## Key Technical Decisions

**Event-Driven Simulation**: `useEmergencyData` maintains an internal event bus. Every 3-5 seconds, it fires simulated events (new vital, lab result, status change). Subscribers (tracking board tiles, sepsis listener) react immediately. This gives sub-second perceived latency.

**SIRS Background Listener**: Runs as a `useEffect` interval inside the hook. On each tick, it scans all active patients' latest vitals + labs against SIRS criteria. When triggered, it pushes a BPA to an alerts array with a `NEW_CRITICAL_RESULT` flag, which the tracking board reads to apply the red-pulse CSS animation.

**Tracking Board Tiles**: Each tile renders: patient name, MRN, acuity badge (1-5 with ESI colors), assigned zone, time-since-triage counter (live `setInterval`), assigned MD/RN, current status, and a predicted disposition score (simulated 0-100). Yellow highlight = CSS class toggled when `timeSinceLastLab > 30min` or triage wait exceeds CTAS target. Red pulse = `animate-pulse` with red border when critical flag is set.

**Surge View**: A toggle that re-sorts tiles by `predictedDischargeScore` descending, showing which beds will free up soonest.

**Acuity Suggestion**: Simple rule engine — e.g., chest pain + age>50 + abnormal vitals → ESI 2 suggestion. If nurse picks ESI 3, log a variance override event.

**MCI Mode**: Sets a global `mciActive` flag. Tracking board switches to simplified triage-only view. Patient registration uses sequential MCI IDs. All events queue locally and show a sync status indicator.

**Offline Queue**: Uses an in-memory array (simulating IndexedDB). When "offline mode" is toggled, events accumulate with a retry counter. A status bar shows "X events pending sync."

## Routing Changes (App.tsx)

Replace `<Route path="/emergency" element={<UnderConstruction />} />` with nested routes under `<EmergencyLayout />`:
- `/emergency` → TrackingBoard (index)
- `/emergency/triage` → TriagePage
- `/emergency/triage/:patientId` → TriagePage (edit)
- `/emergency/sepsis` → SepsisMonitor
- `/emergency/handover` → HandoverPage
- `/emergency/discharge` → DischargePage
- `/emergency/mci` → MCIPage
- `/emergency/settings` → EDSettingsPage

## HomePage Changes

Set `ready: true` for the Emergency module card. Add stats: `{ label: 'Active Patients', value: '8' }, { label: 'STAT Alerts', value: '2' }`.

## Estimated Scope

~10 new files, ~2 edited files (App.tsx, HomePage.tsx). Largest files will be TrackingBoard (~400 lines) and useEmergencyData (~500 lines).

