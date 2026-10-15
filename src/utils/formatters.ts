import { AppLanguage, NumberFormat } from '../types/finance';

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string): string {
  const str = String(num);
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)] || digit);
}

export function formatCurrency(
  amount: number,
  lang: AppLanguage = 'bn',
  numFormat: NumberFormat = 'bn'
): string {
  const rounded = Math.round(amount);
  const formattedWithCommas = new Intl.NumberFormat('en-IN').format(rounded);

  if (numFormat === 'bn') {
    const bnNum = toBengaliNumber(formattedWithCommas);
    return `৳ ${bnNum}`;
  }
  return `৳ ${formattedWithCommas}`;
}

export function formatNumberOnly(
  num: number | string,
  numFormat: NumberFormat = 'bn'
): string {
  if (numFormat === 'bn') {
    return toBengaliNumber(num);
  }
  return String(num);
}

const BN_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const EN_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function formatDateBn(
  dateStr: string,
  lang: AppLanguage = 'bn',
  numFormat: NumberFormat = 'bn'
): string {
  if (!dateStr) return '';
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dateStr === today) {
    return lang === 'bn' ? 'আজ' : 'Today';
  }
  if (dateStr === yesterday) {
    return lang === 'bn' ? 'গতকাল' : 'Yesterday';
  }

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    if (lang === 'bn') {
      const bnDay = numFormat === 'bn' ? toBengaliNumber(day) : day;
      const bnYear = numFormat === 'bn' ? toBengaliNumber(year) : year;
      const bnMonth = BN_MONTHS[monthIdx] || parts[1];
      return `${bnDay} ${bnMonth}, ${bnYear}`;
    } else {
      const enMonth = EN_MONTHS[monthIdx] || parts[1];
      return `${day} ${enMonth} ${year}`;
    }
  }

  return dateStr;
}

export function formatMonthName(monthStr: string, lang: AppLanguage = 'bn'): string {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const monthIdx = parseInt(month, 10) - 1;

  if (lang === 'bn') {
    return `${BN_MONTHS[monthIdx] || month} ${toBengaliNumber(year)}`;
  }
  return `${EN_MONTHS[monthIdx] || month} ${year}`;
}

export function generateReceiptNumber(): string {
  const now = new Date();
  const yearSuffix = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `VCH-${yearSuffix}${month}-${random}`;
}

export function getCurrentDateStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTimeStr(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
