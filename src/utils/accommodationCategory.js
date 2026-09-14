// Mapeia o nome da hospedagem (com todas as variações) para a categoria ampla
// usada na pulseira de hospedagem: Colégio, Seminário ou Externo.
const normalize = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ç/g, 'c')
    .trim();

export const HOSTING_CATEGORIES = ['Colégio', 'Seminário', 'Externo'];

export const accommodationCategory = (accomodationName = '') => {
  const normalized = normalize(accomodationName);
  if (normalized.startsWith('colegio')) return 'Colégio';
  if (normalized.startsWith('seminario')) return 'Seminário';
  if (normalized.startsWith('externo')) return 'Externo';
  return '';
};
