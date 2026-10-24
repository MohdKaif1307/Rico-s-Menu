/* ============================================
   Rico's Menu — Main Application
   SPA Router + Page Rendering
   ============================================ */

import { chapters, getChapter, getNextChapter, getPrevChapter, getChapterIndex } from './chapters.js';
import { playChapterTransition, animatePageEntrance, animateHeroEntrance, fadeOutCurrentPage } from './transition.js';
import gsap from 'gsap';
import { initCinematicScene, setSceneChapter, setupScrollChoreography } from './cinematic-scene.js';

// ── State ──
let currentRoute = null;
let isTransitioning = false;

// ── DOM refs ──
const app = () => document.getElementById('app');
const navLinksContainer = () => document.getElementById('navLinks');

// ── Badge helper ──
function badgeHTML(badge) {
  if (!badge) return '';
  const labels = { veg: 'VEG', nonveg: 'NON-VEG', both: 'VEG / NON-VEG', sizzler: 'SIZZLER', slider: 'SLIDERS' };
  return `<span class="diet-badge ${badge}">${labels[badge] || badge.toUpperCase()}</span>`;
}

// ══════════════════════════════════════════
//  RENDERERS
// ══════════════════════════════════════════


/* ── Lightweight cinematic scene and scroll reveals ───────────────────── */
function mountCinematicScene() {
  if (document.getElementById('scene-canvas')) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'scene-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 700px)').matches;
  const pointer = { x: 0, y: 0 };
  let width = 0, height = 0;

  // Render real 3D forms directly with WebGL, without adding a runtime dependency.
  const gl = canvas.getContext('webgl', { alpha: true, antialias: !small, premultipliedAlpha: false });
  if (!gl) {
    const ctx = canvas.getContext('2d');
    if (!ctx) { canvas.remove(); return; }
    const particles = Array.from({ length: small ? 26 : 44 }, () => ({
      x: Math.random(), y: Math.random(), r: .7 + Math.random() * 1.7, phase: Math.random() * 6.28
    }));
    function resizeFallback() {
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
      width = window.innerWidth; height = window.innerHeight;
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFallback(0);
    }
    function drawFallback(time) {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(231, 199, 111, ' + (.18 + (Math.sin(time * .001 + p.phase) + 1) * .14) + ')';
        ctx.arc(p.x * width + pointer.x * 12, p.y * height + pointer.y * 10, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      if (!reduced) window.requestAnimationFrame(drawFallback);
    }
    resizeFallback();
    window.addEventListener('resize', resizeFallback, { passive: true });
    if (!reduced) window.addEventListener('pointermove', e => {
      pointer.x = e.clientX / Math.max(1, width) - .5;
      pointer.y = e.clientY / Math.max(1, height) - .5;
    }, { passive: true });
    return;
  }

  const vertexSource = [
    'attribute vec3 aPosition;',
    'attribute vec3 aNormal;',
    'uniform mat4 uModel;',
    'uniform mat4 uMvp;',
    'varying vec3 vNormal;',
    'varying vec3 vWorldPosition;',
    'void main(){',
    '  vec4 world = uModel * vec4(aPosition, 1.0);',
    '  vWorldPosition = world.xyz;',
    '  vNormal = mat3(uModel) * aNormal;',
    '  gl_Position = uMvp * vec4(aPosition, 1.0);',
    '}'
  ].join('\n');
  const fragmentSource = [
    'precision mediump float;',
    'uniform vec3 uColor;',
    'uniform vec3 uLightPosition;',
    'uniform float uOpacity;',
    'varying vec3 vNormal;',
    'varying vec3 vWorldPosition;',
    'void main(){',
    '  vec3 N = normalize(vNormal);',
    '  vec3 L = normalize(uLightPosition - vWorldPosition);',
    '  vec3 V = normalize(vec3(0.0, 0.0, 8.0) - vWorldPosition);',
    '  float diffuse = max(dot(N, L), 0.0);',
    '  float rim = pow(1.0 - max(dot(N, V), 0.0), 2.2);',
    '  float specular = pow(max(dot(reflect(-L, N), V), 0.0), 24.0);',
    '  vec3 color = uColor * (0.24 + diffuse * 0.70) + vec3(0.20, 0.15, 0.055) * rim + vec3(0.28, 0.23, 0.12) * specular;',
    '  gl_FragColor = vec4(color, uOpacity * (0.76 + rim * 0.24));',
    '}'
  ].join('\n');

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn('Rico’s 3D scene shader unavailable:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  const vs = compileShader(gl.VERTEX_SHADER, vertexSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vs || !fs) { canvas.remove(); return; }
  const program = gl.createProgram();
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('Rico’s 3D scene could not link:', gl.getProgramInfoLog(program));
    canvas.remove(); return;
  }
  gl.useProgram(program);
  const loc = {
    position: gl.getAttribLocation(program, 'aPosition'),
    normal: gl.getAttribLocation(program, 'aNormal'),
    model: gl.getUniformLocation(program, 'uModel'),
    mvp: gl.getUniformLocation(program, 'uMvp'),
    color: gl.getUniformLocation(program, 'uColor'),
    light: gl.getUniformLocation(program, 'uLightPosition'),
    opacity: gl.getUniformLocation(program, 'uOpacity')
  };

  function createMesh(positions, normals, indices) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    return { positionBuffer, normalBuffer, indexBuffer, count: indices.length };
  }
  function makeSphere(rows, cols) {
    const p = [], n = [], ix = [];
    for (let row = 0; row <= rows; row++) {
      const v = row / rows, theta = v * Math.PI;
      for (let col = 0; col <= cols; col++) {
        const u = col / cols, phi = u * Math.PI * 2;
        const x = Math.sin(theta) * Math.cos(phi), y = Math.cos(theta), z = Math.sin(theta) * Math.sin(phi);
        p.push(x, y, z); n.push(x, y, z);
      }
    }
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const a = row * (cols + 1) + col, b = a + cols + 1;
      ix.push(a, b, a + 1, b, b + 1, a + 1);
    }
    return createMesh(p, n, ix);
  }
  function makeTorus(rows, cols, innerRadius) {
    const p = [], n = [], ix = [], major = 1;
    for (let row = 0; row <= rows; row++) {
      const u = row / rows * Math.PI * 2;
      for (let col = 0; col <= cols; col++) {
        const v = col / cols * Math.PI * 2;
        const cosV = Math.cos(v), sinV = Math.sin(v), cosU = Math.cos(u), sinU = Math.sin(u);
        p.push((major + innerRadius * cosV) * cosU, (major + innerRadius * cosV) * sinU, innerRadius * sinV);
        n.push(cosV * cosU, cosV * sinU, sinV);
      }
    }
    for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
      const a = row * (cols + 1) + col, b = a + cols + 1;
      ix.push(a, a + 1, b, a + 1, b + 1, b);
    }
    return createMesh(p, n, ix);
  }
  function identity() {
    const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m;
  }
  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
      out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return out;
  }
  function translation(x, y, z) { const m = identity(); m[12] = x; m[13] = y; m[14] = z; return m; }
  function scaleMatrix(x, y, z) { const m = identity(); m[0] = x; m[5] = y; m[10] = z; return m; }
  function rotationX(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
  function rotationY(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
  function rotationZ(a) { const m = identity(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; }
  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far), m = new Float32Array(16);
    m[0] = f / aspect; m[5] = f; m[10] = (far + near) * nf; m[11] = -1; m[14] = (2 * far * near) * nf;
    return m;
  }
  function modelMatrix(item, time, scrollRatio) {
    const drift = reduced ? 0 : Math.sin(time * item.speed + item.phase);
    const rx = item.rotation[0] + (reduced ? 0 : time * item.spinX);
    const ry = item.rotation[1] + (reduced ? 0 : time * item.spinY);
    const rz = item.rotation[2] + (reduced ? 0 : time * item.spinZ);
    const tx = item.position[0] + pointer.x * .23 * item.depth;
    const ty = item.position[1] + drift * .16 + pointer.y * .20 * item.depth - scrollRatio * .28 * item.depth;
    let m = translation(tx, ty, item.position[2]);
    m = multiply(m, rotationZ(rz));
    m = multiply(m, rotationY(ry));
    m = multiply(m, rotationX(rx));
    return multiply(m, scaleMatrix(item.scale[0], item.scale[1], item.scale[2]));
  }

  const sphere = makeSphere(16, 24);
  const torus = makeTorus(18, 48, .19);
  const objects = [
    { mesh: torus, position: [-4.6, 1.35, -.8], scale: [.77,.77,.77], rotation: [.45,.15,.15], color: [.82,.60,.25], opacity:.48, speed:.65, phase:.2, spinX:.09, spinY:.12, spinZ:.18, depth:1.0 },
    { mesh: sphere, position: [4.8, -.9, -1.3], scale: [.70,.70,.70], rotation: [.1,.2,.0], color: [.37,.80,.63], opacity:.35, speed:.8, phase:1.4, spinX:.05, spinY:.13, spinZ:.04, depth:.8 },
    { mesh: sphere, position: [-4.3, -1.5, -.2], scale: [.39,.39,.39], rotation: [.3,.1,.0], color: [.91,.74,.39], opacity:.45, speed:.9, phase:2.1, spinX:.12, spinY:.1, spinZ:.08, depth:1.1 },
    { mesh: torus, position: [4.45, 1.55, -1.0], scale: [.55,.55,.55], rotation: [1.08,.2,.45], color: [.57,.81,.64], opacity:.33, speed:.72, phase:2.5, spinX:.1, spinY:.15, spinZ:.08, depth:.7 },
    { mesh: sphere, position: [3.65, 2.05, -2.0], scale: [.24,.24,.24], rotation: [0,0,0], color: [.96,.82,.48], opacity:.55, speed:1.1, phase:3.2, spinX:.1, spinY:.2, spinZ:.1, depth:.6 },
    { mesh: torus, position: [-3.9, .1, -1.4], scale: [.34,.34,.34], rotation: [1.2,.4,.2], color: [.57,.80,.64], opacity:.35, speed:.8, phase:4.1, spinX:.14, spinY:.09, spinZ:.2, depth:.8 }
  ];
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.7);
    width = window.innerWidth; height = window.innerHeight;
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (reduced) window.requestAnimationFrame(render);
  }
  function render(timestamp) {
    const time = reduced ? 0 : timestamp * .001;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(program);
    const view = translation(0, 0, -8);
    const vp = multiply(perspective(Math.PI / 3, width / Math.max(1, height), .1, 100), view);
    gl.uniform3f(loc.light, -.8, 2.8, 5.5);
    const scrollRatio = Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - height));
    objects.forEach(item => {
      const model = modelMatrix(item, time, scrollRatio);
      gl.uniformMatrix4fv(loc.model, false, model);
      gl.uniformMatrix4fv(loc.mvp, false, multiply(vp, model));
      gl.uniform3fv(loc.color, new Float32Array(item.color));
      gl.uniform1f(loc.opacity, item.opacity);
      gl.bindBuffer(gl.ARRAY_BUFFER, item.mesh.positionBuffer);
      gl.enableVertexAttribArray(loc.position);
      gl.vertexAttribPointer(loc.position, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, item.mesh.normalBuffer);
      gl.enableVertexAttribArray(loc.normal);
      gl.vertexAttribPointer(loc.normal, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, item.mesh.indexBuffer);
      gl.drawElements(gl.TRIANGLES, item.mesh.count, gl.UNSIGNED_SHORT, 0);
    });
    if (!reduced) window.requestAnimationFrame(render);
  }
  resize();
  window.requestAnimationFrame(render);
  window.addEventListener('resize', resize, { passive: true });
  if (!reduced) window.addEventListener('pointermove', e => {
    pointer.x = e.clientX / Math.max(1, width) - .5;
    pointer.y = e.clientY / Math.max(1, height) - .5;
  }, { passive: true });
  else window.addEventListener('scroll', () => window.requestAnimationFrame(render), { passive: true });
}

function applyChapterParallax(){
 if(chapterParallaxHandler) window.removeEventListener('scroll', chapterParallaxHandler);
 chapterParallaxHandler = null;
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
 chapterParallaxHandler = () => {
  const header = document.querySelector('.page-chapter .section-header');
  if(!header) return;
  const rect=header.getBoundingClientRect();
  const progress=Math.max(-1,Math.min(1,(window.innerHeight*.45-rect.top)/Math.max(1,window.innerHeight)));
  header.style.transform='translate3d(0,'+(-progress*9).toFixed(1)+'px,0)';
 };
 window.addEventListener('scroll', chapterParallaxHandler, {passive:true});
 chapterParallaxHandler();
}

function renderHero() {
  return `
    <section class="hero hero-cinematic" id="hero">
      <div class="hero-main">
      <div class="hero-content">
        <div class="hero-ornament">
          <span></span>
          <svg viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
          <span></span>
        </div>
        <p class="hero-subtitle-top">All-Day Café &amp; Dining</p>
        <h1>Rico's</h1>
        <p class="hero-location">Kamla Nagar &middot; New Delhi</p>
        <div class="hero-divider">
          <div class="line"></div>
          <div class="diamond"></div>
          <div class="line"></div>
        </div>
        <p class="hero-tagline">Brunch &middot; Small Plates &middot; Burgers &middot; Pizza &middot; Pasta &middot; Mains &middot; Sundaes</p>
      </div>
      <div class="hero-book-scene" aria-label="Rico's illustrated menu cover">
        <div class="book-orbit book-orbit-one"></div>
        <div class="book-orbit book-orbit-two"></div>
        <div class="book-orbit book-orbit-three"></div>
        <div class="book-glow"></div>
        <div class="hero-book-shadow"></div>
        <div class="hero-book" data-tilt>
          <div class="book-edge"></div>
          <img src="/images/cover.png" alt="Rico's All-Day Café & Dining illustrated menu cover" class="hero-book-cover" fetchpriority="high" />
          <div class="book-glint"></div>
        </div>
        <div class="book-caption"><span>THE RICO'S EXPERIENCE</span><i>01 — 08</i></div>
      </div>
      </div>
      <div class="hero-chapter-heading">
        <span>THE MENU, IN CHAPTERS</span>
        <span class="hero-heading-rule"></span>
        <span class="hero-chapter-count">08 CHAPTERS <b>·</b> ONE TABLE</span>
      </div>
      <div class="hero-chapters">
        ${chapters.map(ch => `
          <a href="#/${ch.id}" class="hero-chapter-card" data-navigate="${ch.id}" data-tilt>
            <span class="hcc-art"><img src="${ch.illustration}" alt="" loading="lazy" /></span>
            <span class="hcc-roman">${ch.roman}</span>
            <span class="hcc-title">${ch.title}</span>
          </a>
        `).join('')}
      </div>
      <div class="scroll-indicator">
        <span>Explore Menu</span>
        <div class="scroll-line"></div>
      </div>
    </section>
  `;
}

function renderMenuItems(items, layout) {
  if (layout === 'cards') {
    return `
      <div class="cards-grid">
        ${items.map(item => `
          <div class="menu-card" data-tilt>
            ${item.label ? `<div class="card-label">${item.label}</div>` : ''}
            <div class="card-title">${item.name} ${badgeHTML(item.badge)}</div>
            <div class="card-desc">${item.desc}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (layout === 'fiesta') {
    return `
      <div class="fiesta-styles">
        ${items.map(item => `
          <div class="fiesta-style-item" data-tilt${item.fullWidth ? ' style="grid-column: 1 / -1;"' : ''}>
            <h4>${item.name}</h4>
            <p>${item.desc}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (layout === 'chips') {
    return `
      <div class="fillings-grid">
        ${items.map(item => `
          <div class="filling-chip">${item.name} ${badgeHTML(item.badge)}</div>
        `).join('')}
      </div>
    `;
  }

  if (layout === 'grid') {
    // Split items into two columns
    const mid = Math.ceil(items.length / 2);
    const col1 = items.slice(0, mid);
    const col2 = items.slice(mid);
    return `
      <div class="menu-grid">
        <div class="menu-items">
          ${col1.map(item => `
            <div class="menu-item">
              <div class="menu-item-name">${item.name} ${badgeHTML(item.badge)}</div>
              <div class="menu-item-desc">${item.desc}</div>
            </div>
          `).join('')}
        </div>
        <div class="menu-items">
          ${col2.map(item => `
            <div class="menu-item">
              <div class="menu-item-name">${item.name} ${badgeHTML(item.badge)}</div>
              <div class="menu-item-desc">${item.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Default: list
  return `
    <div class="menu-items">
      ${items.map(item => `
        <div class="menu-item">
          <div class="menu-item-name">${item.name} ${badgeHTML(item.badge)}</div>
          <div class="menu-item-desc">${item.desc}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderSubcategory(sub) {
  const header = sub.name
    ? `<div class="subcategory"><h3>${sub.name}</h3><div class="sub-line"></div></div>`
    : '';
  return header + renderMenuItems(sub.items, sub.layout);
}

/**
 * Render subcategories, grouping consecutive ones with matching gridGroup
 * into a side-by-side menu-grid layout.
 */
function renderSubcategories(subs) {
  let html = '';
  let i = 0;

  while (i < subs.length) {
    const sub = subs[i];

    if (sub.gridGroup) {
      // Collect all consecutive subs with the same gridGroup
      const group = [];
      const groupId = sub.gridGroup;
      while (i < subs.length && subs[i].gridGroup === groupId) {
        group.push(subs[i]);
        i++;
      }
      // Render them inside a menu-grid wrapper
      html += `<div class="menu-grid">`;
      group.forEach(g => {
        html += `<div>${renderSubcategory(g)}</div>`;
      });
      html += `</div>`;
    } else {
      html += renderSubcategory(sub);
      i++;
    }
  }

  return html;
}

function renderChapter(chapter) {
  const prev = getPrevChapter(chapter.id);
  const next = getNextChapter(chapter.id);
  const idx = getChapterIndex(chapter.id);

  return `
    <section class="menu-section page-chapter" id="${chapter.id}" data-section="${chapter.id}">
      <img src="${chapter.illustration}" alt="${chapter.id} illustration" class="illustration-overlay" loading="lazy" />
      <div class="container">
        <div class="section-header">
          <span class="section-label">${chapter.label}</span>
          <h2>${chapter.title}</h2>
          ${chapter.desc ? `<p class="section-desc">${chapter.desc}</p>` : ''}
          <div class="section-divider"><div class="line"></div><div class="dot"></div><div class="line"></div></div>
        </div>

        ${chapter.pizzaBadge ? `
          <div class="pizza-badge-wrapper">
            <div class="pizza-badge">
              ${chapter.pizzaBadge.map(l => `<span>${l}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${renderSubcategories(chapter.subcategories)}
      </div>

      <!-- Chapter Navigation -->
      <div class="chapter-nav">
        <div class="chapter-nav-inner">
          ${prev ? `
            <a href="#/${prev.id}" class="chapter-nav-btn chapter-nav-prev" data-navigate="${prev.id}">
              <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
              <div class="chapter-nav-text">
                <span class="cnav-label">${prev.roman} — Previous</span>
                <span class="cnav-title">${prev.title}</span>
              </div>
            </a>
          ` : '<div></div>'}

          <div class="chapter-dots">
            ${chapters.map((ch, i) => `
              <a href="#/${ch.id}" class="chapter-dot ${i === idx ? 'active' : ''}" data-navigate="${ch.id}" title="${ch.title}"></a>
            `).join('')}
          </div>

          ${next ? `
            <a href="#/${next.id}" class="chapter-nav-btn chapter-nav-next" data-navigate="${next.id}">
              <div class="chapter-nav-text">
                <span class="cnav-label">Next — ${next.roman}</span>
                <span class="cnav-title">${next.title}</span>
              </div>
              <svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
            </a>
          ` : `
            <a href="#/" class="chapter-nav-btn chapter-nav-next" data-navigate="home">
              <div class="chapter-nav-text">
                <span class="cnav-label">Back to</span>
                <span class="cnav-title">Home</span>
              </div>
              <svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
            </a>
          `}
        </div>
      </div>
    </section>
  `;
}

// ══════════════════════════════════════════
//  NAVIGATION
// ══════════════════════════════════════════

function updateActiveNav(chapterId) {
  const links = document.querySelectorAll('.nav-links a');
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (chapterId && href === `#/${chapterId}`) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

async function navigateTo(route, skipTransition = false) {
  if (isTransitioning) return;
  if (route === currentRoute) return;

  isTransitioning = true;
  const appEl = app();
  const chapterId = route === '/' ? null : route.replace('/', '');
  const chapter = chapterId ? getChapter(chapterId) : null;

  // Close mobile menu if open
  closeMobileMenu();

  if (chapter && !skipTransition && currentRoute !== null) {
    // Play cinematic transition for chapter pages
    await playChapterTransition(chapter, () => {
      appEl.innerHTML = renderChapter(chapter);
      window.scrollTo(0, 0);
    });
    animatePageEntrance(appEl);
  } else if (chapter && skipTransition) {
    // Direct load (page refresh on a chapter route)
    appEl.innerHTML = renderChapter(chapter);
    window.scrollTo(0, 0);
    animatePageEntrance(appEl);
  } else {
    // Hero page
    if (currentRoute !== null && appEl.innerHTML.trim()) {
      await fadeOutCurrentPage(appEl);
    }
    appEl.innerHTML = renderHero();
    gsap.set(appEl, { opacity: 1, y: 0 });
    window.scrollTo(0, 0);
    animateHeroEntrance(appEl);
    animateHeroCards(appEl);
  }

  currentRoute = route;
  setSceneChapter(chapterId || 'home');
  setupScrollChoreography(appEl);
  if (window.__ricoScanReveals) window.__ricoScanReveals();
  if (chapter) applyChapterParallax();
  updateActiveNav(chapterId);
  isTransitioning = false;
}

function animateHeroCards(container) {
  const cards = container.querySelectorAll('.hero-chapter-card');
  gsap.set(cards, { opacity: 0, y: 40, scale: 0.95 });
  gsap.to(cards, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.6,
    stagger: 0.06,
    ease: 'power2.out',
    delay: 0.8,
  });
}

// ══════════════════════════════════════════
//  ROUTER
// ══════════════════════════════════════════

function getRouteFromHash() {
  const hash = window.location.hash || '#/';
  return hash.slice(1) || '/'; // Remove # prefix
}

function handleRouteChange() {
  const route = getRouteFromHash();
  navigateTo(route);
}

// ══════════════════════════════════════════
//  MOBILE NAV
// ══════════════════════════════════════════

function closeMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!navToggle || !navLinks) return;

  const navItems = navLinks.querySelectorAll('li');

  navToggle.classList.remove('active');
  navLinks.classList.remove('open');
  document.body.style.overflow = '';

  navItems.forEach(li => {
    li.style.transitionDelay = '0s';
  });
  setTimeout(() => {
    navItems.forEach(li => {
      li.style.transitionDelay = '';
    });
  }, 600);
}

function setupMobileNav() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      navToggle.classList.add('active');
      navLinks.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMobileMenu();
    }
  });
}

// ══════════════════════════════════════════
//  EVENT DELEGATION
// ══════════════════════════════════════════

function setupEventDelegation() {
  // Handle all navigations via delegation (for dynamically rendered links)
  document.addEventListener('click', (e) => {
    const navLink = e.target.closest('[data-navigate]');
    if (navLink) {
      e.preventDefault();
      const target = navLink.dataset.navigate;
      if (target === 'home') {
        window.location.hash = '#/';
      } else {
        window.location.hash = `#/${target}`;
      }
      return;
    }

    // Hero scroll indicator
    const scrollIndicator = e.target.closest('.scroll-indicator');
    if (scrollIndicator) {
      const heroChapters = document.querySelector('.hero-chapters');
      if (heroChapters) {
        heroChapters.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
}

// ══════════════════════════════════════════
//  NAVBAR SCROLL
// ══════════════════════════════════════════

function setupNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');

  const handleScroll = () => {
    const scrollY = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', scrollY > 60);
    if (backToTop) backToTop.classList.toggle('visible', scrollY > 600);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ══════════════════════════════════════════
//  KEYBOARD NAV
// ══════════════════════════════════════════

function setupKeyboardNav() {
  document.addEventListener('keydown', (e) => {
    if (isTransitioning) return;
    const route = getRouteFromHash();
    const chapterId = route === '/' ? null : route.replace('/', '');

    if (!chapterId) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      const next = getNextChapter(chapterId);
      if (next) {
        e.preventDefault();
        window.location.hash = `#/${next.id}`;
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      const prev = getPrevChapter(chapterId);
      if (prev) {
        e.preventDefault();
        window.location.hash = `#/${prev.id}`;
      }
    }
  });
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  initCinematicScene();
  setupMobileNav();
  setupEventDelegation();
  setupNavbarScroll();
  setupKeyboardNav();

  // Listen for hash changes
  window.addEventListener('hashchange', handleRouteChange);

  // Initial route
  const initialRoute = getRouteFromHash();
  navigateTo(initialRoute, true);
});
