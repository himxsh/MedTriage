import React, { useState } from 'react';
import { LayoutGrid, Lock, Mail, User, Shield, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background-linen">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-4 mb-12 cursor-pointer" onClick={() => onNavigate('landing')}>
          <LayoutGrid className="w-10 h-10 text-primary" />
          <h2 className="text-4xl font-bold tracking-tighter font-mono uppercase">MEDTRIAGE</h2>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="border border-black/10 bg-white p-8 md:p-12 shadow-md">
          <h1 className="font-sans text-3xl font-bold mb-2 text-black text-balance">Registration</h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-black/50 group-focus-within:text-primary transition-colors" />
                </div>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full pl-10 pr-4 py-4 border border-black/20 outline-none font-mono text-sm focus:bg-primary/5 transition-colors placeholder:text-black/20" placeholder="DR. ARTHUR CONAN" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-black/50 group-focus-within:text-primary transition-colors" />
                </div>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-4 border border-black/20 outline-none font-mono text-sm focus:bg-primary/5 transition-colors placeholder:text-black/20" placeholder="name@institute.edu" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60">Clinician ID</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-4 w-4 text-black/50 group-focus-within:text-primary transition-colors" />
                </div>
                <input type="text" required value={formData.clinicianId} onChange={(e) => setFormData({ ...formData, clinicianId: e.target.value })} className="w-full pl-10 pr-4 py-4 border border-black/20 outline-none font-mono text-sm focus:bg-primary/5 transition-colors placeholder:text-black/20 uppercase" placeholder="MED-D042-X" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60">Professional Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-4 border border-black/20 outline-none font-mono text-sm focus:bg-primary/5 transition-colors bg-white cursor-pointer">
                <option value="Nurse">Nurse</option>
                <option value="Doctor">Doctor</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-black/60">Create Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-black/50 group-focus-within:text-primary transition-colors" />
                </div>
                <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 pr-4 py-4 border border-black/20 outline-none font-mono text-sm focus:bg-primary/5 transition-colors placeholder:text-black/20" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" className="md:col-span-2 w-full flex items-center justify-between border border-black/20 bg-black text-white px-6 py-5 font-mono font-bold uppercase hover:bg-primary hover:text-white transition-colors active:scale-[0.96] group cursor-pointer">
              <span>Submit</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          <div className="mt-12 pt-8 border-t-2 border-black/10 flex flex-col items-center gap-4">
            <p className="font-mono text-[10px] uppercase text-black/60">Already have an account?</p>
            <button onClick={() => onNavigate('login')} className="w-full border border-black/20 bg-transparent text-black px-6 py-4 font-mono font-bold uppercase hover:bg-black hover:text-white transition-colors active:scale-[0.96] cursor-pointer">Log In</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
