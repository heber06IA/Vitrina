/* "Artículos de la comunidad": products published by demo sellers, appended to the catalog. */
import { formatPrice } from '../lib/format.js';
import { KEYS, read } from '../lib/storage.js';
import { el } from './dom.js';

const createSection = (catalog) => {
  const section = el('section', 'mt-12');
  section.id = 'comunidad';
  const header = el('div', 'd-flex flex-wrap justify-content-between align-items-end gap-3 mb-5');
  const titles = el('div');
  titles.append(
    el('p', 'eyebrow', 'Nuevas tiendas'),
    el('h2', 'fs-3xl fw-semibold tracking-tight', 'Artículos de la comunidad'),
  );
  header.append(titles);
  const list = el('ul', 'row g-4 list-unstyled mb-0');
  list.dataset.communityList = '';
  section.append(header, list);
  catalog.append(section);
  return section;
};

const createCard = (item) => {
  const ratio = el('div', 'ratio ratio-4x5');
  if (item.image) {
    const img = el('img', 'product-card__img object-fit-cover');
    img.src = item.image;
    img.alt = item.title;
    ratio.append(img);
  } else {
    ratio.append(el('div', 'd-flex align-items-center justify-content-center bg-light text-muted', item.categoryLabel));
  }
  const plate = el('div', 'plate product-card__plate');
  plate.append(ratio);

  const body = el('div', 'product-card__body');
  body.append(
    el('h3', 'product-card__name', item.title),
    el('p', 'fs-sm text-muted', `Por ${item.seller}`),
    el('p', 'price fw-semibold', formatPrice(item.price)),
    el('p', 'fs-sm text-muted', item.description),
  );

  const card = el('article', 'product-card');
  card.append(plate, body);
  const li = el('li', 'col-6 col-md-4 col-xl-3');
  li.append(card);
  return li;
};

export function renderCommunity() {
  const catalog = document.querySelector('#catalogo');
  if (!catalog) return;
  const section = document.querySelector('#comunidad') || createSection(catalog);
  const list = section.querySelector('[data-community-list]');
  list.replaceChildren(...read(KEYS.products).map(createCard));
  section.hidden = !list.children.length;
}
