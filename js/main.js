/* ═══════════════════════════════════════════════════════════════
   0xBR3N — main.js  (v3 — Oryzo × hacker, perf-tuned)
   ═══════════════════════════════════════════════════════════════ */

const isCoarse = matchMedia('(pointer: coarse)').matches;
const isMobile = window.innerWidth <= 900 || isCoarse;
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── 1. Matrix Rain — rAF + offscreen-aware ─────────────────── */
(function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  if (prefersReducedMotion) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  let w = 0, h = 0;
  let cols = 0, drops = [];
  let lastT = 0;

  const fontSize = isMobile ? 16 : 13;
  const colSkip  = isMobile ? 2 : 1;
  const tickMs   = isMobile ? 100 : 55;
  const chars = '01BRENDONCVE!@#$%<>{}ABCDEFアイウカキクサシス';

  function resize() {
    w = canvas.width  = Math.floor(window.innerWidth  * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width  = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.floor(window.innerWidth / (fontSize * colSkip));
    drops = Array.from({ length: cols }, () => Math.random() * -50 | 0);
  }
  resize();
  window.addEventListener('resize', debounce(resize, 200), { passive: true });

  let paused = false;
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });

  function step(t) {
    requestAnimationFrame(step);
    if (paused) return;
    if (t - lastT < tickMs) return;
    lastT = t;

    ctx.fillStyle = 'rgba(10,12,16,0.075)';
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.font = `${fontSize}px 'JetBrains Mono', 'Share Tech Mono', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[(Math.random() * chars.length) | 0];
      ctx.fillStyle = i % 5 === 0 ? '#00ff88' : 'rgba(0,255,136,0.42)';
      ctx.fillText(char, i * fontSize * colSkip, drops[i] * fontSize);
      if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  requestAnimationFrame(step);
})();


/* ── 2. Custom Cursor (desktop only) ────────────────────────── */
(function initCursor() {
  if (isMobile) return;
  const cursor = document.getElementById('cursor');
  const trail  = document.getElementById('cursor-trail');
  if (!cursor || !trail) return;

  let mx = 0, my = 0, tx = 0, ty = 0;
  let rafId = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%,-50%)`;
    if (!rafId) rafId = requestAnimationFrame(tick);
  }, { passive: true });

  function tick() {
    tx += (mx - tx) * 0.18;
    ty += (my - ty) * 0.18;
    trail.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%,-50%)`;
    if (Math.abs(mx - tx) < 0.3 && Math.abs(my - ty) < 0.3) { rafId = 0; return; }
    rafId = requestAnimationFrame(tick);
  }

  const hoverSel = 'a, button, .cve-card, .post-card, .tool-card, .cert-card, .filter-btn, .skill-tag';
  document.querySelectorAll(hoverSel).forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = cursor.style.height = '16px';
      trail.style.width = trail.style.height = '44px';
      trail.style.borderColor = 'rgba(0,255,136,0.75)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = cursor.style.height = '8px';
      trail.style.width = trail.style.height = '32px';
      trail.style.borderColor = 'rgba(0,255,136,0.45)';
    });
  });
})();


/* ── 3. Nav scroll + hamburger ──────────────────────────────── */
(function initNav() {
  const nav       = document.getElementById('nav');
  const burger    = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!nav) return;

  let lastY = 0;
  let ticking = false;
  window.addEventListener('scroll', () => {
    lastY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', lastY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }
})();

function closeMobileNav() {
  const nav    = document.getElementById('mobile-nav');
  const burger = document.getElementById('nav-hamburger');
  if (nav)    nav.classList.remove('open');
  if (burger) {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  document.body.style.overflow = '';
}


/* ── 4. Live hacker terminal ────────────────────────────────── */
(function initTerminal() {
  const body = document.getElementById('terminal-body');
  if (!body) return;

  // Realistic, looping pentest "scene" — feels like watching an op
  const script = [
    { p: 'nmap -sV -sC 10.10.14.27' },
    { o: 'Starting Nmap 7.94 ( https://nmap.org )' },
    { o: 'Nmap scan report for target.lab' },
    { o: 'PORT     STATE SERVICE  VERSION' },
    { o: '22/tcp   open  ssh      OpenSSH 8.4p1' },
    { o: '80/tcp   open  http     nginx 1.18.0' },
    { o: '445/tcp  open  smb      Samba 4.13.13', cls: 'warn' },
    { o: '8080/tcp open  http     Jetty 9.4.39' },
    { p: 'gobuster dir -u http://target.lab -w wordlist.txt' },
    { o: '/admin               (Status: 401)' },
    { o: '/media/upload        (Status: 200)', cls: 'warn' },
    { o: '/api/v1/users        (Status: 200)' },
    { p: 'curl -X POST http://target.lab/media/upload \\\n          -F "f=@shell.php"' },
    { o: '{"ok":true,"path":"/uploads/shell.php"}', cls: 'suc' },
    { p: 'curl http://target.lab/uploads/shell.php?c=id' },
    { o: 'uid=0(root) gid=0(root) groups=0(root)', cls: 'suc' },
    { p: 'echo "[CVE-2024-40125] CRITICAL · 9.8 — full admin RCE"', cls: 'cmd' },
    { o: '[+] payload deployed · session established', cls: 'suc' },
    { p: 'whoami && hostname' },
    { o: 'root', cls: 'suc' },
    { o: 'target.lab', cls: 'suc' },
    { p: 'cat /etc/shadow | head -3' },
    { o: 'root:$6$xy7...:19847:0:99999:7:::', cls: 'dim' },
    { o: 'admin:$6$ab9...:19847:0:99999:7:::', cls: 'dim' },
    { o: 'svc-jenkins:$6$j2k...:19847:0:99999:7:::', cls: 'dim' },
    { p: 'msfconsole -q -x "use exploit/multi/handler"' },
    { o: '[*] Started reverse TCP handler on 10.10.14.5:4444' },
    { o: '[*] Sending stage (1017704 bytes) to target.lab' },
    { o: '[+] Meterpreter session 1 opened', cls: 'suc' },
    { p: 'sleep 1 && echo "// Engagement complete · reporting"' },
    { o: '// Findings exported to client deliverable.docx', cls: 'dim' },
    { o: '// Brendon Teo · 0xBR3N · responsible disclosure', cls: 'dim' },
    { p: 'clear' },
    { clear: true },
  ];

  const MAX_LINES = 16;
  let idx = 0;
  let typing = false;

  function appendLine(html, cls = '') {
    const div = document.createElement('div');
    div.className = 'terminal-line';
    div.innerHTML = html;
    body.appendChild(div);
    while (body.children.length > MAX_LINES) body.removeChild(body.firstChild);
    body.scrollTop = body.scrollHeight;
  }

  async function typeCommand(cmd) {
    const lineEl = document.createElement('div');
    lineEl.className = 'terminal-line';
    lineEl.innerHTML = `<span class="t-prompt">root@0xbr3n:~$</span> <span class="t-cmd"></span><span class="t-blink"></span>`;
    body.appendChild(lineEl);
    while (body.children.length > MAX_LINES) body.removeChild(body.firstChild);
    const cmdSpan = lineEl.querySelector('.t-cmd');
    const cursorSpan = lineEl.querySelector('.t-blink');

    for (let i = 0; i < cmd.length; i++) {
      cmdSpan.textContent = cmd.slice(0, i + 1);
      body.scrollTop = body.scrollHeight;
      await wait(18 + Math.random() * 30);
    }
    cursorSpan.remove();
  }

  async function runScript() {
    while (true) {
      const step = script[idx];
      idx = (idx + 1) % script.length;

      if (step.clear) {
        body.innerHTML = '';
        await wait(500);
        continue;
      }

      if (step.p) {
        typing = true;
        await typeCommand(step.p);
        typing = false;
        await wait(280 + Math.random() * 220);
      } else if (step.o) {
        const cls = step.cls ? `t-out ${step.cls}` : 't-out';
        appendLine(`<span class="${cls}">${escapeHTML(step.o)}</span>`);
        await wait(110 + Math.random() * 90);
      }
    }
  }

  // Defer start to allow page paint
  setTimeout(runScript, 700);

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function escapeHTML(s) {
    return s.replace(/[&<>"]/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
    })[c]);
  }
})();


/* ── 5. Live packet stream ──────────────────────────────────── */
(function initPacketStream() {
  const el = document.getElementById('packet-stream');
  if (!el) return;
  if (prefersReducedMotion) return;

  const packets = [
    '[→] SYN  10.0.0.5:42311',
    '[←] ACK  10.0.0.1:445',
    '[→] PSH  payload(1448)',
    '[!] EXPLOIT — shell',
    '[→] GET  /admin HTTP/1.1',
    '[←] 401 Unauthorized',
    '[→] POST /upload f=@sh',
    '[←] 200 {"ok":true}',
    '[!] reverse — :4444',
    '[→] FIN  flush',
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (document.hidden) return;
    const div = document.createElement('div');
    const text = packets[i % packets.length];
    div.className = 'packet' + (text.startsWith('[!]') ? ' hit' : '');
    div.textContent = text;
    el.appendChild(div);
    while (el.children.length > 5) el.removeChild(el.firstChild);
    i++;
  }, 900);
})();


/* ── 6. Scroll reveal (IntersectionObserver) ────────────────── */
(function initReveal() {
  const obs = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const delay = +(entry.target.dataset.revealDelay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay * 60);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.cve-card, .post-card, .tool-card, .cert-card').forEach((el, i) => {
    el.dataset.revealDelay = i % 6;
  });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();


/* ── 7. Hero entrance (staggered) ───────────────────────────── */
(function initHeroEntrance() {
  if (prefersReducedMotion) return;
  const targets = [
    '.hero-eyebrow', '.hero-display', '.hero-identity',
    '.hero-lede', '.cve-badge', '.hero-stats', '.hero-cta', '.hero-scene'
  ];
  targets.forEach((sel, i) => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
      el.style.transition = 'opacity 0.7s cubic-bezier(0.22,0.61,0.36,1), transform 0.7s cubic-bezier(0.22,0.61,0.36,1)';
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }, 80 + i * 95);
    });
  });
})();


/* ── 8. Display glitch — occasional ─────────────────────────── */
(function initDisplayGlitch() {
  if (prefersReducedMotion) return;
  const el = document.querySelector('.hero-display');
  if (!el) return;
  function fire() {
    el.classList.add('glitching');
    setTimeout(() => el.classList.remove('glitching'), 120 + Math.random() * 90);
    setTimeout(fire, 3000 + Math.random() * 5000);
  }
  setTimeout(fire, 2500);
})();


/* ── 9. Stats counters + YOE + CVE count ────────────────────── */
function calcYOE() {
  const start = new Date('2022-05-01');
  return Math.max(1, Math.floor((Date.now() - start) / (365.25 * 24 * 3600 * 1000)));
}

async function fetchCVECount() {
  try {
    const r = await fetch('https://api.github.com/repos/0xbr3n/My-CVEs/contents', { cache: 'force-cache' });
    if (!r.ok) return 1;
    const d = await r.json();
    return d.filter(x => /^CVE-\d{4}-\d+/i.test(x.name)).length || 1;
  } catch { return 1; }
}

function animCount(el, target, ms = 1200) {
  if (!el || !target) return;
  const start = performance.now();
  const from = 0;
  function step(now) {
    const t = Math.min(1, (now - start) / ms);
    const v = Math.floor(from + (target - from) * easeOut(t));
    el.textContent = v;
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

(async function initStats() {
  const yoe = calcYOE();
  const cve = await fetchCVECount();

  setTimeout(() => {
    animCount(document.getElementById('yoe-counter'), yoe);
    animCount(document.getElementById('cve-counter'), cve, 1000);
    document.querySelectorAll('.stat-num[data-target]').forEach(el =>
      animCount(el, +el.dataset.target, 1000)
    );
  }, 600);

  const aboutYoe = document.getElementById('about-yoe');
  if (aboutYoe) aboutYoe.textContent = yoe;

  const liveEl = document.getElementById('cve-live-count');
  if (liveEl) liveEl.textContent = cve;
})();


/* ── 10. CVE filter ─────────────────────────────────────────── */
(function initCVEFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.cve-card');
  if (!btns.length) return;
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(c => {
        const show = f === 'all' || c.dataset.severity === f;
        c.style.opacity      = show ? '1' : '0.15';
        c.style.transform    = show ? '' : 'scale(0.97)';
        c.style.pointerEvents = show ? '' : 'none';
      });
    });
  });
})();


/* ── 11. PGP copy ───────────────────────────────────────────── */
function copyPGP() {
  const text = document.querySelector('.pgp-content')?.textContent?.trim() || '';
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.pgp-copy');
    if (!btn) return;
    btn.textContent = '✓ Copied!';
    btn.style.color = '#00ff88';
    setTimeout(() => { btn.textContent = 'Copy Key'; btn.style.color = ''; }, 2000);
  });
}


/* ── 12. Active nav link on scroll ──────────────────────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-link');
  if (!sections.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => {
          l.classList.toggle('active',
            l.getAttribute('href') === `#${e.target.id}`);
        });
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => obs.observe(s));
})();


/* ── Util: debounce ─────────────────────────────────────────── */
function debounce(fn, ms) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(null, args), ms);
  };
}
