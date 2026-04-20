export const sanitizeFields = (data) => ({
  id: data.id || 0,
  totalPrice: data.totalPrice || '',
  personalInformation: {
    name: data.personalInformation?.name || '',
    birthday: data.personalInformation?.birthday || '',
    cpf: data.personalInformation?.cpf || '',
    rg: data.personalInformation?.rg || '',
    rgShipper: data.personalInformation?.rgShipper || '',
    rgShipperState: data.personalInformation?.rgShipperState || '',
    gender: data.personalInformation?.gender || '',
    legalGuardianCellPhone: data.personalInformation?.legalGuardianCellPhone || '',
    legalGuardianCpf: data.personalInformation?.legalGuardianCpf || '',
    legalGuardianName: data.personalInformation?.legalGuardianName || '',
  },
  contact: {
    cellPhone: data.contact?.cellPhone || '',
    email: data.contact?.email || '',
    isWhatsApp: data.contact?.isWhatsApp === true || data.contact?.isWhatsApp === 'true',
    church: data.contact?.church || '',
    car: data.contact?.car === true || data.contact?.car === 'true',
    numberVacancies: data.contact?.numberVacancies || '',
    needRide: data.contact?.needRide === true || data.contact?.needRide === 'true',
    rideObservation: data.contact?.rideObservation || '',
    allergy: data.contact?.allergy || '',
    aggregate: data.contact?.aggregate || '',
  },
  extraMeals: {
    someFood: data.extraMeals?.someFood === true || data.extraMeals?.someFood === 'true',
    extraMeals: Array.isArray(data.extraMeals?.extraMeals)
      ? data.extraMeals.extraMeals.join(', ')
      : data.extraMeals?.extraMeals || '',
  },
  formPayment: {
    formPayment:
      typeof data.formPayment === 'object' ? data.formPayment.formPayment || '' : data.formPayment || '',
  },
  observation: data.observation || '',
  package: {
    accomodation: {
      id: data.package?.accomodation?.id || '',
      name: data.package?.accomodation?.name || '',
      price: data.package?.accomodation?.price || '',
    },
    transportation: {
      id: data.package?.transportation?.id || '',
      name: data.package?.transportation?.name || '',
      price: data.package?.transportation?.price || '',
    },
    food: {
      id: data.package?.food?.id || '',
      name: data.package?.food?.name || '',
      price: data.package?.food?.price || '',
    },
    price: data.package?.price || '',
    finalPrice: data.package?.finalPrice || '',
  },
});
