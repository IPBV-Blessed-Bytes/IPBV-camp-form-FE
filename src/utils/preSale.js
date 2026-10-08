const keyFor = (cpf) => `presale:${String(cpf || '').replace(/\D/g, '')}`;

export const setPreSaleAmount = (cpf, amount) => {
  try {
    const key = keyFor(cpf);
    if (amount === null || amount === undefined || amount === '') {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, String(amount));
    }
  } catch (error) {
    return;
  }
};

export const getPreSaleAmount = (cpf) => {
  try {
    const raw = sessionStorage.getItem(keyFor(cpf));
    if (!raw) return 0;
    const value = Number(String(raw).replace(',', '.'));
    return Number.isFinite(value) ? value : 0;
  } catch (error) {
    return 0;
  }
};

export const getPreSaleFoodCredit = (user, discountedProducts) => {
  if (getPreSaleAmount(user?.personalInformation?.cpf) <= 0) return 0;
  const product = discountedProducts.find((p) => p.id === user?.package?.accomodation?.id);
  return Number(product?.foodComponent || 0);
};
