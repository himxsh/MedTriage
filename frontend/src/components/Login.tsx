import React, { useState } from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { saveClinician } from '../api';
import type { Screen } from '../types';

interface LoginProps {
  onNavigate: (screen: Screen) => void;
}

export default function Login({ onNavigate }: LoginProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveClinician(identifier, identifier);
    onNavigate('queue');
  };

  return (
    <div className="app-ui min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8 cursor-pointer" onClick={() => onNavigate('landing')}>
          <h2 className="text-xl font-semibold tracking-tight text-syncra-ink">MedTriage</h2>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="syncra-card p-8">
          <h1 className="text-2xl font-medium text-syncra-ink mb-6">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="syncra-label">Clinician ID</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-syncra-muted" />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="syncra-input !pl-10"
                  placeholder="Clinician ID"
                />
              </div>
            </div>
            <div>
              <label className="syncra-label">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-syncra-muted" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="syncra-input !pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" className="syncra-btn-primary w-full !py-3 cursor-pointer active:scale-[0.98]">
              <span>Authenticate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-syncra-border flex flex-col items-center gap-3">
            <p className="text-xs text-syncra-muted">Don&apos;t have an account?</p>
            <button onClick={() => onNavigate('register')} className="syncra-btn-ghost w-full cursor-pointer">
              Register Here
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
