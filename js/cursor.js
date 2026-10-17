/* Framer-style contextual cursor for the press timeline.
   A small dot follows the pointer; it grows into a labelled pill over
   articles ("Read ↗"), partner logos (company name) and the scroll rail.
   Only on devices with a fine pointer that can hover. */
(function () {
  var zone = document.getElementById('milestones');
  var cursor = document.querySelector('.cursor');
  if (!zone || !cursor) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.documentElement.classList.add('has-cursor');

  var label = cursor.querySelector('.cursor-label');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var x = -100, y = -100, cx = -100, cy = -100, raf = null, current = '';

  function loop() {
    cx += (x - cx) * (reduce ? 1 : 0.22);
    cy += (y - cy) * (reduce ? 1 : 0.22);
    cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
    raf = (Math.abs(x - cx) > 0.1 || Math.abs(y - cy) > 0.1) ? requestAnimationFrame(loop) : null;
  }

  function setState(target) {
    var link = target.closest('a.is-link');
    var logo = target.closest('.tl-logo');
    var rail = target.closest('[data-cursor]');
    var mode = '', text = '';
    if (logo) { mode = 'is-logo'; text = logo.getAttribute('data-cursor'); }
    else if (link) { mode = 'is-link'; text = link.getAttribute('data-cursor'); }
    else if (rail && !zone.classList.contains('is-static')) { mode = 'is-scroll'; text = 'Scroll →'; }
    var key = mode + text;
    if (key === current) return;
    current = key;
    cursor.classList.remove('is-link', 'is-logo', 'is-scroll');
    if (mode) cursor.classList.add(mode);
    cursor.classList.toggle('has-label', !!text);
    label.textContent = text;
  }

  zone.addEventListener('pointermove', function (e) {
    x = e.clientX; y = e.clientY;
    if (!cursor.classList.contains('is-visible')) { cx = x; cy = y; cursor.classList.add('is-visible'); }
    setState(e.target);
    if (!raf) raf = requestAnimationFrame(loop);
  });
  zone.addEventListener('pointerleave', function () { cursor.classList.remove('is-visible'); current = ''; });
  zone.addEventListener('pointerdown', function () { cursor.classList.add('is-down'); });
  window.addEventListener('pointerup', function () { cursor.classList.remove('is-down'); });
  /* Content slides under a still pointer while scrolling, so re-check what's beneath it. */
  window.addEventListener('scroll', function () {
    if (!cursor.classList.contains('is-visible')) return;
    var el = document.elementFromPoint(x, y);
    if (el) setState(el);
  }, { passive: true });
})();
