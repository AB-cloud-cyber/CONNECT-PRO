(function() {
  'use strict';

  /* ─── 1. SCROLL REVEAL ─── */
  function initScrollReveal() {
    var selectors = '.a-reveal, .a-reveal-left, .a-reveal-right, .a-reveal-scale';
    var els = document.querySelectorAll(selectors);
    if (!els.length) return;
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function(el) { obs.observe(el); });
  }

  /* ─── 2. RIPPLE EFFECT ─── */
  function initRipples() {
    document.querySelectorAll('.a-ripple').forEach(function(el) {
      el.addEventListener('click', function(e) {
        var rect = el.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;
        var ripple = document.createElement('span');
        ripple.className = 'a-ripple-effect';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        el.appendChild(ripple);
        ripple.addEventListener('animationend', function() { ripple.remove(); });
      });
    });
  }

  /* ─── 3. PARTICLE BURST ON CLICK ─── */
  function initParticleBurst() {
    document.querySelectorAll('[data-particles]').forEach(function(el) {
      el.addEventListener('click', function(e) {
        var rect = el.getBoundingClientRect();
        var cx = e.clientX - rect.left, cy = e.clientY - rect.top;
        var color = el.dataset.particles || '#38bdf8';
        var count = 12;
        var container = document.createElement('div');
        container.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:10';
        el.style.position = 'relative';
        el.appendChild(container);
        for (var i = 0; i < count; i++) {
          var p = document.createElement('span');
          var angle = Math.random() * Math.PI * 2;
          var dist = 20 + Math.random() * 40;
          var size = 3 + Math.random() * 4;
          p.style.cssText =
            'position:absolute;left:' + cx + 'px;top:' + cy + 'px;' +
            'width:' + size + 'px;height:' + size + 'px;' +
            'border-radius:50%;background:' + color + ';' +
            'pointer-events:none;' +
            'transition:all 0.6s cubic-bezier(0.34,1.56,0.64,1);' +
            'opacity:0.8;';
          container.appendChild(p);
          requestAnimationFrame(function() {
            p.style.transform = 'translate(' + (Math.cos(angle)*dist) + 'px,' + (Math.sin(angle)*dist) + 'px)';
            p.style.opacity = '0';
          });
        }
        setTimeout(function() { container.remove(); }, 700);
      });
    });
  }

  /* ─── 4. BACK TO TOP ─── */
  function initBackToTop() {
    var btn = document.querySelector('.a-back-to-top');
    if (!btn) return;
    var onScroll = function() {
      btn.classList.toggle('visible', window.scrollY > 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── 5. SMOOTH SCROLL FOR ANCHORS ─── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(a) {
      a.addEventListener('click', function(e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  /* ─── INIT ─── */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        initScrollReveal();
        initRipples();
        initParticleBurst();
        initBackToTop();
        initSmoothScroll();
      });
    } else {
      initScrollReveal();
      initRipples();
      initParticleBurst();
      initBackToTop();
      initSmoothScroll();
    }
  }

  init();
})();
