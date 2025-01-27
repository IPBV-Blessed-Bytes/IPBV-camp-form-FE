const packageSchool = ({ age, withTransportation, withFood }) => {
  const accomodation = [0];
  const fixedRate = age <= 12 ? [0] : [50];
  let food = withFood ? [300] : [0];
  let transportation = withTransportation ? [190] : [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';

  // Alimentação
  if (age <= 6) {
    food = withFood ? [300, 0] : [0];
    foodDiscountDescription = 'Criança até 6 anos não paga alimentação';
  } else if (age >= 7 && age <= 12) {
    food = withFood ? [300, 150] : [0];
    foodDiscountDescription = 'Criança de 7 a 12 anos paga apenas 50% na alimentação';
  }

  // Transporte
  if (age <= 6) {
    transportation = withTransportation ? [190, 0] : [0];
    transportationDiscountDescription = 'Criança até 6 anos não paga transporte *(no colo dos pais)';
  } else if (age >= 7 && age <= 12) {
    transportation = withTransportation ? [190] : [0];
  }

  const foodValue = food.length > 1 ? food[1] : food[0];
  const transportationValue = transportation.length > 1 ? transportation[1] : transportation[0];

  const totalWithoutFixedRate = accomodation[0] + foodValue + transportationValue;
  const total = !withFood ? totalWithoutFixedRate + fixedRate[0] : totalWithoutFixedRate;

  return {
    accomodation,
    food,
    transportation,
    total,
    discountDescription: {
      food: foodDiscountDescription,
      transportation: transportationDiscountDescription,
    },
    fixedRate,
  };
};

const packageSeminary = ({ age, withTransportation, withFood }) => {
  let accomodation = [527];
  const fixedRate = age <= 12 ? [0] : [50];
  let food = withFood ? [208] : [0];
  let transportation = withTransportation ? [190] : [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';
  let accomodationDiscountDescription = '';

  // Alimentação
  if (age <= 6) {
    food = withFood ? [208, 0] : [0];
    foodDiscountDescription = 'Criança até 6 anos não paga alimentação';
  } else if (age >= 7 && age <= 12) {
    food = withFood ? [208, 104] : [0];
    foodDiscountDescription = 'Criança de 7 a 12 anos paga apenas 50% na alimentação';
  }

  // Transporte
  if (age <= 6) {
    transportation = withTransportation ? [190, 0] : [0];
    transportationDiscountDescription = 'Criança até 6 anos não paga transporte *(no colo dos pais)';
  }

  // Hospedagem
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

  const totalWithoutFixedRate = accomodationValue + foodValue + transportationValue;
  const total = !withFood ? totalWithoutFixedRate + fixedRate[0] : totalWithoutFixedRate;

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
    fixedRate,
  };
};

const packageOther = ({ age, withTransportation, withFood }) => {
  let accomodation = [0];
  const fixedRate = age <= 12 ? [0] : [50];
  let food = withFood ? [208] : [0];
  let transportation = withTransportation ? [190] : [0];

  let foodDiscountDescription = '';
  let transportationDiscountDescription = '';
  let accomodationDiscountDescription = '';

  // Alimentação
  if (age <= 6) {
    food = withFood ? [208, 0] : [0];
    foodDiscountDescription = 'Criança até 6 anos não paga alimentação';
  } else if (age >= 7 && age <= 12) {
    food = withFood ? [208, 104] : [0];
    foodDiscountDescription = 'Criança de 7 a 12 anos paga apenas 50% na alimentação';
  }

  // Transporte
  if (age <= 6) {
    transportation = withTransportation ? [190, 0] : [0];
    transportationDiscountDescription = 'Criança até 6 anos não paga transporte *(no colo dos pais)';
  }

  // Hospedagem
  if (age <= 10) {
    accomodation = [0, 0];
    accomodationDiscountDescription = 'Criança até 10 anos não paga hospedagem';
  }

  const accomodationValue = accomodation.length > 1 ? accomodation[1] : accomodation[0];
  const foodValue = food.length > 1 ? food[1] : food[0];
  const transportationValue = transportation.length > 1 ? transportation[1] : transportation[0];

  const totalWithoutFixedRate = accomodationValue + foodValue + transportationValue;
  const total = !withFood ? totalWithoutFixedRate + fixedRate[0] : totalWithoutFixedRate;

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
    fixedRate,
  };
};

const generatePackagesValues = (type, age) => {
  switch (type) {
    case 'school':
      return [
        packageSchool({ age, withTransportation: true, withFood: true }),
        packageSchool({ age, withTransportation: false, withFood: false }),
        packageSchool({ age, withTransportation: true, withFood: false }),
        packageSchool({ age, withTransportation: false, withFood: true }),
      ];
    case 'seminary':
      return [
        packageSeminary({ age, withTransportation: true, withFood: true }),
        packageSeminary({ age, withTransportation: false, withFood: true }),
      ];
    case 'other':
      return [
        packageOther({ age, withTransportation: true, withFood: true }),
        packageOther({ age, withTransportation: false, withFood: true }),
        packageOther({ age, withTransportation: false, withFood: false }),
      ];
    default:
      return [];
  }
};

export default generatePackagesValues;
