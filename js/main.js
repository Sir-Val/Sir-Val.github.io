/* ================================================================
   main.js — Portfolio JavaScript
   Engr. Val Patrick F. Fabregas, MTA, MEng(c)
   All functionality: navbar, animations, mobile menu, scroll-to-top
   Compatible with GitHub Pages (vanilla JS, no dependencies)
   ================================================================ */

'use strict';

/* ── Wait for DOM to be fully loaded ── */
document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. NAVBAR — Scroll effect (transparent → dark on scroll)
     ============================================================ */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    // Add "scrolled" class once user scrolls past 60px
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // Run once on load in case page is already scrolled


  /* ============================================================
     2. MOBILE HAMBURGER MENU
     ============================================================ */
  const hamburger = document.querySelector('.hamburger');
  const navDrawer  = document.querySelector('.nav-drawer');

  if (hamburger && navDrawer) {
    hamburger.addEventListener('click', () => {
      // Toggle open state for both button and drawer
      hamburger.classList.toggle('open');
      navDrawer.classList.toggle('open');
      // Prevent body scroll when menu is open
      document.body.style.overflow = navDrawer.classList.contains('open') ? 'hidden' : '';
    });

    // Close drawer when any nav link inside it is clicked
    navDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navDrawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }


  /* ============================================================
     3. ACTIVE NAV LINK — Highlights the current section in nav
     ============================================================ */
  const sections     = document.querySelectorAll('section[id]');
  const navLinks     = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 120; // offset for fixed navbar

    sections.forEach(section => {
      const sectionTop    = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId     = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          // Match link href to section id
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();


  /* ============================================================
     4. SCROLL REVEAL — Animate elements into view using
        IntersectionObserver (performant, no scroll event needed)
     ============================================================ */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Once revealed, stop observing to save resources
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,       // trigger when 12% of element is visible
      rootMargin: '0px 0px -40px 0px' // slight offset from bottom
    }
  );

  // Observe all elements that should animate in
  const revealTargets = document.querySelectorAll(
    '.timeline-item, .edu-card, .subject-card, .subjects-page-card'
  );
  revealTargets.forEach(el => revealObserver.observe(el));

  // Stagger animation delays for grid items (edu cards, subject cards)
  document.querySelectorAll('.edu-grid .edu-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.1}s`;
  });
  document.querySelectorAll('.subjects-grid .subject-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.08}s`;
  });
  document.querySelectorAll('.subjects-page-grid .subjects-page-card').forEach((card, i) => {
    card.style.transitionDelay = `${i * 0.08}s`;
  });


  /* ============================================================
     5. SCROLL-TO-TOP BUTTON
     ============================================================ */
  const scrollTopBtn = document.getElementById('scroll-top');

  if (scrollTopBtn) {
    // Show button when user scrolls past 400px
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    // Scroll to top smoothly on click
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ============================================================
     6. SMOOTH SCROLL — For anchor links with # hrefs
        (CSS scroll-behavior handles most cases, but this adds
        navbar offset compensation for fixed header)
     ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const navHeight = navbar ? navbar.offsetHeight : 72;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });


  /* ============================================================
     7. YEAR — Auto-update copyright year in footer
     ============================================================ */
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }


  /* ============================================================
     8. TYPING EFFECT — Animated subtitle in hero section
        Cycles through multiple professional titles
     ============================================================ */
  const typingEl = document.getElementById('typing-text');

  if (typingEl) {
    const phrases = [
      'IT Service Desk Manager',
      'Director of Information Technology',
      'Computer Engineering Educator',
      'IoT Researcher',
      'IT Consultant',
      'Technical Trainer'
    ];

    let phraseIndex  = 0;
    let charIndex    = 0;
    let isDeleting   = false;
    let isPausing    = false;

    function typeLoop() {
      if (isPausing) return;

      const currentPhrase = phrases[phraseIndex];

      if (!isDeleting) {
        // Typing forward
        typingEl.textContent = currentPhrase.slice(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentPhrase.length) {
          // Pause at end of phrase before deleting
          isPausing = true;
          setTimeout(() => {
            isPausing  = false;
            isDeleting = true;
            requestAnimationFrame(typeLoop);
          }, 2200);
          return;
        }
      } else {
        // Deleting
        typingEl.textContent = currentPhrase.slice(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting   = false;
          phraseIndex  = (phraseIndex + 1) % phrases.length;
        }
      }

      // Speed: slower typing, faster deleting
      const delay = isDeleting ? 45 : 90;
      setTimeout(() => requestAnimationFrame(typeLoop), delay);
    }

    // Start typing after a brief delay
    setTimeout(typeLoop, 1200);
  }


  /* ============================================================
     9. STAT COUNTER — Animate numbers in About section stats
        when they scroll into view
     ============================================================ */
  function animateCounter(el, target, duration = 1600) {
    const start     = performance.now();
    const startVal  = 0;

    function update(currentTime) {
      const elapsed  = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic for natural deceleration
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.floor(startVal + (target - startVal) * eased);

      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString(); // ensure exact final value
      }
    }

    requestAnimationFrame(update);
  }

  // Set up IntersectionObserver for stat counters
  const counterEls = document.querySelectorAll('[data-count]');
  if (counterEls.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el     = entry.target;
            const target = parseInt(el.getAttribute('data-count'), 10);
            animateCounter(el, target);
            counterObserver.unobserve(el); // animate only once
          }
        });
      },
      { threshold: 0.5 }
    );

    counterEls.forEach(el => counterObserver.observe(el));
  }

}); // end DOMContentLoaded