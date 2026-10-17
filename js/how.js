/* How it works v4.
   Top: the data lane. A record card moves between merchant, WIN, producer and
   trade agency and shows what it carries (request, forwarded, data entered,
   validated, complete). Below: the step list and the screen of whoever holds it.
   Plays the trade-agency run, then the direct run, and loops while on screen. */
(function () {
  var section = document.getElementById('how');
  var lane = section && section.querySelector('#lane');
  if (!lane) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var q = function (sel, root) { return (root || section).querySelector(sel); };
  var qa = function (sel, root) { return Array.prototype.slice.call((root || section).querySelectorAll(sel)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  var record = q('#record'), recTag = q('#recTag'), recDir = q('#recDir'), recBar = q('#recBar'), recCount = q('#recCount'), fill = q('#laneFill');
  var who = q('#scrWho'), url = q('#scrUrl'), steps = q('#howSteps'), playBtn = q('#howPlay');
  var nodes = {}; qa('.party').forEach(function (n) { nodes[n.getAttribute('data-node')] = n; });
  var COL = { merchant: 12.5, win: 37.5, producer: 62.5, agency: 87.5 };
  var at = 'merchant';
  var views = {}; qa('.scr-view').forEach(function (v) { views[v.getAttribute('data-screen')] = v; });

  var playing = !reduce, visible = false, running = false;
  function alive() { return visible; }
  async function holdWhilePaused() { while (!playing && visible) await wait(200); }

  /* ---------- helpers for the screens ---------- */
  async function typeInto(inp, speed) {
    var text = inp.getAttribute('data-type'), tv = inp.querySelector('.tv');
    inp.classList.remove('is-ok'); inp.classList.add('is-typing'); tv.textContent = '';
    for (var i = 0; i < text.length && alive(); i++) { tv.textContent += text[i]; await wait(speed || 45); }
    inp.classList.remove('is-typing'); inp.classList.add('is-ok');
    await wait(140);
  }
  async function press(btn, doneText) {
    btn.classList.add('is-press'); await wait(160); btn.classList.remove('is-press');
    if (doneText) { btn.textContent = doneText; btn.classList.add('is-done'); }
  }
  function show(screen) { Object.keys(views).forEach(function (k) { views[k].classList.toggle('is-on', k === screen); }); }
  function focusNode(k) { Object.keys(nodes).forEach(function (n) { nodes[n].classList.toggle('is-active', n === k); }); }

  /* The record card moves along the lane to its next holder and shows what it now carries */
  function setRecord(r) {
    if (r.tag) recTag.textContent = r.tag;
    if (r.fields !== undefined) { recCount.textContent = r.fields + ' / 214 fields'; recBar.style.width = Math.max(1, r.fields / 214 * 100) + '%'; }
    record.classList.toggle('is-data', !!r.data);
    fill.classList.toggle('is-data', !!r.data);
  }
  function moveTo(target, r) {
    return new Promise(function (resolve) {
      var a = COL[at], b = COL[target];
      var px = function (x) { return (x - 12.5) / 75 * 100; };
      recDir.textContent = b >= a ? '→' : '←';
      fill.style.setProperty('--from', Math.min(px(a), px(b)) + '%');
      fill.style.setProperty('--w', Math.abs(px(b) - px(a)) + '%');
      setRecord(r || {});
      record.style.setProperty('--rx', b + '%');
      at = target;
      setTimeout(function () { fill.style.setProperty('--w', '0%'); fill.style.setProperty('--from', px(b) + '%'); resolve(); }, reduce ? 0 : 1150);
    });
  }

  /* ---------- screen actions ---------- */
  var act = {
    erpNew: async function () {
      var v = views['erp-new'], btn = q('[data-btn]', v);
      qa('.inp[data-type]', v).forEach(function (i) { i.querySelector('.tv').textContent = ''; i.classList.remove('is-ok'); });
      btn.textContent = 'Request product data via WIN'; btn.classList.remove('is-done');
      await wait(400);
      var inps = qa('.inp[data-type]', v);
      for (var i = 0; i < inps.length && alive(); i++) await typeInto(inps[i], 45);
      await wait(350); await press(btn, 'Request sent ✓');
    },
    winRoute: async function (run) {
      var ol = q('[data-lines]', views['win-route']); ol.innerHTML = '';
      var lines = [
        ['09:41:02', 'Request <span class="hl">40-11873</span> from Hawesko'],
        ['09:41:02', 'Producer matched: Weingut Schloss Gobelsburg'],
        run === 'agency' ? ['09:41:02', 'Forwarding rule found → <span class="hl">Pellegrini (DE)</span>'] : ['09:41:02', 'No forwarding rule, producer answers directly'],
        ['09:41:03', '<span class="ok">Notification sent</span>']
      ];
      for (var i = 0; i < lines.length && alive(); i++) {
        var li = document.createElement('li'); li.innerHTML = '<time>' + lines[i][0] + '</time><span>' + lines[i][1] + '</span>';
        ol.appendChild(li); await wait(520);
      }
    },
    mail: async function (run) {
      var v = views.mail, m = q('.mail.is-new', v), tag = q('[data-agency]', v);
      tag.style.display = run === 'agency' ? '' : 'none';
      m.classList.remove('is-arrive'); void m.offsetWidth; m.classList.add('is-arrive');
      await wait(1800);
    },
    agencyInbox: async function () {
      var v = views['agency-inbox'], row = q('.req-row.is-new', v), btn = q('[data-btn]', row);
      row.classList.remove('is-arrive'); void row.offsetWidth; row.classList.add('is-arrive');
      await wait(1300); await press(btn);
      await wait(300);
    },
    form: async function (run) {
      var v = views.form, frm = q('.frm', v), btn = q('[data-btn]', v), count = q('[data-count]', v);
      frm.classList.toggle('has-agency', run === 'agency');
      q('#formFor').textContent = run === 'agency' ? 'Refined for DE market' : 'For Hawesko';
      qa('.inp[data-type]', v).forEach(function (i) { i.querySelector('.tv').textContent = ''; i.classList.remove('is-ok'); });
      btn.textContent = 'Send to WIN'; btn.classList.remove('is-done');
      var inps = qa('.inp[data-type]', v).filter(function (i) { return getComputedStyle(i).display !== 'none'; });
      var total = 41, start = total - inps.length * 3 - 2;
      count.textContent = start + ' / 41 required fields';
      await wait(300);
      for (var i = 0; i < inps.length && alive(); i++) { await typeInto(inps[i], 38); count.textContent = Math.min(total, start + (i + 1) * 3 + (i === inps.length - 1 ? 2 : 0)) + ' / 41 required fields'; }
      count.textContent = '41 / 41 required fields';
      await wait(350); await press(btn, 'Sent ✓');
    },
    winCheck: async function () {
      var v = views['win-check'], items = qa('[data-checks] li', v), ok = q('[data-approved]', v);
      items.forEach(function (li) { li.classList.remove('is-ok'); }); ok.classList.remove('is-on');
      for (var i = 0; i < items.length && alive(); i++) { await wait(420); items[i].classList.add('is-ok'); }
      await wait(250); ok.classList.add('is-on'); await wait(600);
    },
    erpDone: async function (run) {
      var v = views['erp-done'], st = q('[data-status]', v), attrs = qa('[data-attrs] div', v), imp = q('[data-imp]', v), bar = q('[data-imp-bar]', v);
      q('[data-source]', v).textContent = run === 'agency' ? 'Pellegrini for Schloss Gobelsburg' : 'Schloss Gobelsburg';
      st.className = 'pill wait'; st.textContent = 'Importing'; attrs.forEach(function (a) { a.classList.remove('is-in'); }); imp.textContent = '0 / 214'; bar.style.width = '0';
      for (var i = 0; i < attrs.length && alive(); i++) {
        await wait(230); attrs[i].classList.add('is-in');
        var n = Math.round(214 * (i + 1) / attrs.length); imp.textContent = n + ' / 214'; bar.style.width = (n / 214 * 100) + '%';
      }
      await wait(250); st.className = 'pill ok'; st.textContent = 'Complete';
      await wait(900);
    }
  };

  /* ---------- the two runs ---------- */
  var M = { who: 'Merchant · Hawesko', node: 'merchant' };
  var W = { who: 'WIN · EuvinoPRO', node: 'win' };
  var RUNS = {
    agency: [
      { m: M, t: 'Merchant creates the article', url: 'erp.hawesko.de/articles/new', screen: 'erp-new', fn: 'erpNew', rec: { tag: 'Product request', fields: 2 }, d: 'Article number, producer, wine name and vintage. That is all the merchant types.' },
      { m: W, t: 'WIN routes the request', move: 'win', url: 'backend.euvinopro.eu/win/routing', screen: 'win-route', fn: 'winRoute', rec: { tag: 'Request · routing', fields: 2 }, d: 'WIN finds the producer, and their forwarding rule to a trade agency.' },
      { m: { who: 'Producer · Weingut Schloss Gobelsburg', node: 'producer' }, t: 'Producer is notified', move: 'producer', url: 'mail.gobelsburg.at/inbox', screen: 'mail', fn: 'mail', rec: { tag: 'Request · notified', fields: 2 }, d: 'The producer gets an email. Their rule passes the request on automatically.' },
      { m: { who: 'Trade agency · Pellegrini', node: 'agency' }, t: 'Forwarded to the agency', move: 'agency', url: 'backend.euvinopro.eu/agency/requests', screen: 'agency-inbox', fn: 'agencyInbox', rec: { tag: 'Forwarded request', fields: 2 }, d: 'The agency that represents the wine in Germany receives it.' },
      { m: { who: 'Trade agency · Pellegrini', node: 'agency' }, t: 'Agency fills in the data', url: 'backend.euvinopro.eu/agency/requests/40-11873', screen: 'form', fn: 'form', rec: { tag: 'Data entered', fields: 214, data: true }, d: 'Every field is checked as it is typed, including a German description.' },
      { m: W, t: 'WIN validates the record', move: 'win', url: 'backend.euvinopro.eu/win/validation', screen: 'win-check', fn: 'winCheck', rec: { tag: 'Validating', fields: 214, data: true }, d: 'Checked against the law and against Hawesko\'s 41 required fields.' },
      { m: M, t: 'Imported into the ERP', move: 'merchant', url: 'erp.hawesko.de/articles/40-11873', screen: 'erp-done', fn: 'erpDone', rec: { tag: 'Complete ✓', fields: 214, data: true }, d: 'The complete record lands in the merchant\'s ERP, ready to sell.' }
    ],
    direct: [
      { m: M, t: 'Merchant creates the article', url: 'erp.hawesko.de/articles/new', screen: 'erp-new', fn: 'erpNew', rec: { tag: 'Product request', fields: 2 }, d: 'Article number, producer, wine name and vintage. That is all the merchant types.' },
      { m: W, t: 'WIN routes the request', move: 'win', url: 'backend.euvinopro.eu/win/routing', screen: 'win-route', fn: 'winRoute', rec: { tag: 'Request · routing', fields: 2 }, d: 'WIN finds the producer behind the wine. No agency involved.' },
      { m: { who: 'Producer · Weingut Schloss Gobelsburg', node: 'producer' }, t: 'Producer is notified', move: 'producer', url: 'mail.gobelsburg.at/inbox', screen: 'mail', fn: 'mail', rec: { tag: 'Request · notified', fields: 2 }, d: 'The producer gets an email with a link to the request.' },
      { m: { who: 'Producer · Weingut Schloss Gobelsburg', node: 'producer' }, t: 'Producer fills in the data', url: 'backend.euvinopro.eu/producer/requests/40-11873', screen: 'form', fn: 'form', rec: { tag: 'Data entered', fields: 214, data: true }, d: 'Once, in the WIN app or straight from their own ERP. Every field is checked.' },
      { m: W, t: 'WIN validates the record', move: 'win', url: 'backend.euvinopro.eu/win/validation', screen: 'win-check', fn: 'winCheck', rec: { tag: 'Validating', fields: 214, data: true }, d: 'Checked against the law and against Hawesko\'s 41 required fields.' },
      { m: M, t: 'Imported into the ERP', move: 'merchant', url: 'erp.hawesko.de/articles/40-11873', screen: 'erp-done', fn: 'erpDone', rec: { tag: 'Complete ✓', fields: 214, data: true }, d: 'The complete record lands in the merchant\'s ERP, ready to sell.' }
    ]
  };
  var ORDER = ['agency', 'direct'];

  function setRun(run) {
    lane.setAttribute('data-run', run);
    qa('.run').forEach(function (r) { r.classList.toggle('is-on', r.getAttribute('data-run') === run); });
    steps.innerHTML = RUNS[run].map(function (s, i) {
      return '<li><span class="n">' + String(i + 1).padStart(2, '0') + '</span><div><span class="who">' + s.m.who.split(' · ')[0] + '</span><h4>' + s.t + '</h4><p>' + s.d + '</p></div></li>';
    }).join('');
    /* new run: the record starts again at the merchant */
    record.style.transition = 'none'; record.style.setProperty('--rx', COL.merchant + '%'); at = 'merchant';
    void record.offsetWidth; record.style.transition = '';
    setRecord({ tag: 'Draft', fields: 0, data: false });
  }
  function markStep(i) {
    qa('li', steps).forEach(function (li, n) { li.classList.toggle('is-done', n < i); li.classList.toggle('is-active', n === i); });
  }

  async function playScene(run, s, i) {
    markStep(i);
    if (s.move) { focusNode(null); await moveTo(s.move, { tag: s.rec.tag, data: s.rec.data && s.fn !== 'form' ? true : s.rec.data }); }
    focusNode(s.m.node);
    who.textContent = s.m.who; url.textContent = s.url;
    show(s.screen);
    if (!s.move) setRecord({ tag: s.rec.tag });
    await wait(300);
    await act[s.fn](run);
    setRecord(s.rec);
    await wait(800);
  }

  async function loop() {
    if (running) return; running = true;
    while (visible) {
      for (var r = 0; r < ORDER.length && visible; r++) {
        var run = ORDER[r]; setRun(run);
        for (var i = 0; i < RUNS[run].length && visible; i++) { await holdWhilePaused(); if (!visible) break; await playScene(run, RUNS[run][i], i); }
        if (visible) { markStep(RUNS[run].length); await wait(1200); }
      }
    }
    running = false;
  }

  playBtn.addEventListener('click', function () {
    playing = !playing; playBtn.textContent = playing ? 'Pause' : 'Play'; playBtn.setAttribute('aria-label', playBtn.textContent);
    section.classList.toggle('is-paused', !playing);
  });

  /* Static end state for reduced motion */
  if (reduce) {
    setRun('agency'); markStep(99); focusNode('merchant');
    var last = RUNS.agency[RUNS.agency.length - 1];
    who.textContent = last.m.who; url.textContent = last.url; show(last.screen); setRecord(last.rec);
    qa('[data-attrs] div').forEach(function (a) { a.classList.add('is-in'); });
    q('[data-status]').className = 'pill ok'; q('[data-status]').textContent = 'Complete'; q('[data-imp]').textContent = '214 / 214'; q('[data-imp-bar]').style.width = '100%';
    playBtn.hidden = true; return;
  }
  setRun('agency'); show('erp-new'); focusNode('merchant'); markStep(0);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }, { threshold: 0.35 }).observe(section);
  } else { visible = true; loop(); }
})();
