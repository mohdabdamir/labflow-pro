
## Full User Master Module + Permission-Gated Navigation

### What's broken
- `src/lib/permissions.ts` has fatal TS/JSX errors (uses Ant Design JSX, undefined hooks — the file is a stub). This must be fully rewritten.
- All files in `src/components/users/` are stubs that reference Ant Design (`Table`, `Form`, `Modal`, etc.) which is not installed. Every one must be replaced with real shadcn-based implementations.

---

### What gets built

#### 1. Fix `src/lib/permissions.ts`
Rewrite as a clean, working TypeScript-only file (no JSX). Exports:
- `Module` and `Action` enums (keep as-is)
- `usePermissions()` hook — reads `currentUser` from a new `useUserStore` context
- `RequirePermission` wrapper component — hides UI if user lacks permission
- `hasPageAccess(role, path)` helper for sidebar/route guarding

#### 2. User Store / Auth Context (`src/hooks/useUserStore.ts`)
A lightweight localStorage-based "session" store — no real auth, but simulates login state:
- Stores `currentUser` (the logged-in system user) in localStorage
- Exposes `setCurrentUser`, `logout`, `currentUser`
- Admin user pre-seeded from `mockUsers` (U001)

#### 3. Enhanced `src/types/lab.ts` — extend `User`
Add `permissions` field to the existing `User` type:
```
permissions: Partial<Record<Module, Action[]>>
```
This lets each user have granular per-module action grants.

#### 4. New `src/pages/UsersPage.tsx`
A full admin page at route `/users`, accessible only to admins. Contains two tabs:

**Tab 1 — User List**
- Searchable/filterable table (shadcn `Table`)
- Columns: Name, Username, Role, Department, Status, Last actions
- Row actions: Edit, Toggle Active/Inactive, Reset Password (clears stored password)
- "Add User" button → opens `UserFormDialog`

**Tab 2 — Roles & Permissions**
- Select a role from a list
- Permission matrix: rows = Modules, columns = Actions
- Toggle checkboxes update role-level defaults
- "Save Role Permissions" persists to localStorage

#### 5. `src/components/users/UserFormDialog.tsx` (new, replaces broken UserForm)
A shadcn Dialog with a tabbed form:
- **Basic Info**: First name, Last name, Username, Email, Phone, Job Title, Department
- **Account**: Role (dropdown), Status, Employment Type, Join Date
- **Permissions**: Per-module override grid (inherit from role or custom override)
Uses `react-hook-form` + `zod` for validation. On save → writes to `useLabData` users array.

#### 6. Route Permission Guard (`src/components/layout/RouteGuard.tsx`)
A wrapper that checks `hasPageAccess(currentUser.role, path)`:
- If denied → renders a "403 – Access Denied" card instead of the page
- Default access matrix:

| Route | Roles Allowed |
|---|---|
| `/` Dashboard | all |
| `/cases` | admin, receptionist, technician, pathologist, medical_director |
| `/billing` | admin, billing |
| `/users` | admin |
| `/services`, `/profiles`, `/packages` | admin, medical_director |
| `/clients`, `/pricelists`, `/normalranges` | admin, medical_director |
| `/settings` | admin |

#### 7. Sidebar updates (`src/components/layout/Sidebar.tsx`)
- Add "Users" nav item (icon: `UsersRound`) pointing to `/users`
- Filter `navItems` based on `currentUser.role` using `hasPageAccess`
- Show current user name + role badge at the bottom of sidebar (above Settings)

#### 8. Header updates (`src/components/layout/Header.tsx`)
- Show logged-in user name + role chip
- "Switch User" quick button (for demo purposes — opens a popover to pick from mockUsers)

---

### File change summary

| File | Action |
|---|---|
| `src/lib/permissions.ts` | **Rewrite** — fix all TS errors, pure TS module |
| `src/hooks/useUserStore.ts` | **Create** — localStorage session context |
| `src/pages/UsersPage.tsx` | **Create** — full user management page |
| `src/components/users/UserFormDialog.tsx` | **Create** — shadcn form replacing broken stub |
| `src/components/users/UserPermissionsMatrix.tsx` | **Create** — role permission matrix |
| `src/components/layout/RouteGuard.tsx` | **Create** — access control wrapper |
| `src/components/layout/Sidebar.tsx` | **Edit** — add Users nav, filter by role |
| `src/components/layout/Header.tsx` | **Edit** — show current user, switch user |
| `src/App.tsx` | **Edit** — wrap pages with RouteGuard, add `/users` route |
| `src/types/lab.ts` | **Edit** — extend User type with permissions |
| `src/data/mockData.ts` | **Edit** — add permissions to mockUsers |
| `src/components/users/UserMaster.tsx` etc. | **Delete/Replace** — stubs replaced by real components |

---

### Technical approach for permission checks

All sidebar items and page routes will check:

```
hasPageAccess(role: UserRole, path: string): boolean
```

Pages additionally wrapped in `<RouteGuard path="/users">` which renders 403 if no access. `RequirePermission` used for fine-grained button-level hiding (e.g., hide "Delete" button for non-admins).
