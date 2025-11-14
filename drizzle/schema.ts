import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Thai word dictionary for validation
 */
export const dictionary = mysqlTable("dictionary", {
  id: int("id").autoincrement().primaryKey(),
  word: varchar("word", { length: 100 }).notNull().unique(),
  definition: text("definition"),
  category: varchar("category", { length: 50 }), // วิทยาศาสตร์, สังคม, ภาษาไทย, ทั่วไป
  difficulty: int("difficulty").default(1), // 1-5 (1=ง่าย, 5=ยาก)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Dictionary = typeof dictionary.$inferSelect;
export type InsertDictionary = typeof dictionary.$inferInsert;

/**
 * Game sessions
 */
export const games = mysqlTable("games", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["playing", "finished", "abandoned"]).default("playing").notNull(),
  playerScore: int("playerScore").default(0).notNull(),
  aiScore: int("aiScore").default(0).notNull(),
  currentTurn: mysqlEnum("currentTurn", ["player", "ai"]).default("player").notNull(),
  boardState: text("boardState").notNull(), // JSON string of 15x15 board
  playerTiles: varchar("playerTiles", { length: 50 }).notNull(), // JSON array of 7 tiles
  aiTiles: varchar("aiTiles", { length: 50 }).notNull(), // JSON array of 7 tiles
  tileBag: text("tileBag").notNull(), // JSON array of remaining tiles
  winner: mysqlEnum("winner", ["player", "ai", "draw"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  finishedAt: timestamp("finishedAt"),
});

export type Game = typeof games.$inferSelect;
export type InsertGame = typeof games.$inferInsert;

/**
 * Game moves history
 */
export const gameMoves = mysqlTable("game_moves", {
  id: int("id").autoincrement().primaryKey(),
  gameId: int("gameId").notNull(),
  moveNumber: int("moveNumber").notNull(),
  player: mysqlEnum("player", ["player", "ai"]).notNull(),
  word: varchar("word", { length: 100 }),
  positions: text("positions"), // JSON array of {row, col, letter}
  score: int("score").default(0).notNull(),
  action: mysqlEnum("action", ["place", "swap", "pass"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GameMove = typeof gameMoves.$inferSelect;
export type InsertGameMove = typeof gameMoves.$inferInsert;

/**
 * User statistics
 */
export const userStats = mysqlTable("user_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  gamesPlayed: int("gamesPlayed").default(0).notNull(),
  gamesWon: int("gamesWon").default(0).notNull(),
  gamesLost: int("gamesLost").default(0).notNull(),
  gamesDraw: int("gamesDraw").default(0).notNull(),
  totalScore: int("totalScore").default(0).notNull(),
  highestScore: int("highestScore").default(0).notNull(),
  averageScore: int("averageScore").default(0).notNull(),
  longestWord: varchar("longestWord", { length: 100 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;
