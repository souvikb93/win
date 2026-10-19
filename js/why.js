/* Why WIN: three live product moments that loop while their card is on screen.
   Easy  - a retailer switches product attributes from optional to required.
   Right - a supplier fills in a product record; WIN flags the missing field as it is entered.
   Fast  - an activity log steps through a request from ERP to WIN, supplier, check and back. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* Run `play` in a loop while `el` is visible. `play` gets an alive() check. */
  function loopWhileVisible(el, play, reset) {
    if (!el) return;
    var visible = false, running = false;
    function alive() { return visible; }
    async function run() {
      if (running) return; running = true;
      while (visible) { reset(); await play(alive); }
      running = false;
    }
    if (!('IntersectionObserver' in window)) { visible = true; run(); return; }
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) run(); }, { threshold: 0.35 }).observe(el);
  }

  /* ---------- Easy ---------- */
  var fields = document.querySelector('.ui-fields');
  if (fields) {
    var cursor = fields.querySelector('.ui-cursor');
    var targets = [fields.querySelector('[data-target="1"]'), fields.querySelector('[data-target="2"]')];
    var base = 2;
    function setCount() {}
    function pointAt(el) {
      var a = fields.getBoundingClientRect(), b = el.getBoundingClientRect();
      cursor.style.setProperty('--cx', (b.left - a.left + b.width * 0.6) + 'px');
      cursor.style.setProperty('--cy', (b.top - a.top + b.height * 0.55) + 'px');
    }
    function home() { cursor.style.setProperty('--cx', (fields.clientWidth * 0.82) + 'px'); cursor.style.setProperty('--cy', (fields.clientHeight + 10) + 'px'); }
    cursor.style.transition = 'none'; home(); void cursor.offsetWidth; cursor.style.transition = '';
    if (reduce) { targets.forEach(function (t) { t.querySelector('.ui-switch').classList.add('is-on'); t.classList.add('is-req'); t.querySelector('.ui-state').textContent = 'Required'; }); }
    else loopWhileVisible(fields, async function (alive) {
      fields.classList.add('is-live');
      await wait(600);
      for (var i = 0; i < targets.length && alive(); i++) {
        var sw = targets[i].querySelector('.ui-switch');
        pointAt(sw); await wait(950);
        cursor.classList.add('is-click'); targets[i].classList.add('is-hot');
        await wait(140);
        sw.classList.add('is-on'); targets[i].classList.add('is-req'); targets[i].querySelector('.ui-state').textContent = 'Required'; setCount(base + i + 1);
        await wait(260); cursor.classList.remove('is-click');
        await wait(900); targets[i].classList.remove('is-hot');
      }
      home(); await wait(2600);
    }, function () {
      targets.forEach(function (t) { t.querySelector('.ui-switch').classList.remove('is-on'); t.classList.remove('is-hot', 'is-req'); t.querySelector('.ui-state').textContent = 'Optional'; });
      home();
    });
  }

  /* ---------- Precise ---------- */
  /* One loop: GTIN typed and accepted; bottle size typed wrong (0.85 L), flagged, erased, retyped 0.75 L, accepted;
     the user presses Send with the country still empty: the button refuses (small shake) and the country field turns red with
     "This is a required field"; "Germany" is typed and accepted; 3 of 3, bar full, Send turns active, is pressed and
     turns success green with a tick. The country field has no placeholder. */
  var form = document.querySelector('.ui-form');
  if (form) {
    var f = {}; form.querySelectorAll('.ui-field').forEach(function (el) { f[el.getAttribute('data-f')] = el; });
    var pctEl = form.querySelector('[data-pct]'), barEm = form.querySelector('.ui-progress em'), statusEl = form.querySelector('[data-status]');
    var progEl = form.querySelector('.ui-progress'), sendEl = form.querySelector('.ui-send');
    var T = window.WINi18n.t;
    function setProgress(n) {
      var p = Math.round(n / 3 * 100);
      pctEl.textContent = p + '%'; barEm.style.width = p + '%';
      statusEl.textContent = n + ' of 3 Required Fields Complete';
      progEl.classList.toggle('is-full', n === 3);
      sendEl.classList.toggle('is-ready', n === 3); sendEl.setAttribute('aria-disabled', n === 3 ? 'false' : 'true');
    }
    function setSend(sent) {
      sendEl.classList.remove('is-press', 'is-shake');
      sendEl.classList.toggle('is-sent', !!sent);
      sendEl.innerHTML = sent
        ? '<svg class="btn-tick" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M7.6 12.6l3 3 5.8-6.4"></path></svg><span>' + T('Sent') + '</span>'
        : T('Send to Trader');
    }
    function state(el, cls, msg) { el.classList.remove('is-typing', 'is-ok', 'is-err'); if (cls) el.classList.add(cls); el.querySelector('.ui-msg').textContent = msg ? T(msg) : ''; }
    function setVal(el, text, empty) { var v = el.querySelector('.ui-val'); v.textContent = text; v.classList.toggle('ui-empty', !!empty); }
    async function type(el, text, alive, speed) {
      state(el, 'is-typing'); setVal(el, '');
      for (var i = 0; i < text.length && alive(); i++) { el.querySelector('.ui-val').textContent += text[i]; await wait(speed || 70); }
      await wait(250);
    }
    async function erase(el, alive) {
      state(el, 'is-typing');
      var v = el.querySelector('.ui-val');
      while (v.textContent.length && alive()) { v.textContent = v.textContent.slice(0, -1); await wait(70); }
      await wait(200);
    }
    function clearAll() {
      setVal(f.gtin, ''); state(f.gtin); setVal(f.size, ''); state(f.size);
      setVal(f.country, ''); state(f.country);
      setProgress(0); setSend(false);
    }
    function finalState() {
      setVal(f.gtin, '4006381333931'); state(f.gtin, 'is-ok', 'Valid');
      setVal(f.size, T('0.75 L')); state(f.size, 'is-ok', 'Valid');
      setVal(f.country, T('Germany')); state(f.country, 'is-ok', 'Valid');
      setProgress(3); setSend(true);
    }
    async function submit(alive, ok) {
      sendEl.classList.add('is-press'); await wait(160); sendEl.classList.remove('is-press');
      if (ok) { setSend(true); await wait(3800); return; }
      sendEl.classList.add('is-shake'); await wait(420); sendEl.classList.remove('is-shake');
    }
    if (reduce) finalState();
    else loopWhileVisible(form, async function (alive) {
      await wait(700);
      await type(f.gtin, '4006381333931', alive, 60); if (!alive()) return; state(f.gtin, 'is-ok', 'Valid'); setProgress(1);
      await wait(500); if (!alive()) return;
      await type(f.size, T('0.85 L'), alive, 110); if (!alive()) return; state(f.size, 'is-err', 'Not a standard bottle size');
      await wait(1700); if (!alive()) return;
      await erase(f.size, alive); if (!alive()) return;
      await type(f.size, T('0.75 L'), alive, 110); if (!alive()) return; state(f.size, 'is-ok', 'Valid'); setProgress(2);
      await wait(900); if (!alive()) return;
      await submit(alive, false); if (!alive()) return;
      state(f.country, 'is-err', 'This is a required field');
      await wait(1900); if (!alive()) return;
      await type(f.country, T('Germany'), alive, 90); if (!alive()) return;
      state(f.country, 'is-ok', 'Valid'); setProgress(3);
      await wait(900); if (!alive()) return;
      await submit(alive, true);
    }, clearAll);
  }

  /* ---------- Fast ---------- */
  /* Five steps run one after another and finish with every step done, the last one highlighted and the badge on
     "Ready to Use". */
  var act = document.querySelector('.ui-activity');
  if (act) {
    var rows = Array.prototype.slice.call(act.querySelectorAll('.act li'));
    var pill = act.querySelector('[data-act-status]');
    function setRow(li, st) {
      li.classList.toggle('is-active', st === 'active'); li.classList.toggle('is-done', st === 'done');
      li.classList.remove('is-final');
      li.querySelector('.act-state').textContent = st === 'active' ? 'In Progress' : st === 'done' ? 'Done' : '';
    }
    function setPill(ready) { pill.textContent = ready ? 'Ready to Use' : 'In Progress'; pill.classList.toggle('is-ready', ready); }
    function finishRows() { rows.forEach(function (li) { setRow(li, 'done'); }); rows[rows.length - 1].classList.add('is-final'); setPill(true); }
    if (reduce) finishRows();
    else loopWhileVisible(act, async function (alive) {
      await wait(600);
      for (var i = 0; i < rows.length && alive(); i++) {
        setRow(rows[i], 'active'); await wait(i === 2 ? 1500 : 950);
        setRow(rows[i], 'done'); await wait(260);
      }
      if (alive()) { rows[rows.length - 1].classList.add('is-final'); setPill(true); }
      await wait(3600);
    }, function () { rows.forEach(function (li) { setRow(li, ''); }); setPill(false); });
  }
})();
