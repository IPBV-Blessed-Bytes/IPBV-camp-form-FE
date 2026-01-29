export const enumSteps = {
  home: 0,
  personalData: 1,
  contact: 2,
  packages: 3,
  finalReview: 4,
  beforePayment: 5,
  formPayment: 6,
  success: 7,
};

export const initialValues = [
  {
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
        price: '',
      },
      accomodationName: '',
      transportation: {
        id: '',
        price: '',
      },
      transportationName: '',
      food: {
        id: '',
        price: '',
      },
      foodName: '',
      price: '',
      finalPrice: '',
    },
    extraMeals: {
      someFood: '',
      totalPrice: '',
      extraMeals: [''],
    },
    formPayment: '',
  },
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
  {
    value: 'Alimentação Completa (Café da manhã, Almoço e Jantar)',
    label: 'Alimentação Completa (Café da manhã, Almoço e Jantar)',
  },
  { value: 'Sem Alimentação', label: 'Sem Alimentação' },
];

export const mealOptions = [
  { day: 'Sábado', name: 'Sábado - almoço', price: 26, checkboxMargin: '' },
  { day: 'Sábado', name: 'Sábado - jantar', price: 26, checkboxMargin: '' },
  { day: 'Domingo', name: 'Domingo - café da manhã', price: 23, checkboxMargin: 'mb-2' },
  { day: 'Domingo', name: 'Domingo - almoço', price: 26, checkboxMargin: 'mb-2' },
  { day: 'Domingo', name: 'Domingo - jantar', price: 26, checkboxMargin: '' },
  { day: 'Segunda', name: 'Segunda - café da manhã', price: 23, checkboxMargin: 'mb-2' },
  { day: 'Segunda', name: 'Segunda - almoço', price: 26, checkboxMargin: 'mb-2' },
  { day: 'Segunda', name: 'Segunda - jantar', price: 26, checkboxMargin: '' },
  { day: 'Terça', name: 'Terça - café da manhã', price: 23, checkboxMargin: 'mb-2' },
  { day: 'Terça', name: 'Terça - almoço', price: 26, checkboxMargin: 'mb-2' },
  { day: 'Terça', name: 'Terça - jantar', price: 26, checkboxMargin: '' },
  { day: 'Quarta', name: 'Quarta - café da manhã', price: 23, checkboxMargin: '' },
];

export const TABLE_HEADERS = [
  'ID',
  'Nome',
  'Organização',
  'Experiência',
  'Alimentação',
  'Programação',
  'Estrutura Física',
  'Acolhimento',
  'Probabilidade de Volta',
  'Campo Aberto',
];

export const MAX_SIZE_CAMPERS = 1000;

export const FOOD_NAME_OPTIONS = [
  { label: 'Com Alimentação', value: 'Alimentação Completa' },
  { label: 'Sem Alimentação', value: 'Sem Alimentação' },
];

export const CREW_OPTIONS = [
  { value: 'Logística', label: 'Logística' },
  { value: 'Credenciamento', label: 'Credenciamento' },
  { value: 'Programação', label: 'Programação' },
  { value: 'Cozinha', label: 'Cozinha' },
  { value: 'Cantina', label: 'Cantina' },
  { value: 'Sistema', label: 'Sistema' },
  { value: 'Financeiro', label: 'Financeiro' },
  { value: 'Mídia', label: 'Mídia' },
  { value: 'Departamento Infantil', label: 'Departamento Infantil' },
  { value: '', label: 'Nenhum' },
];
