import * as yup from 'yup';

const REQUIRED_MESSAGE = 'Campo obrigatório';

const ruleForField = (field) => {
  const { type, required } = field;

  switch (type) {
    case 'consent':
      return required
        ? yup.boolean().oneOf([true], 'É necessário aceitar para continuar')
        : yup.boolean().nullable();

    case 'checkbox':
      return required ? yup.array().min(1, REQUIRED_MESSAGE) : yup.array().nullable();

    case 'number':
      return required
        ? yup.string().required(REQUIRED_MESSAGE).matches(/^-?\d+(\.\d+)?$/, 'Informe um número válido')
        : yup.string().nullable().matches(/^-?\d+(\.\d+)?$/, { message: 'Informe um número válido', excludeEmptyString: true });

    case 'email':
      return required
        ? yup.string().required(REQUIRED_MESSAGE).email('Informe um e-mail válido')
        : yup.string().nullable().email('Informe um e-mail válido');

    case 'cpf': {
      const isValidCpf = (value) => !value || String(value).replace(/\D/g, '').length === 11;
      return required
        ? yup.string().required(REQUIRED_MESSAGE).test('cpf', 'Informe um CPF válido (11 dígitos)', isValidCpf)
        : yup.string().nullable().test('cpf', 'Informe um CPF válido (11 dígitos)', isValidCpf);
    }

    default:
      return required ? yup.string().required(REQUIRED_MESSAGE) : yup.string().nullable();
  }
};

export const buildValidationSchema = (fields = []) =>
  yup.object().shape(fields.reduce((acc, field) => ({ ...acc, [field.key]: ruleForField(field) }), {}));

export const initialAnswers = (fields = []) =>
  fields.reduce((acc, field) => {
    if (field.type === 'checkbox') acc[field.key] = [];
    else if (field.type === 'consent') acc[field.key] = false;
    else acc[field.key] = '';
    return acc;
  }, {});
