# 🚀 คู่มือติดตั้ง Supabase + Vercel (ฟรี 100%)

คู่มือนี้จะแนะนำวิธีการ deploy เกม Scrabble ภาษาไทยไป Vercel และใช้ Supabase สำหรับ database + authentication **ฟรี 100%** ไม่ต้องใส่บัตรเครดิต

---

## 📋 สิ่งที่ต้องเตรียม

- บัญชี GitHub (มีอยู่แล้ว)
- บัญชี Google (สำหรับล็อกอิน Supabase และ Google Cloud)
- เวลาประมาณ 30-45 นาที

---

## ขั้นตอนที่ 1: สร้าง Supabase Project (10 นาที)

### 1.1 สร้างบัญชี Supabase

1. ไปที่ https://supabase.com
2. คลิก **"Start your project"** (มุมขวาบน)
3. เลือก **"Sign in with GitHub"** หรือ **"Sign in with Google"**
4. อนุญาตให้ Supabase เข้าถึงบัญชี

### 1.2 สร้าง Organization

1. หลังจากล็อกอินแล้ว จะเห็นหน้า Dashboard
2. คลิก **"New organization"**
3. ตั้งชื่อ Organization: `my-projects` (หรือชื่ออื่นที่ชอบ)
4. เลือก Plan: **Free** (ฟรีตลอดไป)
5. คลิก **"Create organization"**

### 1.3 สร้าง Project

1. คลิก **"New project"**
2. กรอกข้อมูล:
   - **Name**: `thai-scrabble-game`
   - **Database Password**: สร้างรหัสผ่านที่จำง่าย (เช่น `MyPassword123!`)
     - ⚠️ **สำคัญ**: จดรหัสผ่านนี้ไว้ จะใช้ในขั้นตอนต่อไป
   - **Region**: **Singapore** (ใกล้ไทยที่สุด - ความเร็วดีที่สุด)
   - **Pricing Plan**: **Free** (ฟรี)
3. คลิก **"Create new project"**
4. รอ 2-3 นาที ให้ Supabase สร้าง project

---

## ขั้นตอนที่ 2: ตั้งค่า Google OAuth (10 นาที)

### 2.1 สร้าง Google OAuth Credentials

1. ไปที่ https://console.cloud.google.com/apis/credentials
2. ล็อกอินด้วย Google Account
3. คลิก **"Create Project"** (ถ้ายังไม่มี project)
   - ตั้งชื่อ: `Thai Scrabble Game`
   - คลิก **"Create"**
4. คลิก **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. ถ้าขึ้นว่า "To create an OAuth client ID, you must first configure your consent screen":
   - คลิก **"CONFIGURE CONSENT SCREEN"**
   - เลือก **"External"** → คลิก **"CREATE"**
   - กรอกข้อมูล:
     - **App name**: `Thai Scrabble Game`
     - **User support email**: เลือกอีเมลของคุณ
     - **Developer contact information**: ใส่อีเมลของคุณ
   - คลิก **"SAVE AND CONTINUE"** (ข้ามขั้นตอนอื่นได้)
   - คลิก **"BACK TO DASHBOARD"**

### 2.2 สร้าง OAuth Client ID

1. กลับไปที่ https://console.cloud.google.com/apis/credentials
2. คลิก **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. เลือก **Application type**: **Web application**
4. ตั้งชื่อ: `Thai Scrabble Game`
5. ใน **Authorized redirect URIs**:
   - คลิก **"+ ADD URI"**
   - ไปที่ Supabase Dashboard → **Authentication** → **Providers** → **Google**
   - คัดลอก **Callback URL (for OAuth)** (จะเป็น `https://xxx.supabase.co/auth/v1/callback`)
   - วางใน Google Cloud Console
6. คลิก **"CREATE"**
7. คัดลอก **Client ID** และ **Client Secret** (จะใช้ในขั้นตอนถัดไป)

### 2.3 เปิดใช้ Google OAuth ใน Supabase

1. กลับไปที่ Supabase Dashboard
2. ไปที่ **Authentication** → **Providers** (เมนูซ้าย)
3. เลื่อนหา **Google** → คลิก **Enable**
4. กรอกข้อมูล:
   - **Client ID**: วาง Client ID จาก Google Cloud
   - **Client Secret**: วาง Client Secret จาก Google Cloud
5. คลิก **"Save"**

---

## ขั้นตอนที่ 3: คัดลอก Environment Variables (5 นาที)

### 3.1 คัดลอกค่าจาก Supabase

ใน Supabase Dashboard → **Settings** → **API**

คัดลอกค่าเหล่านี้:

```bash
# Project URL
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# Anon (public) key
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.2 คัดลอก Database URL

ใน Supabase Dashboard → **Settings** → **Database**

1. เลื่อนลงหา **Connection string**
2. เลือกแท็บ **URI**
3. คัดลอก connection string (จะเป็น `postgresql://postgres:[YOUR-PASSWORD]@...`)
4. แทนที่ `[YOUR-PASSWORD]` ด้วยรหัสผ่านที่ตั้งไว้ในขั้นตอนที่ 1.3

```bash
DATABASE_URL=postgresql://postgres:MyPassword123!@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

---

## ขั้นตอนที่ 4: Deploy ไป Vercel (10 นาที)

### 4.1 สร้างบัญชี Vercel

1. ไปที่ https://vercel.com
2. คลิก **"Sign Up"**
3. เลือก **"Continue with GitHub"**
4. อนุญาตให้ Vercel เข้าถึง GitHub

### 4.2 Import Project

1. ใน Vercel Dashboard คลิก **"Add New..."** → **"Project"**
2. เลือก repository: **`helloworld1928/thai-scrabble-game`**
   - ถ้าไม่เห็น คลิก **"Adjust GitHub App Permissions"** และอนุญาตให้ Vercel เข้าถึง repository
3. คลิก **"Import"**

### 4.3 ตั้งค่า Build Settings

1. **Framework Preset**: Other (ปล่อยเป็น default)
2. **Build Command**: `pnpm install && pnpm run build`
3. **Output Directory**: `dist`
4. **Install Command**: `pnpm install`

### 4.4 เพิ่ม Environment Variables

คลิก **"Environment Variables"** และเพิ่มค่าเหล่านี้:

```bash
# Database
DATABASE_URL=postgresql://postgres:MyPassword123!@db.xxxxxxxxxxxxx.supabase.co:5432/postgres

# Supabase (Server-side)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase (Client-side)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Secret (สร้างใหม่ - ใช้ string สุ่มยาวๆ)
JWT_SECRET=your-super-secret-random-string-here-make-it-long

# App Info
VITE_APP_TITLE=เกม Scrabble ภาษาไทย
VITE_APP_LOGO=/logo.svg

# Stripe (ถ้ามี - ไม่จำเป็นสำหรับการทดสอบ)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**วิธีสร้าง JWT_SECRET:**
- ใช้ password generator: https://passwordsgenerator.net/
- ตั้งค่า: Length = 64, Include Symbols
- คัดลอกมาใส่

### 4.5 Deploy

1. คลิก **"Deploy"**
2. รอ 2-3 นาที ให้ Vercel build และ deploy
3. เมื่อเสร็จจะเห็นข้อความ **"Congratulations!"**
4. คลิก **"Visit"** เพื่อเปิดเว็บ

---

## ขั้นตอนที่ 5: ตั้งค่า Database Schema (5 นาที)

### 5.1 Run Database Migrations

1. ใน Vercel Dashboard → **Settings** → **Functions**
2. หรือใช้ Supabase SQL Editor:
   - ไปที่ Supabase Dashboard → **SQL Editor** (เมนูซ้าย)
   - คลิก **"New query"**
   - วาง SQL จากไฟล์ `drizzle/schema.ts` (แปลงเป็น SQL)
   - หรือใช้คำสั่งนี้:

```sql
-- สร้างตาราง users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role VARCHAR(10) DEFAULT 'user' NOT NULL,
  "stripeCustomerId" VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- สร้างตาราง games
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  board JSONB NOT NULL,
  "playerTiles" JSONB NOT NULL,
  "aiTiles" JSONB NOT NULL,
  "tileBag" JSONB NOT NULL,
  "playerScore" INTEGER DEFAULT 0 NOT NULL,
  "aiScore" INTEGER DEFAULT 0 NOT NULL,
  "currentTurn" VARCHAR(10) DEFAULT 'player' NOT NULL,
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- สร้างตาราง game_moves
CREATE TABLE IF NOT EXISTS game_moves (
  id SERIAL PRIMARY KEY,
  "gameId" INTEGER NOT NULL REFERENCES games(id),
  player VARCHAR(10) NOT NULL,
  word TEXT NOT NULL,
  score INTEGER NOT NULL,
  position JSONB NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- สร้างตาราง dictionary
CREATE TABLE IF NOT EXISTS dictionary (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- สร้างตาราง purchases
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  "productId" VARCHAR(255) NOT NULL,
  "productName" TEXT NOT NULL,
  amount INTEGER NOT NULL,
  "stripeSessionId" VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
```

3. คลิก **"Run"** (หรือ Ctrl+Enter)

---

## ขั้นตอนที่ 6: ทดสอบเว็บ (5 นาที)

### 6.1 เปิดเว็บ

1. คลิก URL ที่ Vercel ให้มา (จะเป็น `https://thai-scrabble-game-xxx.vercel.app`)
2. คุณจะเห็นหน้าแรกของเกม

### 6.2 ทดสอบการล็อกอิน

1. คลิก **"เข้าสู่ระบบ"**
2. คลิก **"เข้าสู่ระบบด้วย Google"**
3. เลือก Google Account
4. อนุญาตให้เข้าถึงข้อมูล
5. คุณจะถูก redirect กลับมาที่หน้าแรก (ล็อกอินสำเร็จ)

### 6.3 ทดสอบการเล่นเกม

1. คลิก **"เริ่มเล่น"**
2. เกมจะเริ่มต้น - คุณจะเห็นกระดาน 15x15
3. ลองวางตัวอักษรและส่งคำ
4. AI จะเล่นต่ออัตโนมัติ

---

## 🎉 เสร็จสิ้น!

เว็บของคุณพร้อมใช้งานแล้ว! 🎮

**URL**: `https://thai-scrabble-game-xxx.vercel.app`

---

## 🔧 การตั้งค่าเพิ่มเติม

### Custom Domain (ถ้าต้องการ)

1. ใน Vercel Dashboard → **Settings** → **Domains**
2. คลิก **"Add"**
3. ใส่ domain ของคุณ (เช่น `scrabble.yourdomain.com`)
4. ตั้งค่า DNS ตามที่ Vercel แนะนำ

### Stripe Payment (ถ้าต้องการ)

1. ไปที่ https://dashboard.stripe.com
2. คัดลอก API keys
3. เพิ่ม Environment Variables ใน Vercel:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `VITE_STRIPE_PUBLISHABLE_KEY`
4. ตั้งค่า Webhook URL: `https://your-domain.vercel.app/api/stripe/webhook`

---

## ❓ แก้ปัญหา

### ปัญหา: "supabaseUrl is required"

**สาเหตุ**: ไม่ได้ตั้งค่า Environment Variables

**วิธีแก้:**
1. ไปที่ Vercel Dashboard → **Settings** → **Environment Variables**
2. ตรวจสอบว่ามี `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY`
3. ถ้าไม่มี ให้เพิ่มตามขั้นตอนที่ 4.4
4. **Redeploy**: ไปที่ **Deployments** → คลิก **"..."** → **"Redeploy"**

### ปัญหา: "Database connection failed"

**สาเหตุ**: `DATABASE_URL` ไม่ถูกต้อง

**วิธีแก้:**
1. ตรวจสอบ `DATABASE_URL` ใน Vercel Environment Variables
2. ตรวจสอบว่ารหัสผ่านถูกต้อง (ต้องเหมือนที่ตั้งไว้ใน Supabase)
3. ตรวจสอบว่า URL เป็น `postgresql://` ไม่ใช่ `postgres://`

### ปัญหา: "OAuth error" หรือ "redirect_uri_mismatch"

**สาเหตุ**: Redirect URI ใน Google Cloud ไม่ตรงกับ Supabase

**วิธีแก้:**
1. ไปที่ Google Cloud Console → Credentials
2. แก้ไข OAuth client ID
3. ตรวจสอบ **Authorized redirect URIs** ต้องเป็น:
   - `https://xxxxxxxxxxxxx.supabase.co/auth/v1/callback`
4. บันทึก

### ปัญหา: เว็บช้า

**สาเหตุ**: Vercel Free plan มีข้อจำกัด

**วิธีแก้:**
- ปกติแล้วเว็บจะเร็ว แต่ถ้า cold start อาจช้า 1-2 วินาที
- ถ้าต้องการความเร็วสูงสุด อัพเกรดเป็น Vercel Pro ($20/เดือน)

---

## 💰 ค่าใช้จ่าย

| Service | Free Plan | ข้อจำกัด |
|---------|-----------|----------|
| **Vercel** | ฟรี | 100 GB bandwidth/เดือน, 6,000 build minutes |
| **Supabase** | ฟรี | 500 MB database, Unlimited users, 50K requests/เดือน |
| **Google OAuth** | ฟรี | Unlimited |

**สรุป**: **ฟรี 100%** เพียงพอสำหรับเว็บที่มีผู้เข้าใช้ไม่เกิน 10,000 คน/เดือน

---

## 📚 Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Google OAuth Setup**: https://developers.google.com/identity/protocols/oauth2
- **GitHub Repository**: https://github.com/helloworld1928/thai-scrabble-game

---

## 🆘 ต้องการความช่วยเหลือ?

- เปิด Issue ใน GitHub: https://github.com/helloworld1928/thai-scrabble-game/issues
- อ่าน README.md และ DEPLOYMENT.md
- ตรวจสอบ Vercel logs: Dashboard → Deployments → View Logs

---

**สร้างโดย:** Manus AI  
**วันที่:** 2025-01-17  
**เวอร์ชัน:** 2.0.0 (Supabase Edition)

**สนุกกับการเล่นเกม Scrabble ภาษาไทย! 🎮🇹🇭**
