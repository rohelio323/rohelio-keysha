(function () {
  var start = new Date(2024, 0, 2);
  var now = new Date();
  var diff = Math.floor((now - start) / 86400000);

  var inline = document.getElementById('dayCountInline');
  if (inline) inline.textContent = diff;

  var navPill = document.getElementById('navDayPill');
  if (navPill) navPill.textContent = 'hari ke ' + diff;
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
  if (scrollBtn && cerita) {
    scrollBtn.addEventListener('click', function () {
      cerita.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
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
    lightbox.classList.toggle('lightbox-decor', card.getAttribute('data-decor') === 'true');
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
