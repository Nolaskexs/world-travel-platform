'use strict';
// Mostrar / ocultar contraseña
const pw = document.getElementById('password'), btn = document.getElementById('togglePw');
btn.addEventListener('click', () => {
  const show = pw.type === 'password';
  pw.type = show ? 'text' : 'password';
  btn.setAttribute('aria-pressed', show);
  btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
});
