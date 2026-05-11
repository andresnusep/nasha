import React from 'react';
import { Waveform } from './widgets.jsx';

// Turn a public share URL into something that can actually be iframed.
// SoundCloud / Mixcloud / YouTube / Spotify all block their main domains
// from being embedded (X-Frame-Options), and expose a separate /embed
// or /widget/iframe URL for that. If the editor already pasted the
// embed URL, pass through. If they pasted the share URL, convert.
function normalizeEmbedUrl(input) {
  if (!input) return null;
  const url = input.trim();

  // Already a player/embed URL — pass through.
  if (
    url.startsWith('https://w.soundcloud.com/player/') ||
    url.startsWith('https://www.mixcloud.com/widget/iframe/') ||
    url.startsWith('https://www.youtube.com/embed/') ||
    url.includes('open.spotify.com/embed/')
  ) {
    return url;
  }

  // SoundCloud share → player.
  if (/^https?:\/\/soundcloud\.com\//.test(url)) {
    return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23000000&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false`;
  }

  // Mixcloud share → widget.
  if (/^https?:\/\/(www\.)?mixcloud\.com\//.test(url)) {
    const path = url.replace(/^https?:\/\/(www\.)?mixcloud\.com/, '');
    return `https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=${encodeURIComponent(path)}`;
  }

  // YouTube watch / short → embed.
  const ytWatch = url.match(/[?&]v=([\w-]+)/);
  const ytShort = url.match(/youtu\.be\/([\w-]+)/);
  const ytId = ytWatch?.[1] || ytShort?.[1];
  if (ytId) return `https://www.youtube.com/embed/${ytId}`;

  // Spotify share → embed.
  const sp = url.match(/open\.spotify\.com\/(track|episode|album|playlist)\/([\w]+)/);
  if (sp) return `https://open.spotify.com/embed/${sp[1]}/${sp[2]}`;

  // Unknown — let the iframe try; user will see the platform's error.
  return url;
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
            <Stat k="BPM" v={mix.bpm} color={mix.color} />
            <Stat k="KEY" v={mix.key} />
            <Stat k="LENGTH" v={mix.length} />
            <Stat k="PLAYS" v={mix.plays} />
            <Stat k="DATE" v={mix.date} />
          </div>
          {(() => {
            const embed = normalizeEmbedUrl(mix.embedUrl);
            if (!embed) {
              return (
                <Waveform progress={0.36} color={mix.color} cues={mix.cues} seed={mix.seed}
                  height={46} bars={120} unplayedColor="var(--fg-faint)" />
              );
            }
            return (
              <iframe
                title={`${mix.title} — audio player`}
                src={embed}
                width="100%"
                height="180"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                style={{ display: 'block', borderRadius: 6, background: 'var(--surface-2)' }}
              />
            );
          })()}
        </div>

        <div style={{ padding: '16px 28px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
          <button onClick={onPlay} style={{
            background: accent, color: '#000', border: 'none',
            padding: '10px 16px', borderRadius: 999,
            fontFamily: 'var(--display)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em',
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>▶ PLAY NOW</button>
          <ActionBtn label="↓ DOWNLOAD" />
          <ActionBtn label="↗ SHARE" />
          <ActionBtn label="☁ SOUNDCLOUD" />
          <ActionBtn label="♥ SAVE" />
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
