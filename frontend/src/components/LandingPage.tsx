import { useState, FormEvent, useRef, useLayoutEffect, type CSSProperties } from 'react';
import { MacbookPro } from './eldoraui/macbook-pro';
import { getLenis } from '../lenis';
import { Screen } from '../types';
import Footer from './Footer';

interface LandingPageProps {
  onNavigate: (screen: Screen) => void;
}

const MAC_GAP = 16; // px below email field (before content nudge)
const CONTENT_NUDGE = 5; // Coming Soon → waitlist shifted up; keep MacBook fixed

const FEATURES = [
  {
    title: 'De-ID Generator',
    blurb:
      'Automated PHI scrubbing with zero-latency overhead. Built for high-volume clinical streams.',
  },
  {
    title: 'Clinical NER',
    blurb:
      'UMLS-mapped entity extraction. Identify diagnosis, medications, and symptoms in real-time.',
  },
  {
    title: 'Triage Core',
    blurb:
      'Dynamic prioritization engine with human-in-the-loop validation flow.',
  },
] as const;

const PLANS = [
  {
    id: 'two-week',
    label: '01',
    name: '2-Week Pilot',
    price: '₹39,999',
    cadence: 'one-time',
    blurb: 'Supervised evaluation at one acute-care site. Metrics export included.',
    features: ['Text + voice intake', 'Live queue + audit log', 'Up to 5 clinician seats'],
    cta: 'Start Pilot',
    action: 'waitlist' as const,
    featured: false,
  },
  {
    id: 'month',
    label: '02',
    name: 'Site Monthly',
    price: '₹99,000',
    cadence: '/ month / site',
    blurb: 'Ongoing deployment for a single ED or urgent-care desk (~₹12L ARR).',
    features: ['Everything in Pilot', 'Weekly metrics review', 'Up to 25 clinician seats'],
    cta: 'Subscribe',
    action: 'waitlist' as const,
    featured: true,
  },
  {
    id: 'sales',
    label: '03',
    name: 'Hospital Group',
    price: 'Custom',
    cadence: 'multi-site',
    blurb: 'Multi-site rollout, SSO when demanded, and dedicated clinical onboarding.',
    features: ['Volume pricing', 'SLA + onboarding', 'Custom integrations on request'],
    cta: 'Talk to Sales',
    action: 'sales' as const,
    featured: false,
  },
] as const;

const pillBtn: CSSProperties = {
  background: 'white',
  padding: '10px 25px',
  borderRadius: 9999,
  fontSize: 12,
  cursor: 'pointer',
  border: 'none',
  fontFamily: 'inherit',
};

// translucent shell — keep a visible box so MacBook pull (emailRef bottom) still reads against a real pill edge
const pillShell: CSSProperties = {
  borderRadius: 9999,
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(10px)',
};

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [joined, setJoined] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLDivElement>(null);
  const [pull, setPull] = useState(0);

  function onSubmit(e: FormEvent) {
    // ponytail: local-only until waitlist API exists
    e.preventDefault();
    setJoined(true);
  }

  function scrollToWaitlist() {
    if (emailRef.current) getLenis()?.scrollTo(emailRef.current, { offset: -40 });
  }

  function onPlanCta(action: (typeof PLANS)[number]['action']) {
    switch (action) {
      case 'waitlist':
        scrollToWaitlist();
        return;
      case 'sales':
        window.location.href =
          'mailto:sales@medtriage.ai?subject=MedTriage%20Enterprise';
        return;
      default: {
        const _exhaustive: never = action;
        return _exhaustive;
      }
    }
  }

  useLayoutEffect(() => {
    const place = () => {
      const hero = heroRef.current;
      const email = emailRef.current;
      if (!hero || !email) return;
      const heroBox = hero.getBoundingClientRect();
      const emailBox = email.getBoundingClientRect();
      // compensate CONTENT_NUDGE so MacBook stays where it was pre-nudge
      setPull(heroBox.bottom - emailBox.bottom - MAC_GAP - CONTENT_NUDGE);
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [joined]);

  return (
    <div
      style={{
        padding: 10,
        boxSizing: 'border-box',
        fontFamily: '"Instrument Serif", serif',
      }}
    >
      {/* Hero — fixed height; MacBook is a sibling so it can't stretch this */}
      <div
        ref={heroRef}
        style={{
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
          width: '100%',
          height: 'calc(100vh - 20px)',
          borderRadius: '3%',
          background:
            'linear-gradient(180deg, #5FA9E8 0%, #7CBCEF 55%, #A7D2F5 100%)',
        }}
      >
        {/* Left Glow */}
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            left: -350,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'white',
            borderRadius: '50%',
            filter: 'blur(220px)',
            opacity: 0.22,
            pointerEvents: 'none',
          }}
        />

        {/* Center Glow */}
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            left: '50%',
            top: '45%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '50%',
            filter: 'blur(180px)',
            opacity: 0.12,
            pointerEvents: 'none',
          }}
        />

        {/* Right Glow */}
        <div
          style={{
            position: 'absolute',
            width: 900,
            height: 900,
            right: -350,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'white',
            borderRadius: '50%',
            filter: 'blur(220px)',
            opacity: 0.22,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingTop: 20,
              paddingLeft: 50,
              paddingRight: 50,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/favicon.png" alt="" width={28} height={28} />
              MedTriage
            </div>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              style={{
                background: 'white',
                padding: '10px 25px',
                borderRadius: 9999,
                fontSize: 12,
                cursor: 'pointer',
                border: 'none',
                fontFamily: 'inherit',
              }}
            >
              Login
            </button>
          </div>
          <br />
          <br />
          <div style={{ transform: `translateY(-${CONTENT_NUDGE}px)` }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                ...pillShell,
                display: 'inline-block',
              }}
            >
              <div style={{ padding: 10 }}>Coming Soon</div>
            </div>
          </div>
          <br />
          <div style={{ textAlign: 'center', fontSize: 110 }}>TRIAGE. FASTER.</div>
          <br />
          <div style={{ textAlign: 'center' }}>
            Next-generation clinical intelligence for critical care environments.
          </div>
          <br />
          <div ref={emailRef} style={{ display: 'flex', justifyContent: 'center' }}>
            {joined ? (
              <div style={{ textAlign: 'center', fontSize: 14 }}>
                You&apos;re on the list — we&apos;ll be in touch.
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                style={{
                  ...pillShell,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: 450,
                  padding: '10px 12px',
                }}
              >
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Your email address"
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: 14,
                    outline: 'none',
                    minWidth: 0,
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'white',
                    padding: '10px 25px',
                    borderRadius: 9999,
                    fontSize: 12,
                    cursor: 'pointer',
                    border: 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  JOIN WAITLIST
                </button>
              </form>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Above hero in z; pulled up to sit just below the email field */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          marginTop: pull > 0 ? -pull : undefined,
          paddingBottom: 48,
        }}
      >
        <div style={{ position: 'relative', width: '80.85vw' }}>
          <MacbookPro
            width={650}
            height={400}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
          <video
            src="/medtriage-ad.mp4"
            autoPlay
            muted
            loop
            playsInline
            style={{
              position: 'absolute',
              // screen slot inside MacbookPro SVG (viewBox 650×400)
              left: `${(74.52 / 650) * 100}%`,
              top: `${(21.32 / 400) * 100}%`,
              width: `${(501.22 / 650) * 100}%`,
              height: `${(323.85 / 400) * 100}%`,
              // screen ~1.55:1 vs video 16:9 — cover was cropping the sides
              objectFit: 'contain',
              background: '#000',
              borderRadius: 5,
            }}
          />
        </div>
      </div>

      {/* Features */}
      <section
        style={{
          marginTop: 24,
          padding: '72px 50px',
          borderRadius: '3%',
          background:
            'linear-gradient(180deg, #E8F3FB 0%, #F5FAFD 100%)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              ...pillShell,
              display: 'inline-block',
              padding: '8px 16px',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Capabilities
          </div>
          <div style={{ fontSize: 48, lineHeight: 1.1 }}>Built for the bedside.</div>
          <div style={{ marginTop: 12, opacity: 0.55, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            The clinical stack that sits under every triage decision.
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 40,
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.title}</div>
              <div style={{ opacity: 0.55, lineHeight: 1.6, fontSize: 15 }}>{f.blurb}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        style={{
          marginTop: 24,
          padding: '72px 50px',
          borderRadius: '3%',
          background:
            'linear-gradient(180deg, #5FA9E8 0%, #7CBCEF 55%, #A7D2F5 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
            background: 'white',
            borderRadius: '50%',
            filter: 'blur(180px)',
            opacity: 0.15,
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              ...pillShell,
              display: 'inline-block',
              padding: '8px 16px',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Access Plans
          </div>
          <div style={{ fontSize: 48, lineHeight: 1.1 }}>Pricing (INR)</div>
          <div style={{ marginTop: 12, opacity: 0.7, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            India-first list rates. AI assists — clinicians Confirm or Override. Commercial license required before PHI.
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                padding: 32,
                borderRadius: 28,
                background: plan.featured ? 'white' : 'rgba(255,255,255,0.35)',
                backdropFilter: plan.featured ? undefined : 'blur(8px)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: 26 }}>{plan.name}</div>
                <div style={{ fontSize: 12, opacity: 0.45 }}>{plan.label}</div>
              </div>
              <div>
                <span style={{ fontSize: 42, lineHeight: 1 }}>{plan.price}</span>
                <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.5 }}>{plan.cadence}</span>
              </div>
              <div style={{ fontSize: 14, opacity: 0.6, lineHeight: 1.5 }}>{plan.blurb}</div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  fontSize: 13,
                  opacity: 0.7,
                }}
              >
                {plan.features.map((feat) => (
                  <li
                    key={feat}
                    style={{
                      borderTop: '1px solid rgba(0,0,0,0.08)',
                      paddingTop: 10,
                    }}
                  >
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onPlanCta(plan.action)}
                style={{
                  ...pillBtn,
                  marginTop: 'auto',
                  width: '100%',
                  background: plan.featured ? '#5FA9E8' : 'white',
                  color: plan.featured ? 'white' : 'inherit',
                  padding: '14px 25px',
                }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer onNavigate={onNavigate} />

    </div>
  );
}
