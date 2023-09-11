import * as yup from 'yup';

const personalInformationSchema = yup.object().shape({
  name: yup.string().required('Informe o seu nome'),
  birthday: yup.date().required('Informe a sua data de nascimento'),
  rg: yup
    .string()
    .min(7, 'Informe um RG válido. Mínimo 7 dígitos')
    .required('Informe o seu rg'),
  cpf: yup
    .string()
    .min(11, 'Informe um CPF válido. Mínimo 11 dígitos')
    .required('Informe o seu cpf'),
  rgShipper: yup.string().required('Selecione o órgão expedidor do seu RG'),
  rgShipperState: yup.string().required('Selecione a UF do órgão expedidor'),
});

const additionalInformationSchema = yup.object().shape({
  email: yup.string().email('Informe um e-mail válido').required('Informe o seu e-mail'),
  cellPhone: yup
    .string()
    .min(10, 'Informe um número de telefone válido')
    .required('Informe o seu número de telefone'),
  isWhatsApp: yup.boolean().required('Informe se o número é whatsapp ou não'),
  hasAllergy: yup.boolean().required('Informe se você tem alergia'),
  allergy: yup.string().when('hasAllergy', {
    is: true,
    then: () => yup.string().required('Informe mais sobre a sua alergia'),
    otherwise: () => yup.string().nullable(),
  }),
  hasAggregate: yup.boolean().required('Informe se você tem algum agregado'),
  aggregate: yup.string().when('hasAggregate', {
    is: true,
    then: () => yup.string().required('Informe quais são seus agregados (esposo, esposa, filhos, etc)'),
    otherwise: () => yup.string().nullable(),
  }),
});

const formPaymentSchema = yup.object().shape({
  formPayment: yup.string().required('Selecione o tipo de pagamento'),
});

export { personalInformationSchema, additionalInformationSchema, formPaymentSchema };
