# คู่มือ Deployment - เกม Scrabble ภาษาไทย

## 📋 สถานะปัจจุบัน

โปรเจกต์นี้ถูก push ไป GitHub แล้วที่: **https://github.com/helloworld1928/thai-scrabble-game**

### ปัญหาที่พบใน Development Environment

ระบบ **Manus OAuth ไม่ทำงานใน development environment** ทำให้:
- ผู้ใช้ล็อกอินแล้วแต่ session cookie ไม่ถูกบันทึก
- เมื่อคลิก "เริ่มเล่น" ได้ 500 Internal Server Error
- `protectedProcedure` ตรวจสอบไม่ผ่าน

### วิธีแก้ไข

**Deploy ไป production environment** (Vercel หรือ Netlify) และเปลี่ยนระบบ authentication เป็น provider ที่รองรับ production

---

## 🚀 วิธี Deploy ไป Vercel (แนะนำ)

### ขั้นตอนที่ 1: เตรียม Repository

1. ✅ โค้ดถูก push ไป GitHub แล้ว
2. ตรวจสอบว่าไฟล์ `.gitignore` มี:
   ```
   node_modules/
   .env
   .env.local
   dist/
   ```

### ขั้นตอนที่ 2: Deploy ไป Vercel

1. ไปที่ https://vercel.com และล็อกอินด้วย GitHub
2. คลิก **"New Project"**
3. เลือก repository: `helloworld1928/thai-scrabble-game`
4. คลิก **"Import"**
5. ตั้งค่า Build & Development Settings:
   - **Framework Preset**: Other
   - **Build Command**: `pnpm install && pnpm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`

### ขั้นตอนที่ 3: ตั้งค่า Environment Variables

ใน Vercel Dashboard → Settings → Environment Variables เพิ่ม:

```bash
# Database (ใช้ PlanetScale หรือ Supabase)
DATABASE_URL=mysql://...

# JWT Secret (สร้างใหม่)
JWT_SECRET=your-random-secret-key-here

# Stripe (ใช้ค่าเดิมจาก Manus)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App Info
VITE_APP_TITLE=เกม Scrabble ภาษาไทย
VITE_APP_LOGO=/logo.svg

# OAuth (ตั้งค่าใหม่ - ดูด้านล่าง)
OAUTH_SERVER_URL=...
VITE_OAUTH_PORTAL_URL=...
```

---

## 🔐 แก้ไขระบบ Authentication

เนื่องจาก Manus OAuth ไม่รองรับ production environment คุณต้องเปลี่ยนเป็น OAuth provider อื่น

### ตัวเลือกที่แนะนำ:

#### 1. **NextAuth.js** (แนะนำที่สุด)
- รองรับ Google, Facebook, GitHub OAuth
- ติดตั้งง่าย มี documentation ครบถ้วน
- ฟรี

**วิธีติดตั้ง:**
```bash
pnpm add next-auth @auth/drizzle-adapter
```

**ตัวอย่างการตั้งค่า:**
```typescript
// server/auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
})
```

**ขั้นตอน:**
1. สร้าง Google OAuth App: https://console.cloud.google.com/apis/credentials
2. เพิ่ม `GOOGLE_CLIENT_ID` และ `GOOGLE_CLIENT_SECRET` ใน Vercel
3. แก้ไข `server/_core/context.ts` ให้ใช้ NextAuth แทน Manus OAuth
4. แก้ไข `client/src/hooks/useAuth.ts` ให้เรียก NextAuth session

---

#### 2. **Supabase Auth**
- มี database และ auth ในที่เดียว
- ฟรีสำหรับ project เล็ก
- รองรับ OAuth หลายแบบ

**วิธีติดตั้ง:**
```bash
pnpm add @supabase/supabase-js
```

**ตัวอย่างการตั้งค่า:**
```typescript
// server/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)
```

**ขั้นตอน:**
1. สร้าง project: https://supabase.com/dashboard
2. เปิดใช้ Google OAuth ใน Authentication → Providers
3. คัดลอก `SUPABASE_URL` และ `SUPABASE_ANON_KEY`
4. แก้ไข authentication flow ให้ใช้ Supabase

---

#### 3. **Clerk** (ง่ายที่สุด แต่มีค่าใช้จ่าย)
- ติดตั้งง่ายที่สุด
- มี UI components สำเร็จรูป
- ฟรี 10,000 users/เดือน

**วิธีติดตั้ง:**
```bash
pnpm add @clerk/clerk-react
```

---

## 💾 Database Setup

### ตัวเลือก 1: PlanetScale (แนะนำ)

1. สร้าง account: https://planetscale.com
2. สร้าง database ใหม่
3. คัดลอก connection string
4. เพิ่ม `DATABASE_URL` ใน Vercel Environment Variables
5. Run migration:
   ```bash
   pnpm db:push
   ```

### ตัวเลือก 2: Supabase (ถ้าใช้ Supabase Auth)

1. ใช้ database ที่มากับ Supabase project
2. คัดลอก connection string จาก Settings → Database
3. เพิ่ม `DATABASE_URL` ใน Vercel

---

## 📝 Checklist ก่อน Deploy

- [ ] Push โค้ดไป GitHub ✅
- [ ] สร้าง Vercel account และเชื่อมต่อ GitHub
- [ ] เลือก OAuth provider (NextAuth.js / Supabase / Clerk)
- [ ] สร้าง OAuth credentials (Google / Facebook / GitHub)
- [ ] ตั้งค่า database (PlanetScale / Supabase)
- [ ] เพิ่ม Environment Variables ใน Vercel
- [ ] แก้ไข authentication code ให้ใช้ provider ใหม่
- [ ] ทดสอบการล็อกอินใน production
- [ ] ทดสอบการเล่นเกม
- [ ] ตั้งค่า Stripe webhook URL ใหม่

---

## 🐛 แก้ไข Code สำหรับ Production

### 1. แก้ไข `server/_core/context.ts`

**ก่อน (Manus OAuth):**
```typescript
import { getSessionUser } from "./oauth";

export async function createContext({ req, res }: CreateContextOptions) {
  const user = await getSessionUser(req);
  return { req, res, user };
}
```

**หลัง (NextAuth.js):**
```typescript
import { auth } from "../auth";

export async function createContext({ req, res }: CreateContextOptions) {
  const session = await auth();
  return { req, res, user: session?.user };
}
```

### 2. แก้ไข `client/src/hooks/useAuth.ts`

**ก่อน:**
```typescript
const { data: user, isLoading, error } = trpc.auth.me.useQuery();
```

**หลัง (NextAuth.js):**
```typescript
import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user,
    loading: status === "loading",
    isAuthenticated: !!session,
  };
}
```

### 3. แก้ไข Login URL

**ก่อน:**
```typescript
export function getLoginUrl() {
  return `${VITE_OAUTH_PORTAL_URL}?...`;
}
```

**หลัง (NextAuth.js):**
```typescript
import { signIn } from "next-auth/react";

// ใช้แทน redirect
signIn("google");
```

---

## 🎯 ฟีเจอร์ที่ยังค้างทำ

หลังจาก deploy สำเร็จแล้ว ยังมีฟีเจอร์ที่ต้องทำต่อ:

1. **Guest Mode** - ให้เล่นได้โดยไม่ต้องล็อกอิน
   - ปรับหน้า Game ให้รองรับ Guest Mode
   - บันทึกข้อมูลเกมใน localStorage
   - แสดงข้อความแจ้งเตือนว่าเป็นโหมดทดลอง

2. **Stripe Payment Integration** - ทดสอบใน production
   - อัพเดท webhook URL ใน Stripe Dashboard
   - ทดสอบการซื้อธีมกระดาน
   - ทดสอบการสนับสนุนผู้พัฒนา

3. **ระบบแจ้งเตือนแบบกำหนดเอง**
   - ทดสอบการส่งการแจ้งเตือนใน production
   - เพิ่มการแจ้งเตือนเมื่อมีการซื้อสำเร็จ

4. **เพิ่มคำศัพท์** (ถ้าต้องการ)
   - ปัจจุบันมี 1,029 คำ
   - เป้าหมายเดิม 2,000 คำ
   - เพิ่มอีก 971 คำถ้าต้องการ

---

## 🆘 ขอความช่วยเหลือ

หากมีปัญหาในการ deploy:

1. ตรวจสอบ Vercel logs: Dashboard → Deployments → View Logs
2. ตรวจสอบ browser console: F12 → Console
3. ตรวจสอบ network requests: F12 → Network
4. อ่าน error messages อย่างละเอียด

**ปัญหาที่พบบ่อย:**

- **Database connection error**: ตรวจสอบ `DATABASE_URL` ใน Environment Variables
- **OAuth error**: ตรวจสอบ callback URL และ credentials
- **Build error**: ตรวจสอบ `package.json` และ dependencies
- **Stripe webhook error**: อัพเดท webhook URL ใน Stripe Dashboard

---

## 📚 Resources

- **Vercel Documentation**: https://vercel.com/docs
- **NextAuth.js**: https://next-auth.js.org
- **Supabase**: https://supabase.com/docs
- **PlanetScale**: https://planetscale.com/docs
- **Stripe**: https://stripe.com/docs

---

**สร้างโดย:** Manus AI  
**วันที่:** 2025-01-17  
**Repository:** https://github.com/helloworld1928/thai-scrabble-game
