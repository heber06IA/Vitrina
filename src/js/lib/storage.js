/* JSON helpers over Web Storage. Reads never throw: a missing or corrupt value returns the fallback. */

export const KEYS = {
  users: 'vitrina.users.v1',
  products: 'vitrina.products.v1',
  session: 'vitrina.session.v1',
};

export const read = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
