import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { formatPrice, parsePrice } from '../src/js/lib/format.js';

describe('formatPrice', () => {
  it('muestra dos decimales y la moneda', () => {
    assert.equal(formatPrice(1299), '$1299.00 MXN');
    assert.equal(formatPrice(49.5), '$49.50 MXN');
  });

  it('acepta precios guardados como texto', () => {
    assert.equal(formatPrice('350'), '$350.00 MXN');
  });
});

describe('parsePrice', () => {
  it('lee el número de un precio con separadores de miles', () => {
    assert.equal(parsePrice('$1,299.00 MXN'), 1299);
  });

  it('devuelve 0 cuando no hay texto', () => {
    assert.equal(parsePrice(''), 0);
    assert.equal(parsePrice(undefined), 0);
  });

  it('es la operación inversa de formatPrice', () => {
    assert.equal(parsePrice(formatPrice(849.9)), 849.9);
  });
});
