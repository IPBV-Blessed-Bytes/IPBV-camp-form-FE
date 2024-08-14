import generatePackagesValues from './generatePackagesValues';

const XV_NOVEMBRO = 'Colégio XV de Novembro';
const SEMINARIO = 'Seminário São José';
const OTHER = 'Outra Acomodação Externa';

export const accommodations = [XV_NOVEMBRO, SEMINARIO, OTHER];

const getPackages = (age, discount) => {
  const [schoolWithBusWithFood, schoolWithoutBusWithoutFood, schoolWithBusWithoutFood, schoolWithoutBusWithFood] =
    generatePackagesValues('school', age, discount);
  const [seminaryWithBusWithFood, seminaryWithoutBusWithFood] = generatePackagesValues('seminary', age, discount);
  const [otherWithBusWithFood, otherWithoutBusWithFood] = generatePackagesValues('other', age, discount);
  const [nonPaid] = generatePackagesValues('nonPaid', age);

  const packages = [
    {
      id: '1',
      title: 'PACOTE 1 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA COM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: '* Em salas de aula COM ônibus',
      values: { ...schoolWithBusWithFood },
      accomodation: {
        id: 'colegioIndividualComOnibusComAlimentacao',
        name: XV_NOVEMBRO,
        subAccomodation: 'Colégio Individual',
      },
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '2',
      title: 'PACOTE 2 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA SEM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: '* Em salas de aula SEM ônibus',
      values: { ...schoolWithoutBusWithFood },
      accomodation: {
        id: 'colegioIndividualSemOnibusComAlimentacao',
        name: XV_NOVEMBRO,
        subAccomodation: 'Colégio Individual',
      },
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '3',
      title: 'PACOTE 3 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA COM ÔNIBUS',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation: '* Em salas de aula COM ônibus e SEM alimentação. ',
      observationHighlite: 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação',
      values: { ...schoolWithBusWithoutFood },
      accomodation: {
        id: 'colegioIndividualComOnibusSemAlimentacao',
        name: XV_NOVEMBRO,
        subAccomodation: 'Colégio Individual',
      },
      transportation: 'Com Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '4',
      title: 'PACOTE 4 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA SEM ÔNIBUS',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation: '* Em salas de aula SEM ônibus e SEM alimentação. ',
      observationHighlite: 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação',
      values: { ...schoolWithoutBusWithoutFood },
      accomodation: {
        id: 'colegioIndividualSemOnibusSemAlimentacao',
        name: XV_NOVEMBRO,
        subAccomodation: 'Colégio Individual',
      },
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '5',
      title: 'PACOTE 5 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL COM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: '* Em salas de aula COM ônibus',
      values: { ...schoolWithBusWithFood },
      accomodation: {
        id: 'colegioFamiliaComOnibusComAlimentacao',
        name: XV_NOVEMBRO,
        subAccomodation: 'Colégio Família',
      },
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '6',
      title: 'PACOTE 6 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL SEM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: '* Em salas de aula SEM ônibus',
      values: { ...schoolWithoutBusWithFood },
      accomodation: {
        id: 'colegioFamiliaSemOnibusComAlimentacao',
        name: XV_NOVEMBRO,
        subAccomodation: 'Colégio Família',
      },
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '7',
      title: 'PACOTE 7 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL COM ÔNIBUS',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation: '* Em salas de aula COM ônibus e SEM alimentação. ',
      observationHighlite: 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação',
      values: { ...schoolWithBusWithoutFood },
      accomodation: {
        id: 'colegioFamiliaComOnibusSemAlimentacao',
        name: XV_NOVEMBRO,
        subAccomodation: 'Colégio Família',
      },
      transportation: 'Com Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '8',
      title: 'PACOTE 8 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL SEM ÔNIBUS',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation: '* Em salas de aula SEM ônibus. ',
      observationHighlite: 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação',
      values: { ...schoolWithoutBusWithoutFood },
      accomodation: {
        id: 'colegioFamiliaSemOnibusSemAlimentacao',
        name: XV_NOVEMBRO,
        subAccomodation: 'Colégio Família',
      },
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '9',
      title: 'PACOTE 9 - HOSPEDAGEM INDIVIDUAL OU FAMÍLIA EM BARRACAS (CAMPING) SEM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation:
        '* No espaço no colégio destinado para camping SEM ônibus (levar sua própria barraca) e COM ALIMENTAÇÃO',
      values: { ...schoolWithoutBusWithFood },
      accomodation: {
        id: 'colegioCampingSemOnibusComAlimentacao',
        name: XV_NOVEMBRO,
        subAccomodation: 'Colégio Camping',
      },
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '10',
      title: 'PACOTE 10 - HOSPEDAGEM INDIVIDUAL OU FAMÍLIA EM BARRACAS (CAMPING) SEM ÔNIBUS',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation:
        '* No espaço no colégio destinado para camping SEM ônibus (levar sua própria barraca) e SEM ALIMENTAÇÃO. ',
      observationHighlite: 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação',
      values: { ...nonPaid },
      accomodation: {
        id: 'colegioCampingSemOnibusSemAlimentacao',
        name: XV_NOVEMBRO,
        subAccomodation: 'Colégio Camping',
      },
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '11',
      title: 'PACOTE 11 - HOSPEDAGEM INDIVIDUAL COM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: '* COM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithBusWithFood },
      accomodation: {
        id: 'seminarioIndividualComOnibusComAlimentacao',
        name: SEMINARIO,
        subAccomodation: 'Seminário Individual',
      },
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '12',
      title: 'PACOTE 12 - HOSPEDAGEM INDIVIDUAL SEM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: '* SEM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithoutBusWithFood },
      accomodation: {
        id: 'seminarioIndividualSemOnibusComAlimentacao',
        name: SEMINARIO,
        subAccomodation: 'Seminário Individual',
      },
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '13',
      title: 'PACOTE 13 - HOSPEDAGEM EXTERNA COM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation:
        '* COM ônibus / Hospedagem em outro local que não os listados acima (por sua conta e responsabilidade)',
      values: { ...otherWithBusWithFood },
      accomodation: { id: 'outroComOnibusComAlimentacao', name: OTHER, subAccomodation: 'Outra' },
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '14',
      title: 'PACOTE 14 - HOSPEDAGEM EXTERNA SEM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation:
        '* SEM ônibus / Hospedagem em outro local que não os listados acima (por sua conta e responsabilidade)',
      values: { ...otherWithoutBusWithFood },
      accomodation: { id: 'outroSemOnibusSemAlimentacao', name: OTHER, subAccomodation: 'Outra' },
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '15',
      title: 'PACOTE 15 - ASSISTIR O CULTO',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation:
        '* Apenas assistir aos cultos ou participar das programações. SEM alimentação, transporte ou hospedagem. ',
      observationHighlite: 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação',
      values: { ...nonPaid },
      accomodation: { id: 'usuarioSemCusto', name: OTHER, subAccomodation: 'Externa' },
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
  ];

  return packages;
};

export default getPackages;
