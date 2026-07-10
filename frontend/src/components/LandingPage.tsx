import React from 'react';
import { LayoutGrid, ShieldCheck, Stethoscope, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';
import { Screen } from '../types';

interface LandingPageProps {
  onNavigate: (screen: Screen) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-10 py-6 brutalist-rule-x bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('landing')}>
          <LayoutGrid className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold tracking-tighter font-mono">MEDTRIAGE</h2>
        </div>
        <div className="hidden md:flex items-center gap-10 font-mono text-sm uppercase">
          <a className="hover:text-primary transition-colors" href="#">Docs</a>
          <button
            onClick={() => onNavigate('login')}
            className="font-bold hover:text-primary transition-colors cursor-pointer"
          >
            LOGIN
          </button>

        </div>
      </header>

      {/* Hero */}
      <main className="flex-grow bg-background-linen">
        <section className="flex flex-col items-center justify-center text-center py-24 md:py-40 px-6 md:px-10 brutalist-rule-x">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
              className="font-bebas text-[90px] md:text-[200px] leading-[0.8] text-black mb-10 tracking-tighter text-balance"
          >
            TRIAGE. <span className="text-primary italic">FASTER.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-black text-lg md:text-3xl mb-16 uppercase tracking-[0.2em] max-w-4xl text-balance"
          >
            Next-generation clinical intelligence for critical care environments.
          </motion.p>
          <div className="flex flex-col md:flex-row gap-6">
            <button
              onClick={() => onNavigate('register')}
              className="group relative inline-flex items-center justify-center border-4 border-black bg-primary px-16 py-6 text-white font-mono text-xl font-bold uppercase transition-colors transition-shadow transition-transform hover:translate-x-2 hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] active:scale-[0.96] cursor-pointer"
            >
              Get Started
            </button>

          </div>
        </section>


        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 brutalist-rule-x bg-black/5">
          <div className="p-12 md:p-20 flex flex-col gap-10 brutalist-rule-y bg-white">
            <ShieldCheck className="text-primary w-16 h-16" />
            <div className="flex flex-col gap-6">
              <h3 className="text-5xl font-bold uppercase font-bebas tracking-widest leading-none">DE-ID GENERATOR</h3>
               <p className="text-black/60 font-mono text-sm leading-relaxed uppercase text-pretty">
                Automated PHI scrubbing with zero-latency overhead. Built for high-volume clinical streams.
              </p>
            </div>
          </div>
          <div className="p-12 md:p-20 flex flex-col gap-10 brutalist-rule-y">
            <Stethoscope className="text-black w-16 h-16" />
            <div className="flex flex-col gap-6">
              <h3 className="text-5xl font-bold uppercase font-bebas tracking-widest leading-none">CLINICAL NER</h3>
               <p className="text-black/60 font-mono text-sm leading-relaxed uppercase text-pretty">
                UMLS-mapped entity extraction. Identify diagnosis, medications, and symptoms in real-time.
              </p>
            </div>
          </div>
          <div className="p-12 md:p-20 flex flex-col gap-10 bg-white">
            <ClipboardList className="text-primary w-16 h-16" />
            <div className="flex flex-col gap-6">
              <h3 className="text-5xl font-bold uppercase font-bebas tracking-widest leading-none">TRIAGE CORE</h3>
               <p className="text-black/60 font-mono text-sm leading-relaxed uppercase text-pretty">
                Dynamic prioritization engine with human-in-the-loop validation flow.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-8 md:p-16 font-mono text-[10px] uppercase text-black bg-white">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div className="max-w-md">
            <h4 className="text-xl font-bold font-bebas tracking-widest mb-4">MEDTRIAGE INTELLIGENCE CORP</h4>
            <p className="opacity-50 leading-relaxed uppercase">
              The leading edge in clinical triage automation. Providing rapid deployment nodes for acute care centers globally.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
            <div className="space-y-4">
              <p className="font-bold text-primary">RESOURCES</p>
              <ul className="space-y-2 opacity-50">
                <li className="hover:opacity-100 transition-opacity cursor-pointer">API_DOCS</li>
                <li className="hover:opacity-100 transition-opacity cursor-pointer">WHITE_PAPER</li>
                <li className="hover:opacity-100 transition-opacity cursor-pointer">SECURITY_SHA</li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-bold text-primary">PLATFORM</p>
              <ul className="space-y-2 opacity-50">
                <li className="hover:opacity-100 transition-opacity cursor-pointer" onClick={() => onNavigate('audit')}>AUDIT_LOGS</li>
                <li className="hover:opacity-100 transition-opacity cursor-pointer">SYSTEM_STATUS</li>
                <li className="hover:opacity-100 transition-opacity cursor-pointer">NETWORK_NODES</li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-bold text-primary">LEGAL</p>
              <ul className="space-y-2 opacity-50">
                <li className="hover:opacity-100 transition-opacity cursor-pointer">PRIVACY_MD</li>
                <li className="hover:opacity-100 transition-opacity cursor-pointer">COMPLIANCE_JSON</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="h-0.5 w-full bg-black/10 mb-8"></div>
        <div className="flex justify-between items-center opacity-30 text-[8px] tracking-[0.4em]">
          <span>BUILT FOR PRECISION / 2024</span>
          <span>SECURE_SESSION_ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
