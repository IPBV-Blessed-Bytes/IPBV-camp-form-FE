import { getProducts } from '@/services/products';

const CATEGORY_LABEL = {
  HOSPEDAGEM: 'Hospedagem',
  TRANSPORTE: 'Transporte',
  ALIMENTACAO: 'Alimentação',
};

export const toCategoryLabel = (category) => CATEGORY_LABEL[category] || category;

export let products = [];

export const loadProducts = async () => {
  try {
    const data = await getProducts();
    const list = Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [];

    products = list.map((product) => ({
      id: product.slug || String(product.id),
      slug: product.slug || String(product.id),
      productId: product.id,
      name: product.name,
      price: Number(product.price ?? 0),
      description: product.description,
      category: toCategoryLabel(product.category),
      vacancies: product.vacancies ?? null,
    }));

    return products;
  } catch (error) {
    console.error('Erro ao carregar os produtos:', error);
    return products;
  }
};
