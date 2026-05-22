/* ════════════════════════════════════════════
   GALLERY — Carousel & Lightbox
   Les Marines d'Hélios
   ════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Lightbox singleton ────────────────────── */
  let lightboxEl = null;
  let lightboxImg = null;
  let lightboxCounter = null;
  let lightboxImages = [];
  let lightboxIdx = 0;

  function createLightbox() {
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-label', 'Galerie photos');

    lightboxEl.innerHTML = `
      <button class="lightbox__close" aria-label="Fermer">
        <svg viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
      </button>
      <button class="lightbox__arrow lightbox__arrow--prev" aria-label="Photo précédente">
        <svg viewBox="0 0 24 24"><polyline points="15,4 7,12 15,20"/></svg>
      </button>
      <div class="lightbox__img-wrap">
        <img src="" alt="Photo en plein écran">
      </div>
      <button class="lightbox__arrow lightbox__arrow--next" aria-label="Photo suivante">
        <svg viewBox="0 0 24 24"><polyline points="9,4 17,12 9,20"/></svg>
      </button>
      <div class="lightbox__counter"></div>
    `;

    document.body.appendChild(lightboxEl);

    lightboxImg = lightboxEl.querySelector('.lightbox__img-wrap img');
    lightboxCounter = lightboxEl.querySelector('.lightbox__counter');

    // Close
    lightboxEl.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightboxEl.addEventListener('click', function (e) {
      if (e.target === lightboxEl) closeLightbox();
    });

    // Arrows
    lightboxEl.querySelector('.lightbox__arrow--prev').addEventListener('click', function (e) {
      e.stopPropagation();
      lightboxPrev();
    });
    lightboxEl.querySelector('.lightbox__arrow--next').addEventListener('click', function (e) {
      e.stopPropagation();
      lightboxNext();
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (!lightboxEl.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') lightboxPrev();
      if (e.key === 'ArrowRight') lightboxNext();
    });

    // Touch swipe for lightbox
    let touchStartX = 0;
    let touchEndX = 0;
    lightboxEl.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    lightboxEl.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) lightboxNext();
        else lightboxPrev();
      }
    }, { passive: true });
  }

  function openLightbox(images, startIdx) {
    if (!lightboxEl) createLightbox();
    lightboxImages = images;
    lightboxIdx = startIdx || 0;
    updateLightbox();
    lightboxEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function lightboxPrev() {
    lightboxIdx = (lightboxIdx - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightbox();
  }

  function lightboxNext() {
    lightboxIdx = (lightboxIdx + 1) % lightboxImages.length;
    updateLightbox();
  }

  function updateLightbox() {
    lightboxImg.src = lightboxImages[lightboxIdx];
    lightboxCounter.textContent = (lightboxIdx + 1) + ' / ' + lightboxImages.length;
  }

  /* ── Carousel init ─────────────────────────── */
  function initCarousel(mediaEl) {
    const carousel = mediaEl.querySelector('.house-carousel');
    if (!carousel) return;

    const track = carousel.querySelector('.house-carousel__track');
    const slides = carousel.querySelectorAll('.house-carousel__slide');
    const dots = carousel.querySelectorAll('.house-carousel__dot');
    const prevBtn = carousel.querySelector('.house-carousel__arrow--prev');
    const nextBtn = carousel.querySelector('.house-carousel__arrow--next');
    const total = slides.length;
    let current = 0;
    let autoTimer = null;

    // Collect all image sources
    const imageSrcs = [];
    slides.forEach(function (slide) {
      const img = slide.querySelector('img');
      if (img) imageSrcs.push(img.src);
    });

    function goTo(idx) {
      current = ((idx % total) + total) % total;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
      });
      resetAuto();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 6000);
    }

    // Arrow clicks
    if (prevBtn) prevBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      prev();
    });
    if (nextBtn) nextBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      next();
    });

    // Dot clicks
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        goTo(i);
      });
    });

    // Image click → lightbox
    slides.forEach(function (slide, i) {
      var img = slide.querySelector('img');
      if (img) {
        img.addEventListener('click', function (e) {
          e.stopPropagation();
          e.preventDefault();
          openLightbox(imageSrcs, i);
        });
      }
    });

    // Touch swipe for inline carousel
    let touchX = 0;
    carousel.addEventListener('touchstart', function (e) {
      touchX = e.changedTouches[0].screenX;
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var diff = touchX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
      }
    }, { passive: true });

    // Pause auto on hover
    mediaEl.addEventListener('mouseenter', function () { clearInterval(autoTimer); });
    mediaEl.addEventListener('mouseleave', function () { resetAuto(); });

    // Start auto-advance
    resetAuto();
    goTo(0);
  }

  /* ── Init all carousels on page ────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    var mediaEls = document.querySelectorAll('.house-detail__media, .house-card__media');
    mediaEls.forEach(initCarousel);
  });

})();
