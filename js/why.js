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
    var count = fields.querySelector('[data-count-req]');
    var countPill = fields.querySelector('.ui-count');
    var targets = [fields.querySelector('[data-target="1"]'), fields.querySelector('[data-target="2"]')];
    var base = 2;
    function setCount(n) { count.textContent = n; countPill.classList.add('is-bump'); setTimeout(function () { countPill.classList.remove('is-bump'); }, 300); }
    function pointAt(el) {
      var a = fields.getBoundingClientRect(), b = el.getBoundingClientRect();
      cursor.style.setProperty('--cx', (b.left - a.left + b.width * 0.6) + 'px');
      cursor.style.setProperty('--cy', (b.top - a.top + b.height * 0.55) + 'px');
    }
    function home() { cursor.style.setProperty('--cx', (fields.clientWidth * 0.82) + 'px'); cursor.style.setProperty('--cy', (fields.clientHeight + 10) + 'px'); }
    cursor.style.transition = 'none'; home(); void cursor.offsetWidth; cursor.style.transition = '';
    if (reduce) { targets.forEach(function (t) { t.querySelector('.ui-switch').classList.add('is-on'); t.classList.add('is-req'); t.querySelector('.ui-state').textContent = 'Required'; }); count.textContent = base + targets.length; }
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
      count.textContent = base; home();
    });
  }

  /* ---------- Right ---------- */
  var form = document.querySelector('.ui-form');
  if (form) {
    var f = {}; form.querySelectorAll('.ui-field').forEach(function (el) { f[el.getAttribute('data-f')] = el; });
    var pctEl = form.querySelector('[data-pct]'), bar = form.querySelector('.ui-progress'), statusEl = form.querySelector('[data-status]'), send = form.querySelector('.ui-send');
    function setPct(p, n, warn) {
      pctEl.textContent = p + '%'; bar.style.setProperty('--pct', p + '%'); bar.classList.toggle('is-full', p === 100); bar.classList.toggle('is-warn', !!warn);
      statusEl.textContent = n + ' of 3 required fields complete';
    }
    function state(el, cls, msg) { el.classList.remove('is-typing', 'is-ok', 'is-err'); if (cls) el.classList.add(cls); el.querySelector('.ui-msg').textContent = msg || ''; }
    async function type(el, text, alive, speed) {
      var v = el.querySelector('.ui-val'); state(el, 'is-typing'); v.textContent = '';
      for (var i = 0; i < text.length && alive(); i++) { v.textContent += text[i]; await wait(speed || 70); }
      await wait(250);
    }
    function finalState() {
      f.gtin.querySelector('.ui-val').textContent = '4006381333931'; state(f.gtin, 'is-ok', 'Check digit is valid');
      f.size.querySelector('.ui-val').textContent = '0.75 l'; state(f.size, 'is-ok', 'Added');
      f.country.querySelector('.ui-val').textContent = 'Austria'; state(f.country, 'is-ok', 'Recognised country');
      setPct(100, 3); send.className = 'ui-send is-sent'; send.textContent = 'Sent to Nordwein Handel ✓';
    }
    if (reduce) finalState();
    else loopWhileVisible(form, async function (alive) {
      await wait(700);
      await type(f.gtin, '4006381333931', alive, 60); state(f.gtin, 'is-ok', 'Check digit is valid'); setPct(33, 1);
      await wait(500); if (!alive()) return;
      state(f.size, 'is-err', 'Missing: Nordwein Handel needs the bottle size'); setPct(33, 1, true);
      await wait(1400); if (!alive()) return;
      await type(f.country, 'Austria', alive, 90); state(f.country, 'is-ok', 'Recognised country'); setPct(66, 2, true);
      await wait(1100); if (!alive()) return;
      await type(f.size, '0.75 l', alive, 110); state(f.size, 'is-ok', 'Added'); setPct(100, 3);
      send.classList.add('is-ready');
      await wait(800); send.classList.add('is-press');
      await wait(160); send.classList.remove('is-press'); send.classList.remove('is-ready'); send.classList.add('is-sent'); send.textContent = 'Sent to Nordwein Handel ✓';
      await wait(2800);
    }, function () {
      Object.keys(f).forEach(function (k) { f[k].querySelector('.ui-val').textContent = ''; state(f[k]); });
      setPct(0, 0); send.className = 'ui-send'; send.textContent = 'Send to merchant';
    });
  }

  /* ---------- Fast ---------- */
  var act = document.querySelector('.ui-activity');
  if (act) {
    var rows = Array.prototype.slice.call(act.querySelectorAll('.act li'));
    var pill = act.querySelector('[data-act-status]');
    function setRow(li, st) {
      li.classList.toggle('is-active', st === 'active'); li.classList.toggle('is-done', st === 'done');
      li.querySelector('.act-state').textContent = st === 'active' ? 'In progress' : st === 'done' ? 'Done' : '';
    }
    function setPill(ready) { pill.textContent = ready ? 'Ready to use' : 'In progress'; pill.classList.toggle('is-ready', ready); }
    if (reduce) { rows.forEach(function (li) { setRow(li, 'done'); }); setPill(true); }
    else loopWhileVisible(act, async function (alive) {
      await wait(600);
      for (var i = 0; i < rows.length && alive(); i++) {
        setRow(rows[i], 'active'); await wait(i === 2 ? 1500 : 950);
        setRow(rows[i], 'done'); await wait(260);
      }
      if (alive()) setPill(true);
      await wait(3000);
    }, function () { rows.forEach(function (li) { setRow(li, ''); }); setPill(false); });
  }
})();
