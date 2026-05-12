import React from 'react';
import { Knob, Fader, Waveform } from './widgets.jsx';

export function HomeAMin({ D, setSection, accent = '#c2ff00', gap = 12 }) {
  const [weight, setWeight] = React.useState(0.85);
  const [tracking, setTracking] = React.useState(0.18);

  const fontWeight = Math.round(100 + weight * 800);
  const letterSpacing = (-0.04 + tracking * 0.2).toFixed(3) + 'em';

  const [knobValue, setKnobValue] = React.useState(0.85 * 2 - 1);
  React.useEffect(() => { setWeight((knobValue + 1) / 2); }, [knobValue]);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap,
      marginTop: 12,
    }}>
      {/* Hero */}
      <div className="bento-card" style={{
        gridColumn: 'span 12', background: accent, color: '#000',
        padding: '36px 40px 32px', position: 'relative',
        minHeight: 'min(72vh, 560px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em' }}>
            EST. 2023 · AMS / SCL · NO.001
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em' }}>
            REGGAETÓN · PERREO · DEMBOW
          </div>
        </div>

        <div className="hero-min-word" style={{
          fontSize: 'clamp(96px, 17vw, 280px)',
          fontWeight: fontWeight,
          lineHeight: 0.82,
          letterSpacing: letterSpacing,
          textTransform: 'uppercase',
          margin: '8px 0',
          fontVariationSettings: `"wght" ${fontWeight}`,
          transition: 'font-weight 0.05s linear',
          userSelect: 'none',
        }}>
          NASHA
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap',
        }}>
          <div style={{ maxWidth: 380 }}>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
              DJ &amp; selector based in Amsterdam.<br />
              Open for bookings — clubs, festivals, radio.
            </div>
            <button onClick={() => setSection('booking')} style={{
              marginTop: 16, background: '#000', color: accent, border: 'none',
              padding: '12px 22px', borderRadius: 999,
              fontFamily: 'var(--display)', fontSize: 13, fontWeight: 700,
              letterSpacing: '0.15em', cursor: 'pointer',
            }}>
              BOOK A SET →
            </button>
          </div>

          <div style={{
            display: 'flex', gap: 28, alignItems: 'center',
            background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.18)',
            borderRadius: 6, padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Knob value={knobValue} onChange={setKnobValue} label="WEIGHT" color="#000" size={48} min={-1} max={1} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#000', opacity: 0.65, letterSpacing: '0.1em' }}>
                {fontWeight}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Fader value={tracking} onChange={setTracking} label="TRACK" color="#000" height={70} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: '#000', opacity: 0.65, letterSpacing: '0.1em' }}>
                {letterSpacing}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest mix */}
      <div className="bento-card" style={{
        gridColumn: 'span 5', background: 'var(--surface)', padding: 24,
        border: '1px solid var(--border-soft)', minHeight: 240,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-dim)' }}>
            ◉ LATEST MIX
          </div>
          <button onClick={() => setSection('mixes')} style={{
            background: 'transparent', border: 'none', color: 'var(--fg-dim)',
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', cursor: 'pointer',
          }}>ALL →</button>
        </div>
        <div style={{
          fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 800, letterSpacing: '-0.025em',
          lineHeight: 0.95, marginTop: 10,
        }}>
          {D.mixes[0].title}
        </div>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-dim)', marginTop: 6, letterSpacing: '0.12em',
        }}>
          {D.mixes[0].genre} · {D.mixes[0].length}
        </div>
        <div style={{ marginTop: 18 }}>
          <Waveform progress={0} color={D.mixes[0].color} cues={[]} seed={D.mixes[0].seed} height={50} bars={100} unplayedColor="var(--fg-faint)" />
        </div>
      </div>

      {/* Portrait */}
      <div className="bento-card" style={{
        gridColumn: 'span 3', background: '#a87bff', minHeight: 240,
        position: 'relative', overflow: 'hidden', padding: 0,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {D.portraitMin ? (
          <img src={D.portraitMin} alt="Nasha portrait"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.07) 0 8px, transparent 8px 18px)',
            }} />
            <svg viewBox="0 0 100 140" preserveAspectRatio="xMidYMax meet" style={{
              position: 'absolute', left: '50%', bottom: 0, transform: 'translateX(-50%)',
              width: '85%', height: '78%',
            }}>
              <circle cx="50" cy="50" r="22" fill="rgba(0,0,0,0.18)" />
              <path d="M 18 140 Q 18 92 50 92 Q 82 92 82 140 Z" fill="rgba(0,0,0,0.18)" />
            </svg>
          </>
        )}
        <div style={{
          position: 'relative', padding: '14px 16px',
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: '#000',
        }}>
          ◉ PORTRAIT
        </div>
        {!D.portraitMin && (
          <div style={{
            position: 'relative', padding: '14px 16px',
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em', color: '#000', opacity: 0.75,
            textAlign: 'right',
          }}>
            DROP<br />IMAGE<br />HERE ↓
          </div>
        )}
      </div>

      {/* Next gig */}
      <div className="bento-card" style={{
        gridColumn: 'span 4', background: '#ff4d1a', color: '#0a0a0a', padding: 24,
        minHeight: 240, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em' }}>◉ NEXT GIG</div>
        {(() => {
          const g = D.gigs.find((x) => x.status === 'UPCOMING');
          if (!g) return null;
          return (
            <>
              <div style={{ fontSize: 64, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.85 }}>
                {g.date.split(' ')[0]}<br />{g.date.split(' ')[1]}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.01em' }}>{g.venue}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, marginTop: 2, opacity: 0.75 }}>{g.city} · {g.time}</div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Tags strip */}
      <div className="bento-card" style={{
        gridColumn: 'span 12', background: 'var(--bg)', border: '1px solid var(--border-soft)',
        padding: '14px 20px', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-dim)', marginRight: 8 }}>
          GENRES /
        </div>
        {D.tags.map((t, i) => (
          <span key={i} style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em',
            color: 'var(--fg)', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: 999,
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}
