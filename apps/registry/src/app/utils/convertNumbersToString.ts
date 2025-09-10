const UNIDADES: string[] = [
  '',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
];

const DECENAS: string[] = [
  '',
  '',
  'veinte',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa',
];

const CENTENAS: string[] = [
  '',
  'ciento',
  'doscientos',
  'trescientos',
  'cuatrocientos',
  'quinientos',
  'seiscientos',
  'setecientos',
  'ochocientos',
  'novecientos',
];

function convertirDecenas(numero: number): string {
  if (numero < 20) {
    return UNIDADES[numero];
  }

  const decena = Math.floor(numero / 10);
  const unidad = numero % 10;

  if (numero >= 21 && numero <= 29) {
    return `veinti${UNIDADES[unidad]}`;
  }

  return unidad === 0
    ? DECENAS[decena]
    : `${DECENAS[decena]} y ${UNIDADES[unidad]}`;
}

function convertirCentenas(numero: number): string {
  if (numero === 0) return 'cero';
  if (numero === 100) return 'cien';

  const centena = Math.floor(numero / 100);
  const resto = numero % 100;

  let resultado = '';

  if (centena > 0) {
    resultado = CENTENAS[centena];
  }

  if (resto > 0) {
    if (centena > 0) {
      resultado += ' ';
    }
    resultado += convertirDecenas(resto);
  }

  return resultado;
}

function convertirMiles(numero: number): string {
  if (numero === 0) return 'cero';

  const miles = Math.floor(numero / 1000);
  const resto = numero % 1000;

  let resultado = '';

  if (miles > 0) {
    if (miles === 1) {
      resultado = 'mil';
    } else {
      resultado = `${convertirCentenas(miles)} mil`;
    }
  }

  if (resto > 0) {
    if (miles > 0) {
      resultado += ' ';
    }
    resultado += convertirCentenas(resto);
  }

  return resultado;
}

export function convertNumberToString(value: number | string): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numero = parseInt(value.toString(), 10);

  if (isNaN(numero)) {
    return value.toString();
  }

  if (numero < 0) {
    return `menos ${convertirMiles(Math.abs(numero))}`;
  }

  if (numero > 999999) {
    return numero.toString();
  }

  return convertirMiles(numero);
}

export function convertAgeToWords(age: number | string): string {
  const numero = parseInt(age.toString(), 10);
  const words = convertNumberToString(numero);
  const plural = numero === 1 ? 'año' : 'años';
  return `${words} ${plural}`;
}
