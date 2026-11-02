'use strict';
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ICON = (id) => `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  /* ---------- Datos (reemplazar por datos del backend / loops EJS-PHP) ---------- */
  const CITIES = [['Lima','LIM','Perú'],['Cusco','CUZ','Perú'],['Arequipa','AQP','Perú'],['Roma','FCO','Italia'],['Tokio','HND','Japón'],['Nagoya','NGO','Japón'],['Osaka','KIX','Japón'],['Fukuoka','FUK','Japón'],['Hiroshima','HIJ','Japón'],['Nueva Delhi','DEL','India'],['Madrid','MAD','España'],['París','CDG','Francia'],['Nueva York','JFK','Estados Unidos'],['Cancún','CUN','México'],['Buenos Aires','EZE','Argentina'],['Bogotá','BOG','Colombia']];
  const PACKAGES = [
    ['Vuelo a Roma','RM','1.230',11, 'icons/roma.jpg', 'icons/aireuropa.png'],
    ['Vuelo a Tokio','TKY','2.890',9, 'icons/tokio.jpg', 'icons/japanairlines.png'],
    ['India','GAR','2.890',5, 'icons/india.jpg', 'icons/airindia.png'],
    ['Vuelo a París','PAR','1.540',8, 'icons/paris.jpg', 'icons/airefrance.png'] // <- Agrega más tarjetas aquí
  ];
  // ... asegúrate de hacerlo para todos
  const HOTELS = [
    ['The Ritz-Carlton, Tokyo','4.3',4,'Deluxe Room, 2 Queen Beds','18 noches, 2 personas','20.032','19.957',[['Reserva sin pagar ahora','b']],'icons/hotel1.jpg'],
    ['Oz Hotel Luxury','4.8',5,'Classic Room','1 noche, 2 personas','104','74',[['Desayuno','t']],'icons/hotel3.jpg'],
    ['Hotel Riu Plaza España','4.9',5,'Habitación Doble de Lujo','1 noche, 2 personas','414','268',[['Desayuno','t'],['Elegido por parejas','b']],'icons/hotel2.jpg'],
    ['Belmond Monasterio, Cusco','4.7',5,'Habitación Superior','2 noches, 2 personas','620','540',[['Desayuno','t']],'icons/hotel4.jpg'],
    ['Hotel Arts Barcelona','4.6',5,'Deluxe Vista al Mar','3 noches, 2 personas','1.150','990',[['Reserva sin pagar ahora','b']],'icons/hotel5.jpg'],
    ['Miraflores Park, Lima','4.8',5,'Junior Suite','1 noche, 2 personas','330','265',[['Desayuno','t']],'icons/hotel6.jpg'],
  ];

  const packCard = ([t, code, price, off, image, logoAerolinea]) => `
  <article class="card">
    <div class="card__media">
      <img src="${image}" alt="${t}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
      <span class="badge">-${off}%</span>
    </div>
    <div class="card__body">
      <div class="card__row">
        <h3>${t}</h3>
        <div class="airline">
          <!-- Aquí reemplazamos el span por la imagen del logo -->
          <img src="${logoAerolinea}" alt="Aerolínea" style="width: 90px; height: 28px; object-fit: contain;">
          <span class="stock">Stock limitado</span>
        </div>
      </div>
      <p class="route">LIM ⇆ ${code}</p>
      <p class="sm">Precio por persona desde</p>
      <p class="price">US$ <strong>${price}</strong></p>
      <p class="dates-note">Elige tus fechas entre 30 nov y 28 feb 2027</p>
      <a class="btn-dark" href="#">Ver vuelo</a>
    </div>
  </article>`;

  const hotelCard = ([n, score, stars, room, stay, old, now, tags, image]) => `
    <article class="card">
      <div class="card__media">
        <img src="${image}" alt="${n}" style="width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0;">
        ${tags.map(([t, c]) => `<span class="badge badge--${c}">${t}</span>`).join('')}
      </div>
      <div class="card__body"><h3>${n}</h3>
        <div class="rate"><span class="score">${score}</span><span class="stars" aria-label="${stars} estrellas">${ICON('star').repeat(stars)}</span></div>
      </div>
      <div class="card__foot"><span>${room}</span><span>${stay}</span><span class="old">US$ ${old}</span><span class="now">US$ ${now}</span></div>
    </article>`;

  /* ---------- Pestañas ---------- */
  function initTabs() {
    const tabs = $$('.tab');
    tabs.forEach((t) => t.addEventListener('click', () => tabs.forEach((x) => {
      x.classList.toggle('is-active', x === t);
      x.setAttribute('aria-selected', x === t);
    })));
  }

  /* ---------- Dropdowns: un solo panel abierto; el id del panel es "dd-<nombre>" ---------- */
  const setState = (p, open) => {
    p.hidden = !open;
    $$(`[data-dd="${p.id.slice(3)}"]`).forEach((t) => t.setAttribute('aria-expanded', open));
    if (open) p.dispatchEvent(new Event('open'));
  };
  function openDD(name) {
    const p = $('#dd-' + name);
    $$('.dd').forEach((x) => x !== p && !x.hidden && setState(x, false));
    if (p.hidden) setState(p, true);
  }
  function closeDD(name) {
    if (name) setState($('#dd-' + name), false);
    else $$('.dd').forEach((x) => !x.hidden && setState(x, false));
  }

  function initDropdowns() {
    $$('[data-dd]').forEach((t) => {
      const name = t.dataset.dd, p = $('#dd-' + name);
      t.addEventListener('click', () => {
        const f = t.dataset.field;
        const switching = f && p.dataset.field !== f; // Salida <-> Retorno con el calendario abierto: solo cambia de campo
        if (f) p.dataset.field = f;
        (p.hidden || switching || t.tagName === 'INPUT') ? openDD(name) : closeDD(name);
      });
      if (t.tagName === 'INPUT') t.addEventListener('focus', () => { t.select(); openDD(name); });
    });
    document.addEventListener('click', (e) => { if (!e.target.closest('.dd-wrap')) closeDD(); });
    document.addEventListener('keydown', (e) => e.key === 'Escape' && closeDD());
  }

  /* ---------- Ciudades ---------- */
  function initCities() {
    const render = (p, q = '') => {
      const n = norm(q.trim());
      const items = CITIES.filter((c) => !n || norm(c.join(' ')).includes(n));
      p.innerHTML = items.length
        ? items.map(([c, k, co]) => `<button type="button" class="opt" data-city="${c}">${ICON('plane')}<span>${c}<small>${k} - ${co}</small></span></button>`).join('')
        : '<p class="empty">Sin resultados</p>';
    };
    ['origin', 'destination'].forEach((id) => {
      const input = $('#' + id), p = $('#dd-' + id);
      render(p);
      p.addEventListener('open', () => render(p));
      input.addEventListener('input', () => { openDD(id); render(p, input.value); });
      p.addEventListener('click', (e) => {
        const b = e.target.closest('.opt');
        if (!b) return;
        input.value = b.dataset.city;
        closeDD(id);
        if (id === 'origin') $('#destination').focus();
        else { $('#dd-cal').dataset.field = 'start'; openDD('cal'); }
      });
    });
    $('.swap').addEventListener('click', () => {
      const o = $('#origin'), d = $('#destination');
      [o.value, d.value] = [d.value, o.value];
    });
  }

  /* ---------- Calendario ---------- */
  function initCalendar() {
    const p = $('#dd-cal'), startL = $('#startLabel'), endL = $('#endLabel'), endBtn = $('#endBtn');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const iso = (b) => (b.dataset.date ? new Date(b.dataset.date + 'T00:00:00') : null); // fechas precargadas (data-date)
    const st = { view: firstOfMonth, start: iso($('#startBtn')), end: iso(endBtn) };
    const fmt = (d) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3).toLowerCase()}`;
    const isOneWay = () => $('input[name=trip]:checked').value !== 'round';

    const month = (first) => {
      const y = first.getFullYear(), m = first.getMonth();
      const lead = (first.getDay() + 6) % 7; // semana empieza en lunes
      let h = `<h4>${MONTHS[m]} ${y}</h4><div class="cal__g">` + [...'LMMJVSD'].map((d) => `<span class="cal__wd">${d}</span>`).join('') + '<span></span>'.repeat(lead);
      for (let d = 1, n = new Date(y, m + 1, 0).getDate(); d <= n; d++) {
        const dt = new Date(y, m, d), t = +dt;
        const sel = t === +st.start || t === +st.end;
        const inr = st.start && st.end && t > +st.start && t < +st.end;
        h += `<button type="button" class="day${sel ? ' sel' : ''}${inr ? ' in' : ''}" data-t="${t}"${dt < today ? ' disabled' : ''}>${d}</button>`;
      }
      return h + '</div>';
    };
    const render = () => {
      $$('.cal__m', p).forEach((el, i) => { el.innerHTML = month(new Date(st.view.getFullYear(), st.view.getMonth() + i, 1)); });
      $('.cal__prev', p).classList.toggle('is-hidden', st.view <= firstOfMonth);
      startL.textContent = st.start ? fmt(st.start) : 'Salida';
      endL.textContent = st.end ? fmt(st.end) : 'Retorno';
    };
    const shift = (n) => { st.view = new Date(st.view.getFullYear(), st.view.getMonth() + n, 1); render(); };
    $('.cal__prev', p).addEventListener('click', () => shift(-1));
    $('.cal__next', p).addEventListener('click', () => shift(1));

    p.addEventListener('click', (e) => {
      const b = e.target.closest('.day');
      if (!b) return;
      e.stopPropagation(); // render() reemplaza el botón; sin esto el clic "fuera" cerraría el panel
      const d = new Date(+b.dataset.t);
      let done = false;
      if (isOneWay()) { st.start = d; st.end = null; done = true; }
      else if (st.start && d > st.start && (p.dataset.field === 'end' || !st.end)) { st.end = d; done = true; }
      else { st.start = d; st.end = null; p.dataset.field = 'end'; } // primer clic: espera el retorno
      render();
      if (done) closeDD('cal');
    });

    $$('input[name=trip]').forEach((r) => r.addEventListener('change', () => {
      const one = isOneWay();
      endBtn.disabled = one;
      if (one) { st.end = null; if (p.dataset.field === 'end') p.dataset.field = 'start'; }
      render();
    }));
    render();
  }

  /* ---------- Pasajeros ---------- */
  function initPassengers() {
    const p = $('#dd-pax'), label = $('#paxLabel'), MAX = 9;
    let applied = { adults: 1, kids: 0, infants: 0 }, draft = { ...applied };
    const total = (o) => o.adults + o.kids + o.infants;
    const paint = () => $$('[data-pax]', p).forEach((row) => {
      const k = row.dataset.pax, [dec, inc] = $$('button', row);
      $('output', row).textContent = draft[k];
      dec.disabled = draft[k] <= (k === 'adults' ? Math.max(1, draft.infants) : 0); // 1 infante por adulto
      inc.disabled = total(draft) >= MAX || (k === 'infants' && draft.infants >= draft.adults);
    });
    p.addEventListener('open', () => { draft = { ...applied }; paint(); }); // cerrar sin aplicar descarta cambios
    p.addEventListener('click', (e) => {
      const step = e.target.closest('[data-step]'), act = e.target.closest('[data-act]');
      if (step) { draft[step.closest('[data-pax]').dataset.pax] += +step.dataset.step; paint(); }
      if (!act) return;
      if (act.dataset.act === 'apply') {
        applied = { ...draft };
        const n = total(applied);
        label.textContent = `${n} pasajero${n > 1 ? 's' : ''}`;
      }
      closeDD('pax');
    });
    paint();
  }

  /* ---------- Hero ---------- */
  function initHero() {
    const track = $('.hero__track');
    if (!track) return; // página sin hero
    const n = track.children.length;
    let i = 0;
    const go = (d) => { i = (i + d + n) % n; track.style.transform = `translateX(${-i * 100}%)`; };
    $$('.hero .arrow').forEach((b) => b.addEventListener('click', () => go(+b.dataset.dir)));
    // Intervalo independiente: nunca se pausa ni se reinicia con la interacción, así sigue cada 5 s siempre.
    setInterval(() => go(1), 5000);
  }

  /* ---------- Sliders de tarjetas ---------- */
  function initSlider(root, cards) {
    const track = $('.slider__track', root), view = $('.slider__view', root), dots = $('.dots', root);
    const [prev, next] = $$('.slider__nav .arrow', root);
    track.innerHTML = cards;
    let i = 0, step = 0, max = 0;
    const update = () => {
      track.style.transform = `translateX(${-i * step}px)`;
      // Al inicio (i = 0) la flecha izquierda queda oculta; aparece en cuanto se avanza.
      prev.classList.toggle('is-hidden', i === 0);
      next.classList.toggle('is-hidden', i >= max);
      $$('.dot', dots).forEach((d, k) => d.classList.toggle('on', k === i));
    };
    const layout = () => { // recalcula cuántas tarjetas caben según el ancho actual
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      step = track.firstElementChild.offsetWidth + gap;
      const perView = Math.max(1, Math.round((view.clientWidth + gap) / step));
      max = Math.max(0, track.children.length - perView);
      i = Math.min(i, max);
      dots.innerHTML = Array.from({ length: max + 1 }, (_, k) => `<button type="button" class="dot" aria-label="Ir a la posición ${k + 1}"></button>`).join('');
      update();
    };
    prev.addEventListener('click', () => { i = Math.max(0, i - 1); update(); });
    next.addEventListener('click', () => { i = Math.min(max, i + 1); update(); });
    dots.addEventListener('click', (e) => {
      const k = $$('.dot', dots).indexOf(e.target.closest('.dot'));
      if (k >= 0) { i = k; update(); }
    });
    new ResizeObserver(layout).observe(view);
  }

  /* ---------- Formularios ---------- */
  function initForms() {
    $('#searchForm').addEventListener('submit', (e) => {
      e.preventDefault(); // home: va a resultados; en search.html (existe #list) se queda y re-consulta
      if (!$('#list')) location.href = 'search.html';
    });
    const f = $('#newsletter'), msg = $('#nlMsg');
    if (!f) return;
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      msg.textContent = f.elements.email.checkValidity() ? '¡Listo! Te enviaremos las mejores ofertas.' : 'Ingresa un correo válido, por ejemplo nombre@correo.com';
    });
  }

  window.WT = { $, $$, ICON, openDD, closeDD }; // API para otras páginas (search.js)
  initTabs(); initDropdowns(); initCities(); initCalendar(); initPassengers(); initHero();
  if ($('[data-slider=packages]')) {
    initSlider($('[data-slider=packages]'), PACKAGES.map(packCard).join(''));
    initSlider($('[data-slider=hotels]'), HOTELS.map(hotelCard).join(''));
  }
  initForms();
})();
