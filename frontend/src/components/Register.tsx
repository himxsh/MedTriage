import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { bootstrapRegister } from '../api';
import type { Screen } from '../types';

interface RegisterProps {
  onNavigate: (screen: Screen) => void;
}

export default function Register({ onNavigate }: RegisterProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await bootstrapRegister({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: 'admin',
      });
      onNavigate('queue');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
    setBusy(false);
  };

  return (
    <div className="app-ui min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8 cursor-pointer" onClick={() => onNavigate('landing')}>
          <h2 className="text-xl font-semibold tracking-tight text-syncra-ink">MedTriage</h2>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="syncra-card p-8">
          <h1 className="text-2xl font-medium text-syncra-ink mb-2">First-time setup</h1>
          <p className="text-sm text-syncra-muted mb-6">
            Creates the first org admin when no users exist. After that, only admins can invite clinicians.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="name@hospital.in"
                />
              </div>
            </div>
            <div>
              <label className="syncra-label">Password (min 8)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-syncra-muted" />
                </div>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="syncra-input !pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            {error && <p className="text-sm text-syncra-down">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="syncra-btn-primary w-full !py-3 cursor-pointer active:scale-[0.98] disabled:opacity-60"
            >
              <span>{busy ? 'Creating…' : 'Create admin'}</span>
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
