import fetcher from '@/fetchers';

export let products = [
  {
    id: 'host-college-collective',
    name: 'Colégio Quarto Coletivo',
    price: 0,
    description: 'Quartos coletivos, separados por idade',
    category: 'Hospedagem',
  },
  {
    id: 'host-college-family',
    name: 'Colégio Quarto Família',
    price: 0,
    description: 'Quartos separados para cada família',
    category: 'Hospedagem',
  },
  {
    id: 'host-college-camping',
    name: 'Colégio Camping',
    price: 0,
    description: 'Área destinada para quem vai acampar de barraca',
    category: 'Hospedagem',
  },
  {
    id: 'host-seminario',
    name: 'Seminário',
    price: 0,
    description: 'Quarto do seminário São José',
    category: 'Hospedagem',
  },
  {
    id: 'host-external',
    name: 'Externo',
    price: 0,
    description: 'Qualquer hospedagem que não seja colégio ou seminário',
    category: 'Hospedagem',
  },
  {
    id: 'bus-yes',
    name: 'Com Ônibus',
    price: 0,
    description: 'Ônibus disponibilizado pela igreja',
    category: 'Transporte',
  },
  {
    id: 'bus-no',
    name: 'Sem Ônibus',
    price: 0,
    description: 'Qualquer transporte que não seja no ônibus da igreja',
    category: 'Transporte',
  },
  {
    id: 'food-complete',
    name: 'Alimentação Completa',
    price: 0,
    description: 'Café da manhã, almoço e jantar inclusos',
    category: 'Alimentação',
  },
  {
    id: 'no-food',
    name: 'Sem Alimentação',
    price: 0,
    description: 'Sem refeições',
    category: 'Alimentação',
  },
   // {
  //   id: 'food-external',
  //   name: 'Alimentação Parcial',
  //   price: 240,
  //   description: 'Apenas almoço e jantar. Café da manhã não incluso',
  //   category: 'Alimentação',
  // },
];

export const loadProducts = async () => {
  try {
    const response = await fetcher.get('lots');
    const data = response.data;

    if (data.lots && data.lots.length > 0) {
      const lot = data.lots[0];
      products = products.map((product) => {
        switch (product.id) {
          case 'host-seminario':
            return { ...product, price: Number(lot.price.seminary) };
          case 'host-college-collective':
          case 'host-college-family':
          case 'host-college-camping':
            return { ...product, price: Number(lot.price.school) };
          case 'host-external':
            return { ...product, price: Number(lot.price.otherAccomodation) };
          case 'bus-yes':
            return { ...product, price: Number(lot.price.bus) };
          case 'food-complete':
            return { ...product, price: Number(lot.price.food) };
          default:
            return product;
        }
      });
    }

    return products;
  } catch (error) {
    console.error('Erro ao carregar os produtos:', error);
    return products;
  }
};
