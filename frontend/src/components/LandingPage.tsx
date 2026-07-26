import React from 'react';
import { LayoutGrid, ShieldCheck, Stethoscope, ClipboardList, CalendarDays, CalendarRange, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Screen } from '../types';

interface LandingPageProps {
  onNavigate: (screen: Screen) => void;
}

const PLANS = [
  {
    id: 'two-week',
    label: '01',
    name: '2-Week Pilot',
    price: '$499',
    cadence: 'one-time',
    blurb: 'Full triage stack for a short clinical evaluation window.',
    features: ['Text + voice intake', 'Live queue + audit log', 'Up to 5 clinician seats'],
    cta: 'Start Pilot',
    action: 'register' as const,
    featured: false,
  },
  {
    id: 'month',
    label: '02',
    name: '1-Month',
    price: '$1,200',
    cadence: 'recurring',
    blurb: 'Continuous deployment for a single acute-care site.',
    features: ['Everything in Pilot', 'Priority model updates', 'Up to 25 clinician seats'],
    cta: 'Subscribe',
    action: 'register' as const,
    featured: true,
  },
  {
    id: 'sales',
    label: '03',
    name: 'Contact Sales',
    price: 'Custom',
    cadence: 'enterprise',
    blurb: 'Multi-site rollout, SSO, and dedicated clinical onboarding.',
    features: ['Unlimited seats', 'SLA + onboarding', 'Custom integrations'],
    cta: 'Talk to Sales',
    action: 'sales' as const,
    featured: false,
  },
] as const;

const PLAN_ICONS = {
  'two-week': CalendarDays,
  month: CalendarRange,
  sales: Building2,
} as const;

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
          <a className="hover:text-primary-ink transition-colors" href="#pricing">Pricing</a>
          <a className="hover:text-primary-ink transition-colors" href="#">Docs</a>
          <button
            onClick={() => onNavigate('login')}
            className="font-bold hover:text-primary-ink transition-colors cursor-pointer"
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
            TRIAGE. <span className="text-primary-ink italic">FASTER.</span>
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
              className="group relative inline-flex items-center justify-center border-2 border-black/20 bg-primary px-16 py-6 text-white font-mono text-xl font-bold uppercase transition-colors hover:bg-primary-ink active:scale-[0.96] cursor-pointer"
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

        {/* Pricing */}
        <section id="pricing" className="brutalist-rule-x scroll-mt-24">
          <div className="px-6 md:px-10 py-16 md:py-20 bg-white brutalist-rule-x">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary-ink mb-4">Access Plans</p>
            <h2 className="font-bebas text-6xl md:text-8xl tracking-tight leading-none uppercase">
              Pricing
            </h2>
            <p className="mt-6 max-w-2xl font-mono text-sm uppercase tracking-wide text-black/50 text-pretty">
              Short pilots, monthly sites, or enterprise rollout. AI assists — clinicians decide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 bg-black/5">
            {PLANS.map((plan, i) => {
              const Icon = PLAN_ICONS[plan.id];
              const onCta = () => {
                if (plan.action === 'sales') {
                  window.location.href = 'mailto:sales@medtriage.ai?subject=MedTriage%20Enterprise';
                  return;
                }
                onNavigate('register');
              };
              return (
                <div
                  key={plan.id}
                  className={`p-10 md:p-14 flex flex-col gap-8 ${i < PLANS.length - 1 ? 'brutalist-rule-y' : ''} ${plan.featured ? 'bg-primary text-white' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <Icon className={`w-12 h-12 shrink-0 ${plan.featured ? 'text-white' : 'text-primary'}`} />
                    <span className={`font-mono text-[10px] tracking-[0.35em] ${plan.featured ? 'text-white/70' : 'text-black/40'}`}>
                      {plan.label}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="font-bebas text-4xl md:text-5xl tracking-widest leading-none uppercase">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-3">
                      <span className="font-bebas text-6xl tracking-tight leading-none">{plan.price}</span>
                      <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${plan.featured ? 'text-white/70' : 'text-black/40'}`}>
                        {plan.cadence}
                      </span>
                    </div>
                    <p className={`font-mono text-sm leading-relaxed uppercase text-pretty ${plan.featured ? 'text-white/80' : 'text-black/60'}`}>
                      {plan.blurb}
                    </p>
                  </div>

                  <ul className={`flex flex-col gap-3 font-mono text-xs uppercase tracking-wide ${plan.featured ? 'text-white/90' : 'text-black/70'}`}>
                    {plan.features.map((f) => (
                      <li key={f} className={`border-t pt-3 ${plan.featured ? 'border-white/20' : 'border-black/10'}`}>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={onCta}
                    className={`mt-auto w-full px-6 py-4 font-mono text-sm font-bold uppercase border-2 transition-colors active:scale-[0.96] cursor-pointer ${
                      plan.featured
                        ? 'border-white bg-white text-primary-ink hover:bg-background-linen'
                        : plan.action === 'sales'
                          ? 'border-black/20 bg-black text-white hover:bg-primary-ink'
                          : 'border-black/20 bg-primary text-white hover:bg-primary-ink'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              );
            })}
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
              <p className="font-bold text-primary-ink">RESOURCES</p>
              <ul className="space-y-2 opacity-50">
                <li className="hover:opacity-100 transition-opacity cursor-pointer">
                  <a href="#pricing">PRICING</a>
                </li>
                <li className="hover:opacity-100 transition-opacity cursor-pointer">API DOCS</li>
                <li className="hover:opacity-100 transition-opacity cursor-pointer">WHITE PAPER</li>
                <li className="hover:opacity-100 transition-opacity cursor-pointer">SECURITY SHA</li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-bold text-primary-ink">PLATFORM</p>
              <ul className="space-y-2 opacity-50">
                <li className="hover:opacity-100 transition-opacity cursor-pointer" onClick={() => onNavigate('audit')}>AUDIT LOGS</li>
                <li className="hover:opacity-100 transition-opacity cursor-pointer">SYSTEM STATUS</li>
                <li className="hover:opacity-100 transition-opacity cursor-pointer">NETWORK NODES</li>
              </ul>
            </div>
            <div className="space-y-4">
              <p className="font-bold text-primary-ink">LEGAL</p>
              <ul className="space-y-2 opacity-50">
                <li className="hover:opacity-100 transition-opacity cursor-pointer">PRIVACY MD</li>
                <li className="hover:opacity-100 transition-opacity cursor-pointer">COMPLIANCE JSON</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="h-0.5 w-full bg-black/10 mb-8"></div>
        <div className="flex justify-between items-center opacity-30 text-[8px] tracking-[0.4em]">
          <span>BUILT FOR PRECISION / 2024</span>
          <span>SECURE SESSION ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
