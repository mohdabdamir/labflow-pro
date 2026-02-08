import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer, PDFDownloadLink, Image } from '@react-pdf/renderer';
import type { Case, CaseTest } from '@/types/lab';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#1a5276',
  },
  headerLeft: {
    flex: 1,
  },
  labName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a5276',
    marginBottom: 4,
  },
  labInfo: {
    fontSize: 8,
    color: '#666666',
    marginBottom: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a5276',
    marginBottom: 4,
  },
  caseNumber: {
    fontSize: 10,
    fontFamily: 'Courier',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 8,
    color: '#666666',
  },
  
  // Patient Section
  patientSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a5276',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  patientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patientField: {
    width: '50%',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 8,
    color: '#666666',
  },
  fieldValue: {
    fontSize: 10,
    fontWeight: 'medium',
  },

  // Results Table
  resultsSection: {
    marginBottom: 20,
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a5276',
    padding: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableRowAlt: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    fontSize: 9,
  },
  
  // Column widths
  colTest: { width: '35%' },
  colResult: { width: '20%', textAlign: 'center' },
  colUnit: { width: '15%', textAlign: 'center' },
  colRange: { width: '20%', textAlign: 'center' },
  colFlag: { width: '10%', textAlign: 'center' },

  // Flag styles
  flagNormal: {
    color: '#27ae60',
    fontWeight: 'bold',
  },
  flagAbnormal: {
    color: '#f39c12',
    fontWeight: 'bold',
  },
  flagCritical: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 10,
  },

  // Department Header
  deptHeader: {
    backgroundColor: '#e8f4f8',
    padding: 6,
    marginTop: 10,
    marginBottom: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#1a5276',
  },
  deptName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a5276',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLeft: {
    fontSize: 8,
    color: '#666666',
  },
  footerRight: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'right',
  },
  signature: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  signatureLine: {
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
    marginBottom: 4,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#666666',
  },
  signatureName: {
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Disclaimer
  disclaimer: {
    marginTop: 15,
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
    fontSize: 7,
    color: '#856404',
  },

  // Critical Alert
  criticalAlert: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8d7da',
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  criticalText: {
    color: '#721c24',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

interface LabReportDocumentProps {
  caseData: Case;
  labInfo?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

// Group tests by department
const groupTestsByDepartment = (tests: CaseTest[]): Record<string, CaseTest[]> => {
  return tests.reduce((acc, test) => {
    const dept = test.department;
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(test);
    return acc;
  }, {} as Record<string, CaseTest[]>);
};

const getFlagDisplay = (flag: string | null | undefined) => {
  switch (flag) {
    case 'normal': return { text: 'N', style: styles.flagNormal };
    case 'abnormal': return { text: 'H/L', style: styles.flagAbnormal };
    case 'critical': return { text: '!!', style: styles.flagCritical };
    default: return { text: '-', style: {} };
  }
};

export function LabReportDocument({ caseData, labInfo }: LabReportDocumentProps) {
  const defaultLabInfo = {
    name: 'Clinical Pathology Laboratory',
    address: '123 Medical Center Drive, Metro City, MC 12345',
    phone: '(555) 123-4567',
    email: 'info@clinicallab.com',
  };

  const lab = labInfo || defaultLabInfo;
  const testsByDept = groupTestsByDepartment(caseData.tests);
  const hasCriticalResults = caseData.tests.some(t => t.flag === 'critical');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.labName}>{lab.name}</Text>
            <Text style={styles.labInfo}>{lab.address}</Text>
            <Text style={styles.labInfo}>Tel: {lab.phone} | Email: {lab.email}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>LABORATORY REPORT</Text>
            <Text style={styles.caseNumber}>{caseData.caseNumber}</Text>
            <Text style={styles.reportDate}>
              Report Date: {new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Critical Alert */}
        {hasCriticalResults && (
          <View style={styles.criticalAlert}>
            <Text style={styles.criticalText}>
              ⚠ CRITICAL VALUES DETECTED - IMMEDIATE PHYSICIAN NOTIFICATION REQUIRED
            </Text>
          </View>
        )}

        {/* Patient Information */}
        <View style={styles.patientSection}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.patientGrid}>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Patient Name</Text>
              <Text style={styles.fieldValue}>{caseData.patientName}</Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Patient ID</Text>
              <Text style={styles.fieldValue}>{caseData.patientId}</Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Age / Gender</Text>
              <Text style={styles.fieldValue}>{caseData.patientAge} years / {caseData.patientGender}</Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Referring Physician</Text>
              <Text style={styles.fieldValue}>{caseData.referringDoctor || 'Self'}</Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Collection Date</Text>
              <Text style={styles.fieldValue}>
                {caseData.collectionDate 
                  ? new Date(caseData.collectionDate).toLocaleDateString('en-US')
                  : '-'}
              </Text>
            </View>
            <View style={styles.patientField}>
              <Text style={styles.fieldLabel}>Client</Text>
              <Text style={styles.fieldValue}>{caseData.clientName}</Text>
            </View>
          </View>
        </View>

        {/* Test Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colTest]}>Test Name</Text>
            <Text style={[styles.tableHeaderCell, styles.colResult]}>Result</Text>
            <Text style={[styles.tableHeaderCell, styles.colUnit]}>Unit</Text>
            <Text style={[styles.tableHeaderCell, styles.colRange]}>Reference Range</Text>
            <Text style={[styles.tableHeaderCell, styles.colFlag]}>Flag</Text>
          </View>

          {/* Results by Department */}
          {Object.entries(testsByDept).map(([dept, tests]) => (
            <View key={dept}>
              <View style={styles.deptHeader}>
                <Text style={styles.deptName}>{dept}</Text>
              </View>
              {tests.map((test, index) => {
                const flag = getFlagDisplay(test.flag);
                return (
                  <View 
                    key={test.testId} 
                    style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
                  >
                    <View style={styles.colTest}>
                      <Text style={styles.tableCell}>{test.testName}</Text>
                      <Text style={[styles.tableCell, { fontSize: 7, color: '#666666' }]}>
                        {test.testCode}
                      </Text>
                    </View>
                    <Text style={[styles.tableCell, styles.colResult, test.flag === 'critical' ? styles.flagCritical : test.flag === 'abnormal' ? styles.flagAbnormal : {}]}>
                      {test.result || '-'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colUnit]}>
                      {test.unit || '-'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colRange]}>
                      {test.normalRange || '-'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colFlag, flag.style]}>
                      {flag.text}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Signature */}
        <View style={styles.signature}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>
            {caseData.tests[0]?.validatedBy || 'Laboratory Director'}
          </Text>
          <Text style={styles.signatureLabel}>Authorized Signatory</Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text>
            This report is confidential and intended solely for the use of the individual or entity to whom it is addressed. 
            Results should be interpreted in conjunction with clinical findings. Reference ranges may vary based on methodology. 
            Critical values have been communicated to the ordering physician as per laboratory policy.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerContent}>
            <Text style={styles.footerLeft}>
              Report generated on {new Date().toLocaleString()}
            </Text>
            <Text style={styles.footerRight}>
              {caseData.caseNumber} | Page 1 of 1
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// PDF Viewer Component
interface LabReportViewerProps {
  caseData: Case;
}

export function LabReportViewer({ caseData }: LabReportViewerProps) {
  return (
    <PDFViewer width="100%" height="600px" className="border rounded-lg">
      <LabReportDocument caseData={caseData} />
    </PDFViewer>
  );
}

// Download Button Component
interface LabReportDownloadProps {
  caseData: Case;
  children: React.ReactNode;
}

export function LabReportDownload({ caseData, children }: LabReportDownloadProps) {
  return (
    <PDFDownloadLink
      document={<LabReportDocument caseData={caseData} />}
      fileName={`${caseData.caseNumber}-report.pdf`}
    >
      {({ loading }) => (loading ? 'Generating...' : children)}
    </PDFDownloadLink>
  );
}
