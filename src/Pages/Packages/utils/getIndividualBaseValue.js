const getIndividualBaseValue = (age) => {
  if (age <= 8) return 0;
  if (age <= 14) return 80;
  return 160;
};

export default getIndividualBaseValue;
