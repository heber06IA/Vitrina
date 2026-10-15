/* Catalog rules without the DOM: categories, URL filters, matching and price ordering. Covered by tests/. */

export const CATEGORY_LABELS = {
  ropa: 'Ropa',
  perfumes: 'Perfumes',
  tecnologia: 'Tecnología',
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS);

/* Filters as they arrive in the catalog URL (?q=&categoria=&min=&max=&orden=). */
export const readFilters = (params) => ({
  query: (params.get('q') || '').trim().toLocaleLowerCase('es'),
  category: params.get('categoria') || '',
  min: Number(params.get('min')) || 0,
  max: Number(params.get('max')) || Infinity,
  order: params.get('orden') || 'relevancia',
});

/* `item.text` is everything searchable about the product; `item.category` is its section id. */
export const matchesFilters = (item, filters) =>
  (!filters.category || item.category === filters.category) &&
  (!filters.query || item.text.toLocaleLowerCase('es').includes(filters.query)) &&
  item.price >= filters.min &&
  item.price <= filters.max;

/* Compares two prices for the chosen order, or returns null when the order is not by price. */
export const priceComparator = (order) => {
  if (!order.startsWith('precio-')) return null;
  const direction = order === 'precio-desc' ? -1 : 1;
  return (a, b) => (a - b) * direction;
};
