/* Price formatting shared by the catalog and the seller dashboard. Pure functions, covered by tests/. */

export const formatPrice = (amount) => `$${Number(amount).toFixed(2)} MXN`;

/* Reads the number out of a rendered price such as "$1,299.00 MXN"; empty text reads as 0. */
export const parsePrice = (text = '') => Number(text.replace(/[^0-9.]/g, ''));
