import * as yup from 'yup';

const personalInformationSchema = yup.object().shape({
  name: yup.string().required('Favor, informe o seu nome!'),
  birthDay: yup.date().required('Favor, informe a sua data de nascimento'),
  rg: yup.number().integer().min(9, 'Informe corretamente o seu rg. Lembre-se ele tem 9 dígitos'),
  cpf: yup.number().integer().min(11, 'Informe corretamente o seu cpf. Lembre-se ele tem 11 dígitos'),
  rgAgency: yup.string().required('Favor, selecione o seu órgão expedidor'),
  rgAgencyState: yup.string().required('Favor, selecione a UF do órgão expedidor'),
});

const additionalInformationSchema = yup.object().shape({
  email: yup.string().email('Informe um e-mail válido').required('Informe o seu e-mail'),
  cellPhone: yup
    .string()
    .min(9, 'Informe corretamente o seu número de telefone')
    .required('Favor, nos informe o seu número de telefone'),
  isWhatsApp: yup.string().required('Favor, nos informe se o número é whatsapp ou não'),
  hasAllergy: yup.string().required('Favor, nos informe se você tem alergia'),
  allergy: yup.string().when('hasAllergy', {
    is: 'sim',
    then: yup.string().required('Favor, nos informe mais sobre a sua alergia'),
    otherwise: yup.string().nullable(),
  }),
});

const packageSchema = yup.object().shape({
  package: yup.string().required('Favor, informe o pacote escolhido'),
});

export { personalInformationSchema, additionalInformationSchema, packageSchema };
