import { parse, isValid, differenceInYears } from 'date-fns';

export const computeAge = (birthday) => {
  if (!birthday) return null;
  const parsed = parse(birthday, 'dd/MM/yyyy', new Date());
  if (!isValid(parsed)) return null;
  return differenceInYears(new Date(), parsed);
};

export const discountForCategory = (rules, categoryId, age) => {
  if (age == null) return 0;
  const rule = (rules || []).find(
    (r) => r.packageCategoryId === categoryId && age >= r.minAge && age <= r.maxAge,
  );
  return rule ? rule.discountPercent : 0;
};

export const productPrice = (product, rules, age) => {
  const base = Number(product?.price || 0);
  const discount = discountForCategory(rules, product?.packageCategoryId, age);
  return Math.max(0, base * (1 - discount / 100));
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
