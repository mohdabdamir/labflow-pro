// ZPL Label Generator for 2x1 inch labels on Zebra ZDesigner printers

export interface LabelData {
  patientName: string;
  patientId: string;
  caseNumber: string;
  dateCreated: string;
  tubeId: string;
  sampleType: string;
}

/**
 * Generate ZPL code for a 2x1 inch label
 * 203 DPI: 2" = 406 dots, 1" = 203 dots
 */
export function generateZPL(data: LabelData): string {
  const { patientName, patientId, caseNumber, dateCreated, tubeId, sampleType } = data;
  
  // Truncate patient name if too long
  const name = patientName.length > 20 ? patientName.substring(0, 20) : patientName;
  const dateStr = new Date(dateCreated).toLocaleDateString('en-US', { 
    month: '2-digit', day: '2-digit', year: '2-digit' 
  });
  
  return [
    '^XA',
    // Label format: 2x1 inch at 203 DPI
    '^PW406',
    '^LL203',
    // Patient Name (top left)
    `^FO10,10^A0N,22,22^FD${name}^FS`,
    // Patient ID (below name)
    `^FO10,35^A0N,18,18^FDID: ${patientId}^FS`,
    // Case Number
    `^FO10,58^A0N,18,18^FD${caseNumber}^FS`,
    // Date
    `^FO10,81^A0N,16,16^FD${dateStr}^FS`,
    // Sample Type
    `^FO10,102^A0N,16,16^FD${sampleType}^FS`,
    // Tube ID text (below barcode area)
    `^FO10,175^A0N,18,18^FD${tubeId}^FS`,
    // 2D Barcode (DataMatrix) - right side
    `^FO280,10^BXN,4,200^FD${tubeId}^FS`,
    '^XZ',
  ].join('\n');
}

/**
 * Generate ZPL for multiple labels
 */
export function generateBatchZPL(labels: LabelData[]): string {
  return labels.map(generateZPL).join('\n');
}

/**
 * Send ZPL to a Zebra printer (demo - opens print dialog)
 * In production, this would send to a network printer via raw TCP or browser print API
 */
export function printZPLLabels(labels: LabelData[]): void {
  const zplCode = generateBatchZPL(labels);
  
  // Create a printable preview window
  const printWindow = window.open('', '_blank', 'width=500,height=600');
  if (!printWindow) {
    // Fallback: download as file
    downloadZPL(labels);
    return;
  }
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>ZPL Label Print - ZDesigner Printer</title>
      <style>
        body { font-family: monospace; padding: 20px; background: #1a1a2e; color: #e0e0e0; }
        h2 { color: #00d4aa; margin-bottom: 5px; }
        .info { color: #888; font-size: 12px; margin-bottom: 20px; }
        .label-preview { 
          border: 2px dashed #444; 
          padding: 12px; 
          margin: 10px 0; 
          background: #fff;
          color: #000;
          width: 300px;
          height: 150px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-size: 11px;
          border-radius: 4px;
        }
        .label-preview .name { font-weight: bold; font-size: 13px; }
        .label-preview .barcode { text-align: right; font-size: 9px; color: #666; }
        .zpl-code { 
          background: #0d0d1a; 
          padding: 15px; 
          border-radius: 8px; 
          white-space: pre-wrap; 
          font-size: 11px;
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #333;
        }
        button { 
          background: #00d4aa; 
          color: #000; 
          border: none; 
          padding: 10px 24px; 
          cursor: pointer; 
          border-radius: 6px;
          font-weight: bold;
          font-size: 14px;
          margin: 5px;
        }
        button:hover { background: #00b894; }
        .actions { margin: 15px 0; }
        @media print { 
          body { background: #fff; color: #000; }
          .no-print { display: none; }
          .zpl-code { border: 1px solid #ccc; }
        }
      </style>
    </head>
    <body>
      <h2>🏷️ ZPL Labels Ready</h2>
      <p class="info">ZDesigner Printer • ${labels.length} label(s) • 2×1 inch</p>
      
      <div class="no-print actions">
        <button onclick="window.print()">🖨️ Print</button>
        <button onclick="copyZPL()">📋 Copy ZPL</button>
      </div>
      
      <h3>Label Previews:</h3>
      ${labels.map(l => `
        <div class="label-preview">
          <div>
            <div class="name">${l.patientName}</div>
            <div>ID: ${l.patientId}</div>
            <div>${l.caseNumber}</div>
            <div>${new Date(l.dateCreated).toLocaleDateString()}</div>
            <div>${l.sampleType}</div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:flex-end;">
            <div style="font-family:monospace;font-weight:bold;">${l.tubeId}</div>
            <div class="barcode">[2D Barcode]</div>
          </div>
        </div>
      `).join('')}
      
      <h3>ZPL Code:</h3>
      <div class="zpl-code" id="zplCode">${zplCode}</div>
      
      <script>
        function copyZPL() {
          navigator.clipboard.writeText(document.getElementById('zplCode').textContent);
          alert('ZPL code copied to clipboard!');
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Download ZPL as a file
 */
export function downloadZPL(labels: LabelData[]): void {
  const zplCode = generateBatchZPL(labels);
  const blob = new Blob([zplCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `labels-${Date.now()}.zpl`;
  a.click();
  URL.revokeObjectURL(url);
}
