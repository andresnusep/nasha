(() => {
  'use strict';

  const MULTS = [
    { mult: '½×', k: 0.5 },
    { mult: '¾×', k: 0.75 },
    { mult: '1×', k: 1 },
    { mult: '1½×', k: 1.5 },
    { mult: '2×', k: 2 },
  ];
  const TOL_OPTS = [3, 6, 8];
  const PRESETS = [90, 120, 124, 128, 140, 174];
  const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];

  const IH = 44;
  const INT_MIN = 60;
  const INT_MAX = 200;
  const INT_COUNT = INT_MAX - INT_MIN + 1;

  const fmt = (v) => (Math.round(v * 10) / 10).toFixed(1);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  const state = {
    bpm: 126,
    tol: 6,
    typed: '',
    mode: 'wheel',
    pinned: null,
  };

  const els = {
    bpmLabel: document.getElementById('bpmLabel'),
    tolGroup: document.getElementById('tolGroup'),
    results: document.getElementById('results'),
    modeGroup: document.getElementById('modeGroup'),
    wheelPanel: document.getElementById('wheelPanel'),
    presets: document.getElementById('presets'),
    rollInt: document.getElementById('rollInt'),
    rollDec: document.getElementById('rollDec'),
    typePanel: document.getElementById('typePanel'),
    typedVal: document.getElementById('typedVal'),
    keypad: document.getElementById('keypad'),
    matchBtn: document.getElementById('matchBtn'),
  };

  let syncing = false;
  let syncTimer = null;
  let lastUserScroll = 0;
  let rafInt = null;
  let rafDec = null;

  // ---- builders (run once) ----

  function buildTolGroup() {
    els.tolGroup.innerHTML = '';
    TOL_OPTS.forEach((t) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = '±' + t + '%';
      b.dataset.tol = String(t);
      b.addEventListener('click', () => {
        state.tol = t;
        render();
      });
      els.tolGroup.appendChild(b);
    });
  }

  function buildModeGroup() {
    els.modeGroup.innerHTML = '';
    [['wheel', 'Wheel'], ['type', 'Type']].forEach(([id, label]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.dataset.mode = id;
      b.addEventListener('click', () => setMode(id));
      els.modeGroup.appendChild(b);
    });
  }

  function buildResults() {
    els.results.innerHTML = '';
    MULTS.forEach((m, i) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'match-row';
      row.dataset.idx = String(i);
      row.innerHTML =
        '<span class="mult"></span><span class="val"></span><span class="range"></span>';
      row.addEventListener('click', () => {
        state.pinned = state.pinned === i ? null : i;
        render();
      });
      els.results.appendChild(row);
    });
  }

  function buildPresets() {
    els.presets.innerHTML = '';
    PRESETS.forEach((v) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = String(v);
      b.dataset.preset = String(v);
      b.addEventListener('click', () => setBpm(v));
      els.presets.appendChild(b);
    });
  }

  function buildRoller(el, count, offset) {
    el.innerHTML = '';
    const frag = document.createDocumentFragment();
    for (let n = 0; n < count; n++) {
      const item = document.createElement('div');
      item.className = 'item';
      item.textContent = String(n + offset);
      frag.appendChild(item);
    }
    el.appendChild(frag);
  }

  function buildKeypad() {
    els.keypad.innerHTML = '';
    KEYS.forEach((k) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = k === 'del' ? '⌫' : k;
      if (k === 'del' || k === '.') b.classList.add('muted');
      b.addEventListener('click', () => press(k));
      els.keypad.appendChild(b);
    });
  }

  // ---- roller sync/read ----

  function bpmToIndices(bpm) {
    const i = Math.floor(bpm + 0.0001) - INT_MIN;
    const d = Math.round((bpm - Math.floor(bpm + 0.0001)) * 10);
    return { i, d };
  }

  function sync(smooth) {
    const { i, d } = bpmToIndices(state.bpm);
    const opt = { behavior: smooth ? 'smooth' : 'auto' };
    syncing = true;
    els.rollInt.scrollTo({ ...opt, top: i * IH });
    els.rollDec.scrollTo({ ...opt, top: d * IH });
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => { syncing = false; }, smooth ? 500 : 90);
  }

  function readRoll() {
    if (syncing) return;
    const i = clamp(Math.round(els.rollInt.scrollTop / IH), 0, INT_COUNT - 1);
    const d = clamp(Math.round(els.rollDec.scrollTop / IH), 0, 9);
    const bpm = Math.round((INT_MIN + i + d / 10) * 10) / 10;
    if (bpm !== state.bpm) {
      state.bpm = bpm;
      render();
    }
  }

  function onRollScroll(which) {
    lastUserScroll = Date.now();
    if (which === 'int') {
      if (rafInt) cancelAnimationFrame(rafInt);
      rafInt = requestAnimationFrame(readRoll);
    } else {
      if (rafDec) cancelAnimationFrame(rafDec);
      rafDec = requestAnimationFrame(readRoll);
    }
  }

  function watch() {
    if (state.mode !== 'wheel' || syncing) return;
    if (Date.now() - lastUserScroll < 700) return;
    const { i, d } = bpmToIndices(state.bpm);
    const curI = Math.round(els.rollInt.scrollTop / IH);
    const curD = Math.round(els.rollDec.scrollTop / IH);
    if (curI !== i || curD !== d) sync(false);
  }

  // ---- state actions ----

  function setBpm(v) {
    state.bpm = Math.round(v * 10) / 10;
    state.typed = '';
    render();
    sync(true);
  }

  function setMode(id) {
    if (state.mode === id) return;
    state.mode = id;
    state.typed = '';
    render();
    if (id === 'wheel') requestAnimationFrame(() => sync(false));
  }

  function press(ch) {
    let t = state.typed;
    if (ch === 'del') t = t.slice(0, -1);
    else if (ch === '.') { if (!t.includes('.') && t.length) t += '.'; }
    else if (t.replace('.', '').length < 4) t += ch;
    state.typed = t;
    render();
  }

  function applyTyped() {
    const v = parseFloat(state.typed);
    if (!isNaN(v) && v >= 40 && v <= 220) {
      state.bpm = Math.round(v * 10) / 10;
      state.typed = '';
      state.mode = 'wheel';
      render();
      requestAnimationFrame(() => sync(false));
    } else {
      state.typed = '';
      render();
    }
  }

  // ---- render ----

  function render() {
    const { bpm, tol, typed, mode, pinned } = state;

    els.bpmLabel.textContent = fmt(bpm);

    els.tolGroup.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', Number(b.dataset.tol) === tol);
    });

    els.modeGroup.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });

    els.results.querySelectorAll('.match-row').forEach((row, i) => {
      const m = MULTS[i];
      const v = bpm * m.k;
      const hot = m.k === 1;
      const isPinned = pinned === i;
      row.classList.toggle('hot', hot);
      row.classList.toggle('pinned', isPinned);
      row.querySelector('.mult').textContent = m.mult;
      row.querySelector('.val').textContent = fmt(v);
      row.querySelector('.range').textContent =
        fmt(v * (1 - tol / 100)) + ' – ' + fmt(v * (1 + tol / 100));
    });

    els.presets.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', Math.abs(bpm - Number(b.dataset.preset)) < 0.05);
    });

    els.wheelPanel.hidden = mode !== 'wheel';
    els.typePanel.hidden = mode !== 'type';

    const typedDisplay = typed || fmt(bpm);
    els.typedVal.textContent = typedDisplay;
    els.typedVal.classList.toggle('filled', !!typed);
  }

  // ---- init ----

  function init() {
    buildTolGroup();
    buildModeGroup();
    buildResults();
    buildPresets();
    buildRoller(els.rollInt, INT_COUNT, INT_MIN);
    buildRoller(els.rollDec, 10, 0);
    buildKeypad();

    els.rollInt.addEventListener('scroll', () => onRollScroll('int'));
    els.rollDec.addEventListener('scroll', () => onRollScroll('dec'));
    els.matchBtn.addEventListener('click', applyTyped);

    render();
    requestAnimationFrame(() => sync(false));
    setInterval(watch, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
