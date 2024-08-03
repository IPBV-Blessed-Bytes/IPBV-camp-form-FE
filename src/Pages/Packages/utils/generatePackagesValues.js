const packageSchool = ({ age, withTransportation }) => {
  const accomodation = [0];
  let food = [300];
  let transportation = withTransportation ? [190] : [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';

  //Alimentação
  if (age <= 6) {
    food = [300, 0];
    foodDiscountDescription = 'Criança até 6 anos não paga alimentação';
  } else if (age >= 7 && age <= 12) {
    food = [300, 150];
    foodDiscountDescription = 'Criança de 7 a 12 anos paga apenas 50% na alimentação';
  }

  //Transporte
  if (age <= 6) {
    transportation = withTransportation ? [190, 0] : [0];
    transportationDiscountDescription = 'Criança até 6 anos não paga transporte *(no colo dos pais)';
  } else if (age >= 7 && age <= 12) {
    transportation = withTransportation ? [190] : [0];
  }

  const foodValue = food.length > 1 ? food[1] : food[0];
  const transportationValue = transportation.length > 1 ? transportation[1] : transportation[0];

  const total = accomodation[0] + foodValue + transportationValue;

  return {
    accomodation,
    food,
    transportation,
    total,
    discountDescription: {
      food: foodDiscountDescription,
      transportation: transportationDiscountDescription,
    },
  };
};

const packageSeminary = ({ age, withTransportation }) => {
  let accomodation = [527];
  let food = [208];
  let transportation = withTransportation ? [190] : [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';
  let accomodationDiscountDescription = '';

  //Alimentação
  if (age <= 6) {
    food = [208, 0];
    foodDiscountDescription = 'Criança até 6 anos não paga alimentação';
  } else if (age >= 7 && age <= 12) {
    food = [208, 104];
    foodDiscountDescription = 'Criança de 7 a 12 anos paga apenas 50% na alimentação';
  }

  //Transporte
  if (age <= 6) {
    transportation = withTransportation ? [190, 0] : [0];
    transportationDiscountDescription = 'Criança até 6 anos não paga transporte *(no colo dos pais)';
  }

  //Hospedagem
  if (age <= 8) {
    accomodation = [527, 0];
    accomodationDiscountDescription = 'Criança até 8 anos não paga hospedagem';
  } else if (age >= 9 && age <= 14) {
    accomodation = [527, 264];
    accomodationDiscountDescription = 'Criança de 9 a 14 anos paga apenas 50% na hospedagem';
  }

  const accomodationValue = accomodation.length > 1 ? accomodation[1] : accomodation[0];
  const foodValue = food.length > 1 ? food[1] : food[0];
  const transportationValue = transportation.length > 1 ? transportation[1] : transportation[0];

  const total = accomodationValue + foodValue + transportationValue;

  return {
    total,
    accomodation,
    food,
    transportation,
    discountDescription: {
      food: foodDiscountDescription,
      transportation: transportationDiscountDescription,
      accomodation: accomodationDiscountDescription,
    },
  };
};

const packageOther = ({ age, withTransportation }) => {
  let accomodation = [0];
  let food = [208];
  let transportation = withTransportation ? [190] : [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';
  let accomodationDiscountDescription = '';

  //Alimentação
  if (age <= 6) {
    food = [208, 0];
    foodDiscountDescription = 'Criança até 6 anos não paga alimentação';
  } else if (age >= 7 && age <= 12) {
    food = [208, 104];
    foodDiscountDescription = 'Criança de 7 a 12 anos paga apenas 50% na alimentação';
  }

  //Transporte
  if (age <= 6) {
    transportation = withTransportation ? [190, 0] : [0];
    transportationDiscountDescription = 'Criança até 6 anos não paga transporte *(no colo dos pais)';
  }

  //Hospedagem
  if (age <= 10) {
    accomodation = [0, 0];
    accomodationDiscountDescription = 'Criança até 10 anos não paga hospedagem';
  } 

  const accomodationValue = accomodation.length > 1 ? accomodation[1] : accomodation[0];
  const foodValue = food.length > 1 ? food[1] : food[0];
  const transportationValue = transportation.length > 1 ? transportation[1] : transportation[0];

  const total = accomodationValue + foodValue + transportationValue;

  return {
    total,
    accomodation,
    food,
    transportation,
    discountDescription: {
      food: foodDiscountDescription,
      transportation: transportationDiscountDescription,
      accomodation: accomodationDiscountDescription,
    },
  };
};

const packageNonPaid = ({ age }) => {
  let accomodation = [50];
  let food = [0];
  let transportation = [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';
  let accomodationDiscountDescription = '';

  //Hospedagem
  if (age <= 10) {
    accomodation = [50, 0];
    accomodationDiscountDescription = 'Criança até 10 anos não paga hospedagem';
  }

  const accomodationValue = accomodation.length > 1 ? accomodation[1] : accomodation[0];
  const foodValue = food[0];
  const transportationValue = transportation[0];

  const total = accomodationValue + foodValue + transportationValue;

  return {
    total,
    accomodation,
    food,
    transportation,
    discountDescription: {
      food: foodDiscountDescription,
      transportation: transportationDiscountDescription,
      accomodation: accomodationDiscountDescription,
    },
  };
};

const packagesBundles = {
  school: packageSchool,
  seminary: packageSeminary,
  other: packageOther,
  nonPaid: packageNonPaid,
};

const generatePackagesValues = (packageType, age) => {
  const packageBundle = packagesBundles[packageType];

  const packageWithBuss = packageBundle({
    age,
    withTransportation: true,
  });

  const packageWithoutBuss = packageBundle({
    age,
    withTransportation: false,
  });

  return [packageWithBuss, packageWithoutBuss];
};

export default generatePackagesValues;
