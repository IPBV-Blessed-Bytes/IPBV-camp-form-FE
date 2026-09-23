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
  brand: 'Acampamento IPBV',
  template: 'template-1',
  color: DEFAULT_INSTITUTIONAL_COLOR,
  showVisits: false,
  hero: {
    tagline: 'Retiro de Verão 2027',
    title: 'Um final de semana para renovar a fé, criar laços e descansar em Deus.',
    subtitle:
      'Três dias de louvor, palavra, comunhão e muita alegria. Vagas limitadas — garanta a sua e traga a família.',
    dateLabel: '13 a 15 de fevereiro de 2027',
    locationLabel: 'Sítio Água Viva · Gravatá, PE',
    backgroundImageId: null,
  },
  stats: [
    { value: '+500', label: 'Campistas por edição' },
    { value: '3 dias', label: 'De programação intensa' },
    { value: '12ª', label: 'Edição do acampamento' },
  ],
  about: {
    title: 'Sobre o acampamento',
    text: 'O Acampamento IPBV é o momento mais esperado do ano pela nossa comunidade. Reunimos famílias, jovens e crianças em um ambiente seguro e acolhedor para adorar, ouvir a Palavra e fortalecer amizades. Cada edição é preparada com carinho por uma equipe de voluntários dedicados a proporcionar dias inesquecíveis.',
    highlights: [
      { icon: 'bible', title: 'Palavra e louvor', text: 'Ministrações profundas e momentos de adoração para todas as idades.' },
      { icon: 'family', title: 'Para a família toda', text: 'Programação pensada para adultos, jovens e crianças, cada um no seu espaço.' },
      { icon: 'tent', title: 'Estrutura completa', text: 'Hospedagem, alimentação e áreas de lazer num só lugar, com conforto e segurança.' },
    ],
  },
  schedule: {
    title: 'Programação',
    subtitle: 'Uma prévia do que te espera nesses três dias.',
    days: [
      {
        day: 'Sexta-feira',
        items: [
          { time: '18h', title: 'Chegada e check-in' },
          { time: '20h', title: 'Jantar de boas-vindas' },
          { time: '21h', title: 'Culto de abertura' },
        ],
      },
      {
        day: 'Sábado',
        items: [
          { time: '08h', title: 'Café e devocional' },
          { time: '10h', title: 'Preleção + dinâmicas' },
          { time: '15h', title: 'Recreação e esportes' },
          { time: '20h', title: 'Noite de louvor' },
        ],
      },
      {
        day: 'Domingo',
        items: [
          { time: '09h', title: 'Culto de encerramento' },
          { time: '12h', title: 'Almoço e despedida' },
        ],
      },
    ],
  },
  team: {
    title: 'Quem faz acontecer',
    subtitle: 'Uma equipe de voluntários apaixonados pelo Reino.',
    members: [
      { name: 'Pr. João Silva', role: 'Coordenação geral', imageId: null },
      { name: 'Ana Costa', role: 'Ministério de louvor', imageId: null },
      { name: 'Marcos Lima', role: 'Recreação e esportes', imageId: null },
      { name: 'Beatriz Souza', role: 'Ministério infantil', imageId: null },
    ],
  },
  gallery: {
    title: 'Momentos que ficam',
    subtitle: 'Um pouco das edições anteriores.',
    photos: [
      { imageId: null, label: 'Louvor' },
      { imageId: null, label: 'Comunhão' },
      { imageId: null, label: 'Recreação' },
      { imageId: null, label: 'Palavra' },
      { imageId: null, label: 'Fogueira' },
      { imageId: null, label: 'Família' },
    ],
  },
  notices: {
    title: 'Avisos importantes',
    items: [
      { title: 'Vagas limitadas', text: 'As inscrições encerram assim que as vagas se esgotarem — não deixe para a última hora.' },
      { title: 'Descontos por idade', text: 'Crianças e adolescentes têm valores diferenciados, aplicados automaticamente na inscrição.' },
      { title: 'Parcelamento', text: 'Você pode pagar em boletos mensais ou no cartão. Simule as taxas na hora da inscrição.' },
    ],
  },
  partners: {
    title: 'Parceiros',
    subtitle: '',
    logos: [],
  },
};

export const INSTITUTIONAL_NAV = [
  { id: 'sobre', label: 'Sobre' },
  { id: 'programacao', label: 'Programação' },
  { id: 'equipe', label: 'Equipe' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'avisos', label: 'Avisos' },
  { id: 'parceiros', label: 'Parceiros' },
  { id: 'como-chegar', label: 'Como chegar' },
];
