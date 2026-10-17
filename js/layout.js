/* Shared chrome: concept strip, nav, footer, language toggle, reveal-on-scroll.
   Loaded synchronously right after <body> opens so the nav paints with the page. */
(function () {
  var LOGO = '<svg class="win-logo" viewBox="0 0 108 42" role="img" aria-label="WIN"><g transform="translate(1 1)"><g class="win-logo__vine" transform="translate(51.547945 .666621)"><path d="m.91498721 18.123517 6.84577551 6.8692815-.08460928-.2047489v9.3118877c0 .1602168.12991857.2900946.29017642.2900946s.29017642-.1298778.29017642-.2900946v-9.3118877c0-.076755-.03042375-.1503734-.08460927-.2047489l-6.84567953-6.8686897c-.11311247-.1134951-.29683744-.1138403-.41036261-.0007604-.11352518.1130799-.11387071.2967522-.00076105.4102474z"/><path d="m6.96363898 34.0495268c0 .55563.44909056 1.0060401 1.00260738 1.0060401.55353602 0 1.00241541-.4503903 1.00241541-1.0060401 0-.5554032-.4488698-1.0060401-1.00241541-1.0060401-.55353602 0-1.00260738.4506073-1.00260738 1.0060401"/><path d="m2.18076222 14.1516311 3.78516437 4.1342332-.07612848-.1958622v13.617049c0 .1602168.12991857.2900947.29017642.2900947s.29017642-.1298779.29017642-.2900947v-13.617049c0-.0725039-.02715947-.1423843-.07612848-.1958622l-3.78526035-4.1336414c-.10820788-.1181801-.29175049-.1262876-.40996909-.0181186-.118209.1081789-.12632892.2916728-.01812295.4098529z"/><path d="m5.17745066 31.6567294c0 .5549593.44909055 1.0057442 1.00260737 1.0057442.55353602 0 1.00241542-.4508342 1.00241542-1.0057442 0-.5556301-.4488698-1.0060401-1.00241542-1.0060401-.55353601 0-1.00260737.4503903-1.00260737 1.0060401"/><path d="m11.0453816 22.6585881-6.94818616 6.9718581c-.05418744.0543755-.08461311.127994-.08461311.2047489v8.4238107c0 .1602168.12991857.2900946.29017642.2900946s.29017642-.1298778.29017642-.2900946v-8.4238107l-.08461312.2047489 6.94818625-6.9718581c.1131124-.1134951.1127765-.2971764-.0007545-.4102474-.1135251-.1130809-.2972501-.1127455-.4103626.0007536z"/><path d="m3.30017729 38.2088123c0 .5554032.44909055 1.0062374 1.00260737 1.0062374.55353602 0 1.00241542-.4508342 1.00241542-1.0062374s-.4488698-1.0060401-1.00241542-1.0060401c-.55353602 0-1.00260737.4506073-1.00260737 1.0060401"/><path d="m8.88621493 12.8201074-5.01140521 5.0280308c-.05419225.0543755-.08462079.1280038-.08462079.2047588v8.2010024c0 .1602168.12991856.2900946.29017641.2900946.16025786 0 .29017642-.1298778.29017642-.2900946v-8.2010024l-.08462079.2047587 5.01140521-5.0280307c.11316046-.1144124.11287252-.2978668-.00067186-.4112929-.11354437-.1134261-.29725015-.1124398-.4104106.0009863z"/><path d="m3.07788754 26.2034001c0 .5551763.44909055 1.0057442 1.00260738 1.0057442.55353602 0 1.00241541-.4506073 1.00241541-1.0057442 0-.5554032-.4488698-1.0060401-1.00241541-1.0060401-.55353602 0-1.00260738.4506073-1.00260738 1.0060401"/><path d="m11.5396788 29.0814639v-10.1659368c-.0028794-.1293452-.0037432-.2324446-.0046071-.4676312-.0080623-2.2992948-.3348263-3.5968893-1.79204306-5.2846696-1.11960703-1.3048932-1.25580269-1.5958558-1.27394291-2.5180593l.00005576-7.69906725-.29017642.29009463h.29109783c.16025785 0 .29017642-.12987781.29017642-.29009463v-1.23368137c0-.16021682-.12991857-.29009463-.29017642-.29009463h-.29109783l.29017642.29009463v-1.19975217c0-.16021682-.12991857-.29009463-.29017642-.29009463h-3.99987169c-.16025786 0-.29017642.12987781-.29017642.29009463v1.19975217h.29017642v-.29009463h-.28865994c-.16025785 0-.29017642.12987781-.29017642.29009463v1.23368137c0 .16021682.12991857.29009463.29017642.29009463h.28865994v-.29009463h-.29017642v7.70468925c-.01807784.91813-.15399996 1.2089249-1.27701428 2.5123387-1.45457732 1.6863994-1.78042952 2.9835007-1.78714812 5.2812175-.00069733.2372183-.00150113.3407418-.0043876.4641692v3.234419c0 .1602168.12991856.2900946.29017642.2900946.16025785 0 .29017641-.1298778.29017641-.2900946v-3.2278107c.00285061-.1219775.00367604-.2279569.00438629-.4690712.00638267-2.1723562.30071503-3.3439985 1.6464414-4.9042483 1.20397348-1.3975081 1.39650941-1.8092942 1.41762502-2.8853626l.00005586-7.71040989c0-.16021682-.12991856-.29009463-.29017642-.29009463h-.28865993v.29009463h.29017642v-1.23368137h-.29017642v.29009463h.28865993c.16025786 0 .29017642-.12987781.29017642-.29009463v-1.19975217l-.29017642.29009463h3.9998717l-.29017642-.29009463v1.19975217c0 .16021682.12991856.29009463.29017642.29009463h.29109782l-.29017642-.29009463v1.23368137l.29017642-.29009463h-.29109782c-.16025786 0-.29017642.12987781-.29017642.29009463v7.70468929c.02113192 1.0794219.21367074 1.4915038 1.41484159 2.89059 1.34880729 1.5621239 1.64394589 2.7343579 1.65162429 4.9081936.000836.2390233.0017277.3445688.0047031.4722964l-.0000778 10.160019c0 .1602168.1299186.2900946.2901764.2900946.1602579 0 .2901669-.1298778.2901669-.2900946z"/><path d="m12.2528104 29.0311619c0 .5551764-.4490906 1.0057442-1.0026074 1.0057442-.553536 0-1.0024154-.4506073-1.0024154-1.0057442 0-.5554032.4488698-1.0060401 1.0024154-1.0060401.553536 0 1.0026074.4506073 1.0026074 1.0060401"/><path d="m.10798713 22.0934303c0 .5554032.44909055 1.0060401 1.00260737 1.0060401.55353602 0 1.00241542-.4506073 1.00241542-1.0060401 0-.5556301-.4488698-1.0062374-1.00241542-1.0062374-.55353601 0-1.00260737.4506073-1.00260737 1.0062374"/><path d="m8.50152697 2.92728088v-1.21444824h-.27594258v-1.1997719h-4.14518545v1.1997719h-.27603856v1.21444824h.27603856v8.80196342l-1.68550528 2.2261104 2.76211325 3.0171341 3.96560683-3.9166523-.93657312-1.8384891.03954377-8.29006652z"/></g><g class="win-logo__type"><path d="m105.999721 1.39389365v4.57137889l-4.110171.77921432v32.46741134h-7.6670786l-15.4926183-25.4545711-.1580828.0259768v20.1040665l4.1101709.7792143v4.5454908h-15.8874207v-4.5454908l4.0838208-.7792143v-27.14261756l-4.0838208-.77921433v-4.57137888h4.0838208 7.693429l15.4926183 25.45457107.1580918-.0259768v-20.07746912l-4.1101708-.77921432v-4.57137889h11.7775194 4.110171z"/><path d="m50.0958904 5.32592018-3.1424961.39710306-7.725206 33.48905226h-7.096671l-6.9920046-25.4407281h-.1571248l-6.9919152 25.4407281h-7.0966711l-7.77758387-33.48905226-3.11621773-.39710306v-4.65929925h14.0365659v4.65929925l-3.4828632.60889679 4.3732877 21.12606013.1571248.0264754 7.149049-26.42022556h5.6301788l7.2014269 26.42022556.1571248-.0264754 4.3470987-21.12606013-3.4828632-.60889679v-4.65929925h14.0097513v4.65929925z"/></g></g></svg>';
  var page = document.body.getAttribute('data-page') || 'home';
  var home = page === 'home' ? '' : 'index.html';
  /* Languages: add an entry here when a translation is ready. */
  var LANGS = [
    { code: 'en', short: 'EN', name: 'English', ready: true },
    { code: 'de', short: 'DE', name: 'Deutsch', ready: false }
  ];
  function langOptions() {
    return LANGS.map(function (l) {
      return '<button type="button" class="lang-opt' + (l.code === 'en' ? ' is-active' : '') + '" role="option" aria-selected="' + (l.code === 'en') + '" data-lang="' + l.code + '">' +
        '<span>' + l.short + ' — ' + l.name + '</span>' + (l.ready ? '' : '<small>Soon</small>') + '</button>';
    }).join('');
  }
  /* The contact page carries no customer-login links */
  var showLogin = page !== 'contact';
  var loginNav = showLogin ? '<a class="nav-login" href="https://backend.euvinopro.eu/login">Log in</a>' : '';
  var loginMobile = showLogin ? '<a href="https://backend.euvinopro.eu/login">Log in</a>' : '';
  var loginFooter = showLogin ? '<li><a href="https://backend.euvinopro.eu/login">Log in</a></li>' : '';

  var links = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'solution.html', label: 'Solution', key: 'solution' },
    { href: 'press.html', label: 'Press', key: 'press' },
    { href: 'contact.html', label: 'Contact', key: 'contact' }
  ];
  function navLinks() {
    return links.map(function (l) {
      var cur = l.key === page ? ' aria-current="page"' : '';
      return '<a href="' + l.href + '"' + cur + '>' + l.label + '</a>';
    }).join('');
  }

  var header =
    '<header class="nav" id="nav">' +
      '<div class="nav-inner">' +
        '<a class="brand" href="index.html" aria-label="WIN home">' + LOGO +
          '<span class="brand-by">by<b>EuvinoPRO</b></span></a>' +
        '<nav class="nav-links" aria-label="Main">' + navLinks() + '</nav>' +
        '<div class="nav-actions">' +
          '<div class="lang-dd" id="langDd">' +
            '<button type="button" class="lang-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="Language: English">' +
              '<span class="lang-current">EN</span>' +
              '<svg viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>' +
            '</button>' +
            '<div class="lang-menu" role="listbox" aria-label="Language">' + langOptions() + '</div>' +
          '</div>' +
          loginNav +
          '<a class="btn btn-primary btn-sm" href="contact.html?topic=demo">Book a demo</a>' +
          '<button class="nav-burger" type="button" aria-label="Open menu" aria-expanded="false"><span></span></button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-menu">' + navLinks() +
        loginMobile +
        '<a class="btn btn-primary" href="contact.html?topic=demo">Book a demo</a>' +
      '</div>' +
    '</header>' +
    '<div class="lang-notice" role="status" aria-live="polite">Die deutsche Version folgt in Kürze. The German version is coming soon.</div>';

  var footer =
    '<footer class="footer">' +
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div class="footer-brand">' +
            '<a class="brand" href="index.html" aria-label="WIN home">' + LOGO + '<span class="brand-by">by<b>EuvinoPRO</b></span></a>' +
            '<p>The wine and beverage information network. Complete product data, from producer to shelf.</p>' +
          '</div>' +
          '<div><h5>Product</h5><ul>' +
            '<li><a href="' + home + '#product">Overview</a></li>' +
            '<li><a href="solution.html">How it works</a></li>' +
            '<li><a href="' + home + '#ecosystem">EuvinoPRO modules</a></li>' +
          '</ul></div>' +
          '<div><h5>Company</h5><ul>' +
            '<li><a href="press.html">Press</a></li>' +
            '<li><a href="contact.html">Contact</a></li>' +
            '<li><a href="https://www.euvinopro.eu/">EuvinoPRO</a></li>' +
            loginFooter +
          '</ul></div>' +
          '<div><h5>Legal</h5><ul>' +
            '<li><a href="https://www.win.wine/impressum/">Imprint</a></li>' +
            '<li><a href="https://www.win.wine/datenschutzerklaerung/">Privacy policy</a></li>' +
          '</ul></div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© 2026 Euvino GmbH · Inselstraße 10 · 10179 Berlin</span>' +
          '<span>Concept redesign · Not the official website</span>' +
        '</div>' +
      '</div>' +
    '</footer>';

  document.body.insertAdjacentHTML('afterbegin', header);
  document.addEventListener('DOMContentLoaded', function () {
    document.body.insertAdjacentHTML('beforeend', footer);
    initReveal();
  });

  /* Nav scroll state */
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = nav.querySelector('.nav-burger');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.querySelectorAll('.mobile-menu a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); });
  });

  /* Language menu. Only English is ready; picking another language shows a notice. */
  var dd = document.getElementById('langDd');
  var trigger = dd.querySelector('.lang-trigger');
  var notice = document.querySelector('.lang-notice');
  var noticeTimer;
  function setOpen(open) {
    dd.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
  }
  trigger.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!dd.classList.contains('is-open')); });
  dd.querySelector('.lang-menu').addEventListener('click', function (e) {
    var opt = e.target.closest('.lang-opt'); if (!opt) return;
    var lang = LANGS.filter(function (l) { return l.code === opt.getAttribute('data-lang'); })[0];
    setOpen(false);
    if (lang && !lang.ready) {
      notice.classList.add('is-visible');
      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(function () { notice.classList.remove('is-visible'); }, 3200);
    }
  });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setOpen(false); } });

  /* Logos: equal visual weight. Size each logo by its aspect ratio so a long
     wordmark and a square brand block cover roughly the same area. */
  function sizeLogos() {
    document.querySelectorAll('img[data-logo-area]').forEach(function (img) {
      function apply() {
        var r = img.naturalWidth / img.naturalHeight; if (!r) return;
        var area = +img.getAttribute('data-logo-area');
        var maxW = +(img.getAttribute('data-logo-maxw') || 9999);
        var w = Math.min(Math.sqrt(area * r), maxW);
        img.style.width = Math.round(w) + 'px';
        img.style.height = Math.round(w / r) + 'px';
      }
      if (img.complete) apply(); else img.addEventListener('load', apply, { once: true });
    });
  }
  document.addEventListener('DOMContentLoaded', sizeLogos);

  /* Reveal on scroll */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }
})();
