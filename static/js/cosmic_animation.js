(function() {
  'use strict';

  /* ─── CANVAS SETUP ─── */
  let canvas, ctx, W, H;
  let animId = null;
  let audioCtx = null;
  let running = false;
  let phase = 0;        // 0..1 over 6s cycle
  let cycleTime = 0;
  const CYCLE = 6000;   // ms

  /* ─── STARS ─── */
  let star1 = null;     // startup (blue)
  let star2 = null;     // investor (violet)
  let star3 = null;     // fusion (gold/cyan)
  let particles = [];
  let trails = [];
  let shockwave = null;

  const COLORS = {
    startup:    { r: 56,  g: 189, b: 248, hex: '#38bdf8' },
    investor:   { r: 129, g: 140, b: 248, hex: '#818cf8' },
    fusion:     { r: 250, g: 204, b: 21,  hex: '#facc15' },
    ambient:    { r: 30,  g: 40,  b: 80 },
  };

  const PI2 = Math.PI * 2;

  function star(x, y, color, size) {
    return { x, y, ox: x, oy: y, color, size, glow: size * 2.5, pulse: 0 };
  }

  /* ─── PARTICLE ─── */
  function particle(x, y, vx, vy, color, life, size) {
    return { x, y, vx, vy, color, life, maxLife: life, size: size || 2 + Math.random() * 2, decay: 0.97 + Math.random() * 0.02 };
  }

  /* ─── TRAIL ─── */
  function trail(x, y, color, size) {
    return { x, y, color, size, life: 1 };
  }

  /* ─── RESET STATE ─── */
  function reset(now) {
    phase = 0;
    cycleTime = now;
    const cx = W * 0.72, cy = H / 2;
    const spread = Math.min(W, H) * 0.15;
    star1 = star(cx - spread * 0.6, cy - 3, COLORS.startup, Math.min(W, H) * 0.045);
    star2 = star(cx + spread * 0.6, cy + 3, COLORS.investor, Math.min(W, H) * 0.045);
    star3 = null;
    particles = [];
    trails = [];
    shockwave = null;
  }

  /* ─── DRAW STAR ─── */
  function drawStar(s, alpha) {
    if (!s) return;
    const a = alpha || 1;
    const r = s.size;
    const gr = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * s.glow);
    gr.addColorStop(0, `rgba(${s.color.r},${s.color.g},${s.color.b},${0.9 * a})`);
    gr.addColorStop(0.15, `rgba(${s.color.r},${s.color.g},${s.color.b},${0.6 * a})`);
    gr.addColorStop(0.5, `rgba(${s.color.r},${s.color.g},${s.color.b},${0.15 * a})`);
    gr.addColorStop(1, `rgba(${s.color.r},${s.color.g},${s.color.b},0)`);
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r * s.glow, 0, PI2);
    ctx.fill();

    const pulse = 1 + Math.sin(s.pulse || 0) * 0.08;
    ctx.fillStyle = `rgba(${s.color.r},${s.color.g},${s.color.b},${0.95 * a})`;
    ctx.shadowColor = `rgba(${s.color.r},${s.color.g},${s.color.b},${0.6 * a})`;
    ctx.shadowBlur = r * 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r * pulse, 0, PI2);
    ctx.fill();
    ctx.shadowBlur = 0;

    /* Core white */
    ctx.fillStyle = `rgba(255,255,255,${0.6 * a})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r * 0.35 * pulse, 0, PI2);
    ctx.fill();
  }

  /* ─── DRAW PARTICLE ─── */
  function drawParticle(p) {
    const a = p.life / p.maxLife;
    ctx.fillStyle = `rgba(${p.color.r},${p.color.g},${p.color.b},${a * 0.8})`;
    ctx.shadowColor = `rgba(${p.color.r},${p.color.g},${p.color.b},${a * 0.4})`;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * a, 0, PI2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  /* ─── DRAW TRAIL ─── */
  function drawTrail(t) {
    ctx.fillStyle = `rgba(${t.color.r},${t.color.g},${t.color.b},${t.life * 0.3})`;
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.size * t.life, 0, PI2);
    ctx.fill();
  }

  /* ─── SHOCKWAVE ─── */
  function drawShockwave() {
    if (!shockwave) return;
    const r = shockwave.radius;
    const a = 1 - shockwave.progress;
    ctx.strokeStyle = `rgba(200,220,255,${a * 0.5})`;
    ctx.lineWidth = 2 * a;
    ctx.beginPath();
    ctx.arc(shockwave.x, shockwave.y, r, 0, PI2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(200,220,255,${a * 0.2})`;
    ctx.lineWidth = 1 * a;
    ctx.beginPath();
    ctx.arc(shockwave.x, shockwave.y, r * 0.7, 0, PI2);
    ctx.stroke();
  }

  /* ─── DRAW PROJECT BLUEPRINT ─── */
  function drawBlueprint(x, y, progress) {
    const a = Math.min(progress * 2, 1) * (1 - Math.max(0, progress - 0.6) / 0.4);
    ctx.save();
    ctx.globalAlpha = a * 0.4;
    ctx.strokeStyle = COLORS.startup.hex;
    ctx.lineWidth = 0.5;
    const s = 14;
    ctx.strokeRect(x - s, y - s * 1.3, s * 2, s * 2.6);
    ctx.beginPath();
    ctx.moveTo(x - s * 0.6, y - s * 0.3);
    ctx.lineTo(x, y + s * 0.4);
    ctx.lineTo(x + s * 0.6, y - s * 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y + s * 0.9, s * 0.25, 0, PI2);
    ctx.stroke();
    ctx.restore();
  }

  /* ─── AMBIENT PARTICLES ─── */
  function updateAmbient() {
    if (Math.random() < 0.3) {
      const side = Math.random() > 0.5;
      particles.push(particle(
        side ? -5 : W + 5,
        Math.random() * H,
        side ? 0.2 + Math.random() * 0.3 : -0.2 - Math.random() * 0.3,
        (Math.random() - 0.5) * 0.15,
        COLORS.ambient, 120 + Math.random() * 80, 1 + Math.random() * 1.5
      ));
    }
  }

  /* ─── UPDATE ANIMATION ─── */
  function update(now) {
    const dt = now - cycleTime;
    phase = Math.min(dt / CYCLE, 1);
    const p = phase;

    /* Phase 0-0.2: Approach */
    if (p < 0.2) {
      const t = p / 0.2;
      const ease = 1 - Math.pow(1 - t, 3);
      const cx = W * 0.72, cy = H / 2;
      const spread = Math.min(W, H) * 0.15;
      const approach = spread * 0.5 * ease;
      if (star1) { star1.x = cx - spread * 0.6 + approach; star1.y = cy - 3; star1.pulse += 0.05; }
      if (star2) { star2.x = cx + spread * 0.6 - approach; star2.y = cy + 3; star2.pulse += 0.05; }

      /* Blueprint particles from startup */
      if (star1 && t > 0.3 && Math.random() < 0.4) {
        const angle = Math.random() * PI2;
        const speed = 0.3 + Math.random() * 0.4;
        particles.push(particle(
          star1.x, star1.y,
          Math.cos(angle) * speed, Math.sin(angle) * speed,
          COLORS.startup, 40 + Math.random() * 30, 1.5
        ));
      }
    }

    /* Phase 0.2-0.45: Collision / Fusion */
    else if (p < 0.45) {
      const t = (p - 0.2) / 0.25;
      const cx = W * 0.72, cy = H / 2;
      if (star1) { star1.x = cx + (Math.random() - 0.5) * 3 * t; star1.y = cy + (Math.random() - 0.5) * 3 * t; star1.pulse += 0.15; }
      if (star2) { star2.x = cx + (Math.random() - 0.5) * 3 * t; star2.y = cy + (Math.random() - 0.5) * 3 * t; star2.pulse += 0.15; }

      if (t > 0.2 && !shockwave) {
        shockwave = { x: cx, y: cy, radius: 2, progress: 0, maxRadius: Math.min(W, H) * 0.25 };
      }
      if (shockwave) {
        shockwave.radius += (shockwave.maxRadius - shockwave.radius) * 0.06;
        shockwave.progress = Math.min(shockwave.radius / shockwave.maxRadius, 1);
      }

      /* Fusion burst particles */
      if (Math.random() < 0.6) {
        const angle = Math.random() * PI2;
        const speed = 0.5 + Math.random() * 1.5;
        const c = Math.random() > 0.5 ? COLORS.startup : COLORS.investor;
        particles.push(particle(cx, cy, Math.cos(angle)*speed, Math.sin(angle)*speed, c, 30+Math.random()*20, 2));
      }

      if (star1) star1.size *= 0.99;
      if (star2) star2.size *= 0.99;
    }

    /* Phase 0.45-0.7: Third star emerges */
    else if (p < 0.7) {
      const t = (p - 0.45) / 0.25;
      const cx = W * 0.72, cy = H / 2;
      if (star1) { star1.x = cx - 15 * (1 - t); star1.y = cy - 2; star1.size = Math.min(star1.size + 0.02, Math.min(W, H) * 0.04); star1.pulse += 0.03; }
      if (star2) { star2.x = cx + 15 * (1 - t); star2.y = cy + 2; star2.size = Math.min(star2.size + 0.02, Math.min(W, H) * 0.04); star2.pulse += 0.03; }
      if (!star3) star3 = star(cx, cy, COLORS.fusion, 2);
      if (star3) {
        star3.x = cx; star3.y = cy;
        star3.size = Math.min(star3.size + 0.3, Math.min(W, H) * 0.05);
        star3.pulse += 0.06;
      }

      if (shockwave) {
        shockwave.radius += (shockwave.maxRadius * 1.3 - shockwave.radius) * 0.03;
        shockwave.progress = Math.min(shockwave.radius / shockwave.maxRadius, 1);
      }

      if (Math.random() < 0.3) {
        const angle = Math.random() * PI2;
        const speed = 0.3 + Math.random() * 0.5;
        particles.push(particle(cx, cy, Math.cos(angle)*speed, Math.sin(angle)*speed, COLORS.fusion, 50+Math.random()*30, 2));
      }
    }

    /* Phase 0.7-1.0: Float back to left */
    else {
      const t = (p - 0.7) / 0.3;
      const ease = 1 - Math.pow(1 - t, 2);
      const targetX = W * 0.1 + (W * 0.2) * ease;
      const targetY = H / 2 + Math.sin(t * Math.PI * 3) * 4;
      if (star1) {
        star1.x += (targetX - 20 - star1.x) * 0.04;
        star1.y += (targetY - 5 - star1.y) * 0.04;
        star1.pulse += 0.02;
      }
      if (star2) {
        star2.x += (targetX + 20 - star2.x) * 0.04;
        star2.y += (targetY + 5 - star2.y) * 0.04;
        star2.pulse += 0.02;
      }
      if (star3) {
        star3.x += (targetX - star3.x) * 0.04;
        star3.y += (targetY - star3.y) * 0.04;
        star3.pulse += 0.03;
        star3.size = Math.min(W, H) * 0.05 + Math.sin(star3.pulse) * 1.5;
      }
      if (shockwave) shockwave.progress = Math.max(0, shockwave.progress - 0.01);
    }

    /* Update trails */
    [star1, star2, star3].forEach(s => {
      if (!s) return;
      if (Math.random() < 0.4) {
        trails.push(trail(s.x + (Math.random()-0.5)*2, s.y + (Math.random()-0.5)*2, s.color, s.size * 0.3));
      }
    });
    trails.forEach(t => { t.x += (Math.random()-0.5)*0.3; t.y += (Math.random()-0.5)*0.3; t.life -= 0.03; });
    trails = trails.filter(t => t.life > 0);

    /* Update particles */
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vx *= p.decay; p.vy *= p.decay;
      p.life--;
    });
    particles = particles.filter(p => p.life > 0);

    updateAmbient();
  }

  /* ─── RENDER ─── */
  function render(now) {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(11,17,32,0.15)';
    ctx.fillRect(0, 0, W, H);

    update(now);

    /* Trails */
    trails.forEach(drawTrail);

    /* Shockwave */
    drawShockwave();

    /* Blueprint */
    if (phase < 0.2 && star1) {
      drawBlueprint(star1.x, star1.y - star1.size * 3, phase / 0.2);
    }

    /* Ambient particles */
    particles.forEach(drawParticle);

    /* Stars */
    drawStar(star1);
    drawStar(star2);
    drawStar(star3);

    /* Phase indicator text */
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.font = '7px "DM Sans", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('✦ startup ⟷ investisseur', W - 8, H - 4);
  }

  /* ─── LOOP ─── */
  function loop(now) {
    if (!running) return;
    render(now);
    animId = requestAnimationFrame(loop);
  }

  /* ─── SOUND ─── */
  let soundNodes = null;
  function initSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      audioCtx = new AudioCtx();

      /* Master gain */
      const master = audioCtx.createGain();
      master.gain.value = 0.04;
      master.connect(audioCtx.destination);

      /* Sub-bass drone */
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 48;
      const oscGain = audioCtx.createGain();
      oscGain.gain.value = 0.3;
      osc.connect(oscGain);
      oscGain.connect(master);
      osc.start();

      /* Gentle filtered noise */
      const bufferSize = audioCtx.sampleRate * 2;
      const buf = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
      const noise = audioCtx.createBufferSource();
      noise.buffer = buf;
      noise.loop = true;
      const noiseFilter = audioCtx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.value = 200;
      noiseFilter.Q.value = 1;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.value = 0.15;
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noise.start();

      /* LFO for breathing effect */
      const lfo = audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.15;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(oscGain.gain);
      lfo.start();

      soundNodes = { master, osc, noise, lfo };
    } catch(e) { audioCtx = null; }
  }

  function stopSound() {
    try {
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    } catch(e) {}
    soundNodes = null;
    audioCtx = null;
  }

  /* ─── INIT / DESTROY ─── */
  function init(el) {
    if (!el || running) return;
    canvas = el;
    ctx = canvas.getContext('2d');
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = rect.width || 260;
    H = canvas.height = rect.height || 48;
    running = true;
    const now = performance.now();
    reset(now);
    loop(now);
    initSound();
  }

  function destroy() {
    running = false;
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    stopSound();
    canvas = null;
    ctx = null;
  }

  function resize() {
    if (!canvas || !running) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = rect.width || 260;
    H = canvas.height = rect.height || 48;
  }

  /* ─── EXPOSE ─── */
  window.CosmicNav = { init, destroy, resize };
})();
