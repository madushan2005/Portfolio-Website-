/* 01. DOM HELPERS */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* 02. MATRIX RAIN */
function initMatrixRain() {
  const canvas = $('#bg-canvas'), ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const CHARS = '01アイウカキクケサシステトナニヌネABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\[]{}!=@#$%&*';
  let cols, drops, size = 13;

  const resize = () => {
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / size); drops = Array(cols).fill(1);
  };

  const draw = () => {
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    ctx.fillStyle = dark ? 'rgba(5, 10, 14, 0.06)' : 'rgba(238, 244, 248, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${size}px "Share Tech Mono", monospace`;

    drops.forEach((y, i) => {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)], b = Math.random();
      ctx.fillStyle = b > 0.98 ? (dark ? '#fff' : '#000') : b > 0.85 ? (dark ? '#00ff9d' : '#007b50') : (dark ? `rgba(0,230,255,${b*0.5+0.05})` : `rgba(0,95,163,${b*0.3+0.05})`);
      ctx.fillText(char, i * size, y * size);
      if (y * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  };
  window.addEventListener('resize', resize); resize();
  setInterval(draw, 50); // Replaced bulky animation frame with simple interval
}

/* 03. THEME TOGGLE */
function initThemeToggle() {
  const btn = $('#themeToggle'), icon = $('#themeIcon'), html = document.documentElement;
  const apply = (t) => {
    html.setAttribute('data-theme', t); localStorage.setItem('theme', t);
    icon.className = t === 'light' ? 'bx bx-sun' : 'bx bx-moon';
  };
  apply(localStorage.getItem('theme') || 'dark');
  btn.addEventListener('click', () => apply(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
}

/* 04. NAVBAR & MOBILE MENU */
function initNavigation() {
  const nav = $('#navbar'), menu = $('#mobileMenu'), btn = $('#hamburger');
  
  // Scroll active states
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    let curr = 'home';
    $$('section[id]').forEach(s => window.scrollY + window.innerHeight * 0.4 >= s.offsetTop && (curr = s.id));
    $$('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.section === curr));
  }, { passive: true });

  // Mobile Toggle
  const toggle = (force) => {
    const open = force !== undefined ? force : menu.hidden;
    btn.classList.toggle('open', open); menu.hidden = !open;
  };
  btn.addEventListener('click', () => toggle());
  $$('.mobile-link').forEach(l => l.addEventListener('click', () => toggle(false)));
  document.addEventListener('click', e => !btn.contains(e.target) && !menu.contains(e.target) && toggle(false));
}

/* 05. TYPING TEXT ANIMATION */
function initTypingEffect() {
  const el = $('#typingText'); if (!el) return;
  const strings = ['Cybersecurity Enthusiast', 'Ethical Hacking Learner', 'CTF Player'];
  let sIdx = 0, cIdx = 0, isDel = false;
  
  const type = () => {
    const cur = strings[sIdx];
    el.textContent = cur.slice(0, cIdx + (isDel ? -1 : 1));
    isDel ? cIdx-- : cIdx++;
    
    if (cIdx === cur.length) { isDel = true; setTimeout(type, 2200); return; }
    if (cIdx === 0) { isDel = false; sIdx = (sIdx + 1) % strings.length; setTimeout(type, 500); return; }
    setTimeout(type, isDel ? 40 : 80);
  };
  setTimeout(type, 800);
}

/* 06. REVEAL & SCROLL ACTIONS */
function initScrollBehaviors() {
  // Intersection Observer for reveals
  const obs = new IntersectionObserver(ents => ents.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    if (e.target.classList.contains('reveal')) $$('.reveal-child', e.target).forEach((c, i) => setTimeout(() => c.classList.add('visible'), i * 70));
    obs.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
  $$('.reveal, .reveal-child:not(.reveal *)').forEach(el => obs.observe(el));

  // Smooth Scroll & Top Button
  $$('a[href^="#"]:not(#decryptBtn)').forEach(l => l.addEventListener('click', e => {
    e.preventDefault();
    const tgt = $(l.getAttribute('href'));
    if (tgt) window.scrollTo({ top: tgt.offsetTop - 68, behavior: 'smooth' });
  }));

  const topBtn = $('#scrollTop');
  if (topBtn) {
    window.addEventListener('scroll', () => { topBtn.hidden = window.scrollY < 400; topBtn.classList.toggle('visible', window.scrollY >= 400); }, {passive: true});
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
}

/* 07. CONTACT FORM */
function initContactForm() {
  const form = $('#contactForm'); if (!form) return;
  const rules = {
    name: v => v.length >= 2 ? '' : 'Min 2 characters.',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Valid email required.',
    subject: v => v.length >= 3 ? '' : 'Min 3 characters.',
    message: v => v.length >= 10 ? '' : 'Min 10 characters.'
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;
    
    Object.keys(rules).forEach(k => {
      const input = $(`#contact${k.charAt(0).toUpperCase() + k.slice(1)}`);
      const msg = rules[k](input.value.trim());
      $(`#${k}Error`).textContent = msg;
      input.classList.toggle('error', !!msg);
      if (msg) valid = false;
    });

    if (!valid) return;
    const btn = $('#submitBtn'), box = $('#formSuccess');
    btn.disabled = true; btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i><span>Sending...</span>';
    
    setTimeout(() => {
      box.hidden = false; form.reset();
      btn.disabled = false; btn.innerHTML = '<i class="bx bx-send"></i><span>Send Message</span>';
      setTimeout(() => box.hidden = true, 6000);
    }, 1200);
  });
}

/* 08. DECRYPT BUTTON ANIMATION */
function initDecryptButton() {
  const btn = $('#decryptBtn'), tgt = $('#writeups');
  if (!btn || !tgt) return;
  const orig = btn.innerHTML, chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/\\[]{}!=@#%&*', text = "ACCESS GRANTED";
  
  btn.addEventListener('click', e => {
    e.preventDefault();
    btn.className = 'btn is-decrypting';
    let i = 0;
    const int = setInterval(() => {
      btn.innerHTML = `<i class="bx bx-lock-open-alt"></i> ` + text.split('').map((c, j) => j < i / 2 ? c : chars[Math.floor(Math.random() * chars.length)]).join('');
      if (++i >= 40) {
        clearInterval(int);
        btn.className = 'btn is-decrypted';
        btn.innerHTML = `<i class="bx bx-check"></i> ${text}`;
        setTimeout(() => {
          window.scrollTo({ top: tgt.offsetTop - 68, behavior: 'smooth' });
          setTimeout(() => { btn.className = 'btn btn-primary'; btn.innerHTML = orig; }, 1200);
        }, 600);
      }
    }, 35);
  });
}

/* 09. INIT */
document.addEventListener('DOMContentLoaded', () => {
  initMatrixRain();
  initThemeToggle();
  initNavigation();      // Combined Nav & Mobile menu
  initTypingEffect();
  initScrollBehaviors(); // Combined Observers & Anchor clicks
  initContactForm();
  initDecryptButton();
  if ($('#footerYear')) $('#footerYear').textContent = new Date().getFullYear();
});