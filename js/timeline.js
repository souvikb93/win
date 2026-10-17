/* Press timeline: pinned section, track slides sideways, the centre line draws,
   and each milestone grows its stem, pops its dot and reveals its copy line by line.
   Vanilla port of the hyperiux/timeline component (21st.dev). Desktop only;
   mobile and reduced-motion users get the static vertical layout. */
(function () {
  var section = document.getElementById('milestones');
  if (!section || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger, window.SplitText);

  var track = section.querySelector('.tl-track');
  var rail = section.querySelector('.tl-rail');
  var fill = section.querySelector('.tl-fill');
  var progress = section.querySelector('.tl-progress i');
  var items = gsap.utils.toArray(section.querySelectorAll('.tl-item'));

  var mm = gsap.matchMedia();
  mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', function () {
    section.classList.remove('is-static');

    function navH() { var n = document.getElementById('nav'); return n ? n.offsetHeight : 0; }
    function distance() { return Math.max(0, track.scrollWidth - window.innerWidth); }
    function setHeight() { section.style.setProperty('--nav-h', navH() + 'px');
      section.style.height = (distance() + window.innerHeight - navH()) + 'px'; }
    setHeight();
    ScrollTrigger.addEventListener('refreshInit', setHeight);

    var slide = gsap.to(track, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: function () { return 'top ' + navH() + 'px'; },
        end: function () { return '+=' + distance(); },
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: function (self) { if (progress) progress.style.transform = 'scaleX(' + self.progress.toFixed(4) + ')'; }
      }
    });

    gsap.fromTo(fill, { scaleX: 0 }, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: rail, containerAnimation: slide, start: 'left 75%', end: 'right 95%', scrub: true }
    });

    var splits = [];
    items.forEach(function (item) {
      var stem = item.querySelector('.tl-stem');
      var dot = item.querySelector('.tl-dot');
      var tag = item.querySelector('.tl-tag');
      var logos = item.querySelector('.tl-foot');
      var card = item.querySelector('.tl-body');
      var targets = [item.querySelector('.tl-year'), item.querySelector('.tl-title'), item.querySelector('.tl-text')].filter(Boolean);
      var lines = targets;
      if (window.SplitText) {
        var split = SplitText.create(targets, { type: 'lines', mask: 'lines' });
        splits.push(split);
        lines = split.lines;
      }

      gsap.set(stem, { scaleY: 0 });
      gsap.set(dot, { scale: 0 });
      gsap.set(lines, { yPercent: 110 });
      gsap.set(tag, { autoAlpha: 0 });
      gsap.set(card, { autoAlpha: 0, y: item.classList.contains('is-top') ? 20 : -20 });
      if (logos) gsap.set(logos, { autoAlpha: 0, y: 14 });

      var tl = gsap.timeline({
        scrollTrigger: { trigger: item, containerAnimation: slide, start: 'left 80%', end: 'left 48%', scrub: true }
      });
      tl.to(stem, { scaleY: 1, duration: 0.45, ease: 'none' })
        .to(dot, { scale: 1, duration: 0.3, ease: 'back.out(2)' }, '-=0.15')
        .to(card, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '-=0.1')
        .to(tag, { autoAlpha: 1, duration: 0.2 }, '<')
        .to(lines, { yPercent: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out' }, '-=0.2');
      if (logos) tl.to(logos, { autoAlpha: 1, y: 0, duration: 0.3 }, '-=0.3');
    });

    /* Deep links (press.html#hawesko) scroll to the point where that milestone sits mid-screen. */
    function jumpToHash() {
      var target = location.hash && section.querySelector(location.hash);
      if (!target || !target.classList.contains('tl-item')) return;
      var st = slide.scrollTrigger;
      var x = target.getBoundingClientRect().left - gsap.getProperty(track, 'x') - window.innerWidth * 0.35;
      var p = Math.min(1, Math.max(0, x / distance()));
      window.scrollTo(0, st.start + (st.end - st.start) * p);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); jumpToHash(); });
    window.addEventListener('hashchange', jumpToHash);
    window.addEventListener('load', function () { ScrollTrigger.refresh(); }, { once: true });

    return function () {
      ScrollTrigger.removeEventListener('refreshInit', setHeight);
      window.removeEventListener('hashchange', jumpToHash);
      splits.forEach(function (s) { s.revert(); });
      gsap.set(section.querySelectorAll('.tl-track, .tl-fill, .tl-item *'), { clearProps: 'all' });
      section.style.height = '';
      section.classList.add('is-static');
    };
  });
})();
