const packageSchool = ({ age, withTransportation }) => {
  const accomodation = [0];
  let food = [280];
  const transportation = withTransportation ? 160 : 0;

  let foodDiscountDescription = '';

  if (age <= 6) {
    food = [280, 0];
    foodDiscountDescription = 'Crianças até 6 anos não pagam alimentação';
  } else if (age >= 7 && age <= 12) {
    food = [280, 140];
    foodDiscountDescription = 'Crianças de 7 a 12 anos pagam apenas 50% da alimentação';
  }

  const foodValue = food.length > 1 ? food[1] : food[0];

  const total = accomodation[0] + foodValue + transportation;

  return {
    accomodation,
    food,
    transportation,
    total,
    discountDescription: {
      food: foodDiscountDescription,
    },
  };
};

const packageSeminary = ({ age, withTransportation }) => {
  let accomodation = [600];
  let food = [200];
  const transportation = withTransportation ? 160 : 0;

  let foodDiscountDescription = '';
  let accomodationDiscountDescription = '';

  if (age <= 8) {
    food = [200, 0];
    accomodation = [600, 0];
    foodDiscountDescription = 'Crianças até 8 anos não pagam alimentação';
    accomodationDiscountDescription = 'Crianças até 8 anos não pagam hospedagem';
  } else if (age >= 9 && age <= 14) {
    food = [200, 100];
    accomodation = [600, 300];
    foodDiscountDescription = 'Crianças de 9 a 14 anos pagam apenas 50% da alimentação';
    accomodationDiscountDescription = 'Crianças de 9 a 14 anos pagam apenas 50% da hospedagem';
  }

  const accomodationValue = accomodation.length > 1 ? accomodation[1] : accomodation[0];
  const foodValue = food.length > 1 ? food[1] : food[0];

  const total = accomodationValue + foodValue + transportation;

  return {
    total,
    accomodation,
    food,
    transportation,
    discountDescription: {
      food: foodDiscountDescription,
      accomodation: accomodationDiscountDescription,
    },
  };
};

const generatePackagesValues = (packageType, age) => {
  if (packageType === 'school') {
    const packageWithBuss = packageSchool({
      age,
      withTransportation: true,
    });

    const packageWithoutBuss = packageSchool({
      age,
      withTransportation: false,
    });

    return [packageWithBuss, packageWithoutBuss];
  }

  if (packageType === 'seminary') {
    const packageWithBuss = packageSeminary({
      age,
      withTransportation: true,
    });

    const packageWithoutBuss = packageSeminary({
      age,
      withTransportation: false,
    });

    return [packageWithBuss, packageWithoutBuss];
  }
};

export default generatePackagesValues;
