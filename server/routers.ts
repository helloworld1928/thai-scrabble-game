import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { 
  createEmptyBoard, 
  createTileBag, 
  drawTiles, 
  validatePlacement, 
  findFormedWords,
  isGameOver,
  Position,
  Tile
} from "./gameLogic";
import { findSimpleMove } from "./aiLogic";
import { THAI_WORDS, isValidWord } from "./thaiWords";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dictionary management
  dictionary: router({
    // เพิ่มคำลงพจนานุกรม
    seedWords: protectedProcedure.mutation(async () => {
      const words = THAI_WORDS.map(word => ({
        word,
        category: 'ทั่วไป',
        difficulty: Math.min(5, Math.max(1, Math.floor(word.length / 2))),
      }));
      
      await db.addWords(words);
      return { success: true, count: words.length };
    }),
    
    // ตรวจสอบคำ
    checkWord: publicProcedure
      .input(z.object({ word: z.string() }))
      .query(async ({ input }) => {
        const exists = await db.checkWordExists(input.word);
        return { exists };
      }),
  }),

  // Game management
  game: router({
    // สร้างเกมใหม่
    create: protectedProcedure.mutation(async ({ ctx }) => {
      const board = createEmptyBoard();
      const tileBag = createTileBag();
      
      const { drawn: playerTiles, remaining: afterPlayer } = drawTiles(tileBag, 7);
      const { drawn: aiTiles, remaining: finalBag } = drawTiles(afterPlayer, 7);
      
      const gameId = await db.createGame({
        userId: ctx.user.id,
        status: 'playing',
        playerScore: 0,
        aiScore: 0,
        currentTurn: 'player',
        boardState: JSON.stringify(board),
        playerTiles: JSON.stringify(playerTiles),
        aiTiles: JSON.stringify(aiTiles),
        tileBag: JSON.stringify(finalBag),
      });
      
      const game = await db.getGame(gameId);
      return game;
    }),
    
    // ดึงข้อมูลเกม
    get: protectedProcedure
      .input(z.object({ gameId: z.number() }))
      .query(async ({ input, ctx }) => {
        const game = await db.getGame(input.gameId);
        if (!game || game.userId !== ctx.user.id) {
          throw new Error('Game not found');
        }
        
        return {
          ...game,
          boardState: JSON.parse(game.boardState),
          playerTiles: JSON.parse(game.playerTiles),
          aiTiles: game.status === 'finished' ? JSON.parse(game.aiTiles) : [], // ซ่อนตัวอักษร AI ถ้ายังเล่นอยู่
          tileBag: JSON.parse(game.tileBag),
        };
      }),
    
    // วางคำ
    placeWord: protectedProcedure
      .input(z.object({
        gameId: z.number(),
        positions: z.array(z.object({
          row: z.number(),
          col: z.number(),
          letter: z.string(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const game = await db.getGame(input.gameId);
        if (!game || game.userId !== ctx.user.id) {
          throw new Error('Game not found');
        }
        
        if (game.status !== 'playing') {
          throw new Error('Game is not active');
        }
        
        if (game.currentTurn !== 'player') {
          throw new Error('Not your turn');
        }
        
        const board = JSON.parse(game.boardState);
        const playerTiles: Tile[] = JSON.parse(game.playerTiles);
        const tileBag: Tile[] = JSON.parse(game.tileBag);
        
        // ตรวจสอบว่าผู้เล่นมีตัวอักษรที่ต้องการวาง
        const usedLetters = input.positions.map(p => p.letter);
        const availableLetters = [...playerTiles.map(t => t.letter)];
        
        for (const letter of usedLetters) {
          const index = availableLetters.indexOf(letter);
          if (index === -1) {
            throw new Error(`You don't have the letter: ${letter}`);
          }
          availableLetters.splice(index, 1);
        }
        
        // ตรวจสอบการวาง
        const validation = validatePlacement(board, input.positions);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        
        // หาคำที่เกิดขึ้น
        const formedWords = findFormedWords(board, input.positions);
        
        // ตรวจสอบว่าทุกคำถูกต้อง
        for (const word of formedWords) {
          const exists = await db.checkWordExists(word.word);
          if (!exists && !isValidWord(word.word)) {
            throw new Error(`Invalid word: ${word.word}`);
          }
        }
        
        // คำนวณคะแนนรวม
        const totalScore = formedWords.reduce((sum, w) => sum + w.score, 0);
        
        // อัพเดทกระดาน
        for (const pos of input.positions) {
          board[pos.row][pos.col].letter = pos.letter;
          board[pos.row][pos.col].isNew = false;
        }
        
        // ลบตัวอักษรที่ใช้ไปและจั่วใหม่
        const remainingTiles = playerTiles.filter(
          tile => !usedLetters.includes(tile.letter) || 
          usedLetters.splice(usedLetters.indexOf(tile.letter), 1).length === 0
        );
        
        const { drawn: newTiles, remaining: newBag } = drawTiles(
          tileBag, 
          Math.min(7 - remainingTiles.length, tileBag.length)
        );
        
        const updatedPlayerTiles = [...remainingTiles, ...newTiles];
        
        // บันทึกการเคลื่อนไหว
        const moves = await db.getGameMoves(input.gameId);
        await db.addGameMove({
          gameId: input.gameId,
          moveNumber: moves.length + 1,
          player: 'player',
          word: formedWords[0]?.word || '',
          positions: JSON.stringify(input.positions),
          score: totalScore,
          action: 'place',
        });
        
        // อัพเดทเกม
        await db.updateGame(input.gameId, {
          boardState: JSON.stringify(board),
          playerTiles: JSON.stringify(updatedPlayerTiles),
          tileBag: JSON.stringify(newBag),
          playerScore: game.playerScore + totalScore,
          currentTurn: 'ai',
        });
        
        return {
          success: true,
          score: totalScore,
          words: formedWords,
        };
      }),
    
    // AI เล่น
    aiTurn: protectedProcedure
      .input(z.object({ gameId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const game = await db.getGame(input.gameId);
        if (!game || game.userId !== ctx.user.id) {
          throw new Error('Game not found');
        }
        
        if (game.status !== 'playing') {
          throw new Error('Game is not active');
        }
        
        if (game.currentTurn !== 'ai') {
          throw new Error('Not AI turn');
        }
        
        const board = JSON.parse(game.boardState);
        const aiTiles: Tile[] = JSON.parse(game.aiTiles);
        const tileBag: Tile[] = JSON.parse(game.tileBag);
        
        // AI หาการเคลื่อนไหว
        const aiMove = await findSimpleMove(
          board,
          aiTiles,
          THAI_WORDS,
          async (word: string) => await db.checkWordExists(word)
        );
        
        let aiScore = 0;
        let updatedAiTiles = [...aiTiles];
        let updatedBag = [...tileBag];
        
        if (aiMove.action === 'place' && aiMove.positions) {
          // วางคำ
          for (const pos of aiMove.positions) {
            board[pos.row][pos.col].letter = pos.letter;
            board[pos.row][pos.col].isNew = false;
          }
          
          aiScore = aiMove.score || 0;
          
          // ลบตัวอักษรที่ใช้และจั่วใหม่
          const usedLetters = aiMove.positions.map(p => p.letter);
          updatedAiTiles = aiTiles.filter(
            tile => !usedLetters.includes(tile.letter) || 
            usedLetters.splice(usedLetters.indexOf(tile.letter), 1).length === 0
          );
          
          const { drawn: newTiles, remaining: newBag } = drawTiles(
            tileBag,
            Math.min(7 - updatedAiTiles.length, tileBag.length)
          );
          
          updatedAiTiles = [...updatedAiTiles, ...newTiles];
          updatedBag = newBag;
          
          // บันทึกการเคลื่อนไหว
          const moves = await db.getGameMoves(input.gameId);
          await db.addGameMove({
            gameId: input.gameId,
            moveNumber: moves.length + 1,
            player: 'ai',
            word: aiMove.word || '',
            positions: JSON.stringify(aiMove.positions),
            score: aiScore,
            action: 'place',
          });
        } else {
          // Pass
          const moves = await db.getGameMoves(input.gameId);
          await db.addGameMove({
            gameId: input.gameId,
            moveNumber: moves.length + 1,
            player: 'ai',
            action: 'pass',
            score: 0,
          });
        }
        
        // ตรวจสอบว่าเกมจบหรือยัง
        const playerTiles: Tile[] = JSON.parse(game.playerTiles);
        const gameOver = isGameOver(updatedBag, playerTiles, updatedAiTiles);
        
        let winner: 'player' | 'ai' | 'draw' | undefined;
        if (gameOver) {
          const finalPlayerScore = game.playerScore;
          const finalAiScore = game.aiScore + aiScore;
          
          if (finalPlayerScore > finalAiScore) {
            winner = 'player';
          } else if (finalAiScore > finalPlayerScore) {
            winner = 'ai';
          } else {
            winner = 'draw';
          }
        }
        
        // อัพเดทเกม
        await db.updateGame(input.gameId, {
          boardState: JSON.stringify(board),
          aiTiles: JSON.stringify(updatedAiTiles),
          tileBag: JSON.stringify(updatedBag),
          aiScore: game.aiScore + aiScore,
          currentTurn: gameOver ? game.currentTurn : 'player',
          status: gameOver ? 'finished' : 'playing',
          winner,
          finishedAt: gameOver ? new Date() : undefined,
        });
        
        // อัพเดทสถิติ
        if (gameOver && winner) {
          const stats = await db.getUserStats(ctx.user.id);
          const gamesPlayed = (stats?.gamesPlayed || 0) + 1;
          const gamesWon = (stats?.gamesWon || 0) + (winner === 'player' ? 1 : 0);
          const gamesLost = (stats?.gamesLost || 0) + (winner === 'ai' ? 1 : 0);
          const gamesDraw = (stats?.gamesDraw || 0) + (winner === 'draw' ? 1 : 0);
          const totalScore = (stats?.totalScore || 0) + game.playerScore;
          const averageScore = Math.floor(totalScore / gamesPlayed);
          const highestScore = Math.max(stats?.highestScore || 0, game.playerScore);
          
          await db.upsertUserStats({
            userId: ctx.user.id,
            gamesPlayed,
            gamesWon,
            gamesLost,
            gamesDraw,
            totalScore,
            averageScore,
            highestScore,
          });
        }
        
        return {
          success: true,
          action: aiMove.action,
          score: aiScore,
          word: aiMove.word,
          positions: aiMove.positions,
          gameOver,
          winner,
        };
      }),
    
    // ข้ามเทิร์น
    pass: protectedProcedure
      .input(z.object({ gameId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const game = await db.getGame(input.gameId);
        if (!game || game.userId !== ctx.user.id) {
          throw new Error('Game not found');
        }
        
        if (game.status !== 'playing') {
          throw new Error('Game is not active');
        }
        
        if (game.currentTurn !== 'player') {
          throw new Error('Not your turn');
        }
        
        // บันทึกการเคลื่อนไหว
        const moves = await db.getGameMoves(input.gameId);
        await db.addGameMove({
          gameId: input.gameId,
          moveNumber: moves.length + 1,
          player: 'player',
          action: 'pass',
          score: 0,
        });
        
        // อัพเดทเกม
        await db.updateGame(input.gameId, {
          currentTurn: 'ai',
        });
        
        return { success: true };
      }),
    
    // ดูประวัติเกม
    list: protectedProcedure.query(async ({ ctx }) => {
      const games = await db.getUserGames(ctx.user.id);
      return games;
    }),
    
    // ดูประวัติการเคลื่อนไหว
    getMoves: protectedProcedure
      .input(z.object({ gameId: z.number() }))
      .query(async ({ input, ctx }) => {
        const game = await db.getGame(input.gameId);
        if (!game || game.userId !== ctx.user.id) {
          throw new Error('Game not found');
        }
        
        const moves = await db.getGameMoves(input.gameId);
        return moves;
      }),
  }),

  // User stats
  stats: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const stats = await db.getUserStats(ctx.user.id);
      return stats || {
        userId: ctx.user.id,
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        gamesDraw: 0,
        totalScore: 0,
        highestScore: 0,
        averageScore: 0,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
