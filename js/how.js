/* How it works: the merchant's ERP on the left, the producer's WIN app on the right,
   the WIN hub between them. Each step changes what both screens show.
   Autoplays while the section is on screen; every step can be clicked. */
(function () {
  var stage = document.getElementById('howStage');
  if (!stage) return;
  var section = document.getElementById('how');
  var stepper = document.getElementById('howStepper');
  var caption = document.getElementById('howCaption');
  var playBtn = document.getElementById('howPlay');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };
  var erpPane = stage.querySelector('.win-pane.erp'), prodPane = stage.querySelector('.win-pane.prod');
  var hub = stage.querySelector('.hub-col'), hubPill = $('hubPill'), hubNote = $('hubNote');
  var erpRow = $('erpNew'), erpName = $('erpName'), erpProd = $('erpProd'), erpPill = $('erpPill');
  var erpDetail = $('erpDetail'), erpCount = $('erpCount'), erpBar = $('erpBar');
  var prodTitle = $('prodTitle'), pfChip = $('pfChip'), pfCount = $('pfCount'), pfSend = $('pfSend'), ruleSwitch = $('ruleSwitch');
  var pf = {}; stage.querySelectorAll('.pf-row').forEach(function (r) { pf[r.getAttribute('data-k')] = r; });
  var NAME = 'Grüner Veltliner Ried Lamm 2025';
  var VALUES = { abv: '12.5 % vol', size: '0.75 l', allergen: 'Contains sulphites', gtin: '4006381333931' };
  var STEP_MS = 3600;

  /* Each step is a scene: what the ERP shows, what WIN carries, what the producer sees. */
  var FLOWS = {
    direct: [
      { t: 'Create the article', c: '<b>You create the article in your ERP.</b> Article number, producer, wine name and vintage. That\'s all you type.', erp: 'typing', prod: 'idle', focus: 'erp' },
      { t: 'Request goes to WIN', c: '<b>Your ERP sends a product request to WIN</b> automatically. No email, no spreadsheet.', erp: 'requested', send: 'left', prod: 'idle', focus: 'erp', note: 'routing' },
      { t: 'Producer notified', c: '<b>WIN routes the request to the right producer</b> and notifies them.', erp: 'waiting', send: 'right', prod: 'mail', focus: 'prod', note: 'routed' },
      { t: 'Producer answers', c: '<b>The producer fills in the data</b> in the WIN app or from their own ERP. Every field is checked as it\'s entered.', erp: 'waiting', prod: 'form', focus: 'prod', note: 'checking' },
      { t: 'Checked data returns', c: '<b>Only a complete, validated record leaves the producer.</b> Every change is logged.', erp: 'waiting', back: 'right', prod: 'sent', focus: 'prod', note: 'validated' },
      { t: 'Imported, ready to sell', c: '<b>The finished record lands in your ERP.</b> 214 of 214 attributes, no retyping.', erp: 'complete', back: 'left', prod: 'sent', focus: 'erp', note: 'delivered' }
    ],
    agency: [
      { t: 'Create the article', c: '<b>You create the article in your ERP</b>, the same as always.', erp: 'typing', prod: 'idle', focus: 'erp' },
      { t: 'Request goes to WIN', c: '<b>Your ERP sends the product request to WIN</b> automatically.', erp: 'requested', send: 'left', prod: 'idle', focus: 'erp', note: 'routing' },
      { t: 'Producer notified', c: '<b>WIN notifies the producer</b> behind the wine.', erp: 'waiting', send: 'right', prod: 'mail', focus: 'prod', note: 'routed' },
      { t: 'Forwarded to agency', c: '<b>A one-time rule by the producer</b> forwards every request for this market to their trade agency.', erp: 'waiting', prod: 'rule', focus: 'prod', note: 'forwarding' },
      { t: 'Agency refines', c: '<b>The agency prepares the data for your market</b>, online or from its own ERP.', erp: 'waiting', prod: 'form', agency: true, focus: 'prod', note: 'checking' },
      { t: 'Checked data returns', c: '<b>The validated record goes back through WIN</b>, checked like any direct answer.', erp: 'waiting', back: 'right', prod: 'sent', agency: true, focus: 'prod', note: 'validated' },
      { t: 'Imported, ready to sell', c: '<b>The complete record lands in your ERP</b>, ready to use.', erp: 'complete', back: 'left', prod: 'sent', agency: true, focus: 'erp', note: 'delivered' }
    ]
  };

  var mode = 'direct', idx = 0, playing = !reduce, visible = false, timer = null, token = 0;
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function renderStepper() {
    var flow = FLOWS[mode];
    stepper.style.setProperty('--n', flow.length);
    stepper.innerHTML = flow.map(function (s, i) {
      return '<li><button type="button" data-i="' + i + '"><span class="n">' + String(i + 1).padStart(2, '0') + '</span><span class="t">' + s.t + '</span><span class="bar" style="--dur:' + STEP_MS + 'ms"></span></button></li>';
    }).join('');
  }

  function view(name) { stage.querySelectorAll('.prod-view').forEach(function (v) { v.classList.toggle('is-on', v.getAttribute('data-view') === name); }); }
  function pill(cls, text) { erpPill.className = 'pill' + (cls ? ' ' + cls : ''); erpPill.textContent = text; }

  function setErp(state, instant) {
    erpRow.classList.add('is-in');
    erpRow.classList.remove('is-complete', 'is-typing');
    erpProd.textContent = 'Schloss Gobelsburg';
    if (state === 'typing') { pill('', 'Draft'); erpDetail.classList.remove('is-on'); erpCount.textContent = '0 / 214'; erpBar.style.width = '0'; }
    if (state === 'requested') { erpName.textContent = NAME; pill('req', 'Request sent'); }
    if (state === 'waiting') { erpName.textContent = NAME; pill('wait', 'Waiting'); erpDetail.classList.add('is-on'); erpCount.textContent = '0 / 214'; erpBar.style.width = '0'; }
    if (state === 'complete') {
      erpName.textContent = NAME; erpDetail.classList.add('is-on');
      setTimeout(function () { pill('ok', 'Complete'); erpRow.classList.add('is-complete'); erpCount.textContent = '214 / 214'; erpBar.style.width = '100%'; }, instant ? 0 : 700);
    }
  }

  function setProducer(s) {
    prodTitle.textContent = s.agency ? 'WIN · Pellegrini, trade agency' : 'WIN · Weingut Schloss Gobelsburg';
    pfChip.textContent = s.agency ? 'Refined for DE market' : 'For Hawesko';
    view(s.prod === 'sent' ? 'form' : s.prod);
    if (s.prod === 'rule') { ruleSwitch.classList.remove('is-on'); setTimeout(function () { ruleSwitch.classList.add('is-on'); }, 700); }
    if (s.prod === 'sent') {
      Object.keys(pf).forEach(function (k) { pf[k].querySelector('b').textContent = VALUES[k]; pf[k].className = 'pf-row is-ok'; });
      pfCount.textContent = '214 / 214 checked'; pfSend.className = 'pf-send is-sent'; pfSend.textContent = 'Sent ✓';
    }
  }

  function travel(dir, data) {
    /* dir: 'left' or 'right' half of the hub; send = toward WIN/producer, back = toward WIN/ERP */
    hub.classList.remove('is-left', 'is-right', 'is-data');
    hub.classList.add(dir === 'left' ? 'is-left' : 'is-right');
    if (data) hub.classList.add('is-data');
    hubPill.textContent = data ? 'Validated record' : 'Product request';
    hubPill.classList.toggle('is-data', !!data);
    var from, to;
    if (!data) { from = dir === 'left' ? '0%' : '50%'; to = dir === 'left' ? '50%' : '100%'; }
    else { from = dir === 'right' ? '100%' : '50%'; to = dir === 'right' ? '50%' : '0%'; }
    hubPill.style.transition = 'none'; hubPill.style.left = from; hubPill.style.opacity = 1;
    void hubPill.offsetWidth; hubPill.style.transition = '';
    requestAnimationFrame(function () { hubPill.style.left = to; });
    setTimeout(function () { hubPill.style.opacity = 0; }, 1300);
  }

  async function animateForm(my) {
    var keys = Object.keys(pf);
    keys.forEach(function (k) { pf[k].querySelector('b').textContent = ''; pf[k].className = 'pf-row'; });
    pfSend.className = 'pf-send'; pfSend.textContent = 'Send'; pfCount.textContent = '0 / 214 checked';
    var checked = [61, 118, 172, 214];
    for (var i = 0; i < keys.length; i++) {
      var row = pf[keys[i]], b = row.querySelector('b'), v = VALUES[keys[i]];
      row.className = 'pf-row is-typing';
      for (var c = 0; c < v.length; c++) { if (my !== token) return; b.textContent += v[c]; await wait(28); }
      row.className = 'pf-row is-ok'; pfCount.textContent = checked[i] + ' / 214 checked';
      await wait(120);
    }
    if (my === token) pfSend.className = 'pf-send is-ready';
  }

  async function typeName(my) {
    erpName.textContent = ''; erpRow.classList.add('is-typing');
    for (var c = 0; c < NAME.length; c++) { if (my !== token) return; erpName.textContent += NAME[c]; await wait(45); }
    erpRow.classList.remove('is-typing');
  }

  function go(i, instant) {
    var flow = FLOWS[mode];
    idx = (i + flow.length) % flow.length;
    var s = flow[idx], my = ++token;
    stepper.querySelectorAll('li').forEach(function (li, n) {
      li.classList.toggle('is-active', n === idx); li.classList.toggle('is-done', n < idx);
      var bar = li.querySelector('.bar'); if (n === idx) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    });
    caption.innerHTML = s.c;
    erpPane.classList.toggle('is-active', s.focus === 'erp');
    prodPane.classList.toggle('is-active', s.focus === 'prod');
    hub.classList.remove('is-left', 'is-right', 'is-data');
    hubNote.textContent = s.note || 'waiting';
    if (idx === 0) { erpRow.classList.remove('is-in'); setTimeout(function () { if (my === token) { setErp('typing'); if (!instant) typeName(my); else erpName.textContent = NAME; } }, 250); }
    else setErp(s.erp, instant);
    setProducer(s);
    if (s.prod === 'form' && !instant) animateForm(my);
    else if (s.prod === 'form') Object.keys(pf).forEach(function (k) { pf[k].querySelector('b').textContent = VALUES[k]; pf[k].className = 'pf-row is-ok'; });
    if (s.send && !instant) travel(s.send, false);
    if (s.back && !instant) travel(s.back, true);
    schedule();
  }

  function schedule() {
    clearTimeout(timer);
    if (playing && visible) timer = setTimeout(function () { go(idx + 1); }, STEP_MS);
  }
  function setPlaying(p) {
    playing = p; playBtn.textContent = p ? 'Pause' : 'Play'; playBtn.setAttribute('aria-label', p ? 'Pause' : 'Play');
    section.classList.toggle('is-paused', !p);
    if (p) go(idx); else clearTimeout(timer);
  }
  function setMode(m) {
    mode = m;
    stage.setAttribute('data-mode', m);
    document.querySelectorAll('.how-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-mode') === m)); });
    renderStepper(); go(0);
  }

  stepper.addEventListener('click', function (e) { var b = e.target.closest('button[data-i]'); if (b) go(+b.getAttribute('data-i')); });
  document.querySelectorAll('.how-tabs button').forEach(function (b) { b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); }); });
  playBtn.addEventListener('click', function () { setPlaying(!playing); });

  renderStepper();
  if (reduce) { playing = false; playBtn.textContent = 'Play'; section.classList.add('is-paused'); go(FLOWS[mode].length - 1, true); return; }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      var was = visible; visible = en[0].isIntersecting;
      if (visible && !was) go(idx); else if (!visible) clearTimeout(timer);
    }, { threshold: 0.4 }).observe(section);
  } else { visible = true; go(0); }
})();
