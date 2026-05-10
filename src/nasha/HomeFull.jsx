import React from 'react';
import { Waveform, LCD, Fader, Knob, VU, CueButton, PlayIcon, Scribble } from './widgets.jsx';

export function HomeA({ D, currentMix, progress, isPlaying, setIsPlaying, timeDisplay, faders, setFaders, knobs, setKnobs, pitch, setPitch, activeCue, setActiveCue, setSection, accent = '#c2ff00', gap = 12, showMixer = true }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gridAutoRows: 'minmax(auto, auto)',
      gap,
      marginTop: 12,
    }}>
      {/* Hero block */}
      <div className="bento-card" style={{
        gridColumn: 'span 8', background: accent, color: '#000',
        padding: '28px 32px 32px', position: 'relative', minHeight: 360,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em' }}>EST. 2023 · AMS/SCL</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em' }}>NO.001 / SS26</div>
        </div>
        <div style={{
          fontSize: 'clamp(72px, 11vw, 180px)',
          fontWeight: 900, lineHeight: 0.85,
          letterSpacing: '-0.03em', marginTop: 16,
          fontStretch: 'condensed', textTransform: 'uppercase',
        }}>NASHA</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24 }}>
          <div style={{ maxWidth: 380 }}>
            <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
              Reggaetón · Perreo · Dembow
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, marginTop: 6, opacity: 0.7 }}>
              DJ & selector. Amsterdam-based. Open for bookings.
            </div>
          </div>
          <Scribble variant="squiggle" color="#000" width={160} height={30} opacity={0.9} />
        </div>
      </div>

      {/* Now playing deck */}
      <div className="bento-card" style={{
        gridColumn: 'span 4', background: 'var(--surface)', minHeight: 360,
        padding: 18, display: 'flex', flexDirection: 'column', gap: 10,
        border: '1px solid var(--border-soft)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--fg-dim)' }}>
            ◉ NOW PLAYING
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: accent }} className={isPlaying ? 'blink' : ''}>
            {isPlaying ? 'LIVE' : 'PAUSED'}
          </div>
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
          {currentMix.title}
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-dim)' }}>
          {currentMix.genre}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 2 }}>
          <LCD label="BPM" value={currentMix.bpm} color={accent} />
          <LCD label="KEY" value={currentMix.key} color={accent} />
          <LCD label="TIME" value={timeDisplay} sub={currentMix.length} color={accent} />
        </div>

        <div style={{ color: 'var(--fg-faint)', marginTop: 2 }}>
          <Waveform progress={progress} color={currentMix.color} cues={currentMix.cues} seed={currentMix.seed} height={60} />
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 'auto', alignItems: 'center' }}>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{
            width: 46, height: 46, borderRadius: '50%',
            background: accent, border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000',
          }}>
            <PlayIcon size={20} playing={isPlaying} />
          </button>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {['INTRO', 'DROP', 'BREAK', 'OUTRO'].map((l, i) => (
              <CueButton key={i} idx={i + 1} label={l} active={activeCue === i}
                color={currentMix.color} onClick={() => setActiveCue(i)} />
            ))}
          </div>
        </div>
      </div>

      {/* Mixer */}
      {showMixer && (
        <div className="bento-card" style={{
          gridColumn: 'span 5', background: 'var(--surface)',
          padding: 18, border: '1px solid var(--border-soft)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--fg-dim)' }}>◉ MIXER / EQ</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--fg-faint)' }}>DRAG TO TWEAK</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', gap: 14, padding: '4px 0 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <Knob value={knobs.high} onChange={(v) => setKnobs({ ...knobs, high: v })} label="HI" color={accent} size={36} />
                <Knob value={knobs.mid} onChange={(v) => setKnobs({ ...knobs, mid: v })} label="MID" color={accent} size={36} />
                <Knob value={knobs.low} onChange={(v) => setKnobs({ ...knobs, low: v })} label="LO" color={accent} size={36} />
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--fg-faint)', letterSpacing: '0.15em' }}>CHANNEL EQ</div>
            </div>

            <Fader value={faders.a} onChange={(v) => setFaders({ ...faders, a: v })} label="A" color={accent} height={110} />
            <Fader value={faders.b} onChange={(v) => setFaders({ ...faders, b: v })} label="B" color="#ff4d1a" height={110} />
            <Fader value={faders.master} onChange={(v) => setFaders({ ...faders, master: v })} label="MST" color="var(--fg)" height={110} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <VU level={faders.a * 0.9} seed={2} height={90} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--fg-faint)', letterSpacing: '0.15em' }}>L</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <VU level={faders.b * 0.9} seed={9} height={90} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 8, color: 'var(--fg-faint)', letterSpacing: '0.15em' }}>R</div>
            </div>
          </div>
        </div>
      )}

      {/* Pitch + filter */}
      <div className="bento-card" style={{
        gridColumn: showMixer ? 'span 3' : 'span 4', background: '#ff4d1a', color: '#0a0a0a',
        padding: 18, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 240,
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em' }}>◉ PITCH/FILTER</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {((pitch - 0.5) * 16).toFixed(1)}%
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10 }}>PITCH</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 6 }}>
          <Fader value={pitch} onChange={setPitch} label="PITCH" color="#0a0a0a" height={80} />
          <Knob value={knobs.filter} onChange={(v) => setKnobs({ ...knobs, filter: v })} label="FILTER" color="#0a0a0a" size={44} />
        </div>
        <div style={{ marginTop: 'auto', fontFamily: 'var(--mono)', fontSize: 9, lineHeight: 1.5 }}>
          BPM · {currentMix.bpm + Math.round((pitch - 0.5) * 16)}<br />
          KEY · {currentMix.key}
        </div>
      </div>

      {/* Tags */}
      <div className="bento-card" style={{
        gridColumn: 'span 4', background: '#a87bff', color: '#0a0a0a',
        padding: 18, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 240,
      }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em' }}>◉ GENRES/CRATES</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {D.tags.map((t, i) => (
            <span key={i} style={{
              background: i % 3 === 0 ? '#0a0a0a' : 'transparent',
              color: i % 3 === 0 ? '#a87bff' : '#0a0a0a',
              border: '1.5px solid #0a0a0a',
              padding: '5px 10px', borderRadius: 999,
              fontFamily: 'var(--display)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.1em',
            }}>{t}</span>
          ))}
        </div>
        <div style={{ marginTop: 'auto', fontSize: 22, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.015em' }}>
          I play what makes the floor move.
        </div>
      </div>

      {/* Next gig */}
      <div className="bento-card" style={{
        gridColumn: 'span 4', background: 'var(--surface)', color: 'var(--fg)',
        padding: 18, border: '1px solid var(--border-soft)', minHeight: 240,
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--fg-dim)' }}>◉ NEXT GIG</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: accent }}>T-09 DAYS</div>
        </div>
        <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 0.95, marginTop: 10 }}>
          MAY<br />03
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{D.gigs[0].venue}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-dim)', marginTop: 2 }}>
            {D.gigs[0].city} · {D.gigs[0].kind}
          </div>
        </div>
        <button onClick={() => setSection('gigs')} style={{
          marginTop: 'auto', background: 'transparent', color: accent,
          border: `1px solid ${accent}`, borderRadius: 999, padding: '8px 14px',
          fontFamily: 'var(--display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', cursor: 'pointer',
          alignSelf: 'flex-start',
        }}>ALL GIGS →</button>
      </div>

      {/* Recent mixes */}
      <div className="bento-card" style={{
        gridColumn: 'span 8', background: 'var(--surface-2)', border: '1px solid var(--border-soft)',
        padding: 0, overflow: 'hidden',
      }}>
        <div style={{
          background: accent, color: '#000',
          padding: '10px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', fontWeight: 700,
        }}>
          <span>◉ RECENT MIXES</span>
          <button onClick={() => setSection('mixes')} style={{
            background: '#000', color: accent, border: 'none',
            padding: '4px 10px', borderRadius: 999, fontFamily: 'var(--mono)',
            fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', cursor: 'pointer',
          }}>VIEW ALL →</button>
        </div>
        <div>
          {D.mixes.slice(0, 3).map((m, i) => <MixRowA key={m.id} m={m} i={i} />)}
        </div>
      </div>

      {/* Quote */}
      <div className="bento-card" style={{
        gridColumn: 'span 4', background: accent, color: '#000',
        padding: 20, minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.015em', lineHeight: 1.02 }}>
          "Perreo is not a phase, it's a way of moving."
        </div>
        <div>
          <Scribble variant="underline" color="#000" width={120} height={20} />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', marginTop: 4 }}>
            — NASHA, IN AN INTERVIEW SHE HASN'T GIVEN YET
          </div>
        </div>
      </div>
    </div>
  );
}

function MixRowA({ m, i }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '40px 1fr 200px 60px 60px 60px',
      gap: 12, alignItems: 'center', padding: '10px 16px',
      borderBottom: '1px solid var(--border-soft)',
      fontFamily: 'var(--mono)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--fg-faint)' }}>{String(i + 1).padStart(2, '0')}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg)', fontFamily: 'var(--display)', letterSpacing: '-0.005em' }}>{m.title}</div>
        <div style={{ fontSize: 9, color: 'var(--fg-dim)', letterSpacing: '0.12em', marginTop: 2 }}>{m.genre}</div>
      </div>
      <div style={{ color: 'var(--fg-faint)' }}>
        <Waveform progress={0} color={m.color} cues={m.cues} seed={m.seed} height={26} bars={60} unplayedColor="var(--fg-faint)" />
      </div>
      <div style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>{m.bpm}</div>
      <div style={{ fontSize: 11, color: 'var(--fg)', opacity: 0.6 }}>{m.key}</div>
      <div style={{ fontSize: 11, color: 'var(--fg)', opacity: 0.6, textAlign: 'right' }}>{m.length}</div>
    </div>
  );
}
