/* ============================================
   Rico's Menu — Main Application
   SPA Router + Page Rendering
   ============================================ */

import { chapters, getChapter, getNextChapter, getPrevChapter } from './chapters.js';
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


function renderHero() {
  return `
    <section class="hero hero-cinematic" id="hero">
      <div class="hero-main">
        <div class="hero-content">
          <p class="hero-subtitle-top">All-Day Café &amp; Dining</p>
          <h1>Rico's</h1>
          <p class="hero-location">Kamla Nagar &middot; New Delhi</p>
          <div class="hero-divider">
            <div class="line"></div><div class="diamond"></div><div class="line"></div>
          </div>
          <p class="hero-tagline">Brunch &middot; Small Plates &middot; Burgers &middot; Pizza &middot; Pasta &middot; Mains &middot; Sundaes</p>
          <div class="hero-actions">
            <a href="#/brunch" class="hero-cta" data-navigate="brunch">Explore the menu <span aria-hidden="true">↗</span></a>
            <a href="#/pizza" class="hero-cta hero-cta-secondary" data-navigate="pizza">Discover the pizzas</a>
          </div>
        </div>
        <div class="hero-visual-stage" data-scroll-depth="0.8" aria-label="Illustrations from Rico's menu">
          <div class="hero-visual-halo"></div>
          <div class="hero-visual-disc"></div>
          <figure class="dish-art dish-art-main" data-tilt>
            <img src="/images/burgers_illus.png" alt="Illustrated burgers from Rico's menu" fetchpriority="high" />
          </figure>
          <figure class="dish-art dish-art-pizza" data-tilt>
            <img src="/images/pizza_illus.png" alt="Illustrated Neapolitan pizza" loading="lazy" />
          </figure>
          <figure class="dish-art dish-art-sundaes" data-tilt>
            <img src="/images/sundaes_illus.png" alt="Illustrated artisan sundaes" loading="lazy" />
          </figure>
          <figure class="dish-art dish-art-pasta" data-tilt>
            <img src="/images/pasta_illus.png" alt="Illustrated pasta dishes" loading="lazy" />
          </figure>
          <span class="visual-stamp">Made for<br />good company</span>
        </div>
      </div>
      <div class="hero-chapter-heading">
        <span>Something for every craving</span>
        <span class="hero-heading-rule"></span>
        <span class="hero-chapter-count">Explore the menu</span>
      </div>
      <div class="hero-chapters">
        ${chapters.map(ch => `
          <a href="#/${ch.id}" class="hero-chapter-card" data-navigate="${ch.id}" data-tilt>
            <span class="hcc-art" data-scroll-depth="0.22"><img src="${ch.illustration}" alt="${ch.title} illustration" loading="lazy" /></span>
            <span class="hcc-title">${ch.title}</span>
            ${ch.desc ? `<span class="hcc-description">${ch.desc}</span>` : ''}
            <span class="hcc-arrow" aria-hidden="true">↗</span>
          </a>
        `).join('')}
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

  return `
    <section class="menu-section page-chapter" id="${chapter.id}" data-section="${chapter.id}">
      <div class="container">
        <div class="chapter-hero">
          <div class="section-header">
            <span class="section-label">From Rico's kitchen</span>
            <h2>${chapter.title}</h2>
            ${chapter.desc ? `<p class="section-desc">${chapter.desc}</p>` : ''}
            <div class="section-divider"><div class="line"></div><div class="dot"></div><div class="line"></div></div>
          </div>
          <div class="chapter-visual" data-scroll-depth="0.9" aria-label="${chapter.title} illustration">
            <div class="chapter-visual-backplate"></div>
            <div class="chapter-visual-shadow"></div>
            <img src="${chapter.chapterImage || chapter.illustration}" alt="${chapter.title} illustrated menu artwork" fetchpriority="high" />
          </div>
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

      <div class="chapter-nav">
        <div class="chapter-nav-inner">
          ${prev ? `
            <a href="#/${prev.id}" class="chapter-nav-btn chapter-nav-prev" data-navigate="${prev.id}">
              <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
              <div class="chapter-nav-text">
                <span class="cnav-label">Previous</span>
                <span class="cnav-title">${prev.title}</span>
              </div>
            </a>
          ` : '<div></div>'}

          ${next ? `
            <a href="#/${next.id}" class="chapter-nav-btn chapter-nav-next" data-navigate="${next.id}">
              <div class="chapter-nav-text">
                <span class="cnav-label">Next</span>
                <span class="cnav-title">${next.title}</span>
              </div>
              <svg viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
            </a>
          ` : `
            <a href="#/" class="chapter-nav-btn chapter-nav-next" data-navigate="home">
              <div class="chapter-nav-text">
                <span class="cnav-label">Explore all</span>
                <span class="cnav-title">Menu home</span>
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

function navigateTo(route) {
  if (route === currentRoute) return;

  isTransitioning = true;
  const appEl = app();
  const requestedId = route === '/' ? null : route.replace(/^\//, '');
  const chapter = requestedId ? getChapter(requestedId) : null;
  const chapterId = chapter ? chapter.id : null;

  closeMobileMenu();
  // Render immediately. No transition overlay, staggered entrance, or artificial wait.
  appEl.innerHTML = chapter ? renderChapter(chapter) : renderHero();
  const root = document.documentElement;
  const oldScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  window.scrollTo(0, 0);
  root.style.scrollBehavior = oldScrollBehavior;

  currentRoute = chapter ? `/${chapter.id}` : '/';
  setSceneChapter(chapterId || 'home');
  setupScrollChoreography(appEl);
  updateActiveNav(chapterId);
  isTransitioning = false;
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
  navToggle.classList.remove('active');
  navLinks.classList.remove('open');
  document.body.style.overflow = '';
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
  navigateTo(initialRoute);
});
