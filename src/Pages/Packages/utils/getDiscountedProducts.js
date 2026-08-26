import { products } from '@/Pages/Packages/utils/products';
import { ageRules } from '@/Pages/Packages/utils/ageRules';

const applyRule = (basePrice, rule) => {
  if (rule.discountType === 'VALUE') {
    return Math.max(0, basePrice - rule.discountAmount);
  }
  return basePrice * (1 - Math.min(rule.discountAmount, 100) / 100);
};

const buildDescription = (basePrice, finalPrice, rule) => {
  if (finalPrice <= 0) {
    return `Grátis para ${rule.minAge} a ${rule.maxAge} anos`;
  }
  if (rule.discountType === 'VALUE') {
    return `R$ ${rule.discountAmount} de desconto para ${rule.minAge} a ${rule.maxAge} anos`;
  }
  return `${rule.discountAmount}% de desconto para ${rule.minAge} a ${rule.maxAge} anos`;
};

const getDiscountedProducts = (ageRaw) => {
  const age = Number(ageRaw);

  return products.map((product) => {
    let price = product.price;
    let discountDescription = '';

    const rule = ageRules.find(
      (r) => r.productId === product.productId && age >= r.minAge && age <= r.maxAge,
    );

    if (rule && rule.discountAmount > 0) {
      const discounted = applyRule(product.price, rule);
      if (discounted < product.price) {
        price = discounted;
        discountDescription = buildDescription(product.price, price, rule);
      }
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
