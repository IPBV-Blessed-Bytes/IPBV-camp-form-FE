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
      title: 'PACOTE 1 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA',
      secondTitle: '• COM ÔNIBUS',
      secondTitleFontColor: 'success',
      thirdTitle: '• COM ALIMENTAÇÃO',
      thirdTitleFontColor: 'success',
      observation: 'Em salas de aula COM ônibus',
      values: { ...schoolWithBusWithFood },
      accomodation: {
        id: 'schoolIndividualWithBusWithFood',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Individual',
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '2',
      title: 'PACOTE 2 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA',
      secondTitle: '• SEM ÔNIBUS',
      secondTitleFontColor: 'danger',
      thirdTitle: '• COM ALIMENTAÇÃO',
      thirdTitleFontColor: 'success',
      observation: 'Em salas de aula SEM ônibus',
      values: { ...schoolWithoutBusWithFood },
      accomodation: {
        id: 'schoolIndividualWithoutBusWithFood',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Individual',
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '3',
      title: 'PACOTE 3 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA',
      secondTitle: '• COM ÔNIBUS',
      secondTitleFontColor: 'success',
      thirdTitle: '• SEM ALIMENTAÇÃO',
      thirdTitleFontColor: 'danger',
      observation: 'Em salas de aula COM ônibus e SEM alimentação. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...schoolWithBusWithoutFood },
      accomodation: {
        id: 'schoolIndividualWithBusWithoutFood',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Individual',
      transportation: 'Com Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '4',
      title: 'PACOTE 4 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA',
      secondTitle: '• SEM ÔNIBUS',
      secondTitleFontColor: 'danger',
      thirdTitle: '• SEM ALIMENTAÇÃO',
      thirdTitleFontColor: 'danger',
      observation: 'Em salas de aula SEM ônibus e SEM alimentação. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...schoolWithoutBusWithoutFood },
      accomodation: {
        id: 'schoolIndividualWithoutBusWithoutFood',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Individual',
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '5',
      title: 'PACOTE 5 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL',
      secondTitle: '• COM ÔNIBUS',
      secondTitleFontColor: 'success',
      thirdTitle: '• COM ALIMENTAÇÃO',
      thirdTitleFontColor: 'success',
      observation: 'Em salas de aula COM ônibus',
      values: { ...schoolWithBusWithFood },
      accomodation: {
        id: 'schoolFamilyWithBusWithFood',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Família',
      transportation: 'Com Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '6',
      title: 'PACOTE 6 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL',
      secondTitle: '• SEM ÔNIBUS',
      secondTitleFontColor: 'danger',
      thirdTitle: '• COM ALIMENTAÇÃO',
      thirdTitleFontColor: 'success',
      observation: 'Em salas de aula SEM ônibus',
      values: { ...schoolWithoutBusWithFood },
      accomodation: {
        id: 'schoolFamilyWithoutBusWithFood',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Família',
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '7',
      title: 'PACOTE 7 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL',
      secondTitle: '• COM ÔNIBUS',
      secondTitleFontColor: 'success',
      thirdTitle: '• SEM ALIMENTAÇÃO',
      thirdTitleFontColor: 'danger',
      observation: 'Em salas de aula COM ônibus e SEM alimentação. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...schoolWithBusWithoutFood },
      accomodation: {
        id: 'schoolFamilyWithBusWithoutFood',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Família',
      transportation: 'Com Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '8',
      title: 'PACOTE 8 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL',
      secondTitle: '• SEM ÔNIBUS',
      secondTitleFontColor: 'danger',
      thirdTitle: '• SEM ALIMENTAÇÃO',
      thirdTitleFontColor: 'danger',
      observation: 'Em salas de aula SEM ônibus. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...schoolWithoutBusWithoutFood },
      accomodation: {
        id: 'schoolFamilyWithoutBusWithoutFood',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Família',
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '9',
      title: 'PACOTE 9 - HOSPEDAGEM INDIVIDUAL OU FAMÍLIA EM BARRACAS (CAMPING)',
      secondTitle: '• SEM ÔNIBUS',
      secondTitleFontColor: 'danger',
      thirdTitle: '• COM ALIMENTAÇÃO',
      thirdTitleFontColor: 'success',
      observation:
        'No espaço no colégio destinado para camping SEM ônibus (levar sua própria barraca) e COM ALIMENTAÇÃO',
      values: { ...schoolWithoutBusWithFood },
      accomodation: {
        id: 'schoolCampingWithoutBusWithFood',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Camping',
      transportation: 'Sem Ônibus',
      food: 'Café da manhã, almoço e jantar',
    },
    {
      id: '10',
      title: 'PACOTE 10 - HOSPEDAGEM INDIVIDUAL OU FAMÍLIA EM BARRACAS (CAMPING)',
      secondTitle: '• SEM ÔNIBUS',
      secondTitleFontColor: 'danger',
      thirdTitle: '• SEM ALIMENTAÇÃO',
      thirdTitleFontColor: 'danger',
      observation:
        'No espaço no colégio destinado para camping SEM ônibus (levar sua própria barraca) e SEM ALIMENTAÇÃO. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...schoolWithoutBusWithoutFood },
      accomodation: {
        id: 'schoolCampingWithoutBusWithoutFood',
      },
      accomodationName: SCHOOL,
      subAccomodation: 'Colégio Camping',
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
    {
      id: '11',
      title: 'PACOTE 11 - HOSPEDAGEM INDIVIDUAL',
      secondTitle: '• COM ÔNIBUS',
      secondTitleFontColor: 'success',
      thirdTitle: '• COM ALIMENTAÇÃO',
      thirdTitleFontColor: 'success',
      observation: 'COM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithBusWithFood },
      accomodation: {
        id: 'seminaryWithBusWithFood',
      },
      accomodationName: SEMINARY,
      subAccomodation: 'Seminário Individual',
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '12',
      title: 'PACOTE 12 - HOSPEDAGEM INDIVIDUAL',
      secondTitle: '• SEM ÔNIBUS',
      secondTitleFontColor: 'danger',
      thirdTitle: '• COM ALIMENTAÇÃO',
      thirdTitleFontColor: 'success',
      observation: 'SEM ônibus / Café da manhã incluso no seminário',
      values: { ...seminaryWithoutBusWithFood },
      accomodation: {
        id: 'seminaryWithoutBusWithFood',
      },
      accomodationName: SEMINARY,
      subAccomodation: 'Seminário Individual',
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '13',
      title: 'PACOTE 13 - HOSPEDAGEM EXTERNA',
      secondTitle: '• COM ÔNIBUS',
      secondTitleFontColor: 'success',
      thirdTitle: '• COM ALIMENTAÇÃO',
      thirdTitleFontColor: 'success',
      observation:
        'COM ônibus / Hospedagem em outro local que não os listados acima (por sua conta e responsabilidade)',
      values: { ...otherWithBusWithFood },
      accomodation: { id: 'otherWithBusWithFood' },
      accomodationName: OTHER,
      subAccomodation: 'Outra',
      transportation: 'Com Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '14',
      title: 'PACOTE 14 - HOSPEDAGEM EXTERNA',
      secondTitle: '• SEM ÔNIBUS',
      secondTitleFontColor: 'danger',
      thirdTitle: '• COM ALIMENTAÇÃO',
      thirdTitleFontColor: 'success',
      observation:
        'SEM ônibus / Hospedagem em outro local que não os listados acima (por sua conta e responsabilidade)',
      values: { ...otherWithoutBusWithFood },
      accomodation: { id: 'otherWithoutBusWithoutFood' },
      accomodationName: OTHER,
      subAccomodation: 'Outra',
      transportation: 'Sem Ônibus',
      food: 'Almoço e jantar',
    },
    {
      id: '15',
      title: 'PACOTE 15 - ASSISTIR O CULTO',
      secondTitle: '• SEM ÔNIBUS',
      secondTitleFontColor: 'danger',
      thirdTitle: '• SEM ALIMENTAÇÃO',
      thirdTitleFontColor: 'danger',
      observation:
        'Apenas assistir aos cultos ou participar das programações. SEM alimentação, transporte ou hospedagem. ',
      observationHighlite:
        age > 12 && 'Taxa fixa de manuteção no valor de 50 reais para adultos que não optarem por alimentação *',
      values: { ...otherWithoutBusWithoutFood },
      accomodation: { id: 'otherWithoutBusWithoutFood' },
      accomodationName: OTHER,
      subAccomodation: 'Outra',
      transportation: 'Sem Ônibus',
      food: 'Sem Alimentação',
    },
  ];

  return packages;
};

export default getPackages;
