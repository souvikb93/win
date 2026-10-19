/* Press: 3D scroll gallery (full width; every card passes fully through the frame).
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
  /* Beats along the scroll (p = 0..1 through the section), always at full width:
       0 - .35    tilt flattens, grid settles from 1.2 to 1
     .35 - .50    rest: the top row sits fully in view
     .50 - .95    the columns scroll up evenly, so every row passes fully through the frame
     .95 - 1      rest: the last row sits fully in view */
  function update() {
    ticking = false;
    var r = section.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = clamp((vh - r.top) / r.height);
    var frameH = sticky.clientHeight;
    var rx = lerp(75, 0, range(p, 0, 0.35));
    var sc = lerp(1.2, 1, range(p, 0, 0.35));
    grid.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) scale(' + sc.toFixed(4) + ')';
    var t = range(p, 0.5, 0.95);
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
