const getIndividualBaseValue = (age) => {
  if (age <= 8) return 0;
  if (age <= 14) return 100;
  return 200;
};

export default getIndividualBaseValue;
