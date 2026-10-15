/* Signed-in states: the welcome panel on account.html and the account links in every header. */
import { el } from './dom.js';
import { currentUser, signOut } from './session.js';

export function initAccountPage() {
  const page = document.querySelector('[data-account-page]');
  const user = currentUser();
  if (!page || !user) return;

  const isSeller = user.role === 'seller';
  const row = page.querySelector('.row');
  row.hidden = true;

  const go = el('a', 'btn btn-primary', isSeller ? 'Abrir panel de vendedor' : 'Explorar productos');
  go.href = isSeller ? 'seller.html' : 'index.html#catalogo';
  const out = el('button', 'btn btn-outline-primary', 'Cerrar sesión');
  out.type = 'button';
  out.dataset.logout = '';
  out.addEventListener('click', signOut);
  const actions = el('div', 'd-flex flex-wrap gap-3 mt-5');
  actions.append(go, out);

  const panel = el('section', 'plate p-6 p-lg-8 mt-8 mx-auto mw-3xl');
  panel.append(
    el('h2', 'fs-2xl fw-semibold', `¡Hola, ${user.name}!`),
    el(
      'p',
      'mt-2 text-muted',
      isSeller
        ? 'Tu cuenta de vendedor está lista para administrar tu tienda.'
        : 'Tu cuenta de cliente está lista para explorar el catálogo.',
    ),
    actions,
  );
  row.after(panel);
}

export function initHeaderAccount() {
  const user = currentUser();
  document.querySelectorAll('header nav[aria-label="Acciones de la cuenta"]').forEach((menu) => {
    const sellLink = menu.querySelector('a[href="sell.html"]');
    if (sellLink && user?.role === 'seller') {
      sellLink.href = 'seller.html';
      sellLink.textContent = 'Mi tienda';
    }
    if (sellLink && user?.role === 'buyer') sellLink.textContent = 'Vender';
    if (user) {
      const logout = el('button', 'header-link border-0 bg-transparent', 'Salir');
      logout.type = 'button';
      logout.addEventListener('click', signOut);
      menu.append(logout);
    }
  });
}
