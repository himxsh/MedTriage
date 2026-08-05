import type { CSSProperties } from 'react';
import type { Screen } from '../types';
import Footer from './Footer';

interface DocsProps {
  onNavigate: (screen: Screen) => void;
}

const STEPS = [
  {
    n: '01',
    title: 'Intake',
    body: 'Open New Intake from the app nav. Submit free-text clinical notes or a voice recording, optionally with patient name and MRN. The case is accepted immediately while AI triage runs in the background.',
  },
  {
    n: '02',
    title: 'Live queue',
    body: 'When triage finishes, the case appears on the Queue with urgency, chief complaint, and confidence. Open a row to see symptoms, risk flags, entities, and evidence.',
  },
  {
    n: '03',
    title: 'Review',
    body: 'Confirm the AI urgency, or Override to a different level. Down-triaging (lowering priority) requires a reason of at least 10 characters. Completed cases no longer show Confirm/Override.',
  },
  {
    n: '04',
    title: 'Audit',
    body: 'Every Confirm or Override is logged with previous → new urgency, clinician id, and reason. Use the Audit screen for a full decision trail.',
  },
] as const;

const FLOW_STAGES = [
  {
    label: 'Capture',
    nodes: [
      { title: 'Text / Audio', detail: 'Clinical notes or Whisper STT' },
    ],
  },
  {
    label: 'AI pipeline',
    nodes: [
      { title: 'Clinical NER', detail: 'Entities + UMLS linking' },
      { title: 'De-ID', detail: 'Mask PHI, keep meds/dx' },
      { title: 'Relations', detail: 'Negation & modifiers' },
      { title: 'Gemini triage', detail: 'Urgency + evidence JSON' },
    ],
  },
  {
    label: 'Deliver',
    nodes: [
      { title: 'Postgres', detail: 'Case persisted' },
      { title: 'Redis → WS', detail: 'Live queue push' },
      { title: 'Queue UI', detail: 'Clinician sees case' },
    ],
  },
  {
    label: 'Decide',
    nodes: [
      { title: 'Confirm / Override', detail: 'Human-in-the-loop' },
      { title: 'Audit log', detail: 'Previous → new + reason' },
    ],
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

const pillShell: CSSProperties = {
  borderRadius: 9999,
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(10px)',
};

const page: CSSProperties = {
  padding: 10,
  boxSizing: 'border-box',
  fontFamily: '"Instrument Serif", serif',
};

const bluePanel: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '3%',
  background: 'linear-gradient(180deg, #5FA9E8 0%, #7CBCEF 55%, #A7D2F5 100%)',
};

const lightPanel: CSSProperties = {
  marginTop: 24,
  padding: '72px 50px',
  borderRadius: '3%',
  background: 'linear-gradient(180deg, #E8F3FB 0%, #F5FAFD 100%)',
};

const glow: CSSProperties = {
  position: 'absolute',
  background: 'white',
  borderRadius: '50%',
  filter: 'blur(180px)',
  opacity: 0.15,
  pointerEvents: 'none',
};

const linkBtn: CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  font: 'inherit',
  color: 'inherit',
  cursor: 'pointer',
};

export default function Docs({ onNavigate }: DocsProps) {
  return (
    <div style={page}>
      {/* Hero */}
      <div style={{ ...bluePanel, padding: '20px 50px 72px' }}>
        <div
          style={{
            ...glow,
            width: 700,
            height: 700,
            left: '50%',
            top: '40%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 56,
            }}
          >
            <button
              type="button"
              onClick={() => onNavigate('landing')}
              style={{
                ...linkBtn,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <img src="/favicon.png" alt="" width={28} height={28} />
              MedTriage
            </button>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              style={pillBtn}
            >
              Login
            </button>
          </div>

          <div style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>
            <div
              style={{
                ...pillShell,
                display: 'inline-block',
                padding: '8px 16px',
                fontSize: 13,
                marginBottom: 20,
              }}
            >
              Documentation
            </div>
            <div style={{ fontSize: 72, lineHeight: 1.05 }}>How to use</div>
            <div
              style={{
                marginTop: 16,
                opacity: 0.7,
                fontSize: 16,
                lineHeight: 1.6,
              }}
            >
              MedTriage turns unstructured intake into a structured triage assessment for ER staff.
              AI assists — licensed clinicians confirm or override before any clinical action.
            </div>
          </div>
        </div>
      </div>

      {/* System flow */}
      <section style={lightPanel}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              ...pillShell,
              display: 'inline-block',
              padding: '8px 16px',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            System flow
          </div>
          <div style={{ fontSize: 48, lineHeight: 1.1 }}>How a case moves</div>
          <div
            style={{
              marginTop: 12,
              opacity: 0.55,
              maxWidth: 520,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6,
            }}
          >
            Intake is accepted fast. The AI pipeline runs in the background, then the case lands on
            the live queue for clinician review.
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 20,
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          {FLOW_STAGES.map((stage, stageIdx) => (
            <div key={stage.label}>
              <div style={{ fontSize: 12, opacity: 0.45, marginBottom: 12 }}>
                {String(stageIdx + 1).padStart(2, '0')} · {stage.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {stage.nodes.map((node) => (
                  <div key={node.title}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{node.title}</div>
                    <div style={{ opacity: 0.55, fontSize: 14, lineHeight: 1.5 }}>{node.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 40,
            textAlign: 'center',
            opacity: 0.4,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          Intake → NER → De-ID → Relations → Gemini → DB → Redis → WebSocket → Queue → Review → Audit
        </div>
      </section>

      {/* Steps */}
      <section
        style={{
          ...bluePanel,
          marginTop: 24,
          padding: '72px 50px',
        }}
      >
        <div
          style={{
            ...glow,
            width: 700,
            height: 700,
            left: '50%',
            top: '30%',
            transform: 'translate(-50%, -50%)',
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
            Clinician path
          </div>
          <div style={{ fontSize: 48, lineHeight: 1.1 }}>Four steps</div>
        </div>
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
            maxWidth: 1100,
            margin: '0 auto',
          }}
        >
          {STEPS.map((step) => (
            <div
              key={step.n}
              style={{
                padding: 32,
                borderRadius: 28,
                background: 'rgba(255,255,255,0.35)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.45, marginBottom: 12 }}>{step.n}</div>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{step.title}</div>
              <div style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.6 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety */}
      <section style={lightPanel}>
        <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto' }}>
          <div
            style={{
              ...pillShell,
              display: 'inline-block',
              padding: '8px 16px',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            Safety
          </div>
          <div style={{ fontSize: 48, lineHeight: 1.1 }}>Clinical decision support</div>
          <div
            style={{
              marginTop: 16,
              opacity: 0.55,
              lineHeight: 1.6,
              fontSize: 15,
            }}
          >
            MedTriage is not a medical device. It does not diagnose or order care. Urgency from the
            model must be reviewed. Treat AI output as a draft until a clinician Confirm or Override
            is recorded.
          </div>
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            style={{
              ...pillBtn,
              marginTop: 32,
              background: '#5FA9E8',
              color: 'white',
              padding: '14px 28px',
            }}
          >
            Back to home
          </button>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}
