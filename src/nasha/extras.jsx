import React from 'react';
import { Waveform } from './widgets.jsx';

// Detect which platform a share URL points at so we can label the CTA
// button correctly. Returns { name, host } or null for "unknown".
export function detectPlatform(input) {
  if (!input) return null;
  const url = input.trim().toLowerCase();
  if (url.includes('soundcloud.com')) return { name: 'SoundCloud', host: 'soundcloud' };
  if (url.includes('mixcloud.com')) return { name: 'Mixcloud', host: 'mixcloud' };
  if (url.includes('youtube.com') || url.includes('youtu.be')) return { name: 'YouTube', host: 'youtube' };
  if (url.includes('spotify.com')) return { name: 'Spotify', host: 'spotify' };
  if (url.includes('bandcamp.com')) return { name: 'Bandcamp', host: 'bandcamp' };
  return { name: 'Open mix', host: 'generic' };
}

export function MixDetail({ mix, onClose, onPlay, accent }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!mix) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'mdFade 0.18s ease-out',
      }}>
      <style>{`
        @keyframes mdFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mdSlide { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 880, maxHeight: '90vh', overflow: 'auto',
          background: 'var(--bg)', color: 'var(--fg)',
          border: '1px solid var(--border)', borderRadius: 14,
          animation: 'mdSlide 0.22s ease-out',
          display: 'flex', flexDirection: 'column',
        }}>
        <div style={{
          background: mix.color, color: '#000',
          padding: '28px 28px 22px', position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em' }}>
              ◉ MIX · {mix.id.toUpperCase()}
            </div>
            <button onClick={onClose} aria-label="Close" style={{
              background: 'transparent', border: '1px solid rgba(0,0,0,0.25)',
              color: '#000', width: 30, height: 30, borderRadius: '50%',
              cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
          <div style={{
            fontSize: 'clamp(32px, 5.5vw, 56px)', fontWeight: 900,
            letterSpacing: '-0.02em', lineHeight: 0.95, marginTop: 10,
          }}>
            {mix.title}
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.12em', marginTop: 6 }}>
            {mix.genre} · {mix.venue}
          </div>
          <div style={{ marginTop: 14, fontSize: 14, fontWeight: 500, lineHeight: 1.4, maxWidth: 600, letterSpacing: '-0.005em' }}>
            {mix.blurb}
          </div>
        </div>

        <div style={{ padding: '18px 28px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontFamily: 'var(--mono)', fontSize: 11, marginBottom: 14 }}>
            <Stat k="LENGTH" v={mix.length} color={mix.color} />
            <Stat k="DATE" v={mix.date} />
          </div>
          <Waveform progress={0.36} color={mix.color} cues={[]} seed={mix.seed}
            height={46} bars={120} unplayedColor="var(--fg-faint)" />
        </div>

        <div style={{ padding: '16px 28px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
          {(() => {
            const platform = detectPlatform(mix.embedUrl);
            if (!platform) {
              return (
                <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--fg-faint)', letterSpacing: '0.12em', padding: '10px 0' }}>
                  NO STREAM LINK YET
                </div>
              );
            }
            return (
              <a href={mix.embedUrl} target="_blank" rel="noopener noreferrer" style={{
                background: accent, color: '#000', textDecoration: 'none',
                padding: '12px 20px', borderRadius: 999,
                fontFamily: 'var(--display)', fontSize: 13, fontWeight: 800, letterSpacing: '0.14em',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                {platform.host === 'youtube' ? 'WATCH ON' : 'PLAY ON'} {platform.name.toUpperCase()}
              </a>
            );
          })()}
        </div>

        <div style={{ padding: '18px 28px 28px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-dim)', marginBottom: 12 }}>
            ◉ TRACKLIST · {mix.tracklist?.length ?? 0} TRACKS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {mix.tracklist?.map((t, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '38px 1fr auto',
                gap: 10, alignItems: 'center',
                padding: '10px 0', borderBottom: i === mix.tracklist.length - 1 ? 'none' : '1px dashed var(--border)',
                fontFamily: 'var(--mono)', fontSize: 13,
              }}>
                <div style={{ color: 'var(--fg-faint)', fontSize: 10, letterSpacing: '0.1em' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ color: 'var(--fg)' }}>{t}</div>
                <div style={{ color: 'var(--fg-faint)', fontSize: 10 }}>—</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v, color }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'var(--fg-dim)', letterSpacing: '0.15em' }}>{k}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || 'var(--fg)', marginTop: 2 }}>{v}</div>
    </div>
  );
}

function ActionBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', color: 'var(--fg)',
      border: '1px solid var(--border)',
      padding: '10px 14px', borderRadius: 999,
      fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 600,
      letterSpacing: '0.15em', cursor: 'pointer',
    }}>{label}</button>
  );
}
