import React from 'react';

// ── Waveform ──────────────────────────────────────────────────
export function Waveform({ progress = 0.32, color = '#c2ff00', bg = 'rgba(255,255,255,0.06)', cues = [0.12, 0.34, 0.58, 0.81], height = 56, bars = 120, seed = 7, unplayedColor = 'rgba(255,255,255,0.35)' }) {
  const data = React.useMemo(() => {
    const out = [];
    let s = seed;
    for (let i = 0; i < bars; i++) {
      s = (s * 9301 + 49297) % 233280;
      const r = s / 233280;
      const env = 0.35 + 0.65 * Math.sin((i / bars) * Math.PI);
      out.push(0.12 + r * 0.88 * env);
    }
    return out;
  }, [bars, seed]);

  return (
    <div style={{ position: 'relative', width: '100%', height, background: bg, borderRadius: 2, overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${bars} 100`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
        {data.map((h, i) => {
          const played = i / bars < progress;
          const y = 50 - h * 50;
          return (
            <rect key={i} x={i + 0.15} y={y} width={0.7} height={h * 100}
              fill={played ? color : unplayedColor} />
          );
        })}
      </svg>
      {cues.map((c, i) => (
        <div key={i} style={{ position: 'absolute', left: `${c * 100}%`, top: 0, bottom: 0, width: 1, background: color, opacity: 0.75 }}>
          <div style={{ position: 'absolute', top: -3, left: -3, width: 7, height: 7, background: color, transform: 'rotate(45deg)' }} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: `${progress * 100}%`, top: -3, bottom: -3, width: 2, background: 'var(--fg)', boxShadow: `0 0 8px ${color}` }} />
    </div>
  );
}

// ── LCD BPM / Key display ─────────────────────────────────────
export function LCD({ label, value, sub, color = '#c2ff00', bg = '#0a0a0a', fg = 'rgba(255,255,255,0.4)' }) {
  return (
    <div style={{
      background: bg,
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 4,
      padding: '6px 10px',
      fontFamily: 'var(--mono)',
      display: 'flex', flexDirection: 'column', gap: 1,
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6)',
    }}>
      <div style={{ fontSize: 8, letterSpacing: '0.14em', color: fg, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color, lineHeight: 1, fontFeatureSettings: '"tnum"' }}>{value}</div>
      {sub && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>{sub}</div>}
    </div>
  );
}

// ── Fader (vertical, draggable) ───────────────────────────────
export function Fader({ value, onChange, color = '#c2ff00', height = 120, label }) {
  const ref = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const handleMove = React.useCallback((clientY) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const v = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    onChange(v);
  }, [onChange]);

  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      // On touch, stop the page from scrolling while the finger drags
      // the fader. Needs passive:false on the listener for this to apply.
      if (e.touches) e.preventDefault();
      handleMove(e.touches ? e.touches[0].clientY : e.clientY);
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [dragging, handleMove]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div
        ref={ref}
        onMouseDown={(e) => { setDragging(true); handleMove(e.clientY); }}
        onTouchStart={(e) => { setDragging(true); handleMove(e.touches[0].clientY); }}
        style={{
          position: 'relative', width: 2, height,
          background: 'currentColor',
          opacity: 0.5,
          cursor: 'ns-resize', userSelect: 'none', touchAction: 'none',
          padding: 0,
        }}
      >
        <div style={{ position: 'absolute', inset: '0 -14px' }} />
        <div style={{
          position: 'absolute',
          left: -11, right: -11,
          top: `calc(${(1 - value) * 100}% - 2.5px)`,
          height: 5,
          background: color,
          opacity: 1,
          borderRadius: 0,
          pointerEvents: 'none',
        }} />
      </div>
      {label && <div style={{ fontSize: 8, fontFamily: 'var(--mono)', letterSpacing: '0.14em', color: 'var(--fg-dim)', textTransform: 'uppercase', fontWeight: 500 }}>{label}</div>}
    </div>
  );
}

// ── Knob (rotary, drag to turn) — flat 2D ─────────────────────
export function Knob({ value, onChange, label, color = '#c2ff00', size = 40, min = -1, max = 1 }) {
  const startRef = React.useRef(null);

  const onDown = (e) => {
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    startRef.current = { y, v: value };
    const onMove = (ev) => {
      // Block page scroll while turning the knob on touch.
      if (ev.touches) ev.preventDefault();
      const ny = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const dy = startRef.current.y - ny;
      const nv = Math.max(min, Math.min(max, startRef.current.v + (dy / 100) * (max - min)));
      onChange(nv);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const pct = (value - min) / (max - min);
  const startAngle = -135;
  const endAngle = 135;
  const angle = startAngle + pct * 270;
  const r = size / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;

  const rad = (a) => ((a - 90) * Math.PI) / 180;
  const p1 = [cx + r * Math.cos(rad(startAngle)), cy + r * Math.sin(rad(startAngle))];
  const p2 = [cx + r * Math.cos(rad(angle)), cy + r * Math.sin(rad(angle))];
  const largeArc = angle - startAngle > 180 ? 1 : 0;
  const track = `M ${p1[0]} ${p1[1]} A ${r} ${r} 0 ${largeArc} 1 ${p2[0]} ${p2[1]}`;
  const fullTrack = `M ${p1[0]} ${p1[1]} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(rad(endAngle))} ${cy + r * Math.sin(rad(endAngle))}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div
        onMouseDown={onDown}
        onTouchStart={onDown}
        style={{
          width: size, height: size, cursor: 'ns-resize',
          position: 'relative', userSelect: 'none', touchAction: 'none',
        }}
      >
        <svg width={size} height={size} style={{ display: 'block' }}>
          <path d={fullTrack} stroke="currentColor" strokeOpacity={0.45} strokeWidth="1.75" fill="none" strokeLinecap="round" />
          <path d={track} stroke={color} strokeWidth="2.25" fill="none" strokeLinecap="round" />
          <line
            x1={cx} y1={cy}
            x2={cx + (r - 2) * Math.cos(rad(angle))}
            y2={cy + (r - 2) * Math.sin(rad(angle))}
            stroke={color} strokeWidth="2.25" strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="2" fill={color} />
        </svg>
      </div>
      {label && <div style={{ fontSize: 8, fontFamily: 'var(--mono)', letterSpacing: '0.12em', color: 'var(--fg-dim)', textTransform: 'uppercase' }}>{label}</div>}
    </div>
  );
}

// ── VU meter (animated level bars) ────────────────────────────
export function VU({ level = 0.7, segments = 14, vertical = true, height = 100, seed = 1, colorMap }) {
  const [pulse, setPulse] = React.useState(level);
  React.useEffect(() => {
    let raf;
    let t = seed;
    const tick = () => {
      t += 0.05;
      const n = level + Math.sin(t * 1.7) * 0.1 + Math.sin(t * 5.3) * 0.06;
      setPulse(Math.max(0.05, Math.min(1, n)));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [level, seed]);

  const cells = Array.from({ length: segments }).map((_, i) => {
    const threshold = (i + 1) / segments;
    const on = pulse >= threshold;
    let color = '#22dd77';
    if (threshold > 0.7) color = '#ffcc00';
    if (threshold > 0.88) color = '#ff3b3b';
    if (colorMap) color = colorMap(threshold);
    return (
      <div key={i} style={{
        width: vertical ? '100%' : `calc(${100 / segments}% - 2px)`,
        height: vertical ? `calc(${100 / segments}% - 2px)` : '100%',
        background: on ? color : 'currentColor',
        opacity: on ? 1 : 0.25,
        borderRadius: 1,
      }} />
    );
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: vertical ? 'column-reverse' : 'row',
      gap: 2,
      width: vertical ? 8 : '100%',
      height: vertical ? height : 8,
    }}>{cells}</div>
  );
}

// ── Cue button ────────────────────────────────────────────────
export function CueButton({ idx, color = '#ff3bd4', active = false, onClick, label }) {
  return (
    <button onClick={onClick} style={{
      cursor: 'pointer', padding: '7px 8px',
      background: active ? color : 'transparent',
      border: `1px solid ${active ? color : 'var(--border)'}`,
      borderRadius: 3,
      color: active ? '#000' : color,
      fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em',
      textTransform: 'uppercase', display: 'flex', flexDirection: 'column',
      alignItems: 'flex-start', gap: 2, minHeight: 36,
      transition: 'background 0.08s, border-color 0.08s',
    }}>
      <span style={{ fontSize: 7, opacity: 0.7 }}>CUE {idx}</span>
      <span style={{ fontSize: 9, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

// ── Play/Pause icon ────────────────────────────────────────────
export function PlayIcon({ size = 20, playing = false, color = 'currentColor' }) {
  if (playing) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <rect x="6" y="5" width="4" height="14" />
        <rect x="14" y="5" width="4" height="14" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M7 5 L19 12 L7 19 Z" />
    </svg>
  );
}

// ── Marquee (scrolling text) ──────────────────────────────────
export function Marquee({ children, speed = 30, color = 'currentColor' }) {
  return (
    <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
      <div style={{
        display: 'inline-block',
        animation: `marquee ${speed}s linear infinite`,
        color,
      }}>
        {children}&nbsp;&nbsp;●&nbsp;&nbsp;{children}&nbsp;&nbsp;●&nbsp;&nbsp;{children}&nbsp;&nbsp;●&nbsp;&nbsp;
      </div>
    </div>
  );
}

// ── Scribble SVG (decorative hand-drawn accent) ───────────────
export function Scribble({ variant = 'loop', color = '#000', width = 80, height = 40, opacity = 0.7 }) {
  const paths = {
    loop: 'M5 20 Q15 5 25 20 T45 20 Q55 10 65 22 Q70 28 75 20',
    underline: 'M3 10 Q 20 4, 40 10 T 77 10',
    star: 'M20 5 L23 17 L35 17 L25 24 L28 36 L20 28 L12 36 L15 24 L5 17 L17 17 Z',
    arrow: 'M5 20 Q 30 5, 60 20 M55 12 L 65 20 L 55 28',
    squiggle: 'M3 20 Q 10 10, 18 20 T 34 20 T 50 20 T 66 20 T 77 20',
    circle: 'M40 8 Q 20 8 12 22 Q 12 34 30 36 Q 55 36 64 22 Q 64 8 45 7 Q 42 7 40 8',
    cross: 'M8 8 L 72 32 M 72 8 L 8 32',
  };
  return (
    <svg width={width} height={height} viewBox="0 0 80 40" style={{ opacity }}>
      <path d={paths[variant] || paths.loop} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
