
'use strict';

const $  = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const lerp  = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const raf   = requestAnimationFrame;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const isMobile = window.innerWidth < 768;

function initCursor() {
  if (isTouch || prefersReducedMotion) return;

  const dot  = document.createElement('div'); dot.id  = 'cursor-dot';
  const ring = document.createElement('div'); ring.id = 'cursor-ring';
  const glow = document.createElement('div'); glow.id = 'cursor-glow';
  document.body.append(dot, ring, glow);

  let mx = -100, my = -100;
  let rx = -100, ry = -100;
  let gx = -100, gy = -100;

  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('mouseleave', () => { mx = my = -200; });

  function tick() {
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';

    rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';

    gx = lerp(gx, mx, 0.07); gy = lerp(gy, my, 0.07);
    glow.style.left = gx + 'px'; glow.style.top = gy + 'px';

    raf(tick);
  }
  raf(tick);

  const hoverEls = 'a, button, .ui-card, .cert-card, .real-card, .social-chip, .sk, .tl-card, .edu-card, .degree-card, .stat-card';
  $$(hoverEls).forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '58px'; ring.style.height = '58px';
      ring.style.borderColor = 'rgba(139,92,246,.9)';
      dot.style.width = '4px'; dot.style.height = '4px';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = ''; ring.style.height = '';
      ring.style.borderColor = '';
      dot.style.width = ''; dot.style.height = '';
    });
  });
}

function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const isLow    = isMobile || prefersReducedMotion;
  const COUNT    = isLow ? 30 : (window.innerWidth < 1280 ? 60 : 90);
  const CONN_D   = isLow ? 0  : 130;   
  const MR       = 150;                 

  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, parts = [];

  let mx = null, my = null;
  let moveRaf = null;

  window.addEventListener('mousemove', e => {
    if (!moveRaf) {
      moveRaf = raf(() => {
        mx = e.clientX; my = e.clientY;
        moveRaf = null;
      });
    }
  }, { passive: true });
  window.addEventListener('mouseleave', () => { mx = my = null; });

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 200);
  }, { passive: true });
  resize();

  class Dot {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - .5) * (isLow ? .3 : .45);
      this.vy = (Math.random() - .5) * (isLow ? .3 : .45);
      this.r  = Math.random() * 1.5 + .7;
      this.c  = Math.random() > .5
        ? `rgba(139,92,246,${.12 + Math.random()*.13})`
        : `rgba(79,140,255,${.1  + Math.random()*.12})`;
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
      if (!isLow && mx !== null) {
        const dx = mx - this.x, dy = my - this.y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < MR) {
          const f = (MR - d) / MR;
          this.x -= (dx/d) * f * 1.6;
          this.y -= (dy/d) * f * 1.6;
        }
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = this.c;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) parts.push(new Dot());

  let running = true;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) loop(); });

  function loop() {
    if (!running) return;
    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < parts.length; i++) {
      parts[i].update();
      parts[i].draw();
      if (CONN_D > 0) {
        for (let j = i+1; j < parts.length; j++) {
          const dx = parts[i].x - parts[j].x;
          const dy = parts[i].y - parts[j].y;
          const d  = Math.sqrt(dx*dx + dy*dy);
          if (d < CONN_D) {
            ctx.strokeStyle = `rgba(139,92,246,${(1-d/CONN_D)*.11})`;
            ctx.lineWidth   = .7;
            ctx.beginPath();
            ctx.moveTo(parts[i].x, parts[i].y);
            ctx.lineTo(parts[j].x, parts[j].y);
            ctx.stroke();
          }
        }
      }
    }
    raf(loop);
  }
  loop();
}

function initNav() {
  const nav      = document.getElementById('header-nav');
  const toggle   = document.getElementById('nav-toggle');
  const menu     = document.getElementById('nav-menu');
  const links    = $$('.nav-item', menu);
  const sections = $$('section[id]');

  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  function closeMenu() {
    toggle?.classList.remove('open');
    menu?.classList.remove('open');
    document.body.style.overflow = '';
    toggle?.setAttribute('aria-expanded', 'false');
  }

  toggle?.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  document.addEventListener('click', e => {
    if (menu?.classList.contains('open') && !menu.contains(e.target) && !toggle?.contains(e.target)) {
      closeMenu();
    }
  });

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const active = links.find(l => l.getAttribute('href') === '#' + e.target.id);
          active?.classList.add('active');
        }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    sections.forEach(s => spy.observe(s));
  }
}

function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  if (prefersReducedMotion) { el.textContent = 'Software Developer'; return; }

  const roles = [
    'Software Developer',
    'Python Backend Developer',
    'Web Designer',
    'UI/UX Designer',
    'Freelancer',
  ];
  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const word = roles[ri];
    if (deleting) {
      el.textContent = word.slice(0, --ci);
      const delay = ci === 0 ? 500 : 45;
      if (ci === 0) { deleting = false; ri = (ri+1) % roles.length; }
      setTimeout(tick, delay);
    } else {
      el.textContent = word.slice(0, ++ci);
      const delay = ci === word.length ? 1800 : 110;
      if (ci === word.length) deleting = true;
      setTimeout(tick, delay);
    }
  }
  setTimeout(tick, 800);
}

function initReveal() {
  const items = $$('.sr');
  if (!items.length) return;

  if (prefersReducedMotion) {
    items.forEach(el => el.classList.add('ready'));
    return;
  }

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('ready'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('ready'); obs.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -50px 0px', threshold: 0.06 });

  items.forEach(el => obs.observe(el));
}

function initCountUp() {
  const section = document.getElementById('stats');
  if (!section) return;
  if (prefersReducedMotion) {
    $$('.stat-number', section).forEach(el => {
      const t = parseFloat(el.dataset.target);
      el.textContent = (t % 1 !== 0 ? t.toFixed(2) : t) + (el.dataset.suffix || '');
    });
    return;
  }

  let triggered = false;
  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || triggered) return;
    triggered = true;

    $$('.stat-number', section).forEach(el => {
      const target  = parseFloat(el.dataset.target);
      const isFloat = target % 1 !== 0;
      const suffix  = el.dataset.suffix || '';
      const dur     = 1800;
      const t0      = performance.now();

      function step(now) {
        const p = clamp((now - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - p, 3); 
        el.textContent = (isFloat ? (e * target).toFixed(2) : Math.round(e * target)) + suffix;
        if (p < 1) raf(() => step(performance.now()));
      }
      raf(() => step(performance.now()));
    });
  }, { threshold: 0.3 });
  obs.observe(section);
}

function initSpotlight() {
  if (isTouch) return;
  $$('.stat-card,.edu-card,.tl-card,.skill-card,.cert-card,.real-card,.degree-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top }px`);
    }, { passive: true });
  });
}

function initTilt() {
  if (isTouch || prefersReducedMotion) return;

  $$('.real-card,.edu-card,.degree-card,.journal-card').forEach(card => {
    let tRx = 0, tRy = 0, cRx = 0, cRy = 0, running = false;

    function animate() {
      cRx = lerp(cRx, tRx, .12);
      cRy = lerp(cRy, tRy, .12);
      card.style.transform = `perspective(1000px) rotateX(${cRx}deg) rotateY(${cRy}deg) translateY(-5px)`;
      if (Math.abs(cRx - tRx) > .01 || Math.abs(cRy - tRy) > .01) {
        raf(animate);
      } else {
        running = false;
        if (tRx === 0 && tRy === 0) card.style.transform = '';
      }
    }

    card.addEventListener('mousemove', e => {
      const r  = card.getBoundingClientRect();
      const cx = r.width/2, cy = r.height/2;
      tRy = clamp((e.clientX - r.left - cx) / cx * 7, -7, 7);
      tRx = clamp(-(e.clientY - r.top  - cy) / cy * 7, -7, 7);
      if (!running) { running = true; raf(animate); }
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      tRx = 0; tRy = 0;
      if (!running) { running = true; raf(animate); }
    });
  });
}

function initTimeline() {
  const wrap  = $('.timeline-wrap');
  const track = $('.timeline-progress');
  if (!wrap || !track || prefersReducedMotion) return;

  window.addEventListener('scroll', () => {
    const rect = wrap.getBoundingClientRect();
    const vH   = window.innerHeight;
    if (rect.top > vH || rect.bottom < 0) return;
    const pct = clamp((vH/2 - rect.top) / rect.height, 0, 1);
    track.style.height = (pct * 100) + '%';
  }, { passive: true });
}

function initModals() {
  let overlay = null;

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.id        = 'modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image preview');
    overlay.innerHTML = `
      <button class="modal-close" id="modal-close" aria-label="Close preview">&#x2715;</button>
      <img class="modal-img" id="modal-img" alt="" src="">
      <div class="modal-caption" id="modal-caption" role="caption"></div>`;
    document.body.appendChild(overlay);

    document.getElementById('modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  }

  window.openModal = function(src, caption = '') {
    if (!overlay) buildOverlay();

    const img = document.getElementById('modal-img');
    let iframe = document.getElementById('modal-iframe');
    const isPDF = src.toLowerCase().endsWith('.pdf');

    if (isPDF) {
      img.style.display = 'none';
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'modal-iframe';
        iframe.className = 'modal-img';
        iframe.style.width = '85vw';
        iframe.style.height = '75vh';
        iframe.style.border = 'none';
        img.parentNode.insertBefore(iframe, img);
      }
      iframe.style.display = 'block';
      iframe.src = src;
    } else {
      img.style.display = 'block';
      img.src = src;
      img.alt = caption;
      if (iframe) iframe.style.display = 'none';
    }

    document.getElementById('modal-caption').textContent = caption;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('modal-close')?.focus(), 50);
  };

  window.closeModal = function() {
    overlay?.classList.remove('open');
    document.body.style.overflow = '';
    const iframe = document.getElementById('modal-iframe');
    if (iframe) iframe.src = '';
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay?.classList.contains('open')) closeModal();
  });
}

function initRipple() {
  if (prefersReducedMotion) return;

  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = '@keyframes ripple-anim{to{transform:scale(1);opacity:0}}';
    document.head.appendChild(s);
  }

  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn, .cert-view-btn');
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const d = Math.max(r.width, r.height) * 2;
    const span = document.createElement('span');
    Object.assign(span.style, {
      position:'absolute', borderRadius:'50%',
      width:d+'px', height:d+'px',
      left:(e.clientX - r.left - d/2)+'px',
      top :(e.clientY - r.top  - d/2)+'px',
      background:'rgba(255,255,255,.18)',
      transform:'scale(0)',
      animation:'ripple-anim .55s ease-out forwards',
      pointerEvents:'none', zIndex:'999',
    });
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  });
}

function initForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn  = this.querySelector('[type="submit"]');
    const orig = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = 'Sending&hellip;';

    try {
      const res  = await fetch('https://api.web3forms.com/submit', { method:'POST', body:new FormData(this) });
      const data = await res.json();
      if (data.success) {
        btn.innerHTML = '✓ Message Sent!';
        btn.style.background = 'linear-gradient(135deg,#10B981,#059669)';
        form.reset();
      } else throw new Error();
    } catch {
      btn.innerHTML = '✕ Failed — try again';
      btn.style.background = 'linear-gradient(135deg,#EF4444,#DC2626)';
    }

    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled  = false;
      btn.style.background = '';
    }, 4500);
  });
}

function initParallax() {
  if (isTouch || prefersReducedMotion) return;
  const el = $('.orbit-wrapper');
  if (!el) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    tx = (e.clientX / window.innerWidth  - .5) * 28;
    ty = (e.clientY / window.innerHeight - .5) * 18;
  }, { passive: true });

  function step() {
    cx = lerp(cx, tx, .06);
    cy = lerp(cy, ty, .06);
    el.style.transform = `translate(${cx}px,${cy}px)`;
    raf(step);
  }
  raf(step);
}

document.addEventListener('keydown', e => {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay?.classList.contains('open')) return;
  if (e.key !== 'Tab') return;

  const focusable = [...overlay.querySelectorAll('button, a, img, [tabindex]')];
  if (!focusable.length) return;
  const first = focusable[0], last = focusable[focusable.length-1];

  if (e.shiftKey) {
    if (document.activeElement === first) { last.focus(); e.preventDefault(); }
  } else {
    if (document.activeElement === last)  { first.focus(); e.preventDefault(); }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initParticles();
  initNav();
  initTypewriter();
  initReveal();
  initCountUp();
  initSpotlight();
  initTilt();
  initTimeline();
  initModals();
  initRipple();
  initForm();
  initParallax();
});
