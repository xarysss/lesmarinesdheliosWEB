/* ============================================
   DATE RANGE PICKER — Marines d'Hélios
   Vanilla JS, FR locale, 2 mois côte à côte,
   semaine du lundi au dimanche, dates passées
   désactivées, format "Sam. 11 juil. 2026"
   ============================================ */

(function () {
  'use strict';

  const arrivee = document.getElementById('arrivee');
  const depart = document.getElementById('depart');
  if (!arrivee || !depart) return;

  const wrapper = document.querySelector('.daterange');
  if (!wrapper) return;

  const combo = wrapper.querySelector('.dr-combo');
  const segStart = wrapper.querySelector('.dr-seg[data-target="start"]');
  const segEnd = wrapper.querySelector('.dr-seg[data-target="end"]');

  // ── Locale FR ────────────────────────────────────────
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
                      'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const JOURS_COURT = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
  const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // ── Utilitaires date ─────────────────────────────────
  const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
  const sameDay = (a, b) => !!(a && b && a.getFullYear() === b.getFullYear()
                            && a.getMonth() === b.getMonth() && a.getDate() === b.getDate());
  const addMonths = (d, n) => new Date(d.getFullYear(), d.getMonth() + n, 1);
  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
  // Lundi-first : Dim(0) → 6, Lun(1) → 0, …
  const dayOfWeekMon = (d) => (d.getDay() + 6) % 7;

  const formatLong = (d) => {
    if (!d) return '';
    return `${JOURS_COURT[d.getDay()]} ${d.getDate()} ${MOIS_COURT[d.getMonth()]} ${d.getFullYear()}`;
  };
  const formatHeader = (d) => `${MOIS[d.getMonth()]} ${d.getFullYear()}`;

  const nightsBetween = (a, b) => {
    if (!a || !b) return 0;
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
  };

  // ── État ─────────────────────────────────────────────
  let viewDate = startOfMonth(today());
  let startDate = null;
  let endDate = null;
  let hoverDate = null;
  let focusedField = 'start';
  const minDate = today();
  let isOpen = false;

  // ── Construction du popover ──────────────────────────
  const pop = document.createElement('div');
  pop.className = 'dp-pop';
  pop.innerHTML = `
    <div class="dp-head">
      <button type="button" class="dp-nav" data-nav="prev" aria-label="Mois précédent">
        <svg viewBox="0 0 24 24"><polyline points="15,6 9,12 15,18"/></svg>
      </button>
      <div style="font-family:var(--font-ui); font-size:11px; letter-spacing:0.22em; text-transform:uppercase; color:var(--muted); font-weight:600;">
        Choisissez vos dates
      </div>
      <button type="button" class="dp-nav" data-nav="next" aria-label="Mois suivant">
        <svg viewBox="0 0 24 24"><polyline points="9,6 15,12 9,18"/></svg>
      </button>
    </div>
    <div class="dp-months" data-months></div>
    <div class="dp-foot">
      <div class="dp-summary" data-summary>Sélectionnez une date d'arrivée.</div>
      <button type="button" class="dp-clear" data-clear>Effacer</button>
    </div>
  `;
  wrapper.appendChild(pop);

  const monthsEl = pop.querySelector('[data-months]');
  const summaryEl = pop.querySelector('[data-summary]');
  const prevBtn = pop.querySelector('[data-nav="prev"]');
  const nextBtn = pop.querySelector('[data-nav="next"]');
  const clearBtn = pop.querySelector('[data-clear]');

  // ── Rendu d'un mois ──────────────────────────────────
  function renderMonth(monthDate) {
    const monthEl = document.createElement('div');
    monthEl.className = 'dp-month';

    const label = document.createElement('div');
    label.className = 'dp-month__label';
    label.textContent = formatHeader(monthDate);
    monthEl.appendChild(label);

    const grid = document.createElement('div');
    grid.className = 'dp-grid';
    DOW.forEach((d) => {
      const dow = document.createElement('div');
      dow.className = 'dp-dow';
      dow.textContent = d;
      grid.appendChild(dow);
    });

    const first = startOfMonth(monthDate);
    const last = endOfMonth(monthDate);
    const leading = dayOfWeekMon(first);

    for (let i = 0; i < leading; i++) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'dp-day is-out';
      cell.tabIndex = -1;
      cell.disabled = true;
      grid.appendChild(cell);
    }

    for (let day = 1; day <= last.getDate(); day++) {
      const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dp-day';
      btn.textContent = day;
      btn.dataset.iso = d.toISOString();

      if (d < minDate) btn.disabled = true;
      if (sameDay(d, today())) btn.classList.add('is-today');
      if (sameDay(d, startDate)) btn.classList.add('is-start');
      if (sameDay(d, endDate)) btn.classList.add('is-end');

      if (startDate) {
        const upper = endDate || (focusedField === 'end' ? hoverDate : null);
        if (upper && d > startDate && d < upper) {
          btn.classList.add('is-in-range');
        }
      }

      grid.appendChild(btn);
    }

    monthEl.appendChild(grid);
    return monthEl;
  }

  // ── Rendu global ─────────────────────────────────────
  function render() {
    monthsEl.innerHTML = '';
    monthsEl.appendChild(renderMonth(viewDate));
    monthsEl.appendChild(renderMonth(addMonths(viewDate, 1)));

    const cur = startOfMonth(today());
    prevBtn.disabled = viewDate <= cur;

    if (!startDate) {
      summaryEl.innerHTML = `Sélectionnez votre date d'arrivée.`;
    } else if (!endDate) {
      summaryEl.innerHTML = `Arrivée : <strong>${formatLong(startDate)}</strong> · choisissez le départ.`;
    } else {
      const n = nightsBetween(startDate, endDate);
      summaryEl.innerHTML = `Du <strong>${formatLong(startDate)}</strong> au <strong>${formatLong(endDate)}</strong><span class="num">${n} nuit${n > 1 ? 's' : ''}</span>`;
    }
  }

  // ── Sélection d'un jour ──────────────────────────────
  function onPickDay(d) {
    if (!startDate || (startDate && endDate)) {
      // Nouvelle sélection — on repart de zéro
      startDate = d;
      endDate = null;
      hoverDate = null;
      focusedField = 'end';
    } else {
      // On a un start, on pose end
      if (d < startDate) {
        // Click avant le start → on remplace le start
        startDate = d;
        endDate = null;
        hoverDate = null;
        focusedField = 'end';
        syncInputs();
        updateActiveSegment();
        render();
        return;
      } else if (sameDay(d, startDate)) {
        // Même jour → réservation d'une nuit
        endDate = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      } else {
        endDate = d;
      }
      hoverDate = null;
    }

    syncInputs();
    updateActiveSegment();
    render();

    if (startDate && endDate) {
      setTimeout(close, 240);
    }
  }

  function syncInputs() {
    arrivee.value = startDate ? formatLong(startDate) : '';
    depart.value = endDate ? formatLong(endDate) : '';
  }

  function updateActiveSegment() {
    if (!isOpen) {
      combo && combo.classList.remove('is-focused');
      segStart && segStart.classList.remove('is-active');
      segEnd && segEnd.classList.remove('is-active');
      return;
    }
    combo && combo.classList.add('is-focused');
    if (segStart && segEnd) {
      segStart.classList.toggle('is-active', focusedField === 'start');
      segEnd.classList.toggle('is-active', focusedField === 'end');
    }
  }

  function clearRange() {
    startDate = null;
    endDate = null;
    hoverDate = null;
    focusedField = 'start';
    syncInputs();
    updateActiveSegment();
    render();
  }

  function open(which) {
    isOpen = true;
    focusedField = which || (startDate && !endDate ? 'end' : 'start');
    const anchor = (focusedField === 'end' && startDate) ? startDate : (startDate || today());
    viewDate = startOfMonth(anchor);
    render();
    updateActiveSegment();
    pop.classList.add('is-open');
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    pop.classList.remove('is-open');
    updateActiveSegment();
  }

  // ── Délégation d'événements sur le grid ──────────────
  // (évite que le re-render au survol ne casse le click)
  monthsEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.dp-day');
    if (!btn || btn.disabled || !btn.dataset.iso) return;
    e.preventDefault();
    e.stopPropagation();
    onPickDay(new Date(btn.dataset.iso));
  });

  monthsEl.addEventListener('mouseover', (e) => {
    const btn = e.target.closest('.dp-day');
    if (!btn || btn.disabled || !btn.dataset.iso) return;
    if (startDate && !endDate) {
      const d = new Date(btn.dataset.iso);
      if (!sameDay(d, hoverDate)) {
        hoverDate = d;
        render();
      }
    }
  });

  monthsEl.addEventListener('mouseleave', () => {
    if (startDate && !endDate && hoverDate) {
      hoverDate = null;
      render();
    }
  });

  // ── Inputs ───────────────────────────────────────────
  [arrivee, depart].forEach((input) => {
    input.readOnly = true;
    input.addEventListener('mousedown', (e) => {
      // Si déjà ouvert et qu'on click sur le même champ, on ferme
      const which = input === arrivee ? 'start' : 'end';
      if (isOpen && focusedField === which) {
        e.preventDefault();
        close();
        return;
      }
      e.stopPropagation();
      open(which);
    });
    input.addEventListener('focus', (e) => {
      // On bascule simplement le segment actif si déjà ouvert
      if (isOpen) {
        focusedField = input === arrivee ? 'start' : 'end';
        updateActiveSegment();
        render();
      }
    });
  });

  // Click sur un segment (label ou container) → ouvre le picker
  [segStart, segEnd].forEach((seg) => {
    if (!seg) return;
    seg.addEventListener('mousedown', (e) => {
      // Si le mousedown vient d'un input on laisse passer (handler dédié)
      if (e.target.tagName === 'INPUT') return;
      e.preventDefault();
      e.stopPropagation();
      open(seg.dataset.target);
    });
  });

  // ── Navigation mois ──────────────────────────────────
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    viewDate = addMonths(viewDate, -1);
    render();
  });
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    viewDate = addMonths(viewDate, 1);
    render();
  });
  clearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    clearRange();
  });

  pop.addEventListener('mousedown', (e) => e.stopPropagation());
  pop.addEventListener('click', (e) => e.stopPropagation());

  document.addEventListener('mousedown', () => close());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Init
  render();
})();
