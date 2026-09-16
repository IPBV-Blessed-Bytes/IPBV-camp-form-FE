import { products } from '@/Pages/Packages/utils/products';
import { ageRules } from '@/Pages/Packages/utils/ageRules';
import { formatBRL } from '@/utils/formatBRL';

const applyRule = (basePrice, rule) => {
  if (!rule || rule.discountAmount <= 0) {
    return basePrice;
  }
  if (rule.discountType === 'VALUE') {
    return Math.max(0, basePrice - rule.discountAmount);
  }
  return basePrice * (1 - Math.min(rule.discountAmount, 100) / 100);
};

const findRule = (rules, age) => rules.find((r) => age >= r.minAge && age <= r.maxAge);

const ruleLabel = (rule) => {
  if (rule.discountType === 'VALUE') {
    return `R$ ${formatBRL(rule.discountAmount)} off`;
  }
  return rule.discountAmount >= 100 ? 'grátis' : `${rule.discountAmount}% off`;
};

const getDiscountedProducts = (ageRaw) => {
  const age = Number(ageRaw);

  const globalFoodRules = ageRules.filter((r) => r.productCategory === 'ALIMENTACAO');

  return products.map((product) => {
    const ownRules = ageRules.filter((r) => r.productId === product.productId);
    const isAccommodation = product.category === 'Hospedagem';
    const foodPortion = isAccommodation ? Math.min(product.foodPrice || 0, product.price) : 0;

    let price = product.price;
    let discountDescription = '';

    if (foodPortion > 0) {
      const accommodationPortion = product.price - foodPortion;
      const accommodationRule = findRule(ownRules, age);
      const foodRule = findRule(globalFoodRules, age);

      const discountedAccommodation = applyRule(accommodationPortion, accommodationRule);
      const discountedFood = applyRule(foodPortion, foodRule);
      price = discountedAccommodation + discountedFood;

      const parts = [];
      if (discountedAccommodation < accommodationPortion) {
        parts.push(`hospedagem ${ruleLabel(accommodationRule)}`);
      }
      if (discountedFood < foodPortion) {
        parts.push(`alimentação ${ruleLabel(foodRule)}`);
      }
      discountDescription = price <= 0 ? 'Grátis para essa idade' : parts.join(' + ');
    } else {
      const rule = findRule(ownRules, age);
      const discounted = applyRule(product.price, rule);
      if (discounted < product.price) {
        price = discounted;
        discountDescription = price <= 0 ? `Grátis para ${rule.minAge} a ${rule.maxAge} anos` : `${ruleLabel(rule)} para ${rule.minAge} a ${rule.maxAge} anos`;
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
