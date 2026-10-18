/* Solution page: How it works as a scroll timeline.
   The line fills as you scroll and each step lights up when its number reaches it.
   Every step's screen plays its own moment in a loop while it is on screen. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var qa = function (sel, root) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };

  /* ---------- scroll line ---------- */
  var tl = document.querySelector('[data-tl]');
  if (tl) {
    var fill = tl.querySelector('.tl-line'), rows = qa('.tl-row', tl), ticking = false;
    function update() {
      ticking = false;
      var r = tl.getBoundingClientRect(), mark = window.innerHeight * 0.45;
      var h = Math.max(0, Math.min(r.height, mark - r.top));
      fill.style.setProperty('--tl-fill', h + 'px');
      rows.forEach(function (row) { row.classList.toggle('is-reached', row.getBoundingClientRect().top < mark); });
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- screen moments ---------- */
  async function typeInto(inp, speed, alive) {
    var text = inp.getAttribute('data-type'), tv = inp.querySelector('.tv');
    inp.classList.remove('is-ok'); inp.classList.add('is-typing'); tv.textContent = '';
    for (var i = 0; i < text.length && alive(); i++) { tv.textContent += text[i]; await wait(speed); }
    inp.classList.remove('is-typing'); inp.classList.add('is-ok');
    await wait(140);
  }
  async function press(btn, doneText) {
    btn.classList.add('is-press'); await wait(160); btn.classList.remove('is-press');
    if (doneText) { btn.textContent = doneText; btn.classList.add('is-done'); }
  }
  function clearInputs(v) { qa('.inp[data-type]', v).forEach(function (i) { i.querySelector('.tv').textContent = ''; i.classList.remove('is-ok', 'is-typing'); }); }
  function fillInputs(v) { qa('.inp[data-type]', v).forEach(function (i) { i.querySelector('.tv').textContent = i.getAttribute('data-type'); i.classList.add('is-ok'); }); }

  var CODE = [
    ['09:41:02', 'Request <span class="hl">40-11873</span> from the trader'],
    ['09:41:02', 'Article: Riesling, dry 2025'],
    ['09:41:02', 'Producer matched'],
    ['09:41:02', '41 required fields set by the trader'],
    ['09:41:02', 'Request validated'],
    ['09:41:03', 'Notification queued'],
    ['09:41:03', '<span class="ok">Notification sent to the producer</span>'],
    ['09:41:03', 'Waiting for the producer ...']
  ];
  function codeLine(l) { return '<div class="cl"><time>' + l[0] + '</time><span>' + l[1] + '</span></div>'; }

  var MOMENTS = {
    'erp-new': {
      reset: function (v) { clearInputs(v); var b = v.querySelector('[data-btn]'); b.textContent = 'Submit Request'; b.classList.remove('is-done'); },
      play: async function (v, alive) {
        await wait(500);
        var inps = qa('.inp[data-type]', v);
        for (var i = 0; i < inps.length && alive(); i++) await typeInto(inps[i], 50, alive);
        if (!alive()) return; await wait(500); await press(v.querySelector('[data-btn]'), 'Request Sent');
      },
      end: function (v) { fillInputs(v); var b = v.querySelector('[data-btn]'); b.textContent = 'Request Sent'; b.classList.add('is-done'); }
    },
    'win-route': {
      reset: function (v) { v.querySelector('[data-lines]').innerHTML = ''; },
      play: async function (v, alive) {
        var box = v.querySelector('[data-lines]'); await wait(400);
        for (var i = 0; i < CODE.length && alive(); i++) { box.insertAdjacentHTML('beforeend', codeLine(CODE[i])); await wait(520); }
      },
      end: function (v) { v.querySelector('[data-lines]').innerHTML = CODE.map(codeLine).join(''); }
    },
    'mail': {
      reset: function (v) {
        var row = v.querySelector('.mx-row.is-new'); row.classList.add('is-collapsed'); row.classList.remove('is-fresh');
        v.querySelector('.mx-badge').classList.remove('is-on', 'is-pop'); v.querySelector('.mx-toast').classList.remove('is-show');
      },
      play: async function (v, alive) {
        var row = v.querySelector('.mx-row.is-new'), badge = v.querySelector('.mx-badge'), toast = v.querySelector('.mx-toast');
        await wait(900); if (!alive()) return;
        toast.classList.add('is-show');                       /* the banner drops in, like a phone notification */
        await wait(1300); if (!alive()) return;
        badge.classList.add('is-on', 'is-pop');               /* the Inbox count appears */
        row.classList.remove('is-collapsed'); row.classList.add('is-fresh');   /* the mail slides in at the top, the rest move down */
        await wait(500); toast.classList.remove('is-show');
        await wait(600);
      },
      end: function (v) { v.querySelector('.mx-row.is-new').classList.remove('is-collapsed'); v.querySelector('.mx-badge').classList.add('is-on'); }
    },
    'form': {
      reset: function (v) { clearInputs(v); var b = v.querySelector('[data-btn]'); b.textContent = 'Send to WIN'; b.classList.remove('is-done'); v.querySelector('[data-count]').textContent = '32 / 41 required fields'; },
      play: async function (v, alive) {
        var inps = qa('.inp[data-type]', v), c = v.querySelector('[data-count]'); await wait(400);
        for (var i = 0; i < inps.length && alive(); i++) { await typeInto(inps[i], 45, alive); c.textContent = (32 + (i + 1) * 3) + ' / 41 required fields'; }
        if (!alive()) return; c.textContent = '41 / 41 required fields';
        await wait(400); await press(v.querySelector('[data-btn]'), 'Sent');
      },
      end: function (v) { fillInputs(v); v.querySelector('[data-count]').textContent = '41 / 41 required fields'; var b = v.querySelector('[data-btn]'); b.textContent = 'Sent'; b.classList.add('is-done'); }
    },
    'win-check': {
      reset: function (v) { qa('[data-checks] li', v).forEach(function (li) { li.classList.remove('is-ok'); }); v.querySelector('[data-approved]').classList.remove('is-on'); },
      play: async function (v, alive) {
        var items = qa('[data-checks] li', v);
        for (var i = 0; i < items.length && alive(); i++) { await wait(520); items[i].classList.add('is-ok'); }
        if (!alive()) return; await wait(300); v.querySelector('[data-approved]').classList.add('is-on');
      },
      end: function (v) { qa('[data-checks] li', v).forEach(function (li) { li.classList.add('is-ok'); }); v.querySelector('[data-approved]').classList.add('is-on'); }
    },
    'erp-done': {
      reset: function (v) {
        var st = v.querySelector('[data-status]'); st.className = 'pill wait'; st.textContent = 'Importing';
        qa('[data-attrs] div', v).forEach(function (a) { a.classList.remove('is-in'); });
        v.querySelector('[data-imp]').textContent = '0 / 214'; v.querySelector('[data-imp-bar]').style.width = '0';
      },
      play: async function (v, alive) {
        var attrs = qa('[data-attrs] div', v), imp = v.querySelector('[data-imp]'), bar = v.querySelector('[data-imp-bar]');
        for (var i = 0; i < attrs.length && alive(); i++) {
          await wait(320); attrs[i].classList.add('is-in');
          var n = Math.round(214 * (i + 1) / attrs.length); imp.textContent = n + ' / 214'; bar.style.width = (n / 214 * 100) + '%';
        }
        if (!alive()) return; await wait(300); var st = v.querySelector('[data-status]'); st.className = 'pill ok'; st.textContent = 'Complete';
      },
      end: function (v) { MOMENTS['erp-done'].reset(v); qa('[data-attrs] div', v).forEach(function (a) { a.classList.add('is-in'); }); v.querySelector('[data-imp]').textContent = '214 / 214'; v.querySelector('[data-imp-bar]').style.width = '100%'; var st = v.querySelector('[data-status]'); st.className = 'pill ok'; st.textContent = 'Complete'; }
    }
  };

  qa('[data-loop]', document).forEach(function (win) {
    var key = win.getAttribute('data-loop'), m = MOMENTS[key], v = win.querySelector('.scr-view');
    if (!m || !v) return;
    if (reduce) { m.end(v); return; }
    var visible = false, running = false;
    function alive() { return visible; }
    async function run() {
      if (running) return; running = true;
      while (visible) { m.reset(v); await m.play(v, alive); if (visible) await wait(2600); }
      running = false;
    }
    m.end(v);
    if (!('IntersectionObserver' in window)) { visible = true; run(); return; }
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) run(); }, { threshold: 0.4 }).observe(win);
  });

  /* ---------- One Network, Three Roles ----------
     The tabs turn by themselves while the section is on screen: Merchants & Wholesalers, then Producers, then
     Agencies & Importers, then round again. A click takes over for a while. Each role's right-hand visual plays
     its own live loop, and always rests on the finished state. */
  var tabsEl = document.querySelector('.roles-tabs');
  if (tabsEl) {
    var tabs = qa('.role-tab', document), panels = qa('.role-panel', document), order = tabs.map(function (t) { return t.getAttribute('data-role'); });
    var HOLD = 7000, current = 0, rotateTimer = null, resumeAt = 0, inView = false, runId = 0;
    tabsEl.style.setProperty('--hold', HOLD + 'ms');

    var RV = {
      merchants: async function (panel, alive) {
        var rows = qa('.rv2-row', panel);
        rows.forEach(function (r) { var st = r.querySelector('.rv2-state'); st.className = 'rv2-state'; st.innerHTML = '<i></i>Waiting'; r.querySelector('.rv2-act').textContent = 'Request sent'; });
        await wait(700);
        await Promise.all(rows.map(async function (r, i) {
          await wait(i * 650); if (!alive()) return;
          var st = r.querySelector('.rv2-state'), act = r.querySelector('.rv2-act');
          act.textContent = 'Entering data'; st.className = 'rv2-state is-mid';
          for (var n = 0; n <= 214 && alive(); n += 12) { st.innerHTML = '<i></i>' + Math.min(214, n) + ' of 214'; await wait(55); }
          if (!alive()) return;
          act.textContent = 'Record returned'; st.className = 'rv2-state is-done'; st.innerHTML = '<i></i>Complete';
        }));
      },
      producers: async function (panel, alive) {
        var tg = qa('.rv2-row[data-i] .rv2-toggle', panel);
        tg.forEach(function (t) { t.classList.remove('is-on'); t.style.animation = 'none'; t.style.setProperty('--x', '0'); });
        await wait(900);
        for (var i = 0; i < tg.length && alive(); i++) { tg[i].classList.add('is-on'); await wait(1200); }
      },
      agencies: async function (panel, alive) {
        var rule = panel.querySelector('.rv2-rule .rv2-toggle'), row = panel.querySelector('.rv2-row[data-i]'), st = row.querySelector('.rv2-state'), act = row.querySelector('.rv2-act');
        rule.classList.remove('is-on'); st.className = 'rv2-state'; st.innerHTML = '<i></i>Waiting'; act.textContent = 'New request';
        await wait(900); if (!alive()) return; rule.classList.add('is-on');
        await wait(1300); if (!alive()) return; act.textContent = 'Forwarded to agency'; st.className = 'rv2-state is-mid'; st.innerHTML = '<i></i>To agency';
        await wait(1700); if (!alive()) return; act.textContent = 'Refined for market'; st.className = 'rv2-state is-done'; st.innerHTML = '<i></i>Complete';
      }
    };
    function finalStates() {
      qa('.rv2-toggle', document).forEach(function (t) { t.style.animation = ''; });
      var m = document.querySelector('[data-panel="merchants"]'), a = document.querySelector('[data-panel="agencies"]'), p = document.querySelector('[data-panel="producers"]');
      qa('.rv2-row[data-i]', m).forEach(function (r) { r.querySelector('.rv2-act').textContent = 'Record returned'; var st = r.querySelector('.rv2-state'); st.className = 'rv2-state is-done'; st.innerHTML = '<i></i>Complete'; });
      qa('.rv2-row[data-i] .rv2-toggle', p).forEach(function (t) { t.classList.add('is-on'); });
      a.querySelector('.rv2-rule .rv2-toggle').classList.add('is-on');
      var ar = a.querySelector('.rv2-row[data-i]'); ar.querySelector('.rv2-act').textContent = 'Refined for market'; ar.querySelector('.rv2-state').className = 'rv2-state is-done'; ar.querySelector('.rv2-state').innerHTML = '<i></i>Complete';
    }

    function playVisual() {
      var role = order[current], panel = document.querySelector('[data-panel="' + role + '"]'), id = ++runId;
      if (reduce) { finalStates(); return; }
      (async function () {
        var alive = function () { return id === runId && inView; };
        while (alive()) { await RV[role](panel, alive); if (!alive()) break; await wait(Math.max(1200, HOLD - 4200)); }
      })();
    }
    function select(i, user) {
      current = (i + order.length) % order.length;
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === current)); t.classList.remove('is-timing'); });
      panels.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-panel') === order[current]); });
      void tabsEl.offsetWidth; if (!reduce && inView) tabs[current].classList.add('is-timing');
      if (tabsEl.scrollWidth > tabsEl.clientWidth) tabsEl.scrollTo({ left: tabs[current].offsetLeft - (tabsEl.clientWidth - tabs[current].offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      if (user) resumeAt = Date.now() + HOLD * 1.6;
      clearTimeout(rotateTimer); schedule();
      playVisual();
    }
    function schedule() {
      clearTimeout(rotateTimer);
      if (reduce || !inView) return;
      var delay = Math.max(HOLD, resumeAt - Date.now());
      tabs[current].classList.remove('is-timing'); void tabsEl.offsetWidth; tabs[current].classList.add('is-timing');
      rotateTimer = setTimeout(function () { select(current + 1, false); }, delay);
    }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { select(k, true); }); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { var was = inView; inView = e[0].isIntersecting; if (inView && !was) { schedule(); playVisual(); } else if (!inView) { clearTimeout(rotateTimer); runId++; tabs.forEach(function (t) { t.classList.remove('is-timing'); }); } }, { threshold: 0.4 }).observe(document.getElementById('solutions'));
    } else { inView = true; schedule(); playVisual(); }
  }
})();
