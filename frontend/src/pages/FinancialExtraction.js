// src/pages/FinancialExtraction.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { runFinancialExtraction } from '../services/api';
import { useAppContext } from '../context/AppContext';
import './ToolPage.css';

export default function FinancialExtraction() {
  const { uploadedFiles, uploadStatus } = useAppContext();
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [blobRef, setBlobRef] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const hasFiles = uploadedFiles.length > 0 && uploadStatus === 'success';

  // Parse Excel blob to preview (basic parsing)
  const parseExcelPreview = async (blob) => {
    try {
      // For now, just show file info
      // In production, you could use a library like xlsx to parse
      return {
        fileSize: (blob.size / 1024).toFixed(2) + ' KB',
        fileName: 'financial_extraction.xlsx',
        message: 'Excel file generated successfully. Click Download to save.'
      };
    } catch (err) {
      return null;
    }
  };

  const handleRun = async () => {
    setStatus('running');
    setErrorMsg('');
    setPreviewData(null);
    setBlobRef(null);

    try {
      const blob = await runFinancialExtraction();
      setBlobRef(blob);

      // Parse preview
      const preview = await parseExcelPreview(blob);
      setPreviewData(preview);

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'An unexpected error occurred.');
    }
  };

  const handleDownload = () => {
    if (!blobRef) return;

    // Prompt for filename
    const defaultName = `financial_extraction_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filename = prompt('Enter filename:', defaultName);

    if (!filename) return; // User cancelled

    // Download with custom filename
    const url = window.URL.createObjectURL(blobRef);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="tool-page">
      <div className="container">
        {/* Header */}
        <div className="tool-page__header">
          <div className="tool-page__breadcrumb">
            <Link to="/">Home</Link> / <span>Financial Extraction</span>
          </div>
          <h1 className="tool-page__title">Financial Statement Extraction</h1>
          <p className="tool-page__subtitle">
            Extracts 10–15 core income statement line items (Revenue, EBITDA, PAT, etc.)
            across multiple fiscal years and exports them to a structured Excel file.
          </p>
        </div>

        {/* Info cards */}
        <div className="tool-page__info-grid">
          <div className="tool-page__info-card">
            <div className="tool-page__info-icon">📊</div>
            <div className="tool-page__info-label">Output Format</div>
            <div className="tool-page__info-value">Excel (.xlsx)</div>
          </div>
          <div className="tool-page__info-card">
            <div className="tool-page__info-icon">🔢</div>
            <div className="tool-page__info-label">Line Items</div>
            <div className="tool-page__info-value">10–15 items</div>
          </div>
          <div className="tool-page__info-card">
            <div className="tool-page__info-icon">📅</div>
            <div className="tool-page__info-label">Year Columns</div>
            <div className="tool-page__info-value">Auto-detected</div>
          </div>
          <div className="tool-page__info-card">
            <div className="tool-page__info-icon">🤖</div>
            <div className="tool-page__info-label">Fallback</div>
            <div className="tool-page__info-value">LLM (GPT-4o-mini)</div>
          </div>
        </div>

        {/* What gets extracted */}
        <div className="tool-page__section">
          <h3 className="tool-page__section-title">Extracted Line Items</h3>
          <div className="tool-page__tags">
            {[
              'Total Revenue',
              'Other Income',
              'Total Income',
              'Operating Expenses',
              'Cost of Materials',
              'Employee Expenses',
              'Other Expenses',
              'EBITDA',
              'Depreciation',
              'EBIT',
              'Finance Costs',
              'PBT',
              'Tax Expense',
              'PAT',
            ].map((item) => (
              <span className="tool-page__tag" key={item}>{item}</span>
            ))}
          </div>
        </div>

        {/* Important Notes */}
        <div className="tool-page__section">
          <h3 className="tool-page__section-title">Important Notes</h3>
          <div className="tool-page__notes">
            <div className="tool-page__note">
              <span className="tool-page__note-icon">⚠️</span>
              <div>
                <strong>Scanned/Image-Based PDFs:</strong> If the PDF is scanned or image-based,
                the system will detect limited text and return "Not Found" values with explanatory notes.
                This ensures data reliability over attempted guessing.
              </div>
            </div>
            <div className="tool-page__note">
              <span className="tool-page__note-icon">💡</span>
              <div>
                <strong>Best Results:</strong> Use text-based PDFs (not scanned images) for optimal extraction.
                The system uses pattern matching first, with LLM fallback only when needed.
              </div>
            </div>
          </div>
        </div>

        {/* Action area */}
        <div className="tool-page__actions">
          {!hasFiles && (
            <div className="tool-page__no-files">
              <p>No files uploaded yet.</p>
              <Link to="/upload" className="btn btn--primary">
                Upload Documents
              </Link>
            </div>
          )}

          {hasFiles && (
            <>
              <div className="tool-page__uploaded-files">
                <h4>Currently Uploaded:</h4>
                <ul>
                  {uploadedFiles.map((f) => (
                    <li key={f.name}>
                      📄 {f.name} ({(f.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>

              <button
                className={`btn btn--primary btn--lg${status === 'running' ? ' btn--loading' : ''}`}
                onClick={handleRun}
                disabled={status === 'running'}
              >
                {status === 'running' ? (
                  <>
                    <span className="spinner" />
                    Processing...
                  </>
                ) : (
                  'Run Financial Extraction'
                )}
              </button>
            </>
          )}
        </div>

        {/* Success - Preview */}
        {status === 'success' && previewData && (
          <div className="tool-page__result tool-page__result--success">
            <div className="tool-page__result-header">
              <span className="tool-page__result-icon">✅</span>
              <div>
                <h3>Extraction Complete!</h3>
                <p>Your Excel file is ready for download</p>
              </div>
            </div>

            <div className="tool-page__preview">
              <div className="tool-page__preview-info">
                <div className="tool-page__preview-item">
                  <span className="tool-page__preview-label">File Name:</span>
                  <span className="tool-page__preview-value">{previewData.fileName}</span>
                </div>
                <div className="tool-page__preview-item">
                  <span className="tool-page__preview-label">File Size:</span>
                  <span className="tool-page__preview-value">{previewData.fileSize}</span>
                </div>
                <div className="tool-page__preview-item">
                  <span className="tool-page__preview-label">Format:</span>
                  <span className="tool-page__preview-value">Microsoft Excel (.xlsx)</span>
                </div>
              </div>

              <div className="tool-page__preview-message">
                <p>{previewData.message}</p>
                <p className="tool-page__preview-note">
                  📋 The Excel file contains extracted financial data organized by year.
                  If values show "Not Found", the PDF may be image-based or data was not detectable.
                </p>
              </div>

              <div className="tool-page__preview-actions">
                <button
                  className="btn btn--primary btn--lg"
                  onClick={handleDownload}
                >
                  📥 Download Excel File
                </button>
                <button
                  className="btn btn--secondary"
                  onClick={() => {
                    setStatus('idle');
                    setPreviewData(null);
                    setBlobRef(null);
                  }}
                >
                  Run Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className="tool-page__result tool-page__result--error">
            <span className="tool-page__result-icon">❌</span>
            <div>
              <h3>Extraction Failed</h3>
              <p>{errorMsg}</p>
              <button
                className="btn btn--secondary"
                onClick={() => setStatus('idle')}
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* How it works */}
        <div className="tool-page__section">
          <h3 className="tool-page__section-title">How It Works</h3>
          <div className="tool-page__steps">
            <div className="tool-page__step">
              <div className="tool-page__step-number">1</div>
              <div className="tool-page__step-content">
                <h4>Text Extraction</h4>
                <p>Extracts text from uploaded PDF files using PyPDF2</p>
              </div>
            </div>
            <div className="tool-page__step">
              <div className="tool-page__step-number">2</div>
              <div className="tool-page__step-content">
                <h4>Detection</h4>
                <p>Detects if PDF is text-based or image-based (scanned)</p>
              </div>
            </div>
            <div className="tool-page__step">
              <div className="tool-page__step-number">3</div>
              <div className="tool-page__step-content">
                <h4>Pattern Matching</h4>
                <p>Uses keywords and regex to find financial line items</p>
              </div>
            </div>
            <div className="tool-page__step">
              <div className="tool-page__step-number">4</div>
              <div className="tool-page__step-content">
                <h4>LLM Fallback</h4>
                <p>If pattern matching finds {'<'}20% data, uses GPT-4o-mini</p>
              </div>
            </div>
            <div className="tool-page__step">
              <div className="tool-page__step-number">5</div>
              <div className="tool-page__step-content">
                <h4>Excel Output</h4>
                <p>Generates structured Excel with years as columns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Limitations */}
        <div className="tool-page__section">
          <h3 className="tool-page__section-title">Known Limitations</h3>
          <div className="tool-page__limitations">
            <div className="tool-page__limitation">
              <strong>Image-Based PDFs:</strong> Scanned documents without embedded text will return
              "Not Found" values. This is by design to avoid unreliable extraction or hallucination.
            </div>
            <div className="tool-page__limitation">
              <strong>Complex Formats:</strong> Highly customized or non-standard financial statements
              may have lower extraction accuracy.
            </div>
            <div className="tool-page__limitation">
              <strong>Multi-Currency:</strong> System detects one primary currency per document.
              Multi-currency statements may need manual review.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}