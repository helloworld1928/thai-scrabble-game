// Thai Scrabble Game Logic

export interface Tile {
  letter: string;
  score: number;
}

export interface BoardCell {
  letter: string | null;
  multiplier: {
    type: 'letter' | 'word' | null;
    value: number;
  };
  isNew?: boolean; // ใช้สำหรับระบุตัวอักษรที่เพิ่งวางในเทิร์นนี้
}

export interface Position {
  row: number;
  col: number;
  letter: string;
}

export interface PlacedWord {
  word: string;
  positions: Position[];
  score: number;
}

// การกระจายตัวอักษรภาษาไทยและคะแนน (ปรับให้เหมาะกับภาษาไทย)
export const THAI_LETTER_DISTRIBUTION: Record<string, { count: number; score: number }> = {
  // พยัญชนะที่ใช้บ่อย (1 คะแนน)
  'ก': { count: 4, score: 1 },
  'ง': { count: 3, score: 1 },
  'น': { count: 4, score: 1 },
  'ม': { count: 3, score: 1 },
  'ร': { count: 4, score: 1 },
  'ล': { count: 3, score: 1 },
  'ว': { count: 3, score: 1 },
  'ส': { count: 3, score: 1 },
  'ห': { count: 3, score: 1 },
  'อ': { count: 3, score: 1 },
  
  // พยัญชนะปานกลาง (2 คะแนน)
  'ค': { count: 3, score: 2 },
  'ช': { count: 2, score: 2 },
  'ต': { count: 3, score: 2 },
  'ท': { count: 3, score: 2 },
  'ป': { count: 3, score: 2 },
  'บ': { count: 2, score: 2 },
  'ย': { count: 2, score: 2 },
  
  // พยัญชนะที่ใช้น้อย (3 คะแนน)
  'จ': { count: 2, score: 3 },
  'ด': { count: 2, score: 3 },
  'พ': { count: 2, score: 3 },
  'ฟ': { count: 1, score: 3 },
  'ภ': { count: 1, score: 3 },
  'ศ': { count: 2, score: 3 },
  'ษ': { count: 1, score: 3 },
  
  // พยัญชนะหายาก (4 คะแนน)
  'ข': { count: 1, score: 4 },
  'ฉ': { count: 1, score: 4 },
  'ซ': { count: 1, score: 4 },
  'ถ': { count: 1, score: 4 },
  'ผ': { count: 1, score: 4 },
  'ฝ': { count: 1, score: 4 },
  
  // พยัญชนะหายากมาก (5 คะแนน)
  'ฆ': { count: 1, score: 5 },
  'ฌ': { count: 1, score: 5 },
  'ญ': { count: 1, score: 5 },
  'ฎ': { count: 1, score: 5 },
  'ฏ': { count: 1, score: 5 },
  'ฐ': { count: 1, score: 5 },
  'ฑ': { count: 1, score: 5 },
  'ฒ': { count: 1, score: 5 },
  
  // สระและวรรณยุกต์ (1 คะแนน)
  'า': { count: 5, score: 1 },
  'ิ': { count: 4, score: 1 },
  'ี': { count: 4, score: 1 },
  'ึ': { count: 2, score: 1 },
  'ื': { count: 2, score: 1 },
  'ุ': { count: 3, score: 1 },
  'ู': { count: 3, score: 1 },
  'เ': { count: 4, score: 1 },
  'แ': { count: 2, score: 1 },
  'โ': { count: 2, score: 1 },
  'ใ': { count: 1, score: 2 },
  'ไ': { count: 2, score: 1 },
  'ะ': { count: 2, score: 1 },
  'ั': { count: 3, score: 1 },
  'ํ': { count: 2, score: 2 },
  'ๆ': { count: 1, score: 2 },
  '่': { count: 3, score: 1 },
  '้': { count: 3, score: 1 },
  '๊': { count: 1, score: 2 },
  '๋': { count: 1, score: 2 },
  '์': { count: 2, score: 1 },
  
  // Blank tiles
  '_': { count: 2, score: 0 },
};

// กระดานขนาด 15x15 พร้อมช่องพิเศษ
export function createEmptyBoard(): BoardCell[][] {
  const board: BoardCell[][] = [];
  
  for (let row = 0; row < 15; row++) {
    board[row] = [];
    for (let col = 0; col < 15; col++) {
      board[row][col] = {
        letter: null,
        multiplier: getBoardMultiplier(row, col),
      };
    }
  }
  
  return board;
}

// กำหนดช่องพิเศษบนกระดาน (ตามมาตรฐาน Scrabble)
function getBoardMultiplier(row: number, col: number): { type: 'letter' | 'word' | null; value: number } {
  // Triple Word Score (สีแดง)
  if ((row === 0 && col === 0) || (row === 0 && col === 7) || (row === 0 && col === 14) ||
      (row === 7 && col === 0) || (row === 7 && col === 14) ||
      (row === 14 && col === 0) || (row === 14 && col === 7) || (row === 14 && col === 14)) {
    return { type: 'word', value: 3 };
  }
  
  // Double Word Score (สีชมพู)
  if ((row === 1 && col === 1) || (row === 2 && col === 2) || (row === 3 && col === 3) || (row === 4 && col === 4) ||
      (row === 1 && col === 13) || (row === 2 && col === 12) || (row === 3 && col === 11) || (row === 4 && col === 10) ||
      (row === 13 && col === 1) || (row === 12 && col === 2) || (row === 11 && col === 3) || (row === 10 && col === 4) ||
      (row === 13 && col === 13) || (row === 12 && col === 12) || (row === 11 && col === 11) || (row === 10 && col === 10) ||
      (row === 7 && col === 7)) {
    return { type: 'word', value: 2 };
  }
  
  // Triple Letter Score (สีน้ำเงินเข้ม)
  if ((row === 1 && col === 5) || (row === 1 && col === 9) ||
      (row === 5 && col === 1) || (row === 5 && col === 5) || (row === 5 && col === 9) || (row === 5 && col === 13) ||
      (row === 9 && col === 1) || (row === 9 && col === 5) || (row === 9 && col === 9) || (row === 9 && col === 13) ||
      (row === 13 && col === 5) || (row === 13 && col === 9)) {
    return { type: 'letter', value: 3 };
  }
  
  // Double Letter Score (สีน้ำเงินอ่อน)
  if ((row === 0 && col === 3) || (row === 0 && col === 11) ||
      (row === 2 && col === 6) || (row === 2 && col === 8) ||
      (row === 3 && col === 0) || (row === 3 && col === 7) || (row === 3 && col === 14) ||
      (row === 6 && col === 2) || (row === 6 && col === 6) || (row === 6 && col === 8) || (row === 6 && col === 12) ||
      (row === 7 && col === 3) || (row === 7 && col === 11) ||
      (row === 8 && col === 2) || (row === 8 && col === 6) || (row === 8 && col === 8) || (row === 8 && col === 12) ||
      (row === 11 && col === 0) || (row === 11 && col === 7) || (row === 11 && col === 14) ||
      (row === 12 && col === 6) || (row === 12 && col === 8) ||
      (row === 14 && col === 3) || (row === 14 && col === 11)) {
    return { type: 'letter', value: 2 };
  }
  
  return { type: null, value: 1 };
}

// สร้างถุงตัวอักษร
export function createTileBag(): Tile[] {
  const bag: Tile[] = [];
  
  for (const [letter, { count, score }] of Object.entries(THAI_LETTER_DISTRIBUTION)) {
    for (let i = 0; i < count; i++) {
      bag.push({ letter, score });
    }
  }
  
  // สุ่มลำดับตัวอักษร
  return shuffleArray(bag);
}

// สุ่มลำดับ array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// จั่วตัวอักษรจากถุง
export function drawTiles(bag: Tile[], count: number): { drawn: Tile[]; remaining: Tile[] } {
  const drawn = bag.slice(0, count);
  const remaining = bag.slice(count);
  return { drawn, remaining };
}

// ตรวจสอบการวางคำ
export function validatePlacement(
  board: BoardCell[][],
  positions: Position[]
): { valid: boolean; error?: string } {
  if (positions.length === 0) {
    return { valid: false, error: 'ต้องวางตัวอักษรอย่างน้อย 1 ตัว' };
  }
  
  // ตรวจสอบว่าทุกตำแหน่งอยู่ในกระดาน
  for (const pos of positions) {
    if (pos.row < 0 || pos.row >= 15 || pos.col < 0 || pos.col >= 15) {
      return { valid: false, error: 'ตำแหน่งอยู่นอกกระดาน' };
    }
    if (board[pos.row][pos.col].letter !== null) {
      return { valid: false, error: 'ตำแหน่งนี้มีตัวอักษรอยู่แล้ว' };
    }
  }
  
  // ตรวจสอบว่าวางในแนวเดียวกัน (แนวนอนหรือแนวตั้ง)
  const isHorizontal = positions.every(p => p.row === positions[0].row);
  const isVertical = positions.every(p => p.col === positions[0].col);
  
  if (!isHorizontal && !isVertical) {
    return { valid: false, error: 'ต้องวางตัวอักษรในแนวเดียวกัน (แนวนอนหรือแนวตั้ง)' };
  }
  
  // เรียงตำแหน่งตามลำดับ
  const sorted = [...positions].sort((a, b) => 
    isHorizontal ? a.col - b.col : a.row - b.row
  );
  
  // ตรวจสอบว่าไม่มีช่องว่างระหว่างตัวอักษร (ยกเว้นมีตัวอักษรเดิมอยู่)
  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    
    if (isHorizontal) {
      const gap = next.col - current.col;
      if (gap > 1) {
        // ตรวจสอบว่าช่องระหว่างมีตัวอักษรเดิมหรือไม่
        for (let col = current.col + 1; col < next.col; col++) {
          if (board[current.row][col].letter === null) {
            return { valid: false, error: 'ต้องไม่มีช่องว่างระหว่างตัวอักษร' };
          }
        }
      }
    } else {
      const gap = next.row - current.row;
      if (gap > 1) {
        for (let row = current.row + 1; row < next.row; row++) {
          if (board[row][current.col].letter === null) {
            return { valid: false, error: 'ต้องไม่มีช่องว่างระหว่างตัวอักษร' };
          }
        }
      }
    }
  }
  
  // ตรวจสอบว่าต่อกับคำเดิมหรือไม่ (ยกเว้นเทิร์นแรก - ต้องผ่านจุดกลาง)
  const hasExistingLetters = board.some(row => row.some(cell => cell.letter !== null));
  
  if (!hasExistingLetters) {
    // เทิร์นแรก - ต้องผ่านจุดกลาง (7, 7)
    const passesCenter = positions.some(p => p.row === 7 && p.col === 7);
    if (!passesCenter) {
      return { valid: false, error: 'เทิร์นแรกต้องวางผ่านจุดกลางกระดาน' };
    }
  } else {
    // เทิร์นถัดไป - ต้องต่อกับคำเดิม
    let touchesExisting = false;
    
    for (const pos of positions) {
      // ตรวจสอบ 4 ทิศ
      const neighbors = [
        { row: pos.row - 1, col: pos.col },
        { row: pos.row + 1, col: pos.col },
        { row: pos.row, col: pos.col - 1 },
        { row: pos.row, col: pos.col + 1 },
      ];
      
      for (const neighbor of neighbors) {
        if (neighbor.row >= 0 && neighbor.row < 15 && neighbor.col >= 0 && neighbor.col < 15) {
          if (board[neighbor.row][neighbor.col].letter !== null) {
            touchesExisting = true;
            break;
          }
        }
      }
      
      if (touchesExisting) break;
    }
    
    if (!touchesExisting) {
      return { valid: false, error: 'ต้องต่อกับคำที่มีอยู่แล้ว' };
    }
  }
  
  return { valid: true };
}

// หาคำทั้งหมดที่เกิดขึ้นจากการวาง
export function findFormedWords(
  board: BoardCell[][],
  positions: Position[]
): PlacedWord[] {
  const words: PlacedWord[] = [];
  
  // สร้าง board ชั่วคราวที่มีตัวอักษรใหม่
  const tempBoard = board.map(row => row.map(cell => ({ ...cell })));
  for (const pos of positions) {
    tempBoard[pos.row][pos.col] = {
      ...tempBoard[pos.row][pos.col],
      letter: pos.letter,
      isNew: true,
    };
  }
  
  // หาคำหลัก (คำที่วาง)
  const isHorizontal = positions.every(p => p.row === positions[0].row);
  const mainWord = extractMainWord(tempBoard, positions, isHorizontal);
  if (mainWord) {
    words.push(mainWord);
  }
  
  // หาคำตั้งฉาก (perpendicular words)
  for (const pos of positions) {
    const perpWord = extractPerpendicularWord(tempBoard, pos, isHorizontal);
    if (perpWord && perpWord.word.length > 1) {
      words.push(perpWord);
    }
  }
  
  return words;
}

function extractMainWord(
  board: BoardCell[][],
  positions: Position[],
  isHorizontal: boolean
): PlacedWord | null {
  const sorted = [...positions].sort((a, b) => 
    isHorizontal ? a.col - b.col : a.row - b.row
  );
  
  const row = sorted[0].row;
  const col = sorted[0].col;
  
  let startRow = row;
  let startCol = col;
  
  // หาจุดเริ่มต้นของคำ
  if (isHorizontal) {
    while (startCol > 0 && board[row][startCol - 1].letter !== null) {
      startCol--;
    }
  } else {
    while (startRow > 0 && board[startRow - 1][col].letter !== null) {
      startRow--;
    }
  }
  
  // สร้างคำและเก็บตำแหน่ง
  let word = '';
  const wordPositions: Position[] = [];
  
  if (isHorizontal) {
    let c = startCol;
    while (c < 15 && board[row][c].letter !== null) {
      word += board[row][c].letter;
      wordPositions.push({ row, col: c, letter: board[row][c].letter! });
      c++;
    }
  } else {
    let r = startRow;
    while (r < 15 && board[r][col].letter !== null) {
      word += board[r][col].letter;
      wordPositions.push({ row: r, col, letter: board[r][col].letter! });
      r++;
    }
  }
  
  if (word.length <= 1) return null;
  
  // คำนวณคะแนน
  const score = calculateWordScore(board, wordPositions);
  
  return { word, positions: wordPositions, score };
}

function extractPerpendicularWord(
  board: BoardCell[][],
  pos: Position,
  mainIsHorizontal: boolean
): PlacedWord | null {
  const { row, col } = pos;
  
  if (mainIsHorizontal) {
    // หาคำแนวตั้ง
    let startRow = row;
    while (startRow > 0 && board[startRow - 1][col].letter !== null) {
      startRow--;
    }
    
    let word = '';
    const wordPositions: Position[] = [];
    let r = startRow;
    
    while (r < 15 && board[r][col].letter !== null) {
      word += board[r][col].letter;
      wordPositions.push({ row: r, col, letter: board[r][col].letter! });
      r++;
    }
    
    if (word.length <= 1) return null;
    
    const score = calculateWordScore(board, wordPositions);
    return { word, positions: wordPositions, score };
  } else {
    // หาคำแนวนอน
    let startCol = col;
    while (startCol > 0 && board[row][startCol - 1].letter !== null) {
      startCol--;
    }
    
    let word = '';
    const wordPositions: Position[] = [];
    let c = startCol;
    
    while (c < 15 && board[row][c].letter !== null) {
      word += board[row][c].letter;
      wordPositions.push({ row, col: c, letter: board[row][c].letter! });
      c++;
    }
    
    if (word.length <= 1) return null;
    
    const score = calculateWordScore(board, wordPositions);
    return { word, positions: wordPositions, score };
  }
}

// คำนวณคะแนนของคำ
function calculateWordScore(board: BoardCell[][], positions: Position[]): number {
  let score = 0;
  let wordMultiplier = 1;
  
  for (const pos of positions) {
    const cell = board[pos.row][pos.col];
    const letterScore = THAI_LETTER_DISTRIBUTION[pos.letter]?.score || 0;
    
    if (cell.isNew) {
      // ใช้ multiplier เฉพาะตัวอักษรใหม่
      if (cell.multiplier.type === 'letter') {
        score += letterScore * cell.multiplier.value;
      } else if (cell.multiplier.type === 'word') {
        score += letterScore;
        wordMultiplier *= cell.multiplier.value;
      } else {
        score += letterScore;
      }
    } else {
      score += letterScore;
    }
  }
  
  score *= wordMultiplier;
  
  // โบนัส: ถ้าใช้ตัวอักษรทั้ง 7 ตัว
  const newLettersCount = positions.filter(pos => board[pos.row][pos.col].isNew).length;
  if (newLettersCount === 7) {
    score += 50;
  }
  
  return score;
}

// ตรวจสอบว่าเกมจบหรือยัง
export function isGameOver(tileBag: Tile[], playerTiles: Tile[], aiTiles: Tile[]): boolean {
  // เกมจบเมื่อถุงตัวอักษรหมดและผู้เล่นคนใดคนหนึ่งไม่มีตัวอักษรเหลือ
  return tileBag.length === 0 && (playerTiles.length === 0 || aiTiles.length === 0);
}
