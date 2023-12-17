import generatePackagesValues from './generatePackagesValues';

const XV_NOVEMBRO = 'Colégio XV de Novembro';
const SEMINARIO = 'Seminário São José';
const HOTEL_IBIS = 'Hotel Ibis';
const OTHER = 'Outra Acomodação Externa';

export const accommodations = [XV_NOVEMBRO, SEMINARIO, HOTEL_IBIS, OTHER];

const getPackages = (age) => {
  const [schoolWithBus, schoolWithouBus] = generatePackagesValues('school', age);
  const [seminaryWithBuss, seminaryWithoutBuss] = generatePackagesValues('seminary', age);
  const [hotelWithBuss, hotelWithoutBuss] = generatePackagesValues('hotel', age);
  const [otherWithBuss, otherWithoutBuss] = generatePackagesValues('other', age);
  const [dayUse] = generatePackagesValues('dayUse');

  const packages = [
    {
      id: '1',
      title: 'PACOTE 1 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA COM ÔNIBUS',
      observation: '* Em salas de aula COM ônibus',
      values: { ...schoolWithBus },
      accomodation: { id: 'colegioIndividualComOnibus', name: XV_NOVEMBRO, subAccomodation: 'Colégio Individual' },
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '2',
      title: 'PACOTE 2 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA SEM ÔNIBUS',
      observation: '* Em salas de aula SEM ônibus',
      values: { ...schoolWithouBus },
      accomodation: { id: 'colegioIndividualSemOnibus', name: XV_NOVEMBRO, subAccomodation: 'Colégio Individual' },
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '3',
      title: 'PACOTE 3 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL COM ÔNIBUS',
      observation: '* Em salas de aula COM ônibus',
      values: { ...schoolWithBus },
      accomodation: { id: 'colegioFamiliaComOnibus', name: XV_NOVEMBRO, subAccomodation: 'Colégio Família' },
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '4',
      title: 'PACOTE 4 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL SEM ÔNIBUS',
      observation: '* Em salas de aula SEM ônibus',
      values: { ...schoolWithouBus },
      accomodation: { id: 'colegioFamiliaSemOnibus', name: XV_NOVEMBRO, subAccomodation: 'Colégio Família' },
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '5',
      title: 'PACOTE 5 - HOSPEDAGEM INDIVIDUAL OU FAMÍLIA EM BARRACAS (CAMPING) COM ÔNIBUS',
      observation: '* No espaço no colégio destinado para camping COM ônibus (levar sua própria barraca)',
      values: { ...schoolWithBus },
      accomodation: { id: 'colegioCampingComOnibus', name: XV_NOVEMBRO, subAccomodation: 'Colégio Camping' },
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '6',
      title: 'PACOTE 6 - HOSPEDAGEM INDIVIDUAL OU FAMÍLIA EM BARRACAS (CAMPING) SEM ÔNIBUS',
      observation: '* No espaço no colégio destinado para camping SEM ônibus (levar sua própria barraca)',
      values: { ...schoolWithouBus },
      accomodation: { id: 'colegioCampingSemOnibus', name: XV_NOVEMBRO, subAccomodation: 'Colégio Camping' },
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '7',
      title: 'PACOTE 7 - HOSPEDAGEM INDIVIDUAL OU DUPLA COM ÔNIBUS',
      subtitle: '• APENAS PRA QUEM JÁ ESTAVA PRÉ-INSCRITO NO FORMULÁRIO ANTIGOApenas pra quem já estava pré-inscrito no formulário antigo!',
      observation: '* COM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithBuss },
      accomodation: { id: 'seminarioIndividualComOnibus', name: SEMINARIO, subAccomodation: 'Seminário Individual' },
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '8',
      title: 'PACOTE 8 - HOSPEDAGEM INDIVIDUAL OU DUPLA SEM ÔNIBUS (APENAS PRA QUEM JÁ ESTAVA INSCRITO NO FORMULÁRIO ANTIGO)',
      subtitle: '• APENAS PRA QUEM JÁ ESTAVA PRÉ-INSCRITO NO FORMULÁRIO ANTIGO',
      observation: '* SEM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithoutBuss },
      accomodation: { id: 'seminarioIndividualSemOnibus', name: SEMINARIO, subAccomodation: 'Seminário Individual' },
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '9',
      title: 'PACOTE 9 - HOSPEDAGEM DUPLA PARA QUARTO COM CAMA DE CASAL COM ÔNIBUS (APENAS PRA QUEM JÁ ESTAVA INSCRITO NO FORMULÁRIO ANTIGO)',
      subtitle: '• APENAS PRA QUEM JÁ ESTAVA PRÉ-INSCRITO NO FORMULÁRIO ANTIGO',
      observation: '* COM ônibus / Café da manhã incluso no hotel',
      values: { ...hotelWithBuss },
      accomodation: { id: 'hotelDuplaComOnibus', name: HOTEL_IBIS, subAccomodation: 'Hotel Dupla' },
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '10',
      title: 'PACOTE 10 - HOSPEDAGEM DUPLA PARA QUARTO COM CAMA DE CASAL SEM ÔNIBUS (APENAS PRA QUEM JÁ ESTAVA INSCRITO NO FORMULÁRIO ANTIGO)',
      subtitle: '• APENAS PRA QUEM JÁ ESTAVA PRÉ-INSCRITO NO FORMULÁRIO ANTIGO',
      observation: '* SEM ônibus / Café da manhã incluso no hotel',
      values: { ...hotelWithoutBuss },
      accomodation: { id: 'hotelDuplaSemOnibus', name: HOTEL_IBIS, subAccomodation: 'Hotel Dupla' },
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '11',
      title: 'PACOTE 11 - HOSPEDAGEM EXTERNA COM ÔNIBUS',
      observation:
        '* COM ônibus / Hospedagem em outro local que não os listados acima (por sua conta e responsabilidade)',
      values: { ...otherWithBuss },
      accomodation: { id: 'outroComOnibus', name: OTHER, subAccomodation: 'Outro' },
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '12',
      title: 'PACOTE 12 - HOSPEDAGEM EXTERNA SEM ÔNIBUS',
      observation:
        '* SEM ônibus / Hospedagem em outro local que não os listados acima (por sua conta e responsabilidade)',
      values: { ...otherWithoutBuss },
      accomodation: { id: 'outroSemOnibus', name: OTHER, subAccomodation: 'Outro' },
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '13',
      title: 'PACOTE 13 - ASSISTIR O CULTO',
      observation:
        '* Apenas assistir aos cultos ou participar das programações. SEM alimentação, transporte ou hospedagem',
      values: { ...dayUse },
      accomodation: { id: 'usuarioSemCusto', name: OTHER, subAccomodation: 'dayUse' },
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
  ];

  return packages;
};

export default getPackages;
