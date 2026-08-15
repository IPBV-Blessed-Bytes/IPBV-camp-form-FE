// Fixed identity fields required by the payment (PagarMe) flow.
// Auto-injected as the first section of payment-enabled events.
export const IDENTITY_FIELDS = [
  { id: '__identity_nome', key: 'nome', label: 'Nome completo', type: 'text', required: true },
  { id: '__identity_cpf', key: 'cpf', label: 'CPF', type: 'text', required: true, placeholder: '000.000.000-00' },
  { id: '__identity_email', key: 'email', label: 'E-mail', type: 'email', required: true },
];

export const IDENTITY_SECTION_ID = '__identity';

export const buildIdentitySection = () => ({
  id: IDENTITY_SECTION_ID,
  name: 'Identificação',
  fields: IDENTITY_FIELDS,
});
