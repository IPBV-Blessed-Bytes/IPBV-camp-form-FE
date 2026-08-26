import { products } from '@/Pages/Packages/utils/products';
import { ageRules } from '@/Pages/Packages/utils/ageRules';

const buildDescription = (rule) => {
  if (rule.discountPercent >= 100) {
    return `Grátis para ${rule.minAge} a ${rule.maxAge} anos`;
  }
  return `${rule.discountPercent}% de desconto para ${rule.minAge} a ${rule.maxAge} anos`;
};

const getDiscountedProducts = (ageRaw) => {
  const age = Number(ageRaw);

  return products.map((product) => {
    let price = product.price;
    let discountDescription = '';

    const rule = ageRules.find(
      (r) => r.productId === product.productId && age >= r.minAge && age <= r.maxAge,
    );

    if (rule && rule.discountPercent > 0) {
      price = product.price * (1 - Math.min(rule.discountPercent, 100) / 100);
      discountDescription = buildDescription(rule);
    }

    if (product.price === 0) {
      discountDescription = '';
    }

    return {
      ...product,
      price: Number(price.toFixed(2)),
      discountDescription,
    };
  });
};

export default getDiscountedProducts;
