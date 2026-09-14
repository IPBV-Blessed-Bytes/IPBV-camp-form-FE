const yesNo = (value) => (value ? 'Sim' : 'Não');

// Campos comparados no diff (mesma ordem do formulário do cliente).
export const PERSONAL_FIELDS = [
  { key: 'name', label: 'Nome' },
  { key: 'birthday', label: 'Data de Nascimento' },
  { key: 'cpf', label: 'CPF' },
  { key: 'rg', label: 'RG' },
  { key: 'rgShipper', label: 'Órgão Expedidor RG' },
  { key: 'rgShipperState', label: 'Estado de emissão' },
  { key: 'gender', label: 'Categoria' },
  { key: 'legalGuardianName', label: 'Nome do responsável' },
  { key: 'legalGuardianCpf', label: 'CPF do responsável' },
  { key: 'legalGuardianCellPhone', label: 'Celular do responsável' },
];

export const CONTACT_FIELDS = [
  { key: 'cellPhone', label: 'Celular' },
  { key: 'email', label: 'E-mail' },
  { key: 'church', label: 'Igreja' },
  { key: 'aggregate', label: 'Agregados' },
  { key: 'allergy', label: 'Alergia' },
  { key: 'car', label: 'Tem vaga de carona', bool: true },
  { key: 'numberVacancies', label: 'Vagas de carona' },
  { key: 'needRide', label: 'Precisa de carona', bool: true },
  { key: 'rideObservation', label: 'Observação da carona' },
];

const diffSection = (current, proposed, section, fields) => {
  const cur = current?.[section] || {};
  const next = proposed?.[section] || {};
  return fields
    .map(({ key, label, bool }) => {
      const before = cur[key];
      const after = next[key];
      const changed = bool
        ? Boolean(before) !== Boolean(after)
        : String(before ?? '') !== String(after ?? '');
      if (!changed) return null;
      return {
        label,
        before: bool ? yesNo(before) : (before ?? ''),
        after: bool ? yesNo(after) : (after ?? ''),
      };
    })
    .filter(Boolean);
};

// Retorna somente os campos que realmente mudaram (payload vs estado atual).
export const buildChangeDiff = (request) => [
  ...diffSection(request?.current, request?.payload, 'personalInformation', PERSONAL_FIELDS),
  ...diffSection(request?.current, request?.payload, 'contact', CONTACT_FIELDS),
];
