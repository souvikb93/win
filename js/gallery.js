/* Press: 3D scroll gallery (with an overview beat where all nine cards are visible together).
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
  /* Beats along the scroll (p = 0..1 through the section):
       0 - .38   tilt flattens while the grid shrinks to the "overview" size
     .38 - .56   hold: all nine cards fit the frame together
     .56 - .80   grid grows to reading size (top row stays in view)
     .80 - 1     columns drift up so the last row ends inside the frame */
  function update() {
    ticking = false;
    var r = section.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = clamp((vh - r.top) / r.height);
    var frameH = sticky.clientHeight;
    var colH = 0;
    cols.forEach(function (c) { colH = Math.max(colH, c.offsetHeight); });
    var fit = Math.min(1, Math.max(0.4, (frameH - 28) / (colH || frameH)));
    var rx = lerp(75, 0, range(p, 0, 0.38));
    var sc = p < 0.56 ? lerp(1.2, fit, range(p, 0, 0.38)) : lerp(fit, 1, range(p, 0.56, 0.8));
    grid.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')';
    var t = range(p, 0.8, 1);
    cols.forEach(function (c) {
      var y1 = Math.min(0, frameH - c.offsetHeight - 32);
      c.style.transform = 'translateY(' + lerp(0, y1, t).toFixed(1) + 'px)';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
