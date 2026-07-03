/**
 * File Type Utilities
 * Maps between short file type identifiers (stored in DB) and MIME types
 */

// Short identifier to MIME type mapping
export const FILE_TYPE_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  csv: 'text/csv',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  zip: 'application/zip',
  other: 'application/octet-stream',
};

// MIME type to short identifier mapping
export const MIME_TO_FILE_TYPE: Record<string, string> = Object.entries(
  FILE_TYPE_TO_MIME
).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, {} as Record<string, string>);

/**
 * Get short file type identifier from a File object or MIME type string
 */
export function getFileType(file: File | string): string {
  const mimeType = typeof file === 'string' ? file : file.type;
  
  // Direct lookup
  if (MIME_TO_FILE_TYPE[mimeType]) {
    return MIME_TO_FILE_TYPE[mimeType];
  }
  
  // Partial match for similar types
  const mimeBase = mimeType.split('/')[1] || '';
  
  // Handle special cases
  if (mimeType.includes('word')) return 'docx';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'xlsx';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'pptx';
  if (mimeType.includes('jpeg')) return 'jpeg';
  
  // Return base type if no match
  return mimeBase.substring(0, 10) || 'other';
}

/**
 * Get MIME type from short file type identifier
 */
export function getMimeType(fileType: string): string {
  return FILE_TYPE_TO_MIME[fileType] || 'application/octet-stream';
}

/**
 * Get file extension from short file type identifier
 */
export function getExtension(fileType: string): string {
  return fileType;
}

/**
 * Check if a MIME type is an allowed document type
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return mimeType in MIME_TO_FILE_TYPE;
}

/**
 * Get human-readable file type label
 */
export function getFileTypeLabel(fileType: string): string {
  const labels: Record<string, string> = {
    pdf: 'PDF Document',
    doc: 'Word Document',
    docx: 'Word Document',
    xls: 'Excel Spreadsheet',
    xlsx: 'Excel Spreadsheet',
    ppt: 'PowerPoint Presentation',
    pptx: 'PowerPoint Presentation',
    txt: 'Text File',
    csv: 'CSV File',
    jpg: 'JPEG Image',
    jpeg: 'JPEG Image',
    png: 'PNG Image',
    zip: 'ZIP Archive',
    other: 'Other File',
  };
  
  return labels[fileType] || 'Unknown File';
}

/**
 * Allowed file types for upload
 */
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'application/zip',
];

/**
 * Get file type identifier for upload validation
 */
export function getUploadFileType(file: File): string {
  return getFileType(file);
}