const getIndividualBaseValue = (age) => {
  if (age <= 6) return 0;
  if (age <= 12) return 100;
  return 200;
};

export default getIndividualBaseValue;
