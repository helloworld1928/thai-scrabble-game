// Client-side game logic for Guest Mode
// Simplified version that doesn't require server

interface Tile {
  letter: string;
  score: number;
}

const THAI_LETTERS: Tile[] = [
  // พยัญชนะที่ใช้บ่อย (1 คะแนน)
  { letter: 'ก', score: 1 }, { letter: 'ก', score: 1 }, { letter: 'ก', score: 1 },
  { letter: 'น', score: 1 }, { letter: 'น', score: 1 }, { letter: 'น', score: 1 },
  { letter: 'ร', score: 1 }, { letter: 'ร', score: 1 }, { letter: 'ร', score: 1 },
  { letter: 'ม', score: 1 }, { letter: 'ม', score: 1 }, { letter: 'ม', score: 1 },
  { letter: 'ล', score: 1 }, { letter: 'ล', score: 1 },
  { letter: 'ว', score: 1 }, { letter: 'ว', score: 1 },
  { letter: 'ส', score: 1 }, { letter: 'ส', score: 1 },
  { letter: 'ห', score: 1 }, { letter: 'ห', score: 1 },
  
  // สระที่ใช้บ่อย (1 คะแนน)
  { letter: 'า', score: 1 }, { letter: 'า', score: 1 }, { letter: 'า', score: 1 },
  { letter: 'ิ', score: 1 }, { letter: 'ิ', score: 1 },
  { letter: 'ี', score: 1 }, { letter: 'ี', score: 1 },
  { letter: 'ุ', score: 1 }, { letter: 'ุ', score: 1 },
  { letter: 'ู', score: 1 }, { letter: 'ู', score: 1 },
  { letter: 'ะ', score: 1 }, { letter: 'ะ', score: 1 },
  { letter: 'ั', score: 1 }, { letter: 'ั', score: 1 },
  { letter: 'เ', score: 1 }, { letter: 'เ', score: 1 },
  { letter: 'แ', score: 1 }, { letter: 'แ', score: 1 },
  { letter: 'โ', score: 1 }, { letter: 'โ', score: 1 },
  { letter: 'ใ', score: 2 },
  { letter: 'ไ', score: 2 },
  
  // พยัญชนะปานกลาง (2 คะแนน)
  { letter: 'ค', score: 2 }, { letter: 'ค', score: 2 },
  { letter: 'ช', score: 2 }, { letter: 'ช', score: 2 },
  { letter: 'ต', score: 2 }, { letter: 'ต', score: 2 },
  { letter: 'ท', score: 2 }, { letter: 'ท', score: 2 },
  { letter: 'ป', score: 2 }, { letter: 'ป', score: 2 },
  { letter: 'บ', score: 2 }, { letter: 'บ', score: 2 },
  { letter: 'ย', score: 2 }, { letter: 'ย', score: 2 },
  
  // พยัญชนะที่ใช้น้อย (3 คะแนน)
  { letter: 'จ', score: 3 }, { letter: 'จ', score: 3 },
  { letter: 'ด', score: 3 }, { letter: 'ด', score: 3 },
  { letter: 'พ', score: 3 }, { letter: 'พ', score: 3 },
  { letter: 'ฟ', score: 3 },
  { letter: 'ภ', score: 3 },
  { letter: 'ศ', score: 3 },
  { letter: 'ษ', score: 3 },
  
  // พยัญชนะหายาก (4-5 คะแนน)
  { letter: 'ข', score: 4 },
  { letter: 'ฉ', score: 4 },
  { letter: 'ซ', score: 4 },
  { letter: 'ถ', score: 4 },
  { letter: 'ผ', score: 4 },
  { letter: 'ฝ', score: 4 },
  { letter: 'ฆ', score: 5 },
  { letter: 'ฌ', score: 5 },
  { letter: 'ญ', score: 5 },
  { letter: 'ฎ', score: 5 },
  { letter: 'ฏ', score: 5 },
  { letter: 'ฐ', score: 5 },
  { letter: 'ฑ', score: 5 },
  { letter: 'ฒ', score: 5 },
  
  // วรรณยุกต์และเครื่องหมาย (1 คะแนน)
  { letter: '่', score: 1 }, { letter: '่', score: 1 },
  { letter: '้', score: 1 }, { letter: '้', score: 1 },
  { letter: '๊', score: 2 },
  { letter: '๋', score: 2 },
  { letter: 'ํ', score: 2 },
  { letter: '์', score: 2 },
];

export function createTileBag(): string[] {
  return THAI_LETTERS.map(t => t.letter).sort(() => Math.random() - 0.5);
}

export function drawTiles(bag: string[], count: number): { tiles: string[], remainingBag: string[] } {
  const drawn = bag.slice(0, count);
  const remaining = bag.slice(count);
  return { tiles: drawn, remainingBag: remaining };
}

export function getTileScore(letter: string): number {
  const tile = THAI_LETTERS.find(t => t.letter === letter);
  return tile?.score || 1;
}

export function calculateWordScore(
  word: string,
  positions: { row: number; col: number }[],
  board: (string | null)[][]
): number {
  let score = 0;
  let wordMultiplier = 1;
  
  for (let i = 0; i < word.length; i++) {
    const letter = word[i];
    const pos = positions[i];
    let letterScore = getTileScore(letter);
    
    // Check if this is a newly placed tile
    if (board[pos.row][pos.col] === null) {
      // Apply multipliers based on position
      const multiplier = getBoardMultiplier(pos.row, pos.col);
      if (multiplier.type === 'letter') {
        letterScore *= multiplier.value;
      } else if (multiplier.type === 'word') {
        wordMultiplier *= multiplier.value;
      }
    }
    
    score += letterScore;
  }
  
  return score * wordMultiplier;
}

function getBoardMultiplier(row: number, col: number): { type: 'letter' | 'word' | null; value: number } {
  // Triple word score (corners)
  if ((row === 0 || row === 14) && (col === 0 || col === 14)) {
    return { type: 'word', value: 3 };
  }
  if ((row === 0 || row === 14) && (col === 7)) {
    return { type: 'word', value: 3 };
  }
  if ((row === 7) && (col === 0 || col === 14)) {
    return { type: 'word', value: 3 };
  }
  
  // Double word score
  if (row === col && (row >= 1 && row <= 4 || row >= 10 && row <= 13)) {
    return { type: 'word', value: 2 };
  }
  if (row + col === 14 && (row >= 1 && row <= 4 || row >= 10 && row <= 13)) {
    return { type: 'word', value: 2 };
  }
  
  // Triple letter score
  if ((row === 1 || row === 13) && (col === 5 || col === 9)) {
    return { type: 'letter', value: 3 };
  }
  if ((row === 5 || row === 9) && (col === 1 || col === 13)) {
    return { type: 'letter', value: 3 };
  }
  
  // Double letter score
  if ((row === 0 || row === 14) && (col === 3 || col === 11)) {
    return { type: 'letter', value: 2 };
  }
  if ((row === 3 || row === 11) && (col === 0 || col === 14)) {
    return { type: 'letter', value: 2 };
  }
  if ((row === 2 || row === 12) && (col === 6 || col === 8)) {
    return { type: 'letter', value: 2 };
  }
  if ((row === 6 || row === 8) && (col === 2 || col === 12)) {
    return { type: 'letter', value: 2 };
  }
  
  return { type: null, value: 1 };
}

// Simple AI that just places random valid words
export function getAIMove(
  board: (string | null)[][],
  aiTiles: string[]
): { positions: { row: number; col: number; letter: string }[]; word: string } | null {
  // Very simple AI: try to place tiles horizontally in the middle
  const row = 7;
  let col = 7;
  
  // Find empty spot
  while (col < 15 && board[row][col] !== null) {
    col++;
  }
  
  if (col >= 15 || aiTiles.length === 0) {
    return null;
  }
  
  // Place up to 3 tiles
  const positions: { row: number; col: number; letter: string }[] = [];
  const word = aiTiles.slice(0, Math.min(3, aiTiles.length)).join('');
  
  for (let i = 0; i < word.length && col + i < 15; i++) {
    if (board[row][col + i] === null) {
      positions.push({ row, col: col + i, letter: word[i] });
    }
  }
  
  return positions.length > 0 ? { positions, word } : null;
}
