export const enumSteps = {
  home: 0,
  personalData: 1,
  contact: 2,
  packages: 3,
  extraMeals: 4,
  finalReview: 5,
  formPayment: 6,
  success: 7,
};

export const initialValues = {
  registrationDate: '',
  totalPrice: '',
  personalInformation: {
    name: '',
    birthday: '',
    cpf: '',
    rg: '',
    rgShipper: '',
    rgShipperState: '',
    gender: '',
  },
  contact: {
    cellPhone: '',
    email: '',
    isWhatsApp: '',
    church: '',
    car: '',
    numberVacancies: '',
    needRide: '',
    hasAllergy: '',
    allergy: '',
    hasAggregate: '',
    aggregate: '',
  },
  package: {
    accomodation: {
      id: '',
      name: '',
      subAccomodation: '',
    },
    transportation: '',
    food: '',
    price: '',
    title: '',
  },
  extraMeals: {
    someFood: '',
    totalPrice: '',
  },
  formPayment: {
    formPayment: '',
  },
};
