/* ============================================
   RESERVATION FORM — EmailJS
   - Envoie un email à l'hôte avec les détails
   - Envoie un email de confirmation au visiteur
   - Affiche un panneau de succès inline
   ============================================ */

/* ────────────────────────────────────────────
   ⚠️  CONFIGURATION — À REMPLIR
   Récupère ces 4 valeurs dans ton dashboard EmailJS
   (voir instructions dans le message Claude)
   ──────────────────────────────────────────── */
const EMAILJS_CONFIG = {
  PUBLIC_KEY:        'CD64YUE_4TLNjJ0ot',
  SERVICE_ID:        'service_rooen3f',
  TEMPLATE_ADMIN:    'template_4aqksvf', // mail envoyé à toi (lesmarinesdhelios-contact@yahoo.com)
  TEMPLATE_CUSTOMER: 'template_hm3rw32'  // mail de confirmation envoyé au visiteur
};

const ADMIN_EMAIL = 'lesmarinesdhelios-contact@yahoo.com';

(function () {
  'use strict';

  const form = document.getElementById('reservation-form');
  if (!form) return;

  const submitBtn = form.querySelector('[data-submit-btn]');
  const errorEl = form.querySelector('[data-form-error]');
  const successEl = document.querySelector('[data-form-success]');
  const sideEl = document.querySelector('.form-shell .side');
  const confirmEmailEl = successEl ? successEl.querySelector('[data-confirm-email]') : null;
  const newRequestBtn = successEl ? successEl.querySelector('[data-new-request]') : null;

  // Initialise EmailJS si la lib est chargée
  if (window.emailjs && typeof window.emailjs.init === 'function') {
    try {
      window.emailjs.init({ publicKey: EMAILJS_CONFIG.PUBLIC_KEY });
    } catch (_) { /* ignore — sera retest é à l'envoi */ }
  }

  const showError = (msg) => {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = false;
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const clearError = () => {
    if (!errorEl) return;
    errorEl.hidden = true;
    errorEl.textContent = '';
  };

  const showSuccess = (email) => {
    if (!successEl) return;
    if (confirmEmailEl) confirmEmailEl.textContent = email || '';
    form.hidden = true;
    if (sideEl) sideEl.hidden = true;
    successEl.hidden = false;
    successEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetForReuse = () => {
    form.reset();
    const arrivee = document.getElementById('arrivee');
    const depart = document.getElementById('depart');
    if (arrivee) arrivee.value = '';
    if (depart) depart.value = '';
    form.hidden = false;
    if (sideEl) sideEl.hidden = false;
    if (successEl) successEl.hidden = true;
    clearError();
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (newRequestBtn) {
    newRequestBtn.addEventListener('click', resetForReuse);
  }

  const isConfigured = () => {
    return EMAILJS_CONFIG.PUBLIC_KEY && !EMAILJS_CONFIG.PUBLIC_KEY.startsWith('REMPLACE_MOI')
        && EMAILJS_CONFIG.SERVICE_ID && !EMAILJS_CONFIG.SERVICE_ID.startsWith('REMPLACE_MOI')
        && EMAILJS_CONFIG.TEMPLATE_ADMIN && !EMAILJS_CONFIG.TEMPLATE_ADMIN.startsWith('REMPLACE_MOI')
        && EMAILJS_CONFIG.TEMPLATE_CUSTOMER && !EMAILJS_CONFIG.TEMPLATE_CUSTOMER.startsWith('REMPLACE_MOI');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    // Honeypot anti-spam
    const honey = form.querySelector('input[name="_honey"]');
    if (honey && honey.value) return;

    if (!window.emailjs) {
      showError('Le service d\'envoi n\'a pas pu se charger. Vérifiez votre connexion internet, ou joignez-nous au 06 52 26 45 31.');
      return;
    }
    if (!isConfigured()) {
      showError('Le formulaire n\'est pas encore configuré. Merci de nous joindre directement au 06 52 26 45 31 ou par email à ' + ADMIN_EMAIL + '.');
      console.error('[reservation-form] EmailJS non configuré — remplis EMAILJS_CONFIG en haut de assets/reservation-form.js');
      return;
    }

    const fd = new FormData(form);
    const nom       = (fd.get('Nom')       || '').toString().trim();
    const prenom    = (fd.get('Prénom')    || '').toString().trim();
    const email     = (fd.get('email')     || '').toString().trim();
    const tel       = (fd.get('Téléphone') || '').toString().trim();
    const arrivee   = (fd.get('Arrivée')   || '').toString().trim();
    const depart    = (fd.get('Départ')    || '').toString().trim();
    const personnes = (fd.get('Personnes') || '').toString().trim();
    const logement  = (fd.get('Logement')  || '').toString().trim();
    const message   = (fd.get('Message')   || '').toString().trim();

    // Validation minimale
    if (!nom || !prenom || !email || !message) {
      showError('Merci de compléter votre nom, prénom, email et message.');
      return;
    }

    // Variables transmises aux deux templates EmailJS
    const sharedVars = {
      nom: nom,
      prenom: prenom,
      email: email,
      telephone: tel || '—',
      arrivee: arrivee || '—',
      depart: depart || '—',
      personnes: personnes || '—',
      logement: logement || 'Sans préférence',
      message: message,
      date_demande: new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
    };

    const originalLabel = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours…';

    try {
      // 1) Email vers l'hôte (toi) — avec toutes les infos de la demande
      await window.emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ADMIN,
        Object.assign({}, sharedVars, { to_email: ADMIN_EMAIL, reply_to: email })
      );

      // 2) Email de confirmation vers le visiteur
      await window.emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_CUSTOMER,
        Object.assign({}, sharedVars, { to_email: email, reply_to: ADMIN_EMAIL })
      );

      showSuccess(email);
    } catch (err) {
      console.error('[reservation-form] EmailJS error:', err);
      const detail = (err && (err.text || err.message)) ? ' (' + (err.text || err.message) + ')' : '';
      showError('L\'envoi a échoué' + detail + '. Merci de réessayer dans un instant, ou de nous joindre directement au 06 52 26 45 31.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;
    }
  });
})();
