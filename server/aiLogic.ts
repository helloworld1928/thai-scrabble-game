import { BoardCell, Tile, Position, PlacedWord, findFormedWords, validatePlacement, THAI_LETTER_DISTRIBUTION } from './gameLogic';

export interface AIMove {
  action: 'place' | 'swap' | 'pass';
  positions?: Position[];
  word?: string;
  score?: number;
  swapIndices?: number[];
}

// AI หาการเคลื่อนไหวที่ดีที่สุด
export async function findBestMove(
  board: BoardCell[][],
  aiTiles: Tile[],
  dictionary: string[],
  checkWordExists: (word: string) => Promise<boolean>
): Promise<AIMove> {
  const possibleMoves: AIMove[] = [];
  
  // หาตำแหน่งที่สามารถวางได้ทั้งหมด
  const anchorPoints = findAnchorPoints(board);
  
  if (anchorPoints.length === 0) {
    // เทิร์นแรก - วางที่จุดกลาง
    anchorPoints.push({ row: 7, col: 7, direction: 'horizontal' });
    anchorPoints.push({ row: 7, col: 7, direction: 'vertical' });
  }
  
  // ลองวางคำในทุกตำแหน่งที่เป็นไปได้
  for (const anchor of anchorPoints) {
    const moves = await generateMovesAtAnchor(board, aiTiles, anchor, dictionary, checkWordExists);
    possibleMoves.push(...moves);
  }
  
  // เลือกการเคลื่อนไหวที่ให้คะแนนสูงสุด
  if (possibleMoves.length > 0) {
    possibleMoves.sort((a, b) => (b.score || 0) - (a.score || 0));
    return possibleMoves[0];
  }
  
  // ถ้าไม่มีการเคลื่อนไหวที่ดี ให้สลับตัวอักษร
  const lowValueIndices = aiTiles
    .map((tile, index) => ({ tile, index }))
    .filter(({ tile }) => tile.score <= 2)
    .map(({ index }) => index)
    .slice(0, Math.min(3, aiTiles.length));
  
  if (lowValueIndices.length > 0) {
    return {
      action: 'swap',
      swapIndices: lowValueIndices,
    };
  }
  
  // สุดท้าย ข้ามเทิร์น
  return { action: 'pass' };
}

interface AnchorPoint {
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical';
}

// หาจุดที่สามารถวางคำได้
function findAnchorPoints(board: BoardCell[][]): AnchorPoint[] {
  const anchors: AnchorPoint[] = [];
  
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 15; col++) {
      if (board[row][col].letter !== null) {
        // ตรวจสอบ 4 ทิศทาง
        // ด้านขวา
        if (col < 14 && board[row][col + 1].letter === null) {
          anchors.push({ row, col: col + 1, direction: 'horizontal' });
        }
        // ด้านซ้าย
        if (col > 0 && board[row][col - 1].letter === null) {
          anchors.push({ row, col: col - 1, direction: 'horizontal' });
        }
        // ด้านล่าง
        if (row < 14 && board[row + 1][col].letter === null) {
          anchors.push({ row: row + 1, col, direction: 'vertical' });
        }
        // ด้านบน
        if (row > 0 && board[row - 1][col].letter === null) {
          anchors.push({ row: row - 1, col, direction: 'vertical' });
        }
      }
    }
  }
  
  // ลบ duplicate
  const unique = anchors.filter((anchor, index, self) =>
    index === self.findIndex(a => 
      a.row === anchor.row && a.col === anchor.col && a.direction === anchor.direction
    )
  );
  
  return unique;
}

// สร้างการเคลื่อนไหวที่เป็นไปได้ที่จุด anchor
async function generateMovesAtAnchor(
  board: BoardCell[][],
  aiTiles: Tile[],
  anchor: AnchorPoint,
  dictionary: string[],
  checkWordExists: (word: string) => Promise<boolean>
): Promise<AIMove[]> {
  const moves: AIMove[] = [];
  
  // ลองสร้างคำจากตัวอักษรที่มี (ความยาว 2-7)
  for (let length = 2; length <= Math.min(7, aiTiles.length); length++) {
    const combinations = generateCombinations(aiTiles, length);
    
    for (const combo of combinations) {
      const permutations = generatePermutations(combo);
      
      for (const perm of permutations) {
        const word = perm.map(t => t.letter).join('');
        
        // ตรวจสอบว่าคำนี้อยู่ในพจนานุกรมหรือไม่
        const exists = dictionary.includes(word) || await checkWordExists(word);
        
        if (exists) {
          // ลองวางคำที่ตำแหน่ง anchor
          const positions = tryPlaceWord(board, perm, anchor);
          
          if (positions) {
            const validation = validatePlacement(board, positions);
            
            if (validation.valid) {
              const words = findFormedWords(board, positions);
              
              // ตรวจสอบว่าทุกคำที่เกิดขึ้นถูกต้อง
              let allWordsValid = true;
              let totalScore = 0;
              
              for (const w of words) {
                const wordExists = dictionary.includes(w.word) || await checkWordExists(w.word);
                if (!wordExists) {
                  allWordsValid = false;
                  break;
                }
                totalScore += w.score;
              }
              
              if (allWordsValid) {
                moves.push({
                  action: 'place',
                  positions,
                  word,
                  score: totalScore,
                });
              }
            }
          }
        }
      }
    }
  }
  
  return moves;
}

// ลองวางคำที่ตำแหน่ง anchor
function tryPlaceWord(
  board: BoardCell[][],
  tiles: Tile[],
  anchor: AnchorPoint
): Position[] | null {
  const positions: Position[] = [];
  
  if (anchor.direction === 'horizontal') {
    // วางแนวนอน
    let col = anchor.col;
    
    for (const tile of tiles) {
      if (col >= 15) return null;
      
      // ข้ามตำแหน่งที่มีตัวอักษรอยู่แล้ว
      while (col < 15 && board[anchor.row][col].letter !== null) {
        col++;
      }
      
      if (col >= 15) return null;
      
      positions.push({
        row: anchor.row,
        col,
        letter: tile.letter,
      });
      
      col++;
    }
  } else {
    // วางแนวตั้ง
    let row = anchor.row;
    
    for (const tile of tiles) {
      if (row >= 15) return null;
      
      // ข้ามตำแหน่งที่มีตัวอักษรอยู่แล้ว
      while (row < 15 && board[row][anchor.col].letter !== null) {
        row++;
      }
      
      if (row >= 15) return null;
      
      positions.push({
        row,
        col: anchor.col,
        letter: tile.letter,
      });
      
      row++;
    }
  }
  
  return positions.length > 0 ? positions : null;
}

// สร้าง combinations ของตัวอักษร
function generateCombinations(tiles: Tile[], length: number): Tile[][] {
  if (length === 0) return [[]];
  if (tiles.length === 0) return [];
  
  const [first, ...rest] = tiles;
  const withoutFirst = generateCombinations(rest, length);
  const withFirst = generateCombinations(rest, length - 1).map(combo => [first, ...combo]);
  
  return [...withFirst, ...withoutFirst];
}

// สร้าง permutations ของตัวอักษร
function generatePermutations(tiles: Tile[]): Tile[][] {
  if (tiles.length <= 1) return [tiles];
  
  const perms: Tile[][] = [];
  
  for (let i = 0; i < tiles.length; i++) {
    const rest = [...tiles.slice(0, i), ...tiles.slice(i + 1)];
    const restPerms = generatePermutations(rest);
    
    for (const perm of restPerms) {
      perms.push([tiles[i], ...perm]);
    }
  }
  
  return perms;
}

// AI แบบง่าย - สำหรับระดับ ม.5
export async function findSimpleMove(
  board: BoardCell[][],
  aiTiles: Tile[],
  dictionary: string[],
  checkWordExists: (word: string) => Promise<boolean>
): Promise<AIMove> {
  // ใช้คำสั้นๆ จากพจนานุกรม (2-4 ตัวอักษร)
  const shortWords = dictionary.filter(w => w.length >= 2 && w.length <= 4);
  
  // สุ่มคำจากพจนานุกรม
  const shuffled = shortWords.sort(() => Math.random() - 0.5).slice(0, 50);
  
  const anchorPoints = findAnchorPoints(board);
  if (anchorPoints.length === 0) {
    anchorPoints.push({ row: 7, col: 7, direction: 'horizontal' });
  }
  
  // ลองวางคำแรกที่ทำได้
  for (const word of shuffled) {
    const wordLetters = word.split('');
    
    // ตรวจสอบว่ามีตัวอักษรพอหรือไม่
    const canMake = wordLetters.every(letter => {
      const count = aiTiles.filter(t => t.letter === letter).length;
      const needed = wordLetters.filter(l => l === letter).length;
      return count >= needed;
    });
    
    if (canMake) {
      // ลองวางที่ anchor point แรก
      const anchor = anchorPoints[0];
      const tiles = wordLetters.map(letter => 
        aiTiles.find(t => t.letter === letter)!
      );
      
      const positions = tryPlaceWord(board, tiles, anchor);
      
      if (positions) {
        const validation = validatePlacement(board, positions);
        
        if (validation.valid) {
          const words = findFormedWords(board, positions);
          const totalScore = words.reduce((sum, w) => sum + w.score, 0);
          
          return {
            action: 'place',
            positions,
            word,
            score: totalScore,
          };
        }
      }
    }
  }
  
  // ถ้าไม่สามารถวางได้ ให้ข้ามเทิร์น
  return { action: 'pass' };
}
