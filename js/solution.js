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

  var LINES = [
    ['09:41:02', 'Request <span class="hl">40-11873</span> from the merchant'],
    ['09:41:02', 'Producer matched'],
    ['09:41:02', '41 required fields set by the merchant'],
    ['09:41:03', '<span class="ok">Notification sent</span>']
  ];

  var MOMENTS = {
    'erp-new': {
      reset: function (v) { clearInputs(v); var b = v.querySelector('[data-btn]'); b.textContent = 'Request product data via WIN'; b.classList.remove('is-done'); },
      play: async function (v, alive) {
        await wait(500);
        var inps = qa('.inp[data-type]', v);
        for (var i = 0; i < inps.length && alive(); i++) await typeInto(inps[i], 55, alive);
        if (!alive()) return; await wait(400); await press(v.querySelector('[data-btn]'), 'Request sent ✓');
      },
      end: function (v) { fillInputs(v); var b = v.querySelector('[data-btn]'); b.textContent = 'Request sent ✓'; b.classList.add('is-done'); }
    },
    'win-route': {
      reset: function (v) { v.querySelector('[data-lines]').innerHTML = ''; },
      play: async function (v, alive) {
        var ol = v.querySelector('[data-lines]'); await wait(400);
        for (var i = 0; i < LINES.length && alive(); i++) {
          var li = document.createElement('li'); li.innerHTML = '<time>' + LINES[i][0] + '</time><span>' + LINES[i][1] + '</span>';
          ol.appendChild(li); await wait(650);
        }
      },
      end: function (v) { v.querySelector('[data-lines]').innerHTML = LINES.map(function (l) { return '<li><time>' + l[0] + '</time><span>' + l[1] + '</span></li>'; }).join(''); }
    },
    'mail': {
      reset: function (v) { v.querySelector('.mail.is-new').classList.remove('is-arrive'); },
      play: async function (v) { var m = v.querySelector('.mail.is-new'); await wait(500); void m.offsetWidth; m.classList.add('is-arrive'); await wait(1800); },
      end: function () {}
    },
    'form': {
      reset: function (v) { clearInputs(v); var b = v.querySelector('[data-btn]'); b.textContent = 'Send to WIN'; b.classList.remove('is-done'); v.querySelector('[data-count]').textContent = '32 / 41 required fields'; },
      play: async function (v, alive) {
        var inps = qa('.inp[data-type]', v), c = v.querySelector('[data-count]'); await wait(400);
        for (var i = 0; i < inps.length && alive(); i++) { await typeInto(inps[i], 45, alive); c.textContent = (32 + (i + 1) * 3) + ' / 41 required fields'; }
        if (!alive()) return; c.textContent = '41 / 41 required fields';
        await wait(400); await press(v.querySelector('[data-btn]'), 'Sent ✓');
      },
      end: function (v) { fillInputs(v); v.querySelector('[data-count]').textContent = '41 / 41 required fields'; var b = v.querySelector('[data-btn]'); b.textContent = 'Sent ✓'; b.classList.add('is-done'); }
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

  /* ---------- Roles tabs (One Network, Three Roles) ---------- */
  var tabs = document.querySelectorAll('.role-tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      var r = t.getAttribute('data-role');
      tabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === t)); });
      document.querySelectorAll('.role-panel').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-panel') === r); });
    });
  });
})();
