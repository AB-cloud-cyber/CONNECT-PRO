(function() {
  'use strict';

  /* ─── SETUP ─── */
  let canvas, ctx, W, H, dpr;
  let animId = null, audioCtx = null, running = false;
  let phase = 0, cycleTime = 0;
  const CYCLE = 6000; // ms per cycle

  /* ─── 3-STATE SYSTEM ─── */
  let startup, investor, merged;
  let particles = [], trails = [], glowRings = [];
  let projectBlueprint = null;
  let shockwaves = [];

  /* ─── COLORS ─── */
  const C = {
    startup:  { r: 56,  g: 189, b: 248, hex: '#38bdf8', label: 'Startup' },
    investor: { r: 168, g: 85,  b: 247, hex: '#a855f7', label: 'Investisseur' },
    fusion:   { r: 250, g: 204, b: 21,  hex: '#facc15', label: 'Synergie' },
    ambient:  { r: 30,  g: 50,  b: 90 },
  };

  const PI2 = Math.PI * 2;

  /* ─── STAR ─── */
  function makeStar(x, y, color, size, label) {
    return { x, y, ox: x, oy: y, color, size, glow: size * 3, pulse: 0, rotation: 0, label, trail: [] };
  }

  /* ─── RENDER STAR with 3D-ish glow ─── */
  function drawStar(s, alpha, scale) {
    if (!s || alpha <= 0) return;
    const a = alpha || 1;
    const sc = scale || 1;
    const r = s.size * sc;
    const gR = r * s.glow;

    /* Outer glow */
    const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, gR);
    grd.addColorStop(0, `rgba(${s.color.r},${s.color.g},${s.color.b},${0.35 * a})`);
    grd.addColorStop(0.2, `rgba(${s.color.r},${s.color.g},${s.color.b},${0.12 * a})`);
    grd.addColorStop(0.5, `rgba(${s.color.r},${s.color.g},${s.color.b},${0.04 * a})`);
    grd.addColorStop(1, `rgba(${s.color.r},${s.color.g},${s.color.b},0)`);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(s.x, s.y, gR, 0, PI2);
    ctx.fill();

    /* Star body */
    const pulse = 1 + Math.sin(s.pulse) * 0.06;
    const rad = r * pulse;

    /* Outer ring */
    ctx.shadowColor = `rgba(${s.color.r},${s.color.g},${s.color.b},${0.5 * a})`;
    ctx.shadowBlur = rad * 3;
    ctx.fillStyle = `rgba(${s.color.r},${s.color.g},${s.color.b},${0.3 * a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, rad * 1.15, 0, PI2);
    ctx.fill();

    /* Core */
    ctx.shadowBlur = rad * 1.5;
    ctx.fillStyle = `rgba(${Math.min(255, s.color.r + 40)},${Math.min(255, s.color.g + 40)},${Math.min(255, s.color.b + 40)},${0.7 * a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, rad * 0.65, 0, PI2);
    ctx.fill();

    /* White center */
    ctx.shadowBlur = rad * 0.8;
    ctx.fillStyle = `rgba(255,255,255,${0.4 * a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, rad * 0.25, 0, PI2);
    ctx.fill();

    /* Glint (cross) */
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255,255,255,${0.15 * a})`;
    ctx.lineWidth = 0.5;
    const gl = rad * 0.8;
    ctx.beginPath();
    ctx.moveTo(s.x - gl, s.y); ctx.lineTo(s.x + gl, s.y);
    ctx.moveTo(s.x, s.y - gl); ctx.lineTo(s.x, s.y + gl);
    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  /* ─── PROJECT BLUEPRINT ─── */
  function drawBlueprint(s, progress) {
    if (!s) return;
    const life = Math.min(progress * 2, 1) * Math.max(0, 1 - Math.max(0, progress - 0.5) / 0.5);
    if (life <= 0) return;
    ctx.save();
    ctx.globalAlpha = life * 0.5;
    const bx = s.x + s.size * 2.5, by = s.y - s.size * 4;
    const sc = 1 + (1 - life) * 0.3;

    /* mini mockup screen */
    ctx.strokeStyle = C.startup.hex;
    ctx.lineWidth = 0.8;
    const w = 28 * sc, h = 20 * sc;
    ctx.strokeRect(bx - w/2, by - h/2, w, h);

    /* screen content - bar chart */
    ctx.fillStyle = `rgba(56,189,248,0.3)`;
    ctx.fillRect(bx - w/4, by + h/4 - 6 * sc, 4 * sc, 6 * sc);
    ctx.fillRect(bx - 2, by + h/4 - 10 * sc, 4 * sc, 10 * sc);
    ctx.fillRect(bx + w/4 - 4 * sc, by + h/4 - 8 * sc, 4 * sc, 8 * sc);

    /* data lines flowing from screen */
    ctx.strokeStyle = `rgba(56,189,248,0.15)`;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 5; i++) {
      const angle = -Math.PI/2 + (i - 2) * 0.25;
      const len = 15 + i * 3;
      ctx.beginPath();
      ctx.moveTo(bx + Math.cos(angle) * w/2, by + Math.sin(angle) * h/2);
      const cx1 = bx + Math.cos(angle - 0.2) * (len * 0.6);
      const cy1 = by + Math.sin(angle - 0.2) * (len * 0.6) - 5;
      ctx.quadraticCurveTo(cx1, cy1, bx + Math.cos(angle) * len, by + Math.sin(angle) * len - 8);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* ─── INVESTOR BRIEFCASE ─── */
  function drawBriefcase(s, progress) {
    if (!s) return;
    const life = Math.min(progress * 2, 1) * Math.max(0, 1 - Math.max(0, progress - 0.4) / 0.6);
    if (life <= 0) return;
    ctx.save();
    ctx.globalAlpha = life * 0.35;
    const bx = s.x - s.size * 2.5, by = s.y - s.size * 3;
    const sc = 0.6;
    ctx.strokeStyle = C.investor.hex;
    ctx.lineWidth = 1;
    const w = 16 * sc, h = 12 * sc;
    ctx.strokeRect(bx - w/2, by - h/2 + 3 * sc, w, h);
    ctx.strokeRect(bx - w/4, by - h/2, w/2, 3 * sc);
    ctx.restore();
  }

  /* ─── PARTICLES ─── */
  function spawnParticle(x, y, color, count, speed, life, size) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * PI2;
      const sp = speed * (0.3 + Math.random() * 0.7);
      particles.push({
        x, y, vx: Math.cos(angle) * sp, vy: Math.sin(angle) * sp,
        color, life: life || 40, maxLife: life || 40,
        size: size || 1 + Math.random() * 2,
        decay: 0.96 + Math.random() * 0.03,
      });
    }
  }

  /* ─── SHOCKWAVE ─── */
  function addShockwave(x, y, maxR) {
    shockwaves.push({ x, y, maxR: maxR || Math.min(W, H) * 0.2, radius: 2, progress: 0 });
  }

  /* ─── RESET ─── */
  function reset(now) {
    phase = 0;
    cycleTime = now;
    const cx = W * 0.78, cy = H / 2;
    const sp = Math.min(W, H) * 0.08;
    startup  = makeStar(cx - sp * 0.5, cy - 2, C.startup, Math.min(W, H) * 0.035, 'Startup');
    investor = makeStar(cx + sp * 0.5, cy + 2, C.investor, Math.min(W, H) * 0.035, 'Investisseur');
    merged = null;
    particles = [];
    trails = [];
    glowRings = [];
    shockwaves = [];
    projectBlueprint = null;
  }

  /* ─── AMBIENT PARTICLES ─── */
  function ambientParticles() {
    if (Math.random() < 0.25) {
      const side = Math.random() > 0.5;
      particles.push({
        x: side ? -2 : W + 2, y: Math.random() * H,
        vx: side ? 0.15 + Math.random() * 0.2 : -0.15 - Math.random() * 0.2,
        vy: (Math.random() - 0.5) * 0.1,
        color: C.ambient, life: 100 + Math.random() * 80,
        maxLife: 100 + Math.random() * 80,
        size: 0.5 + Math.random() * 1.2,
        decay: 0.99,
      });
    }
  }

  /* ─── UPDATE ─── */
  function update(now) {
    const dt = now - cycleTime;
    phase = Math.min(dt / CYCLE, 1);
    const p = phase;

    /* ---------- PHASE 0-0.15: ENTER ---------- */
    if (p < 0.15) {
      const t = p / 0.15;
      const ease = 1 - Math.pow(1 - t, 3);
      const cx = W * 0.78, cy = H / 2;
      const sp = Math.min(W, H) * 0.08;
      /* stars enter from right edge */
      if (startup) {
        startup.x = W + (cx - sp * 0.5 - W) * ease;
        startup.y = cy - 2 + Math.sin(t * 3) * 1.5;
        startup.pulse += 0.03;
      }
      if (investor) {
        investor.x = W + (cx + sp * 0.5 - W) * ease;
        investor.y = cy + 2 + Math.sin(t * 3 + 1) * 1.5;
        investor.pulse += 0.03;
      }
      spawnParticle(startup ? startup.x : W * 0.7, startup ? startup.y : H/2, C.startup, 1, 0.3, 30, 1);
    }

    /* ---------- PHASE 0.15-0.35: STARTUP PRESENTATION ---------- */
    else if (p < 0.35) {
      const t = (p - 0.15) / 0.2;
      const cx = W * 0.78, cy = H / 2;
      const sp = Math.min(W, H) * 0.08;
      const orbit = Math.sin(t * Math.PI * 2) * sp * 0.15;

      if (startup) {
        startup.x = cx - sp * 0.5 + orbit * 0.3;
        startup.y = cy - 2 - Math.sin(t * Math.PI) * sp * 0.12;
        startup.pulse += 0.06 + t * 0.03;
        startup.size = Math.min(W, H) * (0.035 + t * 0.008);
      }
      if (investor) {
        investor.x = cx + sp * 0.5 - orbit * 0.2;
        investor.y = cy + 2 + Math.sin(t * Math.PI + 0.5) * sp * 0.08;
        investor.pulse += 0.04;
      }

      /* Project blueprint appears */
      projectBlueprint = { progress: t };

      /* Data particles flowing from startup */
      if (Math.random() < 0.5) {
        const angle = -Math.PI/2 + (Math.random() - 0.5) * 0.8;
        spawnParticle(
          startup.x + Math.cos(angle) * startup.size * 1.5,
          startup.y + Math.sin(angle) * startup.size * 1.5,
          C.startup, 1, 0.5 + Math.random() * 0.5, 25 + Math.random() * 15, 1.5
        );
      }
    }

    /* ---------- PHASE 0.35-0.5: APPROACH + FUSION ---------- */
    else if (p < 0.5) {
      const t = (p - 0.35) / 0.15;
      const cx = W * 0.78, cy = H / 2;
      const sp = Math.min(W, H) * 0.08;
      const shrink = 1 - t * 0.3;

      if (startup) {
        startup.x = cx - sp * 0.5 * shrink;
        startup.y = cy - 2 + (Math.random() - 0.5) * t * 2;
        startup.pulse += 0.12;
        startup.size *= 0.987;
      }
      if (investor) {
        investor.x = cx + sp * 0.5 * shrink;
        investor.y = cy + 2 + (Math.random() - 0.5) * t * 2;
        investor.pulse += 0.12;
        investor.size *= 0.987;
      }

      /* Shockwave at t=0.4 */
      if (t > 0.3 && shockwaves.length === 0) {
        addShockwave(cx, cy, Math.min(W, H) * 0.18);
        spawnParticle(cx, cy, C.startup, 15, 2.5, 25, 2.5);
        spawnParticle(cx, cy, C.investor, 15, 2.5, 25, 2.5);
      }

      projectBlueprint = null;
    }

    /* ---------- PHASE 0.5-0.65: MERGE EMERGES ---------- */
    else if (p < 0.65) {
      const t = (p - 0.5) / 0.15;
      const cx = W * 0.78, cy = H / 2;

      /* Fade out originals, grow merged */
      if (startup) { startup.size *= 0.95; startup.pulse += 0.1; }
      if (investor) { investor.size *= 0.95; investor.pulse += 0.1; }

      if (!merged) {
        merged = makeStar(cx, cy, C.fusion, 2, 'Synergie');
      }
      if (merged) {
        merged.x = cx + (Math.random() - 0.5) * 2 * t;
        merged.y = cy + (Math.random() - 0.5) * 2 * t;
        merged.size = Math.min(merged.size + 0.4, Math.min(W, H) * 0.045);
        merged.pulse += 0.08;
      }

      /* Fusion burst */
      if (Math.random() < 0.7) {
        const angle = Math.random() * PI2;
        const speed = 1 + Math.random() * 1.5;
        const col = Math.random() > 0.5 ? C.startup : C.investor;
        particles.push({
          x: cx, y: cy, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed,
          color: col, life: 20 + Math.random() * 15, maxLife: 35,
          size: 2 + Math.random() * 2, decay: 0.96,
        });
      }

      /* Ongoing shockwave */
      if (shockwaves.length > 0) {
        const sw = shockwaves[0];
        sw.radius += (sw.maxR - sw.radius) * 0.05;
        sw.progress = Math.min(sw.radius / sw.maxR, 1);
        if (sw.progress >= 1) shockwaves = [];
      }
    }

    /* ---------- PHASE 0.65-0.8: TRIO STABILIZES ---------- */
    else if (p < 0.8) {
      const t = (p - 0.65) / 0.15;
      const cx = W * 0.78, cy = H / 2;
      const spread = Math.min(W, H) * 0.04;

      /* Restore startup + investor as smaller companions */
      if (startup && startup.size < Math.min(W, H) * 0.03) {
        startup.size = Math.min(startup.size + 0.05, Math.min(W, H) * 0.028);
        startup.x = merged ? merged.x - spread : cx - spread;
        startup.y = merged ? merged.y - 2 : cy - 2;
        startup.pulse += 0.04;
      }
      if (investor && investor.size < Math.min(W, H) * 0.03) {
        investor.size = Math.min(investor.size + 0.05, Math.min(W, H) * 0.028);
        investor.x = merged ? merged.x + spread : cx + spread;
        investor.y = merged ? merged.y + 2 : cy + 2;
        investor.pulse += 0.04;
      }
      if (merged) {
        merged.pulse += 0.04;
        merged.size = Math.min(W, H) * (0.04 + Math.sin(merged.pulse) * 0.003);
      }
    }

    /* ---------- PHASE 0.8-1.0: DRIFT LEFT ---------- */
    else {
      const t = (p - 0.8) / 0.2;
      const ease = 1 - Math.pow(1 - t, 2);
      const targetX = W * 0.05 + (W * 0.15) * ease;
      const targetY = H / 2;

      if (startup) {
        startup.x += (targetX - 18 - startup.x) * 0.04;
        startup.y += (targetY - 3 + Math.sin(t * 8) * 2 - startup.y) * 0.04;
        startup.pulse += 0.02;
      }
      if (investor) {
        investor.x += (targetX + 18 - investor.x) * 0.04;
        investor.y += (targetY + 3 + Math.sin(t * 8 + 2) * 2 - investor.y) * 0.04;
        investor.pulse += 0.02;
      }
      if (merged) {
        merged.x += (targetX - merged.x) * 0.04;
        merged.y += (targetY + Math.sin(t * 6) * 3 - merged.y) * 0.04;
        merged.pulse += 0.03;
        merged.size = Math.min(W, H) * (0.04 + Math.sin(merged.pulse) * 0.004);
      }
    }

    /* ─── UPDATE PARTICLES ─── */
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vx *= p.decay; p.vy *= p.decay;
      p.life--;
    });
    particles = particles.filter(p => p.life > 0);

    ambientParticles();
  }

  /* ─── RENDER ─── */
  function render(now) {
    ctx.clearRect(0, 0, W, H);

    /* Background vignette */
    const vg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W * 0.6);
    vg.addColorStop(0, 'rgba(15,21,37,0)');
    vg.addColorStop(1, 'rgba(5,8,18,0.3)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H);

    update(now);

    /* Shockwaves */
    shockwaves.forEach(sw => {
      const a = 1 - sw.progress;
      ctx.strokeStyle = `rgba(200,220,255,${a * 0.25})`;
      ctx.lineWidth = 1.5 * a;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, PI2);
      ctx.stroke();
    });

    /* Project blueprint */
    if (projectBlueprint) drawBlueprint(startup, projectBlueprint.progress);
    if (projectBlueprint) drawBriefcase(investor, projectBlueprint.progress);

    /* Particles */
    ctx.shadowBlur = 0;
    particles.forEach(p => {
      const a = p.life / p.maxLife;
      ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a * 0.6})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * a, 0, PI2);
      ctx.fill();
    });

    /* Stars (draw order: startup, investor, merged on top) */
    if (investor) drawStar(investor, phase < 0.65 ? Math.min(1, (1 - phase) * 5) : 1);
    if (startup) drawStar(startup, phase < 0.65 ? Math.min(1, (1 - phase) * 5) : 1);
    if (merged) drawStar(merged, 1);

    /* Label (small text at bottom right) */
    if (phase > 0 && phase < 1) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.font = '6px "DM Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      const labels = phase < 0.5 ? '✦ startup ⟷ investisseur' : phase < 0.8 ? '✦ fusion...' : '✦ synergie';
      ctx.fillText(labels, W - 6, H - 4);
    }
  }

  /* ─── SOUND (Web Audio) ─── */
  function initSound() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const master = audioCtx.createGain();
      master.gain.value = 0.035;
      master.connect(audioCtx.destination);

      /* Deep slow sine sub-bass */
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 52;
      const oscG = audioCtx.createGain();
      oscG.gain.value = 0.25;
      osc.connect(oscG);
      oscG.connect(master);
      osc.start();

      /* Filtered noise - ocean-like */
      const bufSize = audioCtx.sampleRate * 2;
      const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) d[i] = Math.random() * 2 - 1;
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      const nf = audioCtx.createBiquadFilter();
      nf.type = 'lowpass';
      nf.frequency.value = 120;
      nf.Q.value = 0.5;
      const ng = audioCtx.createGain();
      ng.gain.value = 0.08;
      noise.connect(nf);
      nf.connect(ng);
      ng.connect(master);
      noise.start();

      /* LFO for breathing */
      const lfo = audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.12;
      const lfoG = audioCtx.createGain();
      lfoG.gain.value = 0.4;
      lfo.connect(lfoG);
      lfoG.connect(oscG.gain);
      lfo.start();
    } catch(e) {}
  }

  function stopSound() {
    try { if (audioCtx && audioCtx.state !== 'closed') audioCtx.close(); } catch(e) {}
    audioCtx = null;
  }

  /* ─── API ─── */
  function init(el) {
    if (!el || running) return;
    canvas = el;
    ctx = canvas.getContext('2d');
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = (rect.width || 260) * dpr;
    H = canvas.height = (rect.height || 48) * dpr;
    canvas.style.width = (rect.width || 260) + 'px';
    canvas.style.height = (rect.height || 48) + 'px';
    ctx.scale(dpr, dpr);
    W /= dpr;
    H /= dpr;
    running = true;
    const now = performance.now();
    reset(now);
    function frame(t) { if (!running) return; render(t); animId = requestAnimationFrame(frame); }
    animId = requestAnimationFrame(frame);
    initSound();
  }

  function destroy() {
    running = false;
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    stopSound();
    canvas = null; ctx = null;
  }

  function resize() {
    if (!canvas || !running) return;
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = (rect.width || 260) * dpr;
    H = canvas.height = (rect.height || 48) * dpr;
    canvas.style.width = (rect.width || 260) + 'px';
    canvas.style.height = (rect.height || 48) + 'px';
    ctx.scale(dpr, dpr);
    W /= dpr;
    H /= dpr;
  }

  window.CosmicNav = { init, destroy, resize };
})();
