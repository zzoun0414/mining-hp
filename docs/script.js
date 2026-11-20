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

  /* --- opening intro (2026-11 redesign): a big pale detailed mark sits behind
     the centered wordmark during the hold, then BOTH independently animate
     their real position/size/font-size (never transform:scale(), to keep
     hairline strokes and glyphs crisp) across to the header's measured
     .brand-mark / .brand-text spots — running at the same time, per the
     boss's "大logo变成小logo，字也这样移上去，两个动画同时运行" request.
     The big detailed mark crossfades into the small simple mark (today's
     header icon) in the last stretch of that move, because the detailed
     artwork reads muddy at actual nav-icon size (confirmed on a direct
     trial) — so it only ever has to render large, while the nav bar still
     ends up with exactly today's small simple mark.
     `intro-active` is only present on <html> at all if the inline <head>
     script decided to run the animation (skips reduced-motion / repeat
     pageviews before first paint, so there's no hide-then-flash for the
     common case). That same inline script also carries a safety timeout in
     case this file never loads. */
  (function () {
    var html = document.documentElement;
    if (!html.classList.contains('intro-active')) return;

    var overlay = document.getElementById('introOverlay');
    var markBig = document.getElementById('introMarkBig');
    var markSmall = document.getElementById('introMarkSmall');
    var textEl = document.getElementById('introText');
    var nameEl = document.querySelector('.intro-name');
    var subEl = document.querySelector('.intro-sub');
    var brandMark = document.querySelector('.brand-mark');
    var brandText = document.querySelector('.brand-text');
    var brandName = document.querySelector('.brand-name');
    var brandSub = document.querySelector('.brand-sub');

    // The overlay visually covers the header (z-index) while intro-active,
    // but without this a keyboard Tab right after load still walks into
    // the header/nav links underneath it — inert removes them from the tab
    // order (and from AT) until the handoff is done.
    var introSiteHeader = document.getElementById('siteHeader');
    var introSiteNav = document.getElementById('siteNav');
    if (introSiteHeader) introSiteHeader.setAttribute('inert', '');
    if (introSiteNav) introSiteNav.setAttribute('inert', '');

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      html.classList.remove('intro-active');
      html.classList.add('intro-done');
      if (overlay) overlay.setAttribute('hidden', '');
      if (introSiteHeader) introSiteHeader.removeAttribute('inert');
      if (introSiteNav) introSiteNav.removeAttribute('inert');
    }

    if (!overlay || !markBig || !markSmall || !textEl || !nameEl || !subEl ||
        !brandMark || !brandText || !brandName || !brandSub) { finish(); return; }

    // (2026-11: briefly gated this whole thing behind document.fonts.ready,
    // thinking a fallback-font measurement might explain a reported jump.
    // Reverted — on a true cold load it measured fonts.ready taking almost
    // two minutes to resolve even though every font file had already loaded
    // fine individually, which left the entire intro invisible until the
    // inline <head> script's 7s safety net kicked in. Not worth the risk:
    // the font was already loading fast enough without waiting on it, per
    // the original fix below.)
    try {
      runIntro();
    } catch (e) {
      finish();
    }

    function runIntro() {
      var markTargetRect = brandMark.getBoundingClientRect();
      var textTargetRect = brandText.getBoundingClientRect();
      var nameTarget = parseFloat(getComputedStyle(brandName).fontSize);
      var subTarget = parseFloat(getComputedStyle(brandSub).fontSize);

      // .intro-text is left-aligned the whole time (same as the header's own
      // .brand-text — no text-align/align-items switch later, since neither
      // property can transition: toggling one mid-animation reported as a
      // sudden, out-of-place jump — "resources llc那行...从中间对齐跳到左
      // 边"). Instead the shorter sub-line fakes a centered-under-the-name
      // look during the hold via a real, animatable margin-left offset, then
      // slides that back to 0 in step with the move below, so it reads as
      // one continuous easing into place rather than a snap.
      var subCenterOffset = (nameEl.getBoundingClientRect().width - subEl.getBoundingClientRect().width) / 2;
      subEl.style.marginLeft = Math.max(0, subCenterOffset) + 'px';

      // dock the small simple mark onto the header's mark spot right away —
      // it stays invisible (opacity:0, see styles.css) and never moves; it
      // only fades in later, already sitting exactly where it needs to be.
      markSmall.style.left = markTargetRect.left + 'px';
      markSmall.style.top = markTargetRect.top + 'px';
      markSmall.style.width = markTargetRect.width + 'px';
      markSmall.style.height = markTargetRect.height + 'px';

      // Fade the big mark + wordmark in together rather than having them
      // snap into existence — needs a frame to actually paint the
      // opacity:0 state before transitioning away from it, hence the
      // double rAF. The big mark only ever reaches a faint watermark
      // opacity (never fully opaque) — at full strength its dense linework
      // fights the wordmark for attention right as both appear (reported
      // directly: "字体和图案混到一起看不清楚").
      var BIG_MARK_OPACITY = 0.22;
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          markBig.style.opacity = String(BIG_MARK_OPACITY);
          textEl.style.opacity = '1';
        });
      });

      // slower hold + a gentler, evenly-paced ease (rather than Material's
      // snappier ease) — a quick, mechanical-feeling move read as cheap rather
      // than premium. Both HOLD and MOVE were slowed further 2026-11 (the
      // first cut of this redesign felt rushed on direct feedback).
      var HOLD = 2000;
      var MOVE = 3200;
      var EASE = 'cubic-bezier(.65,0,.35,1)';
      var PAUSE = 400;     // how long the fully-docked state holds before the scrim fades
      var LEAVE_FADE = 650; // matches .intro-overlay's own opacity transition

      setTimeout(function () {
        // freeze each element's current rendered box as explicit pixels
        // (swapping out the CSS that was centering it) before transitioning
        // away from it — same "real properties, not transform" approach as
        // the position/size move itself.
        var bigRect = markBig.getBoundingClientRect();
        markBig.style.transition = 'none';
        markBig.style.transform = 'none';
        markBig.style.left = bigRect.left + 'px';
        markBig.style.top = bigRect.top + 'px';
        markBig.style.width = bigRect.width + 'px';
        markBig.style.height = bigRect.height + 'px';

        var textRect = textEl.getBoundingClientRect();
        textEl.style.transition = 'none';
        textEl.style.position = 'fixed';
        textEl.style.left = textRect.left + 'px';
        textEl.style.top = textRect.top + 'px';

        void markBig.offsetWidth; // force reflow so the frozen values above apply before transitioning
        void textEl.offsetWidth;

        // The big mark's opacity fades across the *entire* move (not just
        // the tail end) in step with its own shrink — it starts faint
        // (BIG_MARK_OPACITY) and is already most of the way to invisible
        // well before it gets small enough for its dense linework to blur
        // together, instead of staying at full strength right up until a
        // late, sudden swap (reported directly as "糊成一团" — a blurry,
        // abruptly-handled patch). The small simple mark fades in over the
        // back half of the same move, so the two overlap smoothly and both
        // finish exactly when the position/size move does.
        var CROSS_DELAY = Math.round(MOVE * 0.45);
        var CROSS_DUR = MOVE - CROSS_DELAY;

        markBig.style.transition =
          'left ' + MOVE + 'ms ' + EASE + ',top ' + MOVE + 'ms ' + EASE + ',' +
          'width ' + MOVE + 'ms ' + EASE + ',height ' + MOVE + 'ms ' + EASE + ',' +
          'opacity ' + MOVE + 'ms ease';
        markBig.style.left = markTargetRect.left + 'px';
        markBig.style.top = markTargetRect.top + 'px';
        markBig.style.width = markTargetRect.width + 'px';
        markBig.style.height = markTargetRect.height + 'px';
        markBig.style.opacity = '0';

        markSmall.style.transition = 'opacity ' + CROSS_DUR + 'ms ease ' + CROSS_DELAY + 'ms';
        markSmall.style.opacity = '1';

        textEl.style.transition = 'left ' + MOVE + 'ms ' + EASE + ',top ' + MOVE + 'ms ' + EASE;
        textEl.style.left = textTargetRect.left + 'px';
        textEl.style.top = textTargetRect.top + 'px';

        nameEl.style.transition = 'font-size ' + MOVE + 'ms ' + EASE;
        subEl.style.transition = 'font-size ' + MOVE + 'ms ' + EASE + ',margin-left ' + MOVE + 'ms ' + EASE;
        nameEl.style.fontSize = nameTarget + 'px';
        subEl.style.fontSize = subTarget + 'px';
        subEl.style.marginLeft = '0px';
      }, HOLD);

      // let the fully-docked, header-matching result hold for a beat so the
      // "big logo becomes the small one" move actually reads, THEN dissolve
      // the scrim to hand off to the real header underneath (same position/
      // size/colors by now, so the swap in finish() below is seamless).
      setTimeout(function () {
        if (overlay) overlay.classList.add('is-leaving');
      }, HOLD + MOVE + PAUSE);

      setTimeout(finish, HOLD + MOVE + PAUSE + LEAVE_FADE);
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

  /* --- contact form: /contact.php (同一ドメイン内のPHP) へ fetch で送信 --- */
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    var tsField = document.getElementById('cf-ts');
    // ページ読込時刻を記録 — contact.php 側でこの時刻からの経過が短すぎる
    // 送信（人間がフォームを読んで書く時間がない）を弾くための簡易ボット対策
    if (tsField) tsField.value = String(Date.now());

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      var success = document.getElementById('formSuccess');
      var errorEl = document.getElementById('formError');
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      if (errorEl) errorEl.hidden = true;
      if (submitBtn) submitBtn.disabled = true;

      fetch('/contact.php', { method: 'POST', body: new FormData(contactForm) })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (submitBtn) submitBtn.disabled = false;
          if (data && data.ok) {
            success.hidden = false;
            success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            contactForm.reset();
            if (tsField) tsField.value = String(Date.now());
          } else if (errorEl) {
            errorEl.hidden = false;
            errorEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          }
        })
        .catch(function () {
          if (submitBtn) submitBtn.disabled = false;
          if (errorEl) {
            errorEl.hidden = false;
            errorEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          }
        });
    });
  }

  /* --- scroll reveal --- */
  var reveals = document.querySelectorAll('.reveal');

  /* stagger sibling .reveal elements 100ms apart (per parent group), so a
     row of cards settles in sequence instead of all at once. General by
     DOM position rather than a hardcoded list of grid selectors, so it
     applies to any current or future group of reveals automatically. */
  if (!reduceMotion) {
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      var i = parent.__revealCount || 0;
      el.style.setProperty('--rd', (i * 100) + 'ms');
      parent.__revealCount = i + 1;
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

  /* --- number count-up (e.g. founding year in the company facts) ---
     Any element with data-count-to="N" counts up from 0 to N once it
     scrolls into view. IntersectionObserver-driven, one-shot, and skipped
     entirely under reduced motion (jumps straight to the final number). */
  var counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    var runCounter = function (el) {
      var target = parseInt(el.getAttribute('data-count-to'), 10);
      if (reduceMotion || isNaN(target)) {
        el.textContent = isNaN(target) ? el.textContent : target;
        return;
      }
      var duration = 1200;
      var startTime = null;
      function tick(ts) {
        if (startTime === null) startTime = ts;
        var progress = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
        }
      }
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      var counterIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            runCounter(en.target);
            counterIo.unobserve(en.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { counterIo.observe(el); });
    } else {
      counters.forEach(function (el) { el.textContent = el.getAttribute('data-count-to'); });
    }
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
