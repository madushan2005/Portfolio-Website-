/* 01. DOM HELPERS*/
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* 02. BACKGROUND CANVAS — MATRIX RAIN */
function initMatrixRain() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Characters to use in the rain — cybersecurity-flavoured mix
  const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\[]{}|=!@#$%^&*';

  let cols, drops, fontSize;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    fontSize = 13;
    cols     = Math.floor(canvas.width / fontSize);
    drops    = new Array(cols).fill(1);
  }

  function draw() {
    // Slightly transparent black overlay gives the fading trail effect
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    ctx.fillStyle = isDark
      ? 'rgba(5, 10, 14, 0.06)'
      : 'rgba(238, 244, 248, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];

      // Colour: bright at the head, dimmer for the rest
      const brightness = Math.random();
      if (brightness > 0.98) {
        ctx.fillStyle = isDark ? '#ffffff' : '#000000';
      } else if (brightness > 0.85) {
        ctx.fillStyle = isDark ? '#00ff9d' : '#007b50';
      } else {
        ctx.fillStyle = isDark
          ? `rgba(0, 230, 255, ${brightness * 0.5 + 0.05})`
          : `rgba(0, 95, 163, ${brightness * 0.3 + 0.05})`;
      }

      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      // Reset drop to top randomly after it has fallen past the canvas
      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  resize();
  window.addEventListener('resize', resize);

let animId;
  function loop() {
    setTimeout(() => {
      draw();
      animId = requestAnimationFrame(loop);
    }, 50); // <-- Change this number to adjust the speed
  }
  loop();
}

/*03. THEME TOGGLE */
function initThemeToggle() {
  const btn  = $('#themeToggle');
  const icon = $('#themeIcon');
  const html = document.documentElement;

  // Load saved preference
  const saved = localStorage.getItem('portfolio-theme') || 'dark';
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);

    if (theme === 'light') {
      icon.className = 'bx bx-sun';
      btn.setAttribute('title', 'Switch to dark mode');
      btn.setAttribute('aria-label', 'Switch to dark mode');
    } else {
      icon.className = 'bx bx-moon';
      btn.setAttribute('title', 'Switch to light mode');
      btn.setAttribute('aria-label', 'Switch to light mode');
    }
  }
}

/*04. NAVBAR — scroll shrink & active link*/
function initNavbar() {
  const navbar  = $('#navbar');
  const navLinks = $$('.nav-link');
  const sections = $$('section[id]');

  // Add .scrolled class when user scrolls
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveLink();
  }, { passive: true });

  function updateActiveLink() {
    let currentId = 'home';
    const offset  = window.innerHeight * 0.4;

    sections.forEach(sec => {
      if (window.scrollY + offset >= sec.offsetTop) {
        currentId = sec.id;
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === currentId);
    });
  }

  updateActiveLink();
}

/* 05. HAMBURGER MOBILE MENU*/
function initMobileMenu() {
  const btn   = $('#hamburger');
  const menu  = $('#mobileMenu');
  const links = $$('.mobile-link');

  function openMenu()  {
    btn.classList.add('open');
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    btn.classList.remove('open');
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => {
    menu.hidden ? openMenu() : closeMenu();
  });

  // Close when a link is clicked
  links.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) closeMenu();
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !menu.hidden) {
      closeMenu();
      btn.focus();
    }
  });
}

/* 06. TYPING TEXT ANIMATION*/
function initTypingEffect() {
  const el = $('#typingText');
  if (!el) return;

  const strings = [
    'Cybersecurity Enthusiast',
    'Ethical Hacking Learner',
    'CTF Player',
  ];

  let strIndex  = 0;
  let charIndex = 0;
  let isDeleting = false;

  const TYPE_SPEED   = 80;   // ms per character when typing
  const DELETE_SPEED = 40;   // ms per character when deleting
  const PAUSE_FULL   = 2200; // ms pause at full string
  const PAUSE_EMPTY  = 500;  // ms pause at empty string

  function type() {
    const current = strings[strIndex];

    if (!isDeleting) {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        isDeleting = true;
        setTimeout(type, PAUSE_FULL);
        return;
      }
      setTimeout(type, TYPE_SPEED);
    } else {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        strIndex = (strIndex + 1) % strings.length;
        setTimeout(type, PAUSE_EMPTY);
        return;
      }
      setTimeout(type, DELETE_SPEED);
    }
  }

  setTimeout(type, 800); // slight initial delay
}

/*07. REVEAL ON SCROLL*/
function initRevealOnScroll() {
  const options = {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px',
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');

      // Once revealed, also reveal any children inside this section
      if (entry.target.classList.contains('reveal')) {
        $$('.reveal-child', entry.target).forEach((child, i) => {
          setTimeout(() => child.classList.add('visible'), i * 70);
        });
      }

      observer.unobserve(entry.target);
    });
  }, options);

  // Observe all .reveal elements
  $$('.reveal').forEach(el => observer.observe(el));

  // Also observe standalone .reveal-child elements not inside a .reveal parent
  $$('.reveal-child').forEach(el => {
    if (!el.closest('.reveal')) observer.observe(el);
  });
}

/* 08. SMOOTH SCROLL FOR NAV LINKS*/
function initSmoothScroll() {
  // All anchor links pointing to # sections
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      if (link.id === 'decryptBtn') return; // <-- ADD THIS LINE HERE
      const target = $(link.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      const navH   = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 70;
      const offset = target.getBoundingClientRect().top + window.scrollY - navH + 2;

      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
}

/*09. SCROLL-TO-TOP BUTTON*/
function initScrollTop() {
  const btn = $('#scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    btn.hidden = !show;
    btn.classList.toggle('visible', show);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/*10. CONTACT FORM VALIDATION*/
function initContactForm() {
  const form    = $('#contactForm');
  if (!form) return;

  const fields = {
    name:    { input: $('#contactName'),    error: $('#nameError'),    validate: v => v.trim().length >= 2 ? '' : 'Please enter your name (min 2 characters).' },
    email:   { input: $('#contactEmail'),   error: $('#emailError'),   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.' },
    subject: { input: $('#contactSubject'), error: $('#subjectError'), validate: v => v.trim().length >= 3 ? '' : 'Please enter a subject (min 3 characters).' },
    message: { input: $('#contactMessage'), error: $('#messageError'), validate: v => v.trim().length >= 10 ? '' : 'Please write a message (min 10 characters).' },
  };

  const successBox = $('#formSuccess');
  const submitBtn  = $('#submitBtn');

  // Live validation on blur (after first interaction)
  Object.values(fields).forEach(({ input, error, validate }) => {
    input.addEventListener('blur', () => {
      const msg = validate(input.value);
      showFieldError(input, error, msg);
    });
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        const msg = validate(input.value);
        showFieldError(input, error, msg);
      }
    });
  });

  // Submit handler
  form.addEventListener('submit', e => {
    e.preventDefault();

    // Validate all fields
    let valid = true;
    Object.values(fields).forEach(({ input, error, validate }) => {
      const msg = validate(input.value);
      showFieldError(input, error, msg);
      if (msg) valid = false;
    });

    if (!valid) return;

    // Simulate sending — show loading state
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Sending...';
    submitBtn.querySelector('i').className = 'bx bx-loader-alt bx-spin';

    setTimeout(() => {
      // Show success message
      successBox.hidden = false;
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Reset form
      form.reset();
      Object.values(fields).forEach(({ input, error }) => {
        input.classList.remove('error', 'success');
        error.textContent = '';
      });

      // Reset button
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Send Message';
      submitBtn.querySelector('i').className = 'bx bx-send';

      // Auto-hide success message after 6 seconds
      setTimeout(() => { successBox.hidden = true; }, 6000);
    }, 1200); // simulate a small network delay
  });

  /** Helper: display or clear an error on a field */
  function showFieldError(input, errorEl, message) {
    errorEl.textContent = message;
    input.classList.toggle('error', !!message);
  }
}

/* 11. FOOTER YEAR */
function initFooterYear() {
  const el = $('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
}
/* 12. DECRYPT BUTTON ANIMATION */
function initDecryptButton() {
  const btn = $('#decryptBtn');
  const targetSection = $('#writeups');
  if (!btn || !targetSection) return;

  const originalHTML = btn.innerHTML;
  // Characters to use for the scramble effect
  const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\[]{}|=!@#$%^&*';
  const targetText = "ACCESS GRANTED";

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    
    // 1. Switch to the "decrypting" CSS state
    btn.classList.add('is-decrypting');
    btn.classList.remove('btn-primary');
    
    let iterations = 0;
    const maxIterations = 20;

    // 2. The Scramble Loop
    const interval = setInterval(() => {
      let scrambled = targetText.split('').map((char, index) => {
        if (index < iterations / 2) return targetText[index];
        return CHARS[Math.floor(Math.random() * CHARS.length)];
      }).join('');

      // Update button text with an open padlock icon
      btn.innerHTML = `<i class="bx bx-lock-open-alt"></i> ${scrambled}`;
      iterations++;

      // 3. Finished Decrypting
      if (iterations >= maxIterations * 2) {
        clearInterval(interval);
        
        // Switch to the Green "Success" CSS state
        btn.classList.remove('is-decrypting');
        btn.classList.add('is-decrypted');
        btn.innerHTML = `<i class="bx bx-check"></i> ${targetText}`;

        // Wait half a second so the user can read "Access Granted", then scroll
        setTimeout(() => {
          const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 70;
          const offset = targetSection.getBoundingClientRect().top + window.scrollY - navH + 2;
          window.scrollTo({ top: offset, behavior: 'smooth' });

          // Reset the button back to normal after the scroll finishes
          setTimeout(() => {
            btn.classList.remove('is-decrypted');
            btn.classList.add('btn-primary');
            btn.innerHTML = originalHTML;
          }, 1200);
        }, 600);
      }
    }, 50);
  });
}
/*13. INIT */
document.addEventListener('DOMContentLoaded', () => {
  initMatrixRain();
  initThemeToggle();
  initNavbar();
  initMobileMenu();
  initTypingEffect();
  initRevealOnScroll();
  initSmoothScroll();
  initScrollTop();
  initContactForm();
  initFooterYear();
  initDecryptButton();
});
