import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import { isValidImage, MAX_IMAGE_BYTES } from '../src/js/lib/image.js';
import { hashPassword } from '../src/js/marketplace/session.js';

describe('hashPassword', () => {
  it('produce el SHA-256 en hexadecimal de "sal:contraseña"', async () => {
    const expected = createHash('sha256').update('sal:secreto').digest('hex');
    assert.equal(await hashPassword('sal', 'secreto'), expected);
  });

  it('cambia con la sal aunque la contraseña sea la misma', async () => {
    assert.notEqual(await hashPassword('a', 'secreto'), await hashPassword('b', 'secreto'));
  });
});

describe('isValidImage', () => {
  it('acepta imágenes de hasta 1 MB', () => {
    assert.equal(isValidImage({ type: 'image/png', size: MAX_IMAGE_BYTES }), true);
  });

  it('rechaza archivos grandes o que no son imágenes', () => {
    assert.equal(isValidImage({ type: 'image/jpeg', size: MAX_IMAGE_BYTES + 1 }), false);
    assert.equal(isValidImage({ type: 'application/pdf', size: 10 }), false);
  });
});
