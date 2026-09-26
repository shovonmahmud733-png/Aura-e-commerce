export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79, locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 152.0, locale: 'ja-JP' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36, locale: 'en-CA' },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', rate: 121.5, locale: 'bn-BD' }
};

export const convertCurrency = (amountUSD, targetCurrency = 'USD') => {
  const curr = CURRENCIES[targetCurrency] || CURRENCIES.USD;
  return amountUSD * curr.rate;
};

export const formatCurrency = (amount, currencyCode = 'USD') => {
  if (typeof amount !== 'number' || isNaN(amount)) amount = 0;
  const curr = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const convertedAmount = currencyCode === 'USD' ? amount : amount * curr.rate;

  if (curr.code === 'BDT') {
    const formattedNum = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.round(convertedAmount));
    return `৳${formattedNum}`;
  }

  return new Intl.NumberFormat(curr.locale, {
    style: 'currency',
    currency: curr.code,
    minimumFractionDigits: curr.code === 'JPY' ? 0 : 0,
    maximumFractionDigits: curr.code === 'JPY' ? 0 : 2,
  }).format(convertedAmount);
};

export const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};
