export const enumSteps = {
  home: 0,
  personalData: 1,
  contact: 2,
  packages: 3,
  extraMeals: 4,
  finalReview: 5,
  formPayment: 6,
  success: 7,
};

export const initialValues = {
  registrationDate: '',
  totalPrice: '',
  manualRegistration: '',
  personalInformation: {
    name: '',
    birthday: '',
    legalGuardianName: '',
    legalGuardianCpf: '',
    legalGuardianCellPhone: '',
    cpf: '',
    rg: '',
    rgShipper: '',
    rgShipperState: '',
    gender: '',
  },
  contact: {
    cellPhone: '',
    email: '',
    isWhatsApp: '',
    church: '',
    car: '',
    numberVacancies: '',
    needRide: '',
    rideObservation: '',
    hasAllergy: '',
    allergy: '',
    hasAggregate: '',
    aggregate: '',
  },
  package: {
    accomodation: {
      id: '',
    },
    accomodationName: '',
    subAccomodation: '',
    discountCoupon: '',
    discountValue: '',
    transportation: '',
    food: '',
    price: '',
    finalPrice: '',
    title: '',
  },
  extraMeals: {
    someFood: '',
    totalPrice: '',
    extraMeals: [''],
  },
  formPayment: '',
};

export const packages = [
  {
    label: 'PACOTE 1 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA COM ÔNIBUS E COM ALIMENTAÇÃO',
    value: 'PACOTE 1 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA',
  },
  {
    label: 'PACOTE 2 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA SEM ÔNIBUS E COM ALIMENTAÇÃO',
    value: 'PACOTE 2 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA',
  },
  {
    label: 'PACOTE 3 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA COM ÔNIBUS E SEM ALIMENTAÇÃO',
    value: 'PACOTE 3 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA',
  },
  {
    label: 'PACOTE 4 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA SEM ÔNIBUS E SEM ALIMENTAÇÃO',
    value: 'PACOTE 4 - HOSPEDAGEM INDIVIDUAL EM SALA COLETIVA',
  },
  {
    label: 'PACOTE 5 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL COM ÔNIBUS E COM ALIMENTAÇÃO',
    value: 'PACOTE 5 - HOSPEDAGEM FAMILIA EM SALA INDIVIDUAL',
  },
  {
    label: 'PACOTE 6 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL SEM ÔNIBUS E COM ALIMENTAÇÃO',
    value: 'PACOTE 6 - HOSPEDAGEM FAMILIA EM SALA INDIVIDUAL',
  },
  {
    label: 'PACOTE 7 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL COM ÔNIBUS E SEM ALIMENTAÇÃO',
    value: 'PACOTE 7 - HOSPEDAGEM FAMILIA EM SALA INDIVIDUAL',
  },
  {
    label: 'PACOTE 8 - HOSPEDAGEM FAMÍLIA EM SALA INDIVIDUAL SEM ÔNIBUS E SEM ALIMENTAÇÃO',
    value: 'PACOTE 8 - HOSPEDAGEM FAMILIA EM SALA INDIVIDUAL',
  },
  {
    label: 'PACOTE 9 - HOSPEDAGEM INDIVIDUAL OU FAMÍLIA EM BARRACAS (CAMPING) SEM ÔNIBUS E COM ALIMENTAÇÃO',
    value: 'PACOTE 9 - HOSPEDAGEM INDIVIDUAL OU FAMILIA EM BARRACAS (CAMPING)',
  },
  {
    label: 'PACOTE 10 - HOSPEDAGEM INDIVIDUAL OU FAMÍLIA EM BARRACAS (CAMPING) SEM ÔNIBUS E SEM ALIMENTAÇÃO',
    value: 'PACOTE 10 - HOSPEDAGEM INDIVIDUAL OU FAMILIA EM BARRACAS (CAMPING)',
  },
  {
    label: 'PACOTE 11 - HOSPEDAGEM INDIVIDUAL COM ÔNIBUS E COM ALIMENTAÇÃO',
    value: 'PACOTE 11 - HOSPEDAGEM INDIVIDUAL',
  },
  {
    label: 'PACOTE 12 - HOSPEDAGEM INDIVIDUAL SEM ÔNIBUS E COM ALIMENTAÇÃO',
    value: 'PACOTE 12 - HOSPEDAGEM INDIVIDUAL',
  },
  { label: 'PACOTE 13 - HOSPEDAGEM EXTERNA COM ÔNIBUS E COM ALIMENTAÇÃO', value: 'PACOTE 13 - HOSPEDAGEM EXTERNA' },
  { label: 'PACOTE 14 - HOSPEDAGEM EXTERNA SEM ÔNIBUS E COM ALIMENTAÇÃO', value: 'PACOTE 14 - HOSPEDAGEM EXTERNA' },
  { label: 'PACOTE 15 - ASSISTIR O CULTO SEM ÔNIBUS E SEM ALIMENTAÇÃO', value: 'PACOTE 15 - ASSISTIR O CULTO' },
];

export const rgShipper = [
  { value: 'SDS', label: 'SDS - Secretaria de Defesa Social' },
  { value: 'SSP', label: 'SSP - Secretaria de Segurança Pública' },
  { value: 'SSPDS', label: 'SSPDS - Secretaria de Segurança Pública e Defesa Social' },
  { value: 'SEDS', label: 'SEDS - Secretaria de Estado de Defesa Social' },
  { value: 'DPF', label: 'DPF - Departamento de Polícia Federal' },
  { value: 'SSPC', label: 'SSPC - Secretaria de Segurança Pública e Cidadania' },
  { value: 'SSPT', label: 'SSPT - Secretaria de Segurança Pública e Trânsito' },
  { value: 'DETRAN', label: 'DETRAN - Departamento Estadual de Trânsito' },
  { value: 'SSJ', label: 'SSJ - Secretaria de Segurança e Justiça' },
  { value: 'SSPPS', label: 'SSPPS - Secretaria de Segurança Pública e Polícia Social' },
  { value: 'SESP', label: 'SESP - Secretaria de Estado de Segurança Pública' },
  { value: 'MEX', label: 'MEX - Ministério do Exército' },
  { value: 'MAE', label: 'MAE - Ministério da Aeronáutica' },
  { value: 'MMA', label: 'MMA - Ministério da Marinha' },
  { value: 'Outro', label: 'Outro' },
];

export const issuingState = [
  { value: 'AC', label: 'AC' },
  { value: 'AL', label: 'AL' },
  { value: 'AP', label: 'AP' },
  { value: 'AM', label: 'AM' },
  { value: 'BA', label: 'BA' },
  { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' },
  { value: 'ES', label: 'ES' },
  { value: 'GO', label: 'GO' },
  { value: 'MA', label: 'MA' },
  { value: 'MT', label: 'MT' },
  { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' },
  { value: 'PA', label: 'PA' },
  { value: 'PB', label: 'PB' },
  { value: 'PR', label: 'PR' },
  { value: 'PE', label: 'PE' },
  { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' },
  { value: 'RN', label: 'RN' },
  { value: 'RS', label: 'RS' },
  { value: 'RO', label: 'RO' },
  { value: 'RR', label: 'RR' },
  { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' },
  { value: 'SE', label: 'SE' },
  { value: 'TO', label: 'TO' },
];

export const food = [
  { value: 'Café da manhã, almoço e jantar', label: 'Café da manhã, almoço e jantar' },
  { value: 'Almoço e jantar', label: 'Almoço e jantar' },
  { value: 'Sem Alimentação', label: 'Sem Alimentação' },
];
