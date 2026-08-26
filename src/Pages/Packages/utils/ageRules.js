import { getAgePriceRules } from '@/services/agePriceRules';

export let ageRules = [];

export const loadAgePriceRules = async () => {
  try {
    const data = await getAgePriceRules();
    const list = Array.isArray(data?.rules) ? data.rules : Array.isArray(data) ? data : [];

    ageRules = list.map((rule) => ({
      id: rule.id,
      productId: rule.productId,
      minAge: Number(rule.minAge ?? 0),
      maxAge: Number(rule.maxAge ?? 0),
      discountType: rule.discountType === 'VALUE' ? 'VALUE' : 'PERCENT',
      discountAmount: Number(rule.discountAmount ?? 0),
    }));

    return ageRules;
  } catch (error) {
    console.error('Erro ao carregar as faixas de desconto por idade:', error);
    return ageRules;
  }
};
