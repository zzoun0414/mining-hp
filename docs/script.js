/* ALTAN KHULEG RESOURCES LLC — interactions */
(function () {
  'use strict';

  /* --- i18n strings (site is JA/EN/MN, keyed by <html lang>) --- */
  var I18N = {
    ja: { openMenu: 'メニューを開く', closeMenu: 'メニューを閉じる' },
    en: { openMenu: 'Open menu', closeMenu: 'Close menu' },
    mn: { openMenu: 'Цэс нээх', closeMenu: 'Цэс хаах' }
  };
  var t = I18N[document.documentElement.lang] || I18N.ja;

  /* --- current year --- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- opening intro: mark + wordmark animate from center into the header brand,
     then hand off to the hero copy reveal (see styles.css html.intro-done rules).
     `intro-active` is only present on <html> at all if the inline <head> script
     decided to run the animation (skips reduced-motion / repeat pageviews before
     first paint, so there's no hide-then-flash for the common case). That same
     inline script also carries a 4s safety timeout in case this file never loads. */
  (function () {
    var html = document.documentElement;
    if (!html.classList.contains('intro-active')) return;

    var overlay = document.getElementById('introOverlay');
    var lockup = document.getElementById('introLockup');
    var brand = document.querySelector('.brand');
    var mark = document.querySelector('.intro-mark');
    var nameEl = document.querySelector('.intro-name');
    var subEl = document.querySelector('.intro-sub');
    var brandMark = document.querySelector('.brand-mark');
    var brandName = document.querySelector('.brand-name');
    var brandSub = document.querySelector('.brand-sub');

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      html.classList.remove('intro-active');
      html.classList.add('intro-done');
      if (overlay) overlay.setAttribute('hidden', '');
    }

    if (!overlay || !lockup || !brand || !mark || !nameEl || !subEl ||
        !brandMark || !brandName || !brandSub) { finish(); return; }

    try {
      // Animate real width/height/font-size (not a CSS transform: scale()) all
      // the way through. transform: scale() paints the lockup once at its
      // resting size and then stretches that bitmap — fine for solid shapes,
      // but it visibly softens thin hairline strokes and, in Safari especially,
      // can leave the wordmark's text looking soft too. Resizing the real
      // properties instead makes every browser re-render the vector mark and
      // the text glyphs at each actual size, so it stays crisp start to finish.
      var brandRect = brand.getBoundingClientRect();
      var markTarget = brandMark.getBoundingClientRect().width;
      var nameTarget = parseFloat(getComputedStyle(brandName).fontSize);
      var subTarget = parseFloat(getComputedStyle(brandSub).fontSize);

      var markBase = mark.getBoundingClientRect().width;
      var nameBase = parseFloat(getComputedStyle(nameEl).fontSize);
      var subBase = parseFloat(getComputedStyle(subEl).fontSize);

      lockup.style.position = 'fixed';
      lockup.style.left = brandRect.left + 'px';
      lockup.style.top = brandRect.top + 'px';
      var restRect = lockup.getBoundingClientRect();

      // cap the scale so the enlarged lockup never overflows narrow (mobile) viewports
      var bigScale = Math.min(2.6, (window.innerWidth * 0.88) / restRect.width);

      mark.style.width = (markBase * bigScale) + 'px';
      mark.style.height = (markBase * bigScale) + 'px';
      nameEl.style.fontSize = (nameBase * bigScale) + 'px';
      subEl.style.fontSize = (subBase * bigScale) + 'px';

      // re-measure now that it's actually sized big, to center it for real
      var bigRect = lockup.getBoundingClientRect();
      lockup.style.left = ((window.innerWidth - bigRect.width) / 2) + 'px';
      lockup.style.top = ((window.innerHeight - bigRect.height) / 2) + 'px';
      lockup.style.opacity = '0';

      // Fade the lockup in rather than having it snap into existence — needs a
      // frame to actually paint the opacity:0 state before transitioning away
      // from it, hence the double rAF.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          lockup.style.transition = 'opacity 1.1s ease-out';
          lockup.style.opacity = '1';
        });
      });

      // slower hold + a gentler, evenly-paced ease (rather than Material's
      // snappier ease) — a quick, mechanical-feeling move read as cheap rather
      // than premium. HOLD was doubled to 3200ms earlier 2026-09-16, then
      // found too long once tested on the real (uncached) code and halved
      // back down; MOVE stayed at the doubled 2300ms.
      var HOLD = 1600;
      var MOVE = 2300;
      var EASE = 'cubic-bezier(.65,0,.35,1)';

      setTimeout(function () {
        lockup.style.transition = 'left ' + MOVE + 'ms ' + EASE + ',top ' + MOVE + 'ms ' + EASE;
        mark.style.transition = 'width ' + MOVE + 'ms ' + EASE + ',height ' + MOVE + 'ms ' + EASE;
        nameEl.style.transition = 'font-size ' + MOVE + 'ms ' + EASE;
        subEl.style.transition = 'font-size ' + MOVE + 'ms ' + EASE;

        lockup.style.left = brandRect.left + 'px';
        lockup.style.top = brandRect.top + 'px';
        mark.style.width = markTarget + 'px';
        mark.style.height = markTarget + 'px';
        nameEl.style.fontSize = nameTarget + 'px';
        subEl.style.fontSize = subTarget + 'px';
      }, HOLD);
      setTimeout(function () {
        if (overlay) overlay.classList.add('is-leaving');
      }, HOLD + Math.round(MOVE * 0.61));

      lockup.addEventListener('transitionend', function onEnd(e) {
        if (e.target !== lockup || e.propertyName !== 'left') return;
        lockup.removeEventListener('transitionend', onEnd);
        finish();
      });
      // belt-and-suspenders: transitionend can fail to fire (tab backgrounded, etc.)
      setTimeout(finish, HOLD + MOVE + 400);
    } catch (e) {
      finish();
    }
  })();

  /* --- sticky header state --- */
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- hero parallax: background drifts slower than the foreground --- */
  var hero = document.getElementById('hero');
  if (hero && !reduceMotion) {
    var pending = false;
    var lastP = -1;
    var applyParallax = function () {
      pending = false;
      var h = hero.offsetHeight || window.innerHeight || 1;
      var p = window.scrollY / h;
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      if (p === lastP) return;        // nothing to do once the hero has left
      lastP = p;
      hero.style.setProperty('--hero-p', p.toFixed(4));
    };
    var queueParallax = function () {
      if (!pending) { pending = true; requestAnimationFrame(applyParallax); }
    };
    applyParallax();
    window.addEventListener('scroll', queueParallax, { passive: true });
    window.addEventListener('resize', function () { lastP = -1; applyParallax(); });
  }

  /* --- gentle parallax drift on photos + the leadership mark --- */
  if (!reduceMotion) {
    var driftTargets = [];
    document.querySelectorAll('.res-media img').forEach(function (img) {
      driftTargets.push({ box: img.parentElement, el: img, range: 16 });
    });
    var mark = document.querySelector('.leadership-mark');
    if (mark) driftTargets.push({ box: mark.parentElement, el: mark, range: 22 });

    if (driftTargets.length) {
      var driftPending = false;
      var applyDrift = function () {
        driftPending = false;
        var vh = window.innerHeight || 1;
        driftTargets.forEach(function (t) {
          var r = t.box.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return; // off-screen, skip the work
          var mid = r.top + r.height / 2;
          var progress = (vh / 2 - mid) / vh;               // ~ -0.5 .. 0.5 while transiting
          progress = progress < -0.6 ? -0.6 : progress > 0.6 ? 0.6 : progress;
          t.el.style.setProperty('--py', (progress * t.range).toFixed(1) + 'px');
        });
      };
      var queueDrift = function () {
        if (!driftPending) { driftPending = true; requestAnimationFrame(applyDrift); }
      };
      applyDrift();
      window.addEventListener('scroll', queueDrift, { passive: true });
      window.addEventListener('resize', applyDrift);
    }
  }

  /* --- mobile nav --- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('siteNav');
  var closeNav = function () {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', t.openMenu);
  };
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? t.closeMenu : t.openMenu);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeNav();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* --- contact form: デモ動作のみ（バックエンド未接続、実際には送信されない） --- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      var success = document.getElementById('formSuccess');
      success.hidden = false;
      success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      contactForm.reset();
    });
  }

  /* --- scroll reveal --- */
  var reveals = document.querySelectorAll('.reveal');

  /* give grid items a short cascading delay so rows settle in sequence */
  if (!reduceMotion) {
    ['.card-grid', '.res-grid', '.people', '.phases', '.flow'].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (grid) {
        var i = 0;
        Array.prototype.forEach.call(grid.children, function (child) {
          if (child.classList.contains('reveal')) {
            child.style.setProperty('--rd', (Math.min(i, 5) * 65) + 'ms');
            i++;
          }
        });
      });
    });
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* --- active nav link on scroll --- */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
  var sections = links
    .map(function (l) { return document.querySelector(l.getAttribute('href')); })
    .filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
