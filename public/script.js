(() => {
  'use strict';

  /* ---- Loader ---- */
  const loader = document.getElementById('loader');
  const body   = document.body;

  body.classList.add('loading');

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      body.classList.remove('loading');
      initRevealAnimations();
      animateCounters();
      initMusic();
    }, 2000);
  });

  /* ---- Music Control ---- */
  const audio          = document.getElementById('theme-song');
  const muteBtn        = document.getElementById('mute-toggle');
  const muteIcon       = muteBtn.querySelector('.mute-icon');
  const musicPrompt    = document.getElementById('music-prompt');
  const enableMusicBtn = document.getElementById('enable-music-btn');

  let isMuted = false;
  let musicStarted = false;

  function updateMuteUI() {
    if (isMuted) {
      muteIcon.innerHTML = '&#128263;';
      muteBtn.classList.add('muted');
      muteBtn.setAttribute('title', 'Unmute Music');
    } else {
      muteIcon.innerHTML = '&#9819;';
      muteBtn.classList.remove('muted');
      muteBtn.setAttribute('title', 'Mute Music');
    }
  }

  function startMusic() {
    if (musicStarted) return;
    audio.volume = 0.6;
    audio.muted = isMuted;
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        musicStarted = true;
        musicPrompt.classList.add('hidden');
        muteBtn.classList.add('active');
      }).catch(() => {});
    }
  }

  function initMusic() {
    muteBtn.classList.add('active');
    audio.volume = 0.6;
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        musicStarted = true;
      }).catch(() => {
        muteBtn.classList.remove('active');
        musicPrompt.classList.remove('hidden');
      });
    }
  }

  enableMusicBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startMusic();
  });

  document.addEventListener('click', (e) => {
    if (!musicStarted && !musicPrompt.classList.contains('hidden') && !muteBtn.contains(e.target)) {
      startMusic();
    }
  });

  muteBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!musicStarted) {
      isMuted = true;
      updateMuteUI();
      startMusic();
    } else {
      isMuted = !isMuted;
      audio.muted = isMuted;
      updateMuteUI();
    }
  });

  /* ---- Navigation ---- */
  const nav       = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-menu__link');

  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    nav.classList.toggle('scrolled', currentScroll > 80);
    lastScroll = currentScroll;

    updateBackToTop(currentScroll);
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open', isOpen);
    body.style.overflow = isOpen ? 'hidden' : '';
  });

  function closeMobileMenu() {
    navToggle.classList.remove('active');
    mobileMenu.classList.remove('open');
    body.style.overflow = '';
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  /* ---- Smooth Scroll ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const offset = nav.offsetHeight + 20;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---- Reveal on Scroll (Intersection Observer) ---- */
  function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseFloat(entry.target.dataset.delay) || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay * 1000);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  }

  /* ---- Counter Animation ---- */
  function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          let current = 0;
          const step = target / 40;
          const duration = 1500;
          const interval = duration / 40;

          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              current = target;
              clearInterval(timer);
            }
            el.textContent = Math.round(current);
          }, interval);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  /* ---- Custom Cursor ---- */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && cursor && follower) {
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top  = mouseY + 'px';
    });

    function animateFollower() {
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      follower.style.left = followerX + 'px';
      follower.style.top  = followerY + 'px';
      requestAnimationFrame(animateFollower);
    }
    animateFollower();
  }

  /* ---- Back to Top ---- */
  const backToTop = document.getElementById('backToTop');

  function updateBackToTop(scrollY) {
    if (!backToTop) return;
    backToTop.classList.toggle('visible', scrollY > window.innerHeight);
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Parallax on Hero Orbs ---- */
  const orbs = document.querySelectorAll('.hero__orb');

  if (orbs.length && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const max = window.innerHeight;
      if (scrollY > max) return;
      const ratio = scrollY / max;
      orbs.forEach((orb, i) => {
        const speed = (i + 1) * 0.15;
        orb.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }

  /* ---- Link Card Tilt Effect (desktop) ---- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.link-card, .shop-card, .connect-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

})();
