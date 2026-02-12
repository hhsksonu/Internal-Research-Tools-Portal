// src/context/AppContext.js
import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Tracks files uploaded in the current session
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null); // 'idle' | 'uploading' | 'success' | 'error'
  const [uploadMessage, setUploadMessage] = useState('');

  const clearUpload = () => {
    setUploadedFiles([]);
    setUploadStatus(null);
    setUploadMessage('');
  };

  return (
    <AppContext.Provider
      value={{
        uploadedFiles,
        setUploadedFiles,
        uploadStatus,
        setUploadStatus,
        uploadMessage,
        setUploadMessage,
        clearUpload,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
}
