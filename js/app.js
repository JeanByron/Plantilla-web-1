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

// Dark overlay: sección stats (77–85% en 2000vh)
const STATS_ENTER   = 0.77;
const STATS_LEAVE   = 0.85;

// Hero desaparece al 12% de scroll
const HERO_FADE_END = 0.12;

// ── MAP DATA (v1 real vote counts) ────────────────────────────
const MAP_VOTES = {
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
const MAP_VOTE_COUNT = {
  17001:13500, 17013:800,  17042:1500, 17050:480,  17088:680,
  17174:1900,  17272:400,  17380:2800, 17388:360,  17433:760,
  17442:400,   17444:640,  17446:280,  17486:1200, 17495:240,
  17513:560,   17524:680,  17541:880,  17614:1700, 17616:440,
  17653:680,   17662:840,  17665:280,  17777:840,  17867:400,
  17873:2100,  17877:560
};
const MAP_TOTAL  = 35946;
const MAP_MAX_V  = Math.max(...Object.values(MAP_VOTE_COUNT));
const MAP_MUN_DATA = {
  'Manizales':   { desc:'Capital de Caldas · Hub universitario y cultural', eje:'Conectividad Digital y Educación', propuesta:'Ampliación del Fondo de Conectividad Digital Caldas y fortalecimiento de los institutos de educación técnica articulados con las universidades de la capital.' },
  'Aguadas':     { desc:'Norte de Caldas · Patrimonio del sombrero aguadeño', eje:'Turismo Cultural y Artesanías', propuesta:'Plan de Turismo Cafetero con rutas culturales que posicionen el sombrero aguadeño —declarado Patrimonio Cultural de la Nación— como atractivo turístico del norte caldense.' },
  'Anserma':     { desc:'Occidente de Caldas · Economía cafetera y panelera', eje:'Salud Rural y Vías Terciarias', propuesta:'Ley de Salud Rural Universal para garantizar acceso médico en las veredas del occidente cafetero; inversión en vías terciarias para conectar los cultivos con los centros de acopio.' },
  'Aranzazu':    { desc:'Centro de Caldas · Municipio cafetero de mediana escala', eje:'Salud Rural y Conectividad', propuesta:'Puestos de salud operativos en cada corregimiento mediante la Ley de Salud Rural Universal; Fondo de Conectividad Digital para mejorar el acceso a servicios digitales en zonas rurales.' },
  'Belalcázar':  { desc:'Occidente de Caldas · Turismo religioso y paisaje cafetero', eje:'Turismo y Desarrollo Rural', propuesta:'Plan de Turismo Cafetero que potencie el turismo religioso y paisajístico del occidente caldense como motor económico, complementado con mejoras en infraestructura rural.' },
  'Chinchiná':   { desc:'Sur de Caldas · Epicentro de la industria cafetera colombiana', eje:'Turismo Cafetero y Educación Técnica', propuesta:'Plan de Turismo Cafetero para posicionar Chinchiná en las rutas del Eje Cafetero; Reforma de Educación Técnica Municipal con formación en barismo, agroindustria y exportación local.' },
  'Filadelfia':  { desc:'Norte de Caldas · Municipio rural con alta dispersión poblacional', eje:'Salud Rural Universal', propuesta:'Ley de Salud Rural Universal: equipos médicos móviles y telesalud para llegar a las veredas más alejadas del norte de Caldas sin centro hospitalario propio.' },
  'La Dorada':   { desc:'Magdalena Centro · Puerto fluvial y centro económico del oriente', eje:'Empleo y Reactivación Económica', propuesta:'Proyecto legislativo para la reactivación del Puerto de La Dorada como nodo logístico del río Magdalena, con generación de empleo formal y mejora de la conectividad vial regional.' },
  'La Merced':   { desc:'Occidente de Caldas · Municipio de economía campesina', eje:'Conectividad Digital y Salud Rural', propuesta:'Fondo de Conectividad Digital Caldas para llevar internet a las escuelas rurales; Ley de Salud Rural Universal para municipios sin hospital en el occidente caldense.' },
  'Manzanares':  { desc:'Oriente de Caldas · Cuna del aguardiente amarillo caldense', eje:'Educación Técnica y Agroindustria', propuesta:'Reforma de Educación Técnica Municipal para crear oferta de formación en agroindustria y procesamiento de alimentos, aprovechando la vocación productiva del oriente caldense.' },
  'Marmato':     { desc:'Occidente de Caldas · Minería aurífera ancestral desde el siglo XVI', eje:'Derechos Mineros y Patrimonio Cultural', propuesta:'Defensa legislativa de los mineros artesanales ante megaproyectos mineros; reconocimiento del Paisaje Cultural Minero de Marmato y garantía de derechos para las comunidades históricas.' },
  'Marquetalia': { desc:'Oriente de Caldas · Zona en proceso de reconciliación post-conflicto', eje:'Reconciliación, Salud y Empleo Rural', propuesta:'Agenda de salud rural y empleabilidad para comunidades del oriente caldense afectadas por el conflicto armado; apoyo a proyectos productivos en zonas de sustitución.' },
  'Marulanda':   { desc:'Centro-oriente de Caldas · Municipio más frío, zona de páramo andino', eje:'Medio Ambiente y Desarrollo Sostenible', propuesta:'Protección legislativa de los páramos del oriente caldense; fomento de la economía de la lana de oveja como producto artesanal identitario y sostenible de Marulanda.' },
  'Neira':       { desc:'Centro de Caldas · Municipio histórico sobre el Camino Real', eje:'Educación Técnica y Empleo', propuesta:'Reforma de Educación Técnica Municipal con oferta de formación laboral en el centro de Caldas, con énfasis en caficultura tecnificada y turismo patrimonial.' },
  'Norcasia':    { desc:'Oriente de Caldas · Zona de la represa La Miel · Turismo ecológico', eje:'Turismo Ecológico y Recursos Hídricos', propuesta:'Plan de Turismo Cafetero con circuitos ecológicos en la represa La Miel; defensa de los recursos hídricos del oriente caldense y distribución justa de regalías energéticas.' },
  'Pácora':      { desc:'Norte de Caldas · Tradición cultural de las matracas', eje:'Turismo Cultural y Conectividad', propuesta:'Plan de Turismo Cafetero con énfasis en la identidad cultural del norte caldense; Fondo de Conectividad Digital para mejorar el acceso a servicios en municipios rurales como Pácora.' },
  'Palestina':   { desc:'Sur de Caldas · Sede del Aeropuerto Internacional del Café', eje:'Conectividad Aérea y Turismo Cafetero', propuesta:'Gestión legislativa para la operación sostenida del Aeropuerto Internacional del Café y su articulación con rutas turísticas del Eje Cafetero, dinamizando la economía regional.' },
  'Pensilvania': { desc:'Oriente de Caldas · Vocación maderera y forestal', eje:'Educación Técnica y Empleo Forestal', propuesta:'Reforma de Educación Técnica Municipal con énfasis en silvicultura, manejo forestal sostenible y carpintería, aprovechando la vocación productiva del municipio.' },
  'Riosucio':    { desc:'Occidente de Caldas · Mayor concentración indígena del departamento · Carnaval del Diablo', eje:'Derechos Étnicos y Salud Intercultural', propuesta:'Defensa de los derechos de los resguardos indígenas Emberá y Chamí; salud intercultural mediante la Ley de Salud Rural Universal; protección del Carnaval del Diablo como Bien de Interés Cultural Nacional.' },
  'Risaralda':   { desc:'Occidente de Caldas · Municipio cafetero de pequeña escala', eje:'Salud Rural y Agricultura', propuesta:'Ley de Salud Rural Universal para municipios pequeños del occidente caldense; asistencia técnica agropecuaria para caficultores independientes y mejora de vías rurales.' },
  'Salamina':    { desc:'Norte de Caldas · Patrimonio Histórico Nacional · Paisaje Cultural Cafetero UNESCO', eje:'Turismo Patrimonial y Cultura', propuesta:'Plan de Turismo Cafetero con Salamina como nodo del Paisaje Cultural Cafetero UNESCO; recursos para conservación del patrimonio arquitectónico y promoción turística nacional e internacional.' },
  'Samaná':      { desc:'Oriente de Caldas · Municipio históricamente afectado por el conflicto armado', eje:'Salud Rural y Reconciliación', propuesta:'Ley de Salud Rural Universal para municipios que fueron escenario del conflicto; programas de empleo rural y acceso a servicios básicos para las comunidades víctimas del oriente.' },
  'San José':    { desc:'Occidente de Caldas · Municipio de economía campesina', eje:'Salud Rural y Vías', propuesta:'Garantía de servicios de salud básicos mediante la Ley de Salud Rural Universal e inversión en vías terciarias para corregimientos del occidente caldense.' },
  'Supía':       { desc:'Occidente de Caldas · Minería artesanal y comunidades indígenas', eje:'Derechos Étnicos y Desarrollo Local', propuesta:'Defensa de los derechos de las comunidades indígenas del occidente caldense y de los mineros artesanales; promoción de la gastronomía y el turismo local como alternativas económicas sostenibles.' },
  'Victoria':    { desc:'Oriente de Caldas · Municipio ganadero sobre el río Magdalena', eje:'Infraestructura Vial y Conectividad', propuesta:'Proyecto de mejora vial para conectar municipios del oriente caldense con la red nacional; Fondo de Conectividad Digital para llevar servicios digitales al sector rural.' },
  'Villamaría':  { desc:'Sur de Caldas · Puerta al Parque Nacional Natural Los Nevados', eje:'Medio Ambiente y Ecoturismo', propuesta:'Protección legislativa del Parque Nacional Natural Los Nevados; circuito de ecoturismo andino que posicione a Villamaría como destino de turismo de naturaleza y referente ambiental.' },
  'Viterbo':     { desc:'Occidente de Caldas · Destino turístico con Lago Distracción', eje:'Turismo y Desarrollo Local', propuesta:'Plan de Turismo Cafetero con rutas en el occidente caldense que incorporen a Viterbo como destino de turismo rural y ecoturismo lacustre.' }
};

function mapVoteColor(v) {
  const t = Math.pow(v / MAP_MAX_V, 0.44);
  let r, g, b;
  if (t < 0.45) {
    // dark teal (#0A1A17) → teal (#1B4D47)
    const s = t / 0.45;
    r = Math.round(10  + (27  - 10)  * s);
    g = Math.round(26  + (77  - 26)  * s);
    b = Math.round(23  + (71  - 23)  * s);
  } else {
    // teal (#1B4D47) → orange (#E8621A)
    const s = (t - 0.45) / 0.55;
    r = Math.round(27  + (232 - 27)  * s);
    g = Math.round(77  + (98  - 77)  * s);
    b = Math.round(71  + (26  - 71)  * s);
  }
  return `rgb(${r},${g},${b})`;
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

function updateLoader(loaded, total) {
  const pct = total > 0 ? Math.round((loaded / total) * 100) : 100;
  const bar = document.getElementById('loader-bar');
  const txt = document.getElementById('loader-percent');
  if (bar) bar.style.width = pct + '%';
  if (txt) txt.textContent = pct + '%';
}

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
const GALLERY_ENTER  = 0.48;   // flat bg: cubre zoom parallax + carrusel
const GALLERY_LEAVE  = 0.77;
const GALLERY_FADE   = 0.035;
const ZP_ENTER       = 0.48;   // zoom parallax
const ZP_LEAVE       = 0.62;
const CAROUSEL_ENTER = 0.62;   // carrusel Oryzo
const CAROUSEL_LEAVE = 0.77;

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
        const cw = canvas.width  / (window.devicePixelRatio || 1);
        const ch = canvas.height / (window.devicePixelRatio || 1);

        if (p >= GALLERY_ENTER && p <= GALLERY_LEAVE) {
          // Fondo plano puro durante galería
          drawFlatBg(cw, ch);
        } else if (p >= GALLERY_ENTER - GALLERY_FADE && p < GALLERY_ENTER) {
          // Transición entrada: video → plano (con ease-in-out suave)
          if (hasFrames && frames[currentFrame]) drawFrame(currentFrame);
          else drawGenerativeFrame(currentFrame, maxF);
          const t = (p - (GALLERY_ENTER - GALLERY_FADE)) / GALLERY_FADE;
          const te = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          ctx.fillStyle = `rgba(10,26,23,${(te * 0.97).toFixed(3)})`;
          ctx.fillRect(0, 0, cw, ch);
        } else if (p > GALLERY_LEAVE && p < GALLERY_LEAVE + GALLERY_FADE) {
          // Transición salida: plano → video (con ease-in-out suave)
          if (hasFrames && frames[currentFrame]) drawFrame(currentFrame);
          else drawGenerativeFrame(currentFrame, maxF);
          const t = (p - GALLERY_LEAVE) / GALLERY_FADE;
          const te = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
          ctx.fillStyle = `rgba(10,26,23,${((1 - te) * 0.97).toFixed(3)})`;
          ctx.fillRect(0, 0, cw, ch);
        } else {
          if (hasFrames && frames[currentFrame]) drawFrame(currentFrame);
          else drawGenerativeFrame(currentFrame, maxF);
        }
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
      mapAnimateCounter();
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

function mapAttachEvents(el, name, votes, cx, cy, svgEl, container, tooltip, detailPanel) {
  el._cx = cx; el._cy = cy;

  function getMapPos() {
    const svgRect = svgEl.getBoundingClientRect();
    const cRect   = container.getBoundingClientRect();
    return {
      px: cx * (svgRect.width / 860) + (svgRect.left - cRect.left),
      py: cy * (svgRect.height / 520) + (svgRect.top  - cRect.top)
    };
  }

  const pct = ((votes / MAP_TOTAL) * 100).toFixed(1);

  el.addEventListener('mouseenter', () => {
    tooltip.innerHTML = `
      <div class="map-tooltip-name">${name}</div>
      <div class="map-tooltip-stats">${votes.toLocaleString()} votos &nbsp;·&nbsp; ${pct}%</div>`;
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
    }
  });

  el.addEventListener('mousemove', e => {
    const rc = container.getBoundingClientRect();
    let left = e.clientX - rc.left + 18;
    let top  = Math.max(e.clientY - rc.top - 56, 8);
    if (left + 190 > rc.width) left = e.clientX - rc.left - 208;
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
      activePath = null;
      el.setAttribute('stroke', 'rgba(5,13,11,0.85)');
      el.setAttribute('stroke-width', '1');
      el.style.filter = '';
      allPaths.forEach(p => gsap.to(p, { opacity: 1, duration: 0.3 }));
      mapClearDetail(detailPanel);
    } else {
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
      mapShowDetail(name, votes, detailPanel);
    }
  });
}

function mapShowDetail(name, votes, detailPanel) {
  if (!detailPanel) return;
  const data   = MAP_MUN_DATA[name] || { desc:'Caldas', eje:'Propuestas Generales', propuesta:'Manuel Correa trabaja por los 27 municipios de Caldas con propuestas de salud rural, conectividad digital, educación técnica y turismo cafetero.' };
  const sorted = [...mapAllMuns].sort((a, b) => b.votes - a.votes);
  const rank   = sorted.findIndex(x => x.name === name) + 1;
  const pct    = ((votes / MAP_TOTAL) * 100).toFixed(1);

  detailPanel.classList.add('has-data');
  detailPanel.querySelector('#detail-name').textContent      = name;
  detailPanel.querySelector('#detail-desc').textContent      = data.desc;
  detailPanel.querySelector('#detail-votes').textContent     = votes.toLocaleString();
  detailPanel.querySelector('#detail-pct').textContent       = pct + '% del total';
  detailPanel.querySelector('#detail-rank').textContent      = '#' + rank + ' en Caldas';
  detailPanel.querySelector('#detail-eje').textContent       = data.eje;
  detailPanel.querySelector('#detail-propuesta').textContent = data.propuesta;

  const emptyEl   = document.getElementById('mapa-detail-empty');
  const contentEl = document.getElementById('mapa-detail-content');

  if (contentEl && contentEl.hidden) {
    contentEl.hidden = false;
    if (emptyEl) gsap.to(emptyEl, { opacity: 0, duration: 0.2, onComplete: () => { emptyEl.style.display = 'none'; } });
    gsap.fromTo(contentEl, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' });
  } else if (contentEl) {
    gsap.fromTo(contentEl, { opacity: 0.5, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
  }

  setTimeout(() => {
    const barFill = document.getElementById('detail-bar-fill');
    if (barFill) barFill.style.width = (votes / MAP_MAX_V * 100).toFixed(1) + '%';
  }, 80);
}

function mapClearDetail(detailPanel) {
  if (!detailPanel) return;
  detailPanel.classList.remove('has-data');
  const emptyEl   = document.getElementById('mapa-detail-empty');
  const contentEl = document.getElementById('mapa-detail-content');
  if (!emptyEl || !contentEl) return;
  gsap.to(contentEl, { opacity: 0, y: -8, duration: 0.25, onComplete: () => {
    contentEl.hidden = true;
    emptyEl.style.display = '';
    gsap.fromTo(emptyEl, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    const barFill = document.getElementById('detail-bar-fill');
    if (barFill) barFill.style.width = '0%';
  }});
}

let mapCounterTimer;
function mapAnimateCounter() {
  const el = document.getElementById('total-counter');
  if (!el) return;
  let cur = 0; const step = MAP_TOTAL / 80;
  clearInterval(mapCounterTimer);
  mapCounterTimer = setInterval(() => {
    cur = Math.min(cur + step, MAP_TOTAL);
    el.textContent = Math.round(cur).toLocaleString();
    if (cur >= MAP_TOTAL) clearInterval(mapCounterTimer);
  }, 20);
}

function mapBuildRanking() {
  const rankList = document.getElementById('ranking-list');
  if (!rankList) return;
  const sorted = [...mapAllMuns].sort((a,b) => b.votes - a.votes);
  rankList.innerHTML = '';
  sorted.slice(0, 7).forEach((m, i) => {
    const d = document.createElement('div'); d.className = 'rank-item';
    d.innerHTML = `<span class="rank-n">${i+1}</span>
      <span class="rank-name">${m.name}</span>
      <div class="rank-bar-wrap"><div class="rank-bar" style="width:0%"></div></div>
      <span class="rank-votes">${m.votes.toLocaleString()}</span>`;
    rankList.appendChild(d);
    setTimeout(() => { d.querySelector('.rank-bar').style.width = (m.votes/MAP_MAX_V*100).toFixed(0)+'%'; }, 200 + i * 90);
  });
}

async function mapLoad(section) {
  const svgEl     = section.querySelector('#caldas-map');
  const tooltip   = section.querySelector('#map-tooltip');
  const detailPanel = section.querySelector('#mapa-detail');
  const container = section.querySelector('.mapa-svg-container');
  if (!svgEl || !container) return;

  mapInitParticles(container);
  mapInitMouseGlow(container);

  // Animate header in
  const headerEls = [...section.querySelectorAll('.map-label,.map-title,.map-desc-top,.mapa-total')];
  gsap.fromTo(headerEls,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.15, duration: 0.85, ease: 'power3.out', delay: 0.3 });

  // Animate container border glow
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
  else { mapRenderFallback(svgEl, container, tooltip, selPanel, section); return; }

  const caldas = features.filter(f => {
    const id = String(f.id || f.properties?.MPIO_CDPMP || f.properties?.DPTO || '');
    return id.startsWith('17') && id.length >= 4;
  });
  if (caldas.length < 10) { mapRenderFallback(svgEl, container, tooltip, selPanel, section); return; }

  const W = 860, H = 520;
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const proj    = d3.geoMercator().fitExtent([[14,14],[W-14,H-14]], { type:'FeatureCollection', features:caldas });
  const pathGen = d3.geoPath().projection(proj);
  const elements = [];

  caldas.forEach(feat => {
    const code  = parseInt(String(feat.id || feat.properties?.MPIO_CDPMP || 0));
    const name  = MAP_VOTES[code] || feat.properties?.MPIO_CNMBR || `Mun ${code}`;
    const votes = MAP_VOTE_COUNT[code] || 300;
    mapAllMuns.push({ name, votes });
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', pathGen(feat));
    el.setAttribute('fill', mapVoteColor(votes));
    el.setAttribute('stroke', 'rgba(5,13,11,0.85)');
    el.setAttribute('stroke-width', '1');
    const c = pathGen.centroid(feat);
    mapAttachEvents(el, name, votes, c[0]||W/2, c[1]||H/2, svgEl, container, tooltip, detailPanel);
    svgEl.appendChild(el);
    elements.push(el);
  });

  mapBuildRanking();
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

function mapRenderFallback(svgEl, container, tooltip, selPanel, section) {
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
    const name = MAP_VOTES[m.c] || '?', votes = MAP_VOTE_COUNT[m.c] || 300;
    mapAllMuns.push({ name, votes });
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    el.setAttribute('points', m.p);
    el.setAttribute('fill', mapVoteColor(votes));
    el.setAttribute('stroke', 'rgba(5,13,11,0.85)');
    el.setAttribute('stroke-width', '1.5');
    mapAttachEvents(el, name, votes, m.cx, m.cy, svgEl, container, tooltip, selPanel);
    svgEl.appendChild(el);
    elements.push(el);
  });
  mapBuildRanking();
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
  const headerEls = [...section.querySelectorAll('.map-label,.map-title,.map-desc-top,.mapa-total')];
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

// ── SECTION ANIMATION SYSTEM ─────────────────────────────────
function positionSection(section) {
  if (section.classList.contains('section-gallery')) return; // fixed, no absolute positioning
  const enter    = parseFloat(section.dataset.enter);
  const leave    = parseFloat(section.dataset.leave);
  const mid      = (enter + leave) / 2;
  const totalH   = document.getElementById('scroll-container').offsetHeight;
  const maxScroll = totalH - window.innerHeight;
  // Place section center at viewport center when scroll = mid% of maxScroll
  section.style.top = ((mid / 100) * maxScroll + window.innerHeight / 2) + 'px';
  section.style.transform = 'translateY(-50%)';
}

function setupSectionAnimation(section) {
  const type    = section.dataset.animation;
  const persist = section.dataset.persist === 'true';
  const enter   = parseFloat(section.dataset.enter) / 100;
  const leave   = parseFloat(section.dataset.leave) / 100;
  const sc      = document.getElementById('scroll-container');

  const tl = gsap.timeline({ paused: true });

  if (type === 'map-reveal') {
    setupMapAnimation(section, tl);
  } else if (type === 'gallery-reveal' || type === 'zoom-parallax' || type === 'oryzo-carousel') {
    return;
  } else if (type === 'stagger-cards') {
    // Agenda Legislativa: header first, then cards staggered
    const headerEls = section.querySelectorAll('.section-label, .agenda-title, .agenda-desc');
    const cards     = section.querySelectorAll('.agenda-card');
    tl
      .fromTo(headerEls,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.75, ease: 'power3.out' }, 0)
      .fromTo(cards,
        { y: 32, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.06, duration: 0.65, ease: 'power2.out' }, 0.35);
  } else {
    const children = section.querySelectorAll(
      '.section-label, .section-heading, .section-body, .section-note, .section-link, ' +
      '.cta-button, .cta-input, .cta-social, .cta-form, .agenda-list, .stat, .section-photo, .section-muro-wall'
    );
    gsap.set(children, { visibility: 'visible' });

    switch (type) {
      case 'fade-up':
        tl.fromTo(children,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.08, duration: 0.75, ease: 'power2.out' });
        break;
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

// ── COUNTER ANIMATIONS ───────────────────────────────────────
function initCounters() {
  document.querySelectorAll('.stat-number').forEach(el => {
    const target   = parseFloat(el.dataset.value);
    const decimals = parseInt(el.dataset.decimals || '0');
    const proxy    = { val: 0 };

    gsap.fromTo(proxy,
      { val: 0 },
      {
        val: target,
        duration: 2.2,
        ease: 'power2.out',
        onUpdate() {
          el.textContent = decimals > 0 ? proxy.val.toFixed(decimals) : Math.round(proxy.val);
        },
        onComplete() {
          el.textContent = decimals > 0 ? target.toFixed(decimals) : target;
        },
        scrollTrigger: {
          trigger: el.closest('.scroll-section'),
          start: 'top 80%',
          toggleActions: 'play none none reset'
        }
      }
    );
  });
}

// ── DARK OVERLAY ─────────────────────────────────────────────
function initDarkOverlay() {
  const overlay   = document.getElementById('dark-overlay');
  const fadeRange = 0.03;

  ScrollTrigger.create({
    trigger: document.getElementById('scroll-container'),
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let opacity = 0;
      if (p >= STATS_ENTER - fadeRange && p <= STATS_ENTER) {
        opacity = (p - (STATS_ENTER - fadeRange)) / fadeRange;
      } else if (p > STATS_ENTER && p < STATS_LEAVE) {
        opacity = 0.92;
      } else if (p >= STATS_LEAVE && p <= STATS_LEAVE + fadeRange) {
        opacity = 0.92 * (1 - (p - STATS_LEAVE) / fadeRange);
      }
      overlay.style.opacity = opacity;
    }
  });
}

// ── FONDO DIFUMINADO (post-galería) ───────────────────────────
function initBgPhotoOverlay() {
  const el = document.getElementById('bg-photo');
  if (!el) return;
  const ENTER = GALLERY_LEAVE + 0.01; // entra justo al salir de galería
  const LEAVE = 0.83;
  const FADE  = 0.018;
  ScrollTrigger.create({
    trigger: document.getElementById('scroll-container'),
    start: 'top top', end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      let op  = 0;
      if (p >= ENTER && p <= LEAVE)                          op = 1;
      else if (p > ENTER - FADE && p < ENTER)               op = (p - (ENTER - FADE)) / FADE;
      else if (p > LEAVE && p < LEAVE + FADE)               op = 1 - (p - LEAVE) / FADE;
      el.style.opacity = op;
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
      gsap.set(bgEl, { opacity: 0.38 });
      return;
    }
    gsap.to(bgEl, { opacity: 0, duration: 0.22, onComplete: () => {
      bgEl.style.backgroundImage = `url('${src}')`;
      gsap.to(bgEl, { opacity: 0.38, duration: 0.55 });
    }});
  }

  function goTo(index, animate = true) {
    const direction  = index > currentIndex ? 1 : -1;
    const prevIndex  = currentIndex;
    index = Math.max(0, Math.min(items.length - 1, index));
    currentIndex = index;
    const dur = animate ? 0.58 : 0;
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
    gsap.to(track, { x: trackX, duration: dur, ease: 'expo.out' });

    items.forEach((item, i) => {
      const dist     = Math.abs(i - currentIndex);
      const isActive = dist === 0;
      const cfg      = dist === 0 ? s.active : dist === 1 ? s.near : dist === 2 ? s.far : s.hidden;
      item.classList.toggle('is-active', isActive);

      gsap.to(item, { width: cfg.w, height: cfg.h, opacity: cfg.opacity,
        duration: dur, ease: 'expo.out' });

      // Cinematic reveal for the newly-active image
      if (animate && isActive && i !== prevIndex) {
        const inner = item.querySelector('.gallery-item-inner');
        const img   = item.querySelector('img');
        const fromClip = direction > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
        if (inner) {
          gsap.fromTo(inner,
            { clipPath: fromClip },
            { clipPath: 'inset(0 0% 0 0%)', duration: 0.45, ease: 'power4.out', clearProps: 'clipPath' }
          );
        }
        if (img) {
          gsap.fromTo(img,
            { scale: 1.08 },
            { scale: 1, duration: 0.58, ease: 'power4.out' }
          );
        }
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
  const AUTOPLAY_MS   = 3000;
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
  const stepSize = (CAROUSEL_LEAVE - CAROUSEL_ENTER) / (items.length * 2);

  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: (self) => {
      const p = self.progress;
      currentScrollP = p; // siempre actualizado para que autoNext lo pueda leer

      // Detectar actividad de scroll para gestionar el autoplay
      onScrollActivity();

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

      // Avance del carrusel por scroll — sistema de ancla relativa
      if (p >= CAROUSEL_ENTER && p <= CAROUSEL_LEAVE) {
        if (galleryScrollBase < 0) {
          // Primera vez que entramos: anclar en imagen 0 desde el inicio
          galleryScrollBase = CAROUSEL_ENTER;
          galleryBaseIdx    = 0;
          if (currentIndex !== 0) { lastIdx = 0; goTo(0, false); }
        }

        const relSteps = Math.floor((p - galleryScrollBase) / stepSize);
        const idx = Math.max(0, Math.min(items.length - 1, galleryBaseIdx + relSteps));

        if (idx !== lastIdx) {
          lastIdx           = idx;
          // Actualizar ancla al paso exacto donde estamos ahora
          galleryScrollBase = CAROUSEL_ENTER + idx * stepSize;
          galleryBaseIdx    = idx;
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

// ── LOADER (v1-style fake progress + slide-out) ───────────────
function runFakeLoader() {
  return new Promise(resolve => {
    const bar   = document.getElementById('loader-bar');
    const txt   = document.getElementById('loader-percent');
    const proxy = { v: 0 };
    gsap.to(proxy, {
      v: 100,
      duration: 2.0,
      ease: 'power1.inOut',
      onUpdate() {
        const v = Math.round(proxy.v);
        if (bar) bar.style.width = proxy.v.toFixed(2) + '%';
        if (txt) txt.textContent = v + '%';
      },
      onComplete() {
        if (bar) bar.style.width = '100%';
        if (txt) txt.textContent = '100%';
        setTimeout(resolve, 80);
      }
    });
  });
}

function slideOutLoader() {
  return new Promise(resolve => {
    const loader = document.getElementById('loader');
    if (!loader) { resolve(); return; }
    gsap.to(loader, {
      yPercent: -100,
      duration: 0.65,
      ease: 'power3.inOut',
      onComplete: () => { loader.style.display = 'none'; resolve(); }
    });
  });
}

function initHeroEntrance() {
  const logo   = document.querySelector('.hero-logo');
  const bird   = document.querySelector('.hero-logo-bird');
  const manuel = document.querySelector('.hero-logo-manuel');
  const correa = document.querySelector('.hero-logo-correa');
  const banner = document.querySelector('.hero-logo-banner');
  const year   = document.querySelector('.hero-logo-year');
  const tag    = document.querySelector('.hero-tagline');
  const scroll = document.querySelector('.scroll-indicator');
  const cardL  = document.querySelector('.hero-card-left');
  const cardR  = document.querySelector('.hero-card-right');

  if (!logo) return;

  // Logo container visible — children animate separately
  gsap.set(logo, { opacity: 1 });

  const tl = gsap.timeline({ delay: 0.4 });

  if (bird)   tl.to(bird,   { opacity: 1, x: 0,       duration: 1.05, ease: 'power3.out'  }, 0);
  if (manuel) tl.to(manuel, { opacity: 1, x: 0,       duration: 1.1,  ease: 'power3.out'  }, 0.15);
  if (correa) tl.to(correa, { opacity: 1, y: 0,       duration: 1.2,  ease: 'power3.out'  }, 0.35);
  if (banner) tl.to(banner, { opacity: 1, scaleX: 1,  duration: 0.9,  ease: 'power3.inOut'}, 0.65);
  if (year)   tl.to(year,   { opacity: 1,             duration: 0.75, ease: 'power2.out'  }, 0.88);
  if (tag)    tl.to(tag,    { opacity: 1,             duration: 0.70, ease: 'power2.out'  }, 1.08);
  if (scroll) tl.to(scroll, { opacity: 1,             duration: 0.65, ease: 'power2.out'  }, 1.35);

  if (cardL) tl.fromTo(cardL,
    { opacity: 0, y: -50, rotation: -8, x: -50 },
    { opacity: 1, y: 0,   x: 0, duration: 1.7, ease: 'power3.out' }, 0.4);
  if (cardR) tl.fromTo(cardR,
    { opacity: 0, y: -60, rotation: 7, x: 50 },
    { opacity: 1, y: 0,   x: 0, duration: 1.7, ease: 'power3.out' }, 0.6);
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
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Fallback for programmatic scroll (Playwright testing)
  window.addEventListener('scroll', () => ScrollTrigger.update(), { passive: true });
  window.lenis = lenis;

  return lenis;
}

// ── MURO DE IDEAS (Supabase Realtime) ─────────────────────────
function initMuro() {
  const SUPABASE_URL     = 'https://upopumlywcybfbnevjrq.supabase.co';
  const SUPABASE_ANON    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwb3B1bWx5d2N5YmZibmV2anJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTk1MjMsImV4cCI6MjA5MjYzNTUyM30.FltLM26mdV1ZDlM8cbLrw4jNxbWWKU4ePvfPlxKZxO0';
  const EDGE_FN          = SUPABASE_URL + '/functions/v1/submit-comment';

  const form      = document.getElementById('muro-form');
  const toastEl   = document.getElementById('muro-toast');
  const toastIcon = document.getElementById('muro-toast-icon');
  const errorEl   = document.getElementById('muro-error');
  const newBtn    = document.getElementById('muro-new-btn');
  const cardsEl   = document.getElementById('muro-cards');
  const emptyEl   = document.getElementById('muro-empty');
  const countEl   = document.getElementById('muro-count');
  const msgEl     = document.getElementById('muro-mensaje');

  if (!form || !cardsEl) return;
  if (!window.supabase) { console.warn('Supabase SDK no cargado.'); return; }

  const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
  let totalCount = 0;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  function formatDate(isoStr) {
    const diff = Date.now() - new Date(isoStr).getTime();
    if (diff < 3600000)  return 'Hace ' + Math.max(1, Math.round(diff / 60000)) + ' min';
    if (diff < 86400000) return 'Hace ' + Math.round(diff / 3600000) + 'h';
    return new Date(isoStr).toLocaleDateString('es-CO', { day:'numeric', month:'short' });
  }

  function updateCount(n) {
    if (!countEl) return;
    countEl.textContent = n === 0 ? '' : n === 1 ? '1 propuesta' : n + ' propuestas';
    countEl.classList.remove('muro-wall-count--bump');
    void countEl.offsetWidth; // reflow para reiniciar animación
    countEl.classList.add('muro-wall-count--bump');
  }

  function createCard(post, delay = 0, realtime = false) {
    const initial = (post.nombre || 'A')[0].toUpperCase();
    const card = document.createElement('div');
    card.className = realtime ? 'muro-card muro-card--realtime' : 'muro-card';
    if (!realtime) card.style.animationDelay = delay + 'ms';
    card.innerHTML = `
      <div class="muro-card-header">
        <div class="muro-avatar">${initial}</div>
        <div class="muro-card-meta">
          <div class="muro-card-name">${escapeHtml(post.nombre)}</div>
          <div class="muro-card-loc">${escapeHtml(post.municipio)}</div>
        </div>
        <div class="muro-card-date">${formatDate(post.created_at)}</div>
      </div>
      <div class="muro-card-msg">${escapeHtml(post.mensaje)}</div>`;
    return card;
  }

  async function loadPosts() {
    const { data, error } = await db
      .from('comentarios')
      .select('id, nombre, municipio, mensaje, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) { console.error('Error cargando comentarios:', error); return; }

    totalCount = data.length;
    updateCount(totalCount);
    cardsEl.innerHTML = '';

    if (data.length === 0) {
      if (emptyEl) emptyEl.hidden = false;
    } else {
      if (emptyEl) emptyEl.hidden = true;
      data.forEach((p, i) => cardsEl.appendChild(createCard(p, i * 45)));
    }
  }

  function subscribeRealtime() {
    db.channel('muro-inserts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comentarios' }, (payload) => {
        const post = payload.new;
        if (emptyEl) emptyEl.hidden = true;
        const card = createCard(post, 0, true); // realtime=true → animación desde arriba
        cardsEl.insertBefore(card, cardsEl.firstChild);
        cardsEl.scrollTo({ top: 0, behavior: 'smooth' });
        totalCount++;
        updateCount(totalCount);
      })
      .subscribe();
  }

  function showError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError() {
    if (errorEl) errorEl.hidden = true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const nombre          = document.getElementById('muro-nombre').value.trim();
    const municipio       = document.getElementById('muro-municipio').value.trim();
    const numero_contacto = document.getElementById('muro-contacto').value.trim();
    const mensaje         = msgEl ? msgEl.value.trim() : '';

    if (!nombre || !municipio || !numero_contacto || !mensaje) return;

    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Publicando…'; }

    try {
      const res = await fetch(EDGE_FN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON,
          'Authorization': 'Bearer ' + SUPABASE_ANON,
        },
        body: JSON.stringify({ nombre, municipio, numero_contacto, mensaje }),
      });

      const result = await res.json();

      if (!res.ok) {
        showError(result.error || 'Error al publicar. Intenta de nuevo.');
        return;
      }

      form.reset();
      showToast();
    } catch (err) {
      console.error('Error enviando comentario:', err);
      showError('Error de conexión. Verifica tu internet e intenta de nuevo.');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Publicar en el muro'; }
    }
  });

  function showToast() {
    if (!toastEl) return;
    clearTimeout(toastEl._timer);
    toastEl.hidden = false;
    void toastEl.offsetWidth;
    toastEl.classList.add('is-visible');
    if (toastIcon) {
      toastIcon.style.animation = 'none';
      void toastIcon.offsetWidth;
      toastIcon.style.animation = 'checkPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both';
    }
    toastEl._timer = setTimeout(hideToast, 5000);
  }

  function hideToast() {
    if (!toastEl) return;
    clearTimeout(toastEl._timer);
    toastEl.classList.remove('is-visible');
    setTimeout(() => { toastEl.hidden = true; }, 350);
  }

  if (toastEl) {
    toastEl.addEventListener('click', (e) => {
      if (e.target === toastEl) hideToast();
    });
  }

  if (newBtn) {
    newBtn.addEventListener('click', () => {
      hideToast();
      clearError();
    });
  }

  loadPosts();
  subscribeRealtime();
}

// ── FOOTER REVEAL ─────────────────────────────────────────────
function initFooter() {
  const footer = document.querySelector('.site-footer');
  if (!footer) return;
  const sc = document.getElementById('scroll-container');

  ScrollTrigger.create({
    trigger: sc,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      if (self.progress >= 0.84) {
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
  initDarkOverlay();
  initBgPhotoOverlay();
  initHeroFade();
  initHeroBg();
  sections.forEach(setupSectionAnimation);
  initCounters();
  initZoomParallax();
  initGallery();
  initHeader();
  initMuro();
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
