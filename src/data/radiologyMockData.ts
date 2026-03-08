import type {
  RadiologyPatient, Study, ImageSeries, RadiologyReport,
  AIFinding, ReportTemplate, WindowLevel
} from '@/types/radiology';

// ─── Patients ────────────────────────────────────────────────────────────────
export const RADIOLOGY_PATIENTS: RadiologyPatient[] = [
  { id: 'RP001', mrn: 'MRN-10045', firstName: 'James', lastName: 'Harrington', fullName: 'James Harrington', dob: '1968-03-14', age: 56, gender: 'M', phone: '555-0101', address: '12 Oak Street, City', allergies: ['Iodinated Contrast (Mild)'], bloodType: 'A+' },
  { id: 'RP002', mrn: 'MRN-10046', firstName: 'Sarah', lastName: 'Mitchell', fullName: 'Sarah Mitchell', dob: '1975-07-22', age: 49, gender: 'F', phone: '555-0102', address: '88 Maple Ave, City', allergies: [], bloodType: 'O-' },
  { id: 'RP003', mrn: 'MRN-10047', firstName: 'Robert', lastName: 'Chen', fullName: 'Robert Chen', dob: '1952-11-08', age: 72, gender: 'M', phone: '555-0103', address: '34 Pine Lane, City', allergies: ['Penicillin', 'Sulfa'], bloodType: 'B+' },
  { id: 'RP004', mrn: 'MRN-10048', firstName: 'Maria', lastName: 'Gonzalez', fullName: 'Maria Gonzalez', dob: '1990-05-30', age: 34, gender: 'F', phone: '555-0104', address: '56 Elm Court, City', allergies: ['Gadolinium'], bloodType: 'AB+' },
  { id: 'RP005', mrn: 'MRN-10049', firstName: 'Thomas', lastName: 'Williams', fullName: 'Thomas Williams', dob: '1943-09-17', age: 81, gender: 'M', phone: '555-0105', address: '7 Cedar Blvd, City', allergies: ['Aspirin'], bloodType: 'O+' },
  { id: 'RP006', mrn: 'MRN-10050', firstName: 'Jennifer', lastName: 'Park', fullName: 'Jennifer Park', dob: '1982-12-03', age: 42, gender: 'F', phone: '555-0106', address: '23 Birch Road, City', allergies: [], bloodType: 'A-' },
  { id: 'RP007', mrn: 'MRN-10051', firstName: 'Michael', lastName: 'Thompson', fullName: 'Michael Thompson', dob: '1959-06-28', age: 65, gender: 'M', phone: '555-0107', address: '91 Walnut Way, City', allergies: ['NSAIDs'], bloodType: 'B-' },
  { id: 'RP008', mrn: 'MRN-10052', firstName: 'Linda', lastName: 'Anderson', fullName: 'Linda Anderson', dob: '1970-02-14', age: 54, gender: 'F', phone: '555-0108', address: '45 Spruce Ave, City', allergies: [], bloodType: 'O+' },
  { id: 'RP009', mrn: 'MRN-10053', firstName: 'David', lastName: 'Martinez', fullName: 'David Martinez', dob: '1988-08-19', age: 36, gender: 'M', phone: '555-0109', address: '67 Ash Street, City', allergies: ['Latex'], bloodType: 'A+' },
  { id: 'RP010', mrn: 'MRN-10054', firstName: 'Patricia', lastName: 'Johnson', fullName: 'Patricia Johnson', dob: '1965-04-05', age: 59, gender: 'F', phone: '555-0110', address: '13 Poplar Drive, City', allergies: [], bloodType: 'AB-' },
  { id: 'RP011', mrn: 'MRN-10055', firstName: 'Richard', lastName: 'Davis', fullName: 'Richard Davis', dob: '1948-10-22', age: 76, gender: 'M', phone: '555-0111', address: '89 Chestnut Way, City', allergies: ['Iodinated Contrast (Severe)'], bloodType: 'O+' },
  { id: 'RP012', mrn: 'MRN-10056', firstName: 'Barbara', lastName: 'Wilson', fullName: 'Barbara Wilson', dob: '1977-01-16', age: 47, gender: 'F', phone: '555-0112', address: '22 Magnolia Ct, City', allergies: [], bloodType: 'B+' },
  { id: 'RP013', mrn: 'MRN-10057', firstName: 'Charles', lastName: 'Moore', fullName: 'Charles Moore', dob: '1993-07-07', age: 31, gender: 'M', phone: '555-0113', address: '55 Hickory Lane, City', allergies: ['Gadolinium'], bloodType: 'A+' },
  { id: 'RP014', mrn: 'MRN-10058', firstName: 'Elizabeth', lastName: 'Taylor', fullName: 'Elizabeth Taylor', dob: '1961-03-25', age: 63, gender: 'F', phone: '555-0114', address: '11 Sycamore St, City', allergies: [], bloodType: 'O-' },
  { id: 'RP015', mrn: 'MRN-10059', firstName: 'Joseph', lastName: 'Jackson', fullName: 'Joseph Jackson', dob: '1985-11-11', age: 39, gender: 'M', phone: '555-0115', address: '78 Linden Blvd, City', allergies: ['Barium'], bloodType: 'A-' },
  { id: 'RP016', mrn: 'MRN-10060', firstName: 'Susan', lastName: 'White', fullName: 'Susan White', dob: '1971-09-04', age: 53, gender: 'F', phone: '555-0116', address: '31 Hawthorn Rd, City', allergies: [], bloodType: 'B+' },
  { id: 'RP017', mrn: 'MRN-10061', firstName: 'Daniel', lastName: 'Harris', fullName: 'Daniel Harris', dob: '1956-04-18', age: 68, gender: 'M', phone: '555-0117', address: '64 Willow Way, City', allergies: ['Iodinated Contrast (Mild)'], bloodType: 'O+' },
  { id: 'RP018', mrn: 'MRN-10062', firstName: 'Karen', lastName: 'Lewis', fullName: 'Karen Lewis', dob: '1994-02-27', age: 30, gender: 'F', phone: '555-0118', address: '18 Dogwood Dr, City', allergies: [], bloodType: 'AB+' },
  { id: 'RP019', mrn: 'MRN-10063', firstName: 'Paul', lastName: 'Clark', fullName: 'Paul Clark', dob: '1939-12-30', age: 86, gender: 'M', phone: '555-0119', address: '42 Mulberry St, City', allergies: ['Penicillin'], bloodType: 'O+' },
  { id: 'RP020', mrn: 'MRN-10064', firstName: 'Nancy', lastName: 'Robinson', fullName: 'Nancy Robinson', dob: '1979-06-09', age: 45, gender: 'F', phone: '555-0120', address: '95 Cypress Ave, City', allergies: [], bloodType: 'A+' },
];

// ─── Series Generator ─────────────────────────────────────────────────────────
function mkSeries(id: string, num: number, desc: string, modality: any, count: number, body: string, color: string, pattern: any): ImageSeries {
  return { id, seriesNumber: num, description: desc, modality, imageCount: count, bodyPart: body, color, pattern, sliceThickness: count > 20 ? '3mm' : undefined };
}

// ─── AI Findings ─────────────────────────────────────────────────────────────
function mkAI(id: string, type: any, desc: string, conf: number, seriesId: string, slice: number, loc: string, sev: any): AIFinding {
  return { id, type, description: desc, confidence: conf, seriesId, sliceIndex: slice, location: loc, severity: sev };
}

// ─── Reports ─────────────────────────────────────────────────────────────────
function mkReport(studyId: string, status: any, findings: string, impression: string, signed?: boolean, critical?: boolean): RadiologyReport {
  const now = new Date().toISOString();
  return {
    id: `RPT-${studyId}`,
    studyId,
    status,
    findings,
    impression,
    criticalFindings: critical ?? false,
    signedBy: signed ? 'Dr. Alexandra Reeves' : undefined,
    signedAt: signed ? now : undefined,
    draftedAt: now,
    versions: [],
  };
}

// ─── Studies ──────────────────────────────────────────────────────────────────
export const RADIOLOGY_STUDIES: Study[] = [
  // ── CT Head ──
  {
    id: 'ST001', accessionNumber: 'ACC-2024-0001', patientId: 'RP001',
    patient: RADIOLOGY_PATIENTS[0], studyDate: '2024-12-15', studyTime: '08:30',
    modality: 'CT', description: 'CT Head Without Contrast', bodyPart: 'Brain', status: 'Read',
    priority: 'STAT', orderingPhysician: 'Dr. Robert Kim', referringDepartment: 'Emergency',
    clinicalHistory: 'Acute onset severe headache, worst of life. R/O subarachnoid hemorrhage.',
    patientLocation: 'Emergency Department', readingRadiologist: 'Dr. Alexandra Reeves',
    hasPriors: true, priorStudyIds: ['ST020'],
    series: [
      mkSeries('SR001a', 1, 'Axial Brain Windows', 'CT', 36, 'Brain', '#1a2332', 'axial'),
      mkSeries('SR001b', 2, 'Bone Windows', 'CT', 36, 'Brain', '#2a3345', 'axial'),
      mkSeries('SR001c', 3, 'Scout', 'CT', 1, 'Brain', '#0d1520', 'scout'),
    ],
    report: mkReport('ST001', 'Final', 
      'The brain parenchyma demonstrates no acute infarct. There is a hyperdense focus in the basal cisterns consistent with subarachnoid blood. No hydrocephalus. Ventricles are normal in size. No mass effect or midline shift.',
      'SUBARACHNOID HEMORRHAGE involving the basal cisterns. Clinical correlation and neurosurgical consultation recommended urgently.',
      true, true),
    aiFindings: [mkAI('AI001a', 'bleed', 'Hyperdense focus in basal cisterns', 0.94, 'SR001a', 18, 'Basal cisterns', 'high')],
    createdAt: '2024-12-15T08:00:00Z', updatedAt: '2024-12-15T09:15:00Z',
  },
  // ── Chest XR ──
  {
    id: 'ST002', accessionNumber: 'ACC-2024-0002', patientId: 'RP002',
    patient: RADIOLOGY_PATIENTS[1], studyDate: '2024-12-15', studyTime: '09:15',
    modality: 'XR', description: 'Chest X-Ray PA & Lateral', bodyPart: 'Chest', status: 'Verified',
    priority: 'Routine', orderingPhysician: 'Dr. Sarah Patel', referringDepartment: 'Outpatient',
    clinicalHistory: 'Annual screening. Mild cough for 2 weeks.',
    patientLocation: 'Outpatient Clinic', readingRadiologist: 'Dr. Marcus Webb',
    hasPriors: true, priorStudyIds: ['ST021'],
    series: [
      mkSeries('SR002a', 1, 'PA View', 'XR', 1, 'Chest', '#1e2f1e', 'axial'),
      mkSeries('SR002b', 2, 'Lateral View', 'XR', 1, 'Chest', '#1a2b1a', 'sagittal'),
    ],
    report: mkReport('ST002', 'Final',
      'Cardiac silhouette is normal in size. Lungs are clear bilaterally with no focal consolidation, effusion, or pneumothorax. No hilar adenopathy. Mediastinum is unremarkable. Osseous structures are intact.',
      'No acute cardiopulmonary process.',
      true),
    aiFindings: [],
    createdAt: '2024-12-15T09:00:00Z', updatedAt: '2024-12-15T10:00:00Z',
  },
  // ── MRI Brain ──
  {
    id: 'ST003', accessionNumber: 'ACC-2024-0003', patientId: 'RP003',
    patient: RADIOLOGY_PATIENTS[2], studyDate: '2024-12-15', studyTime: '10:00',
    modality: 'MR', description: 'MRI Brain With & Without Contrast', bodyPart: 'Brain', status: 'In Progress',
    priority: 'Urgent', orderingPhysician: 'Dr. James Liu', referringDepartment: 'Neurology',
    clinicalHistory: 'Known glioblastoma. Follow-up post-chemoradiation. Assess treatment response.',
    patientLocation: 'Inpatient Ward B', readingRadiologist: 'Dr. Alexandra Reeves',
    hasPriors: true, priorStudyIds: ['ST022', 'ST023'],
    series: [
      mkSeries('SR003a', 1, 'T1 Axial Pre-contrast', 'MR', 24, 'Brain', '#2d1a1a', 'axial'),
      mkSeries('SR003b', 2, 'T2 FLAIR', 'MR', 24, 'Brain', '#1a1a2d', 'axial'),
      mkSeries('SR003c', 3, 'DWI', 'MR', 24, 'Brain', '#1a2d1a', 'axial'),
      mkSeries('SR003d', 4, 'T1 Axial Post-contrast', 'MR', 24, 'Brain', '#2d1a2d', 'axial'),
      mkSeries('SR003e', 5, 'T1 Sagittal Post-contrast', 'MR', 18, 'Brain', '#2d2d1a', 'sagittal'),
    ],
    aiFindings: [
      mkAI('AI003a', 'mass', 'Ring-enhancing lesion right temporal lobe', 0.91, 'SR003d', 14, 'Right temporal lobe', 'high'),
      mkAI('AI003b', 'bleed', 'Perilesional edema FLAIR signal', 0.85, 'SR003b', 14, 'Right temporal/parietal', 'medium'),
    ],
    createdAt: '2024-12-15T09:45:00Z', updatedAt: '2024-12-15T10:30:00Z',
  },
  // ── CT Abdomen ──
  {
    id: 'ST004', accessionNumber: 'ACC-2024-0004', patientId: 'RP004',
    patient: RADIOLOGY_PATIENTS[3], studyDate: '2024-12-15', studyTime: '11:30',
    modality: 'CT', description: 'CT Abdomen & Pelvis With Contrast', bodyPart: 'Abdomen/Pelvis', status: 'Completed',
    priority: 'Urgent', orderingPhysician: 'Dr. Lisa Chen', referringDepartment: 'Surgery',
    clinicalHistory: 'RLQ pain, elevated WBC. R/O appendicitis.',
    patientLocation: 'Emergency Department', readingRadiologist: 'Dr. Marcus Webb',
    hasPriors: false,
    series: [
      mkSeries('SR004a', 1, 'Portal Venous Phase', 'CT', 60, 'Abdomen', '#1e1e0a', 'axial'),
      mkSeries('SR004b', 2, 'Coronal Reformats', 'CT', 40, 'Abdomen', '#1a1e0a', 'coronal'),
      mkSeries('SR004c', 3, 'Sagittal Reformats', 'CT', 40, 'Abdomen', '#1e1a0a', 'sagittal'),
    ],
    aiFindings: [mkAI('AI004a', 'mass', 'Distended appendix with periappendiceal fat stranding', 0.96, 'SR004a', 32, 'RLQ, appendix', 'high')],
    createdAt: '2024-12-15T11:00:00Z', updatedAt: '2024-12-15T11:45:00Z',
  },
  // ── MRI Knee ──
  {
    id: 'ST005', accessionNumber: 'ACC-2024-0005', patientId: 'RP005',
    patient: RADIOLOGY_PATIENTS[4], studyDate: '2024-12-14', studyTime: '14:00',
    modality: 'MR', description: 'MRI Right Knee Without Contrast', bodyPart: 'Right Knee', status: 'Dictated',
    priority: 'Routine', orderingPhysician: 'Dr. Kevin Brown', referringDepartment: 'Orthopedics',
    clinicalHistory: 'Knee pain after sporting injury. R/O meniscal tear.',
    patientLocation: 'Outpatient Clinic',
    hasPriors: false,
    series: [
      mkSeries('SR005a', 1, 'Sagittal PD Fat Sat', 'MR', 30, 'Right Knee', '#0d1a2d', 'sagittal'),
      mkSeries('SR005b', 2, 'Coronal PD Fat Sat', 'MR', 22, 'Right Knee', '#0a1a2d', 'coronal'),
      mkSeries('SR005c', 3, 'Axial PD Fat Sat', 'MR', 20, 'Right Knee', '#0d1520', 'axial'),
    ],
    report: mkReport('ST005', 'Preliminary',
      'There is a horizontal tear involving the posterior horn of the medial meniscus extending to the inferior articular surface. The ACL, PCL, MCL, and LCL are intact. Mild joint effusion. No chondral defect.',
      'Medial meniscal posterior horn tear. Orthopedic consultation recommended.',
      false),
    aiFindings: [mkAI('AI005a', 'fracture', 'Medial meniscus posterior horn signal abnormality', 0.88, 'SR005a', 16, 'Medial meniscus posterior horn', 'medium')],
    createdAt: '2024-12-14T13:45:00Z', updatedAt: '2024-12-14T15:20:00Z',
  },
  // ── Mammography ──
  {
    id: 'ST006', accessionNumber: 'ACC-2024-0006', patientId: 'RP006',
    patient: RADIOLOGY_PATIENTS[5], studyDate: '2024-12-14', studyTime: '09:00',
    modality: 'MG', description: 'Bilateral Mammography Screening', bodyPart: 'Bilateral Breasts', status: 'Read',
    priority: 'Routine', orderingPhysician: 'Dr. Sarah Patel', referringDepartment: 'Outpatient',
    clinicalHistory: 'Annual screening mammogram. No symptoms. Family history of breast cancer (maternal aunt).',
    patientLocation: 'Outpatient Clinic', readingRadiologist: 'Dr. Alexandra Reeves',
    hasPriors: true, priorStudyIds: ['ST024'],
    series: [
      mkSeries('SR006a', 1, 'Right CC', 'MG', 1, 'Right Breast', '#2d1a0d', 'axial'),
      mkSeries('SR006b', 2, 'Right MLO', 'MG', 1, 'Right Breast', '#2a1a0d', 'sagittal'),
      mkSeries('SR006c', 3, 'Left CC', 'MG', 1, 'Left Breast', '#2d1a0d', 'axial'),
      mkSeries('SR006d', 4, 'Left MLO', 'MG', 1, 'Left Breast', '#2a1a0d', 'sagittal'),
    ],
    report: mkReport('ST006', 'Final',
      'Dense breast tissue (ACR Category C). A 8mm irregular mass with spiculated margins is identified in the left upper outer quadrant at the 10 o\'clock position, 4 cm from the nipple. No axillary adenopathy. Right breast is unremarkable.',
      'BI-RADS 4C: Suspicious. Tissue sampling is recommended for the left upper outer quadrant mass.',
      true, false),
    aiFindings: [mkAI('AI006a', 'mass', 'Spiculated 8mm mass left UOQ 10 o\'clock', 0.89, 'SR006c', 0, 'Left breast UOQ', 'high')],
    createdAt: '2024-12-14T08:45:00Z', updatedAt: '2024-12-14T10:30:00Z',
  },
  // ── Ultrasound ──
  {
    id: 'ST007', accessionNumber: 'ACC-2024-0007', patientId: 'RP007',
    patient: RADIOLOGY_PATIENTS[6], studyDate: '2024-12-14', studyTime: '11:00',
    modality: 'US', description: 'Ultrasound Abdomen Complete', bodyPart: 'Abdomen', status: 'Scheduled',
    priority: 'Routine', orderingPhysician: 'Dr. Mark Jensen', referringDepartment: 'Gastroenterology',
    clinicalHistory: 'Elevated LFTs. RUQ pain. R/O cholelithiasis.',
    patientLocation: 'Outpatient Clinic',
    hasPriors: false, series: [],
    aiFindings: [],
    createdAt: '2024-12-14T10:30:00Z', updatedAt: '2024-12-14T10:30:00Z',
  },
  // ── PET/CT ──
  {
    id: 'ST008', accessionNumber: 'ACC-2024-0008', patientId: 'RP008',
    patient: RADIOLOGY_PATIENTS[7], studyDate: '2024-12-13', studyTime: '08:00',
    modality: 'PET', description: 'PET/CT Oncology Whole Body', bodyPart: 'Whole Body', status: 'Verified',
    priority: 'Routine', orderingPhysician: 'Dr. Jennifer Walsh', referringDepartment: 'Oncology',
    clinicalHistory: 'Stage III non-Hodgkin lymphoma. Post-cycle 4 chemotherapy. Response assessment.',
    patientLocation: 'Outpatient Clinic', readingRadiologist: 'Dr. Marcus Webb',
    hasPriors: true, priorStudyIds: ['ST025'],
    series: [
      mkSeries('SR008a', 1, 'PET Emission', 'PET', 80, 'Whole Body', '#1a0d2d', 'axial'),
      mkSeries('SR008b', 2, 'CT Attenuation Correction', 'PET', 80, 'Whole Body', '#0d1520', 'axial'),
      mkSeries('SR008c', 3, 'PET/CT Fusion', 'PET', 80, 'Whole Body', '#1a0d1a', 'axial'),
      mkSeries('SR008d', 4, 'Coronal MIP', 'PET', 1, 'Whole Body', '#0a0d1a', 'coronal'),
    ],
    report: mkReport('ST008', 'Final',
      'Comparison with prior PET/CT. Previously identified hypermetabolic bilateral cervical and mediastinal lymph nodes show significant interval decrease in FDG avidity. The largest mediastinal node previously measured 2.4 cm now measures 0.8 cm. No new lesions.',
      'Significant metabolic response to chemotherapy with marked interval decrease in disease burden. Deauville score 2.',
      true),
    aiFindings: [],
    createdAt: '2024-12-13T07:30:00Z', updatedAt: '2024-12-13T11:00:00Z',
  },
  // ── CT Chest ──
  {
    id: 'ST009', accessionNumber: 'ACC-2024-0009', patientId: 'RP009',
    patient: RADIOLOGY_PATIENTS[8], studyDate: '2024-12-15', studyTime: '13:00',
    modality: 'CT', description: 'CT Chest High Resolution', bodyPart: 'Chest', status: 'Completed',
    priority: 'Urgent', orderingPhysician: 'Dr. Peter Nguyen', referringDepartment: 'Pulmonology',
    clinicalHistory: 'Progressive dyspnea. History of smoking (30 pack-years). Nodule found on CXR.',
    patientLocation: 'Outpatient Clinic',
    hasPriors: false,
    series: [
      mkSeries('SR009a', 1, 'Axial Lung Windows', 'CT', 50, 'Chest', '#0d1a1a', 'axial'),
      mkSeries('SR009b', 2, 'Axial Mediastinal Windows', 'CT', 50, 'Chest', '#1a1a0d', 'axial'),
      mkSeries('SR009c', 3, 'Coronal Lung Windows', 'CT', 30, 'Chest', '#0d1520', 'coronal'),
    ],
    aiFindings: [mkAI('AI009a', 'nodule', '1.8cm spiculated nodule right upper lobe', 0.93, 'SR009a', 22, 'Right upper lobe apical', 'high')],
    createdAt: '2024-12-15T12:30:00Z', updatedAt: '2024-12-15T13:15:00Z',
  },
  // ── MRI Spine ──
  {
    id: 'ST010', accessionNumber: 'ACC-2024-0010', patientId: 'RP010',
    patient: RADIOLOGY_PATIENTS[9], studyDate: '2024-12-13', studyTime: '15:00',
    modality: 'MR', description: 'MRI Lumbar Spine Without Contrast', bodyPart: 'Lumbar Spine', status: 'Read',
    priority: 'Routine', orderingPhysician: 'Dr. Karen Hill', referringDepartment: 'Neurology',
    clinicalHistory: 'Low back pain radiating to left leg. R/O disc herniation.',
    patientLocation: 'Outpatient Clinic', readingRadiologist: 'Dr. Alexandra Reeves',
    hasPriors: true, priorStudyIds: [],
    series: [
      mkSeries('SR010a', 1, 'Sagittal T2', 'MR', 14, 'Lumbar Spine', '#0d1a2d', 'sagittal'),
      mkSeries('SR010b', 2, 'Sagittal T1', 'MR', 14, 'Lumbar Spine', '#0a1520', 'sagittal'),
      mkSeries('SR010c', 3, 'Axial T2', 'MR', 20, 'Lumbar Spine', '#0d1a2d', 'axial'),
    ],
    report: mkReport('ST010', 'Final',
      'L4-L5: Large left paracentral disc herniation with left L5 nerve root compression. L5-S1: Moderate disc bulge with bilateral foraminal stenosis. L1-L4: Mild degenerative disc disease.',
      'L4-L5 large disc herniation with nerve root compression. Neurosurgical consultation recommended.',
      true),
    aiFindings: [],
    createdAt: '2024-12-13T14:45:00Z', updatedAt: '2024-12-13T16:00:00Z',
  },
  // ── More studies ──
  {
    id: 'ST011', accessionNumber: 'ACC-2024-0011', patientId: 'RP011',
    patient: RADIOLOGY_PATIENTS[10], studyDate: '2024-12-15', studyTime: '07:45',
    modality: 'CT', description: 'CT Head Without Contrast - Stroke Protocol', bodyPart: 'Brain', status: 'Completed',
    priority: 'STAT', orderingPhysician: 'Dr. Thomas Reed', referringDepartment: 'Emergency',
    clinicalHistory: 'Sudden left-sided weakness and slurred speech. Onset 1 hour ago. R/O stroke.',
    patientLocation: 'Emergency Department',
    hasPriors: false,
    series: [mkSeries('SR011a', 1, 'Axial Head', 'CT', 36, 'Brain', '#1a2332', 'axial')],
    aiFindings: [mkAI('AI011a', 'bleed', 'Hypodense region right MCA territory', 0.82, 'SR011a', 20, 'Right MCA territory', 'high')],
    createdAt: '2024-12-15T07:30:00Z', updatedAt: '2024-12-15T08:00:00Z',
  },
  {
    id: 'ST012', accessionNumber: 'ACC-2024-0012', patientId: 'RP012',
    patient: RADIOLOGY_PATIENTS[11], studyDate: '2024-12-14', studyTime: '16:00',
    modality: 'US', description: 'Obstetric Ultrasound 2nd Trimester', bodyPart: 'OB', status: 'Verified',
    priority: 'Routine', orderingPhysician: 'Dr. Angela Morris', referringDepartment: 'OB/GYN',
    clinicalHistory: 'G2P1, 22 weeks gestation. Anatomy scan.',
    patientLocation: 'OB Clinic', readingRadiologist: 'Dr. Marcus Webb',
    hasPriors: true, priorStudyIds: ['ST026'],
    series: [
      mkSeries('SR012a', 1, 'Fetal Survey', 'US', 45, 'Fetus', '#0d2d0d', 'axial'),
      mkSeries('SR012b', 2, 'Biometry', 'US', 8, 'Fetus', '#0a2a0a', 'axial'),
    ],
    report: mkReport('ST012', 'Final',
      'Single live fetus in cephalic presentation. BPD, HC, AC, FL measurements consistent with 22+3 weeks. Cardiac activity present. AFI 14cm. Placenta anterior, no previa. Cervical length 3.8cm. Fetal anatomy survey complete and normal.',
      'Normal fetal anatomy survey at 22 weeks gestation.',
      true),
    aiFindings: [],
    createdAt: '2024-12-14T15:30:00Z', updatedAt: '2024-12-14T16:45:00Z',
  },
  {
    id: 'ST013', accessionNumber: 'ACC-2024-0013', patientId: 'RP013',
    patient: RADIOLOGY_PATIENTS[12], studyDate: '2024-12-15', studyTime: '10:30',
    modality: 'XR', description: 'X-Ray Left Wrist PA & Lateral', bodyPart: 'Left Wrist', status: 'Scheduled',
    priority: 'Routine', orderingPhysician: 'Dr. Kevin Brown', referringDepartment: 'Emergency',
    clinicalHistory: 'FOOSH injury. Wrist pain and swelling. R/O fracture.',
    patientLocation: 'Emergency Department',
    hasPriors: false, series: [],
    aiFindings: [],
    createdAt: '2024-12-15T10:15:00Z', updatedAt: '2024-12-15T10:15:00Z',
  },
  {
    id: 'ST014', accessionNumber: 'ACC-2024-0014', patientId: 'RP014',
    patient: RADIOLOGY_PATIENTS[13], studyDate: '2024-12-15', studyTime: '12:00',
    modality: 'CT', description: 'CT Pulmonary Angiogram', bodyPart: 'Chest', status: 'In Progress',
    priority: 'STAT', orderingPhysician: 'Dr. Peter Nguyen', referringDepartment: 'Emergency',
    clinicalHistory: 'Acute onset pleuritic chest pain and dyspnea. DVT confirmed. R/O PE.',
    patientLocation: 'Emergency Department', readingRadiologist: 'Dr. Alexandra Reeves',
    hasPriors: false,
    series: [mkSeries('SR014a', 1, 'Pulmonary Arterial Phase', 'CT', 55, 'Chest', '#1a1520', 'axial')],
    aiFindings: [mkAI('AI014a', 'mass', 'Filling defects bilateral pulmonary arteries', 0.97, 'SR014a', 28, 'Bilateral main/lobar PA', 'high')],
    createdAt: '2024-12-15T11:45:00Z', updatedAt: '2024-12-15T12:15:00Z',
  },
  {
    id: 'ST015', accessionNumber: 'ACC-2024-0015', patientId: 'RP015',
    patient: RADIOLOGY_PATIENTS[14], studyDate: '2024-12-12', studyTime: '14:00',
    modality: 'MR', description: 'MRI Prostate Multiparametric', bodyPart: 'Prostate', status: 'Dictated',
    priority: 'Routine', orderingPhysician: 'Dr. James Liu', referringDepartment: 'Urology',
    clinicalHistory: 'PSA 8.5. Elevated DRE. R/O prostate cancer.',
    patientLocation: 'Outpatient Clinic',
    hasPriors: false,
    series: [
      mkSeries('SR015a', 1, 'T2 Axial', 'MR', 25, 'Prostate', '#1a0d0d', 'axial'),
      mkSeries('SR015b', 2, 'DWI/ADC', 'MR', 25, 'Prostate', '#0d1a0d', 'axial'),
      mkSeries('SR015c', 3, 'DCE', 'MR', 25, 'Prostate', '#1a1a0d', 'axial'),
    ],
    report: mkReport('ST015', 'Preliminary',
      'A 1.2 cm T2 hypointense lesion in the left peripheral zone at 5-7 o\'clock position with restricted diffusion (ADC 700 mm2/s) and early enhancement. PI-RADS 4.',
      'PI-RADS 4: Clinically significant cancer is likely present. MR-guided biopsy recommended.',
      false),
    aiFindings: [mkAI('AI015a', 'mass', 'T2 hypointense lesion left PZ with restricted DWI', 0.87, 'SR015a', 13, 'Left peripheral zone', 'high')],
    createdAt: '2024-12-12T13:30:00Z', updatedAt: '2024-12-12T15:00:00Z',
  },
];

// Fill with additional studies to reach ~25
const additionalStudies: Study[] = [
  { id: 'ST016', accessionNumber: 'ACC-2024-0016', patientId: 'RP016', patient: RADIOLOGY_PATIENTS[15], studyDate: '2024-12-11', studyTime: '09:00', modality: 'CT', description: 'CT Sinus Without Contrast', bodyPart: 'Sinuses', status: 'Verified', priority: 'Routine', orderingPhysician: 'Dr. Mark Jensen', referringDepartment: 'ENT', clinicalHistory: 'Chronic sinusitis. Pre-surgical evaluation.', patientLocation: 'Outpatient Clinic', readingRadiologist: 'Dr. Marcus Webb', hasPriors: false, series: [mkSeries('SR016a', 1, 'Axial', 'CT', 30, 'Sinuses', '#1a1520', 'axial')], report: mkReport('ST016', 'Final', 'Mucosal thickening bilateral maxillary sinuses. Partial opacification left ethmoid cells. Osteomeatal complexes patent bilaterally.', 'Chronic maxillary and ethmoid sinusitis.', true), aiFindings: [], createdAt: '2024-12-11T08:30:00Z', updatedAt: '2024-12-11T10:00:00Z' },
  { id: 'ST017', accessionNumber: 'ACC-2024-0017', patientId: 'RP017', patient: RADIOLOGY_PATIENTS[16], studyDate: '2024-12-15', studyTime: '14:30', modality: 'XR', description: 'X-Ray Chest Portable AP', bodyPart: 'Chest', status: 'Completed', priority: 'STAT', orderingPhysician: 'Dr. Thomas Reed', referringDepartment: 'ICU', clinicalHistory: 'Post-intubation check. Recent cardiac arrest.', patientLocation: 'ICU', hasPriors: true, priorStudyIds: [], series: [mkSeries('SR017a', 1, 'Portable AP', 'XR', 1, 'Chest', '#1e2f1e', 'axial')], aiFindings: [], createdAt: '2024-12-15T14:15:00Z', updatedAt: '2024-12-15T14:30:00Z' },
  { id: 'ST018', accessionNumber: 'ACC-2024-0018', patientId: 'RP018', patient: RADIOLOGY_PATIENTS[17], studyDate: '2024-12-10', studyTime: '11:00', modality: 'US', description: 'Thyroid Ultrasound', bodyPart: 'Thyroid', status: 'Read', priority: 'Routine', orderingPhysician: 'Dr. Karen Hill', referringDepartment: 'Endocrinology', clinicalHistory: 'Thyroid nodule found on exam. TSH elevated.', patientLocation: 'Outpatient Clinic', readingRadiologist: 'Dr. Alexandra Reeves', hasPriors: false, series: [mkSeries('SR018a', 1, 'Thyroid Survey', 'US', 35, 'Thyroid', '#0d2d0d', 'axial')], report: mkReport('ST018', 'Final', 'Right lobe: 1.4cm solid hypoechoic nodule with irregular margins and microcalcifications. Left lobe: 0.6cm cystic nodule. No adenopathy.', 'TI-RADS 4: Right thyroid nodule suspicious for malignancy. FNA recommended.', true), aiFindings: [mkAI('AI018a', 'nodule', '1.4cm hypoechoic solid nodule right lobe', 0.86, 'SR018a', 18, 'Right thyroid lobe', 'high')], createdAt: '2024-12-10T10:30:00Z', updatedAt: '2024-12-10T12:00:00Z' },
  { id: 'ST019', accessionNumber: 'ACC-2024-0019', patientId: 'RP019', patient: RADIOLOGY_PATIENTS[18], studyDate: '2024-12-15', studyTime: '08:00', modality: 'XR', description: 'X-Ray Hip & Pelvis AP', bodyPart: 'Hip/Pelvis', status: 'Read', priority: 'STAT', orderingPhysician: 'Dr. Kevin Brown', referringDepartment: 'Emergency', clinicalHistory: 'Fall from standing height. Hip pain, unable to bear weight.', patientLocation: 'Emergency Department', readingRadiologist: 'Dr. Marcus Webb', hasPriors: false, series: [mkSeries('SR019a', 1, 'AP Pelvis', 'XR', 1, 'Pelvis', '#2d1a0d', 'axial'), mkSeries('SR019b', 2, 'Lateral Right Hip', 'XR', 1, 'Right Hip', '#2a1a0d', 'sagittal')], report: mkReport('ST019', 'Final', 'Displaced subcapital femoral neck fracture right hip with valgus deformity. Pelvis otherwise intact.', 'RIGHT FEMORAL NECK FRACTURE. Orthopedic emergency consultation recommended.', true, true), aiFindings: [mkAI('AI019a', 'fracture', 'Displaced right femoral neck fracture', 0.98, 'SR019a', 0, 'Right femoral neck', 'high')], createdAt: '2024-12-15T07:45:00Z', updatedAt: '2024-12-15T08:30:00Z' },
  { id: 'ST020', accessionNumber: 'ACC-2023-0890', patientId: 'RP001', patient: RADIOLOGY_PATIENTS[0], studyDate: '2023-06-10', studyTime: '10:00', modality: 'CT', description: 'CT Head Without Contrast (Prior)', bodyPart: 'Brain', status: 'Verified', priority: 'Routine', orderingPhysician: 'Dr. Robert Kim', referringDepartment: 'Neurology', clinicalHistory: 'Headache evaluation.', patientLocation: 'Outpatient Clinic', readingRadiologist: 'Dr. Marcus Webb', hasPriors: false, series: [mkSeries('SR020a', 1, 'Axial Brain', 'CT', 36, 'Brain', '#1a2332', 'axial')], report: mkReport('ST020', 'Final', 'No acute intracranial abnormality. No mass, hemorrhage, or infarct.', 'Normal CT head.', true), aiFindings: [], createdAt: '2023-06-10T09:30:00Z', updatedAt: '2023-06-10T10:30:00Z' },
];

export const ALL_RADIOLOGY_STUDIES: Study[] = [...RADIOLOGY_STUDIES, ...additionalStudies];

// ─── Report Templates ──────────────────────────────────────────────────────────
export const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'TPL001', name: 'CT Head - Normal', modality: 'CT', bodyPart: 'Brain', category: 'Neuro',
    content: {
      findings: 'The brain parenchyma is normal in attenuation without evidence of acute infarct, hemorrhage, or mass lesion. The gray-white matter differentiation is preserved. The ventricles and sulci are normal in size and configuration for the patient\'s age. The basal cisterns are patent. No midline shift. The calvarium and visualized orbits are intact. No acute bony abnormality.',
      impression: 'No acute intracranial abnormality.',
    },
  },
  {
    id: 'TPL002', name: 'CT Head - Stroke', modality: 'CT', bodyPart: 'Brain', category: 'Neuro',
    content: {
      findings: 'There is hypodensity in the [specify territory] territory involving the [specify cortex/subcortical structures] consistent with an acute/subacute infarct. Estimated volume [X] mL. No hemorrhagic transformation. No mass effect. Midline shift: [X] mm / None. Basal cisterns are [patent / effaced].',
      impression: '[Acute/Subacute] ischemic infarct in the [specify territory]. [CT perfusion/CTA correlation recommended if available].',
    },
  },
  {
    id: 'TPL003', name: 'Chest X-Ray - Normal PA', modality: 'XR', bodyPart: 'Chest', category: 'Chest',
    content: {
      findings: 'The cardiac silhouette is normal in size. The lungs are clear bilaterally without focal consolidation, pleural effusion, or pneumothorax. The hila are unremarkable. The mediastinum is not widened. The osseous structures are intact without acute abnormality.',
      impression: 'No acute cardiopulmonary process.',
    },
  },
  {
    id: 'TPL004', name: 'CT Abdomen/Pelvis - Normal', modality: 'CT', bodyPart: 'Abdomen/Pelvis', category: 'Abdomen',
    content: {
      findings: 'Liver: Normal size and attenuation. No focal lesion. Spleen: Normal. Pancreas: Normal. Kidneys: Normal bilaterally without hydronephrosis. Adrenals: Normal. No lymphadenopathy. Bowel loops are normal caliber. No free fluid or air.',
      impression: 'No acute intra-abdominal pathology.',
    },
  },
  {
    id: 'TPL005', name: 'MRI Knee - Normal', modality: 'MR', bodyPart: 'Knee', category: 'MSK',
    content: {
      findings: 'Menisci: Normal signal and morphology bilaterally. Ligaments: ACL, PCL, MCL, and LCL are intact. Articular cartilage: Preserved throughout. Bone marrow: No signal abnormality. No joint effusion. No popliteal cyst.',
      impression: 'Normal MRI of the [right/left] knee.',
    },
  },
  {
    id: 'TPL006', name: 'Mammography - Normal Screening', modality: 'MG', bodyPart: 'Bilateral Breasts', category: 'Breast',
    content: {
      findings: 'The breasts are [almost entirely fatty / scattered fibroglandular densities / heterogeneously dense / extremely dense] (ACR Category [A/B/C/D]). No suspicious mass, calcification, or architectural distortion. No axillary adenopathy.',
      impression: 'No evidence of malignancy. BI-RADS 1: Negative. Routine screening in 1 year.',
    },
    radsSystem: 'BI-RADS',
  },
  {
    id: 'TPL007', name: 'OB Ultrasound - 2nd Trimester', modality: 'US', bodyPart: 'OB', category: 'OB/GYN',
    content: {
      findings: 'Single live fetus in [cephalic/breech] presentation. Biometry: BPD [X] cm, HC [X] cm, AC [X] cm, FL [X] cm, consistent with [X] weeks [X] days. Cardiac activity present, rate [X] bpm. Amniotic fluid index [X] cm. Placenta [anterior/posterior], [X] cm from internal os. Cervical length [X] cm. Fetal anatomy survey: [Normal/as detailed].',
      impression: 'Live intrauterine [singleton/twin] pregnancy at [X] weeks [X] days by biometry.',
    },
  },
  {
    id: 'TPL008', name: 'CT Chest - Lung Nodule', modality: 'CT', bodyPart: 'Chest', category: 'Chest',
    content: {
      findings: 'A [X] mm [solid/part-solid/ground-glass] nodule is identified in the [location] lobe. Morphology: [Smooth/Spiculated/Lobulated]. No satellite nodules. Mediastinum: No adenopathy. Pleural spaces: Clear. Lung-RADS [1-4].',
      impression: '[X] mm [solid/ground-glass] pulmonary nodule [right/left] [lobe]. Lung-RADS [X]. [Follow-up/biopsy] recommended.',
    },
    radsSystem: 'Lung-RADS',
  },
];

// ─── Window/Level Presets ─────────────────────────────────────────────────────
export const WINDOW_LEVEL_PRESETS: WindowLevel[] = [
  { name: 'Brain', window: 80, level: 40 },
  { name: 'Subdural', window: 130, level: 50 },
  { name: 'Stroke', window: 8, level: 32 },
  { name: 'Temporal Bone', window: 2800, level: 600 },
  { name: 'Soft Tissue', window: 400, level: 50 },
  { name: 'Lung', window: 1500, level: -600 },
  { name: 'Bone', window: 1800, level: 400 },
  { name: 'Liver', window: 150, level: 75 },
  { name: 'Angio', window: 600, level: 300 },
];

// ─── RADS Score Descriptors ───────────────────────────────────────────────────
export const RADS_SYSTEMS = {
  'BI-RADS': [
    { score: 0, descriptor: 'Incomplete', recommendation: 'Additional imaging needed' },
    { score: 1, descriptor: 'Negative', recommendation: 'Routine screening' },
    { score: 2, descriptor: 'Benign', recommendation: 'Routine screening' },
    { score: 3, descriptor: 'Probably Benign', recommendation: '6-month follow-up' },
    { score: 4, descriptor: 'Suspicious (4A/4B/4C)', recommendation: 'Tissue sampling' },
    { score: 5, descriptor: 'Highly Suggestive of Malignancy', recommendation: 'Biopsy' },
    { score: 6, descriptor: 'Known Malignancy', recommendation: 'Treatment planning' },
  ],
  'PI-RADS': [
    { score: 1, descriptor: 'Very Low (clinically significant cancer is highly unlikely)', recommendation: 'No biopsy' },
    { score: 2, descriptor: 'Low (clinically significant cancer is unlikely)', recommendation: 'No biopsy' },
    { score: 3, descriptor: 'Intermediate', recommendation: 'Biopsy at discretion' },
    { score: 4, descriptor: 'High (clinically significant cancer is likely)', recommendation: 'MR-guided biopsy' },
    { score: 5, descriptor: 'Very High (clinically significant cancer is highly likely)', recommendation: 'Immediate biopsy' },
  ],
  'LI-RADS': [
    { score: 1, descriptor: 'Definitely Benign', recommendation: 'Routine surveillance' },
    { score: 2, descriptor: 'Probably Benign', recommendation: 'Routine surveillance' },
    { score: 3, descriptor: 'Intermediate Probability of HCC', recommendation: 'Follow-up per guidelines' },
    { score: 4, descriptor: 'Probably HCC', recommendation: 'Multidisciplinary discussion' },
    { score: 5, descriptor: 'Definitely HCC', recommendation: 'Treatment per guidelines' },
  ],
  'Lung-RADS': [
    { score: 1, descriptor: 'Negative', recommendation: 'Annual LDCT' },
    { score: 2, descriptor: 'Benign Appearance', recommendation: 'Annual LDCT' },
    { score: 3, descriptor: 'Probably Benign', recommendation: '6-month LDCT' },
    { score: 4, descriptor: 'Suspicious (4A/4B/4X)', recommendation: 'PET/CT or biopsy' },
  ],
  'NI-RADS': [
    { score: 1, descriptor: 'No Evidence of Recurrence', recommendation: 'Routine surveillance' },
    { score: 2, descriptor: 'Low Suspicion', recommendation: 'Short-interval follow-up' },
    { score: 3, descriptor: 'High Suspicion', recommendation: 'Tissue sampling' },
    { score: 4, descriptor: 'Definite Recurrence', recommendation: 'Treatment' },
  ],
};

// Radiologists
export const RADIOLOGISTS = ['Dr. Alexandra Reeves', 'Dr. Marcus Webb', 'Dr. James Park'];
export const TECHNICIANS = ['Tech. Emma Torres', 'Tech. Liam Foster', 'Tech. Aisha Okafor'];
