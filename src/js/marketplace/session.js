/*
 * Demo accounts stored in this browser only (phase 1). Passwords are salted SHA-256 hashes, which is
 * enough for a local demo and NOT a substitute for server-side authentication (see README-FASES.md, phase 4).
 */
import { KEYS, read } from '../lib/storage.js';

export const currentUser = () => {
  const email = sessionStorage.getItem(KEYS.session);
  return email ? read(KEYS.users).find((user) => user.email === email) || null : null;
};

export const signIn = (user) => {
  sessionStorage.setItem(KEYS.session, user.email);
  location.href = user.role === 'seller' ? 'seller.html' : 'index.html';
};

export const signOut = () => {
  sessionStorage.removeItem(KEYS.session);
  location.href = 'index.html';
};

export const hashPassword = async (salt, password) => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Para usar el acceso de demostración, abre el sitio en HTTPS o desde localhost.');
  }
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};
