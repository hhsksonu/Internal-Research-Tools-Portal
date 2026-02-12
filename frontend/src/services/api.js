// src/services/api.js
// Central API service for all backend calls

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Upload files to the backend
 * @param {FileList|File[]} files
 * @returns {Promise<{ message: string, files: Array }>}
 */
export async function uploadFiles(files) {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Upload failed (${response.status})`);
  }

  return response.json();
}

/**
 * Get list of currently uploaded files
 * @returns {Promise<{ files: Array }>}
 */
export async function getUploadedFiles() {
  const response = await fetch(`${BASE_URL}/files`);
  if (!response.ok) throw new Error('Could not fetch file list');
  return response.json();
}

/**
 * Run Financial Extraction tool
 * Downloads the Excel file blob
 * @returns {Promise<Blob>}
 */
export async function runFinancialExtraction() {
  const response = await fetch(`${BASE_URL}/tools/financial-extraction`, {
    method: 'POST',
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Extraction failed (${response.status})`);
  }

  return response.blob();
}

/**
 * Run Earnings Summary tool
 * @returns {Promise<Object>} Structured JSON summary
 */
export async function runEarningsSummary() {
  const response = await fetch(`${BASE_URL}/tools/earnings-summary`, {
    method: 'POST',
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Summary failed (${response.status})`);
  }

  return response.json();
}

/**
 * Trigger browser download from a Blob
 * @param {Blob} blob
 * @param {string} filename
 */
export function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
