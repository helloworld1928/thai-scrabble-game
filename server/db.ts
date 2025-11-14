import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  dictionary, Dictionary, InsertDictionary,
  games, Game, InsertGame,
  gameMoves, GameMove, InsertGameMove,
  userStats, UserStats, InsertUserStats
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Dictionary helpers
export async function addWord(word: InsertDictionary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(dictionary).values(word);
}

export async function addWords(words: InsertDictionary[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(dictionary).values(words);
}

export async function checkWordExists(word: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(dictionary).where(eq(dictionary.word, word)).limit(1);
  return result.length > 0;
}

export async function getRandomWords(limit: number = 100): Promise<Dictionary[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(dictionary).limit(limit);
  return result;
}

// Game helpers
export async function createGame(game: InsertGame): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(games).values(game);
  return Number(result[0].insertId);
}

export async function getGame(gameId: number): Promise<Game | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(games).where(eq(games.id, gameId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateGame(gameId: number, updates: Partial<Game>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(games).set(updates).where(eq(games.id, gameId));
}

export async function getUserGames(userId: number): Promise<Game[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(games).where(eq(games.userId, userId)).orderBy(desc(games.createdAt));
  return result;
}

// Game moves helpers
export async function addGameMove(move: InsertGameMove) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(gameMoves).values(move);
}

export async function getGameMoves(gameId: number): Promise<GameMove[]> {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(gameMoves).where(eq(gameMoves.gameId, gameId)).orderBy(gameMoves.moveNumber);
  return result;
}

// User stats helpers
export async function getUserStats(userId: number): Promise<UserStats | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserStats(stats: InsertUserStats) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(userStats).values(stats).onDuplicateKeyUpdate({
    set: stats,
  });
}
