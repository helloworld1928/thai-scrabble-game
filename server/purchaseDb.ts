import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { purchases, users, InsertPurchase } from "../drizzle/schema";

export async function createPurchase(purchase: InsertPurchase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(purchases).values(purchase);
  return result;
}

export async function getPurchaseBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(purchases)
    .where(eq(purchases.stripeSessionId, sessionId))
    .limit(1);
  
  return result[0];
}

export async function updatePurchaseStatus(
  sessionId: string,
  status: "completed" | "failed",
  paymentIntentId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(purchases)
    .set({
      status,
      stripePaymentIntentId: paymentIntentId,
      completedAt: status === "completed" ? new Date() : undefined,
    })
    .where(eq(purchases.stripeSessionId, sessionId));
}

export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(purchases)
    .where(and(
      eq(purchases.userId, userId),
      eq(purchases.status, "completed")
    ))
    .orderBy(desc(purchases.createdAt));
  
  return result;
}

export async function hasUserPurchased(userId: number, productId: string) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(purchases)
    .where(and(
      eq(purchases.userId, userId),
      eq(purchases.productId, productId),
      eq(purchases.status, "completed")
    ))
    .limit(1);
  
  return result.length > 0;
}

export async function updateUserStripeCustomerId(userId: number, customerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(users)
    .set({ stripeCustomerId: customerId })
    .where(eq(users.id, userId));
}

export async function getUserStripeCustomerId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  return result[0]?.stripeCustomerId;
}
