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
    const accommodationPrice = product.price;
    const foodPrice = isAccommodation ? product.foodPrice || 0 : 0;
    const basePrice = accommodationPrice + foodPrice;

    let price = basePrice;
    let discountDescription = '';

    if (foodPrice > 0) {
      const accommodationRule = findRule(ownRules, age);
      const foodRule = findRule(globalFoodRules, age);

      const discountedAccommodation = applyRule(accommodationPrice, accommodationRule);
      const discountedFood = applyRule(foodPrice, foodRule);
      price = discountedAccommodation + discountedFood;

      const parts = [];
      if (discountedAccommodation < accommodationPrice) {
        parts.push(`hospedagem ${ruleLabel(accommodationRule)}`);
      }
      if (discountedFood < foodPrice) {
        parts.push(`alimentação ${ruleLabel(foodRule)}`);
      }
      discountDescription = price <= 0 ? 'Grátis para essa idade' : parts.join(' + ');
    } else {
      const rule = findRule(ownRules, age);
      const discounted = applyRule(basePrice, rule);
      if (discounted < basePrice) {
        price = discounted;
        discountDescription =
          price <= 0
            ? `Grátis para ${rule.minAge} a ${rule.maxAge} anos`
            : `${ruleLabel(rule)} para ${rule.minAge} a ${rule.maxAge} anos`;
      }
    }

    if (basePrice === 0) {
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
