const CHECKOUT_QR_PREFIX = 'CHECKOUT:';

export const buildCheckoutQr = (orderNumber) => `${CHECKOUT_QR_PREFIX}${orderNumber}`;

export const parseCheckoutQr = (text) => {
  const value = String(text || '').trim();
  if (!value.startsWith(CHECKOUT_QR_PREFIX)) return null;
  const orderNumber = value.slice(CHECKOUT_QR_PREFIX.length).trim();
  return orderNumber || null;
};
