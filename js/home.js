(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Hero: advantage cards slide in from the sides as you scroll ---------- */
  var floats = Array.prototype.slice.call(document.querySelectorAll('.float'));
  var flTick = false;
  var scene = document.querySelector('.device-scene') || document.querySelector('.hero-stage');
  /* the cards finish arriving exactly when the whole device is in view; they come in one after another before that */
  var STAGES = [[0.06, 0.55], [0.22, 0.55], [0.38, 0.62]];
  function updateFloats() {
    flTick = false;
    var vh = window.innerHeight, full = scene ? scene.getBoundingClientRect().bottom + window.scrollY - vh : 0;
    var q = full > 1 ? Math.min(1, Math.max(0, window.scrollY / full)) : 1;
    floats.forEach(function (f, i) {
      var st = STAGES[i] || STAGES[STAGES.length - 1];
      var p = reduceMotion ? 1 : Math.min(1, Math.max(0, (q - st[0]) / st[1]));
      /* once a card has come in it stays: scrolling back up does not take it away */
      p = Math.max(p, parseFloat(f.getAttribute('data-p')) || 0);
      f.setAttribute('data-p', p.toFixed(3));
      f.style.setProperty('--p', (p * p * (3 - 2 * p)).toFixed(3));
    });
  }
  window.addEventListener('scroll', function () { if (!flTick) { flTick = true; requestAnimationFrame(updateFloats); } }, { passive: true });
  window.addEventListener('resize', updateFloats);
  updateFloats();

  /* the table row on the device keeps cycling through its states */
  var flashRow = document.querySelector('tr[data-row="0"]');
  var fi = 0;
  function cycleRow() {
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
    fi = (fi + 1) % 3;
    setTimeout(cycleRow, 2400);
  }
  setTimeout(cycleRow, reduceMotion ? 0 : 1300);

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

    /* hover: a splash of brand violet blooms under the pointer, painted only inside the logo's own shape */
    var tiles = Array.prototype.slice.call(track.querySelectorAll('.logo-tile'));
    tiles.forEach(function (t) { var s = document.createElement('span'); s.className = 'logo-splash'; s.setAttribute('aria-hidden', 'true'); t.appendChild(s); });
    function fitSplash(t) {
      var img = t.querySelector('img'), s = t.querySelector('.logo-splash'); if (!img || !s || !img.offsetWidth) return;
      s.style.left = img.offsetLeft + 'px'; s.style.top = img.offsetTop + 'px'; s.style.width = img.offsetWidth + 'px'; s.style.height = img.offsetHeight + 'px';
      s.style.setProperty('--mask', 'url("' + (img.currentSrc || img.src) + '")');
    }
    function fitAll() { tiles.forEach(fitSplash); }
    tiles.forEach(function (t) { var img = t.querySelector('img'); if (img.complete) fitSplash(t); else img.addEventListener('load', function () { fitSplash(t); }); });
    window.addEventListener('resize', fitAll);
    track.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var t = e.target.closest ? e.target.closest('.logo-tile') : null; if (!t) return;
      var s = t.querySelector('.logo-splash'), r = s.getBoundingClientRect();
      s.style.setProperty('--mx', (e.clientX - r.left).toFixed(1) + 'px'); s.style.setProperty('--my', (e.clientY - r.top).toFixed(1) + 'px');
      t.classList.add('is-hot');
    });
    track.addEventListener('pointerout', function (e) {
      var t = e.target.closest ? e.target.closest('.logo-tile') : null;
      if (t && !t.contains(e.relatedTarget)) t.classList.remove('is-hot');
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

/* ---------- Platform: modules open out of WIN as the section scrolls into view, and close as it leaves ----------
   The modules sit evenly on a circle (a regular hexagon) around WIN, joined to it by spokes, inside two concentric
   dotted circles. Each module spirals out along the circle while its radius grows, and spirals back in on close. */
(function () {
  var orbit = document.getElementById('ecoMods'); if (!orbit) return;
  var core = orbit.querySelector('.eco-core'), svg = orbit.querySelector('svg.orbit-lines');
  var mods = Array.prototype.slice.call(orbit.querySelectorAll('.eco-module'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phone = window.matchMedia('(max-width: 700px)');
  var SWEEP = 160 * Math.PI / 180, OPEN_MS = 900, CLOSE_MS = 600, STAGGER = 70, NS = 'http://www.w3.org/2000/svg';
  /* evenly spaced, mirrored left to right: top, upper right, lower right, bottom, lower left, upper left */
  var ANGLES = [-90, -150, -30, 150, 30, 90].map(function (d) { return d * Math.PI / 180; });
  var open = false;
  var items = mods.map(function (m, i) { m.style.setProperty('--i', i); return { el: m, p: 0, from: 0, to: 0, start: 0, dur: 0, delay: 0, a: ANGLES[i % 6], r: 0 }; });

  function easeOutBack(x) { var c1 = 1.3, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function easeInOutCubic(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }

  function circle(cx, cy, r) { var c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', cx); c.setAttribute('cy', cy); c.setAttribute('r', r); return c; }
  function geometry() {
    if (phone.matches) { svg.innerHTML = ''; items.forEach(function (it) { it.el.style.left = ''; it.el.style.top = ''; }); return; }
    var W = orbit.clientWidth, H = orbit.clientHeight, cx = W / 2, cy = H / 2, PAD = 20;
    /* real card size, so the circle is as large as the box allows and cards never touch the edge or each other */
    var mw = 0, mh = 0; mods.forEach(function (m) { mw = Math.max(mw, m.offsetWidth / 2); mh = Math.max(mh, m.offsetHeight / 2); });
    var R = Math.min(cy - mh - PAD, (cx - mw - PAD) / Math.cos(Math.PI / 6));
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.innerHTML = '';
    var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'rings');
    g.appendChild(circle(cx, cy, R * 0.56)); g.appendChild(circle(cx, cy, R));
    svg.appendChild(g);
    items.forEach(function (it, i) {
      it.r = R;
      var x = cx + Math.cos(it.a) * R, y = cy + Math.sin(it.a) * R;
      it.el.style.left = x.toFixed(1) + 'px'; it.el.style.top = y.toFixed(1) + 'px';
      var l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', cx); l.setAttribute('y1', cy); l.setAttribute('x2', x.toFixed(1)); l.setAttribute('y2', y.toFixed(1));
      l.setAttribute('class', 'spoke'); l.style.setProperty('--d', (i * 0.35).toFixed(2) + 's'); svg.insertBefore(l, g.nextSibling);
    });
  }
  function draw(it) {
    if (phone.matches) { it.el.style.transform = ''; it.el.style.opacity = ''; return; }
    var e = it.p, r = it.r * Math.max(0, e), a = it.a - SWEEP * (1 - Math.min(1, e));
    /* offset from the module's own resting spot: at rest (e = 1) the offset is 0, at e = 0 it sits on WIN */
    var rx = Math.cos(a) * r - Math.cos(it.a) * it.r, ry = Math.sin(a) * r - Math.sin(it.a) * it.r;
    var s = .3 + .7 * Math.min(1, Math.max(0, e));
    it.el.style.transform = 'translate(-50%, -50%) translate(' + rx.toFixed(1) + 'px, ' + ry.toFixed(1) + 'px) scale(' + s.toFixed(3) + ')';
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
    if (next === open) return;
    open = next;
    orbit.classList.toggle('is-open', open);
    var now = performance.now(), n = items.length;
    items.forEach(function (it, i) {
      it.from = it.p; it.to = open ? 1 : 0; it.start = now;
      it.dur = reduce ? 1 : (open ? OPEN_MS : CLOSE_MS);
      it.delay = reduce ? 0 : (open ? i : n - 1 - i) * STAGGER;
    });
    if (!raf) raf = requestAnimationFrame(tick);
  }
  geometry(); items.forEach(draw);
  window.addEventListener('resize', function () { geometry(); items.forEach(draw); });
  phone.addEventListener('change', function () { geometry(); items.forEach(draw); });
  /* open when the diagram is well in view, close once it has mostly left (two thresholds so it never flickers) */
  if ('IntersectionObserver' in window) {
    var thresholds = []; for (var t = 0; t <= 20; t++) thresholds.push(t / 20);
    new IntersectionObserver(function (en) {
      var r = en[0].intersectionRatio;
      if (!open && r >= 0.45) set(true);
      else if (open && r < 0.35) set(false);
    }, { threshold: thresholds }).observe(orbit);
  } else set(true);
})();
