(() => {
  'use strict';
  const USERS = 'vitrina.users.v1';
  const PRODUCTS = 'vitrina.products.v1';
  const SESSION = 'vitrina.session.v1';
  const read = (key, fallback = []) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const currentUser = () => {
    const email = sessionStorage.getItem(SESSION);
    return email ? read(USERS, []).find((user) => user.email === email) || null : null;
  };
  const hash = async (text) => {
    if (!crypto.subtle) throw new Error('Para usar el acceso de demostración, abre el sitio en HTTPS o desde localhost.');
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  };
  const notice = (form, message, error = false) => {
    const target = form.querySelector('[data-auth-notice], [data-product-notice]');
    if (target) { target.textContent = message; target.classList.toggle('text-danger', error); }
  };

  const login = document.querySelector('[data-auth-login]');
  if (login) login.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = login.querySelector('#login-email').value.trim().toLowerCase();
    const password = login.querySelector('#login-password').value;
    const user = read(USERS, []).find((item) => item.email === email);
    try {
      if (!user || user.passwordHash !== await hash(`${user.salt}:${password}`)) {
        notice(login, 'No encontramos esa combinación de correo y contraseña.', true); return;
      }
    } catch (error) { notice(login, error.message || 'No fue posible iniciar sesión.', true); return; }
    sessionStorage.setItem(SESSION, email);
    location.href = user.role === 'seller' ? 'seller.html' : 'index.html';
  });

  const register = document.querySelector('[data-auth-register]');
  if (register) register.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = register.querySelector('#signup-name').value.trim();
    const email = register.querySelector('#signup-email').value.trim().toLowerCase();
    const password = register.querySelector('#signup-password').value;
    const role = register.querySelector('[name="role"]:checked').value;
    const users = read(USERS, []);
    if (users.some((user) => user.email === email)) { notice(register, 'Ya existe una cuenta con ese correo. Inicia sesión.', true); return; }
    try {
      const salt = crypto.randomUUID();
      users.push({ name, email, role, salt, passwordHash: await hash(`${salt}:${password}`) });
      write(USERS, users);
      sessionStorage.setItem(SESSION, email);
      location.href = role === 'seller' ? 'seller.html' : 'index.html';
    } catch (error) { notice(register, error.message || 'No fue posible crear la cuenta.', true); }
  });

  document.querySelectorAll('[data-logout]').forEach((button) => button.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION); location.href = 'index.html';
  }));

  const sellerPage = document.querySelector('[data-seller-page]');
  if (sellerPage) {
    const user = currentUser();
    const dashboard = sellerPage.querySelector('[data-seller-dashboard]');
    const locked = sellerPage.querySelector('[data-seller-locked]');
    if (!user || user.role !== 'seller') locked.hidden = false;
    else {
      dashboard.hidden = false;
      sellerPage.querySelector('[data-seller-name]').textContent = user.name;
      const renderSellerProducts = () => {
        const own = read(PRODUCTS).filter((item) => item.owner === user.email);
        sellerPage.querySelector('[data-product-count]').textContent = own.length;
        const list = sellerPage.querySelector('[data-seller-products]'); list.replaceChildren();
        if (!own.length) { const empty = document.createElement('p'); empty.className = 'plate p-5 text-muted'; empty.textContent = 'Aún no tienes artículos. Usa el formulario para crear tu primera publicación.'; list.append(empty); }
        own.forEach((item) => {
          const row = document.createElement('article'); row.className = 'plate d-flex align-items-center gap-4 p-3';
          if (item.image) { const img = document.createElement('img'); img.src = item.image; img.alt = ''; img.width = 72; img.height = 88; img.className = 'object-fit-cover rounded-2'; row.append(img); }
          const info = document.createElement('div'); info.className = 'flex-1 min-w-0';
          const title = document.createElement('h3'); title.className = 'fw-semibold'; title.textContent = item.title;
          const detail = document.createElement('p'); detail.className = 'fs-sm text-muted'; detail.textContent = `${item.categoryLabel} · $${Number(item.price).toFixed(2)} MXN · ${item.stock} en existencia`;
          info.append(title, detail); row.append(info);
          const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'btn btn-outline-primary btn-sm'; remove.textContent = 'Eliminar'; remove.setAttribute('aria-label', `Eliminar ${item.title}`);
          remove.addEventListener('click', () => { write(PRODUCTS, read(PRODUCTS).filter((product) => product.id !== item.id)); renderSellerProducts(); }); row.append(remove); list.append(row);
        });
      };
      renderSellerProducts();
      const form = sellerPage.querySelector('[data-product-form]');
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const file = form.querySelector('[name="image"]').files[0];
        if (file && (!file.type.startsWith('image/') || file.size > 1024 * 1024)) { notice(form, 'Elige una imagen de hasta 1 MB.', true); return; }
        try {
          const image = file ? await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); }) : '';
          const data = new FormData(form); const category = data.get('category');
          const categories = { ropa: 'Ropa', perfumes: 'Perfumes', tecnologia: 'Tecnología' };
          const products = read(PRODUCTS);
          products.unshift({ id: crypto.randomUUID(), owner: user.email, seller: user.name, title: data.get('title').trim(), description: data.get('description').trim(), category, categoryLabel: categories[category], price: Number(data.get('price')), stock: Number(data.get('stock')), image, createdAt: Date.now() });
          write(PRODUCTS, products); form.reset(); notice(form, 'Artículo publicado. Ya aparece en el catálogo de compradores.'); renderSellerProducts(); renderMarketplace();
        } catch { notice(form, 'No se pudo guardar el artículo en este navegador.', true); }
      });
    }
  }


  const accountPage = document.querySelector('[data-account-page]');
  const signedIn = currentUser();
  if (accountPage && signedIn) {
    const row = accountPage.querySelector('.row');
    row.hidden = true;
    const panel = document.createElement('section'); panel.className = 'plate p-6 p-lg-8 mt-8 mx-auto mw-3xl';
    const heading = document.createElement('h2'); heading.className = 'fs-2xl fw-semibold'; heading.textContent = `¡Hola, ${signedIn.name}!`;
    const description = document.createElement('p'); description.className = 'mt-2 text-muted'; description.textContent = signedIn.role === 'seller' ? 'Tu cuenta de vendedor está lista para administrar tu tienda.' : 'Tu cuenta de cliente está lista para explorar el catálogo.';
    const actions = document.createElement('div'); actions.className = 'd-flex flex-wrap gap-3 mt-5';
    const go = document.createElement('a'); go.className = 'btn btn-primary'; go.href = signedIn.role === 'seller' ? 'seller.html' : 'index.html#catalogo'; go.textContent = signedIn.role === 'seller' ? 'Abrir panel de vendedor' : 'Explorar productos';
    const out = document.createElement('button'); out.type = 'button'; out.className = 'btn btn-outline-primary'; out.dataset.logout = ''; out.textContent = 'Cerrar sesión';
    out.addEventListener('click', () => { sessionStorage.removeItem(SESSION); location.href = 'index.html'; });
    actions.append(go, out); panel.append(heading, description, actions); row.after(panel);
  }

  document.querySelectorAll('header nav[aria-label="Acciones de la cuenta"]').forEach((menu) => {
    const user = currentUser();
    const sellLink = menu.querySelector('a[href="sell.html"]');
    if (sellLink && user?.role === 'seller') { sellLink.href = 'seller.html'; sellLink.textContent = 'Mi tienda'; }
    if (sellLink && user?.role === 'buyer') sellLink.textContent = 'Vender';
    if (user) {
      const logout = document.createElement('button'); logout.type = 'button'; logout.className = 'header-link border-0 bg-transparent'; logout.textContent = 'Salir'; logout.addEventListener('click', () => { sessionStorage.removeItem(SESSION); location.href = 'index.html'; }); menu.append(logout);
    }
  });

  function renderMarketplace() {
    const catalog = document.querySelector('#catalogo');
    if (!catalog) return;
    let section = document.querySelector('#comunidad');
    if (!section) { section = document.createElement('section'); section.id = 'comunidad'; section.className = 'mt-12'; section.innerHTML = '<div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-5"><div><p class="eyebrow">Nuevas tiendas</p><h2 class="fs-3xl fw-semibold tracking-tight">Artículos de la comunidad</h2></div></div><ul class="row g-4 list-unstyled mb-0" data-community-list></ul>'; catalog.append(section); }
    const list = section.querySelector('[data-community-list]'); list.replaceChildren();
    read(PRODUCTS).forEach((item) => {
      const li = document.createElement('li'); li.className = 'col-6 col-md-4 col-xl-3';
      const card = document.createElement('article'); card.className = 'product-card';
      const plate = document.createElement('div'); plate.className = 'plate product-card__plate';
      const ratio = document.createElement('div'); ratio.className = 'ratio ratio-4x5';
      if (item.image) { const img = document.createElement('img'); img.src = item.image; img.alt = item.title; img.className = 'product-card__img object-fit-cover'; ratio.append(img); }
      else { const placeholder = document.createElement('div'); placeholder.className = 'd-flex align-items-center justify-content-center bg-light text-muted'; placeholder.textContent = item.categoryLabel; ratio.append(placeholder); }
      plate.append(ratio); const body = document.createElement('div'); body.className = 'product-card__body';
      const name = document.createElement('h3'); name.className = 'product-card__name'; name.textContent = item.title;
      const seller = document.createElement('p'); seller.className = 'fs-sm text-muted'; seller.textContent = `Por ${item.seller}`;
      const price = document.createElement('p'); price.className = 'price fw-semibold'; price.textContent = `$${Number(item.price).toFixed(2)} MXN`;
      const desc = document.createElement('p'); desc.className = 'fs-sm text-muted'; desc.textContent = item.description;
      body.append(name, seller, price, desc); card.append(plate, body); li.append(card); list.append(li);
    });
    section.hidden = !list.children.length;
  }
  renderMarketplace();
})();
