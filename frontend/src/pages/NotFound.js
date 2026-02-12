// src/pages/NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound__code">404</div>
      <h1 className="notfound__title">Page not found</h1>
      <p className="notfound__desc">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn--primary">
        ← Back to Home
      </Link>
    </div>
  );
}
