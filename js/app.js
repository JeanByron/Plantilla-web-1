/* ============================================================
   Manuel Correa — Caldas al Congreso 2026
   js/app.js — v3: video real + mapa SVG Caldas + carrusel
   ============================================================ */

'use strict';

// Forzar que el navegador siempre empiece desde arriba
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('load', () => window.scrollTo(0, 0));

// ── CONFIG ────────────────────────────────────────────────────
const FRAME_SPEED   = 1.0;   // reducido para 2000vh
const IMAGE_SCALE   = 1.0;   // 1.0 = full-cover sin barras laterales
const WINDOW        = 0.06;  // ventana de animación por sección
const FRAME_EXT     = 'jpg';

// Hero desaparece al 12% de scroll
const HERO_FADE_END = 0.12;

// ── MAP DATA (post-elecciones: hover corto + click largo + imagen) ──
// Mapeo código DANE → nombre municipio (los 27 de Caldas)
const MAP_MUN_NAME = {
  17001:'Manizales',  17013:'Aguadas',    17042:'Anserma',
  17050:'Aranzazu',   17088:'Belalcázar', 17174:'Chinchiná',
  17272:'Filadelfia', 17380:'La Dorada',  17388:'La Merced',
  17433:'Manzanares', 17442:'Marmato',    17444:'Marquetalia',
  17446:'Marulanda',  17486:'Neira',      17495:'Norcasia',
  17513:'Pácora',     17524:'Palestina',  17541:'Pensilvania',
  17614:'Riosucio',   17616:'Risaralda',  17653:'Salamina',
  17662:'Samaná',     17665:'San José',   17777:'Supía',
  17867:'Victoria',   17873:'Villamaría', 17877:'Viterbo'
};

// Datos de cada municipio: hover (frase corta), click (texto largo), img (foto referencial).
// TODO: reemplazar las imágenes genéricas (1-25.jpeg) por fotos específicas del municipio cuando estén disponibles.
const MAP_MUN_DATA = {
  'Manizales':   { hover:'Centro de oportunidades, educación y desarrollo regional.',           click:'Manizales es el eje administrativo y académico del departamento, donde convergen la educación, la innovación y el crecimiento económico, impulsando oportunidades para todos los sectores.', img:'images/1.jpeg'  },
  'Villamaría':  { hover:'Riqueza natural y compromiso ambiental.',                              click:'Villamaría se destaca por su biodiversidad y cercanía a ecosistemas estratégicos, promoviendo el turismo sostenible y la protección ambiental como base de su desarrollo.',                  img:'images/2.jpeg'  },
  'Chinchiná':   { hover:'Tradición cafetera que impulsa desarrollo.',                           click:'Chinchiná es clave en la economía cafetera, donde tradición e innovación se articulan para fortalecer el campo y generar oportunidades.',                                                  img:'images/3.jpeg'  },
  'Neira':       { hover:'Identidad cafetera y tradición rural.',                                click:'Neira es un municipio con fuerte vocación agrícola, donde se promueven iniciativas para fortalecer el campo y mejorar la calidad de vida rural.',                                          img:'images/4.jpeg'  },
  'Palestina':   { hover:'Territorio de proyección y conectividad.',                             click:'Palestina se proyecta como un punto estratégico para el desarrollo logístico y económico, impulsando proyectos que fortalecen la conectividad regional.',                                 img:'images/5.jpeg'  },
  'Aguadas':     { hover:'Tradición, cultura y emprendimiento artesanal.',                       click:'Aguadas es referente cultural y artesanal, impulsando la economía local a través de sus tradiciones y el talento de su gente.',                                                              img:'images/6.jpeg'  },
  'Pácora':      { hover:'Historia y tradición que construyen territorio.',                      click:'Pácora conserva su identidad histórica mientras fortalece procesos comunitarios y productivos que dinamizan su desarrollo.',                                                                  img:'images/7.jpeg'  },
  'Salamina':    { hover:'Patrimonio y arquitectura emblemática.',                               click:'Salamina destaca por su riqueza patrimonial y turística, promoviendo el desarrollo sostenible desde su identidad cultural.',                                                                  img:'images/8.jpeg'  },
  'Aranzazu':    { hover:'Trabajo rural y compromiso comunitario.',                              click:'Aranzazu impulsa el desarrollo desde el campo, fortaleciendo la producción agrícola y la organización comunitaria.',                                                                          img:'images/9.jpeg'  },
  'Filadelfia':  { hover:'Campo, tradición y progreso local.',                                   click:'Filadelfia es un municipio que crece desde su vocación rural, promoviendo iniciativas que fortalecen la economía local.',                                                                       img:'images/10.jpeg' },
  'La Merced':   { hover:'Pequeño territorio con gran identidad.',                               click:'La Merced se caracteriza por su cohesión social y su trabajo comunitario, impulsando procesos de desarrollo local.',                                                                          img:'images/11.jpeg' },
  'Riosucio':    { hover:'Cultura, diversidad y tradición.',                                     click:'Riosucio es un referente cultural, donde la diversidad y las tradiciones fortalecen el tejido social y el desarrollo comunitario.',                                                          img:'images/12.jpeg' },
  'Supía':       { hover:'Diversidad cultural y dinamismo social.',                              click:'Supía es un territorio diverso que promueve la inclusión, la participación y el crecimiento social.',                                                                                          img:'images/13.jpeg' },
  'Marmato':     { hover:'Historia minera y resiliencia territorial.',                           click:'Marmato es reconocido por su tradición minera, impulsando procesos que buscan el desarrollo sostenible y la formalización del sector.',                                                        img:'images/14.jpeg' },
  'Belalcázar':  { hover:'Tradición y desarrollo en el occidente caldense.',                     click:'Belalcázar promueve el desarrollo desde su identidad cultural y el trabajo comunitario.',                                                                                                       img:'images/15.jpeg' },
  'San José':    { hover:'Territorio joven con vocación productiva.',                            click:'San José es uno de los municipios más jóvenes del departamento, con un gran potencial en el desarrollo agrícola y social.',                                                                  img:'images/16.jpeg' },
  'Viterbo':     { hover:'Turismo, cultura y crecimiento regional.',                              click:'Viterbo impulsa el turismo y el desarrollo económico, consolidándose como un destino atractivo en el occidente.',                                                                              img:'images/17.jpeg' },
  'Risaralda':   { hover:'Tradición agrícola y dinamismo local.',                                click:'Risaralda fortalece su economía desde el campo, promoviendo iniciativas productivas y comunitarias.',                                                                                        img:'images/18.jpeg' },
  'Anserma':     { hover:'Historia y vocación agrícola.',                                        click:'Anserma combina su legado histórico con el impulso al desarrollo rural y la productividad agrícola.',                                                                                          img:'images/19.jpeg' },
  'Pensilvania': { hover:'Progreso desde el campo y el territorio.',                             click:'Pensilvania impulsa su desarrollo desde la ruralidad, fortaleciendo el campo y mejorando la calidad de vida de sus habitantes.',                                                            img:'images/20.jpeg' },
  'Marquetalia': { hover:'Tradición agrícola y cultura campesina.',                              click:'Marquetalia impulsa el desarrollo desde el campo, fortaleciendo su identidad campesina y productiva.',                                                                                       img:'images/21.jpeg' },
  'Manzanares':  { hover:'Historia, tradición y desarrollo local.',                              click:'Manzanares combina su legado histórico con procesos de crecimiento social y económico.',                                                                                                       img:'images/22.jpeg' },
  'Marulanda':   { hover:'Territorio rural de tradición y esfuerzo.',                            click:'Marulanda se caracteriza por su trabajo ganadero y rural, promoviendo el desarrollo sostenible desde el campo.',                                                                            img:'images/23.jpeg' },
  'La Dorada':   { hover:'Eje logístico y puerta del Magdalena.',                                click:'La Dorada es un punto estratégico para el comercio y la conectividad, impulsando el desarrollo económico regional.',                                                                          img:'images/24.jpeg' },
  'Victoria':    { hover:'Progreso desde la cercanía y el territorio.',                          click:'Victoria promueve el desarrollo local mediante el fortalecimiento comunitario y productivo.',                                                                                                  img:'images/25.jpeg' },
  'Norcasia':    { hover:'Energía, naturaleza y desarrollo.',                                    click:'Norcasia es clave en la generación energética y la protección ambiental, impulsando el desarrollo sostenible.',                                                                                img:'images/15.jpeg' },
  'Samaná':      { hover:'Territorio de resiliencia y transformación.',                          click:'Samaná es un ejemplo de reconstrucción social, donde se promueven iniciativas de paz y desarrollo territorial.',                                                                              img:'images/22.jpeg' }
};

// Color base unificado para todos los municipios (no hay gradiente por votos).
function mapBaseColor() {
  return 'rgb(27,77,71)'; // teal
}

// ── FRAME LOADING ─────────────────────────────────────────────
const frames     = [];
let loadedCount  = 0;
let totalFrames  = 0;
let currentFrame = 0;
let bgColor      = '#0A1A17';
let hasFrames    = false;

function buildFrameUrl(i) {
  return `frames/frame_${String(i + 1).padStart(4, '0')}.${FRAME_EXT}`;
}

function detectFrames() {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => { hasFrames = true;  resolve(true);  };
    img.onerror = () => { hasFrames = false; resolve(false); };
    img.src = buildFrameUrl(0);
  });
}

function preloadFrames(frameCount) {
  return new Promise(resolve => {
    totalFrames = frameCount;
    if (frameCount === 0) { resolve(); return; }

    const PHASE1 = Math.min(10, frameCount);
    let phase1Done = 0;

    for (let i = 0; i < PHASE1; i++) {
      const img = new Image();
      img.onload = () => {
        frames[img._idx] = img;
        loadedCount++;
        updateLoader(loadedCount, frameCount);
        phase1Done++;
        if (phase1Done === PHASE1) {
          drawFrame(0);
          resolve();
          loadRestInBackground(PHASE1, frameCount);
        }
      };
      img.onerror = () => {
        loadedCount++;
        phase1Done++;
        if (phase1Done === PHASE1) resolve();
      };
      img._idx = i;
      img.src = buildFrameUrl(i);
    }
  });
}

function loadRestInBackground(from, total) {
  for (let i = from; i < total; i++) {
    const img = new Image();
    img.onload = () => { frames[img._idx] = img; loadedCount++; updateLoader(loadedCount, total); };
    img.onerror = () => { loadedCount++; };
    img._idx = i;
    img.src = buildFrameUrl(i);
  }
}

function updateLoader() { /* loader es ahora un video; no requiere progreso */ }

// ── CANVAS RENDERER ──────────────────────────────────────────
const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  if (hasFrames && frames[currentFrame]) {
    drawFrame(currentFrame);
  } else {
    drawGenerativeFrame(currentFrame, totalFrames || 200);
  }
}

function sampleBgColor(img) {
  try {
    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = 4;
    const tc = tmp.getContext('2d');
    tc.drawImage(img, 0, 0, 4, 4);
    const d = tc.getImageData(0, 0, 1, 1).data;
    bgColor = `rgb(${d[0]},${d[1]},${d[2]})`;
  } catch (_) { bgColor = '#0A1A17'; }
}

function drawFrame(index) {
  const img = frames[index];
  if (!img) { drawGenerativeFrame(index, totalFrames); return; }

  if (index % 20 === 0) sampleBgColor(img);

  const cw = canvas.width  / (window.devicePixelRatio || 1);
  const ch = canvas.height / (window.devicePixelRatio || 1);
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;

  const scale = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawGenerativeFrame(frameIndex, maxFrames) {
  const cw = canvas.width  / (window.devicePixelRatio || 1);
  const ch = canvas.height / (window.devicePixelRatio || 1);
  const p  = maxFrames > 0 ? frameIndex / maxFrames : 0;

  ctx.clearRect(0, 0, cw, ch);

  const grad = ctx.createRadialGradient(
    cw * (0.3 + p * 0.4), ch * (0.6 - p * 0.3), 0,
    cw * 0.5, ch * 0.5, Math.max(cw, ch) * 0.9
  );
  grad.addColorStop(0, `hsl(${160 + p * 30}, 40%, ${12 + p * 8}%)`);
  grad.addColorStop(0.5, `hsl(${155 + p * 20}, 30%, 7%)`);
  grad.addColorStop(1, '#0A1A17');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);

  const ag = ctx.createRadialGradient(
    cw * (0.85 - p * 0.2), ch * (0.15 + p * 0.1), 0,
    cw * 0.85, ch * 0.15, cw * 0.35
  );
  ag.addColorStop(0, `rgba(232,98,26,${0.07 + p * 0.05})`);
  ag.addColorStop(1, 'rgba(232,98,26,0)');
  ctx.fillStyle = ag;
  ctx.fillRect(0, 0, cw, ch);
}

// ── FRAME-TO-SCROLL BINDING ──────────────────────────────────
const GALLERY_ENTER  = 0.17;   // flat bg desactivado (siempre frames de video)
const GALLERY_LEAVE  = 0.82;
const GALLERY_FADE   = 0.035;
const ZP_ENTER       = 0.18;   // después de ¿Quien es Manuel Correa?
const ZP_LEAVE       = 0.36;
const CAROUSEL_ENTER = 0.66;   // después de proyectos de ley
const CAROUSEL_LEAVE = 0.84;

function drawFlatBg(cw, ch) {
  ctx.fillStyle = '#0A1A17';
  ctx.fillRect(0, 0, cw, ch);
  const g = ctx.createRadialGradient(cw * .35, ch * .5, 0, cw * .35, ch * .5, cw * .65);
  g.addColorStop(0, 'rgba(27,77,71,0.22)');
  g.addColorStop(1, 'rgba(10,26,23,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);
}

function initFrameScroll() {
  const sc = document.getElementById('scroll-container');
  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p    = self.progress;
      const acc  = Math.min(p * FRAME_SPEED, 1);
      const maxF = hasFrames ? totalFrames : 200;
      const idx  = Math.min(Math.floor(acc * maxF), maxF - 1);
      currentFrame = idx;

      requestAnimationFrame(() => {
        // Siempre frames de video (sin fondo plano por sección)
        if (hasFrames && frames[currentFrame]) drawFrame(currentFrame);
        else drawGenerativeFrame(currentFrame, maxF);
      });
    }
  });
}

// ── MAP v1 — REAL GeoJSON + RADAR SWEEP ───────────────────────
let mapDataReady    = false;  // datos/SVG ya construidos (evita doble carga)
let mapSvgElements  = [];    // referencias para repetir la animación
let mapSvgContainer = null;
let mapAllMuns = [];
let activePath = null;

function mapInitParticles(container) {
  const c = document.createElement('canvas');
  c.id = 'map-particles';
  container.insertBefore(c, container.firstChild);
  const cx = c.getContext('2d');
  const resize = () => { c.width = container.offsetWidth; c.height = container.offsetHeight; };
  resize();
  new ResizeObserver(resize).observe(container);
  const pts = Array.from({length:55}, () => ({
    x: Math.random(), y: Math.random(),
    vx: (Math.random()-.5)*.00025, vy: (Math.random()-.5)*.00018,
    r: Math.random()*1.4+0.3, pa: Math.random()*Math.PI*2, a: Math.random()*.2+.04
  }));
  (function draw() {
    cx.clearRect(0, 0, c.width, c.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.pa += .007;
      if(p.x<0)p.x=1; if(p.x>1)p.x=0; if(p.y<0)p.y=1; if(p.y>1)p.y=0;
      cx.beginPath();
      cx.arc(p.x*c.width, p.y*c.height, p.r, 0, Math.PI*2);
      cx.fillStyle = `rgba(232,98,26,${p.a*(0.45+0.55*Math.sin(p.pa))})`;
      cx.fill();
    });
    requestAnimationFrame(draw);
  })();
}

function mapInitMouseGlow(container) {
  const glow = document.createElement('div');
  glow.className = 'map-mouse-glow';
  glow.style.opacity = '0';
  container.appendChild(glow);
  container.addEventListener('mousemove', e => {
    const rc = container.getBoundingClientRect();
    glow.style.left = (e.clientX - rc.left) + 'px';
    glow.style.top  = (e.clientY - rc.top)  + 'px';
    glow.style.opacity = '1';
  });
  container.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
}

function mapDoRadarSweep(elements, container) {
  const scanLine = container.querySelector('.map-scan-line');
  const SWEEP_DELAY = 1.1;

  // Matar tweens pendientes para que el replay sea limpio
  gsap.killTweensOf(elements);
  gsap.killTweensOf(scanLine);

  gsap.set(elements, { opacity: 0 });
  gsap.set(scanLine, { opacity: 0, left: '-4px' });
  gsap.to(scanLine, { opacity: 1, duration: 0.3, delay: SWEEP_DELAY });
  const sorted = [...elements].sort((a,b) => (a._cx||0) - (b._cx||0));
  gsap.to(scanLine, {
    left: '104%', duration: 2.0, ease: 'power1.inOut', delay: SWEEP_DELAY,
    onComplete: () => {
      gsap.to(scanLine, { opacity: 0, duration: 0.6 });
    }
  });
  sorted.forEach(el => {
    const pct = (el._cx || 430) / 860;
    gsap.to(el, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: SWEEP_DELAY + pct * 1.55 + 0.08 });
  });
}

function mapCreatePulse(px, py, container) {
  [0, 180].forEach(delay => {
    const ring = document.createElement('div');
    ring.className = 'pulse-ring' + (delay ? ' pulse-ring-2' : '');
    ring.style.cssText = `left:${px}px;top:${py}px;transform:translate(-50%,-50%);animation-delay:${delay}ms`;
    container.appendChild(ring);
    ring.addEventListener('animationend', () => ring.remove());
  });
}

function mapAttachEvents(el, name, cx, cy, svgEl, container, tooltip, detailPanel) {
  el._cx = cx; el._cy = cy;

  function getMapPos() {
    const svgRect = svgEl.getBoundingClientRect();
    const cRect   = container.getBoundingClientRect();
    return {
      px: cx * (svgRect.width / 860) + (svgRect.left - cRect.left),
      py: cy * (svgRect.height / 520) + (svgRect.top  - cRect.top)
    };
  }

  const data = MAP_MUN_DATA[name] || { hover: name, click: name + ', municipio de Caldas.', img: 'images/1.jpeg' };

  el.addEventListener('mouseenter', () => {
    tooltip.innerHTML = `
      <div class="map-tooltip-name">${name}</div>
      <div class="map-tooltip-hover">${data.hover}</div>`;
    tooltip.classList.add('visible');
    const { px, py } = getMapPos();
    mapCreatePulse(px, py, container);
    if (el !== activePath) {
      el.setAttribute('stroke', '#E8621A');
      el.setAttribute('stroke-width', '2.5');
      el.style.filter = 'brightness(1.25) drop-shadow(0 0 14px rgba(232,98,26,.65))';
      document.querySelectorAll('#caldas-map path,#caldas-map polygon').forEach(p => {
        if (p !== el) {
          gsap.killTweensOf(p, 'opacity');
          gsap.to(p, { opacity: p === activePath ? 1 : 0.35, duration: 0.15 });
        }
      });
      // Preview en sidebar SOLO si no hay un municipio bloqueado
      if (!activePath) {
        mapShowDetail(name, detailPanel, /*locked=*/false);
      }
    }
  });

  el.addEventListener('mousemove', e => {
    const rc = container.getBoundingClientRect();
    let left = e.clientX - rc.left + 18;
    let top  = Math.max(e.clientY - rc.top - 56, 8);
    if (left + 200 > rc.width) left = e.clientX - rc.left - 220;
    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
  });

  el.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
    if (el !== activePath) {
      el.setAttribute('stroke', 'rgba(5,13,11,0.85)');
      el.setAttribute('stroke-width', '1');
      el.style.filter = '';
      if (!activePath) {
        document.querySelectorAll('#caldas-map path,#caldas-map polygon').forEach(p => {
          gsap.killTweensOf(p, 'opacity');
          gsap.to(p, { opacity: 1, duration: 0.15 });
        });
        // Si no hay municipio bloqueado, limpiar el preview del sidebar
        mapClearDetail(detailPanel);
      } else {
        gsap.to(el, { opacity: 0.35, duration: 0.15 });
      }
    }
  });

  el.addEventListener('click', () => {
    const allPaths = document.querySelectorAll('#caldas-map path,#caldas-map polygon');
    const { px, py } = getMapPos();
    mapCreatePulse(px, py, container);
    if (activePath === el) {
      // Click en el mismo municipio bloqueado → desbloquear
      activePath = null;
      el.setAttribute('stroke', 'rgba(5,13,11,0.85)');
      el.setAttribute('stroke-width', '1');
      el.style.filter = '';
      allPaths.forEach(p => gsap.to(p, { opacity: 1, duration: 0.3 }));
      mapClearDetail(detailPanel);
    } else {
      // Cambio de bloqueo a otro municipio
      if (activePath) {
        activePath.setAttribute('stroke', 'rgba(5,13,11,0.85)');
        activePath.setAttribute('stroke-width', '1');
        activePath.style.filter = '';
      }
      activePath = el;
      el.setAttribute('stroke', '#E8621A');
      el.setAttribute('stroke-width', '2.5');
      el.style.filter = 'brightness(1.25) drop-shadow(0 0 14px rgba(232,98,26,.65))';
      allPaths.forEach(p => gsap.to(p, { opacity: p === el ? 1 : 0.35, duration: 0.3 }));
      mapShowDetail(name, detailPanel, /*locked=*/true);
    }
  });
}

function mapShowDetail(name, detailPanel, locked) {
  if (!detailPanel) return;
  const data = MAP_MUN_DATA[name] || { hover: name, click: name + ', municipio de Caldas.', img: 'images/1.jpeg' };

  // Si ya está mostrando el mismo municipio en el mismo modo, no resetear
  if (detailPanel.dataset.currentMun === name && (detailPanel.classList.contains('is-locked') === !!locked)) {
    return;
  }

  // Reset clase para reiniciar la transición de aparición
  detailPanel.classList.remove('is-active', 'is-locked');
  detailPanel.innerHTML = `
    <img src="${data.img}" alt="${name}" class="mapa-selected-img" loading="lazy"/>
    <h3 class="mapa-selected-name">${name}</h3>
    <p class="mapa-selected-desc">${data.click}</p>
  `;
  detailPanel.dataset.currentMun = name;
  // Forzar reflow y activar
  void detailPanel.offsetWidth;
  detailPanel.classList.add('is-active');
  if (locked) detailPanel.classList.add('is-locked');
}

function mapClearDetail(detailPanel) {
  if (!detailPanel) return;
  detailPanel.classList.remove('is-active', 'is-locked');
  detailPanel.dataset.currentMun = '';
  setTimeout(() => {
    if (!detailPanel.classList.contains('is-active')) {
      detailPanel.innerHTML = `<div class="mapa-selected-hint">Pasa el cursor sobre<br>un municipio<br><span style="color:var(--orange);font-size:.7rem;letter-spacing:.15em;display:block;margin-top:.6rem">— o haz clic para ver más —</span></div>`;
    }
  }, 350);
}

async function mapLoad(section) {
  const svgEl     = section.querySelector('#caldas-map');
  const tooltip   = section.querySelector('#map-tooltip');
  const detailPanel = section.querySelector('#mapa-selected');
  const container = section.querySelector('.mapa-svg-container');
  if (!svgEl || !container) return;

  mapInitParticles(container);
  mapInitMouseGlow(container);

  // Animate header in
  const headerEls = [...section.querySelectorAll('.map-label,.map-title,.map-desc-top')];
  gsap.fromTo(headerEls,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.15, duration: 0.85, ease: 'power3.out', delay: 0.3 });

  gsap.fromTo(container,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.6 });

  const URLS = [
    'https://cdn.jsdelivr.net/gh/finiterank/mapa-colombia-js@master/colombia-municipios.json',
    'https://cdn.jsdelivr.net/gh/juanchiem/agro_data@master/geodata/colombia_municipios.json',
  ];
  let topo = null;
  for (const url of URLS) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (r.ok) { topo = await r.json(); if (topo && (topo.arcs || topo.features)) break; }
    } catch(e) { continue; }
  }
  if (!topo) { mapRenderFallback(svgEl, container, tooltip, detailPanel, section); return; }

  let features;
  if (topo.type === 'Topology' && topo.objects) {
    const key = Object.keys(topo.objects)[0];
    features = topojson.feature(topo, topo.objects[key]).features;
  } else if (topo.features) { features = topo.features; }
  else { mapRenderFallback(svgEl, container, tooltip, detailPanel, section); return; }

  const caldas = features.filter(f => {
    const id = String(f.id || f.properties?.MPIO_CDPMP || f.properties?.DPTO || '');
    return id.startsWith('17') && id.length >= 4;
  });
  if (caldas.length < 10) { mapRenderFallback(svgEl, container, tooltip, detailPanel, section); return; }

  const W = 860, H = 520;
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const proj    = d3.geoMercator().fitExtent([[14,14],[W-14,H-14]], { type:'FeatureCollection', features:caldas });
  const pathGen = d3.geoPath().projection(proj);
  const elements = [];

  caldas.forEach(feat => {
    const code = parseInt(String(feat.id || feat.properties?.MPIO_CDPMP || 0));
    const name = MAP_MUN_NAME[code] || feat.properties?.MPIO_CNMBR || `Mun ${code}`;
    mapAllMuns.push({ name });
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', pathGen(feat));
    el.setAttribute('fill', mapBaseColor());
    el.setAttribute('stroke', 'rgba(5,13,11,0.85)');
    el.setAttribute('stroke-width', '1');
    const c = pathGen.centroid(feat);
    mapAttachEvents(el, name, c[0]||W/2, c[1]||H/2, svgEl, container, tooltip, detailPanel);
    svgEl.appendChild(el);
    elements.push(el);
  });

  const loading = section.querySelector('#map-loading');
  if (loading) loading.style.display = 'none';

  svgEl.addEventListener('mouseleave', () => {
    if (!activePath) {
      document.querySelectorAll('#caldas-map path,#caldas-map polygon').forEach(p => {
        gsap.killTweensOf(p, 'opacity');
        gsap.to(p, { opacity: 1, duration: 0.15 });
      });
    }
  });

  mapSvgElements  = elements;
  mapSvgContainer = container;
  mapDoRadarSweep(elements, container);
}

function mapRenderFallback(svgEl, container, tooltip, detailPanel, section) {
  svgEl.setAttribute('viewBox', '0 0 860 520');
  const MUNS = [
    {c:17614,p:'16,175 112,158 124,195 120,272 82,298 46,296 20,272 16,224',   cx:68, cy:228},
    {c:17777,p:'82,275 120,270 130,288 122,322 90,328 74,308 78,280',           cx:102,cy:299},
    {c:17442,p:'78,325 122,320 125,348 94,354 74,340',                          cx:100,cy:337},
    {c:17272,p:'116,160 168,150 182,184 164,224 128,230 112,202 120,182',       cx:148,cy:190},
    {c:17042,p:'158,124 240,116 256,152 250,230 214,242 178,232 164,184 154,150',cx:207,cy:178},
    {c:17088,p:'218,236 250,228 270,258 266,328 230,336 216,310 216,260',       cx:243,cy:283},
    {c:17616,p:'156,320 216,312 222,350 214,398 168,406 148,376 150,340',       cx:185,cy:363},
    {c:17877,p:'150,402 220,394 226,430 218,464 164,470 144,440 146,412',       cx:185,cy:433},
    {c:17524,p:'260,316 340,308 350,358 340,396 300,404 260,392 256,352',       cx:303,cy:358},
    {c:17174,p:'218,398 312,390 320,430 310,466 254,472 218,444',               cx:270,cy:433},
    {c:17001,p:'335,280 425,272 434,314 427,386 387,400 350,387 345,345 334,300',cx:385,cy:337},
    {c:17873,p:'390,393 428,386 441,420 432,494 390,500 373,469 376,415',       cx:407,cy:443},
    {c:17486,p:'332,242 420,234 428,270 420,294 382,303 334,288 332,260',       cx:380,cy:267},
    {c:17050,p:'366,192 446,184 456,220 448,244 410,254 368,244 365,211',       cx:410,cy:219},
    {c:17653,p:'336,152 416,144 426,180 418,207 380,217 338,210 336,170',       cx:381,cy:180},
    {c:17388,p:'414,141 488,133 496,168 489,197 454,204 416,198 416,167',       cx:453,cy:168},
    {c:17513,p:'330,103 410,95 420,132 410,152 370,160 332,150 330,120',        cx:371,cy:128},
    {c:17446,p:'488,101 566,94 576,140 568,189 530,199 492,190 489,130',        cx:530,cy:145},
    {c:17013,p:'167,58 396,50 416,90 408,108 344,120 278,127 205,120 168,90',   cx:282,cy:88},
    {c:17433,p:'460,196 534,189 541,226 534,269 497,276 462,262 460,217',       cx:500,cy:232},
    {c:17665,p:'458,271 533,264 540,302 530,346 494,353 458,340 457,291',       cx:497,cy:308},
    {c:17444,p:'530,264 606,257 614,297 607,349 568,359 533,344 530,280',       cx:570,cy:308},
    {c:17541,p:'537,182 617,175 624,216 614,260 577,267 540,250 538,200',       cx:577,cy:220},
    {c:17662,p:'614,114 750,106 754,233 747,310 703,319 645,312 616,269 614,114',cx:683,cy:213},
    {c:17867,p:'607,340 647,334 657,376 646,420 601,426 579,409 578,362 605,344',cx:618,cy:383},
    {c:17495,p:'644,377 714,370 720,416 711,459 664,466 643,436 643,395',       cx:679,cy:418},
    {c:17380,p:'716,360 850,350 854,510 716,512 698,480 703,438 716,376',       cx:779,cy:433},
  ];
  const elements = [];
  MUNS.forEach(m => {
    const name = MAP_MUN_NAME[m.c] || '?';
    mapAllMuns.push({ name });
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    el.setAttribute('points', m.p);
    el.setAttribute('fill', mapBaseColor());
    el.setAttribute('stroke', 'rgba(5,13,11,0.85)');
    el.setAttribute('stroke-width', '1.5');
    mapAttachEvents(el, name, m.cx, m.cy, svgEl, container, tooltip, detailPanel);
    svgEl.appendChild(el);
    elements.push(el);
  });
  const loading = section.querySelector('#map-loading');
  if (loading) loading.style.display = 'none';

  svgEl.addEventListener('mouseleave', () => {
    if (!activePath) {
      document.querySelectorAll('#caldas-map path,#caldas-map polygon').forEach(p => {
        gsap.killTweensOf(p, 'opacity');
        gsap.to(p, { opacity: 1, duration: 0.15 });
      });
    }
  });

  mapSvgElements  = elements;
  mapSvgContainer = container;
  mapDoRadarSweep(elements, container);
}

function mapPlayEntrance(section) {
  const headerEls = [...section.querySelectorAll('.map-label,.map-title,.map-desc-top')];
  const container = mapSvgContainer || section.querySelector('.mapa-svg-container');
  gsap.killTweensOf(headerEls);
  gsap.killTweensOf(container);
  gsap.fromTo(headerEls,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.15, duration: 0.85, ease: 'power3.out', delay: 0.3 });
  gsap.fromTo(container,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: 0.6 });
  mapDoRadarSweep(mapSvgElements, container);
}

function setupMapAnimation(section, tl) {
  tl.fromTo(section, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
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

// ── TEXT CORRECTIONS ───────────────────────────────────────
function initTextCorrections() {
  const wanted = '¿Quien es Manuel Correa?';
  document.querySelectorAll('.section-heading, h1, h2').forEach(el => {
    const normalized = (el.textContent || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    if (/qu[ií]e?n\s+es\s+manuel\s+correa\??/.test(normalized) ||
        /manuel\s+correa/.test(normalized) && /qu[ií]e?n/.test(normalized)) {
      el.textContent = wanted;
      el.dataset.wrapped = 'false';
    }
  });
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

function setupSectionAnimation(section) {
  const type    = section.dataset.animation;
  const persist = section.dataset.persist === 'true';
  const enter   = parseFloat(section.dataset.enter) / 100;
  const leave   = parseFloat(section.dataset.leave) / 100;
  const sc      = document.getElementById('scroll-container');

  // Pre-procesar headings para revelado por palabras
  const heading = section.querySelector('.section-heading');
  if (heading) wrapHeadingWords(heading);

  const tl = gsap.timeline({ paused: true });

  if (type === 'map-reveal') {
    setupMapAnimation(section, tl);
  } else if (type === 'gallery-reveal' || type === 'zoom-parallax' || type === 'oryzo-carousel') {
    return;
  } else if (type === 'stagger-cards') {
    // Agenda Legislativa: header first, then cards en cascada cinematográfica
    const headerEls = section.querySelectorAll('.section-label, .agenda-title, .agenda-desc');
    const cards     = section.querySelectorAll('.agenda-card');
    tl
      .fromTo(headerEls,
        { y: 36, opacity: 0, filter: 'blur(6px)' },
        { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.12, duration: 0.95, ease: 'power3.out' }, 0)
      .fromTo(cards,
        { y: 50, opacity: 0, scale: 0.94, rotateX: -8 },
        { y: 0, opacity: 1, scale: 1, rotateX: 0,
          stagger: { each: 0.09, from: 'start' },
          duration: 0.95, ease: 'power3.out' }, 0.45);
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
        { opacity: 1, duration: 0.6, ease: 'power2.out',
          onStart: () => section.classList.add('is-visible'),
          onReverseComplete: () => section.classList.remove('is-visible') }, 0);
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
        tl.fromTo(children,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.09, duration: 0.72, ease: 'power3.out' });
        break;
      case 'scale-up':
        tl.fromTo(children,
          { y: 22, scale: 0.93, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, stagger: 0.08, duration: 0.8, ease: 'power2.out' });
        break;
      case 'blur-up':
        tl.fromTo(children,
          { y: 26, opacity: 0, filter: 'blur(4px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', stagger: 0.08, duration: 0.85, ease: 'power3.out' });
        break;
      default:
        tl.fromTo(children,
          { y: 22, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.07, duration: 0.7, ease: 'power2.out' });
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
      const shouldShow = p >= enter - 0.04 && p <= (persist ? 1 : leave + 0.04);

      if (shouldShow && !visible) {
        visible = true;
        tl.play();
        if (type === 'map-reveal') {
          if (!mapDataReady) {
            mapDataReady = true;
            mapLoad(section);
          } else if (mapSvgElements.length) {
            mapPlayEntrance(section);
          }
        }
      } else if (!shouldShow && visible) {
        visible = false;
        if (tl.progress() > 0) tl.reverse();
      }
    }
  });
}

// ── FONDO DIFUMINADO (post-galería) ───────────────────────────
function initBgPhotoOverlay() {
  const el = document.getElementById('bg-photo');
  if (!el) return;
  // Desactivado: dejamos solo los frames del video de fondo en toda la página
  el.style.opacity = '0';
  el.style.display = 'none';
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
      if (cardL) gsap.set(cardL, { y: fallY });
      if (cardR) gsap.set(cardR, { y: fallY * 0.7 });
    }
  });
}

// ── MAP TOOLTIP ────────────────────────────────────────────────
function initMapTooltip() {
  const tooltip = document.getElementById('map-tooltip');
  if (!tooltip) return;

  document.querySelectorAll('.municipality[data-name]').forEach(dot => {
    dot.addEventListener('mouseenter', (e) => {
      tooltip.textContent = e.target.dataset.name;
      tooltip.style.opacity = '1';
    });
    dot.addEventListener('mousemove', (e) => {
      tooltip.style.left = (e.clientX + 14) + 'px';
      tooltip.style.top  = (e.clientY - 28) + 'px';
    });
    dot.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
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
  const FADE       = 0.048;

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

  // Oryzo-style sizing: active = big, near = medium, far = small
  function getSizes() {
    const vw = window.innerWidth, vh = window.innerHeight;
    return {
      active: { w: Math.min(vw * 0.36, 540), h: vh * 0.74, opacity: 1    },
      near:   { w: Math.min(vw * 0.18, 270), h: vh * 0.50, opacity: 0.55 },
      far:    { w: Math.min(vw * 0.12, 190), h: vh * 0.37, opacity: 0.28 },
      hidden: { w: Math.min(vw * 0.09, 140), h: vh * 0.28, opacity: 0.12 },
    };
  }

  const bgEl = document.getElementById('gallery-bg');

  function updateBg(index, animate) {
    if (!bgEl) return;
    const img = items[index] ? items[index].querySelector('img') : null;
    const src = img ? img.src : '';
    if (!src) return;
    if (!animate) {
      bgEl.style.backgroundImage = `url('${src}')`;
      gsap.set(bgEl, { opacity: 0 });
      return;
    }
    gsap.to(bgEl, { opacity: 0, duration: 0.55, ease: 'power2.inOut', onComplete: () => {
      bgEl.style.backgroundImage = `url('${src}')`;
      gsap.to(bgEl, { opacity: 0, duration: 0.2, ease: 'power2.out' });
    }});
  }

  function goTo(index, animate = true) {
    const prevIndex  = currentIndex;
    index = Math.max(0, Math.min(items.length - 1, index));
    if (index === prevIndex && animate) return; // ya estamos ahí
    currentIndex = index;
    const dur = animate ? 0.85 : 0;
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

      const inner = item.querySelector('.gallery-item-inner');
      const img   = item.querySelector('img');

      // limpiar transformaciones previas que provocan stutter
      if (inner) gsap.set(inner, { clearProps: 'clipPath' });
      if (img && !isActive) gsap.set(img, { clearProps: 'scale' });

      gsap.to(item, { width: cfg.w, height: cfg.h, opacity: cfg.opacity,
        duration: dur, ease: 'power3.out', overwrite: 'auto' });

      // Solo escala suave en el activo cuando llega; sin clip-path competitivo
      if (animate && isActive && i !== prevIndex && img) {
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
  const AUTOPLAY_MS   = 5500;
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
  const header   = document.querySelector('.site-header');
  const toggle   = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 80);
  }, { passive: true });

  toggle?.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// ── LOADER (video colibrí — ~3s o reproducción completa) ──────
// Muestrea el color de borde del video y lo aplica al fondo del loader
// para que el video se integre sin caja visible.
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
    if (!video) { setTimeout(resolve, 600); return; }

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
    { opacity: 0, y: -50, rotation: -8, x: -50 },
    { opacity: 1, y: 0,   x: 0, duration: 1.7, ease: 'power3.out' }, 0.2);
  if (cardR) tl.fromTo(cardR,
    { opacity: 0, y: -60, rotation: 7, x: 50 },
    { opacity: 1, y: 0,   x: 0, duration: 1.7, ease: 'power3.out' }, 0.4);
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
  gsap.set(items, { opacity: 0, scale: 1 });

  let zpEntered = false;
  let zpPauseTimer = null;
  const sc = document.getElementById('scroll-container');

  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;

      // Visibilidad
      if (p >= ZP_ENTER && p <= ZP_LEAVE) {
        section.style.opacity    = '1';
        section.style.visibility = 'visible';
      } else if (p > ZP_ENTER - FADE && p < ZP_ENTER) {
        section.style.opacity    = Math.max(0, (p - (ZP_ENTER - FADE)) / FADE).toFixed(3);
        section.style.visibility = 'visible';
      } else if (p > ZP_LEAVE && p < ZP_LEAVE + FADE) {
        section.style.opacity    = Math.max(0, 1 - (p - ZP_LEAVE) / FADE).toFixed(3);
        section.style.visibility = 'visible';
      } else {
        section.style.opacity    = '0';
        section.style.visibility = 'hidden';
      }

      // Entrada: cambio de escena + pausa de 1s antes de activar el zoom
      if (!zpEntered && p >= ZP_ENTER) {
        zpEntered = true;
        gsap.fromTo(items,
          { opacity: 0, scale: 1.04 },
          { opacity: 1, scale: 1, duration: 0.18, stagger: 0, ease: 'power4.out' }
        );
        // Congela el scroll 1 segundo para que el usuario vea el mosaico
        if (window.lenis) {
          window.lenis.stop();
          zpPauseTimer = setTimeout(() => {
            if (window.lenis) window.lenis.start();
            zpPauseTimer = null;
          }, 1000);
        }
      } else if (zpEntered && p < ZP_ENTER - FADE) {
        zpEntered = false;
        gsap.set(items, { opacity: 0, scale: 1, filter: 'none' });
        // Si el usuario vuelve antes de que termine la pausa, reactivar scroll
        if (zpPauseTimer) {
          clearTimeout(zpPauseTimer);
          zpPauseTimer = null;
          if (window.lenis) window.lenis.start();
        }
      }

      // Zoom scroll-driven: escala 1 → data-scale.
      // fastP llega a 1 en el 67% del recorrido ZP para que la imagen central
      // ya sea pantalla completa (100vw×100vh) cuando el carrusel empieza su fade-in.
      if (p >= ZP_ENTER && p <= ZP_LEAVE) {
        const localP = (p - ZP_ENTER) / (ZP_LEAVE - ZP_ENTER);
        const fastP  = Math.min(1, localP * 1.35);
        items.forEach((item, i) => {
          const depth = parseFloat(item.dataset.scale) || 4;
          const newScale = 1 + (depth - 1) * fastP;
          gsap.set(item, { scale: newScale });
          // Mejorar calidad visual de la imagen central conforme crece
          if (i === 0 && depth === 4) {
            const scaleRatio = (newScale - 1) / (depth - 1);
            const contrast = 1 + scaleRatio * 0.14;
            const saturate = 1 + scaleRatio * 0.25;
            gsap.set(item, { filter: `contrast(${contrast.toFixed(3)}) saturate(${saturate.toFixed(3)})` });
          }
        });
      }
    }
  });
}

// ── LENIS ─────────────────────────────────────────────────────
function initLenis() {
  const lenis = new Lenis({
    duration: 1.65,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.4
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

    const nombre    = (document.getElementById('contact-nombre')   || {}).value || '';
    const municipio = (document.getElementById('contact-municipio')|| {}).value || '';
    const numero    = (document.getElementById('contact-numero')   || {}).value || '';
    const mensaje   = (document.getElementById('contact-mensaje')  || {}).value || '';

    if (!nombre.trim() || !municipio.trim() || !numero.trim() || !mensaje.trim()) return;

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
  const sc = document.getElementById('scroll-container');

  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      // Aparece con la sección final + se queda integrado al cierre
      if (self.progress >= 0.96) {
        footer.classList.add('is-visible');
      } else {
        footer.classList.remove('is-visible');
      }
    }
  });
}

// ── INIT ──────────────────────────────────────────────────────
async function init() {
  gsap.registerPlugin(ScrollTrigger);

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  const sections = document.querySelectorAll('.scroll-section');
  sections.forEach(positionSection);

  // Fake loader runs for ~1.5s; real frames load in parallel
  const loaderDone = runFakeLoader().then(slideOutLoader);

  detectFrames().then(async (found) => {
    if (!found) { drawGenerativeFrame(0, 200); return; }
    const frameCounts = [300, 250, 240, 200, 180, 150, 120, 100, 80, 50];
    let detected = 1;
    for (const count of frameCounts) {
      const exists = await new Promise(resolve => {
        const img = new Image();
        img.onload  = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = buildFrameUrl(count - 1);
      });
      if (exists) { detected = count; break; }
    }
    totalFrames = detected;
    preloadFrames(totalFrames);
  });

  await loaderDone;
  initHeroEntrance();

  initCustomCursor();
  initLenis();
  window.lenis.scrollTo(0, { immediate: true });
  initFrameScroll();
  initBgPhotoOverlay();
  initHeroFade();
  initHeroBg();
  initTextCorrections();
  sections.forEach(setupSectionAnimation);
  initZoomParallax();
  initGallery();
  initHeader();
  initContactForm();
  initFooter();

  requestAnimationFrame(() => {
    if (hasFrames && frames[0]) drawFrame(0);
    else drawGenerativeFrame(0, 200);
  });
}

// DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
