/* Why WIN: three live product moments that loop while their card is on screen.
   Easy  - a merchant switches attributes to "required" in the Required-fields settings.
   Right - a producer fills in a product record; WIN checks every field as it's typed.
   Fast  - a request travels ERP -> WIN -> producer and the finished record comes back. */
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
    var base = 12;
    function setCount(n) { count.textContent = n; countPill.classList.add('is-bump'); setTimeout(function () { countPill.classList.remove('is-bump'); }, 300); }
    function pointAt(el) {
      var a = fields.getBoundingClientRect(), b = el.getBoundingClientRect();
      cursor.style.setProperty('--cx', (b.left - a.left + b.width * 0.6) + 'px');
      cursor.style.setProperty('--cy', (b.top - a.top + b.height * 0.55) + 'px');
    }
    function home() { cursor.style.setProperty('--cx', (fields.clientWidth * 0.82) + 'px'); cursor.style.setProperty('--cy', (fields.clientHeight + 10) + 'px'); }
    cursor.style.transition = 'none'; home(); void cursor.offsetWidth; cursor.style.transition = '';
    if (reduce) { targets[0].querySelector('.ui-switch').classList.add('is-on'); count.textContent = base + 1; }
    else loopWhileVisible(fields, async function (alive) {
      fields.classList.add('is-live');
      await wait(600);
      for (var i = 0; i < targets.length && alive(); i++) {
        var sw = targets[i].querySelector('.ui-switch');
        pointAt(sw); await wait(950);
        cursor.classList.add('is-click'); targets[i].classList.add('is-hot');
        await wait(140);
        sw.classList.add('is-on'); setCount(base + i + 1);
        await wait(260); cursor.classList.remove('is-click');
        await wait(900); targets[i].classList.remove('is-hot');
      }
      home(); await wait(2600);
    }, function () {
      targets.forEach(function (t) { t.querySelector('.ui-switch').classList.remove('is-on'); t.classList.remove('is-hot'); });
      count.textContent = base; home();
    });
  }

  /* ---------- Right ---------- */
  var form = document.querySelector('.ui-form');
  if (form) {
    var f = {}; form.querySelectorAll('.ui-field').forEach(function (el) { f[el.getAttribute('data-f')] = el; });
    var pctEl = form.querySelector('[data-pct]'), bar = form.querySelector('.ui-progress'), send = form.querySelector('.ui-send');
    function setPct(p) { pctEl.textContent = p + '%'; bar.style.setProperty('--pct', p + '%'); bar.classList.toggle('is-full', p === 100); }
    function state(el, cls, msg) { el.classList.remove('is-typing', 'is-ok', 'is-err'); if (cls) el.classList.add(cls); el.querySelector('.ui-msg').textContent = msg || ''; }
    async function type(el, text, alive, speed) {
      var v = el.querySelector('.ui-val'); state(el, 'is-typing'); v.textContent = '';
      for (var i = 0; i < text.length && alive(); i++) { v.textContent += text[i]; await wait(speed || 70); }
      await wait(250);
    }
    function finalState() {
      f.gtin.querySelector('.ui-val').textContent = '4006381333931'; state(f.gtin, 'is-ok', 'Check digit valid');
      f.abv.querySelector('.ui-val').textContent = '12.5 % vol'; state(f.abv, 'is-ok', 'Within declared range');
      f.size.querySelector('.ui-val').textContent = '0.75 l'; state(f.size, 'is-ok', 'Added');
      setPct(100); send.className = 'ui-send is-sent'; send.textContent = 'Sent to Hawesko ✓';
    }
    if (reduce) finalState();
    else loopWhileVisible(form, async function (alive) {
      await wait(700);
      await type(f.gtin, '4006381333931', alive, 60); state(f.gtin, 'is-ok', 'Check digit valid'); setPct(33);
      await wait(500); if (!alive()) return;
      await type(f.abv, '12.5 % vol', alive, 80); state(f.abv, 'is-ok', 'Within declared range'); setPct(66);
      await wait(600); if (!alive()) return;
      state(f.size, 'is-err', 'Required by Hawesko');
      await wait(1500); if (!alive()) return;
      await type(f.size, '0.75 l', alive, 110); state(f.size, 'is-ok', 'Added'); setPct(100);
      send.classList.add('is-ready');
      await wait(800); send.classList.add('is-press');
      await wait(160); send.classList.remove('is-press'); send.classList.remove('is-ready'); send.classList.add('is-sent'); send.textContent = 'Sent to Hawesko ✓';
      await wait(2800);
    }, function () {
      Object.keys(f).forEach(function (k) { f[k].querySelector('.ui-val').textContent = ''; state(f[k]); });
      setPct(0); send.className = 'ui-send'; send.textContent = 'Send to merchant';
    });
  }

  /* ---------- Fast ---------- */
  var flow = document.querySelector('.ui-flow');
  if (flow) {
    var log = flow.querySelector('.ui-log'), packet = flow.querySelector('.ui-packet');
    var nodes = {}; flow.querySelectorAll('.ui-node').forEach(function (n) { nodes[n.getAttribute('data-n')] = n; });
    var X = { erp: '16%', win: '50%', prod: '84%' };
    var STEPS = [
      { t: '09:41:02', who: 'ERP', text: 'Article 40-11873 created', at: 'erp' },
      { t: '09:41:02', who: 'WIN', text: 'Product request received', from: 'erp', to: 'win' },
      { t: '09:41:03', who: 'Mail', text: 'Routed to Schloss Gobelsburg, producer notified', from: 'win', to: 'prod' },
      { t: '11:20:41', who: 'Producer', text: 'Data entered and checked, 214 / 214', at: 'prod' },
      { t: '11:20:42', who: 'WIN', text: 'Validated record sent back', from: 'prod', to: 'win', data: true },
      { t: '11:20:42', who: 'ERP', text: 'Imported. Article ready to sell', from: 'win', to: 'erp', data: true, done: true }
    ];
    function light(k) { Object.keys(nodes).forEach(function (n) { nodes[n].classList.toggle('is-active', n === k); }); }
    function addLog(s) {
      var li = document.createElement('li'); if (s.done) li.className = 'is-done';
      li.innerHTML = '<time>' + s.t + '</time><span class="who">' + s.who + '</span><span>' + s.text + '</span>';
      log.appendChild(li);
    }
    if (reduce) { STEPS.forEach(addLog); light('erp'); }
    else loopWhileVisible(flow, async function (alive) {
      await wait(500);
      for (var i = 0; i < STEPS.length && alive(); i++) {
        var s = STEPS[i];
        if (s.from) {
          packet.classList.toggle('is-data', !!s.data);
          packet.style.transition = 'none'; packet.style.left = X[s.from]; packet.style.opacity = 1;
          void packet.offsetWidth; packet.style.transition = '';
          light(s.from); await wait(60); packet.style.left = X[s.to]; await wait(950);
          light(s.to);
        } else { light(s.at); await wait(400); }
        addLog(s);
        await wait(s.at === 'prod' ? 1100 : 650);
      }
      packet.style.opacity = 0;
      await wait(2600);
    }, function () { log.innerHTML = ''; light(null); packet.style.opacity = 0; });
  }
})();
