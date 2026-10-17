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

  /* ---------- How it works ---------- */
  var FLOWS = {
    direct: [
      { who: 'Merchant', title: 'Create the article in your ERP', text: 'Give it an article number, pick the producer, and add the wine name and vintage. That\'s all you type.', nodes: ['n-merchant'], record: 0 },
      { who: 'Merchant → WIN', title: 'A product request goes to WIN', text: 'Your ERP sends the request automatically. No email, no spreadsheet.', path: 'mp-m-w', kind: 'req', lanes: ['lane-m'], nodes: ['n-merchant', 'n-win'], record: 0 },
      { who: 'WIN → Producer', title: 'WIN routes it and notifies the producer', text: 'WIN finds the right producer and sends them an email with the request.', path: 'mp-w-p', kind: 'req', lanes: ['lane-p'], nodes: ['n-win', 'n-producer'], bubble: ['New request', 555, 140], record: 0 },
      { who: 'Producer', title: 'The producer answers', text: 'Online in the web app or straight from their own ERP. WIN checks every field while they type.', nodes: ['n-producer'], bubble: ['Entering data…', 555, 140], record: 0 },
      { who: 'Producer → WIN', title: 'Validated data is sent back', text: 'Only complete, plausible records leave the producer. Every change is logged.', path: 'mp-p-w', kind: 'data', lanes: ['lane-p'], nodes: ['n-producer', 'n-win'], bubble: ['214 / 214 checked', 320, 132], record: 0 },
      { who: 'WIN → Merchant', title: 'Imported into your ERP', text: 'WIN delivers the finished record and notifies you. The article is ready to use.', path: 'mp-w-m', kind: 'data', lanes: ['lane-m'], nodes: ['n-win', 'n-merchant'], record: 1 }
    ],
    agency: [
      { who: 'Merchant', title: 'Create the article in your ERP', text: 'Article number, producer, wine name and vintage. Same as always.', nodes: ['n-merchant'], record: 0 },
      { who: 'Merchant → WIN', title: 'A product request goes to WIN', text: 'Sent automatically from your ERP or the web app.', path: 'mp-m-w', kind: 'req', lanes: ['lane-m'], nodes: ['n-merchant', 'n-win'], record: 0 },
      { who: 'WIN → Producer', title: 'The producer is notified', text: 'WIN routes the request to the producer behind the wine.', path: 'mp-w-p', kind: 'req', lanes: ['lane-p'], nodes: ['n-win', 'n-producer'], record: 0 },
      { who: 'Producer → Agency', title: 'Forwarded to the agency, automatically', text: 'A one-time setting by the producer: all requests go to their trade agency.', path: 'mp-p-a', kind: 'req', lanes: ['lane-pa'], nodes: ['n-producer', 'n-agency'], bubble: ['Rule: forward all', 470, 98], record: 0 },
      { who: 'Agency', title: 'The agency answers and refines', text: 'The agency prepares the data for your market, online or from its own ERP.', nodes: ['n-agency'], bubble: ['Refining for DE', 320, 112], record: 0 },
      { who: 'Agency → WIN', title: 'Validated data is sent to WIN', text: 'Checked at input, just like a direct answer.', path: 'mp-a-w', kind: 'data', lanes: ['lane-a'], nodes: ['n-agency', 'n-win'], record: 0 },
      { who: 'WIN → Merchant', title: 'Imported into your ERP', text: 'The complete record lands in your system, ready to use.', path: 'mp-w-m', kind: 'data', lanes: ['lane-m'], nodes: ['n-win', 'n-merchant'], record: 1 }
    ]
  };

  var diagram = document.getElementById('diagram');
  if (!diagram) return;
  var stepsEl = document.getElementById('steps');
  var packet = document.getElementById('packet');
  var bubble = document.getElementById('bubble');
  var bubbleRect = bubble.querySelector('rect');
  var bubbleText = bubble.querySelector('text');
  var record = document.getElementById('record');
  var recordBar = document.getElementById('recordBar');
  var recordText = document.getElementById('recordText');
  var playBtn = document.getElementById('playBtn');
  var card = diagram.closest('.diagram-card');

  var mode = 'direct', idx = 0, playing = !reduceMotion, timer = null, raf = null, visible = false;
  var STEP_MS = 3400;

  function renderSteps() {
    stepsEl.innerHTML = FLOWS[mode].map(function (s, i) {
      return '<li class="step" data-i="' + i + '" tabindex="0">' +
        '<span class="step-num">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<div><span class="who">' + s.who + '</span><h4>' + s.title + '</h4><p>' + s.text + '</p></div>' +
        '<span class="step-progress"><i style="--dur:' + STEP_MS + 'ms"></i></span></li>';
    }).join('');
  }

  function animatePacket(pathId, kind) {
    cancelAnimationFrame(raf);
    if (!pathId) { packet.style.opacity = 0; return; }
    var path = document.getElementById(pathId);
    var len = path.getTotalLength();
    packet.classList.toggle('is-data', kind === 'data');
    var dur = reduceMotion ? 1 : 1200, t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var pt = path.getPointAtLength(e * len);
      packet.setAttribute('cx', pt.x);
      packet.setAttribute('cy', pt.y);
      packet.style.opacity = p < .92 ? 1 : (1 - p) / .08;
      if (p < 1) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
  }

  function showBubble(b) {
    if (!b) { bubble.classList.remove('is-on'); return; }
    bubbleText.textContent = b[0];
    var w = bubbleText.getComputedTextLength() + 24;
    bubbleRect.setAttribute('width', w);
    bubble.setAttribute('transform', 'translate(' + (b[1] - w / 2) + ' ' + (b[2] - 15) + ')');
    bubble.classList.add('is-on');
  }

  function go(i) {
    var flow = FLOWS[mode];
    idx = (i + flow.length) % flow.length;
    var s = flow[idx];
    stepsEl.querySelectorAll('.step').forEach(function (el, n) {
      el.classList.toggle('is-active', n === idx);
      var bar = el.querySelector('.step-progress i');
      if (n === idx) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
    diagram.querySelectorAll('.lane').forEach(function (l) { l.classList.toggle('is-active', (s.lanes || []).indexOf(l.id) > -1); });
    diagram.querySelectorAll('.node').forEach(function (n) { n.classList.toggle('is-active', s.nodes.indexOf(n.id) > -1); });
    animatePacket(s.path, s.kind);
    showBubble(s.bubble);
    record.style.opacity = 1;
    recordBar.setAttribute('width', s.record ? 214 : (idx >= flow.length - 2 ? 120 : 0));
    recordText.textContent = s.record ? '214 / 214 attributes · ready to sell' : (idx >= flow.length - 2 ? 'validating…' : '0 / 214 attributes · waiting for producer');
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    if (playing && visible) timer = setTimeout(function () { go(idx + 1); }, STEP_MS);
  }

  function setPlaying(p) {
    playing = p;
    playBtn.textContent = p ? 'Pause' : 'Play';
    card.parentElement.classList.toggle('is-paused', !p);
    stepsEl.classList.toggle('is-paused', !p);
    if (p) go(idx); else clearTimeout(timer);
  }

  function setMode(m) {
    mode = m;
    diagram.setAttribute('data-mode', m);
    diagram.setAttribute('viewBox', m === 'direct' ? '0 110 640 310' : '0 0 640 440');
    document.querySelectorAll('.how-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-mode') === m)); });
    renderSteps();
    go(0);
  }

  stepsEl.addEventListener('click', function (e) {
    var li = e.target.closest('.step'); if (li) go(+li.getAttribute('data-i'));
  });
  stepsEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { var li = e.target.closest('.step'); if (li) { e.preventDefault(); go(+li.getAttribute('data-i')); } }
  });
  document.querySelectorAll('.how-tabs button').forEach(function (b) {
    b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
  });
  playBtn.addEventListener('click', function () { setPlaying(!playing); });

  renderSteps();
  stepsEl.classList.toggle('is-paused', !playing);
  if (!playing) playBtn.textContent = 'Play';
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible) go(idx); else clearTimeout(timer);
    }, { threshold: 0.25 }).observe(document.getElementById('how'));
  } else { visible = true; go(0); }

  /* ---------- Solutions tabs ---------- */
  var tabs = document.querySelectorAll('.role-tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var r = t.getAttribute('data-role');
      tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
      document.querySelectorAll('.role-panel').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-panel') === r); });
    });
  });
})();

/* ---------- Card motion: data being requested, checked and delivered ---------- */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Cursor-following highlight */
  if (fine) {
    document.querySelectorAll('.tile, .trust-card, .compare-card, .role-copy').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

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
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
