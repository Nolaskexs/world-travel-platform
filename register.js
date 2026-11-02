'use strict';
(() => {
  const form = document.getElementById('regForm');
  const steps = [...form.querySelectorAll('.step')];
  const intro = document.getElementById('intro'), prog = document.getElementById('prog'), progT = document.getElementById('progT'), status = document.getElementById('status');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const f = form.elements;
  let cur = 0;

  // Valida solo los campos del paso visible; el primer inválido recibe foco y el aviso nativo.
  const validate = (i) => {
    steps[i].classList.add('was-validated');
    const bad = [...steps[i].querySelectorAll('input')].find((el) => !el.checkValidity());
    if (bad) bad.reportValidity();
    return !bad;
  };

  // Sincroniza título/intro y barra de progreso con el paso actual.
  const sync = () => {
    intro.hidden = cur > 0; // el título y el párrafo solo existen en el paso 1
    progT.textContent = `${cur + 1} / ${steps.length}`;
    prog.style.setProperty('--p', `${((cur + 1) / steps.length) * 100}%`);
    prog.setAttribute('aria-valuenow', cur + 1);
  };

  // Transición: fade-out del paso actual (160 ms), luego fade-in del siguiente.
  const go = (to) => {
    const from = steps[cur];
    from.classList.add('is-out');
    setTimeout(() => {
      from.hidden = true;
      from.classList.remove('is-out');
      const next = steps[to];
      next.hidden = false;
      next.classList.remove('is-in'); void next.offsetWidth; next.classList.add('is-in'); // reinicia la animación
      cur = to;
      sync();
      next.querySelector('input').focus();
    }, reduce ? 0 : 160);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // un solo punto de entrada: botón "Siguiente", "Registrarse" o Enter
    if (!validate(cur)) return;
    if (cur === 0) return go(1);
    // Conectar aquí con el backend; el evento lleva todos los datos del formulario.
    document.dispatchEvent(new CustomEvent('register:submit', { detail: Object.fromEntries(new FormData(form)) }));
    status.textContent = 'Datos validados correctamente.';
  });
  document.getElementById('back').addEventListener('click', () => { status.textContent = ''; go(0); });

  // Confirmación de contraseña
  const match = () => f.confirm.setCustomValidity(f.confirm.value && f.confirm.value !== f.password.value ? 'Las contraseñas no coinciden' : '');
  f.password.addEventListener('input', match);
  f.confirm.addEventListener('input', match);

  // Fecha de nacimiento: no se permiten fechas futuras
  f.birth.max = new Date().toISOString().slice(0, 10);

  // Mostrar / ocultar contraseña (ambos campos)
  form.querySelectorAll('[data-toggle]').forEach((btn) => btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.toggle), show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.setAttribute('aria-pressed', show);
    btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  }));

  sync();
})();
