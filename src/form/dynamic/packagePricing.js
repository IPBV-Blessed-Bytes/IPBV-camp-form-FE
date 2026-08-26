import { parse, isValid, differenceInYears } from 'date-fns';

export const computeAge = (birthday, referenceDate) => {
  if (!birthday) return null;
  const parsed = parse(birthday, 'dd/MM/yyyy', new Date());
  if (!isValid(parsed)) return null;
  const reference = referenceDate instanceof Date && isValid(referenceDate) ? referenceDate : new Date();
  return differenceInYears(reference, parsed);
};

export const ruleForProduct = (rules, productId, age) => {
  if (age == null) return null;
  return (
    (rules || []).find((r) => r.productId === productId && age >= r.minAge && age <= r.maxAge) || null
  );
};

export const applyDiscount = (base, rule) => {
  if (!rule) return base;
  const amount = Number(rule.discountAmount || 0);
  if (rule.discountType === 'VALUE') {
    return Math.max(0, base - amount);
  }
  return Math.max(0, base * (1 - Math.min(amount, 100) / 100));
};

export const discountLabel = (rule) => {
  if (!rule) return '';
  const amount = Number(rule.discountAmount || 0);
  if (rule.discountType === 'VALUE') {
    return `-${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
  }
  return `-${amount}%`;
};

export const productPrice = (product, rules, age) => {
  const base = Number(product?.price || 0);
  return applyDiscount(base, ruleForProduct(rules, product?.id, age));
};

export const packageTotal = (selection, products, rules, age) => {
  const byId = new Map((products || []).map((p) => [p.id, p]));
  let total = 0;
  Object.values(selection || {}).forEach((productIds) => {
    (productIds || []).forEach((id) => {
      const product = byId.get(id);
      if (product) total += productPrice(product, rules, age);
    });
  });
  return total;
};

export const formatPrice = (value) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
