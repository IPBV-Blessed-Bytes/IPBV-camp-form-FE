import { products } from '@/Pages/Packages/utils/products';

const getDiscountedProducts = (ageRaw) => {
  const age = Number(ageRaw);

  return products.map((product) => {
    let price = product.price;
    let discountDescription = '';

    if (product.category === 'Hospedagem') {
      if (product.id === 'host-seminario') {
        if (age <= 8) {
          price = 0;
          discountDescription = 'Criança até 8 anos não paga hospedagem';
        } else if (age >= 9 && age <= 14) {
          price = price * 0.5;
          discountDescription = 'Criança de 9 a 14 anos paga apenas 50% na hospedagem';
        }
      }
    }

    if (product.category === 'Transporte') {
      if (age <= 5 && product.id === 'bus-yes') {
        price = 0;
        discountDescription = 'Criança até 5 anos não paga transporte (no colo dos pais)';
      }
    }

    if (product.category === 'Alimentação') {
      if (age <= 6) {
        price = 0;
        discountDescription = 'Criança até 6 anos não paga alimentação';
      } else if (age >= 7 && age <= 12) {
        price = price * 0.5;
        discountDescription = 'Criança de 7 a 12 anos paga apenas 50% na alimentação';
      }
    }

    return {
      ...product,
      price: Number(price.toFixed(2)),
      discountDescription,
    };
  });
};

export default getDiscountedProducts;
