import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import AuditLog from './components/AuditLog';
import Login from './components/Login';
import Register from './components/Register';
import IntakeModal from './components/IntakeModal';
import Review from './components/Review';
import Settings from './components/Settings';
import History from './components/History';
import { Screen } from './types';

function AppContent() {
  const navigate = useNavigate();
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);

  const handleNavigate = (screen: Screen) => {
    switch (screen) {
      case 'landing': navigate('/'); break;
      case 'login': navigate('/login'); break;
      case 'register': navigate('/register'); break;
      case 'dashboard': navigate('/dashboard'); break;
      case 'history': navigate('/history'); break;
      case 'intake': setIsIntakeModalOpen(true); break;
      case 'review': navigate('/review'); break;
      case 'audit': navigate('/audit'); break;
      case 'settings': navigate('/settings'); break;
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
        <Route path="/dashboard" element={<Dashboard onNavigate={handleNavigate} />} />
        <Route path="/history" element={<History onNavigate={handleNavigate} />} />
        <Route path="/review" element={<Review onNavigate={handleNavigate} />} />
        <Route path="/audit" element={<AuditLog onNavigate={handleNavigate} />} />
        <Route path="/settings" element={<Settings onNavigate={handleNavigate} />} />
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
