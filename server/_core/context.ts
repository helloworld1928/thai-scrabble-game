import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { supabase } from "../supabase";
import { getUserByOpenId, upsertUser } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Get access token from Authorization header or cookie
    const authHeader = opts.req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '') || opts.req.cookies?.['sb-access-token'];

    if (token) {
      // Verify token with Supabase
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (supabaseUser && !error) {
        // Get or create user in our database
          user = (await getUserByOpenId(supabaseUser.id)) || null;

        if (!user) {
          // Create new user
          await upsertUser({
            openId: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'Anonymous',
            email: supabaseUser.email || null,
            loginMethod: 'supabase',
            lastSignedIn: new Date(),
          });

          user = (await getUserByOpenId(supabaseUser.id)) || null;
        } else {
          // Update last signed in
          await upsertUser({
            openId: supabaseUser.id,
            lastSignedIn: new Date(),
          });
        }
      }
    }
  } catch (error) {
    console.error('[Auth] Error authenticating request:', error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
