import generatePackagesValues from './generatePackagesValues';

const XV_NOVEMBRO = 'Colégio XV de Novembro';
const SEMINARIO = 'Seminário São José';
const HOTEL_IBIS = 'Hotel Ibis';

export const accommodations = [XV_NOVEMBRO, SEMINARIO, HOTEL_IBIS];

const getPackages = (age) => {
  const [schoollWithBuss, schollWithoutBuss] = generatePackagesValues('school', age);
  const [seminaryWithBuss, seminaryWithoutBuss] = generatePackagesValues('seminary', age);
  const [hotelWithBuss, hotelWithoutBuss] = generatePackagesValues('hotel', age);

  const packages = [
    {
      id: '1',
      accomodation: { id: '1-colegio-individual', name: XV_NOVEMBRO },
      title: 'PACOTE 1 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA',
      observation: '* Em salas de aula COM ônibus',
      values: { ...schoollWithBuss },
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '2',
      accomodation: { id: '2-colegio-individual', name: XV_NOVEMBRO },
      title: 'PACOTE 2 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA',
      observation: '* Em salas de aula SEM ônibus',
      values: { ...schollWithoutBuss },
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '3',
      accomodation: { id: '3-colegio-familia', name: XV_NOVEMBRO },
      title: 'PACOTE 3 - HOSPEDAGEM FAMÍLIA EM SALA COLETIVA',
      observation: '* Em salas de aula COM ônibus',
      values: { ...schoollWithBuss },
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '4',
      accomodation: { id: '4-colegio-familia', name: XV_NOVEMBRO },
      title: 'PACOTE 4 - HOSPEDAGEM FAMÍLIA EM SALA COLETIVA',
      observation: '* Em salas de aula SEM ônibus',
      values: { ...schollWithoutBuss },
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '5',
      accomodation: { id: '5-seminario-individual', name: SEMINARIO },
      title: 'PACOTE 5 - HOSPEDAGEM INDIVIDUAL OU DUPLA',
      observation: '* COM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithBuss },
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '6',
      accomodation: { id: '6-seminario-individual', name: SEMINARIO },
      title: 'PACOTE 6 - HOSPEDAGEM INDIVIDUAL OU DUPLA',
      observation: '* SEM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithoutBuss },
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '7',
      accomodation: { id: '7-hotel-dupla', name: HOTEL_IBIS },
      title: 'PACOTE 7 - HOSPEDAGEM DUPLA',
      observation: '* COM ônibus / Café da manhã incluso no hotel',
      values: { ...hotelWithBuss },
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '8',
      accomodation: { id: '8-hotel-dupla', name: HOTEL_IBIS },
      title: 'PACOTE 8 - HOSPEDAGEM DUPLA',
      observation: '* SEM ônibus / Café da manhã incluso no hotel',
      values: { ...hotelWithoutBuss },
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
  ];

  return packages;
};

export default getPackages;
