import { convertNumberToString } from './convertNumbersToString';

const MESES: { [key: string]: string } = {
  '01': 'enero',
  '02': 'febrero',
  '03': 'marzo',
  '04': 'abril',
  '05': 'mayo',
  '06': 'junio',
  '07': 'julio',
  '08': 'agosto',
  '09': 'septiembre',
  '10': 'octubre',
  '11': 'noviembre',
  '12': 'diciembre',
};

export function convertDateToWords(dateString: string): string {
  if (!dateString) return '';

  const cleanDate = dateString.replace(/[-]/g, '/');
  const parts = cleanDate.split('/');

  if (parts.length !== 3) {
    return dateString;
  }

  const [day, month, year] = parts;

  const dayNumber = parseInt(day, 10);
  const dayInWords = convertNumberToString(dayNumber);

  const monthInWords = MESES[month] || `mes ${month}`;

  const yearNumber = parseInt(year, 10);
  const yearInWords = convertNumberToString(yearNumber);

  return `${dayInWords} de ${monthInWords} de ${yearInWords}`;
}

export function convertTimeToWords(timeString: string): string {
  if (!timeString) return '';

  const parts = timeString.split(':');
  if (parts.length !== 2) return timeString;

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  const hoursInWords = convertNumberToString(hours);
  const hoursText = hours === 1 ? 'hora' : 'horas';

  if (minutes === 0) {
    return `${hoursInWords} ${hoursText}`;
  }

  const minutesInWords = convertNumberToString(minutes);
  const minutesText = minutes === 1 ? 'minuto' : 'minutos';

  return `${hoursInWords} ${hoursText} y ${minutesInWords} ${minutesText}`;
}
