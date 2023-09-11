import * as yup from 'yup';

const personalInformationSchema = yup.object().shape({
  name: yup.string().required('Favor, informe o seu nome!'),
  birthday: yup.date().required('Favor, informe a sua data de nascimento'),
  rg: yup
    .string()
    .min(7, 'Informe corretamente o seu rg. Lembre-se ele tem 7 dígitos')
    .required('Favor, informe o seu rg'),
  cpf: yup
    .string()
    .min(11, 'Informe corretamente o seu cpf. Lembre-se ele tem 11 dígitos')
    .required('Favor, informe o seu cpf'),
  rgShipper: yup.string().required('Favor, selecione o seu órgão expedidor'),
  rgShipperState: yup.string().required('Favor, selecione a UF do órgão expedidor'),
});

const additionalInformationSchema = yup.object().shape({
  email: yup.string().email('Informe um e-mail válido').required('Informe o seu e-mail'),
  cellPhone: yup
    .string()
    .min(10, 'Informe corretamente o seu número de telefone')
    .required('Favor, nos informe o seu número de telefone'),
  isWhatsApp: yup.boolean().required('Favor, nos informe se o número é whatsapp ou não'),
  hasAllergy: yup.boolean().required('Favor, nos informe se você tem alergia'),
  allergy: yup.string().when('hasAllergy', {
    is: true,
    then: () => yup.string().required('Favor, nos informe mais sobre a sua alergia'),
    otherwise: () => yup.string().nullable(),
  }),
  hasAggregate: yup.boolean().required('Favor, nos informe se você tem algum agregado'),
  aggregate: yup.string().when('hasAgregate', {
    is: true,
    then: () => yup.string().required('Favor, nos informe quais são seus agregados (esposo, esposa, filhos, etc)'),
    otherwise: () => yup.string().nullable(),
  }),
});

const formPaymentSchema = yup.object().shape({
  formPayment: yup.string().required('Favor, selecione o tipo de pagamento'),
});

export { personalInformationSchema, additionalInformationSchema, formPaymentSchema };
