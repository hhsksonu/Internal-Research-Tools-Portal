// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const { uploadedFiles } = useAppContext();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">▲</span>
          <span className="navbar__logo-text">
            Internal Research<span className="navbar__logo-accent"> Tool Portal</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <ul className="navbar__links">
          <li>
            <Link to="/" className={`navbar__link${isActive('/') ? ' navbar__link--active' : ''}`}>
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/upload"
              className={`navbar__link${isActive('/upload') ? ' navbar__link--active' : ''}`}
            >
              Upload
              {uploadedFiles.length > 0 && (
                <span className="navbar__badge">{uploadedFiles.length}</span>
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/financial-extraction"
              className={`navbar__link${isActive('/financial-extraction') ? ' navbar__link--active' : ''}`}
            >
              Financials
            </Link>
          </li>
          <li>
            <Link
              to="/earnings-summary"
              className={`navbar__link${isActive('/earnings-summary') ? ' navbar__link--active' : ''}`}
            >
              Earnings
            </Link>
          </li>
        </ul>

        {/* CTA */}
        <Link to="/upload" className="navbar__cta">
          Get Started
        </Link>

        {/* Hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile${menuOpen ? ' navbar__mobile--open' : ''}`}>
        <ul>
          <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
          <li>
            <Link to="/upload" className={isActive('/upload') ? 'active' : ''}>
              Upload {uploadedFiles.length > 0 && `(${uploadedFiles.length})`}
            </Link>
          </li>
          <li>
            <Link to="/financial-extraction" className={isActive('/financial-extraction') ? 'active' : ''}>
              Financial Extraction
            </Link>
          </li>
          <li>
            <Link to="/earnings-summary" className={isActive('/earnings-summary') ? 'active' : ''}>
              Earnings Summary
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
