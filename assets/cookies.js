/* ============================================
   COOKIES CONSENT BANNER
   - Affiche une bannière tant qu'aucun choix n'est fait
   - Au consentement : injecte Google Tag Manager
   - Au refus : ne charge aucun script tiers
   - Stocke la décision 6 mois (recommandation CNIL)
   ============================================ */

(function () {
  'use strict';

  const GTM_ID = 'GTM-58CC9PG4';
  const STORAGE_KEY = 'helios_cookie_consent';
  const VALID_FOR_DAYS = 180;

  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      const age = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
      if (age > VALID_FOR_DAYS) return null;
      return data.consent; // 'accepted' | 'refused'
    } catch (_) { return null; }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        consent: value,
        timestamp: Date.now()
      }));
    } catch (_) { /* ignore */ }
  }

  function loadGTM() {
    if (window.__gtmLoaded) return;
    window.__gtmLoaded = true;
    (function (w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      const f = d.getElementsByTagName(s)[0];
      const j = d.createElement(s);
      const dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);
  }

  function buildBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookies-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Consentement aux cookies');
    banner.innerHTML = ''
      + '<div class="cookies-banner__inner">'
      +   '<div class="cookies-banner__text">'
      +     '<h3>Cookies et statistiques</h3>'
      +     '<p>Nous utilisons des cookies pour mesurer l\'audience du site (Google Analytics via Tag Manager) et améliorer votre expérience. Vous pouvez accepter, refuser, ou en savoir plus dans notre <a href="politique-confidentialite.html">politique de confidentialité</a>.</p>'
      +   '</div>'
      +   '<div class="cookies-banner__actions">'
      +     '<button type="button" class="cookies-btn cookies-btn--ghost" data-cookies-refuse>Refuser</button>'
      +     '<button type="button" class="cookies-btn cookies-btn--primary" data-cookies-accept>Accepter</button>'
      +   '</div>'
      + '</div>';

    banner.querySelector('[data-cookies-accept]').addEventListener('click', () => {
      setConsent('accepted');
      loadGTM();
      banner.remove();
    });
    banner.querySelector('[data-cookies-refuse]').addEventListener('click', () => {
      setConsent('refused');
      banner.remove();
    });
    return banner;
  }

  function init() {
    const consent = getConsent();
    if (consent === 'accepted') {
      loadGTM();
    } else if (consent === 'refused') {
      // Pas de chargement, pas de bannière
    } else {
      document.body.appendChild(buildBanner());
    }
  }

  // Expose un moyen de re-afficher la bannière (pour un lien "Gérer les cookies")
  window.heliosCookies = {
    reset: function () {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
      const existing = document.querySelector('.cookies-banner');
      if (existing) existing.remove();
      document.body.appendChild(buildBanner());
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
