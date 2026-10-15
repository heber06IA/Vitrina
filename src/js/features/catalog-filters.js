/* Catalog search and filters over the static product cards; the rules live in lib/catalog.js. */
import { CATEGORIES, matchesFilters, priceComparator, readFilters } from '../lib/catalog.js';
import { parsePrice } from '../lib/format.js';

const priceOf = (element) => parsePrice(element.querySelector('.price')?.textContent);

const categorySections = (catalog) =>
  CATEGORIES.map((id) => catalog.querySelector(`section[id="${id}"]`)).filter(Boolean);

/* Every search lands on the catalog URL so results can be shared and survive a reload. */
const goToCatalog = (params) => {
  const target = new URL('index.html', window.location.href);
  target.search = params.toString();
  window.location.assign(target.href);
};

export function initCatalogFilters() {
  const catalog = document.querySelector('#catalogo');
  const filterForm = catalog && catalog.querySelector('form[aria-label="Filtros del catálogo"]');
  if (!catalog || !filterForm) return;

  const params = new URLSearchParams(window.location.search);
  const filters = readFilters(params);
  const searchInput = document.querySelector('#site-search');
  const minInput = filterForm.querySelector('[name="min"]');
  const maxInput = filterForm.querySelector('[name="max"]');
  const sortInput = filterForm.querySelector('[name="orden"]');

  // Reflect the current URL in the controls.
  if (searchInput) searchInput.value = params.get('q') || '';
  const selectedCategory = [...filterForm.querySelectorAll('[name="categoria"]')].find(
    (input) => input.value === filters.category,
  );
  if (selectedCategory) selectedCategory.checked = true;
  if (minInput) minInput.value = params.get('min') || '';
  if (maxInput) maxInput.value = params.get('max') || '';
  if (sortInput && params.has('orden')) sortInput.value = params.get('orden');

  filterForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(filterForm);
    const search = (searchInput?.value || '').trim();
    if (search) formData.set('q', search);
    goToCatalog(new URLSearchParams(formData));
  });
  if (searchInput?.form) {
    searchInput.form.addEventListener('submit', (event) => {
      event.preventDefault();
      const search = new URLSearchParams();
      if (searchInput.value.trim()) search.set('q', searchInput.value.trim());
      goToCatalog(search);
    });
  }

  catalog.querySelectorAll('.product-card').forEach((card) => {
    const item = {
      text: card.textContent,
      category: card.closest('section[id]')?.id,
      price: priceOf(card),
    };
    card.closest('li').hidden = !matchesFilters(item, filters);
  });

  const compare = priceComparator(filters.order);
  categorySections(catalog).forEach((section) => {
    const list = section.querySelector('ul.row');
    if (compare && list) {
      [...list.children].sort((a, b) => compare(priceOf(a), priceOf(b))).forEach((item) => list.append(item));
    }
    section.hidden = ![...section.querySelectorAll('.product-card')].some((card) => !card.closest('li').hidden);
  });
}
