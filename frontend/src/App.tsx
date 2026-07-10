import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import AppShell from './components/AppShell';
import Queue from './components/Queue';
import Cases from './components/Cases';
import AuditLog from './components/AuditLog';
import Account from './components/Account';
import Login from './components/Login';
import Register from './components/Register';
import IntakeModal from './components/IntakeModal';
import { Screen } from './types';

function AppContent() {
  const navigate = useNavigate();
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  const handleNavigate = (screen: Screen) => {
    switch (screen) {
      case 'landing': navigate('/'); break;
      case 'login': navigate('/login'); break;
      case 'register': navigate('/register'); break;
      case 'queue': navigate('/queue'); break;
      case 'cases': navigate('/cases'); break;
      case 'intake': setIsIntakeModalOpen(true); break;
      case 'audit': navigate('/audit'); break;
      case 'account': navigate('/account'); break;

      default: navigate('/');
    }
    if (screen !== 'intake') {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen font-sans bg-background-linen">
      <Routes>
        <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
        <Route path="/login" element={<Login onNavigate={handleNavigate} />} />
        <Route path="/register" element={<Register onNavigate={handleNavigate} />} />
        <Route path="/queue" element={<AppShell onNavigate={handleNavigate}><Queue /></AppShell>} />
        <Route path="/cases" element={<AppShell onNavigate={handleNavigate}><Cases /></AppShell>} />
        <Route path="/audit" element={<AppShell onNavigate={handleNavigate}><AuditLog /></AppShell>} />
        <Route path="/account" element={<AppShell onNavigate={handleNavigate}><Account /></AppShell>} />
        <Route path="/dashboard" element={<Navigate to="/queue" replace />} />
        <Route path="/history" element={<Navigate to="/cases" replace />} />
        <Route path="/review" element={<Navigate to="/queue" replace />} />
        <Route path="/settings" element={<Navigate to="/account" replace />} />
        <Route path="*" element={<LandingPage onNavigate={handleNavigate} />} />
      </Routes>

      <IntakeModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
