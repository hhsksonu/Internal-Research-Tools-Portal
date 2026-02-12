// src/pages/Upload.js
import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { uploadFiles } from '../services/api';
import { useAppContext } from '../context/AppContext';
import './Upload.css';

const ACCEPTED_TYPES = ['.pdf', '.txt'];
const MAX_FILE_SIZE_MB = 20;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Upload() {
  const { uploadedFiles, setUploadedFiles, uploadStatus, setUploadStatus, uploadMessage, setUploadMessage, clearUpload } =
    useAppContext();

  const [localFiles, setLocalFiles] = useState([]); // files staged locally
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFiles = (files) => {
    const newErrors = [];
    const valid = [];

    Array.from(files).forEach((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ACCEPTED_TYPES.includes(ext)) {
        newErrors.push(`${file.name}: Unsupported format (only PDF/TXT allowed)`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        newErrors.push(`${file.name}: File too large (max ${MAX_FILE_SIZE_MB} MB)`);
        return;
      }
      valid.push(file);
    });

    setErrors(newErrors);
    return valid;
  };

  const addFiles = useCallback(
    (incoming) => {
      const valid = validateFiles(incoming);
      setLocalFiles((prev) => {
        // Deduplicate by name
        const names = new Set(prev.map((f) => f.name));
        const unique = valid.filter((f) => !names.has(f.name));
        return [...prev, ...unique];
      });
    },
    []
  );

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const onFileInputChange = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const removeFile = (name) => {
    setLocalFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleUpload = async () => {
    if (localFiles.length === 0) return;

    setUploading(true);
    setUploadStatus('uploading');
    setUploadMessage('');

    try {
      const result = await uploadFiles(localFiles);
      setUploadedFiles(localFiles);
      setUploadStatus('success');
      setUploadMessage(result.message || `${localFiles.length} file(s) uploaded successfully`);
    } catch (err) {
      setUploadStatus('error');
      setUploadMessage(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = () => {
    setLocalFiles([]);
    setErrors([]);
    clearUpload();
  };

  return (
    <div className="upload-page">
      <div className="container">
        {/* Header */}
        <div className="upload-page__header">
          <h1 className="upload-page__title">Upload Documents</h1>
          <p className="upload-page__subtitle">
            Upload your PDF or TXT financial documents. Files are processed server-side and
            used for the analysis tools.
          </p>
        </div>

        {/* Drop zone */}
        <div
          className={`dropzone${isDragging ? ' dropzone--dragging' : ''}${localFiles.length > 0 ? ' dropzone--has-files' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt"
            onChange={onFileInputChange}
            className="dropzone__input"
            aria-label="File upload input"
          />

          {isDragging ? (
            <div className="dropzone__content">
              <div className="dropzone__icon dropzone__icon--active">↓</div>
              <p className="dropzone__text">Drop files here</p>
            </div>
          ) : (
            <div className="dropzone__content">
              <div className="dropzone__icon">📂</div>
              <p className="dropzone__text">
                <strong>Click to browse</strong> or drag & drop files here
              </p>
              <p className="dropzone__hint">Supports PDF, TXT — up to {MAX_FILE_SIZE_MB}MB per file</p>
            </div>
          )}
        </div>

        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="upload-page__errors">
            {errors.map((err, i) => (
              <div key={i} className="upload-page__error-item">
                <span>⚠️</span> {err}
              </div>
            ))}
          </div>
        )}

        {/* Staged file list */}
        {localFiles.length > 0 && (
          <div className="file-list">
            <div className="file-list__header">
              <span className="file-list__label">
                {localFiles.length} file{localFiles.length !== 1 ? 's' : ''} staged
              </span>
              <button className="file-list__clear-btn" onClick={handleClear}>
                Clear all
              </button>
            </div>

            {localFiles.map((file) => (
              <div key={file.name} className="file-item">
                <div className="file-item__icon">
                  {file.name.endsWith('.pdf') ? '📄' : '📝'}
                </div>
                <div className="file-item__info">
                  <div className="file-item__name">{file.name}</div>
                  <div className="file-item__size">{formatBytes(file.size)}</div>
                </div>
                <button
                  className="file-item__remove"
                  onClick={(e) => { e.stopPropagation(); removeFile(file.name); }}
                  aria-label={`Remove ${file.name}`}
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="file-list__actions">
              <button
                className={`btn btn--primary btn--lg${uploading ? ' btn--loading' : ''}`}
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <span className="spinner" />
                    Uploading...
                  </>
                ) : (
                  <>Upload {localFiles.length} file{localFiles.length !== 1 ? 's' : ''}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Upload status */}
        {uploadStatus === 'success' && (
          <div className="upload-page__status upload-page__status--success">
            <span>✅</span>
            <div>
              <strong>Upload successful!</strong>
              <p>{uploadMessage}</p>
              <div className="upload-page__next-steps">
                <span>Now run:</span>
                <Link to="/financial-extraction" className="btn btn--ghost">
                  Financial Extraction
                </Link>
                <Link to="/earnings-summary" className="btn btn--ghost">
                  Earnings Summary
                </Link>
              </div>
            </div>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="upload-page__status upload-page__status--error">
            <span>❌</span>
            <div>
              <strong>Upload failed</strong>
              <p>{uploadMessage}</p>
            </div>
          </div>
        )}

        {/* Currently uploaded files (from context) */}
        {uploadedFiles.length > 0 && uploadStatus === 'success' && (
          <div className="upload-page__current">
            <h3 className="upload-page__current-title">Currently Active Files</h3>
            <div className="upload-page__current-list">
              {uploadedFiles.map((f) => (
                <div key={f.name} className="upload-page__current-item">
                  <span className="upload-page__current-icon">
                    {f.name.endsWith('.pdf') ? '📄' : '📝'}
                  </span>
                  <span>{f.name}</span>
                  <span className="upload-page__current-size">{formatBytes(f.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
