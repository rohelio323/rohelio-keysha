(function () {
  var start = new Date(2024, 0, 2);
  var now = new Date();
  var diff = Math.floor((now - start) / 86400000);

  var inline = document.getElementById('dayCountInline');
  if (inline) inline.textContent = diff;

  var navPill = document.getElementById('navDayPill');
  if (navPill) navPill.textContent = 'day ' + diff;
})();

(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;

  function setNavHeight() {
    document.documentElement.style.setProperty('--nav-h', nav.offsetHeight + 'px');
  }
  setNavHeight();
  window.addEventListener('load', setNavHeight);
  window.addEventListener('resize', setNavHeight);

  var scrollBtn = document.getElementById('scrollNextBtn');
  var cerita = document.getElementById('cerita');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var heartColors = ['#ff5a45', '#e8a0b4', '#e8a93a', '#ff8a75'];

  function makeParticle(cx, cy, tx, ty, size, color, duration, delay) {
    var particle = document.createElement('span');
    particle.className = 'heart-particle';
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');
    particle.style.left = cx + 'px';
    particle.style.top = cy + 'px';
    particle.style.color = color;
    particle.style.animationDuration = duration + 'ms';
    particle.style.animationDelay = delay + 'ms';
    particle.innerHTML =
      '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '">' +
      '<path d="M12 21s-7.5-4.6-10-9.2C.6 8.3 2.7 5 6.1 5c1.9 0 3.4 1 5.9 3.4C14.5 6 16 5 17.9 5c3.4 0 5.5 3.3 4.1 6.8C19.5 16.4 12 21 12 21z" fill="currentColor"/>' +
      '</svg>';
    document.body.appendChild(particle);
    particle.addEventListener('animationend', function () { particle.remove(); });
  }

  // Particles travel outward tracing a heart-curve silhouette, like a
  // heart-shaped firework shell blooming across the screen.
  function heartShapedBurst(cx, cy) {
    var count = 56;
    var reach = Math.min(window.innerWidth, window.innerHeight) * 0.42;
    var scale = reach / 17;
    for (var i = 0; i < count; i++) {
      var t = (Math.PI * 2 * i) / count;
      var hx = 16 * Math.pow(Math.sin(t), 3);
      var hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      var tx = hx * scale;
      var ty = -hy * scale;
      var size = 12 + Math.random() * 12;
      var color = heartColors[i % heartColors.length];
      var duration = 1500 + Math.random() * 500;
      var delay = i * 9;
      makeParticle(cx, cy, tx, ty, size, color, duration, delay);
    }
  }

  function sparkleBurst(cx, cy) {
    var count = 20;
    var reach = 60 + Math.random() * 70;
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var distance = reach * (0.5 + Math.random() * 0.5);
      var tx = Math.cos(angle) * distance;
      var ty = Math.sin(angle) * distance;
      var size = 8 + Math.random() * 8;
      var color = heartColors[i % heartColors.length];
      var duration = 900 + Math.random() * 400;
      makeParticle(cx, cy, tx, ty, size, color, duration, 0);
    }
  }

  var fireworkDim = document.getElementById('fireworkDim');
  function showDim() { if (fireworkDim) fireworkDim.classList.add('is-active'); }
  function hideDim() { if (fireworkDim) fireworkDim.classList.remove('is-active'); }

  function spawnTrailSpark(x, y) {
    var spark = document.createElement('span');
    spark.className = 'rocket-trail';
    spark.style.left = x + 'px';
    spark.style.top = y + 'px';
    document.body.appendChild(spark);
    spark.addEventListener('animationend', function () { spark.remove(); });
  }

  function launchRocket(x0, y0, x1, y1, duration, onArrive) {
    var rocket = document.createElement('span');
    rocket.className = 'firework-rocket';
    rocket.style.left = x0 + 'px';
    rocket.style.top = y0 + 'px';
    rocket.style.setProperty('--rise', (y1 - y0) + 'px');
    rocket.style.animationDuration = duration + 'ms';
    document.body.appendChild(rocket);

    var steps = 7;
    for (var s = 1; s <= steps; s++) {
      (function (s) {
        setTimeout(function () {
          var f = s / (steps + 1);
          spawnTrailSpark(x0, y0 + (y1 - y0) * f);
        }, (duration / (steps + 1)) * s);
      })(s);
    }

    rocket.addEventListener('animationend', function () {
      rocket.remove();
      onArrive();
    });
  }

  function bigFireworkShow(originX) {
    if (reduceMotion) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var groundY = vh + 20;

    showDim();

    launchRocket(originX, groundY, vw * 0.5, vh * 0.34, 820, function () {
      heartShapedBurst(vw * 0.5, vh * 0.34);
    });

    setTimeout(function () {
      launchRocket(vw * 0.2, groundY, vw * 0.2, vh * 0.44, 700, function () {
        sparkleBurst(vw * 0.2, vh * 0.44);
      });
    }, 200);

    setTimeout(function () {
      launchRocket(vw * 0.8, groundY, vw * 0.8, vh * 0.4, 700, function () {
        sparkleBurst(vw * 0.8, vh * 0.4);
      });
    }, 380);

    setTimeout(function () {
      launchRocket(vw * 0.5, groundY, vw * 0.5, vh * 0.62, 620, function () {
        sparkleBurst(vw * 0.5, vh * 0.62);
      });
    }, 950);

    setTimeout(hideDim, 3200);
  }

  if (scrollBtn && cerita) {
    scrollBtn.addEventListener('click', function () {
      var rect = scrollBtn.getBoundingClientRect();
      bigFireworkShow(rect.left + rect.width / 2);
      cerita.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
})();

(function () {
  if (!('IntersectionObserver' in window)) return;
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(function (el) { observer.observe(el); });
})();

(function () {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCaption = document.getElementById('lightboxCaption');
  if (!lightbox || !lightboxImg || !lightboxCaption) return;

  function openLightbox(card) {
    lightboxImg.src = card.getAttribute('data-img');
    lightboxImg.alt = card.getAttribute('data-alt') || '';
    lightboxCaption.innerHTML = card.getAttribute('data-caption') || '';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.g-card-photo').forEach(function (card) {
    card.addEventListener('click', function () { openLightbox(card); });
  });

  lightbox.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', closeLightbox);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });
})();
