/* ============================================
   Rico's Menu — Interactive Scripts
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- Navbar scroll effect ----------
  const navbar = document.querySelector('.navbar');
  const backToTop = document.querySelector('.back-to-top');

  const handleScroll = () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 60);
    backToTop.classList.toggle('visible', scrollY > 600);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ---------- Mobile nav toggle ----------
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navItems = navLinks ? navLinks.querySelectorAll('li') : [];

  const closeMobileMenu = () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
    // Reset li animations so stagger replays on next open
    navItems.forEach(li => {
      li.style.transitionDelay = '0s';
    });
    // Restore stagger delays after the close transition completes
    setTimeout(() => {
      navItems.forEach(li => {
        li.style.transitionDelay = '';
      });
    }, 600);
  };

  if (navToggle) {
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

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  // ---------- Scroll reveal with IntersectionObserver ----------
  const revealElements = document.querySelectorAll(
    '.menu-item, .menu-card, .fiesta-style-item, .filling-chip, .section-header'
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger the animation slightly for sibling items
          const siblings = entry.target.parentElement.querySelectorAll(
            '.menu-item, .menu-card, .fiesta-style-item, .filling-chip'
          );
          const siblingIndex = Array.from(siblings).indexOf(entry.target);
          const delay = Math.min(siblingIndex * 60, 400);

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));

  // ---------- Active nav link on scroll ----------
  const sections = document.querySelectorAll('.menu-section');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach(a => {
            a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '-80px 0px -60% 0px',
    }
  );

  sections.forEach(section => activeObserver.observe(section));

  // ---------- Back to top ----------
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ---------- Smooth appear for section headers ----------
  const headers = document.querySelectorAll('.section-header');
  const headerObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          headerObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.3 }
  );

  headers.forEach(header => {
    header.style.opacity = '0';
    header.style.transform = 'translateY(30px)';
    header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    headerObserver.observe(header);
  });

});
