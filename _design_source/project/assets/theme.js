/* ============================================
   THEME + SITE BEHAVIOR
   - sticky header solidify
   - mobile nav toggle
   - shared theme tokens applied from localStorage
   ============================================ */

(function () {
  'use strict';

  // ── PALETTES ────────────────────────────────
  const PALETTES = {
    'sable-marine': {
      label: 'Sable & Marine',
      vars: {
        '--cream': '#FBF6EE',
        '--sand': '#EFE5D3',
        '--sand-2': '#E4D6BD',
        '--bone': '#F4ECDC',
        '--ink': '#15263D',
        '--navy': '#1F3A5F',
        '--navy-soft': '#5C7896',
        '--terracotta': '#E5B12F',
        '--terracotta-deep': '#C99A1F',
        '--muted': '#6B6660',
        '--line': '#DDD0B7'
      }
    },
    'lin-cobalt': {
      label: 'Lin & Cobalt',
      vars: {
        '--cream': '#F7F4EE',
        '--sand': '#E8E2D2',
        '--sand-2': '#D9D0BC',
        '--bone': '#EFEAE0',
        '--ink': '#0F2746',
        '--navy': '#1B3A66',
        '--navy-soft': '#5A7596',
        '--terracotta': '#D49050',
        '--terracotta-deep': '#B5723A',
        '--muted': '#666058',
        '--line': '#D5CDBB'
      }
    },
    'coquillage-olive': {
      label: 'Coquillage & Olive',
      vars: {
        '--cream': '#F5F2EA',
        '--sand': '#E7DFCC',
        '--sand-2': '#D6CCB2',
        '--bone': '#EDE7D8',
        '--ink': '#1F3A36',
        '--navy': '#284D45',
        '--navy-soft': '#6A8079',
        '--terracotta': '#8B936A',
        '--terracotta-deep': '#6E7752',
        '--muted': '#6B6660',
        '--line': '#D2C8B0'
      }
    },
    'ivoire-argile': {
      label: 'Ivoire & Argile',
      vars: {
        '--cream': '#FAF6EF',
        '--sand': '#EFE7D7',
        '--sand-2': '#E0D4BC',
        '--bone': '#F2EBDA',
        '--ink': '#221C16',
        '--navy': '#3D332A',
        '--navy-soft': '#7C7368',
        '--terracotta': '#B96A47',
        '--terracotta-deep': '#9A5236',
        '--muted': '#736B62',
        '--line': '#DDD2BA'
      }
    }
  };

  const FONTS = {
    'cormorant-manrope': {
      label: 'Cormorant + Manrope',
      display: '"Cormorant Garamond", "Times New Roman", serif',
      ui: '"Manrope", "Helvetica Neue", Arial, sans-serif'
    },
    'dmserif-worksans': {
      label: 'DM Serif + Work Sans',
      display: '"DM Serif Display", "Times New Roman", serif',
      ui: '"Work Sans", "Helvetica Neue", Arial, sans-serif'
    },
    'marcellus-manrope': {
      label: 'Marcellus + Manrope',
      display: '"Marcellus", "Times New Roman", serif',
      ui: '"Manrope", "Helvetica Neue", Arial, sans-serif'
    }
  };

  function applyTheme(t) {
    const root = document.documentElement;
    const pal = PALETTES[t.palette] || PALETTES['sable-marine'];
    const fnt = FONTS[t.fontPair] || FONTS['cormorant-manrope'];
    Object.entries(pal.vars).forEach(([k, v]) => root.style.setProperty(k, v));
    root.style.setProperty('--font-display', fnt.display);
    root.style.setProperty('--font-ui', fnt.ui);

    // Card style (houses)
    document.querySelectorAll('.houses-grid').forEach(el => {
      el.classList.remove('cards--flat', 'cards--bordered');
      if (t.cardStyle === 'flat') el.classList.add('cards--flat');
      if (t.cardStyle === 'bordered') el.classList.add('cards--bordered');
    });

    // Hero layout
    document.querySelectorAll('.hero').forEach(el => {
      el.classList.toggle('hero--centered', t.heroLayout === 'centered');
    });
  }

  function readTheme() {
    try {
      return JSON.parse(localStorage.getItem('mh-theme') || 'null') || {};
    } catch (e) {
      return {};
    }
  }
  function saveTheme(t) {
    try { localStorage.setItem('mh-theme', JSON.stringify(t)); } catch (e) {}
  }

  // Expose for other pages and the tweaks panel
  window.MH = {
    PALETTES,
    FONTS,
    applyTheme,
    readTheme,
    saveTheme
  };

  // ── HEADER scroll behavior ──────────────────
  function setupHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const onHero = header.dataset.onHero === 'true';
    if (onHero) header.classList.add('is-on-hero');
    else header.classList.add('is-solid'); // non-hero pages are always solid

    const update = () => {
      const y = window.scrollY;
      const threshold = onHero ? 100 : 0;
      if (onHero) header.classList.toggle('is-solid', y > threshold);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  // ── Mobile nav ──────────────────────────────
  function setupMobileNav() {
    const burger = document.querySelector('.nav-burger');
    const nav = document.querySelector('.main-nav');
    if (!burger || !nav) return;
    burger.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
  }

  // ── Init ────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(readTheme());
    setupHeader();
    setupMobileNav();
  });
})();
