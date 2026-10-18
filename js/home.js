(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero: floating event cards cycle ---------- */
  var floats = document.querySelectorAll('.float');
  var flashRow = document.querySelector('tr[data-row="0"]');
  var fi = 0;
  function cycleFloats() {
    floats.forEach(function (f, i) { f.classList.toggle('is-on', i <= fi); });
    if (flashRow) {
      var status = flashRow.querySelector('.status');
      var bar = flashRow.querySelector('.bar');
      var states = [['progress', 'Requested', '18%', true], ['progress', 'Validating', '82%', true], ['complete', 'Complete', '100%', false]];
      var s = states[fi];
      status.className = 'status ' + s[0];
      status.textContent = s[1];
      bar.classList.toggle('warn', s[3]);
      bar.querySelector('i').style.setProperty('--w', s[2]);
      flashRow.classList.add('is-flash');
      setTimeout(function () { flashRow.classList.remove('is-flash'); }, 900);
    }
    fi = (fi + 1) % (floats.length + 1);
    if (fi === floats.length) {
      setTimeout(function () { floats.forEach(function (f) { f.classList.remove('is-on'); }); fi = 0; }, 2600);
      setTimeout(cycleFloats, 3600);
    } else {
      setTimeout(cycleFloats, 2000);
    }
  }
  setTimeout(cycleFloats, reduceMotion ? 0 : 1300);

  /* ---------- Hero: product screen tilts flat as you scroll (container-scroll animation) ---------- */
  var device = document.getElementById('device');
  if (device && !reduceMotion) {
    var ticking = false;
    var tilt = function () {
      ticking = false;
      var top = device.getBoundingClientRect().top;
      var vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, 1 - (top - 90) / (vh * 0.62)));
      var small = window.innerWidth < 768;
      var s0 = small ? 0.9 : 1.05, s1 = 1;
      device.style.setProperty('--rx', (20 * (1 - p)).toFixed(2) + 'deg');
      device.style.setProperty('--sc', (s0 + (s1 - s0) * p).toFixed(4));
    };
    var onTilt = function () { if (!ticking) { ticking = true; requestAnimationFrame(tilt); } };
    window.addEventListener('scroll', onTilt, { passive: true });
    window.addEventListener('resize', onTilt);
    tilt();
  }

  /* ---------- Side section nav: show after the hero, highlight the section in view ---------- */
  var sideNav = document.querySelector('.section-nav');
  if (sideNav) {
    var navLinks = Array.prototype.slice.call(sideNav.querySelectorAll('a'));
    var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var setActive = function (id) {
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) {
          a.setAttribute('aria-current', 'true');
          /* Chip bar mode: keep the active chip in view without scrolling the page */
          if (navList.scrollWidth > navList.clientWidth) {
            navList.scrollTo({ left: a.parentNode.offsetLeft - navList.clientWidth / 2 + a.offsetWidth / 2 });
          }
        } else a.removeAttribute('aria-current');
      });
    };
    var navList = sideNav.querySelector('ol');
    requestAnimationFrame(function () { sideNav.classList.add('is-visible'); });
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (sec) { spy.observe(sec); });
    }
    setActive('product');
  }

  /* ---------- Logo carousel: duplicate the track for a seamless loop ---------- */
  var track = document.getElementById('logoTrack');
  if (track) {
    Array.prototype.slice.call(track.children).forEach(function (n) {
      var c = n.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.querySelector('img').alt = '';
      track.appendChild(c);
    });
  }

  /* How it works lives on the Solution page (js/solution.js) */

})();

/* ---------- Card motion: data being requested, checked and delivered ---------- */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function whenVisible(el, cb, opts) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (en) { cb(en[0].isIntersecting); }, opts || { threshold: 0.45 }).observe(el);
  }
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* Stats: count up */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = +el.getAttribute('data-count'), done = false;
    if (reduce) return;
    el.textContent = '0';
    whenVisible(el, function (vis) {
      if (!vis || done) return; done = true;
      var t0 = null, dur = 1400;
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e);
        if (p < 1) requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
  });
})();

/* ---------- Why WIN: earlier cards ease back as the next one slides over ---------- */
(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.stack-item'));
  if (!items.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cards = items.map(function (it) { return it.querySelector('.stack-card'); });
  var whySec = document.getElementById('why'), whyHead = whySec && whySec.querySelector('.why-head');
  /* the pinned header carries a lead paragraph, so measure it and start the stack right below it */
  function setStackTop() {
    if (!whyHead) return;
    var cs = getComputedStyle(whyHead);
    if (cs.position === 'sticky') whySec.style.setProperty('--stack-top', Math.round((parseFloat(cs.top) || 0) + whyHead.offsetHeight + 8) + 'px');
    else whySec.style.removeProperty('--stack-top');
  }
  setStackTop(); window.addEventListener('resize', setStackTop);
  var ticking = false;
  function update() {
    ticking = false;
    var cover = items.map(function (it) {
      var top = parseFloat(getComputedStyle(it).top) || 0;
      var h = (it.offsetHeight || 1) * 0.6;
      return Math.min(1, Math.max(0, 1 - (it.getBoundingClientRect().top - top) / h));
    });
    cards.forEach(function (c, i) {
      var behind = 0;
      for (var j = i + 1; j < items.length; j++) behind += cover[j];
      c.style.transform = 'scale(' + (1 - 0.05 * behind).toFixed(4) + ')';
      c.style.filter = behind > 0.02 ? 'brightness(' + (1 - 0.08 * behind).toFixed(3) + ')' : '';
    });
    /* once the last card starts to leave, the pinned header leaves with it, at the same pace */
    if (whyHead) {
      var lastItem = items[items.length - 1], lift = 0;
      if (getComputedStyle(whyHead).position === 'sticky') lift = Math.max(0, (parseFloat(getComputedStyle(lastItem).top) || 0) - lastItem.getBoundingClientRect().top);
      whyHead.style.transform = lift > 0 ? 'translateY(' + (-lift).toFixed(1) + 'px)' : '';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* ---------- Announcement bar: visible while the hero is on screen ---------- */
(function () {
  var bar = document.getElementById('announce'), hero = document.getElementById('product');
  if (!bar || !hero) return;
  var dismissed = false;
  try { dismissed = sessionStorage.getItem('win-announce') === 'off'; } catch (e) {}
  function update() {
    var past = window.scrollY > 12;
    bar.classList.toggle('is-hidden', dismissed || past);
  }
  bar.querySelector('.announce-close').addEventListener('click', function () {
    dismissed = true; try { sessionStorage.setItem('win-announce', 'off'); } catch (e) {}
    update();
  });
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ---------- Platform: WIN is a button that opens the module circle (after 21st.dev Circle Menu) ----------
   Each module travels on a circular path: it spirals out of the WIN button, sweeping round the centre
   while its radius grows, and spirals back in on close. */
(function () {
  var orbit = document.getElementById('ecoMods'); if (!orbit) return;
  var core = orbit.querySelector('.eco-core'), hint = orbit.querySelector('.eco-hint');
  var mods = Array.prototype.slice.call(orbit.querySelectorAll('.eco-module'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = window.matchMedia('(max-width: 600px)');
  var SWEEP = 160 * Math.PI / 180, OPEN_MS = 820, CLOSE_MS = 560, STAGGER = 70;
  var open = false;
  var items = mods.map(function (m, i) {
    m.style.setProperty('--i', i);
    return { el: m, l: parseFloat(m.style.left), t: parseFloat(m.style.top), p: 0, from: 0, to: 0, start: 0, dur: 0, delay: 0 };
  });

  function easeOutBack(x) { var c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function easeInOutCubic(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  function geometry() {
    var W = orbit.clientWidth, H = orbit.clientHeight;
    items.forEach(function (it) {
      var dx = (it.l - 50) / 100 * W, dy = (it.t - 50) / 100 * H;
      it.r = Math.hypot(dx, dy); it.a = Math.atan2(dy, dx);
    });
  }
  function draw(it) {
    if (phone.matches) { it.el.style.transform = ''; it.el.style.opacity = ''; return; }
    var e = it.p, r = it.r * Math.max(0, e), a = it.a - SWEEP * (1 - Math.min(1, e));
    var x = Math.cos(a) * r, y = Math.sin(a) * r, s = .3 + .7 * Math.min(1, Math.max(0, e));
    it.el.style.transform = 'translate(-50%, -50%) translate(' + x.toFixed(1) + 'px, ' + y.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
    it.el.style.opacity = Math.min(1, Math.max(0, e * 1.8)).toFixed(3);
  }
  var raf = null;
  function tick(now) {
    var busy = false;
    items.forEach(function (it) {
      var k = (now - it.start - it.delay) / it.dur;
      if (k < 0) { busy = true; return; }
      if (k >= 1) { it.p = it.to; draw(it); return; }
      busy = true;
      var e = open ? easeOutBack(k) : easeInOutCubic(k);
      it.p = it.from + (it.to - it.from) * e; draw(it);
    });
    raf = busy ? requestAnimationFrame(tick) : null;
  }
  function set(next) {
    open = next;
    orbit.classList.toggle('is-open', open);
    core.setAttribute('aria-expanded', String(open));
    core.setAttribute('aria-label', open ? 'Hide the EuvinoPRO modules' : 'Show the EuvinoPRO modules');
    if (hint) hint.textContent = open ? 'Click to close' : 'Click to explore';
    var now = performance.now(), n = items.length;
    items.forEach(function (it, i) {
      it.from = it.p; it.to = open ? 1 : 0; it.start = now;
      it.dur = reduce ? 1 : (open ? OPEN_MS : CLOSE_MS);
      it.delay = reduce ? 0 : (open ? i : n - 1 - i) * STAGGER;
    });
    if (!raf) raf = requestAnimationFrame(tick);
  }
  core.addEventListener('click', function () { set(!open); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) set(false); });
  geometry(); items.forEach(draw);
  window.addEventListener('resize', function () { geometry(); items.forEach(draw); });
  phone.addEventListener('change', function () { items.forEach(draw); });
})();
