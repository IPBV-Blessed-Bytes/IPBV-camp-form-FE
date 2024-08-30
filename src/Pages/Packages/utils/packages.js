import generatePackagesValues from './generatePackagesValues';

const SCHOOL = 'Colégio XV de Novembro';
const SEMINARY = 'Seminário São José';
const OTHER = 'Outra Acomodação Externa';

export const accommodations = [SCHOOL, SEMINARY, OTHER];

const getPackages = (age) => {
  const [schoolWithBusWithFood, schoolWithoutBusWithoutFood, schoolWithBusWithoutFood, schoolWithoutBusWithFood] =
    generatePackagesValues('school', age);
  const [seminaryWithBusWithFood, seminaryWithoutBusWithFood] = generatePackagesValues('seminary', age);
  const [otherWithBusWithFood, otherWithoutBusWithFood, otherWithoutBusWithoutFood] = generatePackagesValues(
    'other',
    age,
  );

  const packages = [
    {
      id: '1',
      title: 'PACOTE 1 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA COM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: 'Em salas de aula COM ônibus',
      values: { ...schoolWithBusWithFood },
      accomodation: {
        id: 'colegioIndividualComOnibusComAlimentacao',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Individual',
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '2',
      title: 'PACOTE 2 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA SEM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: 'Em salas de aula SEM ônibus',
      values: { ...schoolWithoutBusWithFood },
      accomodation: {
        id: 'colegioIndividualSemOnibusComAlimentacao',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Individual',
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '3',
      title: 'PACOTE 3 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA COM ÔNIBUS',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation: 'Em salas de aula COM ônibus e SEM alimentação. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...schoolWithBusWithoutFood },
      accomodation: {
        id: 'colegioIndividualComOnibusSemAlimentacao',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Individual',
      transportation: 'Com Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '4',
      title: 'PACOTE 4 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA SEM ÔNIBUS',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation: 'Em salas de aula SEM ônibus e SEM alimentação. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...schoolWithoutBusWithoutFood },
      accomodation: {
        id: 'colegioIndividualSemOnibusSemAlimentacao',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Individual',
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '5',
      title: 'PACOTE 5 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL COM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: 'Em salas de aula COM ônibus',
      values: { ...schoolWithBusWithFood },
      accomodation: {
        id: 'colegioFamiliaComOnibusComAlimentacao',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Família',
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '6',
      title: 'PACOTE 6 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL SEM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: 'Em salas de aula SEM ônibus',
      values: { ...schoolWithoutBusWithFood },
      accomodation: {
        id: 'colegioFamiliaSemOnibusComAlimentacao',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Família',
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '7',
      title: 'PACOTE 7 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL COM ÔNIBUS',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation: 'Em salas de aula COM ônibus e SEM alimentação. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...schoolWithBusWithoutFood },
      accomodation: {
        id: 'colegioFamiliaComOnibusSemAlimentacao',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Família',
      transportation: 'Com Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '8',
      title: 'PACOTE 8 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL SEM ÔNIBUS',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation: 'Em salas de aula SEM ônibus. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...schoolWithoutBusWithoutFood },
      accomodation: {
        id: 'colegioFamiliaSemOnibusSemAlimentacao',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Família',
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '9',
      title: 'PACOTE 9 - HOSPEDAGEM INDIVIDUAL OU FAMÍLIA EM BARRACAS (CAMPING) SEM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation:
        'No espaço no colégio destinado para camping SEM ônibus (levar sua própria barraca) e COM ALIMENTAÇÃO',
      values: { ...schoolWithoutBusWithFood },
      accomodation: {
        id: 'colegioCampingSemOnibusComAlimentacao',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Camping',
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '10',
      title: 'PACOTE 10 - HOSPEDAGEM INDIVIDUAL OU FAMÍLIA EM BARRACAS (CAMPING) SEM ÔNIBUS',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation:
        'No espaço no colégio destinado para camping SEM ônibus (levar sua própria barraca) e SEM ALIMENTAÇÃO. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...schoolWithoutBusWithoutFood },
      accomodation: {
        id: 'colegioCampingSemOnibusSemAlimentacao',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Camping',
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '11',
      title: 'PACOTE 11 - HOSPEDAGEM INDIVIDUAL COM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: 'COM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithBusWithFood },
      accomodation: {
        id: 'seminarioIndividualComOnibusComAlimentacao',
      },
      accomodationName: SEMINARY,
      subAccomodation: 'Seminário Individual',
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '12',
      title: 'PACOTE 12 - HOSPEDAGEM INDIVIDUAL SEM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation: 'SEM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithoutBusWithFood },
      accomodation: {
        id: 'seminarioIndividualSemOnibusComAlimentacao',
      },
      accomodationName: SEMINARY,
      subAccomodation: 'Seminário Individual',
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '13',
      title: 'PACOTE 13 - HOSPEDAGEM EXTERNA COM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation:
        'COM ônibus / Hospedagem em outro local que não os listados acima (por sua conta e responsabilidade)',
      values: { ...otherWithBusWithFood },
      accomodation: { id: 'outroComOnibusComAlimentacao' },
      accomodationName: OTHER,
      subAccomodation: 'Outra',
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '14',
      title: 'PACOTE 14 - HOSPEDAGEM EXTERNA SEM ÔNIBUS',
      subtitle: '• COM ALIMENTAÇÃO',
      observation:
        'SEM ônibus / Hospedagem em outro local que não os listados acima (por sua conta e responsabilidade)',
      values: { ...otherWithoutBusWithFood },
      accomodation: { id: 'outroSemOnibusSemAlimentacao' },
      accomodationName: OTHER,
      subAccomodation: 'Outra',
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '15',
      title: 'PACOTE 15 - ASSISTIR O CULTO',
      subtitle: '• SEM ALIMENTAÇÃO',
      observation:
        'Apenas assistir aos cultos ou participar das programações. SEM alimentação, transporte ou hospedagem. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...otherWithoutBusWithoutFood },
      accomodation: { id: 'usuarioSemCusto' },
      accomodationName: OTHER,
      subAccomodation: 'Outra',
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
  ];

  return packages;
};

export default getPackages;
