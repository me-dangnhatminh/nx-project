import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { addDays, parseISO } from 'date-fns';
import { toDate } from 'date-fns-tz';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ================= Tính thời gian ban đầu và kết thúc của một khóa học ==========================
// ở Việt Nam học kỳ 1 là học kỳ mùa thu, học kỳ 2 là học kỳ mùa xuân, học kỳ 3 là học kỳ hè
// học kỳ 1 từ tháng 9 đến tháng 12
// học kỳ 2 từ tháng 1 đến tháng 5
// học kỳ 3 từ tháng 6 đến tháng 8

const vnTimeZone: string = 'Asia/Ho_Chi_Minh';

function findFirstMondayAfterAugust15(year: number): string {
  const august15 = parseISO(`${year}-08-15`);
  const dayOfWeek = august15.getDay(); // 0: CN, 1: T2, ..., 6: T7
  const offset = (8 - dayOfWeek) % 7; // số ngày tới thứ 2
  const firstMonday = addDays(august15, offset);
  return firstMonday.toISOString().slice(0, 10); // dạng "YYYY-MM-DD"
}

export const getFirstDateOfVNAcademic = (academic: string): Date => {
  const year = parseInt(academic.split('-')[0], 10);
  const firstDate = findFirstMondayAfterAugust15(year);
  return toDate(firstDate, { timeZone: vnTimeZone });
};
