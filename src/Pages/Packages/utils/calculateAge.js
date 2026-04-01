import fetcher from '@/fetchers/fetcherWithCredentials';

let baseDate = null;
let isLoading = false;

export const getBaseDate = () => baseDate;

const parseBRDate = (dateString) => {
  if (!dateString) return null;
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day);
};

export const initBaseDate = async () => {
  try {
    if (baseDate || isLoading) return;

    isLoading = true;

    const response = await fetcher.get('/base-date');
    const baseDateString = response.data.baseDate;

    baseDate = parseBRDate(baseDateString);
  } catch (error) {
    console.error('Erro ao buscar baseDate:', error);
    baseDate = null;
  } finally {
    isLoading = false;
  }
};

export function calculateAge(date) {
  if (!baseDate) return 0;
  const eventDate = baseDate;
  const birthDate = typeof date === 'string' ? parseBRDate(date) : new Date(date);

  if (!birthDate || isNaN(birthDate)) return 0;

  let age = eventDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = eventDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && eventDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export default calculateAge;
