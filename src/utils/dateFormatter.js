/**
 * Indonesian Date and Time Formatting Utilities
 */

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

export const formatIndonesianDate = (inputDate) => {
  if (!inputDate) return '-';
  const d = new Date(inputDate);
  if (isNaN(d.getTime())) return String(inputDate);

  const dayName = DAYS[d.getDay()];
  const dateNum = d.getDate();
  const monthName = MONTHS_LONG[d.getMonth()];
  const year = d.getFullYear();

  return `${dayName}, ${dateNum} ${monthName} ${year}`;
};

export const formatShortDate = (inputDate) => {
  if (!inputDate) return '-';
  const d = new Date(inputDate);
  if (isNaN(d.getTime())) return String(inputDate);

  const dateNum = d.getDate();
  const monthName = MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear();

  return `${dateNum} ${monthName} ${year}`;
};

export const formatTime = (inputDate) => {
  if (!inputDate) return '-';
  const d = new Date(inputDate);
  if (isNaN(d.getTime())) return String(inputDate);

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes} WIB`;
};

export const formatDateTime = (inputDate) => {
  if (!inputDate) return '-';
  const d = new Date(inputDate);
  if (isNaN(d.getTime())) return String(inputDate);

  return `${formatShortDate(d)} • ${formatTime(d)}`;
};

export default {
  formatIndonesianDate,
  formatShortDate,
  formatTime,
  formatDateTime,
};
