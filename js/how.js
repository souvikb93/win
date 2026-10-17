/* How it works v7. Follows WIN's own two diagrams step for step:
   direct (6 steps) and via a trade agency (8 steps, with the producer's one-time
   forwarding rule and WIN notifying the agency directly).
   Left: premium cards for merchant, WIN, producer and agency. The active card and
   its screen share the purple outline; when data moves, the screen folds back into
   the sender's card, the packet travels, and the next screen opens out of the
   receiver's card. Right: the official step list, highlighted as it plays.
   Plays the trade-agency run, then the direct run, and loops while on screen. */
(function () {
  var section = document.getElementById('how');
  if (!section || !section.querySelector('#net2')) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var q = function (sel, root) { return (root || section).querySelector(sel); };
  var qa = function (sel, root) { return Array.prototype.slice.call((root || section).querySelectorAll(sel)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  var net = q('#net2'), packet = q('#netPacket'), label = q('#netLabel'), lines = q('#netLines');
  var scrWin = q('#scrWin'), sending = q('#scrSending'), sendingText = q('#scrSendingText'), scrIco = q('#scrIco');
  var who = q('#scrWho'), url = q('#scrUrl'), steps = q('#howSteps'), playBtn = q('#howPlay');
  var nodes = {}; qa('.nc').forEach(function (n) { nodes[n.getAttribute('data-node')] = n; });
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

  /* ---------- the network ---------- */
  var LINE = { 'merchant|win': 'l-mw', 'win|producer': 'l-wp', 'win|agency': 'l-wa' };
  var EDGE = { 'd-mw': ['merchant', 'win'], 'd-wp': ['win', 'producer'], 'd-wa': ['win', 'agency'] };
  var NAME = { merchant: 'Merchant', win: 'WIN', producer: 'Producer', agency: 'Trade agency' };
  function centre(k, rel) {
    var r = nodes[k].getBoundingClientRect(), R = rel.getBoundingClientRect();
    return { x: r.left + r.width / 2 - R.left, y: r.top + r.height / 2 - R.top };
  }
  function drawLines() {
    Object.keys(LINE).forEach(function (pair) {
      var ab = pair.split('|'), a = centre(ab[0], net), b = centre(ab[1], net), path = document.getElementById(LINE[pair]);
      path.setAttribute('d', 'M' + a.x + ' ' + a.y + ' L' + b.x + ' ' + b.y);
    });
  }
  function lineFor(a, b) { return document.getElementById(LINE[a + '|' + b] || LINE[b + '|' + a]); }

  /* Packet travels between two card centres; it passes under the cards, so you see it on the link */
  function travel(from, to, text, data) {
    return new Promise(function (resolve) {
      var A = centre(from, net), B = centre(to, net), line = lineFor(from, to);
      line.classList.add('is-live'); line.classList.toggle('is-data', !!data);
      label.textContent = text; packet.classList.toggle('is-data', !!data); packet.style.opacity = 1;
      var t0 = null, dur = reduce ? 1 : 1150;
      function frame(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur), e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        packet.style.left = (A.x + (B.x - A.x) * e) + 'px'; packet.style.top = (A.y + (B.y - A.y) * e) + 'px';
        if (p < 1) requestAnimationFrame(frame);
        else { packet.style.opacity = 0; line.classList.remove('is-live', 'is-data'); resolve(); }
      }
      requestAnimationFrame(frame);
    });
  }

  /* The screen folds into a card, or opens out of one */
  function originAt(k) {
    var c = centre(k, scrWin);
    scrWin.style.setProperty('--fx', c.x + 'px'); scrWin.style.setProperty('--fy', c.y + 'px');
  }
  async function fold(k) {
    originAt(k); scrWin.classList.remove('is-opening');
    void scrWin.offsetWidth; scrWin.classList.add('is-folded');
    await wait(reduce ? 0 : 480);
  }
  async function open(k) {
    scrWin.style.transition = 'none'; originAt(k); void scrWin.offsetWidth; scrWin.style.transition = '';
    scrWin.classList.add('is-opening'); scrWin.classList.remove('is-folded');
    await wait(reduce ? 0 : 620);
    scrWin.classList.remove('is-opening');
  }
  function setParty(s) {
    who.textContent = s.party; url.textContent = s.url;
    var src = nodes[s.node].querySelector('.nc-ico svg, .net-logo');
    scrIco.innerHTML = src ? src.outerHTML : '';
  }
  window.addEventListener('resize', function () { drawLines(); centerStep(); });

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
        ['09:41:02', 'Request <span class="hl">40-11873</span> from Nordwein Handel'],
        ['09:41:02', 'Producer matched: Weingut Sonnenhang'],
        ['09:41:02', '41 required fields set by Nordwein Handel'],
        ['09:41:03', '<span class="ok">Notification sent</span>']
      ];
      for (var i = 0; i < lines.length && alive(); i++) {
        var li = document.createElement('li'); li.innerHTML = '<time>' + lines[i][0] + '</time><span>' + lines[i][1] + '</span>';
        ol.appendChild(li); await wait(520);
      }
    },
    mail: async function (run) {
      var v = views.mail, m = q('.mail.is-new', v), tag = q('[data-agency]', v);
      tag.style.display = 'none';
      m.classList.remove('is-arrive'); void m.offsetWidth; m.classList.add('is-arrive');
      await wait(1800);
    },
    rule: async function () {
      var v = views.rule, sw = q('[data-rule]', v), note = q('[data-rule-note]', v);
      sw.classList.remove('is-on'); note.classList.remove('is-on');
      await wait(900); sw.classList.add('is-on');
      await wait(500); note.classList.add('is-on'); await wait(1300);
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
      q('#formFor').textContent = run === 'agency' ? 'Refined for DE market' : 'For Nordwein Handel';
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
      q('[data-source]', v).textContent = run === 'agency' ? 'Vinara Import for Weingut Sonnenhang' : 'Weingut Sonnenhang';
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
  var MER = 'Merchant · Nordwein Handel', WIN = 'WIN · EuvinoPRO', PRO = 'Producer · Weingut Sonnenhang', AGE = 'Trade agency · Vinara Import';
  var S1 = { who: 'Merchant', t: 'Create a new article in the ERP', d: 'Assign the article number, select the producer and add the article name: grape variety or wine name, and vintage.', screen: 'erp-new', fn: 'erpNew', node: 'merchant', party: MER, url: 'erp.nordwein-handel.de/articles/new' };
  var S2 = { who: 'Merchant → WIN', t: 'Product request is sent to WIN', d: 'The ERP sends the request automatically. No email, no spreadsheet.', edge: 'd-mw', text: 'Product request', screen: 'win-route', fn: 'winRoute', node: 'win', party: WIN, url: 'backend.euvinopro.eu/win/requests' };
  var S3 = { who: 'WIN → Producer', t: 'Notification of a new product request from the merchant', d: 'The producer gets an email from WIN with a link to the request.', edge: 'd-wp', text: 'Notification', screen: 'mail', fn: 'mail', node: 'producer', party: PRO, url: 'mail.weingut-sonnenhang.de/inbox' };
  var RUNS = {
    agency: [S1, S2, S3,
      { who: 'Producer', t: 'One-time setting: forward all product requests to the agency', d: 'The producer sets this once. Every later request for the German market goes to the agency.', screen: 'rule', fn: 'rule', node: 'producer', party: PRO, url: 'backend.euvinopro.eu/producer/settings/forwarding' },
      { who: 'WIN → Agency', t: 'Notification of a new product request from the merchant', d: 'WIN notifies the trade agency directly.', edge: 'd-wa', text: 'Notification', screen: 'agency-inbox', fn: 'agencyInbox', node: 'agency', party: AGE, url: 'backend.euvinopro.eu/agency/requests' },
      { who: 'Agency', t: 'Product request is answered, online or in the ERP', d: 'The agency prepares the data for the German market, including a German description.', screen: 'form', fn: 'form', node: 'agency', party: AGE, url: 'backend.euvinopro.eu/agency/requests/40-11873' },
      { who: 'Agency → WIN', t: 'Product data is sent to WIN', d: 'WIN checks every field against the law and the merchant\'s required fields.', edge: 'd-wa', rev: true, data: true, text: 'Product data', screen: 'win-check', fn: 'winCheck', node: 'win', party: WIN, url: 'backend.euvinopro.eu/win/validation' },
      { who: 'WIN → Merchant', t: 'Product data is imported into the ERP', d: 'The complete record lands in the merchant\'s ERP, ready to use.', edge: 'd-mw', rev: true, data: true, text: 'Product data', screen: 'erp-done', fn: 'erpDone', node: 'merchant', party: MER, url: 'erp.nordwein-handel.de/articles/40-11873' }
    ],
    direct: [S1, S2, S3,
      { who: 'Producer', t: 'Product request is answered, in the ERP or online', d: 'The producer fills in the data once, in the WIN web app or straight from their own ERP.', screen: 'form', fn: 'form', node: 'producer', party: PRO, url: 'backend.euvinopro.eu/producer/requests/40-11873' },
      { who: 'Producer → WIN', t: 'Product data is sent to WIN', d: 'WIN checks every field against the law and the merchant\'s required fields.', edge: 'd-wp', rev: true, data: true, text: 'Product data', screen: 'win-check', fn: 'winCheck', node: 'win', party: WIN, url: 'backend.euvinopro.eu/win/validation' },
      { who: 'WIN → Merchant', t: 'Product data is imported into the ERP', d: 'The complete record lands in the merchant\'s ERP, ready to use.', edge: 'd-mw', rev: true, data: true, text: 'Product data', screen: 'erp-done', fn: 'erpDone', node: 'merchant', party: MER, url: 'erp.nordwein-handel.de/articles/40-11873' }
    ]
  };
  var ORDER = ['agency', 'direct'];

  function setRun(run) {
    net.setAttribute('data-run', run);
    q('#runName').textContent = run === 'agency' ? 'With a trade agency' : 'Merchant and producer, direct';
    q('#runCount').textContent = RUNS[run].length + ' steps';
    steps.innerHTML = RUNS[run].map(function (s, i) {
      return '<li><span class="n">' + String(i + 1).padStart(2, '0') + '</span><div><span class="who">' + s.who + '</span><h4>' + s.t + '</h4><p>' + s.d + '</p></div><span class="bar"><i></i></span></li>';
    }).join('');
  }
  var activeIdx = 0;
  function centerStep() {
    var li = steps.children[activeIdx], view = steps.parentNode; if (!li) return;
    var sy = view.clientHeight / 2 - (li.offsetTop + li.offsetHeight / 2);
    steps.style.setProperty('--sy', Math.min(view.clientHeight * 0.18, sy) + 'px');
  }
  function markStep(i) {
    activeIdx = Math.min(i, steps.children.length - 1);
    requestAnimationFrame(centerStep);
    qa('li', steps).forEach(function (li, n) {
      li.classList.toggle('is-done', n < i); li.classList.toggle('is-active', n === i);
      if (n === i) { var b = li.querySelector('.bar i'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; }
    });
  }

  async function playScene(run, s, i) {
    markStep(i);
    if (s.edge) {
      var ends = EDGE[s.edge], from = s.rev ? ends[1] : ends[0], to = s.rev ? ends[0] : ends[1];
      await fold(from);
      focusNode(null);
      sendingText.textContent = (s.data ? 'Sending product data to ' : 'Sending to ') + NAME[to] + '…';
      sending.classList.toggle('is-data', !!s.data); sending.classList.add('is-on');
      await travel(from, to, s.text, s.data);
      sending.classList.remove('is-on');
    }
    focusNode(s.node);
    setParty(s);
    show(s.screen);
    if (scrWin.classList.contains('is-folded')) await open(s.node); else await wait(200);
    await act[s.fn](run);
    await wait(900);
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

  if (playBtn) playBtn.addEventListener('click', function () {
    playing = !playing; playBtn.textContent = playing ? 'Pause' : 'Play'; playBtn.setAttribute('aria-label', playBtn.textContent);
    section.classList.toggle('is-paused', !playing);
  });

  /* Static end state for reduced motion */
  if (reduce) {
    drawLines(); setRun('agency'); markStep(99); focusNode('merchant');
    var last = RUNS.agency[RUNS.agency.length - 1];
    setParty(last); show(last.screen);
    qa('[data-attrs] div').forEach(function (a) { a.classList.add('is-in'); });
    q('[data-status]').className = 'pill ok'; q('[data-status]').textContent = 'Complete'; q('[data-imp]').textContent = '214 / 214'; q('[data-imp-bar]').style.width = '100%';
    if (playBtn) playBtn.hidden = true; return;
  }
  drawLines(); setRun('agency'); show('erp-new'); focusNode('merchant'); markStep(0); setParty(RUNS.agency[0]);
  setTimeout(function () { drawLines(); centerStep(); }, 300);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) loop(); }, { threshold: 0.35 }).observe(section);
  } else { visible = true; loop(); }
})();
