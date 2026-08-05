import type { Screen } from '../types';

interface FooterProps {
  onNavigate: (screen: Screen) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer
      style={{
        marginTop: 24,
        marginBottom: 14,
        padding: '56px 50px 40px',
        borderRadius: '3%',
        background: '#F5FAFD',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 48,
        }}
      >
        <div style={{ maxWidth: 360 }}>
          <div style={{ fontSize: 22, marginBottom: 12 }}>MedTriage Intelligence Corp</div>
          <div style={{ opacity: 0.5, lineHeight: 1.6, fontSize: 14 }}>
            The leading edge in clinical triage automation. Providing rapid deployment nodes for
            acute care centers globally.
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(100px, 1fr))',
            gap: 40,
            fontSize: 13,
          }}
        >
          <div>
            <div style={{ marginBottom: 14, opacity: 0.9 }}>Resources</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: 0.45 }}>
              <a href="/#pricing" style={{ color: 'inherit', textDecoration: 'none' }}>
                Pricing
              </a>
              <button
                type="button"
                onClick={() => onNavigate('docs')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                Docs
              </button>
              <span>White Paper</span>
              <span>Security</span>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 14, opacity: 0.9 }}>Platform</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: 0.45 }}>
              <span>Audit Logs</span>
              <span>System Status</span>
              <span>Network Nodes</span>
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 14, opacity: 0.9 }}>Legal</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, opacity: 0.45 }}>
              <span>Privacy</span>
              <span>Compliance</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
