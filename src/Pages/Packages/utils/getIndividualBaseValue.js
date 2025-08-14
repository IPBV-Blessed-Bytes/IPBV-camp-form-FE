const getIndividualBaseValue = (age) => {
  if (age <= 5) return 0;
  if (age <= 10) return 50;
  return 100;
};

export default getIndividualBaseValue;
