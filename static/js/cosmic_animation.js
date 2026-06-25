(function() {
  'use strict';

  /* ─── CANVAS SETUP ─── */
  let canvas, ctx, W, H, dpr;
  let animId = null, audioCtx = null, running = false;
  let phase = 0, cycleTime = 0;
  const CYCLE = 6000;

  /* ─── STARS ─── */
  let startup, investor, merged;
  let particles = [], shockwaves = [];
  let projectBlueprint = false;
  const COLORS = {
    startup:  { r: 56,  g: 189, b: 248, hex: '#38bdf8' },
    investor: { r: 168, g: 85,  b: 247, hex: '#a855f7' },
    fusion:   { r: 250, g: 204, b: 21,  hex: '#facc15' },
    ambient:  { r: 40,  g: 60,  b: 100 },
  };
  const PI2 = Math.PI * 2;
  let baseUnit = 1;

  function star(x, y, color) {
    return { x, y, ox: x, oy: y, color, size: 1, glow: 3, pulse: 0 };
  }

  function pix(v) { return v * baseUnit; }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function spawn(x, y, color, n, speed, life, sz) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * PI2, s = speed * rand(0.3, 1);
      particles.push({
        x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s,
        color, life: life||40, maxLife: life||40,
        size: sz || pix(rand(0.5,1.5)), decay: rand(0.95,0.98),
      });
    }
  }

  function addShock(x, y) {
    shockwaves.push({ x, y, radius: 2, maxR: pix(rand(60,120)), progress: 0 });
  }

  function reset(now) {
    phase = 0; cycleTime = now; particles = []; shockwaves = [];
    merged = null; projectBlueprint = false;
    const cx = W * 0.65, cy = H * 0.45, sp = pix(rand(25,35));
    startup  = star(cx - sp, cy - 3, COLORS.startup);
    investor = star(cx + sp, cy + 3, COLORS.investor);
    startup.size = pix(rand(5,7)); startup.glow = 3;
    investor.size = pix(rand(5,7)); investor.glow = 3;
  }

  /* ─── DRAW ─── */
  function drawEntity(s, alpha) {
    if (!s || !alpha) return;
    const a = Math.min(alpha, 1);
    const r = s.size;
    const gR = r * s.glow;

    const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, gR);
    g.addColorStop(0, `rgba(${s.color.r},${s.color.g},${s.color.b},${0.35*a})`);
    g.addColorStop(0.2,`rgba(${s.color.r},${s.color.g},${s.color.b},${0.12*a})`);
    g.addColorStop(0.5,`rgba(${s.color.r},${s.color.g},${s.color.b},${0.04*a})`);
    g.addColorStop(1, `rgba(${s.color.r},${s.color.g},${s.color.b},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(s.x, s.y, gR, 0, PI2); ctx.fill();

    const pulse = 1 + Math.sin(s.pulse) * 0.06;
    const rad = r * pulse;

    ctx.shadowColor = `rgba(${s.color.r},${s.color.g},${s.color.b},${0.5*a})`;
    ctx.shadowBlur = rad * 3;
    ctx.fillStyle = `rgba(${s.color.r},${s.color.g},${s.color.b},${0.3*a})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, rad*1.15, 0, PI2); ctx.fill();

    ctx.shadowBlur = rad * 1.5;
    ctx.fillStyle = `rgba(${Math.min(255,s.color.r+40)},${Math.min(255,s.color.g+40)},${Math.min(255,s.color.b+40)},${0.7*a})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, rad*0.65, 0, PI2); ctx.fill();

    ctx.shadowBlur = rad * 0.6;
    ctx.fillStyle = `rgba(255,255,255,${0.4*a})`;
    ctx.beginPath(); ctx.arc(s.x, s.y, rad*0.22, 0, PI2); ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255,255,255,${0.08*a})`;
    ctx.lineWidth = pix(0.5);
    const gl = rad * 0.7;
    ctx.beginPath();
    ctx.moveTo(s.x-gl,s.y); ctx.lineTo(s.x+gl,s.y);
    ctx.moveTo(s.x,s.y-gl); ctx.lineTo(s.x,s.y+gl);
    ctx.stroke();
  }

  /* ─── SHOCKWAVE ─── */
  function drawShocks() {
    shockwaves.forEach(sw => {
      const a = 1 - sw.progress;
      ctx.strokeStyle = `rgba(200,220,255,${a*0.2})`;
      ctx.lineWidth = pix(1.5) * a;
      ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.radius, 0, PI2); ctx.stroke();
      ctx.strokeStyle = `rgba(200,220,255,${a*0.08})`;
      ctx.lineWidth = pix(0.8) * a;
      ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.radius*0.7, 0, PI2); ctx.stroke();
    });
  }

  /* ─── PARTICLES ─── */
  function drawParticles() {
    particles.forEach(p => {
      const a = p.life / p.maxLife;
      ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a*0.5})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size*a, 0, PI2); ctx.fill();
    });
  }

  /* ─── BLUEPRINT ─── */
  function drawBlueprint(s, t) {
    if (!s) return;
    const life = Math.min(t*2,1) * Math.max(0, 1-Math.max(0,t-0.5)/0.5);
    if (life <= 0) return;
    ctx.save();
    ctx.globalAlpha = life * 0.35;
    const bx = s.x + s.size*2.5, by = s.y - s.size*3.5;
    const sc = pix(1.2);
    const w = pix(28)*sc, h = pix(20)*sc;
    ctx.strokeStyle = COLORS.startup.hex; ctx.lineWidth = pix(0.8);
    ctx.strokeRect(bx - w/2, by - h/2, w, h);
    ctx.fillStyle = `rgba(56,189,248,0.25)`;
    ctx.fillRect(bx - w/3, by + h/4 - pix(6), pix(4)*sc, pix(6)*sc);
    ctx.fillRect(bx - pix(2), by + h/4 - pix(10), pix(4)*sc, pix(10)*sc);
    ctx.fillRect(bx + w/3 - pix(4)*sc, by + h/4 - pix(8), pix(4)*sc, pix(8)*sc);
    ctx.strokeStyle = `rgba(56,189,248,0.12)`;
    ctx.lineWidth = pix(0.4);
    for (let i=0;i<5;i++) {
      const ang = -Math.PI/2 + (i-2)*0.25, len = pix(12+i*3);
      ctx.beginPath(); ctx.moveTo(bx+Math.cos(ang)*w/2, by+Math.sin(ang)*h/2);
      ctx.quadraticCurveTo(bx+Math.cos(ang-0.2)*len*0.6, by+Math.sin(ang-0.2)*len*0.6-pix(4), bx+Math.cos(ang)*len, by+Math.sin(ang)*len-pix(6));
      ctx.stroke();
    }
    // dots
    for (let i=0;i<6;i++) {
      const ang = Math.random()*PI2, dist = pix(5+Math.random()*8);
      ctx.fillStyle = `rgba(56,189,248,${0.15*life})`;
      ctx.beginPath(); ctx.arc(bx+Math.cos(ang)*dist, by+Math.sin(ang)*dist, pix(0.5+Math.random()), 0, PI2); ctx.fill();
    }
    ctx.restore();
  }

  /* ─── BRIEFCASE ─── */
  function drawBriefcase(s, t) {
    if (!s) return;
    const life = Math.min(t*2,1) * Math.max(0, 1-Math.max(0,t-0.4)/0.6);
    if (life <= 0) return;
    ctx.save();
    ctx.globalAlpha = life*0.3;
    const bx = s.x - s.size*3, by = s.y - s.size*2.5;
    const sc = pix(0.8);
    const w=pix(18)*sc, h=pix(12)*sc;
    ctx.strokeStyle = COLORS.investor.hex; ctx.lineWidth = pix(1);
    ctx.strokeRect(bx-w/2, by-h/2+pix(3)*sc, w, h);
    ctx.strokeRect(bx-w/4, by-h/2, w/2, pix(3)*sc);
    ctx.restore();
  }

  /* ─── UPDATE ─── */
  function update(now) {
    const dt = now - cycleTime;
    phase = Math.min(dt / CYCLE, 1);
    const p = phase;
    const cx = W * 0.55, cy = H * 0.45;
    const sp = pix(rand(25,35));

    /* 0-0.15: Enter from right */
    if (p < 0.15) {
      const t = p / 0.15, ease = 1 - Math.pow(1 - t, 3);
      if (startup) { startup.x = W + (cx - sp - W)*ease; startup.y = cy-3 + Math.sin(t*3)*pix(1.5); startup.pulse += 0.03; }
      if (investor) { investor.x = W + (cx + sp - W)*ease; investor.y = cy+3 + Math.sin(t*3+1)*pix(1.5); investor.pulse += 0.03; }
      spawn(startup ? startup.x : cx, startup ? startup.y : cy, COLORS.startup, 1, pix(0.3), 30, pix(1));
    }

    /* 0.15-0.35: Startup pitches + investor waits */
    else if (p < 0.35) {
      const t = (p - 0.15) / 0.2;
      const orbit = Math.sin(t*PI2)*sp*0.15;
      if (startup) {
        startup.x = cx - sp*0.5 + orbit*0.3;
        startup.y = cy-3 - Math.sin(t*Math.PI)*sp*0.12;
        startup.pulse += 0.06 + t*0.03;
        startup.size = startup.size + pix(0.05);
      }
      if (investor) {
        investor.x = cx + sp*0.5 - orbit*0.2;
        investor.y = cy+3 + Math.sin(t*Math.PI+0.5)*sp*0.08;
        investor.pulse += 0.04;
      }
      projectBlueprint = true;
      if (Math.random() < 0.5) {
        const a = -Math.PI/2 + rand(-0.4,0.4);
        spawn(startup.x+Math.cos(a)*startup.size*1.5, startup.y+Math.sin(a)*startup.size*1.5, COLORS.startup, 1, pix(0.5+Math.random()*0.5), rand(20,35), pix(1));
      }
    }

    /* 0.35-0.5: Merge */
    else if (p < 0.5) {
      const t = (p - 0.35) / 0.15;
      const shrink = 1 - t*0.3;
      if (startup) {
        startup.x = cx - sp*0.5*shrink; startup.y = cy-3 + rand(-1,1)*t*pix(2);
        startup.pulse += 0.12; startup.size *= 0.987;
      }
      if (investor) {
        investor.x = cx + sp*0.5*shrink; investor.y = cy+3 + rand(-1,1)*t*pix(2);
        investor.pulse += 0.12; investor.size *= 0.987;
      }
      if (t > 0.3 && shockwaves.length === 0) {
        addShock(cx, cy); spawn(cx, cy, COLORS.startup, 12, pix(2.5), 25, pix(2));
        spawn(cx, cy, COLORS.investor, 12, pix(2.5), 25, pix(2));
      }
      projectBlueprint = false;
    }

    /* 0.5-0.65: Merged star emerges */
    else if (p < 0.65) {
      const t = (p - 0.5) / 0.15;
      if (startup) { startup.size *= 0.95; startup.pulse += 0.1; }
      if (investor) { investor.size *= 0.95; investor.pulse += 0.1; }
      if (!merged) { merged = star(cx, cy, COLORS.fusion); merged.size = pix(2); merged.glow = 4; }
      if (merged) {
        merged.x = cx + rand(-1,1)*t*pix(2); merged.y = cy + rand(-1,1)*t*pix(2);
        merged.size = Math.min(merged.size + pix(0.35), pix(rand(13,16)));
        merged.pulse += 0.08;
      }
      if (Math.random() < 0.5) {
        const a = Math.random()*PI2, speed = pix(rand(1,2));
        const c = Math.random()>0.5 ? COLORS.startup : COLORS.investor;
        particles.push({ x: cx, y: cy, vx: Math.cos(a)*speed, vy: Math.sin(a)*speed, color: c, life: rand(20,35), maxLife: 35, size: pix(rand(1,2)), decay: 0.96 });
      }
      shockwaves.forEach(sw => { sw.radius += (sw.maxR-sw.radius)*0.05; sw.progress = Math.min(sw.radius/sw.maxR,1); });
    }

    /* 0.65-0.8: Trio */
    else if (p < 0.8) {
      const t = (p-0.65)/0.15;
      const spread = pix(rand(10,15));
      if (startup && startup.size < pix(4)) {
        startup.size = Math.min(startup.size+pix(0.04), pix(rand(5,7)));
        startup.x = merged ? merged.x-spread : cx-spread;
        startup.y = merged ? merged.y-pix(2) : cy-pix(2);
        startup.pulse += 0.04;
      }
      if (investor && investor.size < pix(4)) {
        investor.size = Math.min(investor.size+pix(0.04), pix(rand(5,7)));
        investor.x = merged ? merged.x+spread : cx+spread;
        investor.y = merged ? merged.y+pix(2) : cy+pix(2);
        investor.pulse += 0.04;
      }
      if (merged) { merged.pulse += 0.04; merged.size = pix(rand(10,12)) + Math.sin(merged.pulse)*pix(1); }
    }

    /* 0.8-1: Drift left */
    else {
      const t = (p-0.8)/0.2, ease = 1-Math.pow(1-t,2);
      const tx = W*0.08 + pix(rand(20,40))*ease, ty = H*0.45;
      if (startup) {
        startup.x += (tx-pix(12)-startup.x)*0.04;
        startup.y += (ty-pix(2)+Math.sin(t*8)*pix(2)-startup.y)*0.04;
        startup.pulse += 0.02;
      }
      if (investor) {
        investor.x += (tx+pix(12)-investor.x)*0.04;
        investor.y += (ty+pix(2)+Math.sin(t*8+2)*pix(2)-investor.y)*0.04;
        investor.pulse += 0.02;
      }
      if (merged) {
        merged.x += (tx-merged.x)*0.04;
        merged.y += (ty+Math.sin(t*6)*pix(3)-merged.y)*0.04;
        merged.pulse += 0.03;
        merged.size = pix(rand(10,12)) + Math.sin(merged.pulse)*pix(1);
      }
    }

    /* Update particles */
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vx *= p.decay; p.vy *= p.decay; p.life--; });
    particles = particles.filter(p => p.life > 0);

    /* Ambient */
    if (Math.random() < 0.2) {
      const side = Math.random() > 0.5;
      particles.push({ x: side ? -2 : W+2, y: Math.random()*H, vx: side ? rand(0.1,0.2) : rand(-0.2,-0.1), vy: rand(-0.1,0.1), color: COLORS.ambient, life: rand(60,120), maxLife: rand(60,120), size: pix(rand(0.3,0.8)), decay: 0.99 });
    }
  }

  function render(now) {
    ctx.clearRect(0, 0, W, H);
    const vg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.6);
    vg.addColorStop(0, 'rgba(10,14,26,0)');
    vg.addColorStop(1, 'rgba(5,8,18,0.2)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    update(now);
    drawShocks();
    if (projectBlueprint && startup) { drawBlueprint(startup, phase < 0.35 ? (phase-0.15)/0.2 : 0); drawBriefcase(investor, phase < 0.35 ? (phase-0.15)/0.2 : 0); }
    drawParticles();
    if (investor) drawEntity(investor, phase<0.65?Math.min(1,(1-phase)*5):1);
    if (startup) drawEntity(startup, phase<0.65?Math.min(1,(1-phase)*5):1);
    if (merged) drawEntity(merged, 1);
  }

  /* ─── SOUND ─── */
  function initSound() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const master = audioCtx.createGain(); master.gain.value = 0.025; master.connect(audioCtx.destination);
      const osc = audioCtx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 48;
      const og = audioCtx.createGain(); og.gain.value = 0.2; osc.connect(og); og.connect(master); osc.start();
      const bs = audioCtx.sampleRate*2, b = audioCtx.createBuffer(1, bs, audioCtx.sampleRate);
      const d = b.getChannelData(0); for(let i=0;i<bs;i++) d[i]=Math.random()*2-1;
      const noise = audioCtx.createBufferSource(); noise.buffer = b; noise.loop = true;
      const nf = audioCtx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = 100;
      const ng = audioCtx.createGain(); ng.gain.value = 0.05; noise.connect(nf); nf.connect(ng); ng.connect(master); noise.start();
      const lfo = audioCtx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.1;
      const lg = audioCtx.createGain(); lg.gain.value = 0.5; lfo.connect(lg); lg.connect(og.gain); lfo.start();
    } catch(e) {}
  }
  function stopSound() { try { if(audioCtx&&audioCtx.state!=='closed')audioCtx.close(); }catch(e){} audioCtx=null; }

  /* ─── API ─── */
  function init(el) {
    if (!el || running) return;
    canvas = el; ctx = canvas.getContext('2d');
    dpr = window.devicePixelRatio || 1;
    const rect = el.getBoundingClientRect();
    W = canvas.width = rect.width * dpr; H = canvas.height = rect.height * dpr;
    canvas.style.width = rect.width+'px'; canvas.style.height = rect.height+'px';
    ctx.scale(dpr, dpr); W/=dpr; H/=dpr;
    baseUnit = Math.min(W, H) * 0.02 || 1;
    running = true;
    const now = performance.now(); reset(now);
    function frame(t) { if(!running) return; render(t); animId = requestAnimationFrame(frame); }
    animId = requestAnimationFrame(frame);
    initSound();
  }

  function destroy() {
    running = false; if(animId) cancelAnimationFrame(animId);
    stopSound(); canvas = null; ctx = null;
  }

  function resize() {
    if (!canvas||!running) return;
    dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = canvas.width = rect.width * dpr; H = canvas.height = rect.height * dpr;
    canvas.style.width = rect.width+'px'; canvas.style.height = rect.height+'px';
    ctx.scale(dpr, dpr); W/=dpr; H/=dpr;
    baseUnit = Math.min(W, H) * 0.02 || 1;
  }

  window.CosmicNav = { init, destroy, resize };
})();
