const packageSchool = ({ age, withTransportation }) => {
  const accomodation = [0];
  let food = [280];
  let transportation = [160];

  let discountDescription = '';

  if (age <= 6) {
    food = [280, 0];
    transportation = withTransportation ? [160, 0] : [0];
    discountDescription = 'Criança até 6 anos não paga';
  } else if (age >= 7 && age <= 12) {
    food = [280, 140];
    transportation = withTransportation ? [160, 80] : [0];
    discountDescription = 'Criança de 7 a 12 anos paga apenas 50%';
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
      accomodation: discountDescription,
    },
  };
};

const packageSeminary = ({ age, withTransportation }) => {
  let accomodation = [600];
  let food = [200];
  let transportation = [160];

  let discountDescription = '';

  if (age <= 8) {
    food = [200, 0];
    transportation = withTransportation ? [160, 0] : [0];
    accomodation = [600, 0];
    discountDescription = 'Criança até 8 anos não paga';
  } else if (age >= 9 && age <= 14) {
    food = [200, 100];
    transportation = withTransportation ? [160, 80] : [0];
    accomodation = [600, 300];
    discountDescription = 'Criança de 9 a 14 anos paga apenas 50%';
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
      accomodation: discountDescription,
    },
  };
};

const packageHotel = ({ age, withTransportation }) => {
  let accomodation = [550];
  let food = [200];
  let transportation = [160];

  let discountDescription = '';

  if (age <= 10) {
    food = [200, 0];
    transportation = withTransportation ? [160, 0] : [0];
    accomodation = [550, 0];
    discountDescription = 'Criança até 10 anos não paga hospedagem *dormindo com os pais';
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
      accomodation: discountDescription,
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

  if (packageType === 'hotel') {
    const packageWithBuss = packageHotel({
      age,
      withTransportation: true,
    });

    const packageWithoutBuss = packageHotel({
      age,
      withTransportation: false,
    });

    return [packageWithBuss, packageWithoutBuss];
  }
};

export default generatePackagesValues;
