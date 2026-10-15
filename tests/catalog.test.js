import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CATEGORY_LABELS, matchesFilters, priceComparator, readFilters } from '../src/js/lib/catalog.js';

const filtersFrom = (query) => readFilters(new URLSearchParams(query));
const shirt = { text: 'Camisa de lino Blanca', category: 'ropa', price: 899 };

describe('readFilters', () => {
  it('usa valores neutros cuando la URL no trae filtros', () => {
    assert.deepEqual(filtersFrom(''), { query: '', category: '', min: 0, max: Infinity, order: 'relevancia' });
  });

  it('normaliza la búsqueda y convierte los precios a números', () => {
    assert.deepEqual(filtersFrom('q=  LINO &categoria=ropa&min=100&max=900&orden=precio-asc'), {
      query: 'lino',
      category: 'ropa',
      min: 100,
      max: 900,
      order: 'precio-asc',
    });
  });

  it('ignora precios que no son números', () => {
    const filters = filtersFrom('min=abc&max=');
    assert.equal(filters.min, 0);
    assert.equal(filters.max, Infinity);
  });
});

describe('matchesFilters', () => {
  it('acepta todo sin filtros', () => {
    assert.equal(matchesFilters(shirt, filtersFrom('')), true);
  });

  it('busca sin distinguir mayúsculas', () => {
    assert.equal(matchesFilters(shirt, filtersFrom('q=blanca')), true);
    assert.equal(matchesFilters(shirt, filtersFrom('q=perfume')), false);
  });

  it('filtra por categoría', () => {
    assert.equal(matchesFilters(shirt, filtersFrom('categoria=ropa')), true);
    assert.equal(matchesFilters(shirt, filtersFrom('categoria=tecnologia')), false);
  });

  it('incluye los límites del rango de precio', () => {
    assert.equal(matchesFilters(shirt, filtersFrom('min=899&max=899')), true);
    assert.equal(matchesFilters(shirt, filtersFrom('min=900')), false);
    assert.equal(matchesFilters(shirt, filtersFrom('max=898')), false);
  });
});

describe('priceComparator', () => {
  it('ordena de menor a mayor y de mayor a menor', () => {
    assert.deepEqual([300, 100, 200].sort(priceComparator('precio-asc')), [100, 200, 300]);
    assert.deepEqual([300, 100, 200].sort(priceComparator('precio-desc')), [300, 200, 100]);
  });

  it('no ordena cuando el criterio no es el precio', () => {
    assert.equal(priceComparator('relevancia'), null);
  });
});

describe('CATEGORY_LABELS', () => {
  it('coincide con las secciones del catálogo', () => {
    assert.deepEqual(Object.keys(CATEGORY_LABELS), ['ropa', 'perfumes', 'tecnologia']);
  });
});
