function calculateAge(date) {
  const eventDate = new Date('2026-02-14');
  const birthDate = new Date(date);

  let age = eventDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = eventDate.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && eventDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

export default calculateAge;
