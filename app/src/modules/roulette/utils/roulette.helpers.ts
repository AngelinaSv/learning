export const isNumberBet = (result: number, value: string) => {
  return result === Number(value);
};

export const isColorBet = (result: number, value: string) => {
  if (result === 0) return value === 'GREEN';

  const red = new Set([
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ]);

  const color = red.has(result) ? 'RED' : 'BLACK';
  return color === value;
};

export const isEvenOddBet = (result: number, value: string) => {
  if (result === 0) return false;

  if (value === 'EVEN') return result % 2 === 0;
  if (value === 'ODD') return result % 2 === 1;

  return false;
};

export const isDozenBet = (result: number, value: string) => {
  if (result === 0) return false;

  if (value === 'FIRST') return result >= 1 && result <= 12;
  if (value === 'SECOND') return result >= 13 && result <= 24;
  if (value === 'THIRD') return result >= 25 && result <= 36;

  return false;
};

export const isColumnBet = (result: number, value: string) => {
  if (result === 0) return false;

  const col1 = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];
  const col2 = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
  const col3 = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

  if (value === 'FIRST') return col1.includes(result);
  if (value === 'SECOND') return col2.includes(result);
  if (value === 'THIRD') return col3.includes(result);

  return false;
};

export const isRangeBet = (result: number, value: string) => {
  if (result === 0) return false;

  if (value === 'LOW') return result >= 1 && result <= 18;
  if (value === 'HIGH') return result >= 19 && result <= 36;

  return false;
};
