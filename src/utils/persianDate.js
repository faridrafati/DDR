import jalaali from 'jalaali-js';

// Persian month names
export const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// Persian month names in English
export const persianMonthsEnglish = [
  'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
  'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'
];

// Persian weekday names
export const persianWeekdays = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'
];

/**
 * Parse a Shamsi date string in format YYYY-MM-DD or YYYY/MM/DD
 * @param {string} shamsiStr - Shamsi date string
 * @returns {object} - { jy, jm, jd } or null if invalid
 */
export const parseShamsiDate = (shamsiStr) => {
  if (!shamsiStr) return null;

  // Handle different separators
  const parts = shamsiStr.replace(/\//g, '-').split('-');
  if (parts.length !== 3) return null;

  const jy = parseInt(parts[0], 10);
  const jm = parseInt(parts[1], 10);
  const jd = parseInt(parts[2], 10);

  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return null;
  if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;

  return { jy, jm, jd };
};

/**
 * Convert Shamsi date string to Gregorian Date object
 * @param {string} shamsiStr - Shamsi date string (YYYY-MM-DD or YYYY/MM/DD)
 * @returns {Date|null} - Gregorian Date object or null
 */
export const shamsiToGregorian = (shamsiStr) => {
  const parsed = parseShamsiDate(shamsiStr);
  if (!parsed) return null;

  try {
    const { gy, gm, gd } = jalaali.toGregorian(parsed.jy, parsed.jm, parsed.jd);
    return new Date(gy, gm - 1, gd);
  } catch (e) {
    console.error('Error converting Shamsi to Gregorian:', e);
    return null;
  }
};

/**
 * Convert Gregorian Date to Shamsi date object
 * @param {Date} date - Gregorian Date object
 * @returns {object} - { jy, jm, jd }
 */
export const gregorianToShamsi = (date) => {
  if (!date || !(date instanceof Date)) return null;

  try {
    return jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  } catch (e) {
    console.error('Error converting Gregorian to Shamsi:', e);
    return null;
  }
};

/**
 * Format Shamsi date string to display format
 * @param {string} shamsiStr - Shamsi date string (YYYY-MM-DD)
 * @param {string} format - Output format: 'short', 'long', 'full'
 * @returns {string} - Formatted date string
 */
export const formatShamsiDate = (shamsiStr, format = 'short') => {
  const parsed = parseShamsiDate(shamsiStr);
  if (!parsed) return shamsiStr || '-';

  const { jy, jm, jd } = parsed;

  switch (format) {
    case 'long':
      return `${jd} ${persianMonthsEnglish[jm - 1]} ${jy}`;
    case 'full':
      return `${jd} ${persianMonths[jm - 1]} ${jy}`;
    case 'numeric':
      return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
    case 'short':
    default:
      return `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')}`;
  }
};

/**
 * Get current Shamsi date
 * @returns {object} - { jy, jm, jd }
 */
export const getCurrentShamsiDate = () => {
  const now = new Date();
  return gregorianToShamsi(now);
};

/**
 * Get current Shamsi date as string
 * @param {string} format - Output format
 * @returns {string} - Formatted current date
 */
export const getCurrentShamsiDateStr = (format = 'short') => {
  const shamsi = getCurrentShamsiDate();
  if (!shamsi) return '';

  const { jy, jm, jd } = shamsi;
  const shamsiStr = `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')}`;
  return formatShamsiDate(shamsiStr, format);
};

/**
 * Compare two Shamsi date strings
 * @param {string} date1 - First Shamsi date
 * @param {string} date2 - Second Shamsi date
 * @returns {number} - -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export const compareShamsiDates = (date1, date2) => {
  const d1 = parseShamsiDate(date1);
  const d2 = parseShamsiDate(date2);

  if (!d1 || !d2) return 0;

  if (d1.jy !== d2.jy) return d1.jy - d2.jy;
  if (d1.jm !== d2.jm) return d1.jm - d2.jm;
  return d1.jd - d2.jd;
};

/**
 * Check if a Shamsi date is within a range
 * @param {string} date - Shamsi date to check
 * @param {string} startDate - Range start (inclusive)
 * @param {string} endDate - Range end (inclusive)
 * @returns {boolean}
 */
export const isShamsiDateInRange = (date, startDate, endDate) => {
  if (!date) return false;
  if (!startDate && !endDate) return true;

  if (startDate && compareShamsiDates(date, startDate) < 0) return false;
  if (endDate && compareShamsiDates(date, endDate) > 0) return false;

  return true;
};

/**
 * Get Shamsi month and year from date string
 * @param {string} shamsiStr - Shamsi date string
 * @returns {object} - { month, year, monthName }
 */
export const getShamsiMonthYear = (shamsiStr) => {
  const parsed = parseShamsiDate(shamsiStr);
  if (!parsed) return null;

  return {
    year: parsed.jy,
    month: parsed.jm,
    monthName: persianMonthsEnglish[parsed.jm - 1],
    monthNamePersian: persianMonths[parsed.jm - 1]
  };
};

/**
 * Check if two Shamsi dates are in the same month
 * @param {string} date1 - First Shamsi date
 * @param {string} date2 - Second Shamsi date
 * @returns {boolean}
 */
export const isSameShamsiMonth = (date1, date2) => {
  const d1 = parseShamsiDate(date1);
  const d2 = parseShamsiDate(date2);

  if (!d1 || !d2) return false;
  return d1.jy === d2.jy && d1.jm === d2.jm;
};

/**
 * Get array of days in a Shamsi month
 * @param {number} year - Shamsi year
 * @param {number} month - Shamsi month (1-12)
 * @returns {number} - Number of days
 */
export const getDaysInShamsiMonth = (year, month) => {
  return jalaali.jalaaliMonthLength(year, month);
};

/**
 * Generate array of Shamsi years for dropdown (range)
 * @param {number} startYear - Start year (default: 1300)
 * @param {number} endYear - End year (default: current year + 1)
 * @returns {number[]}
 */
export const getShamsiYearRange = (startYear = 1300, endYear = null) => {
  const currentYear = getCurrentShamsiDate()?.jy || 1403;
  const end = endYear || currentYear + 1;

  const years = [];
  for (let y = end; y >= startYear; y--) {
    years.push(y);
  }
  return years;
};

/**
 * Convert database date field to display format
 * Handles both Shamsi string formats and potential edge cases
 * @param {string} dateValue - Date value from database
 * @returns {string} - Formatted display string
 */
export const formatDatabaseDate = (dateValue) => {
  if (!dateValue) return '-';

  // If it looks like a Shamsi date (starts with 13 or 14)
  if (typeof dateValue === 'string' && (dateValue.startsWith('13') || dateValue.startsWith('14'))) {
    return formatShamsiDate(dateValue, 'numeric');
  }

  // Try to parse as Shamsi anyway
  return formatShamsiDate(dateValue, 'numeric');
};

export default {
  parseShamsiDate,
  shamsiToGregorian,
  gregorianToShamsi,
  formatShamsiDate,
  getCurrentShamsiDate,
  getCurrentShamsiDateStr,
  compareShamsiDates,
  isShamsiDateInRange,
  getShamsiMonthYear,
  isSameShamsiMonth,
  getDaysInShamsiMonth,
  getShamsiYearRange,
  formatDatabaseDate,
  persianMonths,
  persianMonthsEnglish,
  persianWeekdays
};
