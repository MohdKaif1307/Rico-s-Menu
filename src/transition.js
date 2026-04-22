/* ============================================
   Rico's Menu — Chapter Transition Engine
   Cinematic GSAP-powered page transitions
   ============================================ */

import gsap from 'gsap';

// Overlay element (created once, reused)
let overlay = null;

/**
 * Ensure the transition overlay DOM exists
 */
function ensureOverlay() {
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.className = 'chapter-transition-overlay';
  overlay.innerHTML = `
    <div class="cto-bg"></div>
    <div class="cto-content">
      <div class="cto-line cto-line-top"></div>
      <div class="cto-roman"></div>
      <div class="cto-label"></div>
      <div class="cto-title"></div>
      <div class="cto-desc"></div>
      <div class="cto-line cto-line-bottom"></div>
    </div>
    <div class="cto-particles"></div>
  `;
  document.body.appendChild(overlay);

  // Create floating particles
  const particleContainer = overlay.querySelector('.cto-particles');
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'cto-particle';
    particleContainer.appendChild(p);
  }

  return overlay;
}

/**
 * Play the cinematic chapter transition
 * @param {object} chapter - chapter data object
 * @param {function} onMidpoint - callback called when old content should be swapped
 * @returns {Promise} resolves when transition is fully complete
 */
export function playChapterTransition(chapter, onMidpoint) {
  return new Promise((resolve) => {
    const el = ensureOverlay();
    const roman = el.querySelector('.cto-roman');
    const label = el.querySelector('.cto-label');
    const title = el.querySelector('.cto-title');
    const desc = el.querySelector('.cto-desc');
    const lineTop = el.querySelector('.cto-line-top');
    const lineBottom = el.querySelector('.cto-line-bottom');
    const particles = el.querySelectorAll('.cto-particle');

    // Set content
    roman.textContent = chapter.roman;
    label.textContent = chapter.label;
    title.textContent = chapter.title;
    desc.textContent = chapter.desc || '';

    // Split title into individual characters for stagger
    const titleChars = chapter.title.split('');
    title.innerHTML = titleChars
      .map(c => `<span class="cto-char">${c === ' ' ? '&nbsp;' : c}</span>`)
      .join('');

    const chars = title.querySelectorAll('.cto-char');

    // Reset
    gsap.set(el, { display: 'flex', opacity: 1 });
    gsap.set(el.querySelector('.cto-bg'), { scaleY: 0 });
    gsap.set([roman, label, title, desc, lineTop, lineBottom], { opacity: 0 });
    gsap.set(roman, { scale: 3, filter: 'blur(20px)' });
    gsap.set(label, { y: -20 });
    gsap.set(chars, { y: 40, opacity: 0, rotationX: -90 });
    gsap.set(desc, { y: 20 });
    gsap.set(lineTop, { scaleX: 0 });
    gsap.set(lineBottom, { scaleX: 0 });

    // Random particle positions
    particles.forEach(p => {
      gsap.set(p, {
        x: gsap.utils.random(-400, 400),
        y: gsap.utils.random(-300, 300),
        opacity: 0,
        scale: gsap.utils.random(0.3, 1.2),
      });
    });

    // Build the timeline
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        gsap.set(el, { display: 'none' });
        resolve();
      },
    });

    tl
      // Phase 1 — overlay slides in
      .to(el.querySelector('.cto-bg'), {
        scaleY: 1,
        duration: 0.5,
        ease: 'power4.inOut',
        transformOrigin: 'top center',
      })

      // Swap content at midpoint
      .call(() => {
        if (onMidpoint) onMidpoint();
      })

      // Phase 2 — particles float in
      .to(particles, {
        opacity: gsap.utils.random(0.05, 0.2),
        duration: 0.6,
        stagger: { each: 0.02, from: 'random' },
      }, '-=0.1')

      // Phase 3 — decorative lines
      .to(lineTop, { opacity: 1, scaleX: 1, duration: 0.5 }, '-=0.4')

      // Phase 4 — roman numeral
      .to(roman, {
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power2.out',
      }, '-=0.3')

      // Phase 5 — label  
      .to(label, { opacity: 1, y: 0, duration: 0.4 }, '-=0.4')

      // Phase 6 — title characters stagger
      .to(chars, {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.5,
        stagger: 0.025,
        ease: 'back.out(1.7)',
      }, '-=0.2')

      // Phase 7 — description
      .to(desc, { opacity: 1, y: 0, duration: 0.4 }, '-=0.2')
      .to(lineBottom, { opacity: 1, scaleX: 1, duration: 0.5 }, '-=0.3')

      // Hold
      .to({}, { duration: 0.6 })

      // Phase 8 — exit
      .to([roman, label, title, desc], {
        opacity: 0,
        y: -30,
        duration: 0.4,
        stagger: 0.05,
      })
      .to([lineTop, lineBottom], { opacity: 0, scaleX: 0, duration: 0.3 }, '-=0.3')
      .to(particles, { opacity: 0, duration: 0.3 }, '-=0.3')
      .to(el.querySelector('.cto-bg'), {
        scaleY: 0,
        duration: 0.5,
        ease: 'power4.inOut',
        transformOrigin: 'bottom center',
      }, '-=0.2');
  });
}

/**
 * Animate page content entrance after transition
 * @param {HTMLElement} container - the page container
 */
export function animatePageEntrance(container) {
  const header = container.querySelector('.section-header');
  const items = container.querySelectorAll('.menu-item, .menu-card, .fiesta-style-item, .filling-chip');
  const subcats = container.querySelectorAll('.subcategory');
  const illustration = container.querySelector('.illustration-overlay');

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  // Illustration fades in
  if (illustration) {
    gsap.set(illustration, { opacity: 0, scale: 1.1 });
    tl.to(illustration, { opacity: 0.12, scale: 1, duration: 1.2 }, 0);
  }

  // Header animate
  if (header) {
    const headerEls = header.children;
    gsap.set(headerEls, { opacity: 0, y: 30 });
    tl.to(headerEls, {
      opacity: 1, y: 0,
      duration: 0.6,
      stagger: 0.1,
    }, 0.1);
  }

  // Subcategories
  if (subcats.length) {
    gsap.set(subcats, { opacity: 0, x: -20 });
    tl.to(subcats, {
      opacity: 1, x: 0,
      duration: 0.5,
      stagger: 0.15,
    }, 0.3);
  }

  // Menu items stagger
  if (items.length) {
    gsap.set(items, { opacity: 0, y: 25 });
    tl.to(items, {
      opacity: 1, y: 0,
      duration: 0.4,
      stagger: 0.04,
    }, 0.4);
  }

  return tl;
}

/**
 * Animate hero entrance
 */
export function animateHeroEntrance(container) {
  const elements = container.querySelectorAll(
    '.hero-ornament, .hero-subtitle-top, .hero h1, .hero-location, .hero-divider, .hero-tagline, .scroll-indicator'
  );

  gsap.set(elements, { opacity: 0, y: 30 });

  gsap.to(elements, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power2.out',
    delay: 0.2,
  });
}

/**
 * Quick fade-out of current page content
 */
export function fadeOutCurrentPage(container) {
  return gsap.to(container, {
    opacity: 0,
    y: -20,
    duration: 0.3,
    ease: 'power2.in',
  });
}
