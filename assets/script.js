(function () {
  var start = new Date(2024, 0, 2);
  var now = new Date();
  var diff = Math.floor((now - start) / 86400000);

  var inline = document.getElementById('dayCountInline');
  if (inline) inline.textContent = diff;

  var navPill = document.getElementById('navDayPill');
  if (navPill) navPill.textContent = 'day ' + diff;

  var igDayCount = document.getElementById('igDayCount');
  if (igDayCount) igDayCount.textContent = diff;
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
  function heartShapedBurst(cx, cy, sizeMult) {
    sizeMult = sizeMult || 1;
    var count = Math.round(64 * sizeMult);
    var reach = Math.min(window.innerWidth, window.innerHeight) * 0.42 * sizeMult;
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

  function sparkleBurst(cx, cy, big) {
    var count = big ? 34 : 22;
    var reach = (big ? 110 : 65) + Math.random() * 70;
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var distance = reach * (0.5 + Math.random() * 0.5);
      var tx = Math.cos(angle) * distance;
      var ty = Math.sin(angle) * distance;
      var size = 8 + Math.random() * 8;
      var color = heartColors[i % heartColors.length];
      var duration = 900 + Math.random() * 500;
      makeParticle(cx, cy, tx, ty, size, color, duration, 0);
    }
  }

  var fireworkDim = document.getElementById('fireworkDim');
  var fireworkAurora = document.getElementById('fireworkAurora');
  var destroyAurora = null;
  function showDim() {
    if (fireworkDim) fireworkDim.classList.add('is-active');
    if (fireworkAurora && window.LightPillar && !destroyAurora) {
      fireworkAurora.classList.add('is-active');
      destroyAurora = window.LightPillar.create(fireworkAurora, {
        topColor: '#5227FF',
        bottomColor: '#FF9FFC',
        intensity: 0.6,
        rotationSpeed: 0.4,
        glowAmount: 0.004,
        pillarWidth: 9.5,
        pillarHeight: 0.45,
        pillarRotation: 90,
        noiseIntensity: 0.4,
        quality: 'medium'
      });
    }
  }
  function hideDim() {
    if (fireworkDim) fireworkDim.classList.remove('is-active');
    if (fireworkAurora) fireworkAurora.classList.remove('is-active');
    setTimeout(function () {
      if (destroyAurora) { destroyAurora(); destroyAurora = null; }
    }, 600);
  }

  var fireworkAudio = document.getElementById('fireworkAudio');
  function playFireworkAudio() {
    if (!fireworkAudio) return;
    try {
      fireworkAudio.currentTime = 0;
      var p = fireworkAudio.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }
  // Leading silence in the dub before she says "3" — the on-screen countdown
  // waits this long before starting so the numbers line up with her voice.
  var countdownStartDelay = 1600;

  var countdownWrap = document.getElementById('fireworkCountdownWrap');
  var countdownNumber = document.getElementById('fireworkCountdown');
  function startCountdown(originX, onDone) {
    if (!countdownWrap || !countdownNumber) { onDone(); return; }
    var steps = ['3', '2', '1'];
    var stepDelays = [800, 1300, 800]; // ms to wait after showing each number before the next
    var i = 0;
    countdownWrap.classList.add('is-active');

    function tick() {
      if (i < steps.length) {
        countdownNumber.textContent = steps[i];
        countdownNumber.classList.remove('pop');
        void countdownNumber.offsetWidth;
        countdownNumber.classList.add('pop');
        var delay = stepDelays[i];
        i++;
        setTimeout(tick, delay);
      } else {
        countdownWrap.classList.remove('is-active');
        onDone();
      }
    }
    tick();
  }

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

  function shellAt(vw, vh, groundY, x, y, duration, delay, big) {
    setTimeout(function () {
      launchRocket(vw * x, groundY, vw * x, vh * y, duration, function () {
        sparkleBurst(vw * x, vh * y, big);
      });
    }, delay);
  }

  // A full hanabi-style show: an opening shell, a long volley of shells
  // launching from all across the sky, and a heart-shaped double finale.
  function bigFireworkShow(originX) {
    if (reduceMotion) return;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var groundY = vh + 20;

    // Opening shell, straight up from where she clicked.
    launchRocket(originX, groundY, vw * 0.5, vh * 0.3, 780, function () {
      heartShapedBurst(vw * 0.5, vh * 0.3, 1.1);
    });

    // A steady volley across the whole width of the sky.
    var volley = [
      { x: 0.12, y: 0.46, delay: 220, dur: 760 },
      { x: 0.88, y: 0.4, delay: 380, dur: 800 },
      { x: 0.28, y: 0.56, delay: 620, dur: 700, big: true },
      { x: 0.7, y: 0.5, delay: 780, dur: 720 },
      { x: 0.5, y: 0.62, delay: 1050, dur: 660 },
      { x: 0.18, y: 0.32, delay: 1300, dur: 800 },
      { x: 0.82, y: 0.3, delay: 1450, dur: 820, big: true },
      { x: 0.4, y: 0.44, delay: 1700, dur: 720 },
      { x: 0.6, y: 0.38, delay: 1850, dur: 740 },
      { x: 0.5, y: 0.5, delay: 2100, dur: 700, big: true }
    ];
    volley.forEach(function (shell) {
      shellAt(vw, vh, groundY, shell.x, shell.y, shell.dur, shell.delay, shell.big);
    });

    // Grand finale: two hearts blooming side by side.
    setTimeout(function () {
      launchRocket(vw * 0.5, groundY, vw * 0.36, vh * 0.28, 750, function () {
        heartShapedBurst(vw * 0.36, vh * 0.28, 0.85);
      });
    }, 2450);
    setTimeout(function () {
      launchRocket(vw * 0.5, groundY, vw * 0.64, vh * 0.28, 750, function () {
        heartShapedBurst(vw * 0.64, vh * 0.28, 0.85);
      });
    }, 2600);

    setTimeout(hideDim, 4600);
  }

  if (scrollBtn && cerita) {
    scrollBtn.addEventListener('click', function () {
      var rect = scrollBtn.getBoundingClientRect();
      var originX = rect.left + rect.width / 2;

      cerita.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (reduceMotion) return;

      showDim();
      playFireworkAudio();
      setTimeout(function () {
        startCountdown(originX, function () {
          bigFireworkShow(originX);
        });
      }, countdownStartDelay);
    });
  }
})();

(function () {
  var bg = document.getElementById('lightPillarBg');
  var heroPage = document.getElementById('heroPage');
  if (!bg || !heroPage || !window.LightPillar) return;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var destroy = null;
  function mount() {
    if (destroy) return;
    destroy = window.LightPillar.create(bg, {
      topColor: '#f0b4c6',
      bottomColor: '#ff7a63',
      intensity: 0.55,
      rotationSpeed: 0.2,
      glowAmount: 0.004,
      pillarWidth: 3.2,
      pillarHeight: 0.4,
      noiseIntensity: 0.35,
      quality: 'medium'
    });
  }
  function unmount() {
    if (destroy) { destroy(); destroy = null; }
  }

  if ('IntersectionObserver' in window) {
    var pillarObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          bg.classList.remove('is-visible');
          unmount();
        } else {
          bg.classList.add('is-visible');
          mount();
        }
      });
    }, { threshold: 0.05 });
    pillarObserver.observe(heroPage);
  } else {
    bg.classList.add('is-visible');
    mount();
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

(function () {
  var profileBtn = document.getElementById('profileBtn');
  var igProfile = document.getElementById('igProfile');
  if (!profileBtn || !igProfile) return;

  function openProfile() {
    igProfile.classList.add('is-open');
    igProfile.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeProfile() {
    igProfile.classList.remove('is-open');
    igProfile.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  profileBtn.addEventListener('click', openProfile);

  igProfile.querySelectorAll('[data-close]').forEach(function (el) {
    el.addEventListener('click', closeProfile);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeProfile();
  });
})();
