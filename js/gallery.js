/* Press: 3D scroll gallery.
   Vanilla port of the youcefbnm/animated-gallery component (21st.dev):
   the grid starts tilted back (rotateX 75deg) and flattens over the first half
   of the scroll, then settles from scale 1.2 to 1 while each column drifts
   at its own speed. */
(function () {
  var section = document.getElementById('gallery');
  var grid = document.getElementById('gxGrid');
  var sticky = section.querySelector('.gx-sticky');
  if (!section || !grid) return;
  var cols = Array.prototype.slice.call(grid.querySelectorAll('.gx-col'));
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { section.classList.add('is-static'); return; }

  function clamp(v) { return Math.min(1, Math.max(0, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function range(p, a, b) { return clamp((p - a) / (b - a)); }

  var ticking = false;
  function update() {
    ticking = false;
    var r = section.getBoundingClientRect();
    var vh = window.innerHeight;
    /* progress: section top at viewport bottom -> section bottom at viewport bottom */
    var p = clamp((vh - r.top) / r.height);
    var rx = lerp(75, 0, range(p, 0, 0.5));
    var sc = lerp(1.2, 1, range(p, 0.5, 0.9));
    grid.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')';
    /* Columns start at the component's offsets, then drift up until their last
       tile sits inside the frame, so every article can be reached. */
    var t = range(p, 0.45, 1);
    var frameH = sticky.clientHeight;
    cols.forEach(function (c) {
      var h = c.offsetHeight;
      var y0 = parseFloat(c.getAttribute('data-y0')) / 100 * h;
      var y1 = Math.min(y0, frameH - (c.offsetTop + h) - 32);
      c.style.transform = 'translateY(' + lerp(y0, y1, t).toFixed(1) + 'px)';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
