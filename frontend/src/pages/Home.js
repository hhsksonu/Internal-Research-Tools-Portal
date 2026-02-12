// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const features = [
  {
    icon: '📄',
    title: 'Upload Documents',
    desc: 'Drag & drop PDF or TXT financial documents. We securely handle the rest.',
    link: '/upload',
    linkText: 'Upload now',
  },
  {
    icon: '📊',
    title: 'Financial Extraction',
    desc: 'Extract 10–15 core income statement line items across multiple years into a clean Excel file.',
    link: '/financial-extraction',
    linkText: 'Run extraction',
  },
  {
    icon: '🎙️',
    title: 'Earnings Summary',
    desc: 'Get structured summaries of earnings calls: management tone, key positives, concerns, guidance.',
    link: '/earnings-summary',
    linkText: 'Summarize call',
  },
];

const steps = [
  { step: '01', label: 'Upload', desc: 'Upload one or more financial PDFs or TXT files.' },
  { step: '02', label: 'Choose Tool', desc: 'Pick Financial Extraction or Earnings Summary.' },
  { step: '03', label: 'Get Results', desc: 'Download Excel or review the structured JSON report.' },
];

export default function Home() {
  return (
    <div className="home">
      {/* Background grid decoration */}
      <div className="home__bg-grid" aria-hidden="true" />

      {/* Hero */}
      <section className="home__hero container">
        <div className="home__hero-eyebrow">
          <span className="home__eyebrow-dot" />
          AI-Powered Research Tools
        </div>
        <h1 className="home__hero-title">
          Analyze financial documents
          <span className="home__hero-title-accent"> in seconds</span>
        </h1>
        <p className="home__hero-subtitle">
          Upload earnings reports and financial statements. Extract structured data or
          generate management tone summaries — no manual work required.
        </p>
        <div className="home__hero-actions">
          <Link to="/upload" className="btn btn--primary">
            Start Analyzing
          </Link>
          <Link to="/financial-extraction" className="btn btn--ghost">
            View Tools →
          </Link>
        </div>

        {/* Terminal badge */}
        <div className="home__hero-badge">
          <span className="home__hero-badge-dot" />
          <span className="home__hero-badge-text">API running on localhost:8000</span>
        </div>
      </section>

      {/* Feature cards */}
      <section className="home__features">
        <div className="container">
          <div className="home__features-grid">
            {features.map((feat) => (
              <div className="home__feature-card" key={feat.title}>
                <div className="home__feature-icon">{feat.icon}</div>
                <h3 className="home__feature-title">{feat.title}</h3>
                <p className="home__feature-desc">{feat.desc}</p>
                <Link to={feat.link} className="home__feature-link">
                  {feat.linkText} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="home__steps">
        <div className="container">
          <h2 className="home__section-title">How it works</h2>
          <div className="home__steps-row">
            {steps.map((s, i) => (
              <React.Fragment key={s.step}>
                <div className="home__step">
                  <div className="home__step-number">{s.step}</div>
                  <div className="home__step-label">{s.label}</div>
                  <div className="home__step-desc">{s.desc}</div>
                </div>
                {i < steps.length - 1 && <div className="home__step-arrow">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="home__cta-banner">
        <div className="container">
          <div className="home__cta-inner">
            <div>
              <h2 className="home__cta-title">Ready to get started?</h2>
              <p className="home__cta-sub">Upload your first document and get results in under 30 seconds.</p>
            </div>
            <Link to="/upload" className="btn btn--primary btn--lg">
              Upload Document
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
