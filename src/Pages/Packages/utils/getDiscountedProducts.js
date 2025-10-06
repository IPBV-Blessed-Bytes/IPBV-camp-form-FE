import { products } from '@/Pages/Packages/utils/products';

const getDiscountedProducts = (ageRaw) => {
  const age = Number(ageRaw);

  return products.map((product) => {
    let price = product.price;
    let discountDescription = '';

    if (product.category === 'Hospedagem') {
      if (age <= 8) {
        price = 0;
        discountDescription = 'Criança até 8 anos não paga hospedagem';
      } else if (age >= 9 && age <= 14) {
        price = price * 0.5;
        discountDescription = 'Adolescente de 9 a 14 anos paga apenas 50% na hospedagem';
      }
    }

    if (product.category === 'Transporte') {
      if (age <= 8 && product.id === 'bus-yes') {
        price = 0;
        discountDescription = 'Criança até 8 anos não paga transporte';
      } else if (age >= 9 && age <= 14 && product.id === 'bus-yes') {
        price = price * 0.5;
        discountDescription = 'Adolescente de 9 a 14 anos paga apenas 50% no transporte';
      }
    }

    if (product.category === 'Alimentação') {
      if (age <= 8 && product.id === 'food-complete') {
        price = 0;
        discountDescription = 'Criança até 8 anos não paga alimentação';
      } else if (age >= 9 && age <= 14 && product.id === 'food-complete') {
        price = price * 0.5;
        discountDescription = 'Adolescente de 9 a 14 anos paga apenas 50% na alimentação';
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
