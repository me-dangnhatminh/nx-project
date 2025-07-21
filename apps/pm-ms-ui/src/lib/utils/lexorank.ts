/**
 * LexoRank utility for ordering items
 * Based on Atlassian's LexoRank algorithm for efficient reordering
 */

const MIN_CHAR = '0';
const MAX_CHAR = 'z';
const DEFAULT_BUCKET = '0';

// Character set for lexorank (0-9, a-z, A-Z)
const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = CHARSET.length;

class LexoRank {
  private value: string;

  constructor(value: string) {
    this.value = value;
  }

  toString(): string {
    return this.value;
  }

  getValue(): string {
    return this.value;
  }

  /**
   * Compare two LexoRank values
   * Returns: -1 if this < other, 0 if equal, 1 if this > other
   */
  compareTo(other: LexoRank): number {
    if (this.value < other.value) return -1;
    if (this.value > other.value) return 1;
    return 0;
  }

  /**
   * Check if this rank comes before another
   */
  isBefore(other: LexoRank): boolean {
    return this.compareTo(other) < 0;
  }

  /**
   * Check if this rank comes after another
   */
  isAfter(other: LexoRank): boolean {
    return this.compareTo(other) > 0;
  }

  /**
   * Generate a rank between this and another rank
   */
  between(other: LexoRank): LexoRank {
    return LexoRank.between(this, other);
  }

  /**
   * Generate next rank after this one
   */
  next(): LexoRank {
    return LexoRank.between(this, LexoRank.max());
  }

  /**
   * Generate previous rank before this one
   */
  prev(): LexoRank {
    return LexoRank.between(LexoRank.min(), this);
  }

  // Static methods

  /**
   * Create LexoRank from string
   */
  static parse(value: string): LexoRank {
    if (!value || typeof value !== 'string') {
      throw new Error('Invalid LexoRank value');
    }
    return new LexoRank(value);
  }

  /**
   * Generate minimum possible rank
   */
  static min(): LexoRank {
    return new LexoRank(`${DEFAULT_BUCKET}|${MIN_CHAR.repeat(6)}`);
  }

  /**
   * Generate maximum possible rank
   */
  static max(): LexoRank {
    return new LexoRank(`${DEFAULT_BUCKET}|${MAX_CHAR.repeat(6)}`);
  }

  /**
   * Generate middle rank
   */
  static middle(): LexoRank {
    return new LexoRank(`${DEFAULT_BUCKET}|${CHARSET[Math.floor(BASE / 2)].repeat(6)}`);
  }

  /**
   * Generate rank between two ranks
   */
  static between(prev: LexoRank, next: LexoRank): LexoRank {
    if (prev.compareTo(next) >= 0) {
      throw new Error('Previous rank must be less than next rank');
    }

    const prevValue = prev.getValue();
    const nextValue = next.getValue();

    // Extract bucket and rank parts
    const [prevBucket, prevRank] = prevValue.split('|');
    const [nextBucket, nextRank] = nextValue.split('|');

    if (prevBucket !== nextBucket) {
      throw new Error('Ranks must be in the same bucket');
    }

    const newRank = generateBetween(prevRank, nextRank);
    return new LexoRank(`${prevBucket}|${newRank}`);
  }

  /**
   * Generate multiple ranks between two ranks
   */
  static betweenMultiple(prev: LexoRank, next: LexoRank, count: number): LexoRank[] {
    if (count <= 0) return [];
    if (count === 1) return [LexoRank.between(prev, next)];

    const ranks: LexoRank[] = [];
    let current = prev;

    for (let i = 0; i < count; i++) {
      const newRank = LexoRank.between(current, next);
      ranks.push(newRank);
      current = newRank;
    }

    return ranks;
  }

  /**
   * Generate initial ranks for a list
   */
  static generateInitialRanks(count: number): LexoRank[] {
    if (count <= 0) return [];

    const ranks: LexoRank[] = [];
    const step = Math.floor(BASE / (count + 1));

    for (let i = 1; i <= count; i++) {
      const charIndex = Math.min(step * i, BASE - 1);
      const char = CHARSET[charIndex];
      ranks.push(new LexoRank(`${DEFAULT_BUCKET}|${char.repeat(6)}`));
    }

    return ranks;
  }

  /**
   * Rebalance ranks when they get too close
   */
  static rebalance(ranks: LexoRank[]): LexoRank[] {
    if (ranks.length <= 1) return ranks;

    const sorted = [...ranks].sort((a, b) => a.compareTo(b));
    return LexoRank.generateInitialRanks(sorted.length);
  }
}

/**
 * Generate a rank between two rank strings
 */
function generateBetween(prev: string, next: string): string {
  // Normalize lengths
  const maxLength = Math.max(prev.length, next.length);
  const prevNorm = prev.padEnd(maxLength, MIN_CHAR);
  const nextNorm = next.padEnd(maxLength, MIN_CHAR);

  let result = '';
  // let carry = 0;

  // Find the first position where they differ
  let diffIndex = 0;
  while (diffIndex < maxLength && prevNorm[diffIndex] === nextNorm[diffIndex]) {
    result += prevNorm[diffIndex];
    diffIndex++;
  }

  if (diffIndex === maxLength) {
    // Strings are identical, extend with middle character
    return result + CHARSET[Math.floor(BASE / 2)];
  }

  const prevChar = prevNorm[diffIndex];
  const nextChar = nextNorm[diffIndex];
  const prevIndex = CHARSET.indexOf(prevChar);
  const nextIndex = CHARSET.indexOf(nextChar);

  if (nextIndex - prevIndex > 1) {
    // Simple case: there's space between characters
    const midIndex = Math.floor((prevIndex + nextIndex) / 2);
    return result + CHARSET[midIndex];
  }

  // Complex case: adjacent characters, need to look deeper
  result += prevChar;

  // Look at the next position
  if (diffIndex + 1 < maxLength) {
    const nextPrevChar = prevNorm[diffIndex + 1];
    const nextNextChar = nextNorm[diffIndex + 1];
    const nextPrevIndex = CHARSET.indexOf(nextPrevChar);
    const nextNextIndex = CHARSET.indexOf(nextNextChar);

    if (nextNextIndex > nextPrevIndex) {
      const midIndex = Math.floor((nextPrevIndex + nextNextIndex) / 2);
      return result + CHARSET[midIndex];
    }
  }

  // Append middle character to create space
  return result + CHARSET[Math.floor(BASE / 2)];
}

// Utility functions for easier usage
const lexorank = {
  /**
   * Create a new LexoRank from string
   */
  parse: (value: string): LexoRank => LexoRank.parse(value),

  /**
   * Generate minimum rank
   */
  min: (): string => LexoRank.min().getValue(),

  /**
   * Generate maximum rank
   */
  max: (): string => LexoRank.max().getValue(),

  /**
   * Generate middle rank
   */
  middle: (): string => LexoRank.middle().getValue(),

  /**
   * Generate rank between two ranks
   */
  between: (prev: string, next: string): string => {
    return LexoRank.between(LexoRank.parse(prev), LexoRank.parse(next)).getValue();
  },

  /**
   * Generate multiple ranks between two ranks
   */
  betweenMultiple: (prev: string, next: string, count: number): string[] => {
    return LexoRank.betweenMultiple(LexoRank.parse(prev), LexoRank.parse(next), count).map((rank) =>
      rank.getValue(),
    );
  },

  /**
   * Generate initial ranks for a list
   */
  generateInitial: (count: number): string[] => {
    return LexoRank.generateInitialRanks(count).map((rank) => rank.getValue());
  },

  /**
   * Compare two rank strings
   */
  compare: (a: string, b: string): number => {
    return LexoRank.parse(a).compareTo(LexoRank.parse(b));
  },

  /**
   * Check if rank a comes before rank b
   */
  isBefore: (a: string, b: string): boolean => {
    return LexoRank.parse(a).isBefore(LexoRank.parse(b));
  },

  /**
   * Check if rank a comes after rank b
   */
  isAfter: (a: string, b: string): boolean => {
    return LexoRank.parse(a).isAfter(LexoRank.parse(b));
  },

  /**
   * Sort an array of items by their lexorank
   */
  sort: <T>(items: T[], getRank: (item: T) => string): T[] => {
    return items.sort((a, b) => lexorank.compare(getRank(a), getRank(b)));
  },

  /**
   * Rebalance ranks when they get too close
   */
  rebalance: (ranks: string[]): string[] => {
    const lexoRanks = ranks.map((rank) => LexoRank.parse(rank));
    return LexoRank.rebalance(lexoRanks).map((rank) => rank.getValue());
  },

  /**
   * Validate if a string is a valid lexorank
   */
  isValid: (value: string): boolean => {
    try {
      LexoRank.parse(value);
      return true;
    } catch {
      return false;
    }
  },
};

export default lexorank;
export { LexoRank };
