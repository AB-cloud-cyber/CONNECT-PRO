/* ConnectPro — Scripts principaux */

// ── Auto-dismiss flash messages ──────────────────────────────
document.querySelectorAll('.flash').forEach(el => {
  setTimeout(() => el.style.opacity = '0', 4500);
  setTimeout(() => el.remove(), 5000);
  el.style.transition = 'opacity 0.5s ease';
});

// ── Animate stat counters ────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target || el.textContent, 10);
  if (isNaN(target) || target === 0) return;
  const duration = 1200;
  const steps = 40;
  const increment = target / steps;
  let current = 0;
  const timer = setInterval(() => {
    current = Math.min(current + increment, target);
    el.textContent = Math.round(current).toLocaleString('fr-FR');
    if (current >= target) clearInterval(timer);
  }, duration / steps);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

// ── Score bars animate on scroll ─────────────────────────────
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.dataset.width || entry.target.style.width;
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.score-bar-fill').forEach(el => {
  const w = el.style.width;
  el.style.width = '0';
  el.dataset.width = w;
  barObserver.observe(el);
});

// ── Confirm delete ───────────────────────────────────────────
document.querySelectorAll('[data-confirm]').forEach(el => {
  el.addEventListener('click', e => {
    if (!confirm(el.dataset.confirm)) e.preventDefault();
  });
});
