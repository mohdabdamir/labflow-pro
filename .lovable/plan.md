## Anatomic Pathology: Templates, Searchable Dropdowns, Physician Requests, AP Settings

### 1. Searchable dropdowns everywhere in AP
Every dropdown in the AP screens (New Case, Grossing, Transcription, Case Detail, Billing Codes) becomes a type-to-filter picker. Example: on New Case, typing "gulf" in Client instantly narrows the list. Search ignores letter case and matches any part of the name or code.

### 2. Text templates for free-text fields
Next to each AP text box (clinical history, clinical indication, notes, gross description, microscopic description, diagnosis, comment, frozen section, ancillary result, etc.) a small "Template" picker appears:
- Searchable by template name
- Picking a template loads its text into the box (option to replace or add to existing text)
- Only templates meant for that field are shown (e.g. "Gross Description" templates only appear in the gross box)
- Sample templates are included for each field so it can be tried right away

### 3. One shared physician list on New Case
Treating, Referring and CC Physicians all pick from the same list: physicians registered under the selected client.
- Treating and Referring: single searchable pick
- CC Physicians: multi-pick with removable chips (replaces the comma-typed box)
- Changing the client clears the physician choices

### 4. "Request New Physician" for non-admins
A "+ New physician" button next to the physician pickers opens a popup: Name, Mobile, Email (all required, email/mobile checked for format).
- Admins / users with approve rights: physician is added to the client right away
- Everyone else: a pending request is created and the user sees "Sent for approval"; the pending name can be used on the current case marked "Pending approval"
- Approvers see a badge count and an approval queue (Approve / Reject with reason). Approved physicians join the client's list.

### 5. AP Settings page (admin)
New "Settings" item in the AP sidebar with tabs:
- **Templates** — add / edit / delete / search templates; choose which field each belongs to; turn on/off
- **Masters** — manage the dropdown values: Case Types, Specimen Types, Fixatives, Stains, Priorities, Report Statuses, etc. (add / edit / disable / reorder)
- **Physician Approvals** — the pending request queue and history
- **Permissions** — per-role tick grid for AP actions: use templates, manage templates, manage masters, request physician, approve physician, finalize report; plus per-user overrides. Linked to the existing User Master roles.

Non-admins without rights don't see the Settings item or the restricted buttons.

### Technical details
- New `SearchableSelect` and `SearchableMultiSelect` components built on shadcn `Command` + `Popover`; replace `Select` usages across `src/pages/ap/*` and `src/components/ap/*`.
- New `TemplatePicker` component taking a `fieldKey`; wrap AP `Textarea`s.
- New hook `useAPConfig` (localStorage, same pattern as `useAPData`): `ap_templates`, `ap_masters`, `ap_physician_requests`, `ap_permissions`. Hardcoded arrays (`CASE_TYPES`, specimen lists, `PHYSICIANS`) are replaced by master lookups seeded with current values.
- Physicians read from client records (`Physician` type in `types/lab.ts`, `lis_clients` store); approval appends to the client's `physicians`. Requests store requester, client, status, timestamps.
- Add `Module.AP_SETTINGS` and AP actions to `lib/permissions.ts`; gate via `usePermissions` / `RequirePermission`; add `/ap/settings` route + `RouteGuard`.
- `ccPhysicians` stored as string array (already the case type), form state changes from string to array.
