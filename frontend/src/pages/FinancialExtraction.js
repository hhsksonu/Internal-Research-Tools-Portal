// src/pages/FinancialExtraction.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { runFinancialExtraction, downloadBlob } from '../services/api';
import { useAppContext } from '../context/AppContext';
import './ToolPage.css';

export default function FinancialExtraction() {
  const { uploadedFiles, uploadStatus } = useAppContext();
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [downloadReady, setDownloadReady] = useState(false);
  const [blobRef, setBlobRef] = useState(null);

  const hasFiles = uploadedFiles.length > 0 && uploadStatus === 'success';

  const handleRun = async () => {
    setStatus('running');
    setErrorMsg('');
    setDownloadReady(false);

    try {
      const blob = await runFinancialExtraction();
      setBlobRef(blob);
      setStatus('success');
      setDownloadReady(true);

      // Auto-download
      downloadBlob(blob, 'financial_extraction.xlsx');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'An unexpected error occurred.');
    }
  };

  const handleDownloadAgain = () => {
    if (blobRef) downloadBlob(blobRef, 'financial_extraction.xlsx');
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

        {/* Run panel */}
        <div className="tool-page__run-panel">
          {!hasFiles ? (
            <div className="tool-page__no-files">
              <div className="tool-page__no-files-icon">⚠️</div>
              <div>
                <strong>No files uploaded yet</strong>
                <p>Please upload your documents before running the extraction.</p>
                <Link to="/upload" className="btn btn--primary" style={{ marginTop: '14px', display: 'inline-flex' }}>
                  Upload Documents
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* File chips */}
              <div className="tool-page__active-files">
                <span className="tool-page__active-label">Active files:</span>
                {uploadedFiles.map((f) => (
                  <span className="tool-page__file-chip" key={f.name}>
                    {f.name.endsWith('.pdf') ? '📄' : '📝'} {f.name}
                  </span>
                ))}
              </div>

              {/* Run button */}
              {status !== 'success' && (
                <button
                  className={`btn btn--primary btn--lg${status === 'running' ? ' btn--loading' : ''}`}
                  onClick={handleRun}
                  disabled={status === 'running'}
                >
                  {status === 'running' ? (
                    <>
                      <span className="spinner" />
                      Extracting...
                    </>
                  ) : (
                    '▶ Run Financial Extraction'
                  )}
                </button>
              )}

              {/* Progress indicator */}
              {status === 'running' && (
                <div className="tool-page__progress">
                  <div className="tool-page__progress-bar">
                    <div className="tool-page__progress-fill" />
                  </div>
                  <span>Processing documents, this may take a moment…</span>
                </div>
              )}

              {/* Success */}
              {status === 'success' && (
                <div className="tool-page__result tool-page__result--success">
                  <div className="tool-page__result-header">
                    <span className="tool-page__result-icon">✅</span>
                    <div>
                      <strong>Extraction Complete!</strong>
                      <p>Your Excel file was downloaded automatically.</p>
                    </div>
                  </div>
                  <div className="tool-page__result-actions">
                    {downloadReady && (
                      <button className="btn btn--success" onClick={handleDownloadAgain}>
                        ↓ Download Again
                      </button>
                    )}
                    <button
                      className="btn btn--ghost"
                      onClick={() => {
                        setStatus('idle');
                        setDownloadReady(false);
                      }}
                    >
                      Run Again
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {status === 'error' && (
                <div className="tool-page__result tool-page__result--error">
                  <div className="tool-page__result-header">
                    <span className="tool-page__result-icon">❌</span>
                    <div>
                      <strong>Extraction Failed</strong>
                      <p>{errorMsg}</p>
                    </div>
                  </div>
                  <button
                    className="btn btn--ghost"
                    onClick={() => setStatus('idle')}
                    style={{ marginTop: '12px' }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
