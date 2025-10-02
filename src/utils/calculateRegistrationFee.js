const calculateRegistrationFee = (initialRegistrationFee, age) => {
  let registrationFee = initialRegistrationFee;
  if (age <= 8) registrationFee = 0;
  else if (age <= 14) registrationFee = registrationFee / 2;

  return registrationFee;
};

export { calculateRegistrationFee };
