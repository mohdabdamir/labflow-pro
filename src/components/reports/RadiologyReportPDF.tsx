import React from 'react';
import {
  Document, Page, Text, View, StyleSheet, Image,
  PDFViewer, PDFDownloadLink, Font,
} from '@react-pdf/renderer';
import type { Study, RadiologyReport } from '@/types/radiology';

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 9,
    backgroundColor: '#ffffff',
    color: '#1a1a2e',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: '#1a3a6b',
  },
  facilityName: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#1a3a6b',
    marginBottom: 3,
  },
  facilityInfo: {
    fontSize: 7.5,
    color: '#555',
    marginBottom: 1.5,
  },
  reportTitleBlock: {
    alignItems: 'flex-end',
  },
  reportTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#1a3a6b',
    marginBottom: 3,
  },
  accession: {
    fontSize: 8,
    color: '#555',
  },
  statusBadge: {
    marginTop: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  statusText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },

  // Critical banner
  criticalBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  criticalText: {
    color: '#dc2626',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },

  // Patient/study info grid
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 10,
  },
  infoBoxTitle: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  infoLabel: {
    fontSize: 8,
    color: '#6b7280',
    width: 72,
  },
  infoValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    flex: 1,
    color: '#1a1a2e',
  },
  allergyBadge: {
    backgroundColor: '#fef2f2',
    borderWidth: 0.5,
    borderColor: '#fca5a5',
    borderRadius: 3,
    paddingVertical: 1,
    paddingHorizontal: 4,
    marginRight: 3,
    marginBottom: 2,
  },
  allergyText: {
    fontSize: 7,
    color: '#dc2626',
  },

  // Section
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a3a6b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  sectionBody: {
    fontSize: 9,
    lineHeight: 1.7,
    color: '#374151',
    marginBottom: 14,
    backgroundColor: '#fafbff',
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 3,
    padding: 10,
  },
  emptySection: {
    fontSize: 8,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 14,
    padding: 10,
    borderWidth: 0.5,
    borderColor: '#e2e8f0',
    borderRadius: 3,
  },

  // RADS score
  radsBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 4,
    padding: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  radsScore: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    lineHeight: 1,
  },
  radsSystem: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    marginBottom: 3,
  },
  radsDescriptor: {
    fontSize: 8.5,
    color: '#374151',
    marginBottom: 2,
  },
  radsRec: {
    fontSize: 8,
    color: '#6b7280',
  },

  // Images section
  imagesSectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a3a6b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#dbeafe',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  imageItem: {
    width: '47%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  imageImg: {
    width: '100%',
    height: 140,
    objectFit: 'contain',
    backgroundColor: '#0d1520',
  },
  imageCaptionBox: {
    padding: 5,
    backgroundColor: '#f8fafc',
  },
  imageCaption: {
    fontSize: 7.5,
    color: '#374151',
    textAlign: 'center',
  },

  // Signature
  signatureBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signatureLeft: {
    flex: 1,
  },
  signedBy: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
    marginBottom: 2,
  },
  signedAt: {
    fontSize: 7.5,
    color: '#6b7280',
  },
  signatureVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 8,
    color: '#166534',
  },
  signatureLine: {
    width: 140,
    borderBottomWidth: 1,
    borderBottomColor: '#166534',
    marginBottom: 4,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#d1d5db',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: '#9ca3af',
  },
});

// ─── Status color helper ──────────────────────────────────────────────────────
function getStatusStyle(status: string) {
  switch (status) {
    case 'Final':    return { bg: '#f0fdf4', border: '#86efac', text: '#166534' };
    case 'Preliminary': return { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' };
    case 'Addendum': return { bg: '#fff7ed', border: '#fdba74', text: '#c2410c' };
    default:         return { bg: '#f1f5f9', border: '#cbd5e1', text: '#475569' };
  }
}

// ─── Attached image type ──────────────────────────────────────────────────────
export interface ReportImage {
  id: string;
  dataUrl: string;
  caption: string;
}

// ─── Document component ───────────────────────────────────────────────────────
interface RadiologyReportDocumentProps {
  study: Study;
  report: RadiologyReport;
  images: ReportImage[];
}

export function RadiologyReportDocument({ study, report, images }: RadiologyReportDocumentProps) {
  const statusStyle = getStatusStyle(report.status);

  return (
    <Document title={`Radiology Report - ${study.accessionNumber}`} author="Medical Center HIS">
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.facilityName}>Medical Center HIS</Text>
            <Text style={styles.facilityInfo}>Department of Radiology & Diagnostic Imaging</Text>
            <Text style={styles.facilityInfo}>Tel: +1 (555) 200-0000 · Fax: +1 (555) 200-0001</Text>
            <Text style={styles.facilityInfo}>123 Medical Center Drive, City, State 00000</Text>
          </View>
          <View style={styles.reportTitleBlock}>
            <Text style={styles.reportTitle}>RADIOLOGY REPORT</Text>
            <Text style={styles.accession}>{study.accessionNumber}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderWidth: 1, borderColor: statusStyle.border }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{report.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* ── Critical findings banner ── */}
        {report.criticalFindings && (
          <View style={styles.criticalBanner}>
            <Text style={styles.criticalText}>⚠  CRITICAL FINDING — Immediate clinical correlation required</Text>
          </View>
        )}

        {/* ── Patient & Study info grid ── */}
        <View style={styles.infoGrid}>
          {/* Patient info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Patient Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{study.patient.fullName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>MRN:</Text>
              <Text style={styles.infoValue}>{study.patient.mrn}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>DOB:</Text>
              <Text style={styles.infoValue}>{study.patient.dob}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Age / Sex:</Text>
              <Text style={styles.infoValue}>{study.patient.age} y / {study.patient.gender === 'M' ? 'Male' : 'Female'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Blood Type:</Text>
              <Text style={styles.infoValue}>{study.patient.bloodType}</Text>
            </View>
            {study.patient.allergies.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Allergies:</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', flex: 1 }}>
                  {study.patient.allergies.map((a, i) => (
                    <View key={i} style={styles.allergyBadge}>
                      <Text style={styles.allergyText}>{a}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Study info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Study Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Study:</Text>
              <Text style={styles.infoValue}>{study.description}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Modality:</Text>
              <Text style={styles.infoValue}>{study.modality}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Body Part:</Text>
              <Text style={styles.infoValue}>{study.bodyPart}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date / Time:</Text>
              <Text style={styles.infoValue}>{study.studyDate} {study.studyTime}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ordering:</Text>
              <Text style={styles.infoValue}>{study.orderingPhysician}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Department:</Text>
              <Text style={styles.infoValue}>{study.referringDepartment}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{study.patientLocation}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Priority:</Text>
              <Text style={[styles.infoValue, study.priority === 'STAT' ? { color: '#dc2626' } : {}]}>{study.priority}</Text>
            </View>
          </View>
        </View>

        {/* ── Clinical indication ── */}
        <Text style={styles.sectionTitle}>Clinical Indication</Text>
        <Text style={styles.sectionBody}>{study.clinicalHistory || 'Not provided.'}</Text>

        {/* ── Findings ── */}
        <Text style={styles.sectionTitle}>Findings</Text>
        {report.findings
          ? <Text style={styles.sectionBody}>{report.findings}</Text>
          : <Text style={styles.emptySection}>No findings documented.</Text>
        }

        {/* ── Impression ── */}
        <Text style={styles.sectionTitle}>Impression</Text>
        {report.impression
          ? <Text style={styles.sectionBody}>{report.impression}</Text>
          : <Text style={styles.emptySection}>No impression documented.</Text>
        }

        {/* ── Recommendations ── */}
        {report.recommendations && (
          <>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            <Text style={styles.sectionBody}>{report.recommendations}</Text>
          </>
        )}

        {/* ── RADS score ── */}
        {report.radsScore && (
          <>
            <Text style={styles.sectionTitle}>RADS Scoring</Text>
            <View style={styles.radsBox}>
              <Text style={styles.radsScore}>{report.radsScore.score}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.radsSystem}>{report.radsScore.system}</Text>
                <Text style={styles.radsDescriptor}>{report.radsScore.descriptor}</Text>
                <Text style={styles.radsRec}>Recommendation: {report.radsScore.recommendation}</Text>
              </View>
            </View>
          </>
        )}

        {/* ── Attached Images ── */}
        {images.length > 0 && (
          <>
            <Text style={styles.imagesSectionTitle}>Representative Images ({images.length})</Text>
            <View style={styles.imagesGrid}>
              {images.map((img) => (
                <View key={img.id} style={styles.imageItem}>
                  <Image src={img.dataUrl} style={styles.imageImg} />
                  {img.caption ? (
                    <View style={styles.imageCaptionBox}>
                      <Text style={styles.imageCaption}>{img.caption}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Signature ── */}
        {report.signedBy && (
          <View style={styles.signatureBox}>
            <View style={styles.signatureLeft}>
              <View style={styles.signatureLine} />
              <Text style={styles.signedBy}>✓ Electronically Signed: {report.signedBy}</Text>
              <Text style={styles.signedAt}>
                Signed: {report.signedAt ? new Date(report.signedAt).toLocaleString() : '—'}
              </Text>
            </View>
            <View style={styles.signatureVerified}>
              <Text style={styles.verifiedText}>Verified Final Report</Text>
            </View>
          </View>
        )}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Patient: {study.patient.fullName} · MRN: {study.patient.mrn} · Acc: {study.accessionNumber}
          </Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages} · Generated: ${new Date().toLocaleString()}`
          } />
        </View>
      </Page>
    </Document>
  );
}

// ─── PDF Viewer wrapper ───────────────────────────────────────────────────────
interface RadiologyReportViewerProps {
  study: Study;
  report: RadiologyReport;
  images: ReportImage[];
}

export function RadiologyReportViewer({ study, report, images }: RadiologyReportViewerProps) {
  return (
    <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
      <RadiologyReportDocument study={study} report={report} images={images} />
    </PDFViewer>
  );
}

// ─── Download link wrapper ────────────────────────────────────────────────────
interface RadiologyReportDownloadProps {
  study: Study;
  report: RadiologyReport;
  images: ReportImage[];
  children: React.ReactNode;
}

export function RadiologyReportDownload({ study, report, images, children }: RadiologyReportDownloadProps) {
  const filename = `RAD-${study.accessionNumber}-${study.patient.mrn}.pdf`;
  return (
    <PDFDownloadLink
      document={<RadiologyReportDocument study={study} report={report} images={images} />}
      fileName={filename}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => loading ? 'Preparing PDF…' : children}
    </PDFDownloadLink>
  );
}
