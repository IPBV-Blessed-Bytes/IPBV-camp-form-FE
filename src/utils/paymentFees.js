export const DEFAULT_FEES = {
  pixPercent: 1.19,
  boletoFixed: 3.49,
  cardFixed: 1.48,
  cardInstallmentPercent: {
    1: 4.79,
    2: 7.31,
    3: 8.57,
    4: 9.83,
    5: 11.09,
    6: 12.35,
    7: 13.61,
    8: 14.87,
    9: 16.13,
    10: 17.39,
    11: 18.65,
    12: 19.91,
  },
};

export const parseFees = (raw) => {
  if (!raw) return DEFAULT_FEES;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      pixPercent: Number(parsed.pixPercent ?? DEFAULT_FEES.pixPercent),
      boletoFixed: Number(parsed.boletoFixed ?? DEFAULT_FEES.boletoFixed),
      cardFixed: Number(parsed.cardFixed ?? DEFAULT_FEES.cardFixed),
      cardInstallmentPercent: { ...DEFAULT_FEES.cardInstallmentPercent, ...(parsed.cardInstallmentPercent || {}) },
    };
  } catch {
    return DEFAULT_FEES;
  }
};

export const grossUp = (base, percent, fixed) => {
  const value = Number(base) || 0;
  const rate = (Number(percent) || 0) / 100;
  const fee = Number(fixed) || 0;
  if (rate >= 1) return value + fee;
  return (value + fee) / (1 - rate);
};

export const simulatePayments = (base, fees, maxBoletoInstallments = 1) => {
  const config = fees || DEFAULT_FEES;
  const value = Number(base) || 0;
  const boletoFee = Number(config.boletoFixed) || 0;

  const pix = grossUp(value, config.pixPercent, 0);
  const boleto = value + boletoFee;
  const card = Object.keys(config.cardInstallmentPercent)
    .map(Number)
    .sort((a, b) => a - b)
    .map((installments) => {
      const total = grossUp(value, config.cardInstallmentPercent[installments], config.cardFixed);
      return { installments, total, perInstallment: total / installments };
    });

  const boletoInstallments = [];
  for (let n = 2; n <= Number(maxBoletoInstallments || 1); n += 1) {
    const total = value + n * boletoFee;
    boletoInstallments.push({ installments: n, total, perInstallment: total / n });
  }

  return { pix, boleto, card, boletoInstallments };
};
