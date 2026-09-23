const personalDataSection = {
  name: 'Dados Pessoais',
  fields: [
    { key: 'nome_completo', label: 'Nome completo', type: 'text', required: true },
    { key: 'cpf', label: 'CPF', type: 'cpf', required: true },
    { key: 'data_nascimento', label: 'Data de nascimento', type: 'date', required: true },
    {
      key: 'sexo',
      label: 'Sexo',
      type: 'select',
      required: true,
      options: [
        { label: 'Masculino', value: 'masculino' },
        { label: 'Feminino', value: 'feminino' },
      ],
    },
    { key: 'telefone', label: 'Telefone / WhatsApp', type: 'phone', required: true },
    { key: 'email', label: 'E-mail', type: 'email', required: true },
    { key: 'igreja', label: 'Igreja / Congregação', type: 'text', required: true },
  ],
};

const guardianSection = {
  name: 'Responsável (menores de idade)',
  fields: [
    { key: 'responsavel_nome', label: 'Nome do responsável legal', type: 'text', required: false },
    { key: 'responsavel_cpf', label: 'CPF do responsável', type: 'cpf', required: false },
    { key: 'responsavel_telefone', label: 'Telefone do responsável', type: 'phone', required: false },
    {
      key: 'documento_menor',
      label: 'Documento do menor (certidão / autorização)',
      type: 'file',
      required: false,
      helpText: 'Envie a certidão de nascimento ou a autorização assinada. Baixe o modelo, se disponível.',
    },
  ],
};

const consentSection = {
  name: 'Consentimento',
  fields: [
    {
      key: 'consentimento_lgpd',
      label: 'Consentimento LGPD',
      type: 'consent',
      required: true,
      config: { text: 'Li e aceito os termos de uso e a política de privacidade.', link: null },
    },
    {
      key: 'consentimento_imagem',
      label: 'Autorização de imagem',
      type: 'consent',
      required: false,
      config: { text: 'Autorizo o uso da minha imagem em fotos e vídeos do evento.', link: null },
    },
  ],
};

const packageModule = { name: 'Pacote', moduleType: 'package', fields: [] };
const rideModule = { name: 'Carona', moduleType: 'ride', fields: [] };

export const EVENT_TEMPLATES = [
  {
    key: 'acampamento',
    label: 'Acampamento',
    description: 'Dados pessoais, responsável, pacote (hospedagem/alimentação), carona e saúde.',
    sections: [
      personalDataSection,
      guardianSection,
      {
        name: 'Informações do Acampamento',
        fields: [
          { key: 'restricao_alimentar', label: 'Restrição alimentar', type: 'textarea', required: false },
          {
            key: 'saude_medicacao',
            label: 'Condição de saúde / medicação de uso contínuo',
            type: 'textarea',
            required: false,
          },
          {
            key: 'tamanho_camiseta',
            label: 'Tamanho de camiseta',
            type: 'select',
            required: false,
            options: ['PP', 'P', 'M', 'G', 'GG', 'XG'].map((size) => ({ label: size, value: size.toLowerCase() })),
          },
          { key: 'acompanhantes_quarto', label: 'Acompanhantes de quarto', type: 'textarea', required: false },
        ],
      },
      packageModule,
      rideModule,
      consentSection,
    ],
  },
  {
    key: 'congresso',
    label: 'Congresso',
    description: 'Dados pessoais, responsável, pacote de inscrição e informações ministeriais.',
    sections: [
      personalDataSection,
      guardianSection,
      {
        name: 'Informações do Congresso',
        fields: [
          { key: 'instituicao', label: 'Instituição / Igreja que representa', type: 'text', required: false },
          {
            key: 'cargo_ministerial',
            label: 'Cargo / função ministerial',
            type: 'select',
            required: false,
            options: ['Membro', 'Líder', 'Diácono', 'Presbítero', 'Pastor', 'Outro'].map((role) => ({
              label: role,
              value: role.toLowerCase(),
            })),
          },
          { key: 'acessibilidade', label: 'Necessidades de acessibilidade', type: 'textarea', required: false },
          { key: 'emergencia_nome', label: 'Contato de emergência (nome)', type: 'text', required: false },
          { key: 'emergencia_telefone', label: 'Contato de emergência (telefone)', type: 'phone', required: false },
        ],
      },
      packageModule,
      consentSection,
    ],
  },
  {
    key: 'retiro',
    label: 'Retiro',
    description: 'Dados pessoais, responsável, pacote (hospedagem/alimentação), transporte e saúde.',
    sections: [
      personalDataSection,
      guardianSection,
      {
        name: 'Informações do Retiro',
        fields: [
          { key: 'restricao_alimentar', label: 'Restrição alimentar', type: 'textarea', required: false },
          {
            key: 'saude_medicacao',
            label: 'Condição de saúde / medicação',
            type: 'textarea',
            required: false,
          },
          { key: 'emergencia_nome', label: 'Contato de emergência (nome)', type: 'text', required: false },
          { key: 'emergencia_telefone', label: 'Contato de emergência (telefone)', type: 'phone', required: false },
          {
            key: 'precisa_transporte',
            label: 'Precisa de transporte?',
            type: 'radio',
            required: false,
            options: [
              { label: 'Sim', value: 'sim' },
              { label: 'Não', value: 'nao' },
            ],
          },
          { key: 'observacoes', label: 'Observações', type: 'textarea', required: false },
        ],
      },
      packageModule,
      consentSection,
    ],
  },
];
