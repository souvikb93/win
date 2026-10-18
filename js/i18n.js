/* Language engine. English is the source text in the HTML and JS; German is applied on top of it.
   - Language comes from ?lang=, then localStorage ("win-lang"), default English.
   - Every text node and the attributes alt, aria-label, placeholder, title, data-type and the meta description are looked up
     in window.WIN_DE.dict (exact English string, whitespace collapsed). Numbers use window.WIN_DE.patterns.
   - A MutationObserver translates text the page scripts add later (status labels, typed lines, injected chrome).
   - Elements with data-de="..." take that text directly (used where one English word has several German meanings).
   - Switching language stores the choice and reloads the page, so every animation restarts in the new language. */
(function () {
  var KEY = 'win-lang', lang = 'en';
  try {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'de' || q === 'en') localStorage.setItem(KEY, q);
    lang = localStorage.getItem(KEY) === 'de' ? 'de' : 'en';
  } catch (e) {}
  var de = window.WIN_DE || { dict: {}, patterns: [] };
  var rules = de.patterns.map(function (p) { return [new RegExp(p[0]), p[1]]; });
  var ATTRS = ['alt', 'aria-label', 'placeholder', 'title', 'data-type', 'data-cursor'];
  var observer = null, busy = false;

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }
  function t(s, vars) {
    if (lang !== 'de' || !s) return s;
    var k = norm(s), out = de.dict[k];
    if (out === undefined) {
      for (var i = 0; i < rules.length; i++) if (rules[i][0].test(k)) { out = k.replace(rules[i][0], rules[i][1]); break; }
    }
    if (out === undefined) return s;
    if (vars) Object.keys(vars).forEach(function (n) { out = out.replace('{' + n + '}', vars[n]); });
    var m = /^(\s*)[\s\S]*?(\s*)$/.exec(s);
    return (m ? m[1] : '') + out + (m ? m[2] : '');
  }
  function skip(node) {
    var p = node.parentNode;
    while (p && p.nodeType === 1) {
      var n = p.nodeName;
      if (n === 'SCRIPT' || n === 'STYLE' || n === 'svg' || n === 'SVG' || n === 'NOSCRIPT') return true;
      p = p.parentNode;
    }
    return false;
  }
  function doText(node) {
    if (skip(node)) return;
    var v = node.nodeValue; if (!v || !/\S/.test(v)) return;
    var nv = t(v); if (nv !== v) { busy = true; node.nodeValue = nv; busy = false; }
  }
  function doEl(el) {
    if (el.nodeType !== 1) return;
    ATTRS.forEach(function (a) { if (el.hasAttribute && el.hasAttribute(a)) { var v = el.getAttribute(a), nv = t(v); if (nv !== v) { busy = true; el.setAttribute(a, nv); busy = false; } } });
    if (el.hasAttribute && el.hasAttribute('data-de') && el.textContent !== el.getAttribute('data-de')) { busy = true; el.textContent = el.getAttribute('data-de'); busy = false; }
    if (el.nodeName === 'META' && el.getAttribute('name') === 'description') { var c = el.getAttribute('content'), nc = t(c); if (nc !== c) el.setAttribute('content', nc); }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    var base = root.nodeType === 9 ? root.documentElement : root;
    doEl(base);
    var tw = document.createTreeWalker(base, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null), n;
    while ((n = tw.nextNode())) { if (n.nodeType === 3) doText(n); else doEl(n); }
  }
  function start() {
    if (lang !== 'de') return;
    document.documentElement.lang = 'de';
    walk(document);
    document.title = t(document.title);
    if (!observer) {
      observer = new MutationObserver(function (list) {
        if (busy) return;
        list.forEach(function (m) {
          if (m.type === 'characterData') doText(m.target);
          else if (m.type === 'attributes') doEl(m.target);
          else m.addedNodes.forEach(function (n) { walk(n); });
        });
      });
      observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    }
    document.documentElement.classList.remove('i18n-wait');
  }
  function setLang(l) {
    try { localStorage.setItem(KEY, l === 'de' ? 'de' : 'en'); } catch (e) {}
    var u = new URL(location.href); u.searchParams.delete('lang'); location.href = u.toString();
  }
  if (lang === 'de') {
    document.documentElement.classList.add('i18n-wait');
    setTimeout(function () { document.documentElement.classList.remove('i18n-wait'); }, 2500);
    document.addEventListener('DOMContentLoaded', start);
  }
  window.WINi18n = { lang: lang, t: t, start: start, setLang: setLang };
})();
