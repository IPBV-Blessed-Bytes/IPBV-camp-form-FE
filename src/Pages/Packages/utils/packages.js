import generatePackagesValues from './generatePackagesValues';

const XV_NOVEMBRO = 'Colégio XV de Novembro';
const SEMINARIO = 'Seminário São José';
const HOTEL_IBIS = 'Hotel Ibis';
const OTHER = 'Outra Acomodação Externa';

export const accommodations = [XV_NOVEMBRO, SEMINARIO, HOTEL_IBIS, OTHER];

const getPackages = (age) => {
  const [schoollWithBuss, schollWithoutBuss] = generatePackagesValues('school', age);
  const [seminaryWithBuss, seminaryWithoutBuss] = generatePackagesValues('seminary', age);
  const [hotelWithBuss, hotelWithoutBuss] = generatePackagesValues('hotel', age);
  const [otherWithBuss, otherWithoutBuss] = generatePackagesValues('other', age);

  const packages = [
    {
      id: '1',
      accomodation: { id: 'colegioIndividualComOnibus', name: XV_NOVEMBRO },
      title: 'PACOTE 1 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA COM ÔNIBUS',
      observation: '* Em salas de aula COM ônibus',
      values: { ...schoollWithBuss },
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '2',
      accomodation: { id: 'colegioIndividualSemOnibus', name: XV_NOVEMBRO },
      title: 'PACOTE 2 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA SEM ÔNIBUS',
      observation: '* Em salas de aula SEM ônibus',
      values: { ...schollWithoutBuss },
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '3',
      accomodation: { id: 'colegioFamiliaComOnibus', name: XV_NOVEMBRO },
      title: 'PACOTE 3 - HOSPEDAGEM FAMÍLIA EM SALA COLETIVA COM ÔNIBUS',
      observation: '* Em salas de aula COM ônibus',
      values: { ...schoollWithBuss },
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '4',
      accomodation: { id: 'colegioFamiliaSemOnibus', name: XV_NOVEMBRO },
      title: 'PACOTE 4 - HOSPEDAGEM FAMÍLIA EM SALA COLETIVA SEM ÔNIBUS',
      observation: '* Em salas de aula SEM ônibus',
      values: { ...schollWithoutBuss },
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '5',
      accomodation: { id: 'seminarioIndividualComOnibus', name: SEMINARIO },
      title: 'PACOTE 5 - HOSPEDAGEM INDIVIDUAL OU DUPLA COM ÔNIBUS',
      observation: '* COM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithBuss },
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '6',
      accomodation: { id: 'seminarioIndividualSemOnibus', name: SEMINARIO },
      title: 'PACOTE 6 - HOSPEDAGEM INDIVIDUAL OU DUPLA SEM ÔNIBUS',
      observation: '* SEM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithoutBuss },
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '7',
      accomodation: { id: 'hotelDuplaComOnibus', name: HOTEL_IBIS },
      title: 'PACOTE 7 - HOSPEDAGEM DUPLA PARA QUARTO COM CAMA DE CASAL COM ÔNIBUS',
      observation: '* COM ônibus / Café da manhã incluso no hotel',
      values: { ...hotelWithBuss },
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '8',
      accomodation: { id: 'hotelDuplaSemOnibus', name: HOTEL_IBIS },
      title: 'PACOTE 8 - HOSPEDAGEM DUPLA PARA QUARTO COM CAMA DE CASAL SEM ÔNIBUS',
      observation: '* SEM ônibus / Café da manhã incluso no hotel',
      values: { ...hotelWithoutBuss },
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '9',
      accomodation: { id: 'outroComOnibus', name: OTHER },
      title: 'PACOTE 9 - HOSPEDAGEM EXTERNA COM ÔNIBUS',
      observation: '* COM ônibus / Hospedagem em outro local que não os listados acima (por sua conta e responsabilidade)',
      values: { ...otherWithBuss },
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '10',
      accomodation: { id: 'outroSemOnibus', name: OTHER },
      title: 'PACOTE 10 - HOSPEDAGEM EXTERNA SEM ÔNIBUS',
      observation: '* SEM ônibus / Hospedagem em outro local que não os listados acima (por sua conta e responsabilidade)',
      values: { ...otherWithoutBuss },
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
  ];

  return packages;
};

export default getPackages;
