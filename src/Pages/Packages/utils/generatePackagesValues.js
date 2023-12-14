const packageSchool = ({ age, withTransportation }) => {
  const accomodation = [0];
  let food = [280];
  let transportation = withTransportation ? [160] : [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';

  //Alimentação
  if (age <= 6) {
    food = [280, 0];
    foodDiscountDescription = 'Criança até 6 anos não paga alimentação';
  } else if (age >= 7 && age <= 12) {
    food = [280, 140];
    foodDiscountDescription = 'Criança de 7 a 12 anos paga apenas 50% na alimentação';
  }

  //Transporte
  if (age <= 6) {
    transportation = withTransportation ? [160, 0] : [0];
    transportationDiscountDescription = 'Criança até 6 anos não paga transporte *(no colo dos pais)';
  } else if (age >= 7 && age <= 12) {
    transportation = withTransportation ? [160] : [0];
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
  let accomodation = [480];
  let food = [200];
  let transportation = withTransportation ? [160] : [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';
  let accomodationDiscountDescription = '';

  //Alimentação
  if (age <= 6) {
    food = [200, 0];
    foodDiscountDescription = 'Criança até 6 anos não paga alimentação';
  } else if (age >= 7 && age <= 12) {
    food = [200, 100];
    foodDiscountDescription = 'Criança de 7 a 12 anos paga apenas 50% na alimentação';
  }

  //Transporte
  if (age <= 6) {
    transportation = withTransportation ? [160, 0] : [0];
    transportationDiscountDescription = 'Criança até 6 anos não paga transporte *(no colo dos pais)';
  }

  //Hospedagem
  if (age <= 8) {
    accomodation = [600, 0];
    accomodationDiscountDescription = 'Criança até 8 anos não paga hospedagem';
  } else if (age >= 9 && age <= 14) {
    accomodation = [480, 240];
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

const packageHotel = ({ age, withTransportation }) => {
  let accomodation = [275];
  let food = [200];
  let transportation = withTransportation ? [160] : [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';
  let accomodationDiscountDescription = '';

  //Alimentação
  if (age <= 6) {
    food = [200, 0];
    foodDiscountDescription = 'Criança até 6 anos não paga alimentação';
  } else if (age >= 7 && age <= 12) {
    food = [200, 100];
    foodDiscountDescription = 'Criança de 7 a 12 anos paga apenas 50% na alimentação';
  }

  //Transporte
  if (age <= 6) {
    transportation = withTransportation ? [160, 0] : [0];
    transportationDiscountDescription = 'Criança até 6 anos não paga transporte *(no colo dos pais)';
  }

  //Hospedagem
  if (age <= 10) {
    accomodation = [275, 0];
    accomodationDiscountDescription = 'Criança até 10 anos não paga hospedagem *(dormindo com os pais)';
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
  let food = [200];
  let transportation = withTransportation ? [160] : [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';

  //Alimentação
  if (age <= 6) {
    food = [200, 0];
    foodDiscountDescription = 'Criança até 6 anos não paga alimentação';
  } else if (age >= 7 && age <= 12) {
    food = [200, 100];
    foodDiscountDescription = 'Criança de 7 a 12 anos paga apenas 50% na alimentação';
  }

  //Transporte
  if (age <= 6) {
    transportation = withTransportation ? [160, 0] : [0];
    transportationDiscountDescription = 'Criança até 6 anos não paga transporte *(no colo dos pais)';
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
    },
  };
};

const packageDayUse = () => {
  let accomodation = [0];
  let food = [0];
  let transportation = [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';

  const accomodationValue = accomodation[0];
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
    },
  };
};

const packagesBundles = {
  school: packageSchool,
  seminary: packageSeminary,
  hotel: packageHotel,
  other: packageOther,
  dayUse: packageDayUse,
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
