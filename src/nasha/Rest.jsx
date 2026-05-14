import React from 'react';
import { Waveform, PlayIcon, Scribble, Marquee } from './widgets.jsx';
import { HomeA } from './HomeFull.jsx';
import { HomeAMin } from './HomeMin.jsx';
import { MixDetail, detectPlatform } from './extras.jsx';
import { NASHA_DATA, gigStatus } from '../content.js';

export function DeckA({ tweaks = {} }) {
  const D = NASHA_DATA;
  const accent = tweaks.accent || '#c2ff00';
  const density = tweaks.density || 'comfy';
  const gap = density === 'tight' ? 8 : density === 'loose' ? 18 : 12;
  const pad = density === 'tight' ? 14 : density === 'loose' ? 28 : 20;
  const [section, setSection] = React.useState('home');
  const [playingIdx, setPlayingIdx] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0.28);
  const [faders, setFaders] = React.useState({ a: 0.75, b: 0.55, master: 0.88 });
  const [knobs, setKnobs] = React.useState({ low: 0.1, mid: -0.15, high: 0.3, filter: 0 });
  const [pitch, setPitch] = React.useState(0.5);
  const [activeCue, setActiveCue] = React.useState(0);
  const [bookForm, setBookForm] = React.useState({ name: '', email: '', date: '', venue: '', msg: '' });
  const [sent, setSent] = React.useState(false);
  const [openMix, setOpenMix] = React.useState(null);
  const currentMix = D.mixes[playingIdx];

  React.useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      setProgress((p) => (p + 0.0015) % 1);
    }, 80);
    return () => clearInterval(id);
  }, [isPlaying]);

  const timeDisplay = (() => {
    const total = parseInt(currentMix.length.split(':')[0]) * 60 + parseInt(currentMix.length.split(':')[1]);
    const cur = Math.floor(total * progress);
    const m = Math.floor(cur / 60).toString().padStart(2, '0');
    const s = (cur % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  })();

  return (
    <div style={{
      width: '100%', minHeight: '100%',
      background: 'var(--bg)', color: 'var(--fg)',
      fontFamily: 'var(--display)',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-33.333%); } }
        @keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0.2; } }
        .blink { animation: blink 1s steps(2) infinite; }
        .hov-lift { transition: transform .15s, box-shadow .15s; }
        .hov-lift:hover { transform: translateY(-2px); }
        .bento-card { border-radius: 14px; position: relative; overflow: hidden; }
      `}</style>

      <NavA section={section} setSection={setSection} accent={accent} theme={tweaks.theme || 'dark'} setTheme={tweaks.__setTheme} />

      {tweaks.showTicker !== false && (
        <div style={{
          background: accent, color: '#000',
          fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.1em', padding: '6px 0',
          borderBottom: '1px solid rgba(0,0,0,0.2)',
        }}>
          <Marquee speed={40}>
            NOW SPINNING · {currentMix.title} · {currentMix.genre} · BOOKING OPEN FOR Q3 2026 · NEW MIX EVERY WEDNESDAY · AMSTERDAM · SANTIAGO · MEDELLÍN
          </Marquee>
        </div>
      )}

      <div style={{ padding: pad, maxWidth: 1400, margin: '0 auto' }}>
        {section === 'home' && (
          (tweaks.variant === 'minimal') ? (
            <HomeAMin D={D} setSection={setSection} accent={accent} gap={gap} />
          ) : (
            <HomeA D={D} currentMix={currentMix} progress={progress} isPlaying={isPlaying}
              setIsPlaying={setIsPlaying} timeDisplay={timeDisplay}
              faders={faders} setFaders={setFaders} knobs={knobs} setKnobs={setKnobs}
              pitch={pitch} setPitch={setPitch} activeCue={activeCue} setActiveCue={setActiveCue}
              setSection={setSection} accent={accent} gap={gap} showMixer={tweaks.showMixer !== false} />
          )
        )}
        {section === 'mixes' && (
          <MixesA D={D} playingIdx={playingIdx} setPlayingIdx={setPlayingIdx} progress={progress}
            isPlaying={isPlaying} setIsPlaying={setIsPlaying} accent={accent} onOpenMix={setOpenMix} />
        )}
        {section === 'gigs' && <GigsA D={D} accent={accent} />}
        {section === 'about' && <AboutA D={D} accent={accent} />}
        {section === 'booking' && <BookingA D={D} form={bookForm} setForm={setBookForm} sent={sent} setSent={setSent} accent={accent} />}
      </div>

      <FooterA D={D} accent={accent} />

      {openMix && (
        <MixDetail mix={openMix} accent={accent}
          onClose={() => setOpenMix(null)}
          onPlay={() => {
            const idx = D.mixes.findIndex((x) => x.id === openMix.id);
            if (idx >= 0) { setPlayingIdx(idx); setIsPlaying(true); }
            setOpenMix(null);
          }} />
      )}
    </div>
  );
}

function NavA({ section, setSection, accent, theme = 'dark', setTheme }) {
  const items = [
    { id: 'home', label: 'HOME' },
    { id: 'mixes', label: 'MIXES' },
    { id: 'gigs', label: 'GIGS' },
    { id: 'about', label: 'ABOUT' },
    { id: 'booking', label: 'BOOK' },
  ];
  return (
    <div className="nav-bar" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, background: 'color-mix(in oklab, var(--bg) 90%, transparent)', backdropFilter: 'blur(12px)',
      zIndex: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="nav-bar-logo-dot" style={{
          width: 28, height: 28, borderRadius: '50%',
          background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: '#000',
        }}>●</div>
        <span className="nav-bar-logo" style={{ fontSize: 16, fontWeight: 800, letterSpacing: '0.1em' }}>NASHA/FM</span>
        <span className="nav-bar-live" style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.15em', marginLeft: 6 }}>● LIVE</span>
      </div>
      <nav style={{ display: 'flex', gap: 4 }}>
        {items.map((it) => (
          <button key={it.id} onClick={() => setSection(it.id)} style={{
            background: section === it.id ? accent : 'transparent',
            color: section === it.id ? '#000' : 'var(--fg)',
            border: 'none', padding: '7px 14px', borderRadius: 999,
            fontFamily: 'var(--display)', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.12em', cursor: 'pointer',
          }}>{it.label}</button>
        ))}
      </nav>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="nav-bar-social" style={{ display: 'flex', gap: 8, fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.12em', color: 'var(--fg-dim)' }}>
          <span>IG</span><span>·</span><span>SC</span>
        </div>
        <button onClick={() => setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 999, padding: '4px', cursor: 'pointer',
            position: 'relative', height: 26, width: 52,
          }}>
          <span aria-hidden="true" style={{
            position: 'absolute', top: 2, left: theme === 'dark' ? 2 : 26,
            width: 22, height: 20, borderRadius: 999,
            background: accent, transition: 'left 0.18s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: '#000',
          }}>{theme === 'dark' ? '☾' : '☀'}</span>
          <span aria-hidden="true" style={{
            position: 'absolute', left: 7, fontSize: 10, color: theme === 'dark' ? 'transparent' : 'var(--fg-faint)',
          }}>☾</span>
          <span aria-hidden="true" style={{
            position: 'absolute', right: 7, fontSize: 10, color: theme === 'light' ? 'transparent' : 'var(--fg-faint)',
          }}>☀</span>
        </button>
      </div>
    </div>
  );
}

// ── MIXES ─────────────────────────────────────────────────────
function MixesA({ D, playingIdx, setPlayingIdx, progress, isPlaying, setIsPlaying, accent, onOpenMix }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12 }}>
        <div className="bento-card" style={{
          gridColumn: 'span 12', background: accent, color: '#000', padding: '24px 28px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em' }}>◉ LIBRARY</div>
              <div style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.9, marginTop: 6 }}>
                MIXES
              </div>
            </div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.12em', textAlign: 'right', maxWidth: 280 }}>
              NEW DROPS EVERY WEDNESDAY.<br />SORTED BY ENERGY, NOT DATE.
            </div>
          </div>
        </div>

        <div className="bento-card" style={{
          gridColumn: 'span 12', background: 'var(--surface-2)', border: '1px solid var(--border-soft)',
          padding: 0, overflow: 'hidden',
        }}>
          {D.mixes.map((m, i) => {
            const isCurrent = i === playingIdx;
            const platform = detectPlatform(m.embedUrl);
            return (
              <div key={m.id} className="mix-row" onClick={() => onOpenMix && onOpenMix(m)} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr auto',
                gap: 12, alignItems: 'center', padding: '16px', cursor: 'pointer',
                background: isCurrent ? `${accent}11` : 'transparent',
                borderBottom: '1px solid var(--border-soft)',
                borderLeft: isCurrent ? `3px solid ${accent}` : '3px solid transparent',
                fontFamily: 'var(--mono)', transition: 'background 0.1s',
              }}>
                <div style={{ fontSize: 10, color: isCurrent ? accent : 'var(--fg-faint)' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg)', fontFamily: 'var(--display)', letterSpacing: '-0.005em' }}>{m.title}</div>
                  <div style={{ fontSize: 9, color: 'var(--fg-dim)', letterSpacing: '0.12em', marginTop: 3 }}>{m.genre}</div>
                </div>
                {platform ? (
                  <a href={m.embedUrl} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title={`Play "${m.title}" on ${platform.name}`}
                    style={{
                      background: m.color, color: '#000', textDecoration: 'none',
                      padding: '9px 16px', borderRadius: 999,
                      fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      whiteSpace: 'nowrap',
                    }}>
                    {platform.host === 'youtube' ? 'WATCH' : 'PLAY'}
                  </a>
                ) : (
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--fg-faint)',
                    letterSpacing: '0.1em', textAlign: 'right', opacity: 0.6,
                  }}>NO LINK</div>
                )}
              </div>
            );
          })}
        </div>

        {(() => {
          const m = D.mixes[playingIdx];
          const platform = detectPlatform(m.embedUrl);
          return (
            <div className="bento-card" style={{
              gridColumn: 'span 7', background: m.color, color: '#000', padding: 24,
              minHeight: 280, position: 'relative',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em' }}>◉ FEATURED</div>
              <div style={{ fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 0.95, marginTop: 12 }}>
                {m.title}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', marginTop: 6 }}>
                {m.genre} · {m.length}
              </div>
              {m.blurb && (
                <div style={{ fontSize: 15, lineHeight: 1.45, marginTop: 16, maxWidth: 560, letterSpacing: '-0.005em' }}>
                  {m.blurb}
                </div>
              )}
              {platform && (
                <a href={m.embedUrl} target="_blank" rel="noopener noreferrer" style={{
                  marginTop: 'auto', alignSelf: 'flex-start',
                  background: '#0a0a0a', color: m.color, textDecoration: 'none',
                  padding: '12px 22px', borderRadius: 999,
                  fontFamily: 'var(--display)', fontSize: 13, fontWeight: 800, letterSpacing: '0.14em',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}>
                  {platform.host === 'youtube' ? 'WATCH ON' : 'PLAY ON'} {platform.name.toUpperCase()} ↗
                </a>
              )}
              <div style={{ position: 'absolute', top: 20, right: 20 }}>
                <Scribble variant="star" color="#000" width={60} height={50} opacity={0.85} />
              </div>
            </div>
          );
        })()}

        <div className="bento-card" style={{
          gridColumn: 'span 5', background: 'var(--surface)', color: 'var(--fg)', padding: 20,
          border: '1px solid var(--border-soft)',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-dim)' }}>◉ TRACKLIST · PREVIEW</div>
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(D.mixes[playingIdx].tracklist || []).slice(0, 6).map((t, i) => (
              <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg)', letterSpacing: '0.02em', borderBottom: '1px dashed var(--border)', paddingBottom: 6 }}>
                {String(i + 1).padStart(2, '0')}  {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── GIGS (calendar + list) ────────────────────────────────────
function GigsA({ D, accent }) {
  // Default month + selected-day track the next upcoming gig so the page
  // lands on something useful instead of a blank "SELECT A DATE" panel.
  const upcomingAll = React.useMemo(
    () => D.gigs.filter((g) => gigStatus(g) === 'UPCOMING'),
    [D.gigs]
  );
  const nextGig = upcomingAll[0];
  const today = new Date();

  const [month, setMonth] = React.useState(nextGig?.month ?? today.getMonth());
  const [year, setYear] = React.useState(nextGig?.year ?? today.getFullYear());
  // The month-change effect below sets the real value on mount too; null is
  // just the pre-effect placeholder.
  const [selected, setSelected] = React.useState(nextGig?.day ?? null);

  // When the user navigates months, re-pick the most relevant day: next
  // upcoming gig in that month, else the first played gig, else nothing.
  React.useEffect(() => {
    const gigsInMonth = D.gigs.filter((g) => g.month === month && g.year === year);
    const upcomingInMonth = gigsInMonth
      .filter((g) => gigStatus(g) === 'UPCOMING')
      .sort((a, b) => a.day - b.day);
    if (upcomingInMonth.length) setSelected(upcomingInMonth[0].day);
    else if (gigsInMonth.length) setSelected(gigsInMonth[0].day);
    else setSelected(null);
  }, [month, year, D.gigs]);

  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const firstDay = new Date(year, month, 1).getDay();
  const mondayOffset = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const gigsThisMonth = D.gigs.filter((g) => g.month === month && g.year === year);
  const gigByDay = Object.fromEntries(gigsThisMonth.map((g) => [g.day, g]));

  // Wrap month nav to also walk year boundaries.
  const goMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m);
    setYear(y);
  };

  const cells = [];
  for (let i = 0; i < mondayOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12 }}>
        <div className="bento-card" style={{
          gridColumn: 'span 12', background: '#ff4d1a', color: '#0a0a0a', padding: '24px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em' }}>◉ LIVE DATES</div>
            <div style={{ fontSize: 'clamp(48px, 7vw, 96px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.9, marginTop: 6 }}>
              GIGS
            </div>
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.5, maxWidth: 320, textAlign: 'right' }}>
            {upcomingAll.length} UPCOMING · {D.gigs.filter(g => gigStatus(g) === 'PLAYED').length} PLAYED<br />
            AMSTERDAM · ROTTERDAM · EU
          </div>
        </div>

        <div className="bento-card" style={{
          gridColumn: 'span 8', background: 'var(--surface-2)', color: 'var(--fg)',
          padding: 20, border: '1px solid var(--border)', minHeight: 480,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
              <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em' }}>{monthNames[month]}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--fg-dim)' }}>{year}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => goMonth(-1)} style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--fg)', width: 30, height: 30, borderRadius: '50%',
                cursor: 'pointer', fontFamily: 'var(--mono)',
              }}>‹</button>
              <button onClick={() => goMonth(1)} style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--fg)', width: 30, height: 30, borderRadius: '50%',
                cursor: 'pointer', fontFamily: 'var(--mono)',
              }}>›</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6,
            fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--fg-faint)' }}>
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
              <div key={d} style={{ padding: '6px 8px' }}>{d}</div>
            ))}
          </div>

          <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const gig = gigByDay[d];
              const isSelected = selected === d;
              const status = gig ? gigStatus(gig) : null;
              return (
                <button key={i} className="calendar-cell" onClick={() => gig && setSelected(d)} style={{
                  background: gig ? (status === 'UPCOMING' ? accent : 'var(--surface)') : 'var(--surface-2)',
                  color: status === 'UPCOMING' ? '#000' : 'var(--fg)',
                  border: isSelected ? '2px solid var(--fg)' : '1px solid var(--border-soft)',
                  borderRadius: 8, padding: '8px 8px',
                  aspectRatio: '1/1',
                  cursor: gig ? 'pointer' : 'default',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between',
                  transition: 'transform 0.12s, border 0.12s',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}>
                  <div className="calendar-cell-day" style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700 }}>{d}</div>
                  {gig && (
                    <div className="calendar-cell-venue" style={{ fontFamily: 'var(--mono)', fontSize: 8, letterSpacing: '0.08em',
                      textAlign: 'left', lineHeight: 1.25, opacity: 0.9, fontWeight: 600 }}>
                      {gig.venue.toUpperCase()}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bento-card" style={{
          gridColumn: 'span 4', background: 'var(--surface)', color: 'var(--fg)',
          padding: 20, border: '1px solid var(--border)', minHeight: 480,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-dim)' }}>
            ◉ {selected && gigByDay[selected] ? 'GIG DETAILS' : 'SELECT A DATE →'}
          </div>
          {selected && gigByDay[selected] ? (() => {
            const g = gigByDay[selected];
            const status = gigStatus(g);
            return (
              <>
                <div style={{ fontSize: 72, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.9, marginTop: 14, color: accent }}>
                  {monthNames[g.month].slice(0, 3)}<br />{g.day}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--fg-dim)', marginTop: 6 }}>
                  {g.dow} · {status}
                </div>
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.015em' }}>{g.venue}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-dim)', marginTop: 4 }}>{g.city}</div>
                </div>
                <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <DetailRow label="SET" value={g.kind} />
                  <DetailRow label="TIME" value={g.time} />
                  {g.tickets && <DetailRow label="TIX" value={g.tickets} />}
                </div>
                {status === 'UPCOMING' && (
                  <button style={{
                    marginTop: 'auto', background: accent, color: '#000',
                    border: 'none', padding: '12px 18px', borderRadius: 999,
                    fontFamily: 'var(--display)', fontWeight: 800, fontSize: 13,
                    letterSpacing: '0.12em', cursor: 'pointer',
                  }}>
                    GET TICKETS →
                  </button>
                )}
              </>
            );
          })() : (
            <div style={{ marginTop: 'auto', color: 'var(--fg-faint)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.1em' }}>
              CLICK A HIGHLIGHTED<br />DATE FOR DETAILS.
            </div>
          )}
        </div>

        <div className="bento-card gigs-schedule" style={{
          gridColumn: 'span 12', background: 'var(--bg)', padding: 0,
          border: '1px solid var(--border-soft)',
        }}>
          <div style={{ padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em',
            color: 'var(--fg-dim)', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>◉ FULL SCHEDULE</span>
            <span>UPCOMING + PLAYED</span>
          </div>
          {D.gigs.map((g, i) => {
            const status = gigStatus(g);
            return (
              <div key={i} className="schedule-row" style={{
                display: 'grid', gridTemplateColumns: '90px 80px 1fr 200px 140px 80px',
                gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-soft)',
                fontFamily: 'var(--mono)', fontSize: 12, alignItems: 'center',
                opacity: status === 'PLAYED' ? 0.55 : 1,
              }}>
                <div className="sr-date" style={{ color: status === 'UPCOMING' ? accent : 'var(--fg)', letterSpacing: '0.1em', fontWeight: 700 }}>{g.date}</div>
                <div className="sr-dow" style={{ color: 'var(--fg-faint)', fontSize: 10, letterSpacing: '0.15em' }}>{g.dow}</div>
                <div className="sr-venue" style={{ color: 'var(--fg)', fontFamily: 'var(--display)', fontWeight: 700, fontSize: 14 }}>{g.venue}</div>
                <div className="sr-city" style={{ color: 'var(--fg-dim)' }}>{g.city}</div>
                <div className="sr-kind" style={{ color: 'var(--fg-dim)' }}>{g.kind}</div>
                <div className="sr-status" style={{ color: status === 'UPCOMING' ? accent : 'var(--fg-faint)', textAlign: 'right', fontSize: 10, letterSpacing: '0.15em' }}>
                  {status}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 11, borderBottom: '1px dashed var(--border)', paddingBottom: 6 }}>
      <span style={{ color: 'var(--fg-dim)', letterSpacing: '0.15em' }}>{label}</span>
      <span style={{ color: 'var(--fg)' }}>{value}</span>
    </div>
  );
}

// ── ABOUT ─────────────────────────────────────────────────────
function AboutA({ D, accent }) {
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12 }}>
        <div className="bento-card" style={{
          gridColumn: 'span 12', background: 'var(--bg)', color: 'var(--fg)',
          border: '1px solid var(--border)', padding: '18px 24px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--fg-dim)' }}>◉ PRESS KIT</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-faint)', letterSpacing: '0.1em' }}>v.2026.01 · EPK</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{
              background: accent, color: '#000', border: 'none', padding: '8px 14px',
              borderRadius: 999, fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.15em', cursor: 'pointer',
            }}>↓ DOWNLOAD EPK.PDF</button>
            <button style={{
              background: 'transparent', color: 'var(--fg)', border: '1px solid var(--border)',
              padding: '8px 14px', borderRadius: 999, fontFamily: 'var(--mono)',
              fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', cursor: 'pointer',
            }}>↓ PHOTO PACK.ZIP</button>
          </div>
        </div>

        <div className="bento-card" style={{
          gridColumn: 'span 8', background: 'var(--surface)', color: 'var(--fg)', padding: 28,
          minHeight: 420, border: '1px solid var(--border-soft)', position: 'relative',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-dim)' }}>
            ◉ BIO / LONG
          </div>
          <div style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.95, marginTop: 12 }}>
            Chilena.<br />
            <span style={{ color: accent }}>Amsterdamer.</span><br />
            Selector.
          </div>
          <div style={{ maxWidth: 620, fontSize: 15, lineHeight: 1.55, color: 'var(--fg)', marginTop: 20, fontFamily: 'var(--display)', letterSpacing: '-0.002em' }}>
            {D.bio}
          </div>
          <div style={{ position: 'absolute', right: 20, bottom: 20 }}>
            <Scribble variant="arrow" color={accent} width={120} height={32} opacity={0.8} />
          </div>
        </div>

        <div className="bento-card" style={{
          gridColumn: 'span 4', background: accent, minHeight: 420,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: 16, color: '#000', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em' }}>◉ PORTRAIT · HI-RES</div>
          {D.portrait ? (
            <div style={{ flex: 1, margin: '10px 0', borderRadius: 8, overflow: 'hidden' }}>
              <img src={D.portrait} alt="Nasha portrait" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          ) : (
            <PhotoPlaceholder label="PORTRAIT — NASHA" />
          )}
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.1em' }}>
            PHOTO: __________<br />USE: EDITORIAL / POSTER
          </div>
        </div>

        <div className="bento-card" style={{
          gridColumn: 'span 5', background: 'var(--surface-2)', color: 'var(--fg)', padding: 22,
          border: '1px solid var(--border-soft)', minHeight: 340,
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-dim)' }}>
            ◉ FACT SHEET
          </div>
          <div className="fact-sheet" style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {D.press.specs.map((s, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10,
                padding: '9px 0', borderBottom: '1px dashed var(--border)',
                fontFamily: 'var(--mono)', fontSize: 12,
              }}>
                <span style={{ color: 'var(--fg-dim)', letterSpacing: '0.12em', fontSize: 10 }}>{s.k}</span>
                <span style={{ color: 'var(--fg)' }}>{s.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bento-card" style={{
          gridColumn: 'span 7', background: '#ff4d1a', color: '#0a0a0a', padding: 22, minHeight: 340,
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em' }}>◉ TECHNICAL RIDER</div>
          <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em', marginTop: 8, lineHeight: 1 }}>
            What Nasha needs<br />to make it hit.
          </div>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
            {D.press.rider.map((r, i) => (
              <div key={i} style={{
                padding: '8px 0', borderBottom: '1px dashed rgba(0,0,0,0.25)',
                fontFamily: 'var(--mono)', fontSize: 11,
              }}>
                <div style={{ fontSize: 9, letterSpacing: '0.15em', opacity: 0.7, fontWeight: 700 }}>{r.k}</div>
                <div style={{ fontSize: 12, marginTop: 2 }}>{r.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="press-quotes-grid" style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {D.press.quotes.map((q, i) => (
            <div key={i} className="bento-card" style={{
              background: i === 0 ? accent : (i === 1 ? 'var(--surface)' : '#a87bff'),
              color: i === 1 ? 'var(--fg)' : '#000',
              padding: 22, minHeight: 200,
              border: i === 1 ? '1px solid var(--border-soft)' : 'none',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 0.8, opacity: i === 1 ? 0.4 : 0.8 }}>"</div>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                {q.text}
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', marginTop: 12, opacity: 0.75 }}>
                — {q.source.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        <div className="stats-grid" style={{ gridColumn: 'span 12', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { k: '24', l: 'MIXES RELEASED', sub: 'Since Jan 2023' },
            { k: '62.9K', l: 'LIFETIME PLAYS', sub: 'Across platforms' },
            { k: '18', l: 'GIGS PLAYED', sub: 'NL / ES / DE / CL' },
            { k: '04', l: 'RESIDENCIES', sub: 'AMS + RTM' },
          ].map((s, i) => (
            <div key={i} className="bento-card" style={{
              background: 'var(--surface)', border: '1px solid var(--border-soft)',
              padding: 18, minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em', color: 'var(--fg-dim)' }}>{s.l}</div>
              <div>
                <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, color: accent }}>{s.k}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--fg-dim)', marginTop: 4, letterSpacing: '0.08em' }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bento-card" style={{ gridColumn: 'span 12', background: 'var(--bg)', padding: 0 }}>
          <div style={{ padding: '10px 16px', fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.15em',
            color: 'var(--fg-dim)', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>◉ PRESS PHOTOS</span>
            <span>HI-RES · CLICK TO DOWNLOAD</span>
          </div>
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, padding: 4 }}>
            {D.gallery.map((p, i) => (
              <div key={i} style={{
                aspectRatio: '1/1', background: p.tone, position: 'relative',
                display: 'flex', alignItems: 'flex-end', padding: 10,
                borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
              }}>
                {p.image ? (
                  <img src={p.image} alt={p.label}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: `repeating-linear-gradient(135deg, rgba(0,0,0,0.08) 0 6px, transparent 6px 14px)`,
                  }} />
                )}
                <div style={{
                  fontFamily: 'var(--mono)', fontSize: 9,
                  color: p.image ? '#fff' : '#000',
                  letterSpacing: '0.1em', position: 'relative', fontWeight: 700,
                  textShadow: p.image ? '0 1px 4px rgba(0,0,0,0.6)' : 'none',
                }}>
                  {p.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoPlaceholder({ label }) {
  return (
    <div style={{
      flex: 1, background: 'rgba(0,0,0,0.15)',
      borderRadius: 8, position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '10px 0',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(135deg, rgba(0,0,0,0.06) 0 10px, transparent 10px 24px)`,
      }} />
      <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(0,0,0,0.55)', letterSpacing: '0.12em', position: 'relative', textAlign: 'center' }}>
        ⬒ {label}<br /><span style={{ fontSize: 8, opacity: 0.6 }}>DROP IMAGE HERE</span>
      </div>
    </div>
  );
}

// ── BOOKING ───────────────────────────────────────────────────
function BookingA({ D, form, setForm, sent, setSent, accent }) {
  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 12 }}>
        <div className="bento-card" style={{
          gridColumn: 'span 7', background: '#a87bff', color: '#0a0a0a', padding: 28,
          minHeight: 420, position: 'relative',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.18em' }}>◉ BOOK A SET</div>
          <div style={{ fontSize: 'clamp(48px, 6.5vw, 88px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.92, marginTop: 10 }}>
            WANT NASHA<br />AT YOUR PARTY?
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 12, marginTop: 16, maxWidth: 420, lineHeight: 1.5 }}>
            Fill this in. You'll hear back within 48h. For press, interviews, or radio, use the same form and mention it in the message.
          </div>
          <div style={{ marginTop: 24, fontFamily: 'var(--mono)', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>📧 {D.links.email}</div>
            <div>📱 {D.links.instagram}</div>
            <div>🎧 soundcloud{D.links.soundcloud}</div>
          </div>
          <div style={{ position: 'absolute', right: 20, bottom: 20 }}>
            <Scribble variant="circle" color="#0a0a0a" width={110} height={60} opacity={0.8} />
          </div>
        </div>

        <div className="bento-card" style={{
          gridColumn: 'span 5', background: 'var(--surface-2)', border: '1px solid var(--border)',
          padding: 24, color: 'var(--fg)',
        }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.18em', color: 'var(--fg-dim)', marginBottom: 18 }}>
            ◉ BOOKING REQUEST / FORM.01
          </div>
          {sent ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: accent, letterSpacing: '-0.02em' }}>SENT ✓</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--fg-dim)', marginTop: 10, letterSpacing: '0.1em' }}>
                TALK SOON. — NASHA
              </div>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormInputA label="YOUR NAME" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <FormInputA label="EMAIL" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <FormInputA label="DATE" value={form.date} onChange={(v) => setForm({ ...form, date: v })} placeholder="2026-XX-XX" />
                <FormInputA label="VENUE / CITY" value={form.venue} onChange={(v) => setForm({ ...form, venue: v })} />
              </div>
              <FormInputA label="MESSAGE" value={form.msg} onChange={(v) => setForm({ ...form, msg: v })} textarea />
              <button type="submit" style={{
                background: accent, color: '#000', border: 'none',
                padding: '14px 20px', fontFamily: 'var(--display)',
                fontSize: 14, fontWeight: 800, letterSpacing: '0.15em',
                borderRadius: 999, cursor: 'pointer', marginTop: 4,
              }}>SEND REQUEST →</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function FormInputA({ label, value, onChange, type = 'text', placeholder, textarea }) {
  const base = {
    width: '100%', background: 'var(--surface)',
    border: '1px solid var(--border)',
    color: 'var(--fg)', padding: '10px 12px', borderRadius: 4,
    fontFamily: 'var(--mono)', fontSize: 13, letterSpacing: '0.02em',
    outline: 'none',
  };
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--fg-dim)', marginBottom: 5 }}>
        {label}
      </div>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} placeholder={placeholder} style={{ ...base, resize: 'vertical' }} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={base} />
      )}
    </div>
  );
}

function FooterA({ D, accent }) {
  return (
    <div style={{ borderTop: '1px solid var(--border)', marginTop: 40, padding: '20px', fontFamily: 'var(--mono)' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
        <div style={{ fontSize: 'clamp(56px, 10vw, 140px)', fontFamily: 'var(--display)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 0.85, color: accent }}>
          NASHA/FM
        </div>
        <div style={{ fontSize: 11, color: 'var(--fg-dim)', letterSpacing: '0.1em', lineHeight: 1.7 }}>
          © 2026 NASHA · AMSTERDAM · SANTIAGO<br />
          BOOKING: {D.links.email}
        </div>
      </div>
    </div>
  );
}
