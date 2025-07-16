const CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 62 characters
const BASE = CHARS.length;

function charToIndex(char: string): number {
  return CHARS.indexOf(char);
}

function indexToChar(index: number): string {
  return CHARS[index];
}

function padRight(str: string, length: number): string {
  while (str.length < length) {
    str += CHARS[0]; // '0'
  }
  return str;
}

function stringToNumber(str: string, length: number): number {
  str = padRight(str, length);
  let num = 0;
  for (let i = 0; i < length; i++) {
    num = num * BASE + charToIndex(str[i]);
  }
  return num;
}

function numberToString(num: number, length: number): string {
  let str = '';
  for (let i = 0; i < length; i++) {
    str = indexToChar(num % BASE) + str;
    num = Math.floor(num / BASE);
  }
  return str;
}

export function between(a: string, b: string): string {
  const maxLen = Math.max(a.length, b.length, 6); // padding to 6 characters
  const aNum = stringToNumber(a, maxLen);
  const bNum = stringToNumber(b, maxLen);

  if (aNum >= bNum - 1) {
    throw new Error('Cannot generate rank between too-close values');
  }

  const midNum = Math.floor((aNum + bNum) / 2);
  return numberToString(midNum, maxLen);
}

export function genInitialRank(): string {
  return 'h00000'; // mid value
}

export function genNext(rank: string): string {
  const maxLen = rank.length;
  const num = stringToNumber(rank, maxLen);
  return numberToString(num + 1, maxLen);
}

export function genPrev(rank: string): string {
  const maxLen = rank.length;
  const num = stringToNumber(rank, maxLen);
  return numberToString(num - 1, maxLen);
}

const   lexorank = {
  between,
  genInitialRank,
  genNext,
  genPrev,
  stringToNumber,
  numberToString,
  charToIndex,
  indexToChar,
  padRight,
};

export default lexorank;