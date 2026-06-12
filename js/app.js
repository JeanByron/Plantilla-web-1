/* ============================================================
   Plantilla Web Interactiva — scroll cinematográfico
   js/app.js — fondo animado por scroll + galerías + carrusel
   ============================================================ */

'use strict';

// Forzar que el navegador siempre empiece desde arriba
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('load', () => window.scrollTo(0, 0));

// ── CONFIG ────────────────────────────────────────────────────
const FRAME_SPEED   = 3.0;   // mayor: avanza más rápido respecto al scroll
const WINDOW        = 0.06;  // ventana de animación por sección

// Hero desaparece al 12% de scroll
const HERO_FADE_END = 0.12;

// ── FONDO ANIMADO — modos generativos ligados al scroll ──────
//  'aurora' → cintas de aurora, orbes de luz y estrellas
//  'cosmos' → viaje estelar con efecto túnel y nebulosa
// Ambos se dibujan en canvas y avanzan/retroceden con el scroll.
// El selector flotante (#bg-switcher) permite alternar entre ellos.
let bgMode = 'aurora';

// Frames virtuales: resolución temporal de la animación de fondo
const VIRTUAL_FRAMES = 240;
let currentFrame = 0;

// ── CANVAS RENDERER ──────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  renderBackground(currentFrame, VIRTUAL_FRAMES);
}

// ── FONDO "AURORA" (generativo, ligado al scroll) ─────────────
// Todo se deriva del progreso del frame virtual, así que la
// animación avanza y retrocede con el scroll, sin imágenes.
function drawAuroraFrame(frameFloat, maxFrames) {
  const cw = canvas.width  / (window.devicePixelRatio || 1);
  const ch = canvas.height / (window.devicePixelRatio || 1);
  const p  = maxFrames > 1 ? frameFloat / (maxFrames - 1) : 0;
  const t  = p * Math.PI * 6; // "tiempo" derivado del scroll

  // Cielo base con deriva sutil de tono (oscilante: p puede superar 1)
  const sky = ctx.createLinearGradient(0, 0, 0, ch);
  sky.addColorStop(0,    `hsl(${168 + Math.sin(t * 0.5) * 12}, 45%, ${(8 + Math.sin(t * 0.35) * 3).toFixed(1)}%)`);
  sky.addColorStop(0.55, '#0A1A17');
  sky.addColorStop(1,    `hsl(${(166 + Math.sin(t * 0.27) * 10).toFixed(1)}, 40%, ${(6 + Math.sin(t * 0.21) * 2).toFixed(1)}%)`);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, cw, ch);

  // Estrellas deterministas que titilan con el scroll
  for (let i = 0; i < 80; i++) {
    const sx = ((i * 127.3) % 97) / 97 * cw;
    const sy = ((i * 311.7) % 89) / 89 * ch * 0.72;
    const tw = Math.abs(Math.sin(t * 0.8 + i * 1.7));
    ctx.fillStyle = `rgba(245,241,235,${(0.05 + tw * 0.16).toFixed(3)})`;
    ctx.fillRect(sx, sy, 1.5, 1.5);
  }

  // Orbes de luz que viajan con el scroll (teal + acento naranja)
  const orbs = [
    { x: 0.5  + 0.32 * Math.sin(t * 0.45),     y: 0.32 + 0.10 * Math.cos(t * 0.6), r: 0.50, c: '170,60%,38%', a: 0.16 },
    { x: 0.78 - 0.25 * Math.sin(t * 0.3 + 1),  y: 0.22 + 0.12 * Math.sin(t * 0.5), r: 0.34, c: '22,80%,48%',  a: 0.10 }
  ];
  orbs.forEach(o => {
    const g = ctx.createRadialGradient(cw * o.x, ch * o.y, 0, cw * o.x, ch * o.y, Math.max(cw, ch) * o.r);
    g.addColorStop(0, `hsla(${o.c},${o.a})`);
    g.addColorStop(1, `hsla(${o.c},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
  });

  // Cintas de aurora: ondas superpuestas que fluyen con el scroll
  const ribbons = [
    { base: 0.34, amp: 0.060, hue: 165, alpha: 0.16, speed: 1.0, freq: 1.6 },
    { base: 0.47, amp: 0.090, hue: 150, alpha: 0.13, speed: 1.6, freq: 2.3 },
    { base: 0.60, amp: 0.070, hue: 176, alpha: 0.11, speed: 2.2, freq: 1.2 },
    { base: 0.42, amp: 0.050, hue: 24,  alpha: 0.07, speed: 1.3, freq: 2.8 }
  ];
  ribbons.forEach(rb => {
    ctx.beginPath();
    ctx.moveTo(0, ch);
    for (let x = 0; x <= cw; x += 14) {
      const n = x / cw;
      const y = ch * (rb.base
        + Math.sin(n * Math.PI * rb.freq + t * rb.speed) * rb.amp
        + Math.sin(n * Math.PI * rb.freq * 2.7 - t * rb.speed * 0.6) * rb.amp * 0.4);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(cw, ch);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, ch * (rb.base - rb.amp * 2), 0, ch);
    g.addColorStop(0, `hsla(${rb.hue},70%,45%,${rb.alpha})`);
    g.addColorStop(1, `hsla(${rb.hue},70%,45%,0)`);
    ctx.fillStyle = g;
    ctx.fill();
  });
}

// ── FONDO "COSMOS" (generativo, ligado al scroll) ─────────────
// Segundo ejemplo: viaje estelar. Las estrellas avanzan hacia el
// espectador al bajar (y retroceden al subir), con anillos en
// efecto túnel y una nebulosa que respira con el progreso.
function drawCosmosFrame(frameFloat, maxFrames) {
  const cw = canvas.width  / (window.devicePixelRatio || 1);
  const ch = canvas.height / (window.devicePixelRatio || 1);
  const p  = maxFrames > 1 ? frameFloat / (maxFrames - 1) : 0;
  const t  = p * Math.PI * 6; // "tiempo" derivado del scroll
  const cx = cw / 2, cy = ch / 2;
  const maxR = Math.hypot(cx, cy);

  // Espacio profundo con deriva sutil de tono (oscilante: p puede superar 1)
  const base = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  base.addColorStop(0,   `hsl(${188 + Math.sin(t * 0.4) * 14}, 45%, ${(10 + Math.sin(t * 0.3) * 3).toFixed(1)}%)`);
  base.addColorStop(0.6, '#081512');
  base.addColorStop(1,   '#050D0B');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, cw, ch);

  // Nebulosa naranja que se desplaza y respira con el scroll
  const nx = cx + Math.sin(t * 0.35) * cw * 0.22;
  const ny = cy * (0.6 + 0.2 * Math.cos(t * 0.5));
  const neb = ctx.createRadialGradient(nx, ny, 0, nx, ny, maxR * (0.45 + 0.1 * Math.sin(t)));
  neb.addColorStop(0, 'rgba(232,98,26,0.10)');
  neb.addColorStop(1, 'rgba(232,98,26,0)');
  ctx.fillStyle = neb;
  ctx.fillRect(0, 0, cw, ch);

  // Anillos concéntricos que se expanden con el scroll (efecto túnel)
  for (let i = 0; i < 6; i++) {
    const ringP = ((i / 6) + p * 2.2) % 1;          // 0 = centro, 1 = borde
    const r     = Math.pow(ringP, 2.2) * maxR * 1.1;
    const alpha = Math.sin(ringP * Math.PI) * 0.10; // aparece y se desvanece
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(168,60%,55%,${alpha.toFixed(3)})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Campo estelar en "warp": cada estrella viaja del centro al borde
  for (let i = 0; i < 110; i++) {
    const ang   = ((i * 137.5) % 360) * Math.PI / 180; // ángulo áureo: distribución uniforme
    const seed  = ((i * 73.7) % 47) / 47;              // profundidad inicial determinista
    const depth = (seed + p * 1.6) % 1;                // 0 = lejos, 1 = cerca
    const r     = Math.pow(depth, 2.4) * maxR * 1.05;
    const dirX  = Math.cos(ang + t * 0.05);
    const dirY  = Math.sin(ang + t * 0.05);
    const x     = cx + dirX * r;
    const y     = cy + dirY * r;
    const size  = 0.5 + depth * 2.2;
    const alpha = Math.min(1, depth * 1.8) * 0.5;

    // Estela corta hacia el centro (sensación de velocidad)
    if (depth > 0.55) {
      const trail = (depth - 0.55) * 26;
      ctx.strokeStyle = `rgba(245,241,235,${(alpha * 0.35).toFixed(3)})`;
      ctx.lineWidth = size * 0.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - dirX * trail, y - dirY * trail);
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(245,241,235,${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Dibuja el fondo según el modo activo del selector
function renderBackground(frameFloat, maxF) {
  if (bgMode === 'cosmos') drawCosmosFrame(frameFloat, maxF);
  else drawAuroraFrame(frameFloat, maxF);
}

// ── SELECTOR DE FONDO (demo para el cliente) ──────────────────
function initBgSwitcher() {
  const switcher = document.getElementById('bg-switcher');
  if (!switcher) return;
  const buttons = [...switcher.querySelectorAll('.bg-switcher-btn')];
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.bg === bgMode) return;
      bgMode = btn.dataset.bg;
      buttons.forEach(b => b.classList.toggle('is-active', b === btn));
    });
  });
}

// ── FRAME-TO-SCROLL BINDING ──────────────────────────────────
const GALLERY_ENTER  = 0.17;
const GALLERY_LEAVE  = 0.82;
const GALLERY_FADE   = 0.055;
const ZP_ENTER       = 0.18;   // después de la sección de presentación
const ZP_LEAVE       = 0.36;
// Ajustados para dar más espacio antes de que aparezca el carrusel
const CAROUSEL_ENTER = 0.77;
// Extender el final del carrusel para que cubra todo el tramo antes de contacto
const CAROUSEL_LEAVE = 0.98;
// El fondo animado avanza durante toda la página, sin congelarse


function initFrameScroll() {
  const sc = document.getElementById('scroll-container');

  // Smooth animation: keep a float target and lerp current frame toward it.
  let targetFrameFloat = currentFrame;
  let currentFrameFloat = currentFrame;
  const LERP = 0.22; // how fast the displayed frame follows the target (0-1)

  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      // Sin tope superior: los fondos generativos no se agotan, así que
      // la animación sigue avanzando durante toda la página.
      targetFrameFloat = Math.max(0, p * FRAME_SPEED * VIRTUAL_FRAMES);
      // record last update time so the RAF fallback knows ScrollTrigger is active
      lastScrollUpdate = performance.now();
    }
  });

  // Continuous RAF loop to lerp and draw frames irrespective of ScrollTrigger updates
  // Keep a timestamp of last ScrollTrigger update. If ScrollTrigger stops
  // emitting (due to pinning or other reasons), fallback to reading the
  // window scroll position so frames continue advancing.
  let lastScrollUpdate = performance.now();

  (function tick() {
    const now = performance.now();
    // If no recent ScrollTrigger update, compute progress from scrollY as a fallback
    if (now - lastScrollUpdate > 120) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const p = docH > 0 ? (window.scrollY / docH) : 0;
      targetFrameFloat = Math.max(0, p * FRAME_SPEED * VIRTUAL_FRAMES);
      // update the timestamp so we don't continuously recompute on every RAF
      lastScrollUpdate = now;
    }
    // lerp current toward target (sin tope superior: nunca se detiene)
    currentFrameFloat += (targetFrameFloat - currentFrameFloat) * LERP;
    if (currentFrameFloat < 0) currentFrameFloat = 0;

    currentFrame = currentFrameFloat;

    renderBackground(currentFrameFloat, VIRTUAL_FRAMES);

    requestAnimationFrame(tick);
  })();
}

// ── GALLERY ANIMATION ─────────────────────────────────────────
function setupGalleryAnimation(section, tl) {
  const header   = section.querySelector('.gallery-header');
  const outer    = section.querySelector('.gallery-track-outer');
  const controls = section.querySelector('.gallery-controls');

  if (!header) return;

  tl
    .fromTo(header,
      { y: 35, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.85, ease: 'power3.out' }, 0)
    .fromTo(outer,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' }, 0.35)
    .fromTo(controls,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' }, 0.65);
}


// ── SECTION ANIMATION SYSTEM ─────────────────────────────────
function positionSection(section) {
  if (section.classList.contains('section-gallery') || section.classList.contains('section-carousel') || section.classList.contains('section-zp')) return; // fixed, no absolute positioning
  if (section.classList.contains('section-pinned'))  return; // también fixed
  const enter    = parseFloat(section.dataset.enter);
  const leave    = parseFloat(section.dataset.leave);
  const mid      = (enter + leave) / 2;
  const totalH   = document.getElementById('scroll-container').offsetHeight;
  const maxScroll = totalH - window.innerHeight;
  // Place section center at viewport center when scroll = mid% of maxScroll
  section.style.top = ((mid / 100) * maxScroll + window.innerHeight / 2) + 'px';
  section.style.transform = 'translateY(-50%)';
}

// Envolver cada palabra del heading con span anidado para revelado por palabras
function wrapHeadingWords(heading) {
  if (!heading || heading.dataset.wrapped === 'true') return;
  const html = heading.innerHTML;
  // Separar por etiquetas <br> y solo envolver palabras en los segmentos de texto
  const parts = html.split(/(<br\s*\/?\s*>|<[^>]+>)/i);
  const wrapped = parts.map(part => {
    if (!part) return '';
    if (part.startsWith('<')) return part; // tag intacto
    return part.replace(/(\S+)/g, '<span class="word-reveal"><span>$1</span></span>');
  }).join('');
  heading.innerHTML = wrapped;
  heading.dataset.wrapped = 'true';
}

// Envolver cada letra del heading (respetando <br>)
function wrapHeadingChars(heading) {
  if (!heading || heading.dataset.charsWrapped === 'true') return;
  const html = heading.innerHTML;
  const parts = html.split(/(<br\s*\/?\s*>|<[^>]+>)/i);
  const wrapped = parts.map(part => {
    if (!part) return '';
    if (part.startsWith('<')) return part;
    return part.split('').map(ch => {
      if (ch === ' ') return '<span class="char space">&nbsp;</span>';
      return `<span class="char">${ch}</span>`;
    }).join('');
  }).join('');
  heading.innerHTML = wrapped;
  heading.dataset.charsWrapped = 'true';
}

function setupSectionAnimation(section) {
  const type    = section.dataset.animation;
  const persist = section.dataset.persist === 'true';
  const enter   = parseFloat(section.dataset.enter) / 100;
  const leave   = parseFloat(section.dataset.leave) / 100;
  const sc      = document.getElementById('scroll-container');
  const footer  = section.id === 'contacto' ? document.querySelector('.site-footer') : null;

  // Pre-procesar headings para revelado por palabras
  const heading = section.querySelector('.section-heading');
  if (heading) wrapHeadingWords(heading);

  const introHeading = section.querySelector('.intro-heading');
  if (introHeading) wrapHeadingChars(introHeading);

  const tl = gsap.timeline({ paused: true });

  if (type === 'gallery-reveal' || type === 'zoom-parallax' || type === 'oryzo-carousel') {
    return;
  } else if (type === 'stagger-cards') {
    // Agenda Legislativa: header first, then cards en cascada cinematográfica
    const headerEls = section.querySelectorAll('.section-label, .agenda-title, .agenda-desc');
    const cards     = section.querySelectorAll('.agenda-card');
    tl
      .fromTo(headerEls,
        { y: 36, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.12, duration: 0.95, ease: 'power3.out' }, 0)
      .fromTo(cards,
        { y: 40, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1,
          stagger: { each: 0.09, from: 'start' },
          duration: 0.9, ease: 'power3.out' }, 0.35);
  } else {
    const children = section.querySelectorAll(
      '.section-label, .section-heading, .section-body, .section-note, .section-link, ' +
      '.cta-button, .cta-input, .cta-social, .cta-form, .agenda-list, .section-photo, .phone-mockup'
    );
    gsap.set(children, { visibility: 'visible' });

    // Si la sección está pinned (fixed), también hay que controlar la opacidad de la sección
    if (section.classList.contains('section-pinned')) {
      tl.fromTo(section,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: 'power2.out',
          onStart: () => {
            section.classList.add('is-visible');
            if (footer) {
              footer.classList.add('is-visible');
              gsap.set(footer, { y: '0%', opacity: 0 });
            }
          },
          onReverseComplete: () => {
            section.classList.remove('is-visible');
            if (footer) footer.classList.remove('is-visible');
          } }, 0);
    }

    switch (type) {
      case 'fade-up': {
        // Revelado cinematográfico para "quién soy" (y secciones similares)
        const photo     = section.querySelector('.section-photo');
        const headingEl = section.querySelector('.section-heading');
        const wordSpans = section.querySelectorAll('.section-heading .word-reveal > span');
        const otherChildren = [...children].filter(c => c !== photo && c !== headingEl);

        tl.fromTo(otherChildren,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.1, duration: 0.95, ease: 'power3.out' }, 0.2);

        if (headingEl && wordSpans.length) {
          // Asegurar que el heading sea visible (CSS pone opacity:0)
          tl.set(headingEl, { opacity: 1 }, 0);
          tl.fromTo(wordSpans,
            { yPercent: 110 },
            { yPercent: 0, stagger: 0.09, duration: 1.0, ease: 'power3.out' }, 0);
        } else if (headingEl) {
          tl.fromTo(headingEl,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }, 0);
        }

        if (photo) {
          tl.fromTo(photo,
            { opacity: 0, clipPath: 'inset(0 0 0 100%)' },
            { opacity: 1, clipPath: 'inset(0 0 0 0%)',
              duration: 1.4, ease: 'power3.out',
              onStart: () => photo.classList.add('is-revealed'),
              onReverseComplete: () => photo.classList.remove('is-revealed') }, 0.25);
        }
        break;
      }
      case 'clip-reveal':
        tl.fromTo(children,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.85, ease: 'power3.out' });
        break;
      case 'stagger-up':
        if (introHeading) {
          const introChars = introHeading.querySelectorAll('.char');
          tl.set(introHeading, { opacity: 1 }, 0);
          tl.fromTo(introChars,
            { yPercent: 120, opacity: 0 },
            { yPercent: 0, opacity: 1, stagger: 0.028, duration: 0.65, ease: 'power3.out' }, 0.05);
        } else {
          tl.fromTo(children,
            { y: 32, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.09, duration: 0.72, ease: 'power3.out' });
        }
        break;
      case 'scale-up':
        tl.fromTo(children,
          { y: 22, scale: 0.93, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, stagger: 0.08, duration: 0.8, ease: 'power2.out' });
        break;
      case 'blur-up':
        tl.fromTo(children,
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.85, ease: 'power3.out' });
        break;
      default:
        tl.fromTo(children,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: 'power2.out' });
    }

    if (footer) {
      // Al añadirlo al final de la línea de tiempo, aparece último al bajar,
      // y desaparece primero al hacer scroll hacia arriba (reverse).
      tl.fromTo(footer,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }, ">-0.1");
    }
  }

  // Play/reverse system: animations run at natural speed (no scroll-sync scrubbing)
  // This eliminates abrupt cuts and aggressive jumps when scrolling fast.
  let visible = false;

  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const p = self.progress;
      // Allow sections flagged with data-after-carousel to appear only after the carousel has finished
      let showEnter = enter - 0.04;
      let showLeave = persist ? 1 : leave + 0.04;
      if (section.id === 'contacto') {
        showEnter = enter - 0.012;
        showLeave = leave + 0.012;
      }
      if (section.dataset.afterCarousel === 'true') {
        showEnter = Math.max(showEnter, CAROUSEL_LEAVE + 0.01);
      }
      const shouldShow = p >= showEnter && p <= showLeave;

      if (shouldShow && !visible) {
        visible = true;
        tl.play();
      } else if (!shouldShow && visible) {
        visible = false;
        if (tl.progress() > 0) tl.reverse();
      }
    }
  });
}


// ── CUSTOM CURSOR ─────────────────────────────────────────────
function initCustomCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  if (window.matchMedia('(pointer: coarse)').matches) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let visible = false;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    if (!visible) {
      visible = true;
      dot.style.opacity  = '1';
      ring.style.opacity = '1';
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0'; ring.style.opacity = '0'; visible = false;
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity = '1'; ring.style.opacity = '1'; visible = true;
  });

  (function tick() {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx.toFixed(2) + 'px';
    ring.style.top  = ry.toFixed(2) + 'px';
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
}

// ── HERO FADE ─────────────────────────────────────────────────
function initHeroFade() {
  const hero  = document.getElementById('hero-overlay');
  const cardL = document.querySelector('.hero-card-left');
  const cardR = document.querySelector('.hero-card-right');

  ScrollTrigger.create({
    trigger: document.getElementById('scroll-container'),
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      const opacity = Math.max(0, 1 - p / HERO_FADE_END);
      hero.style.opacity = opacity;
      hero.style.pointerEvents = opacity > 0 ? '' : 'none';

      // Cards caen mientras el hero se desvanece
      const t = Math.min(1, p / HERO_FADE_END);
      const fallY = t * 160;
      if (cardL) gsap.set(cardL, { y: fallY, yPercent: -50 });
      if (cardR) gsap.set(cardR, { y: fallY * 0.7, yPercent: -50 });
    }
  });
}


function initAgendaCards() {
  const cards = [...document.querySelectorAll('.agenda-card')];
  if (!cards.length) return;

  cards.forEach(card => {
    // Eliminar cualquier handler inline existente para manejar la apertura aquí.
    card.onclick = null;
    card.addEventListener('click', () => {
      const isActive = card.classList.contains('show-tech');
      cards.forEach(c => c.classList.remove('show-tech'));
      if (!isActive) card.classList.add('show-tech');
    });
  });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.agenda-card')) {
      cards.forEach(c => c.classList.remove('show-tech'));
    }
  });
}

// ── GALLERY CAROUSEL — Oryzo-style pinned, scroll-driven ──────
function initGallery() {
  const section = document.querySelector('.section-carousel');
  const track   = document.getElementById('gallery-track');
  const counter = document.querySelector('.gallery-counter');
  const dotsEl  = document.getElementById('gallery-dots');
  if (!track || !section) return;

  const items = [...track.querySelectorAll('.gallery-item')];
  let currentIndex = 0;
  let lastIdx      = -1;
  // Fade window when entering/leaving carousel: reduced to make transition faster
  const FADE       = 0.02;

  // Ancla relativa para el avance scroll-driven.
  // galleryScrollBase: posición de scroll que define el índice galleryBaseIdx.
  // Cuando el autoplay o el usuario cambia imagen, la ancla se actualiza al scroll actual.
  let galleryScrollBase = -1;
  let galleryBaseIdx    = 0;
  let currentScrollP    = 0; // se actualiza en cada frame de onUpdate

  // Build progress dots
  if (dotsEl) {
    items.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'gallery-dot' + (i === 0 ? ' is-active' : '');
      dotsEl.appendChild(d);
    });
  }
  const dots = dotsEl ? [...dotsEl.querySelectorAll('.gallery-dot')] : [];

  // Cache per-item DOM refs so goTo() avoids repeated querySelector calls
  const innerEls = items.map(item => item.querySelector('.gallery-item-inner'));
  const imgEls   = items.map(item => item.querySelector('img'));

  // Oryzo-style sizing: active = big, near = medium, far = small
  let cachedSizes = null;
  function getSizes() {
    if (cachedSizes) return cachedSizes;
    const vw = window.innerWidth, vh = window.innerHeight;
    const isMobile = vw <= 768;
    cachedSizes = {
      active: { w: isMobile ? vw * 0.82 : Math.min(vw * 0.36, 540), h: vh * 0.74, opacity: 1    },
      near:   { w: isMobile ? vw * 0.15 : Math.min(vw * 0.18, 270), h: vh * 0.50, opacity: 0.55 },
      far:    { w: isMobile ? vw * 0.08 : Math.min(vw * 0.12, 190), h: vh * 0.37, opacity: 0.28 },
      hidden: { w: isMobile ? vw * 0.05 : Math.min(vw * 0.09, 140), h: vh * 0.28, opacity: 0.12 },
    };
    return cachedSizes;
  }

  const bgEl       = document.getElementById('gallery-bg');
  const introEl    = document.getElementById('carousel-intro');
  const introLabel = introEl?.querySelector('.gallery-label');
  const introTitle = introEl?.querySelector('.carousel-intro-title');
  let introPlayed  = false;
  const introTl = gsap.timeline({ paused: true });
  if (introEl) {
    introTl
      .set(introEl, { opacity: 1, y: 0 })
      .fromTo(introLabel,
        { clipPath: 'inset(0 105% 0 0)', y: 6, opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, 0)
      .fromTo(introTitle,
        { clipPath: 'inset(0 105% 0 0)', y: 18, opacity: 0, filter: 'blur(6px)' },
        { clipPath: 'inset(0 0% 0 0)', y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.65, ease: 'power3.out' }, 0.12)
      .to(introEl, { opacity: 0, y: -20, duration: 0.45, ease: 'power2.in' }, '+=0.85');
  }
  let bgPendingImg = null;

  function updateBg(index, animate) {
    if (!bgEl) return;
    const img = imgEls[index] ?? null;
    const src = img ? img.src : '';
    if (!src) return;

    // Make gallery background semi-transparent so the page canvas/hero shows through
    const TARGET_OPACITY = 0.62; // visible but allows underlying hero frames
    const MIN_FADE_OPACITY = 0.18; // keep some opacity while preloading to avoid flash

    // If no animation, set immediately (useful for init)
    if (!animate) {
      // cancel any pending preload
      if (bgPendingImg) { bgPendingImg.onload = null; bgPendingImg = null; }
      bgEl.style.backgroundImage = `url('${src}')`;
      gsap.set(bgEl, { opacity: TARGET_OPACITY });
      return;
    }

    // Animated crossfade with preload: fade to MIN_FADE_OPACITY, preload new image, then swap and fade to TARGET
    gsap.to(bgEl, { opacity: MIN_FADE_OPACITY, duration: 0.28, ease: 'power2.inOut' });

    // Cancel previous pending image load
    if (bgPendingImg) { bgPendingImg.onload = null; bgPendingImg = null; }
    const preload = new Image();
    bgPendingImg = preload;
    preload.src = src;
    preload.onload = () => {
      // only proceed if this is still the latest preload
      if (bgPendingImg !== preload) return;
      bgPendingImg = null;
      bgEl.style.backgroundImage = `url('${src}')`;
      gsap.to(bgEl, { opacity: TARGET_OPACITY, duration: 0.45, ease: 'power2.out' });
    };
    // If load fails quickly, still ensure we don't reveal video: keep MIN_FADE_OPACITY
    preload.onerror = () => { bgPendingImg = null; };
  }

  function goTo(index, animate = true) {
    const prevIndex  = currentIndex;
    index = Math.max(0, Math.min(items.length - 1, index));
    if (index === prevIndex && animate) return; // ya estamos ahí
    currentIndex = index;
    // Duración más lenta y easing suave para transiciones fluidas entre imágenes
    const dur = animate ? 0.9 : 0;
    const s   = getSizes();
    const gap = 12;

    // Target widths for all items at new index
    const widths = items.map((_, i) => {
      const d = Math.abs(i - index);
      return d === 0 ? s.active.w : d === 1 ? s.near.w : d === 2 ? s.far.w : s.hidden.w;
    });

    // Translate track so active item is centered in viewport
    let leftEdge = 0;
    for (let i = 0; i < index; i++) leftEdge += widths[i] + gap;
    const trackX = window.innerWidth / 2 - (leftEdge + widths[index] / 2);
    gsap.to(track, { x: trackX, duration: dur, ease: 'power3.out', overwrite: 'auto' });

    items.forEach((item, i) => {
      const dist     = Math.abs(i - currentIndex);
      const isActive = dist === 0;
      const cfg      = dist === 0 ? s.active : dist === 1 ? s.near : dist === 2 ? s.far : s.hidden;
      item.classList.toggle('is-active', isActive);

      const inner = innerEls[i];
      const img   = imgEls[i];

      // limpiar transformaciones previas que provocan stutter
      if (inner) gsap.set(inner, { clearProps: 'clipPath' });
      if (img && !isActive) gsap.set(img, { clearProps: 'scale' });

      gsap.to(item, { width: cfg.w, height: cfg.h, opacity: cfg.opacity,
        duration: dur, ease: 'power3.out', overwrite: 'auto' });

      // Solo escala suave en el activo cuando llega; sin clip-path competitivo
      if (animate && isActive && i !== prevIndex && img) {
        // Escala más lenta y suave para que el cambio sea menos brusco
        gsap.fromTo(img,
          { scale: 1.06 },
          { scale: 1, duration: 1.0, ease: 'power3.out', overwrite: 'auto' }
        );
      }
    });

    if (animate && index !== prevIndex) updateBg(index, true);
    else if (!animate) updateBg(index, false);

    dots.forEach((d, i) => d.classList.toggle('is-active', i === currentIndex));

    if (counter) {
      counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    }
  }

  // ── Autoplay ──────────────────────────────────────────────────
  // Intervalo aumentado para que el carrusel cambie más despacio
  const AUTOPLAY_MS   = 8000;
  let autoTimer       = null;
  let userPaused      = false;
  let isScrolling     = false;
  let scrollStopTimer = null;

  function autoNext() {
    if (section.style.visibility !== 'visible' || isScrolling) return;
    const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    lastIdx = next;
    // Sincronizar ancla relativa: el próximo scroll parte desde el índice nuevo
    galleryScrollBase = currentScrollP;
    galleryBaseIdx    = next;
    goTo(next);
  }

  function startAuto() {
    if (userPaused || isScrolling) return;
    clearInterval(autoTimer);
    autoTimer = setInterval(autoNext, AUTOPLAY_MS);
  }

  function pauseAuto(resume = true) {
    clearInterval(autoTimer);
    autoTimer = null;
    if (resume) setTimeout(startAuto, AUTOPLAY_MS);
  }

  // Llamar esto en cada evento de scroll para pausar y retomar tras 800 ms de inactividad
  function onScrollActivity() {
    isScrolling = true;
    clearInterval(autoTimer);
    autoTimer = null;
    clearTimeout(scrollStopTimer);
    scrollStopTimer = setTimeout(() => {
      isScrolling = false;
      if (!userPaused && section.style.visibility === 'visible') startAuto();
    }, 800);
  }

  // Click on non-active item navigates to it
  items.forEach((item, i) => {
    item.addEventListener('click', () => { if (i !== currentIndex) { pauseAuto(); goTo(i); } });
  });

  // Initialize after layout
  requestAnimationFrame(() => goTo(0, false));

  // Arrow buttons
  document.querySelector('.gallery-prev')?.addEventListener('click', () => { pauseAuto(); goTo(currentIndex - 1); });
  document.querySelector('.gallery-next')?.addEventListener('click', () => { pauseAuto(); goTo(currentIndex + 1); });

  // Pause on hover, resume on leave
  section.addEventListener('mouseenter', () => { clearInterval(autoTimer); autoTimer = null; });
  section.addEventListener('mouseleave', () => { if (!userPaused && !isScrolling) startAuto(); });

  // Keyboard (only when gallery is visible)
  document.addEventListener('keydown', (e) => {
    if (section.style.visibility !== 'visible') return;
    if (e.key === 'ArrowLeft')  { pauseAuto(); goTo(currentIndex - 1); }
    if (e.key === 'ArrowRight') { pauseAuto(); goTo(currentIndex + 1); }
  });

  // Touch swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    pauseAuto(false);
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { goTo(currentIndex + (dx < 0 ? 1 : -1)); }
    setTimeout(startAuto, AUTOPLAY_MS);
  }, { passive: true });

  // Resize — recalculate item sizes
  window.addEventListener('resize', () => {
    cachedSizes = null;
    requestAnimationFrame(() => goTo(currentIndex, false));
  }, { passive: true });

  // Scroll-driven: section visibility + index advancement
  const sc = document.getElementById('scroll-container');
  const stepSize = (CAROUSEL_LEAVE - CAROUSEL_ENTER) / Math.max(1, items.length - 1);

  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      currentScrollP = p; // siempre actualizado para que autoNext lo pueda leer

      // Fade section in/out
      if (p >= CAROUSEL_ENTER && p <= CAROUSEL_LEAVE) {
        section.style.opacity       = '1';
        section.style.visibility    = 'visible';
        section.style.pointerEvents = 'auto';
      } else if (p > CAROUSEL_ENTER - FADE && p < CAROUSEL_ENTER) {
        const t = (p - (CAROUSEL_ENTER - FADE)) / FADE;
        section.style.opacity       = Math.max(0, t).toFixed(3);
        section.style.visibility    = 'visible';
        section.style.pointerEvents = 'none';
        clearInterval(autoTimer); autoTimer = null;
        isScrolling = false; clearTimeout(scrollStopTimer);
        galleryScrollBase = -1; // resetear ancla al salir
        // Play intro animation once while approaching the carousel
        if (introEl && !introPlayed) {
          introPlayed = true;
          pauseAuto(false);
          introTl.restart();
          introTl.eventCallback('onComplete', () => {
            startAuto();
            goTo(currentIndex);
          });
        }
      } else if (p > CAROUSEL_LEAVE && p < CAROUSEL_LEAVE + FADE) {
        const t = 1 - (p - CAROUSEL_LEAVE) / FADE;
        section.style.opacity       = Math.max(0, t).toFixed(3);
        section.style.visibility    = 'visible';
        section.style.pointerEvents = 'none';
        clearInterval(autoTimer); autoTimer = null;
        isScrolling = false; clearTimeout(scrollStopTimer);
        galleryScrollBase = -1;
      } else {
        section.style.opacity       = '0';
        section.style.visibility    = 'hidden';
        section.style.pointerEvents = 'none';
        clearInterval(autoTimer); autoTimer = null;
        isScrolling = false; clearTimeout(scrollStopTimer);
        galleryScrollBase = -1;
        // Reset intro so it can animate again on re-entry
        if (introEl) {
          introPlayed = false;
          introTl.pause(0);
          gsap.set(introEl, { opacity: 0, y: 0 });
          if (introLabel) gsap.set(introLabel, { clearProps: 'clipPath' });
          if (introTitle) gsap.set(introTitle, { clearProps: 'clipPath' });
        }
      }

      // Avance del carrusel por scroll — determinístico y sin saltos de ancla
      if (p >= CAROUSEL_ENTER && p <= CAROUSEL_LEAVE) {
        const local = (p - CAROUSEL_ENTER) / (CAROUSEL_LEAVE - CAROUSEL_ENTER);
        const idx = Math.max(0, Math.min(items.length - 1, Math.round(local * (items.length - 1))));

        if (idx !== lastIdx) {
          lastIdx = idx;
          goTo(idx, true);
        }
      }
    }
  });

  window.galleryGoTo      = goTo;
  window.galleryItemCount = items.length;
}

// ── HEADER ────────────────────────────────────────────────────
function initHeader() {
  const header = document.getElementById('site-header') || document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!header) return;

  // Keep original visual state
  header.classList.remove('scrolled');

  // Build navigation dynamically from `.scroll-section` elements so every section
  // in the page is reachable from the header. Preserve `nav-cta` for contacto.
  if (navLinks) {
    const sections = Array.from(document.querySelectorAll('.scroll-section[id]'));
    if (sections.length) {
      navLinks.innerHTML = '';
      const frag = document.createDocumentFragment();
      const getNavLabel = (sec) => {
        const prefer = ['.section-heading', '.map-title', '.agenda-title', '.gallery-label', '.carousel-intro-title', '.section-label'];
        for (const sel of prefer) {
          const el = sec.querySelector(sel);
          if (el && el.textContent && el.textContent.trim()) return el.textContent.trim().replace(/\s+/g, ' ').split('\n')[0];
        }
        return sec.id.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      };

      sections.forEach(sec => {
        const id = sec.id;
        const label = getNavLabel(sec);
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#${id}`;
        a.textContent = label;
        if (id === 'contacto') a.classList.add('nav-cta');
        li.appendChild(a);
        frag.appendChild(li);
      });
      navLinks.appendChild(frag);
    }
  }

  // Thresholds and delays
  const TOP_THRESHOLD = 8;    // px considered "at top"
  const HOVER_THRESHOLD = 60; // px from viewport top to reveal header on hover
  const HIDE_DELAY = 220;     // ms delay before hiding after pointer leaves

  // Detect coarse pointers (touch). Do not attach hover handlers for those devices.
  const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  let lastY = window.scrollY;
  let lastPointerY = Infinity;
  let hideTimer = null;

  function clearHideTimer() { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } }

  function showHeader() {
    if (header.classList.contains('visible')) return;
    clearHideTimer();
    header.classList.add('visible');
    header.classList.remove('hidden');
  }

  function hideHeader() {
    if (header.classList.contains('hidden')) return;
    clearHideTimer();
    header.classList.add('hidden');
    header.classList.remove('visible');
  }

  // Initial state: start hidden. The header will appear only when the pointer
  // moves to the top area (hover), or when the mobile menu is opened.
  hideHeader();

  // Scroll: hide when scrolling down (only if pointer not near top).
  // Do NOT auto-show the header when the page is at the top — user asked
  // that it should appear only on mouse hover.
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && lastPointerY > HOVER_THRESHOLD) {
      hideHeader();
    }
    lastY = y;
  }, { passive: true });

  // Pointer: reveal when near top, hide shortly after leaving (only for fine pointers)
  if (!isCoarse) {
    window.addEventListener('mousemove', (e) => {
      lastPointerY = e.clientY;
      if (e.clientY <= HOVER_THRESHOLD) {
        showHeader();
      } else {
        if (window.scrollY > TOP_THRESHOLD) {
          clearHideTimer();
          hideTimer = setTimeout(() => {
            if (lastPointerY > HOVER_THRESHOLD && window.scrollY > TOP_THRESHOLD) {
              hideHeader();
            }
          }, HIDE_DELAY);
        }
      }
    }, { passive: true });
  }

  // Smooth scrolling: intercept header links and animate to section.
  if (navLinks) {
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', (ev) => {
        ev.preventDefault();
        const href = a.getAttribute('href') || '';
        if (!href.startsWith('#')) return;
        const id = href.slice(1);
        const target = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
        if (!target) return;

        (async () => {
          try {
            // Recalculate layout and section positions after any potential DOM changes.
            // Run positionSection for all sections and refresh ScrollTrigger so
            // subsequent calculations match the real layout. Then wait a frame
            // to allow layout to stabilise.
            try {
              const allSecs = document.querySelectorAll('.scroll-section');
              allSecs.forEach(positionSection);
            } catch (_) {}
            if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) ScrollTrigger.refresh();
            await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 40)));

            const sc = document.getElementById('scroll-container');
            const totalH = sc ? sc.offsetHeight : document.documentElement.scrollHeight;
            const maxScroll = Math.max(0, totalH - window.innerHeight);

            // Prefer using the section's data-enter / data-leave midpoint (this matches positionSection()).
            const enterVal = parseFloat(target.dataset.enter);
            const leaveVal = parseFloat(target.dataset.leave);
            let midPct = NaN;
            if (!isNaN(enterVal) && !isNaN(leaveVal)) midPct = (enterVal + leaveVal) / 2;
            else if (!isNaN(enterVal)) midPct = enterVal;
            else if (!isNaN(leaveVal)) midPct = leaveVal;

            if (!isNaN(midPct)) {
              const scrollTo = Math.max(0, Math.min(maxScroll, Math.round((midPct / 100) * maxScroll)));
              if (window.lenis && typeof window.lenis.scrollTo === 'function') {
                window.lenis.scrollTo(scrollTo, { immediate: false });
              } else {
                window.scrollTo({ top: scrollTo, behavior: 'smooth' });
              }
            } else {
              // Fallback: center the section in viewport
              const rect = target.getBoundingClientRect();
              const sectionCenter = rect.top + window.scrollY + rect.height / 2;
              const scrollTo = Math.max(0, Math.min(maxScroll, Math.round(sectionCenter - window.innerHeight / 2)));
              if (window.lenis && typeof window.lenis.scrollTo === 'function') {
                window.lenis.scrollTo(scrollTo, { immediate: false });
              } else {
                window.scrollTo({ top: scrollTo, behavior: 'smooth' });
              }
            }
          } catch (e) {
            // fallback simple scroll to element top
            const rect = target.getBoundingClientRect();
            const fallbackTop = Math.max(0, window.scrollY + rect.top - (header ? header.offsetHeight : 0));
            if (window.lenis && typeof window.lenis.scrollTo === 'function') window.lenis.scrollTo(fallbackTop, { immediate: false });
            else window.scrollTo({ top: fallbackTop, behavior: 'smooth' });
          } finally {
            if (navLinks.classList.contains('open')) navLinks.classList.remove('open');
          }
        })();
      });
    });
  }

  // Ensure hamburger toggle still works and opens header
  toggle?.addEventListener('click', () => {
    navLinks?.classList.toggle('open');
    showHeader();
  });

  if (navLinks) {
    const mo = new MutationObserver(() => { if (navLinks.classList.contains('open')) showHeader(); });
    mo.observe(navLinks, { attributes: true, attributeFilter: ['class'] });
  }
}

// ── LOADER ────────────────────────────────────────────────────
// Soporta opcionalmente un video de marca (.loader-video): muestrea
// el color de borde y lo aplica al fondo para integrarlo sin caja.
// Si no hay video (caso por defecto), muestra el spinner CSS.
function sampleVideoBgColor(video) {
  try {
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const ctx = c.getContext('2d');
    ctx.drawImage(video, 0, 0, 16, 16);
    // Promedio de las esquinas (donde casi siempre va el fondo)
    const corners = [[0,0],[15,0],[0,15],[15,15],[1,1],[14,1],[1,14],[14,14]];
    let r=0,g=0,b=0;
    corners.forEach(([x,y]) => {
      const d = ctx.getImageData(x,y,1,1).data;
      r += d[0]; g += d[1]; b += d[2];
    });
    r = Math.round(r/corners.length);
    g = Math.round(g/corners.length);
    b = Math.round(b/corners.length);
    const loader = document.getElementById('loader');
    if (loader) loader.style.background = `rgb(${r},${g},${b})`;
    if (video) video.style.background = `rgb(${r},${g},${b})`;
  } catch(_) { /* CORS u otro fallo: ignorar */ }
}

function runFakeLoader() {
  return new Promise(resolve => {
    const video = document.querySelector('.loader-video');
    const isMobile = window.innerWidth <= 768;

    // On mobile, skip the video loader completely since it doesn't scale well
    if (!video || isMobile) {
      if (video) video.style.display = 'none';
      setTimeout(resolve, 200); // short delay to let things settle
      return;
    }

    const MAX_SECONDS = 3;
    let resolved = false;
    const finish = () => { if (resolved) return; resolved = true; try { video.pause(); } catch(_) {} resolve(); };

    // Apenas haya frame, capturar el color
    video.addEventListener('loadeddata', () => sampleVideoBgColor(video), { once: true });

    video.addEventListener('timeupdate', () => {
      if (video.currentTime >= MAX_SECONDS) finish();
    });
    video.addEventListener('ended', finish);
    setTimeout(finish, 4000);

    const tryPlay = video.play();
    if (tryPlay && typeof tryPlay.catch === 'function') {
      tryPlay.catch(() => setTimeout(finish, 800));
    }
  });
}

function slideOutLoader() {
  return new Promise(resolve => {
    const loader  = document.getElementById('loader');
    const curtain = document.getElementById('curtain');

    if (!loader) { resolve(); return; }

    // Activar la cortina justo cuando el video termina de "cubrir"
    if (curtain) {
      curtain.classList.add('is-active');
      // Fade del loader rápido para ceder a la cortina
      gsap.to(loader, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.inOut',
        onComplete: () => { loader.style.display = 'none'; }
      });
      // Disparar la cortina con un pequeño retardo para que sienta cinematográfico
      setTimeout(() => {
        const top    = curtain.querySelector('.curtain-top');
        const bottom = curtain.querySelector('.curtain-bottom');
        if (top)    top.classList.add('is-open');
        if (bottom) bottom.classList.add('is-open');
        setTimeout(() => {
          curtain.classList.remove('is-active');
          curtain.style.display = 'none';
          resolve();
        }, 1100);
      }, 180);
    } else {
      gsap.to(loader, {
        opacity: 0, duration: 0.6, ease: 'power2.inOut',
        onComplete: () => { loader.style.display = 'none'; resolve(); }
      });
    }
  });
}

function initHeroEntrance() {
  const logo   = document.querySelector('.hero-logo');
  const tag    = document.querySelector('.hero-tagline');
  const scroll = document.querySelector('.scroll-indicator');
  const cardL  = document.querySelector('.hero-card-left');
  const cardR  = document.querySelector('.hero-card-right');

  if (!logo) return;

  const tl = gsap.timeline({ delay: 0.3 });

  tl.fromTo(logo,
    { opacity: 0, y: 30, scale: 0.92 },
    { opacity: 1, y: 0,  scale: 1, duration: 1.2, ease: 'power3.out' }, 0);
  if (tag)    tl.to(tag,    { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0.55);
  if (scroll) tl.to(scroll, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.85);

  if (cardL) tl.fromTo(cardL,
    { opacity: 0, y: -50, yPercent: -50, rotation: -8, x: -50 },
    { opacity: 1, y: 0,   yPercent: -50, x: 0, duration: 1.7, ease: 'power3.out' }, 0.2);
  if (cardR) tl.fromTo(cardR,
    { opacity: 0, y: -60, yPercent: -50, rotation: 7, x: 50 },
    { opacity: 1, y: 0,   yPercent: -50, x: 0, duration: 1.7, ease: 'power3.out' }, 0.4);
}

// ── HERO BG FADE ──────────────────────────────────────────────
function initHeroBg() {
  const heroBg = document.getElementById('hero-bg');
  if (!heroBg) return;
  ScrollTrigger.create({
    trigger: document.getElementById('scroll-container'),
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const opacity = Math.max(0, 1 - self.progress / HERO_FADE_END);
      heroBg.style.opacity = opacity;
    }
  });
}

// ── ZOOM PARALLAX GALLERY ──────────────────────────────────────
function initZoomParallax() {
  const section = document.querySelector('.section-zp');
  if (!section) return;
  const items = [...section.querySelectorAll('.zp-item')];
  if (!items.length) return;

  const FADE = GALLERY_FADE;
  // Fase 1 (localP 0 → REVEAL_END): mosaico aparece, stagger uniforme, sin zoom
  // Fase 2 (localP REVEAL_END → 1): zoom scroll-driven a escala original
  const REVEAL_WINDOW = 0.18; // ventana de opacidad por item (misma duración para todos)
  const MAX_STAGGER   = 0.10; // offset máximo del último item respecto al primero
  const REVEAL_END    = REVEAL_WINDOW + MAX_STAGGER; // 0.28 — zoom empieza aquí

  gsap.set(items, { opacity: 0, scale: 1 });
  const sc = document.getElementById('scroll-container');

  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      // Visibilidad de la sección — solo opacity (visibility siempre visible para pre-compositing)
      if (p >= ZP_ENTER && p <= ZP_LEAVE) {
        section.style.opacity    = '1';
      } else if (p > ZP_ENTER - FADE && p < ZP_ENTER) {
        section.style.opacity    = Math.max(0, (p - (ZP_ENTER - FADE)) / FADE).toFixed(3);
      } else if (p > ZP_LEAVE && p < ZP_LEAVE + FADE) {
        section.style.opacity    = Math.max(0, 1 - (p - ZP_LEAVE) / FADE).toFixed(3);
      } else {
        section.style.opacity    = '0';
      }

      if (p >= ZP_ENTER && p <= ZP_LEAVE) {
        const localP = (p - ZP_ENTER) / (ZP_LEAVE - ZP_ENTER);

        // Zoom completa al 50% del rango disponible → hold en pantalla completa los últimos ~36%
        const zoomP = Math.max(0, (localP - REVEAL_END) / (1 - REVEAL_END));
        const fastP = Math.min(1, zoomP * 2.0);

        items.forEach((item, i) => {
          const itemStart = (i / Math.max(1, items.length - 1)) * MAX_STAGGER;
          const opacity   = Math.max(0, Math.min(1, (localP - itemStart) / REVEAL_WINDOW));

          const depth    = parseFloat(item.dataset.scale) || 4;
          const newScale = 1 + (depth - 1) * fastP;

          gsap.set(item, { opacity, scale: newScale });
        });
      } else if (p < ZP_ENTER - FADE) {
        gsap.set(items, { opacity: 0, scale: 1 });
      }
    }
  });
}

// ── LENIS ─────────────────────────────────────────────────────
function initLenis() {
  const lenis = new Lenis({
    duration: 2.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.7,
    touchMultiplier: 1.1
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Fallback for programmatic scroll (Playwright testing)
  window.addEventListener('scroll', () => ScrollTrigger.update(), { passive: true });
  window.lenis = lenis;

  return lenis;
}

// ── FORMULARIO DE CONTACTO (envío local, sin backend) ────────
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('contact-success');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre  = (document.getElementById('contact-nombre')  || {}).value || '';
    const asunto  = (document.getElementById('contact-asunto')  || {}).value || '';
    const email   = (document.getElementById('contact-email')   || {}).value || '';
    const mensaje = (document.getElementById('contact-mensaje') || {}).value || '';

    if (!nombre.trim() || !asunto.trim() || !email.trim() || !mensaje.trim()) return;

    // TODO: integrar el envío real (email, formspree, supabase, etc.)
    // De momento solo confirmamos al usuario que recibimos su mensaje.
    form.reset();
    if (success) {
      success.hidden = false;
      setTimeout(() => { success.hidden = true; }, 6000);
    }
  });
}

// ── FOOTER REVEAL — entra suave al final, no flotando ────────
function initFooter() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  // Footer visibility is fully controlled by the contact section timeline.
  footer.classList.remove('is-visible');
  gsap.set(footer, { opacity: 0, y: '0%' });
}

// ── INIT ──────────────────────────────────────────────────────
async function init() {
  gsap.registerPlugin(ScrollTrigger);

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  const sections = document.querySelectorAll('.scroll-section');
  sections.forEach(positionSection);

  // Loader de entrada (~1.5s) con cortina cinematográfica
  const loaderDone = runFakeLoader().then(slideOutLoader);

  await loaderDone;
  initHeroEntrance();

  initCustomCursor();
  initLenis();
  window.lenis.scrollTo(0, { immediate: true });
  initFrameScroll();
  initBgSwitcher();
  initHeroFade();
  initHeroBg();
  sections.forEach(setupSectionAnimation);
  initAgendaCards();
  initZoomParallax();
  initGallery();
  initHeader();
  initContactForm();
  initFooter();

  requestAnimationFrame(() => renderBackground(0, VIRTUAL_FRAMES));
}

// DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Global resize handler to fix layout bugs when user zooms in/out
window.addEventListener('resize', () => {
  requestAnimationFrame(() => {
    // Recalculate all absolutely positioned sections
    document.querySelectorAll('.scroll-section').forEach(sec => {
      if (typeof positionSection === 'function') positionSection(sec);
    });
    // Notify ScrollTrigger to recalculate bounds
    if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
      ScrollTrigger.refresh();
    }
  });
}, { passive: true });
