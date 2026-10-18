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
    if (doneText) setDone(btn, doneText);
  }
  /* success state: a tick draws itself (circle, then check) before the label */
  function setDone(btn, text) {
    btn.innerHTML = '<svg class="btn-tick" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M7.6 12.6l3 3 5.8-6.4"></path></svg><span>' + text + '</span>';
    btn.classList.add('is-done');
  }
  function clearInputs(v) { qa('.inp[data-type]', v).forEach(function (i) { i.querySelector('.tv').textContent = ''; i.classList.remove('is-ok', 'is-typing'); }); }
  function fillInputs(v) { qa('.inp[data-type]', v).forEach(function (i) { i.querySelector('.tv').textContent = i.getAttribute('data-type'); i.classList.add('is-ok'); }); }

  var CODE = [
    ['09:41:02', 'Request <span class="hl">40-11873</span> from the merchant'],
    ['09:41:02', 'Article: Riesling, dry 2025'],
    ['09:41:02', 'Producer matched'],
    ['09:41:02', '41 required fields set by the merchant'],
    ['09:41:02', 'Request validated'],
    ['09:41:03', 'Notification queued'],
    ['09:41:03', '<span class="ok">Notification sent to the producer</span>'],
    ['09:41:03', 'Waiting for the producer ...']
  ];
  CODE = CODE.map(function (l) { return [l[0], window.WINi18n ? window.WINi18n.t(l[1]) : l[1]]; });
  function codeSegments(html) {
    var d = document.createElement('div'); d.innerHTML = html; var out = [];
    Array.prototype.forEach.call(d.childNodes, function (n) { out.push({ text: n.textContent, cls: n.nodeType === 1 ? n.className : '' }); });
    return out;
  }
  function codeLine(l) { return '<div class="cl"><time>' + l[0] + '</time><span class="txt">' + l[1] + '</span></div>'; }

  var MOMENTS = {
    'erp-new': {
      reset: function (v) { clearInputs(v); var b = v.querySelector('[data-btn]'); b.textContent = 'Submit Request'; b.classList.remove('is-done'); },
      play: async function (v, alive) {
        await wait(500);
        var inps = qa('.inp[data-type]', v);
        for (var i = 0; i < inps.length && alive(); i++) await typeInto(inps[i], 50, alive);
        if (!alive()) return; await wait(500); await press(v.querySelector('[data-btn]'), 'Request Sent');
      },
      end: function (v) { fillInputs(v); setDone(v.querySelector('[data-btn]'), 'Request Sent'); }
    },
    'win-route': {
      reset: function (v) { v.querySelector('[data-lines]').innerHTML = ''; },
      play: async function (v, alive) {
        var box = v.querySelector('[data-lines]'); await wait(500);
        for (var i = 0; i < CODE.length && alive(); i++) {
          var line = document.createElement('div'); line.className = 'cl is-typing';
          line.innerHTML = '<time>' + CODE[i][0] + '</time><span class="txt"></span>';
          box.querySelectorAll('.is-typing').forEach(function (p) { p.classList.remove('is-typing'); });
          box.appendChild(line);
          var txt = line.querySelector('.txt'), segs = codeSegments(CODE[i][1]);
          for (var s = 0; s < segs.length && alive(); s++) {          /* typed one character at a time, keeping the colours */
            var el = document.createElement('span'); if (segs[s].cls) el.className = segs[s].cls; txt.appendChild(el);
            for (var c = 0; c < segs[s].text.length && alive(); c++) { el.textContent += segs[s].text[c]; await wait(segs[s].text[c] === ' ' ? 14 : 24); }
          }
          await wait(320);
        }
      },
      end: function (v) { v.querySelector('[data-lines]').innerHTML = CODE.map(codeLine).join(''); }
    },
    'mail': {
      reset: function (v) {
        var row = v.querySelector('.mx-row.is-new'); row.classList.add('is-collapsed'); row.classList.remove('is-fresh');
        v.querySelector('.mx-drawer').classList.remove('is-show');
      },
      play: async function (v, alive) {
        var row = v.querySelector('.mx-row.is-new'), drawer = v.querySelector('.mx-drawer');
        await wait(900); if (!alive()) return;
        drawer.classList.add('is-show');                      /* a "New Mail" drawer slides in at the bottom right */
        await wait(1100); if (!alive()) return;
        row.classList.remove('is-collapsed'); row.classList.add('is-fresh');   /* the mail slides in at the top, the rest move down */
        await wait(700); drawer.classList.remove('is-show');  /* the drawer goes away */
        await wait(600);
      },
      end: function (v) { v.querySelector('.mx-row.is-new').classList.remove('is-collapsed'); }
    },
    'form': {
      reset: function (v) { clearInputs(v); var b = v.querySelector('[data-btn]'); b.textContent = 'Send to WIN'; b.classList.remove('is-done'); v.querySelector('[data-count]').textContent = '32 / 41 required fields'; },
      play: async function (v, alive) {
        var inps = qa('.inp[data-type]', v), c = v.querySelector('[data-count]'); await wait(400);
        for (var i = 0; i < inps.length && alive(); i++) { await typeInto(inps[i], 45, alive); c.textContent = (32 + (i + 1) * 3) + ' / 41 required fields'; }
        if (!alive()) return; c.textContent = '41 / 41 required fields';
        await wait(400); await press(v.querySelector('[data-btn]'), 'Sent');
      },
      end: function (v) { fillInputs(v); v.querySelector('[data-count]').textContent = '41 / 41 required fields'; setDone(v.querySelector('[data-btn]'), 'Sent'); }
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

    var RV = {
      /* each role's right-hand preview builds up piece by piece, then rests on the finished picture */
      merchants: async function (panel, alive) {
        var rows = qa('.rv2-row', panel);
        rows.forEach(function (r) { r.classList.add('is-off'); });
        await wait(700);
        for (var i = 0; i < rows.length && alive(); i++) { rows[i].classList.remove('is-off'); await wait(900); }
      },
      producers: async function (panel, alive) {
        var rec = panel.querySelector('.rv2-record'), items = qa('.rv2-fields li', panel), pill = rec.querySelector('.rv2-state'), req = panel.querySelector('.rv2-req');
        items.forEach(function (li) { li.classList.add('is-off'); }); pill.classList.add('is-off'); req.classList.add('is-off');
        await wait(700);
        for (var i = 0; i < items.length && alive(); i++) { items[i].classList.remove('is-off'); await wait(480); }
        if (!alive()) return; pill.classList.remove('is-off'); await wait(800);
        if (!alive()) return; req.classList.remove('is-off');
      },
      agencies: async function (panel, alive) {
        var rule = panel.querySelector('.rv2-rule .rv2-toggle'), rec = panel.querySelector('.rv2-record'), items = qa('.rv2-fields li', panel), pill = rec.querySelector('.rv2-state');
        rule.classList.remove('is-on'); items.forEach(function (li) { li.classList.add('is-off'); }); pill.classList.add('is-off');
        await wait(900); if (!alive()) return; rule.classList.add('is-on');
        await wait(1000);
        for (var i = 0; i < items.length && alive(); i++) { items[i].classList.remove('is-off'); await wait(560); }
        if (!alive()) return; pill.classList.remove('is-off');
      }
    };
    function finalStates() {
      qa('.is-off', document).forEach(function (e) { e.classList.remove('is-off'); });
      qa('.rv2-rule .rv2-toggle', document).forEach(function (t) { t.classList.add('is-on'); });
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
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === current)); });
      panels.forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-panel') === order[current]); });
      if (tabsEl.scrollWidth > tabsEl.clientWidth) tabsEl.scrollTo({ left: tabs[current].offsetLeft - (tabsEl.clientWidth - tabs[current].offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' });
      if (user) resumeAt = Date.now() + HOLD * 1.6;
      clearTimeout(rotateTimer); schedule();
      playVisual();
    }
    var overCard = false;
    function schedule(fixed) {
      clearTimeout(rotateTimer);
      if (reduce || !inView || overCard) return;
      var delay = fixed || Math.max(HOLD, resumeAt - Date.now());
      rotateTimer = setTimeout(function () { select(current + 1, false); }, delay);
    }
    tabs.forEach(function (t, k) { t.addEventListener('click', function () { select(k, true); }); });
    /* while the pointer rests on the card the tabs stay put (the preview inside keeps looping); a few seconds after it leaves, rotation resumes */
    panels.forEach(function (p) {
      p.addEventListener('mouseenter', function () { overCard = true; clearTimeout(rotateTimer); });
      p.addEventListener('mouseleave', function () { overCard = false; schedule(3000); });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { var was = inView; inView = e[0].isIntersecting; if (inView && !was) { schedule(); playVisual(); } else if (!inView) { clearTimeout(rotateTimer); runId++; } }, { threshold: 0.4 }).observe(document.getElementById('solutions'));
    } else { inView = true; schedule(); playVisual(); }
  }
})();
