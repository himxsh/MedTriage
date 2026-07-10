import React, { useState } from 'react';
import { LayoutGrid, Lock, Mail, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background-linen">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-4 mb-12 cursor-pointer" onClick={() => onNavigate('landing')}>
          <LayoutGrid className="w-10 h-10 text-primary" />
          <h2 className="text-4xl font-bold tracking-tighter font-mono uppercase">MEDTRIAGE</h2>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-black bg-white p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="font-bebas text-5xl mb-2 tracking-wide text-balance">LOGIN</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60">Clinician ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-black/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full pl-10 pr-4 py-4 border-2 border-black outline-none font-mono text-sm focus:bg-primary/5 transition-colors placeholder:text-black/20" placeholder="Clinician ID" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-black/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-4 border-2 border-black outline-none font-mono text-sm focus:bg-primary/5 transition-colors placeholder:text-black/20" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="w-full flex items-center justify-between border-2 border-black bg-black text-white px-6 py-5 font-mono font-bold uppercase hover:bg-primary hover:border-primary transition-colors transition-transform active:scale-[0.96] group cursor-pointer">
              <span>Authenticate</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          <div className="mt-12 pt-8 border-t-2 border-black/10 flex flex-col items-center gap-4">
            <p className="font-mono text-[10px] uppercase text-black/40">Don't have an account?</p>
            <button onClick={() => onNavigate('register')} className="w-full border-2 border-black bg-transparent text-black px-6 py-4 font-mono font-bold uppercase hover:bg-black hover:text-white transition-colors active:scale-[0.96] cursor-pointer">Register Here</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
