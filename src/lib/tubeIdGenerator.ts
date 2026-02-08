// Tube ID Generator for Lab Interfacing
// Generates unique barcodes for sample tubes

const TUBE_PREFIXES: Record<string, string> = {
  'EDTA Blood': 'ED',
  'Serum': 'SR',
  'Plasma': 'PL',
  'Urine': 'UR',
  'Stool': 'ST',
  'CSF': 'CS',
  'Other': 'OT',
};

export function generateTubeId(sampleType: string): string {
  const prefix = TUBE_PREFIXES[sampleType] || 'XX';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export function generateBatchTubeIds(sampleTypes: string[]): Map<string, string[]> {
  const result = new Map<string, string[]>();
  
  sampleTypes.forEach(type => {
    const existing = result.get(type) || [];
    existing.push(generateTubeId(type));
    result.set(type, existing);
  });
  
  return result;
}

// Validate tube ID format
export function isValidTubeId(tubeId: string): boolean {
  return /^[A-Z]{2}[A-Z0-9]{8,12}$/.test(tubeId);
}
