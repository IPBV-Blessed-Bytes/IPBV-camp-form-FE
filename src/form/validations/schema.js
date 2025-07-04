import * as yup from 'yup';

const personalInformationSchema = yup.object().shape({
  name: yup.string().required('Informe o seu nome'),
  birthday: yup.date().required('Informe a sua data de nascimento'),
  legalGuardianName: yup.string().required('Informe o nome do responsável legal'),
  legalGuardianCpf: yup.string().min(11, 'Informe um CPF válido. Mínimo 11 dígitos').required('Informe o cpf do responsável legal'),
  legalGuardianCellPhone: yup.string().min(10, 'Informe um número de telefone válido').required('Informe o telefone do responsável legal'),
  rg: yup.string().min(6, 'Informe um RG válido. Mínimo 6 dígitos').required('Informe o seu rg'),
  cpf: yup.string().min(11, 'Informe um CPF válido. Mínimo 11 dígitos').required('Informe o seu cpf'),
  rgShipper: yup.string().required('Selecione o órgão expedidor do seu RG'),
  rgShipperState: yup.string().required('Selecione a UF do órgão expedidor'),
  gender: yup.string().required('Selecione um gênero'),
});

const additionalInformationSchema = yup.object().shape({
  email: yup.string().email('Informe um e-mail válido').required('Informe o seu e-mail'),
  cellPhone: yup.string().min(10, 'Informe um número de telefone válido').required('Informe o seu número de telefone'),
  isWhatsApp: yup.boolean().required('Informe se o número é whatsapp ou não'),
  church: yup.string().required('Informe sua igreja'),
  car: yup.boolean().required('Informe se vai de carro e possui vagas de carona'),
  numberVacancies: yup.string().when('car', {
    is: true,
    then: () => yup.string().required('Informe quantas vagas de carona há'),
    otherwise: () => yup.string().nullable(),
  }),
  needRide: yup.string().when('car', {
    is: false,
    then: () => yup.string().required('Informe se precisa de carona'),
    otherwise: () => yup.string().nullable(),
  }),
  hasAllergy: yup.boolean().required('Informe se você tem alergia'),
  allergy: yup.string().when('hasAllergy', {
    is: true,
    then: () => yup.string().required('Informe mais sobre a sua alergia'),
    otherwise: () => yup.string().nullable(),
  }),
  hasAggregate: yup.boolean().required('Informe se você tem algum acompanhante'),
  aggregate: yup.string().when('hasAggregate', {
    is: true,
    then: () => yup.string().required('Informe quais são seus acompanhantes (esposo, esposa, filhos, etc)'),
    otherwise: () => yup.string().nullable(),
  }),
});

const ExtraMealsSchema = yup.object().shape({
  someFood: yup.string().required('Informe se deseja adquirir alguma refeição'),
});

const formPaymentSchema = yup.object().shape({
  formPayment: yup.string().required('Selecione o tipo de pagamento'),
});

const cpfReviewSchema = yup.object().shape({
  cpf: yup.string().min(11, 'Informe um CPF válido. Mínimo 11 dígitos').required('Informe o seu cpf'),
  birthday: yup.date().required('Informe sua data de nascimento'),
});

const formFeedbackSchema = yup.object().shape({
  organization: yup.string().required('Selecione uma opção'),
  experience: yup.string().required('Selecione uma opção'),
  meals: yup.string().required('Selecione uma opção'),
  schedule: yup.string().required('Selecione uma opção'),
  structure: yup.string().required('Selecione uma opção'),
  reception: yup.string().required('Selecione uma opção'),
  probability: yup.string().required('Selecione uma opção'),
});

export {
  personalInformationSchema,
  additionalInformationSchema,
  ExtraMealsSchema,
  formPaymentSchema,
  cpfReviewSchema,
  formFeedbackSchema,
};
