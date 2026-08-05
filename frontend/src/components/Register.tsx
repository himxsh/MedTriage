import React, { useState } from 'react';
import { Lock, Mail, User, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { saveClinician } from '../api';
import type { Screen } from '../types';

interface RegisterProps {
  onNavigate: (screen: Screen) => void;
}

export default function Register({ onNavigate }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    clinicianId: '',
    role: 'Nurse',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveClinician(formData.name, formData.clinicianId);
    onNavigate('queue');
  };

  return (
    <div className="app-ui min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center mb-8 cursor-pointer" onClick={() => onNavigate('landing')}>
          <h2 className="text-xl font-semibold tracking-tight text-syncra-ink">MedTriage</h2>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="syncra-card p-8">
          <h1 className="text-2xl font-medium text-syncra-ink mb-6">Registration</h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            <div>
              <label className="syncra-label">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-syncra-muted" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="syncra-input !pl-10"
                  placeholder="Dr. Arthur Conan"
                />
              </div>
            </div>
            <div>
              <label className="syncra-label">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-syncra-muted" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="syncra-input !pl-10"
                  placeholder="name@institute.edu"
                />
              </div>
            </div>
            <div>
              <label className="syncra-label">Clinician ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-4 w-4 text-syncra-muted" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.clinicianId}
                  onChange={(e) => setFormData({ ...formData, clinicianId: e.target.value })}
                  className="syncra-input !pl-10 uppercase"
                  placeholder="MED-D042-X"
                />
              </div>
            </div>
            <div>
              <label className="syncra-label">Professional Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="syncra-input cursor-pointer"
              >
                <option value="Nurse">Nurse</option>
                <option value="Doctor">Doctor</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="syncra-label">Create Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-syncra-muted" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="syncra-input !pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" className="md:col-span-2 syncra-btn-primary w-full !py-3 cursor-pointer active:scale-[0.98]">
              <span>Submit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-syncra-border flex flex-col items-center gap-3">
            <p className="text-xs text-syncra-muted">Already have an account?</p>
            <button onClick={() => onNavigate('login')} className="syncra-btn-ghost w-full cursor-pointer">
              Log In
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
