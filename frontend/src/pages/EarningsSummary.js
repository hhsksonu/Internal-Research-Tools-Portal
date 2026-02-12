// src/pages/EarningsSummary.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { runEarningsSummary } from '../services/api';
import { useAppContext } from '../context/AppContext';
import './ToolPage.css';
import './EarningsSummary.css';

const TONE_COLORS = {
  optimistic: '#10b981',
  'cautiously optimistic': '#06b6d4',
  neutral: '#94a3b8',
  cautious: '#f59e0b',
  pessimistic: '#ef4444',
};

const CONFIDENCE_LABELS = {
  high: { label: 'High', color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  low: { label: 'Low', color: '#ef4444' },
};

function ToneBadge({ tone }) {
  const color = TONE_COLORS[tone] || '#94a3b8';
  return (
    <span
      className="tone-badge"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}40`,
        color,
      }}
    >
      {tone}
    </span>
  );
}

function PointList({ items, variant }) {
  if (!items || items.length === 0) return <p className="earnings__empty">Not mentioned</p>;
  return (
    <ul className={`earnings__point-list earnings__point-list--${variant}`}>
      {items.map((item, i) => (
        <li key={i} className="earnings__point-item">
          <span className="earnings__point-dot" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function EarningsSummary() {
  const { uploadedFiles, uploadStatus } = useAppContext();
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [summary, setSummary] = useState(null);

  const hasFiles = uploadedFiles.length > 0 && uploadStatus === 'success';

  const handleRun = async () => {
    setStatus('running');
    setErrorMsg('');
    setSummary(null);

    try {
      const result = await runEarningsSummary();
      setSummary(result);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'An unexpected error occurred.');
    }
  };

  const handleCopyJson = () => {
    if (!summary) return;
    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
  };

  return (
    <div className="tool-page">
      <div className="container">
        {/* Header */}
        <div className="tool-page__header">
          <div className="tool-page__breadcrumb">
            <Link to="/">Home</Link> / <span>Earnings Summary</span>
          </div>
          <h1 className="tool-page__title">Earnings Call Summary</h1>
          <p className="tool-page__subtitle">
            Analyzes earnings call transcripts and management discussions to extract tone,
            key highlights, concerns, guidance, and growth initiatives.
          </p>
        </div>

        {/* Info cards */}
        <div className="tool-page__info-grid">
          <div className="tool-page__info-card">
            <div className="tool-page__info-icon">📋</div>
            <div className="tool-page__info-label">Output Format</div>
            <div className="tool-page__info-value">Structured JSON</div>
          </div>
          <div className="tool-page__info-card">
            <div className="tool-page__info-icon">🎭</div>
            <div className="tool-page__info-label">Tone Analysis</div>
            <div className="tool-page__info-value">Sentiment scoring</div>
          </div>
          <div className="tool-page__info-card">
            <div className="tool-page__info-icon">🔍</div>
            <div className="tool-page__info-label">Key Sections</div>
            <div className="tool-page__info-value">5 categories</div>
          </div>
          <div className="tool-page__info-card">
            <div className="tool-page__info-icon">🤖</div>
            <div className="tool-page__info-label">Engine</div>
            <div className="tool-page__info-value">GPT-4o-mini</div>
          </div>
        </div>

        {/* Run panel */}
        <div className="tool-page__run-panel">
          {!hasFiles ? (
            <div className="tool-page__no-files">
              <div className="tool-page__no-files-icon">⚠️</div>
              <div>
                <strong>No files uploaded yet</strong>
                <p>Please upload your documents before running the summary.</p>
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
                      Analyzing...
                    </>
                  ) : (
                    '▶ Run Earnings Summary'
                  )}
                </button>
              )}

              {/* Progress indicator */}
              {status === 'running' && (
                <div className="tool-page__progress">
                  <div className="tool-page__progress-bar">
                    <div className="tool-page__progress-fill" />
                  </div>
                  <span>Analyzing earnings call transcript…</span>
                </div>
              )}

              {/* Error */}
              {status === 'error' && (
                <div className="tool-page__result tool-page__result--error">
                  <div className="tool-page__result-header">
                    <span className="tool-page__result-icon">❌</span>
                    <div>
                      <strong>Analysis Failed</strong>
                      <p>{errorMsg}</p>
                    </div>
                  </div>
                  <button className="btn btn--ghost" onClick={() => setStatus('idle')} style={{ marginTop: '12px' }}>
                    Try Again
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Results */}
        {status === 'success' && summary && (
          <div className="earnings__results">
            {/* Result header */}
            <div className="earnings__results-header">
              <h2 className="earnings__results-title">Analysis Results</h2>
              <div className="earnings__results-actions">
                <button className="btn btn--ghost" onClick={handleCopyJson}>
                  Copy JSON
                </button>
                <button className="btn btn--ghost" onClick={() => setStatus('idle')}>
                  Run Again
                </button>
              </div>
            </div>

            {/* Source files */}
            {summary.source_files?.length > 0 && (
              <div className="earnings__source">
                <span className="earnings__source-label">Source:</span>
                {summary.source_files.map((f) => (
                  <span className="tool-page__file-chip" key={f}>{f}</span>
                ))}
              </div>
            )}

            {/* Tone + Confidence row */}
            <div className="earnings__overview-row">
              <div className="earnings__overview-card">
                <div className="earnings__overview-label">Management Tone</div>
                <ToneBadge tone={summary.management_tone} />
              </div>
              <div className="earnings__overview-card">
                <div className="earnings__overview-label">Analysis Confidence</div>
                <span
                  className="tone-badge"
                  style={{
                    background: `${CONFIDENCE_LABELS[summary.confidence_level]?.color || '#94a3b8'}18`,
                    border: `1px solid ${CONFIDENCE_LABELS[summary.confidence_level]?.color || '#94a3b8'}40`,
                    color: CONFIDENCE_LABELS[summary.confidence_level]?.color || '#94a3b8',
                  }}
                >
                  {CONFIDENCE_LABELS[summary.confidence_level]?.label || summary.confidence_level}
                </span>
              </div>
            </div>

            {/* Key positives */}
            <div className="earnings__section">
              <div className="earnings__section-header earnings__section-header--positive">
                <span>✅</span> Key Positives
              </div>
              <div className="earnings__section-body">
                <PointList items={summary.key_positives} variant="positive" />
              </div>
            </div>

            {/* Key concerns */}
            <div className="earnings__section">
              <div className="earnings__section-header earnings__section-header--concern">
                <span>⚠️</span> Key Concerns
              </div>
              <div className="earnings__section-body">
                <PointList items={summary.key_concerns} variant="concern" />
              </div>
            </div>

            {/* Growth initiatives */}
            <div className="earnings__section">
              <div className="earnings__section-header earnings__section-header--initiative">
                <span>🚀</span> Growth Initiatives
              </div>
              <div className="earnings__section-body">
                <PointList items={summary.growth_initiatives} variant="initiative" />
              </div>
            </div>

            {/* Forward guidance */}
            <div className="earnings__section">
              <div className="earnings__section-header earnings__section-header--guidance">
                <span>📅</span> Forward Guidance
              </div>
              <div className="earnings__section-body">
                <p className="earnings__guidance-text">
                  {summary.forward_guidance || 'Not mentioned'}
                </p>
              </div>
            </div>

            {/* Capacity utilization */}
            <div className="earnings__section">
              <div className="earnings__section-header earnings__section-header--capacity">
                <span>⚙️</span> Capacity Utilization
              </div>
              <div className="earnings__section-body">
                <p className="earnings__guidance-text">
                  {summary.capacity_utilization_trends || 'Not mentioned'}
                </p>
              </div>
            </div>

            {/* Raw JSON toggle */}
            <details className="earnings__raw-json">
              <summary>View raw JSON response</summary>
              <pre>{JSON.stringify(summary, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}
