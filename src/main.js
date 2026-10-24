/* ============================================
   Rico's Menu — Main Application
   SPA Router + Page Rendering
   ============================================ */

import { chapters, getChapter, getNextChapter, getPrevChapter, getChapterIndex } from './chapters.js';
import { playChapterTransition, animatePageEntrance, animateHeroEntrance, fadeOutCurrentPage } from './transition.js';
import gsap from 'gsap';

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
  canvas.id = 'scene-canvas'; canvas.setAttribute('aria-hidden', 'true'); document.body.prepend(canvas);
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) { canvas.remove(); return; }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 700px)').matches;
  let width=0,height=0;
  const pointer={x:.5,y:.5};
  const particles=Array.from({length:small?34:66},(_,i)=>({x:Math.random(),y:Math.random(),z:.2+Math.random()*.8,radius:.5+Math.random()*1.6,phase:Math.random()*Math.PI*2,gold:i%5===0}));
  function resize(){const dpr=Math.min(window.devicePixelRatio||1,small?1.25:1.7);width=window.innerWidth;height=window.innerHeight;canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=width+'px';canvas.style.height=height+'px';context.setTransform(dpr,0,0,dpr,0,0);}
  function draw(time=0){
    context.clearRect(0,0,width,height);
    const scrollShift=Math.max(-1,Math.min(1,window.scrollY/Math.max(1,document.documentElement.scrollHeight-height)));
    for(const p of particles){
      const x=(((p.x*width+(pointer.x-.5)*20*p.z+Math.sin((reduced?0:time*.000018)+p.phase)*12*p.z)%width)+width)%width;
      const y=(((p.y*height+(pointer.y-.5)*16*p.z-scrollShift*28*p.z)%height)+height)%height;
      const pulse=reduced?.5:.35+(Math.sin(time*.001+p.phase)+1)*.3;
      context.beginPath();context.fillStyle=p.gold?'rgba(237,207,124,'+(pulse*.7)+')':'rgba(207,237,216,'+(pulse*.35)+')';context.arc(x,y,p.radius*p.z,0,Math.PI*2);context.fill();
    }
    const glowX=width*(.5+(pointer.x-.5)*.12),glowY=height*(.28+(pointer.y-.5)*.08-scrollShift*.08);
    const glow=context.createRadialGradient(glowX,glowY,0,glowX,glowY,Math.max(width,height)*.42);glow.addColorStop(0,'rgba(222,186,93,.065)');glow.addColorStop(1,'rgba(222,186,93,0)');context.fillStyle=glow;context.fillRect(0,0,width,height);
    if(!reduced) window.requestAnimationFrame(draw);
  }
  resize();draw();window.addEventListener('resize',resize,{passive:true});
  if(!reduced) window.addEventListener('pointermove',e=>{pointer.x=e.clientX/Math.max(1,width);pointer.y=e.clientY/Math.max(1,height);},{passive:true});
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');observer.unobserve(entry.target);}}),{threshold:.12});
  window.__ricoRevealObserver=observer;
  window.__ricoScanReveals=function(){if(reduced)return;document.querySelectorAll('.page-chapter .section-header,.page-chapter .subcategory,.page-chapter .menu-card,.page-chapter .menu-item,.page-chapter .fiesta-style-item,.page-chapter .filling-chip').forEach(el=>{if(el.dataset.reveal==='true')return;el.dataset.reveal='true';observer.observe(el);});};
}
function applyChapterParallax(){
 const header=document.querySelector('.page-chapter .section-header');
 if(!header||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const update=()=>{const rect=header.getBoundingClientRect();const progress=Math.max(-1,Math.min(1,(window.innerHeight*.45-rect.top)/Math.max(1,window.innerHeight)));header.style.transform='translate3d(0,'+(-progress*9).toFixed(1)+'px,0)';};
 window.addEventListener('scroll',update,{passive:true});update();
}

function renderHero() {
  return `
    <section class="hero" id="hero">
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
      <div class="hero-chapters">
        ${chapters.map(ch => `
          <a href="#/${ch.id}" class="hero-chapter-card" data-navigate="${ch.id}">
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
          <div class="menu-card">
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
          <div class="fiesta-style-item"${item.fullWidth ? ' style="grid-column: 1 / -1;"' : ''}>
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
  mountCinematicScene();
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
