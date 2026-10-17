/* How it works v3.
   Left: the network (merchant, WIN, producer, trade agency) with a labelled packet
   showing what is flowing. Right: the screen of whoever the data just reached.
   Plays the trade-agency run, then the direct run, and loops while on screen. */
(function () {
  var section = document.getElementById('how');
  var net = section && section.querySelector('.net');
  if (!net) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var q = function (sel, root) { return (root || section).querySelector(sel); };
  var qa = function (sel, root) { return Array.prototype.slice.call((root || section).querySelectorAll(sel)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  var packet = q('#netPacket'), label = q('#netLabel'), caption = q('#netCaption');
  var who = q('#scrWho'), url = q('#scrUrl'), steps = q('#scrSteps'), playBtn = q('#howPlay');
  var nodes = {}; qa('.net-node').forEach(function (n) { nodes[n.getAttribute('data-node')] = n; });
  var views = {}; qa('.scr-view').forEach(function (v) { views[v.getAttribute('data-screen')] = v; });
  var VB = { w: 440, h: 380 };

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

  /* Move the packet along an SVG edge, in percent of the diagram box */
  function travel(edgeId, reverse, text, data) {
    return new Promise(function (resolve) {
      var path = document.getElementById(edgeId), len = path.getTotalLength();
      qa('.edge').forEach(function (e) { e.classList.remove('is-live', 'is-data'); });
      path.classList.add('is-live'); if (data) path.classList.add('is-data');
      label.textContent = text; packet.classList.toggle('is-data', !!data); packet.style.opacity = 1;
      var t0 = null, dur = reduce ? 1 : 1100;
      function frame(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur), e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        var pt = path.getPointAtLength((reverse ? 1 - e : e) * len);
        packet.style.left = (pt.x / VB.w * 100) + '%'; packet.style.top = (pt.y / VB.h * 100) + '%';
        if (p < 1) requestAnimationFrame(frame);
        else { packet.style.opacity = 0; path.classList.remove('is-live', 'is-data'); resolve(); }
      }
      requestAnimationFrame(frame);
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
      { m: M, url: 'erp.hawesko.de/articles/new', screen: 'erp-new', fn: 'erpNew', cap: '<b>The merchant creates the article</b> in their ERP and asks WIN for the product data.' },
      { m: W, edge: 'e-mw', text: 'Product request', url: 'backend.euvinopro.eu/win/routing', screen: 'win-route', fn: 'winRoute', cap: '<b>WIN receives the request</b> and finds the producer and their forwarding rule.' },
      { m: { who: 'Producer · Weingut Schloss Gobelsburg', node: 'producer' }, edge: 'e-wp', text: 'Notification', url: 'mail.gobelsburg.at/inbox', screen: 'mail', fn: 'mail', cap: '<b>The producer is notified.</b> Their rule passes the request on automatically.' },
      { m: { who: 'Trade agency · Pellegrini', node: 'agency' }, edge: 'e-pa', text: 'Forwarded request', url: 'backend.euvinopro.eu/agency/requests', screen: 'agency-inbox', fn: 'agencyInbox', cap: '<b>The trade agency receives the request</b> for the German market.' },
      { m: { who: 'Trade agency · Pellegrini', node: 'agency' }, url: 'backend.euvinopro.eu/agency/requests/40-11873', screen: 'form', fn: 'form', cap: '<b>The agency fills in and refines the data</b>, including a German description.' },
      { m: W, edge: 'e-aw', text: 'Product data', data: true, url: 'backend.euvinopro.eu/win/validation', screen: 'win-check', fn: 'winCheck', cap: '<b>WIN checks every field</b> against the law and Hawesko\'s requirements.' },
      { m: M, edge: 'e-mw', rev: true, text: 'Validated record', data: true, url: 'erp.hawesko.de/articles/40-11873', screen: 'erp-done', fn: 'erpDone', cap: '<b>The complete record lands in the merchant\'s ERP</b>, ready to sell.' }
    ],
    direct: [
      { m: M, url: 'erp.hawesko.de/articles/new', screen: 'erp-new', fn: 'erpNew', cap: '<b>The merchant creates the article</b> in their ERP and asks WIN for the product data.' },
      { m: W, edge: 'e-mw', text: 'Product request', url: 'backend.euvinopro.eu/win/routing', screen: 'win-route', fn: 'winRoute', cap: '<b>WIN receives the request</b> and routes it to the producer.' },
      { m: { who: 'Producer · Weingut Schloss Gobelsburg', node: 'producer' }, edge: 'e-wp', text: 'Notification', url: 'mail.gobelsburg.at/inbox', screen: 'mail', fn: 'mail', cap: '<b>The producer gets an email</b> with a link to the request.' },
      { m: { who: 'Producer · Weingut Schloss Gobelsburg', node: 'producer' }, url: 'backend.euvinopro.eu/producer/requests/40-11873', screen: 'form', fn: 'form', cap: '<b>The producer fills in the data</b> once, in the WIN app or from their own ERP.' },
      { m: W, edge: 'e-wp', rev: true, text: 'Product data', data: true, url: 'backend.euvinopro.eu/win/validation', screen: 'win-check', fn: 'winCheck', cap: '<b>WIN checks every field</b> against the law and Hawesko\'s requirements.' },
      { m: M, edge: 'e-mw', rev: true, text: 'Validated record', data: true, url: 'erp.hawesko.de/articles/40-11873', screen: 'erp-done', fn: 'erpDone', cap: '<b>The complete record lands in the merchant\'s ERP</b>, ready to sell.' }
    ]
  };
  var ORDER = ['agency', 'direct'];

  function setRun(run) {
    net.setAttribute('data-run', run);
    qa('.run').forEach(function (r) { r.classList.toggle('is-on', r.getAttribute('data-run') === run); });
    steps.innerHTML = RUNS[run].map(function () { return '<li><i></i></li>'; }).join('');
  }
  function markStep(i) {
    qa('li', steps).forEach(function (li, n) { li.classList.toggle('is-done', n < i); li.classList.toggle('is-active', n === i); });
  }

  async function playScene(run, s, i) {
    markStep(i);
    if (s.edge) { focusNode(null); await travel(s.edge, s.rev, s.text, s.data); }
    focusNode(s.m.node);
    who.textContent = s.m.who; url.textContent = s.url; caption.innerHTML = s.cap;
    show(s.screen);
    await wait(300);
    await act[s.fn](run);
    await wait(700);
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
    who.textContent = last.m.who; url.textContent = last.url; caption.innerHTML = last.cap; show(last.screen);
    qa('[data-attrs] div').forEach(function (a) { a.classList.add('is-in'); });
    q('[data-status]').className = 'pill ok'; q('[data-status]').textContent = 'Complete'; q('[data-imp]').textContent = '214 / 214'; q('[data-imp-bar]').style.width = '100%';
    playBtn.hidden = true; return;
  }
  setRun('agency'); show('erp-new'); focusNode('merchant'); caption.innerHTML = RUNS.agency[0].cap;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }, { threshold: 0.35 }).observe(section);
  } else { visible = true; loop(); }
})();
