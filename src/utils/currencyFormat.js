const toIndianCurrency = (num = 0, hasSpace = false) => {
  const curr = num.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  if (!hasSpace) return curr;
  const symbol = curr.split('')[0];
  const parts = curr.split(symbol).join('');

  return `${symbol} ${parts}`;
};

export default toIndianCurrency;
