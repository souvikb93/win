/* Testimonials carousel: one quote at a time, dots + arrows, auto-advance while on screen. */
(function () {
  var stage = document.querySelector('[data-testi]'); if (!stage) return;
  var slides = [].slice.call(stage.querySelectorAll('.testi-slide'));
  var dotsEl = stage.querySelector('.testi-dots'), i = 0, timer = null, visible = false;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dots = slides.map(function (_, k) {
    var d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', 'Show testimonial ' + (k + 1));
    d.addEventListener('click', function () { go(k, true); }); dotsEl.appendChild(d); return d;
  });
  function go(n, user) {
    i = (n + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    if (user) restart();
  }
  function restart() { clearInterval(timer); if (visible && !reduce) timer = setInterval(function () { go(i + 1); }, 7000); }
  stage.querySelector('[data-prev]').addEventListener('click', function () { go(i - 1, true); });
  stage.querySelector('[data-next]').addEventListener('click', function () { go(i + 1, true); });
  go(0);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; restart(); }, { threshold: .4 }).observe(stage);
  else { visible = true; restart(); }
})();
