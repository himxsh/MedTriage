import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Docs from './components/Docs';
import AppShell from './components/AppShell';
import Queue from './components/Queue';
import Cases from './components/Cases';
import AuditLog from './components/AuditLog';
import Metrics from './components/Metrics';
import Admin from './components/Admin';
import Account from './components/Account';
import Login from './components/Login';
import Register from './components/Register';
import IntakeModal from './components/IntakeModal';
import ProtectedRoute from './components/ProtectedRoute';
import { getLenis, useLenisRoot } from './lenis';
import { Screen } from './types';

function AppContent() {
  const navigate = useNavigate();
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  useLenisRoot();

  const handleNavigate = (screen: Screen) => {
    switch (screen) {
      case 'landing': navigate('/'); break;
      case 'docs': navigate('/docs'); break;
      case 'login': navigate('/login'); break;
      case 'register': navigate('/register'); break;
      case 'queue': navigate('/queue'); break;
      case 'cases': navigate('/cases'); break;
      case 'intake': setIsIntakeModalOpen(true); break;
      case 'audit': navigate('/audit'); break;
      case 'metrics': navigate('/metrics'); break;
      case 'admin': navigate('/admin'); break;
      case 'account': navigate('/account'); break;
      default: {
        const _exhaustive: never = screen;
        void _exhaustive;
        navigate('/');
      }
    }
    if (screen !== 'intake') {
      getLenis()?.scrollTo(0, { immediate: true });
    }
  };

  return (
    <div className="min-h-screen font-sans bg-background-linen">
      <Routes>
        <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
        <Route path="/docs" element={<Docs onNavigate={handleNavigate} />} />
        <Route path="/login" element={<Login onNavigate={handleNavigate} />} />
        <Route path="/register" element={<Register onNavigate={handleNavigate} />} />
        <Route path="/queue" element={
          <ProtectedRoute>
            <AppShell onNavigate={handleNavigate}><Queue /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/cases" element={
          <ProtectedRoute>
            <AppShell onNavigate={handleNavigate}><Cases /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/audit" element={
          <ProtectedRoute>
            <AppShell onNavigate={handleNavigate}><AuditLog /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/metrics" element={
          <ProtectedRoute>
            <AppShell onNavigate={handleNavigate}><Metrics /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AppShell onNavigate={handleNavigate}><Admin /></AppShell>
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <AppShell onNavigate={handleNavigate}><Account /></AppShell>
          </ProtectedRoute>
        } />
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
