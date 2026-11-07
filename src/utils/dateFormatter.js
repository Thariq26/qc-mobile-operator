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
  let d;
  if (typeof inputDate === 'string' && /^\d{4}-\d{2}-\d{2}/.test(inputDate)) {
    const parts = inputDate.split('T')[0].split('-').map(Number);
    d = new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    d = new Date(inputDate);
  }
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

/**
 * Get date string in YYYY-MM-DD format using LOCAL device timezone (e.g. WIB GMT+7)
 * Prevents UTC timezone rollover bugs where shift 3 night data gets stamped as yesterday.
 */
export const getLocalDateString = (input = new Date()) => {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Universal Date Normalizer: Converts any date representation (Array [Y, M, D],
 * comma string "Y,M,D", ISO timestamp, Date object, or timestamp) into clean "YYYY-MM-DD".
 * This eliminates ASCII comparison bugs and Jackson serialization mismatch.
 */
export const normalizeDateString = (input) => {
  if (!input && input !== 0) return '';

  // 1. If Date instance
  if (input instanceof Date) {
    return getLocalDateString(input);
  }

  // 2. If Array from Jackson LocalDate (e.g. [2026, 10, 23] or [2026, 10, 23, 14, 30])
  if (Array.isArray(input)) {
    if (input.length >= 3) {
      const year = String(input[0]).padStart(4, '0');
      const month = String(input[1]).padStart(2, '0');
      const day = String(input[2]).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // 3. If Object from LocalDate serialization (e.g. { year: 2026, month: 10, day: 23 })
  if (typeof input === 'object') {
    const y = input.year;
    const m = input.month || input.monthValue;
    const d = input.day || input.dayOfMonth;
    if (y && m && d) {
      return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  // 4. If numeric timestamp
  if (typeof input === 'number') {
    const d = new Date(input);
    if (!isNaN(d.getTime())) return getLocalDateString(d);
  }

  // 5. String parsing
  const str = String(input).trim();
  if (!str) return '';

  // Comma-separated array string (e.g. "2026,10,23" from String([2026, 10, 23]))
  if (str.includes(',')) {
    const parts = str.split(',').map((p) => p.trim());
    if (parts.length >= 3) {
      const year = parts[0].padStart(4, '0');
      const month = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // ISO string with T separator: "2026-10-23T..."
  if (str.includes('T')) {
    const datePart = str.split('T')[0].trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
  }

  // Standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // YYYY/MM/DD
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) {
    return str.replace(/\//g, '-');
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback try Date parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return getLocalDateString(parsed);
  }

  return str;
};

/**
 * Format rentang dua tanggal YYYY-MM-DD ke string ringkas Indonesia
 * Contoh: "1 Jan — 7 Nov 2026 (311 Hari)"
 */
export const formatPrettyRange = (startStr, endStr) => {
  if (!startStr || !endStr) return 'Pilih Rentang Tanggal';
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  try {
    const [y1, m1, d1] = startStr.split('-').map(Number);
    const [y2, m2, d2] = endStr.split('-').map(Number);
    const date1 = new Date(y1, m1 - 1, d1);
    const date2 = new Date(y2, m2 - 1, d2);
    const diffDays = Math.max(1, Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const sFormatted = y1 === y2 ? `${d1} ${shortMonths[m1 - 1]}` : `${d1} ${shortMonths[m1 - 1]} ${y1}`;
    const eFormatted = `${d2} ${shortMonths[m2 - 1]} ${y2}`;
    return `${sFormatted} — ${eFormatted} (${diffDays} Hari)`;
  } catch (e) {
    return `${startStr} s/d ${endStr}`;
  }
};

export default {
  formatIndonesianDate,
  formatShortDate,
  formatTime,
  formatDateTime,
  getLocalDateString,
  normalizeDateString,
  formatPrettyRange,
};
