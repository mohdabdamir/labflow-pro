// AP configuration store: templates, masters, clients+physicians, physician requests, AP permissions
import { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '@/hooks/useUserStore';

export type APTemplateField =
  | 'clinicalHistory' | 'clinicalIndication' | 'notes' | 'specimenName' | 'deficiencies'
  | 'grossDescription' | 'microscopicFindings' | 'diagnosis' | 'frozenDiagnosis' | 'comment';

export const TEMPLATE_FIELDS: { key: APTemplateField; label: string }[] = [
  { key: 'clinicalHistory', label: 'Clinical History' },
  { key: 'clinicalIndication', label: 'Clinical Indication' },
  { key: 'notes', label: 'Additional Notes' },
  { key: 'specimenName', label: 'Specimen Name' },
  { key: 'deficiencies', label: 'Specimen Deficiencies' },
  { key: 'grossDescription', label: 'Gross Description' },
  { key: 'microscopicFindings', label: 'Microscopic Findings' },
  { key: 'diagnosis', label: 'Diagnosis' },
  { key: 'frozenDiagnosis', label: 'Frozen Section Diagnosis' },
  { key: 'comment', label: 'Pathologist Comment' },
];

export interface APTemplate { id: string; field: APTemplateField; name: string; body: string; active: boolean }
export interface APPhysician { id: string; name: string; mobile: string; email: string; pending?: boolean }
export interface APClient { id: string; name: string; type: 'B2B' | 'B2C'; active: boolean; physicians: APPhysician[] }
export interface APMasterItem { id: string; value: string; active: boolean }
export type APMasterKey = 'caseTypes' | 'priorities' | 'stains' | 'fixatives' | 'specimenTypes';
export const MASTER_LABELS: Record<APMasterKey, string> = {
  caseTypes: 'Case Types', priorities: 'Priorities', stains: 'Stains', fixatives: 'Fixatives', specimenTypes: 'Specimen Types',
};
export interface APPhysicianRequest {
  id: string; clientId: string; clientName: string; name: string; mobile: string; email: string;
  requestedBy: string; requestedAt: string; status: 'pending' | 'approved' | 'rejected';
  decidedBy?: string; decidedAt?: string; reason?: string;
}
export type APAction = 'useTemplates' | 'manageTemplates' | 'manageMasters' | 'requestPhysician' | 'approvePhysician' | 'finalizeReport';
export const AP_ACTIONS: { key: APAction; label: string }[] = [
  { key: 'useTemplates', label: 'Use templates' },
  { key: 'manageTemplates', label: 'Manage templates' },
  { key: 'manageMasters', label: 'Manage masters' },
  { key: 'requestPhysician', label: 'Request new physician' },
  { key: 'approvePhysician', label: 'Approve physicians' },
  { key: 'finalizeReport', label: 'Finalize report' },
];
export const AP_ROLES = ['admin', 'technician', 'pathologist', 'medical_director', 'receptionist', 'billing'] as const;

export interface APConfig {
  templates: APTemplate[];
  masters: Record<APMasterKey, APMasterItem[]>;
  clients: APClient[];
  requests: APPhysicianRequest[];
  rolePerms: Record<string, APAction[]>;
  userPerms: Record<string, APAction[]>; // per-user override (userId)
}

const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const m = (vals: string[]) => vals.map((v, i) => ({ id: `M${i}${v}`, value: v, active: true }));
const ph = (n: string, i: number): APPhysician => ({ id: `PH${i}`, name: n, mobile: `+973 3${i}00 ${1000 + i}`, email: n.toLowerCase().replace(/dr\.\s*/, '').replace(/[^a-z]+/g, '.') + '@clinic.bh' });
const T = (field: APTemplateField, name: string, body: string): APTemplate => ({ id: id() + name.length, field, name, body, active: true });

const DEFAULT: APConfig = {
  templates: [
    T('clinicalHistory', 'Breast lump', 'Patient presents with a palpable breast lump noted for 3 months. No family history of breast cancer. Mammography BI-RADS 4.'),
    T('clinicalHistory', 'Post-menopausal bleeding', 'Post-menopausal woman with vaginal bleeding for 2 months. Endometrial thickness 8 mm on ultrasound.'),
    T('clinicalIndication', 'Rule out malignancy', 'To rule out malignancy.'),
    T('clinicalIndication', 'Margin assessment', 'Assessment of surgical margins and tumor staging.'),
    T('notes', 'Urgent call', 'Please call the treating physician with the result as soon as available.'),
    T('specimenName', 'Breast core biopsy', 'Right breast core biopsy'),
    T('specimenName', 'Endometrial curettings', 'Endometrial curettings'),
    T('deficiencies', 'Unlabeled container', 'Container not labeled with patient identifiers.'),
    T('deficiencies', 'Inadequate fixation', 'Specimen received with inadequate formalin volume.'),
    T('grossDescription', 'Core biopsy', 'Received in formalin labeled with patient name are multiple cores of tan-white tissue measuring __ to __ cm in length and 0.1 cm in diameter. Entirely submitted in cassette A1.'),
    T('grossDescription', 'Skin ellipse', 'Received in formalin is an ellipse of skin measuring __ x __ x __ cm. The epidermis shows a __ lesion measuring __ cm. Margins inked. Serially sectioned and entirely submitted.'),
    T('microscopicFindings', 'Benign breast', 'Sections show breast parenchyma with fibrocystic changes. No atypia or malignancy is identified.'),
    T('microscopicFindings', 'Invasive ductal carcinoma', 'Sections show infiltrating nests and cords of malignant epithelial cells with pleomorphic nuclei and frequent mitoses, invading desmoplastic stroma.'),
    T('diagnosis', 'Negative for malignancy', 'Negative for malignancy.'),
    T('diagnosis', 'IDC NST', 'Invasive ductal carcinoma, no special type (NST), Nottingham grade __.'),
    T('frozenDiagnosis', 'Benign - defer', 'Benign. Defer to permanent sections.'),
    T('frozenDiagnosis', 'Margin free', 'Margins free of tumor.'),
    T('comment', 'IHC recommended', 'Immunohistochemistry for ER, PR, HER2 and Ki-67 is recommended and will be reported in an addendum.'),
    T('comment', 'MDT referral', 'Recommend discussion at multidisciplinary tumor board.'),
  ],
  masters: {
    caseTypes: m(['Biopsy', 'Resection', 'Cytology', 'Autopsy', 'Frozen Section', 'Bone Marrow', 'Fine Needle Aspiration', 'Excision', 'Curettage']),
    priorities: m(['Routine', 'Urgent', 'STAT']),
    stains: m(['H&E', 'PAS', 'Masson Trichrome', 'Reticulin', 'ER', 'PR', 'HER2', 'Ki-67']),
    fixatives: m(['10% Neutral Buffered Formalin', 'Alcohol', 'Fresh', 'Bouin']),
    specimenTypes: m(['Tissue', 'Fluid', 'Smear', 'Bone', 'Bone Marrow Aspirate']),
  },
  clients: [
    { id: 'CLT001', name: 'Gulf Medical Hospital', type: 'B2B', active: true, physicians: ['Dr. Sarah Al-Rashidi', 'Dr. Khalid Al-Dosari', 'Dr. Hana Al-Zayani'].map(ph) },
    { id: 'CLT002', name: 'National Health Clinic', type: 'B2B', active: true, physicians: ['Dr. Ali Al-Saeedi', 'Dr. Fawzi Al-Qasim'].map((n, i) => ph(n, i + 3)) },
    { id: 'CLT003', name: 'Al-Hilal Medical Centre', type: 'B2B', active: true, physicians: ['Dr. Mariam Al-Nasser', 'Dr. Yousif Al-Mannai'].map((n, i) => ph(n, i + 5)) },
    { id: 'CLT004', name: 'Bahrain Specialist Hospital', type: 'B2B', active: true, physicians: ['Dr. Noor Al-Khalifa', 'Dr. Omar Haddad'].map((n, i) => ph(n, i + 7)) },
    { id: 'SELF', name: 'Walk-In / Self-Pay', type: 'B2C', active: true, physicians: ['Dr. Sarah Al-Rashidi', 'Dr. Ali Al-Saeedi'].map((n, i) => ph(n, i + 9)) },
  ],
  requests: [],
  rolePerms: {
    admin: AP_ACTIONS.map(a => a.key),
    medical_director: ['useTemplates', 'manageTemplates', 'manageMasters', 'requestPhysician', 'approvePhysician', 'finalizeReport'],
    pathologist: ['useTemplates', 'requestPhysician', 'finalizeReport'],
    technician: ['useTemplates', 'requestPhysician'],
    receptionist: ['useTemplates', 'requestPhysician'],
    billing: [],
  },
  userPerms: {},
};

const KEY = 'ap_config_v1';
function load(): APConfig {
  try { const r = localStorage.getItem(KEY); if (r) return { ...DEFAULT, ...JSON.parse(r) }; } catch { /* */ }
  return DEFAULT;
}
let state = load();
const listeners = new Set<() => void>();
function setState(fn: (s: APConfig) => APConfig) {
  state = fn(state);
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* */ }
  listeners.forEach(l => l());
}

export function useAPConfig() {
  const [, r] = useState(0);
  useEffect(() => { const f = () => r(n => n + 1); listeners.add(f); return () => { listeners.delete(f); }; }, []);
  const { currentUser } = useUserStore();

  const can = useCallback((a: APAction) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const o = state.userPerms[currentUser.id];
    return (o ?? state.rolePerms[currentUser.role] ?? []).includes(a);
  }, [currentUser]);

  return {
    config: state,
    currentUser,
    can,
    update: setState,
    newId: id,
    templatesFor: (f: APTemplateField) => state.templates.filter(t => t.field === f && t.active),
    masterValues: (k: APMasterKey) => state.masters[k].filter(x => x.active).map(x => x.value),
    addPhysicianToClient: (clientId: string, p: APPhysician) =>
      setState(s => ({ ...s, clients: s.clients.map(c => c.id === clientId ? { ...c, physicians: [...c.physicians.filter(x => x.id !== p.id), p] } : c) })),
  };
}
