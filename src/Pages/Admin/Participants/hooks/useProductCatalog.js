import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getAllProducts } from '@/services/products';

export const PRODUCT_CATALOG_QUERY_KEY = ['product-catalog'];

const CATEGORIES = ['HOSPEDAGEM', 'TRANSPORTE', 'ALIMENTACAO'];

export const normalizeProductName = (str) =>
  str
    ?.normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/gi, '')
    .trim();

const emptyOptions = () => CATEGORIES.reduce((acc, category) => ({ ...acc, [category]: [] }), {});

const buildCatalog = (products) => {
  const options = emptyOptions();
  const slugToName = {};
  const nameToSlug = {};

  products
    .filter((product) => product.active !== false)
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .forEach((product) => {
      const slug = product.slug || String(product.id);
      const name = product.name || '';

      if (options[product.category]) {
        options[product.category].push({ label: name, value: name });
      }
      slugToName[slug] = name;
      nameToSlug[normalizeProductName(name)] = slug;
    });

  return { options, slugToName, nameToSlug };
};

export const useProductCatalog = () => {
  const { data, isLoading } = useQuery({
    queryKey: PRODUCT_CATALOG_QUERY_KEY,
    queryFn: async () => {
      const response = await getAllProducts();
      return Array.isArray(response?.products) ? response.products : [];
    },
  });

  return useMemo(() => ({ ...buildCatalog(data || []), loading: isLoading }), [data, isLoading]);
};
