export function convertNumberToWords(value: number) {
  const numberMap: { [key: string]: string } = {
    '0': 'cero',
    '1': 'uno',
    '2': 'dos',
    '3': 'tres',
    '4': 'cuatro',
    '5': 'cinco',
    '6': 'seis',
    '7': 'siete',
    '8': 'ocho',
    '9': 'nueve',
  };

  if (value === null || value === undefined) {
    return '';
  }

  const numberString = value.toString();

  return numberString
    .split('')
    .map((digit) => numberMap[digit] || digit)
    .join(' ');
}
