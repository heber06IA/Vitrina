/* Seller dashboard (seller.html): list, publish and remove the signed-in seller's demo products. */
import { CATEGORY_LABELS } from '../lib/catalog.js';
import { formatPrice } from '../lib/format.js';
import { isValidImage, readAsDataUrl } from '../lib/image.js';
import { KEYS, read, write } from '../lib/storage.js';
import { renderCommunity } from './community.js';
import { el, notice } from './dom.js';
import { currentUser } from './session.js';

const createRow = (item, onRemove) => {
  const row = el('article', 'plate d-flex align-items-center gap-4 p-3');
  if (item.image) {
    const img = el('img', 'object-fit-cover rounded-2');
    img.src = item.image;
    img.alt = '';
    img.width = 72;
    img.height = 88;
    row.append(img);
  }
  const info = el('div', 'flex-1 min-w-0');
  info.append(
    el('h3', 'fw-semibold', item.title),
    el('p', 'fs-sm text-muted', `${item.categoryLabel} · ${formatPrice(item.price)} · ${item.stock} en existencia`),
  );
  const remove = el('button', 'btn btn-outline-primary btn-sm', 'Eliminar');
  remove.type = 'button';
  remove.setAttribute('aria-label', `Eliminar ${item.title}`);
  remove.addEventListener('click', () => onRemove(item));
  row.append(info, remove);
  return row;
};

function renderProducts(page, user) {
  const own = read(KEYS.products).filter((item) => item.owner === user.email);
  page.querySelector('[data-product-count]').textContent = own.length;
  const list = page.querySelector('[data-seller-products]');
  const remove = (item) => {
    write(
      KEYS.products,
      read(KEYS.products).filter((product) => product.id !== item.id),
    );
    renderProducts(page, user);
  };
  list.replaceChildren(...own.map((item) => createRow(item, remove)));
  if (!own.length) {
    list.append(
      el('p', 'plate p-5 text-muted', 'Aún no tienes artículos. Usa el formulario para crear tu primera publicación.'),
    );
  }
}

function initProductForm(page, user) {
  const form = page.querySelector('[data-product-form]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = form.querySelector('[name="image"]').files[0];
    if (file && !isValidImage(file)) {
      notice(form, 'Elige una imagen de hasta 1 MB.', true);
      return;
    }
    try {
      const image = file ? await readAsDataUrl(file) : '';
      const data = new FormData(form);
      const category = data.get('category');
      const product = {
        id: crypto.randomUUID(),
        owner: user.email,
        seller: user.name,
        title: data.get('title').trim(),
        description: data.get('description').trim(),
        category,
        categoryLabel: CATEGORY_LABELS[category],
        price: Number(data.get('price')),
        stock: Number(data.get('stock')),
        image,
        createdAt: Date.now(),
      };
      write(KEYS.products, [product, ...read(KEYS.products)]);
      form.reset();
      notice(form, 'Artículo publicado. Ya aparece en el catálogo de compradores.');
      renderProducts(page, user);
      renderCommunity();
    } catch {
      notice(form, 'No se pudo guardar el artículo en este navegador.', true);
    }
  });
}

export function initSellerPage() {
  const page = document.querySelector('[data-seller-page]');
  if (!page) return;
  const user = currentUser();
  if (!user || user.role !== 'seller') {
    page.querySelector('[data-seller-locked]').hidden = false;
    return;
  }
  page.querySelector('[data-seller-dashboard]').hidden = false;
  page.querySelector('[data-seller-name]').textContent = user.name;
  renderProducts(page, user);
  initProductForm(page, user);
}
