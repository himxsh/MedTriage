import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { sansFamily, serifFamily } from './theme';

/* ── Hero: new landing gradient ── */

export const HeroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, #5FA9E8 0%, #7CBCEF 55%, #A7D2F5 100%)',
        overflow: 'hidden',
        fontFamily: serifFamily,
      }}
    >
      <Interactive.Div
        name="Left glow"
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          left: -350,
          top: 90,
          background: 'white',
          borderRadius: '50%',
          filter: 'blur(220px)',
          opacity: 0.22,
          pointerEvents: 'none',
        }}
      />
      <Interactive.Div
        name="Right glow"
        style={{
          position: 'absolute',
          width: 900,
          height: 900,
          right: -350,
          top: 90,
          background: 'white',
          borderRadius: '50%',
          filter: 'blur(220px)',
          opacity: 0.22,
          pointerEvents: 'none',
        }}
      />

      <AbsoluteFill
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          padding: '0 120px',
        }}
      >
        <Sequence name="Nav" layout="none" from={0} durationInFrames={120}>
          <Interactive.Div
            name="Brand row"
            style={{
              position: 'absolute',
              top: 48,
              left: 80,
              right: 80,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 28,
                color: '#131722',
              }}
            >
              <Img
                name="Favicon"
                src={staticFile('favicon.png')}
                style={{ width: 36, height: 36 }}
              />
              MedTriage
            </div>
            <div
              style={{
                background: 'white',
                padding: '14px 32px',
                borderRadius: 9999,
                fontSize: 16,
                fontFamily: sansFamily,
                color: '#131722',
              }}
            >
              Login
            </div>
          </Interactive.Div>
        </Sequence>

        <Interactive.Div
          name="Coming Soon pill"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: 9999,
            padding: '12px 22px',
            fontSize: 22,
            color: '#131722',
            opacity: interpolate(frame, [0.3 * fps, 0.8 * fps], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(
              frame,
              [0.3 * fps, 0.8 * fps],
              ['0px 16px', '0px 0px'],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          Coming Soon
        </Interactive.Div>

        <Interactive.Div
          name="Hero title"
          style={{
            fontSize: 140,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: '#131722',
            textAlign: 'center',
            opacity: interpolate(frame, [0.5 * fps, 1.1 * fps], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            scale: interpolate(frame, [0.5 * fps, 1.1 * fps], [0.94, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              output: 'perceptual-scale',
            }),
          }}
        >
          TRIAGE. FASTER.
        </Interactive.Div>

        <Interactive.Div
          name="Hero subtitle"
          style={{
            fontSize: 32,
            color: '#131722',
            textAlign: 'center',
            maxWidth: 900,
            opacity: interpolate(frame, [0.9 * fps, 1.5 * fps], [0, 0.75], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          Next-generation clinical intelligence for critical care environments.
        </Interactive.Div>

        <Interactive.Div
          name="Waitlist pill"
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: 520,
            padding: '14px 16px',
            borderRadius: 9999,
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(10px)',
            opacity: interpolate(frame, [1.3 * fps, 2 * fps], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
            translate: interpolate(
              frame,
              [1.3 * fps, 2 * fps],
              ['0px 20px', '0px 0px'],
              {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              },
            ),
          }}
        >
          <span
            style={{
              fontFamily: sansFamily,
              fontSize: 18,
              color: 'rgba(19, 23, 34, 0.45)',
              paddingLeft: 12,
            }}
          >
            Your email address
          </span>
          <span
            style={{
              background: 'white',
              padding: '12px 24px',
              borderRadius: 9999,
              fontFamily: sansFamily,
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.04em',
              color: '#131722',
            }}
          >
            JOIN WAITLIST
          </span>
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ── Promise: one-line workflow ── */

export const PromiseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F0F5FA',
        fontFamily: serifFamily,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        padding: '0 140px',
      }}
    >
      <Interactive.Div
        name="Promise eyebrow"
        style={{
          fontFamily: sansFamily,
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#1E5A8B',
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Clinical decision support
      </Interactive.Div>

      <Interactive.Div
        name="Promise headline"
        style={{
          fontSize: 72,
          lineHeight: 1.15,
          textAlign: 'center',
          color: '#131722',
          maxWidth: 1400,
          opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(
            frame,
            [0.2 * fps, 0.8 * fps],
            ['0px 24px', '0px 0px'],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        Intake → AI triage → live queue → clinician confirm.
      </Interactive.Div>

      <Interactive.Div
        name="Promise footnote"
        style={{
          fontSize: 28,
          color: '#6D6D6D',
          textAlign: 'center',
          opacity: interpolate(frame, [0.7 * fps, 1.3 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Advisory until reviewed. Never autonomous.
      </Interactive.Div>
    </AbsoluteFill>
  );
};

/* Shared product chrome around screenshots */

const ProductFrame: React.FC<{
  title: string;
  caption: string;
  src: string;
  accent: string;
}> = ({ title, caption, src, accent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F9FBFC',
        fontFamily: sansFamily,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        padding: '60px 100px',
      }}
    >
      <Interactive.Div
        name="Scene label"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 9999,
            backgroundColor: accent,
          }}
        />
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#55565A',
          }}
        >
          {title}
        </span>
      </Interactive.Div>

      <Interactive.Div
        name="Product card"
        style={{
          width: 1480,
          height: 780,
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: 'white',
          border: '1px solid #E7E7E7',
          boxShadow: '0 24px 80px rgba(19, 23, 34, 0.12)',
          opacity: interpolate(frame, [0.2 * fps, 0.8 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [0.2 * fps, 0.8 * fps], [0.96, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            output: 'perceptual-scale',
          }),
        }}
      >
        <Img
          name="Product screenshot"
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'top left',
          }}
        />
      </Interactive.Div>

      <Interactive.Div
        name="Caption"
        style={{
          fontFamily: serifFamily,
          fontSize: 36,
          color: '#131722',
          textAlign: 'center',
          opacity: interpolate(frame, [0.6 * fps, 1.2 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {caption}
      </Interactive.Div>
    </AbsoluteFill>
  );
};

export const IntakeScene: React.FC = () => {
  return (
    <ProductFrame
      title="New Intake"
      caption="Text or voice. Templates for India ED walk-ins."
      src="intake.png"
      accent="#131722"
    />
  );
};

const LivePulse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Interactive.Div
      name="Live pulse"
      style={{
        position: 'absolute',
        top: 78,
        right: 160,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'white',
        border: '1px solid #E7E7E7',
        borderRadius: 9999,
        padding: '10px 18px',
        fontFamily: sansFamily,
        fontSize: 16,
        fontWeight: 600,
        color: '#131722',
        opacity: interpolate(frame, [0.8 * fps, 1.2 * fps], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
        scale: interpolate(
          frame,
          [1.5 * fps, 1.7 * fps, 1.9 * fps],
          [1, 1.06, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        ),
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: 9999,
          backgroundColor: '#2E854A',
          opacity: interpolate(
            frame,
            [1.5 * fps, 1.7 * fps, 1.9 * fps, 2.1 * fps],
            [1, 0.35, 1, 0.35],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            },
          ),
        }}
      />
      Live
    </Interactive.Div>
  );
};

export const QueueScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <ProductFrame
        title="Live Queue"
        caption="Prioritized cases. Confirm next Critical with one key."
        src="queue.png"
        accent="#2E854A"
      />
      <LivePulse />
    </AbsoluteFill>
  );
};

const ConfirmChip: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <Interactive.Div
      name="Confirm chip"
      style={{
        position: 'absolute',
        bottom: 150,
        right: 180,
        backgroundColor: '#2E854A',
        color: 'white',
        fontFamily: sansFamily,
        fontSize: 22,
        fontWeight: 600,
        padding: '16px 28px',
        borderRadius: 14,
        opacity: interpolate(frame, [0, 12], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: interpolate(frame, [0, 12], ['0px 24px', '0px 0px'], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      Confirmed · Critical
    </Interactive.Div>
  );
};

export const ReviewScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <ProductFrame
        title="Clinician review"
        caption="Confirm or override. Full audit trail."
        src="case-detail.png"
        accent="#C47A12"
      />
      <Sequence name="Confirm flash" from={90} durationInFrames={60} layout="none">
        <ConfirmChip />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ── CTA ── */

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        background:
          'linear-gradient(180deg, #5FA9E8 0%, #7CBCEF 55%, #A7D2F5 100%)',
        fontFamily: serifFamily,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
      }}
    >
      <Interactive.Div
        name="Center glow"
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          left: 610,
          top: 190,
          background: 'white',
          borderRadius: '50%',
          filter: 'blur(180px)',
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      />

      <Interactive.Div
        name="CTA title"
        style={{
          fontSize: 120,
          lineHeight: 1,
          color: '#131722',
          textAlign: 'center',
          opacity: interpolate(frame, [0, 0.6 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [0, 0.6 * fps], [0.95, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            output: 'perceptual-scale',
          }),
        }}
      >
        TRIAGE. FASTER.
      </Interactive.Div>

      <Interactive.Div
        name="CTA subtitle"
        style={{
          fontSize: 32,
          color: '#131722',
          opacity: interpolate(frame, [0.4 * fps, 1 * fps], [0, 0.7], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        Join the waitlist for supervised site pilots.
      </Interactive.Div>

      <Interactive.Div
        name="CTA button"
        style={{
          marginTop: 8,
          background: 'white',
          padding: '20px 40px',
          borderRadius: 9999,
          fontFamily: sansFamily,
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: '#131722',
          opacity: interpolate(frame, [0.7 * fps, 1.3 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(
            frame,
            [0.7 * fps, 1.3 * fps],
            ['0px 18px', '0px 0px'],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        JOIN WAITLIST
      </Interactive.Div>

      <Interactive.Div
        name="CTA brand"
        style={{
          position: 'absolute',
          bottom: 56,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 24,
          color: '#131722',
          opacity: interpolate(frame, [1 * fps, 1.6 * fps], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <Img
          name="CTA favicon"
          src={staticFile('favicon.png')}
          style={{ width: 28, height: 28 }}
        />
        MedTriage
      </Interactive.Div>
    </AbsoluteFill>
  );
};
