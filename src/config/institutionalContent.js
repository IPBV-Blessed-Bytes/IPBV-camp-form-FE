export const HIGHLIGHT_ICON_OPTIONS = [
  'bible',
  'family',
  'tent',
  'camp',
  'music',
  'food',
  'bus',
  'location-pin',
  'calendar',
  'megaphone',
  'person',
  'couple',
  'checked',
  'info',
];

export const GALLERY_TONES = ['a', 'b', 'c', 'd', 'e', 'f'];

export const DEFAULT_INSTITUTIONAL_COLOR = '#007185';

export const INSTITUTIONAL_TEMPLATES = [
  { id: 'template-1', label: 'Clássico', description: 'Layout padrão (o atual): hero em degradê, cards e seções centralizadas.' },
  { id: 'template-2', label: 'Minimalista', description: 'Clean e arejado: hero claro, tipografia grande, cards planos com borda fina.' },
  { id: 'template-3', label: 'Escuro', description: 'Hero escuro de alto contraste, seções em faixa e destaques na cor do evento.' },
  { id: 'template-4', label: 'Editorial', description: 'Colunas estreitas, alinhamento à esquerda e ar de revista.' },
  { id: 'template-5', label: 'Vibrante', description: 'Bem colorido: acento forte, cantos arredondados e cards cheios.' },
];

export const DEFAULT_INSTITUTIONAL_CONTENT = {
  brand: 'Nome do seu evento',
  template: 'template-1',
  color: DEFAULT_INSTITUTIONAL_COLOR,
  showVisits: false,
  hero: {
    tagline: 'Subtítulo curto do evento',
    title: 'Título do seu evento vai aqui',
    subtitle:
      'Descreva seu evento em uma ou duas frases. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
    dateLabel: 'Data do evento',
    locationLabel: 'Local do evento',
    backgroundImageId: null,
  },
  stats: [
    { value: '000', label: 'Participantes' },
    { value: '0 dias', label: 'De programação' },
    { value: '1ª', label: 'Edição' },
  ],
  about: {
    title: 'Sobre o evento',
    text: 'Fale aqui sobre o seu evento: o propósito, para quem é e o que os participantes podem esperar. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    highlights: [
      { icon: 'bible', title: 'Destaque 1', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { icon: 'family', title: 'Destaque 2', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { icon: 'tent', title: 'Destaque 3', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    ],
  },
  schedule: {
    title: 'Programação',
    subtitle: 'Monte aqui a programação do seu evento.',
    days: [
      {
        day: 'Dia 1',
        items: [
          { time: '00h', title: 'Atividade' },
          { time: '00h', title: 'Atividade' },
          { time: '00h', title: 'Atividade' },
        ],
      },
      {
        day: 'Dia 2',
        items: [
          { time: '00h', title: 'Atividade' },
          { time: '00h', title: 'Atividade' },
          { time: '00h', title: 'Atividade' },
        ],
      },
      {
        day: 'Dia 3',
        items: [
          { time: '00h', title: 'Atividade' },
          { time: '00h', title: 'Atividade' },
        ],
      },
    ],
  },
  team: {
    title: 'Equipe',
    subtitle: 'Apresente a equipe do seu evento.',
    members: [
      { name: 'Nome da pessoa', role: 'Função', imageId: null },
      { name: 'Nome da pessoa', role: 'Função', imageId: null },
      { name: 'Nome da pessoa', role: 'Função', imageId: null },
      { name: 'Nome da pessoa', role: 'Função', imageId: null },
    ],
  },
  speakers: {
    title: 'Palestrantes',
    subtitle: 'Quem vai participar do seu evento.',
    members: [
      { name: 'Nome do palestrante', role: 'Tema da palestra', imageId: null },
    ],
  },
  gallery: {
    title: 'Galeria',
    subtitle: 'Adicione fotos do seu evento.',
    photos: [
      { imageId: null, label: 'Foto 1' },
      { imageId: null, label: 'Foto 2' },
      { imageId: null, label: 'Foto 3' },
      { imageId: null, label: 'Foto 4' },
      { imageId: null, label: 'Foto 5' },
      { imageId: null, label: 'Foto 6' },
    ],
  },
  notices: {
    title: 'Avisos importantes',
    items: [
      { title: 'Aviso 1', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { title: 'Aviso 2', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
      { title: 'Aviso 3', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    ],
  },
  partners: {
    title: 'Parceiros',
    subtitle: '',
    logos: [],
  },
};

export const INSTITUTIONAL_NAV = [
  { id: 'sobre' },
  { id: 'programacao' },
  { id: 'palestrantes' },
  { id: 'equipe' },
  { id: 'galeria' },
  { id: 'avisos' },
  { id: 'parceiros' },
  { id: 'como-chegar' },
  { id: 'contato' },
];
