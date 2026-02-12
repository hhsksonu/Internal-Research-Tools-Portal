// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Upload from './pages/Upload';
import FinancialExtraction from './pages/FinancialExtraction';
import EarningsSummary from './pages/EarningsSummary';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/financial-extraction" element={<FinancialExtraction />} />
            <Route path="/earnings-summary" element={<EarningsSummary />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}
