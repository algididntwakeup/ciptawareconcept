(function () {
  'use strict';

  var dict = window.CIPTAWARE_I18N;
  var KEY = 'ciptaware-lang';
  var root = document.documentElement;
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = motionQuery.matches;

  /* ------------------------------------------------------------------ *
   * Language
   * ------------------------------------------------------------------ */

  function renderMarquee(phrase) {
    var track = document.getElementById('marquee-track');
    if (!track || !phrase) return;
    var tokens = phrase.split('·').map(function (s) { return s.trim(); }).filter(Boolean);
    var chunk = tokens.map(function (t) {
      return '<span>' + t + '</span><span class="marquee__dot" aria-hidden="true"></span>';
    }).join('');
    track.innerHTML = chunk + chunk;
  }

  function applyLanguage(lang) {
    var t = dict[lang] || dict.id;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = t[el.dataset.i18n];
      if (value === undefined) console.warn('Missing i18n key:', el.dataset.i18n);
      else el.textContent = value;
    });

    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var value = t[el.dataset.i18nHtml];
      if (value === undefined) console.warn('Missing i18n key:', el.dataset.i18nHtml);
      else el.innerHTML = value;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      var value = t[el.dataset.i18nAria];
      if (value === undefined) console.warn('Missing i18n key:', el.dataset.i18nAria);
      else el.setAttribute('aria-label', value);
    });

    root.lang = lang;
    document.title = t['meta.title'];
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t['meta.description']);

    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      btn.textContent = lang === 'id' ? 'EN' : 'ID';
      btn.setAttribute('aria-label', t['lang.switch']);
    });

    renderMarquee(t['band.marquee']);

    try { localStorage.setItem(KEY, lang); } catch (e) { /* storage unavailable */ }

    document.dispatchEvent(new CustomEvent('ciptaware:lang', { detail: lang }));
  }

  function storedLang() {
    try {
      var value = localStorage.getItem(KEY);
      return value === 'id' || value === 'en' ? value : 'id';
    } catch (e) {
      return 'id';
    }
  }

  document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyLanguage(root.lang === 'id' ? 'en' : 'id');
    });
  });

  /* ------------------------------------------------------------------ *
   * Navigation overlay
   * ------------------------------------------------------------------ */

  var navToggle = document.querySelector('.nav__toggle');
  var navMobile = document.getElementById('nav-mobile');
  var navClose = document.querySelector('.nav__close');
  var previousOverflow = '';

  function focusables() {
    if (!navMobile) return [];
    return Array.prototype.slice.call(
      navMobile.querySelectorAll('a[href], button:not([disabled])')
    ).filter(function (el) { return el.offsetParent !== null; });
  }

  function openNav() {
    if (!navMobile || !navToggle) return;
    navMobile.hidden = false;
    navMobile.setAttribute('aria-hidden', 'false');
    navToggle.setAttribute('aria-expanded', 'true');
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    var first = navMobile.querySelector('.nav-mobile__links a') || focusables()[0];
    if (first) first.focus();
  }

  function closeNav(returnFocus) {
    if (!navMobile || !navToggle) return;
    navMobile.hidden = true;
    navMobile.setAttribute('aria-hidden', 'true');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = previousOverflow;
    if (returnFocus) navToggle.focus();
  }

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      if (navMobile.hidden) openNav();
      else closeNav(true);
    });
  }

  if (navClose) navClose.addEventListener('click', function () { closeNav(true); });

  if (navMobile) {
    navMobile.addEventListener('click', function (event) {
      var link = event.target.closest('a[href]');
      if (link) closeNav(false);
    });

    navMobile.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeNav(true);
        return;
      }
      if (event.key !== 'Tab') return;
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navMobile && !navMobile.hidden) {
      closeNav(true);
    }
  });

  /* ------------------------------------------------------------------ *
   * Scrollspy
   * ------------------------------------------------------------------ */

  var spySections = ['services', 'process', 'notes', 'contact']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-nav]'));

  function setActive(id) {
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', link.dataset.nav === id);
    });
  }

  function syncActive() {
    var mid = window.innerHeight * 0.475;
    var current = '';
    spySections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      if (rect.top <= mid && rect.bottom > mid) current = section.id;
    });
    setActive(current);
  }

  if ('IntersectionObserver' in window && spySections.length) {
    var visible = new Set();
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      var last = '';
      spySections.forEach(function (section) {
        if (visible.has(section.id)) last = section.id;
      });
      setActive(last);
    }, { rootMargin: '-45% 0px -50% 0px' });
    spySections.forEach(function (section) { spy.observe(section); });
  }

  /* ------------------------------------------------------------------ *
   * Reveal
   * ------------------------------------------------------------------ */

  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-inview'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-inview');
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    revealEls.forEach(function (el) { revealer.observe(el); });
  }

  /* ------------------------------------------------------------------ *
   * Parallax
   * ------------------------------------------------------------------ */

  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  var parallaxEnabled = !reduceMotion && window.innerWidth >= 900;

  function clearParallax() {
    parallaxEls.forEach(function (el) { el.style.translate = ''; });
  }

  function updateParallax() {
    if (!parallaxEnabled) return;
    var vh = window.innerHeight;
    parallaxEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -240 || rect.top > vh + 240) return;
      var p = (vh - rect.top) / (vh + rect.height);
      var y = (p - 0.5) * parseFloat(el.dataset.parallax) * 400;
      el.style.translate = '0 ' + y.toFixed(2) + 'px';
    });
  }

  /* ------------------------------------------------------------------ *
   * Pinned process
   * ------------------------------------------------------------------ */

  var processSection = document.getElementById('process');
  var processIndex = document.getElementById('process-index');
  var processSteps = Array.prototype.slice.call(document.querySelectorAll('.process__step'));
  var processBounds = { top: 0, height: 0 };
  var processEnabled = false;

  function measureProcess() {
    if (!processSection) return;
    processEnabled = !reduceMotion && window.innerWidth >= 900;
    if (!processEnabled) {
      processSection.style.removeProperty('--p');
      processSection.style.setProperty('--p', '0');
      processSteps.forEach(function (step) { step.classList.remove('is-active'); });
      if (processIndex) processIndex.textContent = '01';
      return;
    }
    processBounds.top = processSection.getBoundingClientRect().top + window.scrollY;
    processBounds.height = processSection.offsetHeight;
  }

  function updateProcess() {
    if (!processSection || !processEnabled) return;
    var travel = processBounds.height - window.innerHeight;
    if (travel <= 0) return;
    var p = (window.scrollY - processBounds.top) / travel;
    p = Math.max(0, Math.min(1, p));
    processSection.style.setProperty('--p', p.toFixed(4));

    var active = Math.min(3, Math.floor(p * 4));
    processSteps.forEach(function (step, i) {
      step.classList.toggle('is-active', i === active);
    });
    if (processIndex) processIndex.textContent = String(active + 1).padStart(2, '0');
  }

  /* ------------------------------------------------------------------ *
   * Scroll scheduling
   * ------------------------------------------------------------------ */

  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      updateParallax();
      updateProcess();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  window.addEventListener('resize', function () {
    parallaxEnabled = !reduceMotion && window.innerWidth >= 900;
    if (!parallaxEnabled) clearParallax();
    measureProcess();
    syncActive();
    onScroll();
  });

  document.addEventListener('ciptaware:lang', function () {
    measureProcess();
    syncActive();
    onScroll();
  });

  /* ------------------------------------------------------------------ *
   * Hero canvas
   * ------------------------------------------------------------------ */

  function initHeroCanvas() {
    var canvas = document.getElementById('hero-canvas');
    var hero = document.getElementById('hero');
    if (!canvas || !hero) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var width = 0;
    var height = 0;
    var nodes = [];
    var frame = 0;
    var running = false;
    var inView = true;
    var pointer = { x: -9999, y: -9999, active: false };

    function buildNodes() {
      var count = Math.min(70, Math.max(24, Math.round(width / 24)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          lime: i < 5
        });
      }
    }

    function resize() {
      var dpr = Math.min(2, window.devicePixelRatio || 1);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(201,203,190,0.16)';
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x;
          var dy = nodes[i].y - nodes[j].y;
          if (dx * dx + dy * dy > 22500) continue;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }

      for (var k = 0; k < nodes.length; k++) {
        var node = nodes[k];
        ctx.beginPath();
        ctx.fillStyle = node.lime ? '#cef79e' : '#4d5757';
        ctx.arc(node.x, node.y, node.lime ? 2 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function step() {
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (pointer.active) {
          var dx = node.x - pointer.x;
          var dy = node.y - pointer.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0.001) {
            var push = (120 - dist) / 120;
            node.x += (dx / dist) * push * 1.6;
            node.y += (dy / dist) * push * 1.6;
          }
        }

        if (node.x < 0) { node.x = 0; node.vx *= -1; }
        if (node.x > width) { node.x = width; node.vx *= -1; }
        if (node.y < 0) { node.y = 0; node.vy *= -1; }
        if (node.y > height) { node.y = height; node.vy *= -1; }
      }
      draw();
      frame = window.requestAnimationFrame(step);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      frame = window.requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(frame);
    }

    function refresh() {
      if (reduceMotion) {
        stop();
        draw();
        return;
      }
      if (inView && !document.hidden) start();
      else stop();
    }

    hero.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'touch') return;
      var rect = hero.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    });
    hero.addEventListener('pointerleave', function () {
      pointer.active = false;
      pointer.x = -9999;
      pointer.y = -9999;
    });

    document.addEventListener('visibilitychange', refresh);

    if ('IntersectionObserver' in window) {
      var heroObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          inView = entry.isIntersecting;
          refresh();
        });
      }, { threshold: 0 });
      heroObserver.observe(hero);
    }

    if ('ResizeObserver' in window) {
      var sizeObserver = new ResizeObserver(function () { resize(); });
      sizeObserver.observe(hero);
    } else {
      window.addEventListener('resize', resize);
    }

    resize();
    refresh();
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */

  function boot() {
    applyLanguage(storedLang());
    measureProcess();
    syncActive();
    onScroll();
    initHeroCanvas();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        measureProcess();
        onScroll();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', function (event) {
      reduceMotion = event.matches;
      parallaxEnabled = !reduceMotion && window.innerWidth >= 900;
      if (!parallaxEnabled) clearParallax();
      measureProcess();
      onScroll();
    });
  }
})();
