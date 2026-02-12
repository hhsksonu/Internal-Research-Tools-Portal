// src/components/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__left">
          <span className="footer__logo">
            <span className="footer__logo-icon">▲</span>
            Research<span className="footer__logo-accent">Portal</span>
          </span>
          <p className="footer__tagline">
            AI-powered financial document analysis
          </p>
        </div>

        <div className="footer__links">
          <Link to="/">Home</Link>
          <Link to="/upload">Upload</Link>
          <Link to="/financial-extraction">Financials</Link>
          <Link to="/earnings-summary">Earnings</Link>
        </div>

        <div className="footer__right">
          <span className="footer__version">v1.0.0</span>
        </div>
      </div>
    </footer>
  );
}
