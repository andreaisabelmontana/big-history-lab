// ============================================================
// big-history-lab — 9 visual demos for "The Big History of Ideas
// and Innovation" (IE BCSAI). Thresholds, cosmic time, S-curves,
// accelerating returns, population, idea genealogy, complexity,
// a pan/zoom revolutions timeline, and collective learning.
// Each demo is an IIFE with an idempotent draw() that refits the
// canvas, clears, and fully redraws; risky math is clamped/guarded.
// ============================================================

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
function n(id, fallback) {
  const el = document.getElementById(id);
  const v = el ? +el.value : NaN;
  return Number.isFinite(v) ? v : fallback;
}
const $ = id => document.getElementById(id);
const setText = (id, t) => { const el = $(id); if (el) el.textContent = t; };

const ACCENT = '#4338CA';
const ACCENT_S = 'rgba(67,56,202,0.16)';
const RULE  = '#E5E5EA';
const RULE_H = '#CDCDD4';
const INK   = '#15151A';
const INK_S = '#4B4B55';
const MUTED = '#8A8A92';
const GOOD  = '#16A34A';
const WARN  = '#F59E0B';
const BAD   = '#DC2626';

function fitCanvas(cv) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const rect = cv.getBoundingClientRect();
  const cssW = Math.max(80, rect.width);
  const cssH = Math.max(80, parseInt(cv.getAttribute('height'), 10) || 280);
  cv.width  = Math.floor(cssW * dpr);
  cv.height = Math.floor(cssH * dpr);
  cv.style.height = cssH + 'px';
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = '12px Inter, sans-serif';
  ctx.textBaseline = 'alphabetic';
  return { ctx, w: cssW, h: cssH };
}
function ptr(cv, ev) {
  const r = cv.getBoundingClientRect();
  return { x: ev.clientX - r.left, y: ev.clientY - r.top };
}
function fmtYears(y) {
  const a = Math.abs(y);
  if (a >= 1e9) return (y / 1e9).toFixed(2) + ' Bya';
  if (a >= 1e6) return (y / 1e6).toFixed(1) + ' Mya';
  if (a >= 1e3) return (y / 1e3).toFixed(0) + ' kya';
  return Math.round(y) + ' ya';
}
function fmtBig(x) {
  if (!Number.isFinite(x)) return '—';
  const a = Math.abs(x);
  if (a >= 1e12) return (x / 1e12).toFixed(2) + 'T';
  if (a >= 1e9) return (x / 1e9).toFixed(2) + 'B';
  if (a >= 1e6) return (x / 1e6).toFixed(2) + 'M';
  if (a >= 1e3) return (x / 1e3).toFixed(1) + 'k';
  return x.toFixed(0);
}

// ============================================================
// 1. EIGHT THRESHOLDS — log timeline + detail
// ============================================================
(function thresholds() {
  const cv = $('cv-thr'); if (!cv) return;
  const T = [
    { yago: 13.8e9, name: 'Big Bang', what: 'space, time, energy',
      desc: 'Everything begins. Energy, matter, space and time appear in the first instant — the substrate for all later complexity.' },
    { yago: 13.4e9, name: 'Stars', what: 'first stars & galaxies',
      desc: 'Gravity pulls hydrogen and helium into the first stars, whose cores become furnaces hot enough to forge new things.' },
    { yago: 13.4e9, name: 'New elements', what: 'chemistry of the cosmos',
      desc: 'Dying stars and supernovae fuse and scatter heavier elements — carbon, oxygen, iron — the chemical alphabet of planets and life.' },
    { yago: 4.567e9, name: 'Earth forms', what: 'planets & solar system',
      desc: 'Our Sun and rocky Earth condense. Chemically rich planets give complex chemistry a stable home.' },
    { yago: 3.8e9, name: 'Life', what: 'self-replicating cells',
      desc: 'Life appears in Earth’s "Goldilocks" zone — liquid water, energy, diverse chemistry — and begins to evolve.' },
    { yago: 200000, name: 'Humans', what: 'collective learning',
      desc: 'Homo sapiens can share information through symbolic language, so knowledge accumulates between generations: collective learning.' },
    { yago: 11000, name: 'Agriculture', what: 'farming & cities',
      desc: 'Farming lets dense populations settle. Surplus food funds writing, specialists, states — Sumer, Egypt, the hydraulic civilizations.' },
    { yago: 250, name: 'Modern revolution', what: 'global, fossil, digital',
      desc: 'Science, industry and global networks fuse into an accelerating modern world — from the steam engine to silicon chips and AI.' },
  ];
  let sel = 0;
  const Y0 = 14e9;
  function xOf(yago, w) {
    const a = Math.log10(clamp(yago, 200, Y0));
    const lo = Math.log10(200), hi = Math.log10(Y0);
    return w - 40 - (a - lo) / (hi - lo) * (w - 70);
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    sel = clamp(Math.round(n('thr-sel', 0)), 0, T.length - 1);
    const axisY = h * 0.62;
    ctx.strokeStyle = RULE_H; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(30, axisY); ctx.lineTo(w - 30, axisY); ctx.stroke();
    ctx.textAlign = 'center'; ctx.font = '10px JetBrains Mono, monospace'; ctx.fillStyle = MUTED;
    [13.8e9, 1e9, 1e6, 1e3, 200].forEach(v => {
      const x = xOf(v, w);
      ctx.strokeStyle = RULE; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, axisY - 5); ctx.lineTo(x, axisY + 5); ctx.stroke();
      ctx.fillStyle = MUTED; ctx.fillText(fmtYears(v), x, axisY + 20);
    });
    T.forEach((t, i) => {
      const x = xOf(t.yago, w);
      const on = i === sel;
      const stalk = on ? 60 : 38 + (i % 2) * 14;
      ctx.strokeStyle = on ? ACCENT : RULE_H; ctx.lineWidth = on ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(x, axisY); ctx.lineTo(x, axisY - stalk); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, axisY - stalk, on ? 9 : 6, 0, Math.PI * 2);
      ctx.fillStyle = on ? ACCENT : '#fff'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = on ? ACCENT : RULE_H; ctx.stroke();
      ctx.fillStyle = on ? '#fff' : INK_S; ctx.font = '600 10px JetBrains Mono, monospace';
      ctx.fillText(i + 1, x, axisY - stalk + 3.5);
      if (on) {
        ctx.fillStyle = ACCENT; ctx.font = '700 12px Inter, sans-serif';
        ctx.fillText(t.name, x, axisY - stalk - 12);
      }
    });
    ctx.textAlign = 'left';
    setText('thr-when', fmtYears(T[sel].yago) + ' ago');
    setText('thr-what', T[sel].what);
    setText('thr-desc', T[sel].desc);
  }
  cv.addEventListener('click', ev => {
    const { w } = fitCanvas(cv);
    const p = ptr(cv, ev);
    let best = 0, bd = 1e9;
    T.forEach((t, i) => { const d = Math.abs(xOf(t.yago, w) - p.x); if (d < bd) { bd = d; best = i; } });
    $('thr-sel').value = best; draw();
  });
  $('thr-sel').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 2. COSMIC CLOCK — scrub time, cosmic calendar
// ============================================================
(function cosmicClock() {
  const cv = $('cv-scrub'); if (!cv) return;
  const Y0 = 13.8e9;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function sliderToYears(s, useLog) {
    s = clamp(s, 0, 1000) / 1000;
    if (useLog) return Math.pow(10, s * Math.log10(Y0 + 1)) - 1;
    return s * Y0;
  }
  function calendarFor(yago) {
    const frac = clamp(1 - yago / Y0, 0, 1);
    const dayOfYear = frac * 365;
    let m = 0, d = dayOfYear;
    const dim = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (let i = 0; i < 12; i++) { if (d <= dim[i]) { m = i; break; } d -= dim[i]; }
    const day = Math.max(1, Math.ceil(d));
    const secsLeft = (1 - frac) * 365 * 24 * 3600;
    return { label: `${MONTHS[m]} ${day}`, m, secsLeft };
  }
  function eraOf(yago) {
    if (yago > 1e9) return 'cosmic / pre-solar';
    if (yago > 5e8) return 'early life';
    if (yago > 2e5) return 'pre-human';
    if (yago > 11000) return 'foraging humans';
    if (yago > 250) return 'agrarian civilizations';
    return 'modern revolution';
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const useLog = $('scr-log').checked;
    const yago = sliderToYears(n('scr-y', 120), useLog);
    setText('scr-yv', fmtYears(yago));

    const cal = calendarFor(yago);
    const margin = 36, barY = h * 0.30, barH = 26, barW = w - margin * 2;
    const months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let acc = 0;
    ctx.textAlign = 'center'; ctx.font = '9px JetBrains Mono, monospace';
    for (let i = 0; i < 12; i++) {
      const x0 = margin + barW * (acc / 365);
      const x1 = margin + barW * ((acc + months[i]) / 365);
      ctx.fillStyle = i <= cal.m ? ACCENT_S : '#fff';
      ctx.fillRect(x0, barY, x1 - x0 - 1, barH);
      ctx.strokeStyle = RULE; ctx.lineWidth = 1; ctx.strokeRect(x0, barY, x1 - x0 - 1, barH);
      ctx.fillStyle = MUTED; ctx.fillText(MONTHS[i], (x0 + x1) / 2, barY - 6);
      acc += months[i];
    }
    const frac = clamp(1 - yago / Y0, 0, 1);
    const mx = margin + barW * frac;
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(mx, barY - 4); ctx.lineTo(mx, barY + barH + 4); ctx.stroke();
    ctx.beginPath(); ctx.arc(mx, barY + barH + 9, 4, 0, Math.PI * 2); ctx.fillStyle = ACCENT; ctx.fill();

    ctx.textAlign = 'center';
    ctx.fillStyle = INK; ctx.font = '700 22px Inter, sans-serif';
    ctx.fillText(cal.label, w / 2, h * 0.62);
    ctx.fillStyle = MUTED; ctx.font = '12px Inter, sans-serif';
    ctx.fillText('Cosmic Calendar: all 13.8 Byr scaled into one year', w / 2, h * 0.62 + 22);
    if (yago < 2e5) {
      ctx.fillStyle = ACCENT;
      const sec = cal.secsLeft;
      const txt = sec < 60 ? `${sec.toFixed(1)} s before midnight` : `${(sec / 60).toFixed(1)} min before midnight`;
      ctx.fillText('All of human history fits in the last ' + txt, w / 2, h * 0.62 + 44);
    }
    ctx.textAlign = 'left';

    setText('scr-real', fmtYears(yago) + ' ago');
    setText('scr-cal', cal.label + (cal.m === 11 ? ' (last day)' : ''));
    setText('scr-era', eraOf(yago));
  }
  ['scr-y'].forEach(id => $(id).addEventListener('input', draw));
  $('scr-log').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 3. DIFFUSION S-CURVES (logistic)
// ============================================================
(function sCurves() {
  const cv = $('cv-scurve'); if (!cv) return;
  const TECH = [
    { name: 'telephone', start: 1876, base: 90 },
    { name: 'radio', start: 1920, base: 40 },
    { name: 'television', start: 1950, base: 30 },
    { name: 'mobile phone', start: 1990, base: 22 },
    { name: 'smartphone', start: 2007, base: 12 },
  ];
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const ti = clamp(Math.round(n('sc-tech', 3)), 0, TECH.length - 1);
    const tech = TECH[ti];
    const k = clamp(n('sc-k', 100), 20, 300) / 100;
    const shift = clamp(n('sc-m', 0), -20, 20);
    setText('sc-kv', k.toFixed(1));
    setText('sc-mv', (shift >= 0 ? '+' : '') + shift);

    const span = clamp(tech.base, 5, 200);
    const t0 = span / 2 + shift;
    const L = 40, R = w - 20, Tp = 24, B = h - 36;
    ctx.strokeStyle = RULE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, Tp); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    ctx.fillStyle = MUTED; ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    [0, 50, 100].forEach(p => { const y = B - (B - Tp) * p / 100; ctx.fillText(p + '%', L - 5, y + 3); });
    ctx.textAlign = 'center';
    ctx.fillText(`${tech.start} → +${span} yrs`, (L + R) / 2, B + 22);

    ctx.strokeStyle = RULE_H; ctx.setLineDash([3, 3]);
    const ymid = B - (B - Tp) * 0.5;
    ctx.beginPath(); ctx.moveTo(L, ymid); ctx.lineTo(R, ymid); ctx.stroke();
    ctx.setLineDash([]);

    const f = t => 1 / (1 + Math.exp(-k * (t - t0)));
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let px = 0; px <= R - L; px++) {
      const t = px / (R - L) * span;
      const y = B - (B - Tp) * clamp(f(t), 0, 1);
      if (px === 0) ctx.moveTo(L + px, y); else ctx.lineTo(L + px, y);
    }
    ctx.stroke();
    const xmid = L + (R - L) * clamp(t0 / span, 0, 1);
    ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(xmid, ymid, 4, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'left';

    let lo = NaN, hi = NaN;
    for (let t = 0; t <= span; t += span / 2000) {
      const v = f(t);
      if (Number.isNaN(lo) && v >= 0.1) lo = t;
      if (Number.isNaN(hi) && v >= 0.9) { hi = t; break; }
    }
    const dur = (Number.isFinite(lo) && Number.isFinite(hi)) ? (hi - lo) : NaN;
    setText('sc-span', Number.isFinite(dur) ? dur.toFixed(1) + ' yrs' : '—');
    setText('sc-mid', `${tech.start + Math.round(t0)}`);
  }
  ['sc-k', 'sc-m'].forEach(id => $(id).addEventListener('input', draw));
  $('sc-tech').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 4. ACCELERATING RETURNS — exponential vs linear, log toggle
// ============================================================
(function acceleration() {
  const cv = $('cv-accel'); if (!cv) return;
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const dbl = clamp(n('ac-d', 24), 6, 48);
    const years = clamp(n('ac-s', 50), 10, 80);
    const logY = $('ac-log').checked;
    setText('ac-dv', dbl);
    setText('ac-sv', years);

    const ratePerYear = Math.pow(2, 12 / dbl);
    const N = t => Math.pow(2, t * 12 / dbl);
    const finalFactor = N(years);

    const L = 46, R = w - 18, Tp = 22, B = h - 34;
    ctx.strokeStyle = RULE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, Tp); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    ctx.fillStyle = MUTED; ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    for (let yr = 0; yr <= years; yr += Math.max(5, Math.round(years / 8 / 5) * 5)) {
      const x = L + (R - L) * yr / years;
      ctx.fillText('y' + yr, x, B + 18);
    }
    const top = finalFactor;
    const yOf = v => {
      if (logY) {
        const lv = Math.log10(Math.max(1, v));
        const lt = Math.log10(Math.max(10, top));
        return B - (B - Tp) * clamp(lv / lt, 0, 1);
      }
      return B - (B - Tp) * clamp(v / top, 0, 1);
    };
    ctx.textAlign = 'right';
    if (logY) {
      for (let e = 0; Math.pow(10, e) <= top; e++) {
        const y = yOf(Math.pow(10, e));
        ctx.strokeStyle = RULE; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
        ctx.fillStyle = MUTED; ctx.fillText('1e' + e, L - 4, y + 3);
      }
    }

    ctx.strokeStyle = RULE_H; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
    ctx.beginPath();
    for (let px = 0; px <= R - L; px++) {
      const yr = px / (R - L) * years;
      const lin = 1 + (ratePerYear - 1) * yr;
      const y = yOf(lin);
      if (px === 0) ctx.moveTo(L + px, y); else ctx.lineTo(L + px, y);
    }
    ctx.stroke(); ctx.setLineDash([]);

    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let px = 0; px <= R - L; px++) {
      const yr = px / (R - L) * years;
      const y = yOf(N(yr));
      if (px === 0) ctx.moveTo(L + px, y); else ctx.lineTo(L + px, y);
    }
    ctx.stroke();
    ctx.fillStyle = ACCENT; ctx.font = '600 11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('exponential', L + 8, Tp + 12);
    ctx.fillStyle = MUTED; ctx.fillText('linear (dashed)', L + 8, Tp + 28);

    setText('ac-rate', '×' + ratePerYear.toFixed(2) + ' / yr');
    setText('ac-fac', '×' + fmtBig(finalFactor));
  }
  ['ac-d', 'ac-s'].forEach(id => $(id).addEventListener('input', draw));
  $('ac-log').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 5. WORLD POPULATION — interpolated curve, log toggle
// ============================================================
(function population() {
  const cv = $('cv-pop'); if (!cv) return;
  // [year, population] curated estimates
  const D = [
    [-10000, 4e6], [-5000, 19e6], [-3000, 45e6], [-1000, 115e6],
    [1, 230e6], [1000, 295e6], [1500, 461e6], [1700, 600e6],
    [1800, 990e6], [1900, 1.65e9], [1950, 2.5e9], [2000, 6.1e9], [2020, 7.8e9],
  ];
  const DRIVERS = [
    [-9000, 'agriculture spreads'], [-3000, 'first cities & writing'],
    [1500, 'global exchange'], [1800, 'industrial revolution'],
    [1950, 'modern medicine & Green Revolution'],
  ];
  function popAt(yr) {
    yr = clamp(yr, D[0][0], D[D.length - 1][0]);
    for (let i = 0; i < D.length - 1; i++) {
      if (yr >= D[i][0] && yr <= D[i + 1][0]) {
        const t = (yr - D[i][0]) / (D[i + 1][0] - D[i][0]);
        const a = Math.log(D[i][1]), b = Math.log(D[i + 1][1]);
        return Math.exp(a + (b - a) * t);
      }
    }
    return D[D.length - 1][1];
  }
  function driverFor(yr) {
    let best = DRIVERS[0][1];
    for (const [y, d] of DRIVERS) if (yr >= y) best = d;
    return best;
  }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const yr = clamp(n('pop-y', 2020), -10000, 2020);
    const logP = $('pop-log').checked;
    setText('pop-yv', yr < 0 ? Math.abs(yr) + ' BCE' : yr + ' CE');

    const L = 50, R = w - 18, Tp = 22, B = h - 34;
    const yMin = D[0][0], yMax = D[D.length - 1][0];
    const xOf = y => L + (R - L) * (y - yMin) / (yMax - yMin);
    const pMax = 8e9;
    const yOf = p => {
      if (logP) {
        const lo = Math.log10(1e6), hi = Math.log10(pMax);
        return B - (B - Tp) * clamp((Math.log10(Math.max(1e6, p)) - lo) / (hi - lo), 0, 1);
      }
      return B - (B - Tp) * clamp(p / pMax, 0, 1);
    };
    ctx.strokeStyle = RULE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, Tp); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    ctx.fillStyle = MUTED; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    [-10000, -5000, 0, 1000, 2000].forEach(y => ctx.fillText(y < 0 ? (-y / 1000) + 'k BCE' : y, xOf(y), B + 18));
    ctx.textAlign = 'right';
    if (logP) [1e6, 1e7, 1e8, 1e9].forEach(p => {
      const y = yOf(p); ctx.strokeStyle = RULE; ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
      ctx.fillStyle = MUTED; ctx.fillText(fmtBig(p), L - 4, y + 3);
    });

    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let px = 0; px <= R - L; px++) {
      const y = yMin + (yMax - yMin) * px / (R - L);
      const yy = yOf(popAt(y));
      if (px === 0) ctx.moveTo(L + px, yy); else ctx.lineTo(L + px, yy);
    }
    ctx.stroke();

    ctx.strokeStyle = RULE_H; ctx.setLineDash([3, 3]);
    DRIVERS.forEach(([y]) => { const x = xOf(y); ctx.beginPath(); ctx.moveTo(x, Tp); ctx.lineTo(x, B); ctx.stroke(); });
    ctx.setLineDash([]);

    const px = xOf(yr), py = yOf(popAt(yr));
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(px, Tp); ctx.lineTo(px, B); ctx.stroke();
    ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'left';

    setText('pop-val', fmtBig(popAt(yr)));
    setText('pop-drv', driverFor(yr));
  }
  ['pop-y'].forEach(id => $(id).addEventListener('input', draw));
  $('pop-log').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 6. IDEA INFLUENCE MAP — clickable genealogy graph
// ============================================================
(function ideaMap() {
  const cv = $('cv-ideas'); if (!cv) return;
  // nodes with normalized layout positions; edges = "builds-on"
  const N_ = [
    { id: 0, name: 'Writing', x: 0.10, y: 0.20 },
    { id: 1, name: 'Mathematics', x: 0.10, y: 0.55 },
    { id: 2, name: 'Alphabet', x: 0.28, y: 0.30 },
    { id: 3, name: 'Printing', x: 0.30, y: 0.75 },
    { id: 4, name: 'Scientific method', x: 0.50, y: 0.45 },
    { id: 5, name: 'Steam / industry', x: 0.50, y: 0.82 },
    { id: 6, name: 'Electricity', x: 0.68, y: 0.65 },
    { id: 7, name: 'Telecom', x: 0.70, y: 0.25 },
    { id: 8, name: 'Computing', x: 0.86, y: 0.50 },
    { id: 9, name: 'Internet', x: 0.86, y: 0.22 },
    { id: 10, name: 'AI', x: 0.93, y: 0.80 },
  ];
  // edges from -> to (source enables target)
  const E_ = [
    [0, 2], [0, 4], [1, 4], [2, 3], [3, 4], [4, 5], [4, 6],
    [5, 6], [2, 7], [6, 7], [6, 8], [7, 9], [8, 9], [8, 10], [9, 10],
  ];
  let sel = -1;
  function pos(node, w, h) { return { x: 28 + node.x * (w - 56), y: 26 + node.y * (h - 60) }; }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const P = N_.map(nd => pos(nd, w, h));
    const inSel = new Set(), outSel = new Set();
    if (sel >= 0) E_.forEach(([a, b]) => { if (b === sel) inSel.add(a); if (a === sel) outSel.add(b); });

    E_.forEach(([a, b]) => {
      const hot = sel >= 0 && (a === sel || b === sel);
      ctx.strokeStyle = hot ? ACCENT : 'rgba(138,138,146,0.35)';
      ctx.lineWidth = hot ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(P[a].x, P[a].y); ctx.lineTo(P[b].x, P[b].y); ctx.stroke();
      const ang = Math.atan2(P[b].y - P[a].y, P[b].x - P[a].x);
      const hx = P[b].x - 16 * Math.cos(ang), hy = P[b].y - 16 * Math.sin(ang);
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(hx - 6 * Math.cos(ang - 0.4), hy - 6 * Math.sin(ang - 0.4));
      ctx.lineTo(hx - 6 * Math.cos(ang + 0.4), hy - 6 * Math.sin(ang + 0.4));
      ctx.closePath(); ctx.fillStyle = hot ? ACCENT : 'rgba(138,138,146,0.45)'; ctx.fill();
    });
    ctx.textAlign = 'center';
    N_.forEach((nd, i) => {
      const p = P[i];
      let fill = '#fff', stroke = RULE_H, txt = INK_S;
      if (i === sel) { fill = ACCENT; stroke = ACCENT; txt = '#fff'; }
      else if (inSel.has(i)) { stroke = GOOD; txt = INK; }
      else if (outSel.has(i)) { stroke = WARN; txt = INK; }
      ctx.beginPath(); ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke();
      ctx.fillStyle = txt; ctx.font = (i === sel ? '700 ' : '500 ') + '10px Inter, sans-serif';
      ctx.fillText(nd.name, p.x, p.y - 16);
    });
    ctx.textAlign = 'left';

    if (sel >= 0) {
      setText('id-sel', N_[sel].name);
      setText('id-in', [...inSel].map(i => N_[i].name).join(', ') || '— (a root)');
      setText('id-out', [...outSel].map(i => N_[i].name).join(', ') || '— (a leaf)');
    } else { setText('id-sel', '—'); setText('id-in', '—'); setText('id-out', '—'); }
  }
  cv.addEventListener('click', ev => {
    const { w, h } = fitCanvas(cv);
    const p = ptr(cv, ev);
    let hit = -1;
    N_.forEach((nd, i) => { const q = pos(nd, w, h); if (Math.hypot(q.x - p.x, q.y - p.y) < 15) hit = i; });
    sel = (hit === sel) ? -1 : hit;
    draw();
  });
  $('id-clear').addEventListener('click', () => { sel = -1; draw(); });
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 7. RISING COMPLEXITY & GOLDILOCKS conditions
// ============================================================
(function complexity() {
  const cv = $('cv-cx'); if (!cv) return;
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const temp = clamp(n('cx-t', 50), 0, 100);
    const time = clamp(n('cx-g', 60), 0, 100);
    setText('cx-tv', temp);
    setText('cx-gv', time);

    const L = 44, R = w - 18, Tp = 22, B = h - 34;
    // goldilocks window: gaussian around 50, scaled by time
    const ideal = 50, width = 22;
    const goldil = t => Math.exp(-Math.pow((t - ideal) / width, 2));
    const cap = (time / 100);
    ctx.strokeStyle = RULE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, Tp); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    ctx.fillStyle = MUTED; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    ctx.fillText('cold', L + 30, B + 18); ctx.fillText('hot', R - 24, B + 18);

    // shaded goldilocks band
    ctx.fillStyle = 'rgba(22,163,74,0.10)';
    const bx0 = L + (R - L) * (ideal - width) / 100, bx1 = L + (R - L) * (ideal + width) / 100;
    ctx.fillRect(bx0, Tp, bx1 - bx0, B - Tp);

    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.2; ctx.beginPath();
    for (let px = 0; px <= R - L; px++) {
      const t = px / (R - L) * 100;
      const y = B - (B - Tp) * clamp(goldil(t) * cap, 0, 1);
      if (px === 0) ctx.moveTo(L + px, y); else ctx.lineTo(L + px, y);
    }
    ctx.stroke();

    const cx = L + (R - L) * temp / 100;
    const cval = goldil(temp) * cap;
    const cy = B - (B - Tp) * clamp(cval, 0, 1);
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(cx, B); ctx.lineTo(cx, cy); ctx.stroke();
    ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'left';

    let zone, col;
    if (temp < ideal - width) { zone = 'too cold — nothing forms'; col = BAD; }
    else if (temp > ideal + width) { zone = 'too hot — bonds break'; col = BAD; }
    else if (cval > 0.6) { zone = 'Goldilocks — complexity thrives'; col = GOOD; }
    else { zone = 'marginal'; col = WARN; }
    setText('cx-zone', zone);
    $('cx-zone').style.color = col;
    setText('cx-idx', (cval * 100).toFixed(0) + ' / 100');
  }
  ['cx-t', 'cx-g'].forEach(id => $(id).addEventListener('input', draw));
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 8. REVOLUTIONS TIMELINE — pan & zoom
// ============================================================
(function revolutions() {
  const cv = $('cv-rev'); if (!cv) return;
  const EV = [
    { y: -3000, n: 'Stone-age & hydraulic civilizations', d: 'Sumer, Egypt: writing, the wheel, irrigation, the first cities.' },
    { y: -2500, n: 'Phoenician alphabet', d: 'A compact alphabet — McLuhan’s "extension" of memory and speech.' },
    { y: -500, n: 'Axial Age', d: 'Greece, Persia, China, India: philosophy, logic, world religions emerge.' },
    { y: 900, n: 'Islamic Golden Age', d: 'Algebra, optics, "Arabic" numerals, the pointed arch.' },
    { y: 1450, n: 'Printing press', d: 'Gutenberg multiplies texts; ideas spread faster than ever.' },
    { y: 1500, n: 'Renaissance', d: 'Brunelleschi, Da Vinci, Machiavelli — art, engineering, statecraft.' },
    { y: 1600, n: 'Scientific Revolution', d: 'Telescope, Bruno, the experimental method reshapes knowledge.' },
    { y: 1769, n: 'Industrial Revolution', d: 'Steam power, factories, fossil energy — and environmentalism in reply.' },
    { y: 1859, n: 'Darwin — Origin of Species', d: 'Evolution by natural selection transforms the idea of life.' },
    { y: 1945, n: 'Atomic & space age', d: 'The bomb, the rocket, Turing’s machine, the Anthropocene begins.' },
    { y: 1969, n: 'Moon landing', d: 'Humanity’s first steps on another world; "Earthrise" reframes the planet.' },
    { y: 1991, n: 'World Wide Web', d: 'A global "second brain": internet, search, social media.' },
    { y: 2007, n: 'Smartphone', d: 'Computing in every pocket; the digital human.' },
    { y: 2022, n: 'ChatGPT / generative AI', d: 'The next acceleration — and questions about the final invention.' },
  ];
  let sel = -1, dragX = null, dragCenter = 0;
  function span() { return 6000 / (clamp(n('rev-z', 10), 10, 400) / 10); }
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const z = clamp(n('rev-z', 10), 10, 400) / 10;
    const center = clamp(n('rev-c', 1000), -3000, 2025);
    setText('rev-zv', z.toFixed(1) + '×');
    setText('rev-cv', center < 0 ? Math.abs(center) + ' BCE' : center + ' CE');
    const sp = span();
    const lo = center - sp / 2, hi = center + sp / 2;
    const L = 24, R = w - 24, axisY = h * 0.5;
    const xOf = y => L + (R - L) * (y - lo) / (hi - lo);

    ctx.strokeStyle = RULE_H; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(L, axisY); ctx.lineTo(R, axisY); ctx.stroke();

    ctx.textAlign = 'center'; ctx.font = '9px JetBrains Mono, monospace'; ctx.fillStyle = MUTED;
    const step = sp > 3000 ? 1000 : sp > 800 ? 250 : sp > 200 ? 50 : 10;
    const first = Math.ceil(lo / step) * step;
    for (let y = first; y <= hi; y += step) {
      const x = xOf(y);
      ctx.strokeStyle = RULE; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, axisY - 4); ctx.lineTo(x, axisY + 4); ctx.stroke();
      ctx.fillStyle = MUTED; ctx.fillText(y < 0 ? Math.abs(y) + 'BCE' : y, x, axisY + 18);
    }
    EV.forEach((e, i) => {
      if (e.y < lo - step || e.y > hi + step) return;
      const x = xOf(e.y);
      if (x < L - 2 || x > R + 2) return;
      const on = i === sel;
      const up = (i % 2 === 0) ? -1 : 1;
      const stalk = (on ? 56 : 34) * up;
      ctx.strokeStyle = on ? ACCENT : RULE_H; ctx.lineWidth = on ? 2 : 1;
      ctx.beginPath(); ctx.moveTo(x, axisY); ctx.lineTo(x, axisY + stalk); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, axisY + stalk, on ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = on ? ACCENT : '#fff'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = on ? ACCENT : RULE_H; ctx.stroke();
      if (on || z >= 3) {
        ctx.fillStyle = on ? ACCENT : INK_S; ctx.font = (on ? '700 ' : '500 ') + '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        const lbl = e.n.length > 22 ? e.n.slice(0, 21) + '…' : e.n;
        ctx.fillText(lbl, x, axisY + stalk + (up < 0 ? -12 : 18));
      }
    });
    ctx.textAlign = 'left';
    if (sel >= 0) { setText('rev-ev', EV[sel].n); setText('rev-yr', EV[sel].y < 0 ? Math.abs(EV[sel].y) + ' BCE' : EV[sel].y + ' CE'); setText('rev-desc', EV[sel].d); }
    else { setText('rev-ev', '—'); setText('rev-yr', '—'); setText('rev-desc', 'Drag to pan, zoom in, click a point.'); }
  }
  function yearAtX(px, w) {
    const z = clamp(n('rev-z', 10), 10, 400) / 10; void z;
    const center = clamp(n('rev-c', 1000), -3000, 2025);
    const sp = span(); const lo = center - sp / 2, hi = center + sp / 2;
    const L = 24, R = w - 24;
    return lo + (hi - lo) * (px - L) / (R - L);
  }
  cv.addEventListener('click', ev => {
    if (dragX !== null) return;
    const { w, h } = fitCanvas(cv);
    const p = ptr(cv, ev);
    const center = clamp(n('rev-c', 1000), -3000, 2025);
    const sp = span(); const lo = center - sp / 2, hi = center + sp / 2;
    const L = 24, R = w - 24; const xOf = y => L + (R - L) * (y - lo) / (hi - lo);
    void h;
    let best = -1, bd = 22;
    EV.forEach((e, i) => { const d = Math.abs(xOf(e.y) - p.x); if (d < bd) { bd = d; best = i; } });
    sel = (best === sel) ? -1 : best; draw();
  });
  cv.addEventListener('pointerdown', ev => { dragX = ptr(cv, ev).x; dragCenter = clamp(n('rev-c', 1000), -3000, 2025); });
  cv.addEventListener('pointermove', ev => {
    if (dragX === null) return;
    const { w } = fitCanvas(cv);
    const p = ptr(cv, ev);
    const sp = span(); const L = 24, R = w - 24;
    const dyear = (p.x - dragX) / (R - L) * sp;
    $('rev-c').value = clamp(Math.round(dragCenter - dyear), -3000, 2025);
    draw();
  });
  const endDrag = () => { setTimeout(() => { dragX = null; }, 40); };
  cv.addEventListener('pointerup', endDrag);
  cv.addEventListener('pointerleave', endDrag);
  ['rev-z', 'rev-c'].forEach(id => $(id).addEventListener('input', draw));
  window.addEventListener('resize', draw);
  void yearAtX;
  draw();
})();

// ============================================================
// 9. COLLECTIVE LEARNING — accumulating stock of knowledge
// ============================================================
(function collectiveLearning() {
  const cv = $('cv-cl'); if (!cv) return;
  const MED = [
    { name: 'oral / memory', gain: 0.04 },
    { name: 'writing', gain: 0.10 },
    { name: 'printing press', gain: 0.22 },
    { name: 'internet', gain: 0.50 },
  ];
  const GENS = 40;
  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const minds = clamp(n('cl-p', 50), 2, 100);
    const mi = clamp(Math.round(n('cl-med', 2)), 0, MED.length - 1);
    const loss = clamp(n('cl-l', 10), 0, 60) / 100;
    setText('cl-pv', minds);
    setText('cl-lv', (loss * 100).toFixed(0) + '%');
    const retention = 1 - loss;

    // each generation: stock = stock*retention + minds*gain*log-network effect
    const gain = MED[mi].gain * (1 + Math.log10(minds) * 0.6);
    const series = [];
    let stock = 1;
    for (let g = 0; g <= GENS; g++) {
      series.push(stock);
      stock = stock * retention + minds * gain;
    }
    const peak = Math.max(...series, 1);

    const L = 46, R = w - 18, Tp = 22, B = h - 34;
    ctx.strokeStyle = RULE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, Tp); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    ctx.fillStyle = MUTED; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'center';
    for (let g = 0; g <= GENS; g += 10) ctx.fillText('g' + g, L + (R - L) * g / GENS, B + 18);
    ctx.textAlign = 'right'; ctx.fillText(fmtBig(peak), L - 4, Tp + 8);

    ctx.fillStyle = ACCENT_S;
    ctx.beginPath(); ctx.moveTo(L, B);
    series.forEach((v, g) => { const x = L + (R - L) * g / GENS, y = B - (B - Tp) * clamp(v / peak, 0, 1); ctx.lineTo(x, y); });
    ctx.lineTo(R, B); ctx.closePath(); ctx.fill();

    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.2; ctx.beginPath();
    series.forEach((v, g) => { const x = L + (R - L) * g / GENS, y = B - (B - Tp) * clamp(v / peak, 0, 1); if (g === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
    ctx.stroke();
    ctx.fillStyle = MUTED; ctx.font = '11px Inter, sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('shared knowledge stock vs generations · medium: ' + MED[mi].name, L + 6, Tp + 4);

    setText('cl-ret', (retention * 100).toFixed(0) + '% / gen');
    setText('cl-stock', fmtBig(series[GENS]));
  }
  ['cl-p', 'cl-l'].forEach(id => $(id).addEventListener('input', draw));
  $('cl-med').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();

// ============================================================
// 10. RADIOMETRIC DATING — half-life exponential decay
// Pure math:
//   fracRemaining(t, T) = (1/2)^(t/T)
//   ageFromFraction(f, T) = T * log2(1/f)   (inverse of the above)
// Verified numerically in test/decay.test.js (node --test).
// ============================================================
export function fracRemaining(t, T) {
  if (!(T > 0)) return NaN;
  return Math.pow(0.5, t / T);
}
export function ageFromFraction(frac, T) {
  if (!(T > 0) || !(frac > 0)) return NaN;
  return T * Math.log2(1 / frac);
}

(function radiometricDating() {
  const cv = $('cv-decay'); if (!cv) return;
  // half-life T in years; HALVES = elapsed-time range as multiples of T.
  const ISO = [
    { name: 'Carbon-14', daughter: 'N-14', T: 5730,
      range: 'useful to ~50,000 yr (~9 half-lives) — wood, bone, charcoal, the Holocene & late Pleistocene.' },
    { name: 'Potassium-40', daughter: 'Ar-40', T: 1.25e9,
      range: 'useful for millions–billions of yr — volcanic ash, dating hominin sites and rock strata.' },
    { name: 'Uranium-238', daughter: 'Pb-206', T: 4.47e9,
      range: 'useful for hundreds of millions–billions of yr — dates Earth & meteorites at ~4.6 Gyr.' },
  ];
  const HALVES = 6;          // slider spans 0 → 6 half-lives
  const SLIDER_MAX = 1000;
  function sliderToHalves(s) { return clamp(s, 0, SLIDER_MAX) / SLIDER_MAX * HALVES; }

  function draw() {
    const { ctx, w, h } = fitCanvas(cv);
    ctx.clearRect(0, 0, w, h);
    const ii = clamp(Math.round(n('dc-iso', 0)), 0, ISO.length - 1);
    const iso = ISO[ii];
    const T = iso.T;
    const halves = sliderToHalves(n('dc-t', 200));   // t / T
    const t = halves * T;                             // elapsed time in years
    const frac = fracRemaining(t, T);

    const L = 46, R = w - 18, Tp = 22, B = h - 36;
    const xOf = nh => L + (R - L) * clamp(nh / HALVES, 0, 1);   // nh = number of half-lives
    const yOf = f => B - (B - Tp) * clamp(f, 0, 1);             // fraction 0..1

    // axes
    ctx.strokeStyle = RULE; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(L, Tp); ctx.lineTo(L, B); ctx.lineTo(R, B); ctx.stroke();
    // y ticks: fraction
    ctx.fillStyle = MUTED; ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'right';
    [0, 0.25, 0.5, 0.75, 1].forEach(f => {
      const y = yOf(f);
      ctx.strokeStyle = RULE; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
      ctx.fillStyle = MUTED; ctx.fillText(f.toFixed(2), L - 4, y + 3);
    });
    // x ticks: half-lives
    ctx.textAlign = 'center';
    for (let k = 0; k <= HALVES; k++) {
      const x = xOf(k);
      ctx.fillStyle = MUTED; ctx.fillText(k + 'T', x, B + 18);
    }
    ctx.fillText('elapsed time (in half-lives T)', (L + R) / 2, B + 30);

    // decay curve
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 2.4; ctx.beginPath();
    for (let px = 0; px <= R - L; px++) {
      const nh = px / (R - L) * HALVES;
      const y = yOf(Math.pow(0.5, nh));
      if (px === 0) ctx.moveTo(L + px, y); else ctx.lineTo(L + px, y);
    }
    ctx.stroke();

    // successive half-life markers: (1, 1/2), (2, 1/4), (3, 1/8) ...
    const labels = ['1', '½', '¼', '⅛', '1⁄16', '1⁄32', '1⁄64'];
    for (let k = 1; k <= HALVES; k++) {
      const f = Math.pow(0.5, k);
      const x = xOf(k), y = yOf(f);
      ctx.strokeStyle = RULE_H; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, B); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(x, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fff'; ctx.strokeStyle = RULE_H; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = MUTED; ctx.font = '9px JetBrains Mono, monospace'; ctx.textAlign = 'left';
      ctx.fillText(labels[k] || '', x + 6, y - 4);
    }

    // current (t, fraction) point
    const cx = xOf(halves), cy = yOf(frac);
    ctx.strokeStyle = ACCENT; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(cx, B); ctx.lineTo(cx, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L, cy); ctx.lineTo(cx, cy); ctx.stroke();
    ctx.fillStyle = ACCENT; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'left';

    // title in-canvas
    ctx.fillStyle = INK_S; ctx.font = '600 11px Inter, sans-serif';
    ctx.fillText(`${iso.name} → ${iso.daughter}   T = ${fmtYears(T)}`.replace(' ya', ''), L + 8, Tp + 12);

    // readouts
    setText('dc-tv', fmtYears(t).replace(' ya', '') + ' (' + halves.toFixed(2) + 'T)');
    setText('dc-n', halves.toFixed(2));
    setText('dc-frac', frac.toFixed(4));
    setText('dc-pct', (frac * 100).toFixed(2) + '%');
    // implied age from the current fraction — the inverse; equals t by construction
    const age = ageFromFraction(frac, T);
    setText('dc-age', Number.isFinite(age) ? fmtYears(age).replace(' ya', '') : '—');
    setText('dc-range', iso.name + ': ' + iso.range);
  }
  $('dc-t').addEventListener('input', draw);
  $('dc-iso').addEventListener('change', draw);
  window.addEventListener('resize', draw);
  draw();
})();
