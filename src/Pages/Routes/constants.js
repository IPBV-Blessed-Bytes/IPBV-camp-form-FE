export const enumSteps = {
  home: 0,
  personalData: 1,
  contact: 2,
  packages: 3,
  finalReview: 4,
  formPayment: 5,
  success: 6,
};

export const initialValues = {
  registrationDate: '',
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
  formPayment: {
    formPayment: '',
  },
};
