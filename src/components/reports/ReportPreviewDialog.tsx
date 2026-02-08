import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Printer, X } from 'lucide-react';
import { LabReportViewer, LabReportDownload } from './LabReportPDF';
import type { Case } from '@/types/lab';

interface ReportPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  caseData: Case | null;
}

export function ReportPreviewDialog({ open, onClose, caseData }: ReportPreviewDialogProps) {
  if (!caseData) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>
              Report Preview - {caseData.caseNumber}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <LabReportDownload caseData={caseData}>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-1" />
                  Download PDF
                </Button>
              </LabReportDownload>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 overflow-auto" style={{ height: 'calc(90vh - 140px)' }}>
          <LabReportViewer caseData={caseData} />
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
