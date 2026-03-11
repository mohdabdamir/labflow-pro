import React from 'react';
import {
  Document, Page, Text, View, StyleSheet,
  PDFViewer, PDFDownloadLink,
} from '@react-pdf/renderer';
import type { APCase } from '@/types/anatomicPathology';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, X } from 'lucide-react';

// ─── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 9, backgroundColor: '#fff', color: '#111' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: '#5b21b6' },
  facilityName: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: '#5b21b6', marginBottom: 2 },
  facilityInfo: { fontSize: 7.5, color: '#555', marginBottom: 1.5 },
  reportTitleBlock: { alignItems: 'flex-end' },
  reportTitle: { fontSize: 13, fontFamily: 'Helvetica-Bold', color: '#5b21b6', marginBottom: 3 },
  caseNum: { fontSize: 8, color: '#555', marginBottom: 2 },

  // Patient info row
  infoGrid: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  infoBox: { flex: 1, border: '1pt solid #e5e7eb', borderRadius: 4, padding: 8 },
  infoBoxTitle: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  infoRow: { flexDirection: 'row', marginBottom: 2 },
  infoLabel: { fontSize: 7.5, color: '#888', width: 90 },
  infoValue: { fontSize: 7.5, color: '#111', flex: 1, fontFamily: 'Helvetica-Bold' },

  // Critical banner
  criticalBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', border: '1pt solid #fca5a5', borderRadius: 4, padding: '6 10', marginBottom: 10 },
  criticalText: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#dc2626' },

  // Cancer classification
  cancerBlock: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  cancerLabel: { fontSize: 8, color: '#555' },
  cancerValueMalignant: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#dc2626', backgroundColor: '#fee2e2', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10 },
  cancerValueIntermediate: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#d97706', backgroundColor: '#fef3c7', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10 },
  cancerValueBenign: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#059669', backgroundColor: '#d1fae5', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10 },

  // Section
  sectionTitle: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#5b21b6', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 10, marginBottom: 4, paddingBottom: 2, borderBottomWidth: 0.5, borderBottomColor: '#ddd6fe' },
  specimenHeader: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#111', backgroundColor: '#f5f3ff', padding: '4 8', borderRadius: 3, marginBottom: 4, marginTop: 8 },
  bodyText: { fontSize: 8.5, color: '#222', lineHeight: 1.5, marginBottom: 4 },
  labelText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#555', marginBottom: 2, marginTop: 4 },

  // Ancillary table
  table: { marginTop: 4, marginBottom: 6 },
  tableHead: { flexDirection: 'row', backgroundColor: '#f5f3ff', padding: '4 6' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#e5e7eb', padding: '3 6' },
  tableCell: { flex: 1, fontSize: 7.5 },
  tableCellBold: { flex: 1, fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#5b21b6' },

  // Comment box
  commentBox: { backgroundColor: '#f8fafc', border: '1pt solid #e2e8f0', borderRadius: 4, padding: 8, marginTop: 6 },
  commentLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#64748b', marginBottom: 3 },
  commentText: { fontSize: 8.5, color: '#222', lineHeight: 1.5, fontFamily: 'Helvetica-Oblique' },

  // Signature
  signatureSection: { marginTop: 24, flexDirection: 'row', justifyContent: 'flex-end' },
  signatureBox: { alignItems: 'center', width: 180 },
  signatureLine: { width: 160, borderBottomWidth: 1, borderBottomColor: '#333', marginBottom: 4 },
  signatureLabel: { fontSize: 8, color: '#555' },

  // Footer
  footer: { position: 'absolute', bottom: 24, left: 40, right: 40, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 0.5, borderTopColor: '#ddd', paddingTop: 6 },
  footerText: { fontSize: 6.5, color: '#aaa' },
  pageNum: { fontSize: 6.5, color: '#aaa' },

  // Status badge
  statusBadge: { alignSelf: 'flex-end', paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10, marginTop: 4 },
  statusTextFinalized: { fontSize: 7.5, color: '#059669', fontFamily: 'Helvetica-Bold' },
  statusTextDraft: { fontSize: 7.5, color: '#d97706', fontFamily: 'Helvetica-Bold' },
});

function cancerStyle(type?: string) {
  if (type === 'malignant') return S.cancerValueMalignant;
  if (type === 'intermediate') return S.cancerValueIntermediate;
  return S.cancerValueBenign;
}

interface APDocProps { apCase: APCase }

export function APReportDocument({ apCase }: APDocProps) {
  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.header}>
          <View>
            <Text style={S.facilityName}>MediCenter — Anatomic Pathology</Text>
            <Text style={S.facilityInfo}>Kingdom of Bahrain · Tel: +973-1700-0000 · pathlab@medicenter.bh</Text>
            <Text style={S.facilityInfo}>Accreditation: CAP / CLIA · License No: LAB-2025-AP</Text>
          </View>
          <View style={S.reportTitleBlock}>
            <Text style={S.reportTitle}>PATHOLOGY REPORT</Text>
            <Text style={S.caseNum}>Case No: {apCase.caseNumber}</Text>
            <Text style={S.caseNum}>Received: {apCase.registeredAt.slice(0, 10)}</Text>
            <View style={[S.statusBadge, { backgroundColor: apCase.status === 'finalized' ? '#d1fae5' : '#fef3c7' }]}>
              <Text style={apCase.status === 'finalized' ? S.statusTextFinalized : S.statusTextDraft}>
                {apCase.status === 'finalized' ? '● FINAL' : '● DRAFT / PRELIMINARY'}
              </Text>
            </View>
          </View>
        </View>

        {/* Critical Banner */}
        {apCase.isCritical && (
          <View style={S.criticalBanner}>
            <Text style={S.criticalText}>⚠  CRITICAL FINDING — {apCase.criticalNote ?? 'Urgent clinical action required'}</Text>
          </View>
        )}

        {/* Info Grid */}
        <View style={S.infoGrid}>
          <View style={S.infoBox}>
            <Text style={S.infoBoxTitle}>Patient Information</Text>
            <View style={S.infoRow}><Text style={S.infoLabel}>Name:</Text><Text style={S.infoValue}>{apCase.patientName}</Text></View>
            <View style={S.infoRow}><Text style={S.infoLabel}>Patient ID:</Text><Text style={S.infoValue}>{apCase.patientId}</Text></View>
            <View style={S.infoRow}><Text style={S.infoLabel}>DOB:</Text><Text style={S.infoValue}>{apCase.patientDob ?? '—'}</Text></View>
            <View style={S.infoRow}><Text style={S.infoLabel}>Age / Gender:</Text><Text style={S.infoValue}>{apCase.patientAge}y / {apCase.patientGender === 'M' ? 'Male' : apCase.patientGender === 'F' ? 'Female' : 'Unknown'}</Text></View>
          </View>
          <View style={S.infoBox}>
            <Text style={S.infoBoxTitle}>Clinical Information</Text>
            <View style={S.infoRow}><Text style={S.infoLabel}>Client:</Text><Text style={S.infoValue}>{apCase.clientName}</Text></View>
            <View style={S.infoRow}><Text style={S.infoLabel}>Treating Physician:</Text><Text style={S.infoValue}>{apCase.treatingPhysician}</Text></View>
            {apCase.referringPhysician && <View style={S.infoRow}><Text style={S.infoLabel}>Referring Physician:</Text><Text style={S.infoValue}>{apCase.referringPhysician}</Text></View>}
            <View style={S.infoRow}><Text style={S.infoLabel}>Case Type:</Text><Text style={S.infoValue}>{apCase.caseType}</Text></View>
            <View style={S.infoRow}><Text style={S.infoLabel}>Specimens:</Text><Text style={S.infoValue}>{apCase.numberOfSpecimens}</Text></View>
          </View>
        </View>

        {/* Cancer Classification */}
        {apCase.overallCancerType && apCase.overallCancerType !== 'pending' && (
          <View style={S.cancerBlock}>
            <Text style={S.cancerLabel}>Overall Classification:</Text>
            <Text style={cancerStyle(apCase.overallCancerType)}>
              {apCase.overallCancerType.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Clinical History */}
        {apCase.clinicalHistory && (
          <>
            <Text style={S.sectionTitle}>Clinical History</Text>
            <Text style={S.bodyText}>{apCase.clinicalHistory}</Text>
          </>
        )}

        {/* Specimens */}
        <Text style={S.sectionTitle}>Specimen Findings</Text>
        {apCase.specimens.map((sp) => (
          <View key={sp.id} wrap={false}>
            <Text style={S.specimenHeader}>
              Specimen {sp.specimenLabel}: {sp.specimenName}
              {sp.site ? `  |  Site: ${sp.site}` : ''}
              {sp.laterality && sp.laterality !== 'NA' ? `  |  ${sp.laterality}` : ''}
            </Text>

            {sp.grossDescription && (
              <>
                <Text style={S.labelText}>GROSS DESCRIPTION:</Text>
                <Text style={S.bodyText}>{sp.grossDescription}</Text>
              </>
            )}

            {sp.microscopicFindings && (
              <>
                <Text style={S.labelText}>MICROSCOPIC FINDINGS:</Text>
                <Text style={S.bodyText}>{sp.microscopicFindings}</Text>
              </>
            )}

            {sp.diagnosis && (
              <>
                <Text style={S.labelText}>DIAGNOSIS:</Text>
                <Text style={[S.bodyText, { fontFamily: 'Helvetica-Bold' }]}>{sp.diagnosis}</Text>
              </>
            )}

            {sp.cancerType && sp.cancerType !== 'pending' && (
              <View style={[S.cancerBlock, { marginTop: 2 }]}>
                <Text style={S.cancerLabel}>Classification:</Text>
                <Text style={cancerStyle(sp.cancerType)}>{sp.cancerType.toUpperCase()}</Text>
              </View>
            )}

            {/* Frozen sections */}
            {(sp.frozenSections ?? []).length > 0 && (
              <>
                <Text style={S.labelText}>FROZEN SECTION REPORT(S):</Text>
                {sp.frozenSections!.map((fs, i) => (
                  <View key={fs.id} style={{ marginBottom: 3 }}>
                    <Text style={S.bodyText}>
                      FS {i + 1}: {fs.diagnosis}
                      {fs.communicatedTo ? `  — Communicated to: ${fs.communicatedTo}` : ''}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* Ancillary studies */}
            {(sp.ancillaryStudies ?? []).length > 0 && (
              <>
                <Text style={S.labelText}>ANCILLARY STUDIES / SPECIAL STAINS:</Text>
                <View style={S.table}>
                  <View style={S.tableHead}>
                    <Text style={[S.tableCellBold, { width: 40 }]}>Block</Text>
                    <Text style={[S.tableCellBold, { flex: 1.5 }]}>Stain / Marker</Text>
                    <Text style={[S.tableCellBold, { flex: 2 }]}>Result</Text>
                    <Text style={[S.tableCellBold, { flex: 2.5 }]}>Interpretation</Text>
                  </View>
                  {sp.ancillaryStudies!.map((a) => (
                    <View key={a.id} style={S.tableRow}>
                      <Text style={[S.tableCell, { width: 40 }]}>{a.blockNumber}</Text>
                      <Text style={[S.tableCell, { flex: 1.5, fontFamily: 'Helvetica-Bold' }]}>{a.stainName}</Text>
                      <Text style={[S.tableCell, { flex: 2 }]}>{a.result}</Text>
                      <Text style={[S.tableCell, { flex: 2.5 }]}>{a.interpretation ?? '—'}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        ))}

        {/* Pathologist Comment */}
        {apCase.pathologistComment && (
          <>
            <Text style={S.sectionTitle}>Pathologist Comment</Text>
            <View style={S.commentBox}>
              <Text style={S.commentLabel}>Clinical Recommendation:</Text>
              <Text style={S.commentText}>{apCase.pathologistComment}</Text>
            </View>
          </>
        )}

        {/* Signature */}
        <View style={S.signatureSection}>
          <View style={S.signatureBox}>
            <View style={S.signatureLine} />
            <Text style={S.signatureLabel}>{apCase.pathologistName ?? 'Reporting Pathologist'}</Text>
            {apCase.reportedAt && <Text style={[S.signatureLabel, { marginTop: 2 }]}>Date: {apCase.reportedAt.slice(0, 10)}</Text>}
          </View>
        </View>

        {/* Footer */}
        <View style={S.footer} fixed>
          <Text style={S.footerText}>MediCenter Anatomic Pathology · {apCase.caseNumber} · Confidential Medical Report</Text>
          <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// ─── Preview Dialog ────────────────────────────────────────────────────────────
interface PreviewProps {
  apCase: APCase;
  open: boolean;
  onClose: () => void;
}

export function APReportPreviewDialog({ apCase, open, onClose }: PreviewProps) {
  const filename = `${apCase.caseNumber}-${apCase.patientId}-PathReport.pdf`;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-5 py-3 border-b border-border flex-row items-center gap-3">
          <DialogTitle className="flex-1 text-base">Report Preview — {apCase.caseNumber}</DialogTitle>
          <PDFDownloadLink document={<APReportDocument apCase={apCase} />} fileName={filename}>
            {({ loading }) => (
              <Button size="sm" variant="outline" className="gap-1.5" disabled={loading}>
                <Download className="h-3.5 w-3.5" />{loading ? 'Generating…' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>
          <Button size="sm" variant="ghost" onClick={onClose} className="gap-1.5">
            <X className="h-3.5 w-3.5" />Close
          </Button>
        </DialogHeader>
        <div className="flex-1 p-0">
          <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
            <APReportDocument apCase={apCase} />
          </PDFViewer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
