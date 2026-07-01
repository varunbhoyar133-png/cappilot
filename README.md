# CapPilot - MHT CET CAP Counselling Portal

CapPilot is an advanced, student-friendly web application designed to guide engineering aspirants through the Maharashtra MHT CET CAP admission process. It parses official admission seat matrices and cutoff PDFs across multiple years, saves them to a Supabase PostgreSQL instance via Prisma 7, and offers predictors, comparisons, and smart option form tools.

---

## Key Features

1. **Option Predictor**: Predicts candidate admission possibilities (`Safe`, `Moderate`, or `Dream` tiers) using Home University bonuses, round-specific metrics, and category quotas.
2. **Directory & Advanced Filters**: Multi-select filtering across 2,000+ colleges based on fees, autonomous status, NAAC/NBA accreditations, and average/highest placement packages.
3. **Trends Visualizer**: Custom SVG line charts graphing round-by-round and year-by-year cutoffs for comparison.
4. **Interactive Comparisons**: Compare up to 3 colleges side-by-side on metrics, fees, maps location, and placements.
5. **Smart Option Form Generator**: Drag-and-drop preference ordering tool that automatically sorts choices by cutoffs (to prevent lockout lockups) and prints official PDF Option Forms with parental signature sheets.
6. **Gemini Counselling Chatbot**: Immediate conversational advisory bot with a rule-based fallback counsel logic.

---

## 🛠️ Tech Stack

* **Frontend & Backend**: Next.js (App Router) using Turbopack compiler.
* **Database & ORM**: PostgreSQL (Supabase) and Prisma 7.
* **Driver Adapter**: `@prisma/adapter-pg` with connection pooling limits.
* **Styling**: Vanilla CSS with glassmorphic cards, gradients, and dark mode toggles.
* **AI Engine**: Google Gemini API.

---

## 🚀 Quick Start Setup

### Step 1: Environment Variables
Create a `.env` file in the root folder:
```ini
# Supabase Connection Settings
# DATABASE_URL uses the transaction pooler (port 6543)
DATABASE_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# DIRECT_URL uses the session pooler (port 5432) for migrations & seeds
DIRECT_URL="postgresql://postgres.[PROJECT-ID]:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"

# JWT Token Secret for Session Auth (Use any secure random text)
JWT_SECRET="your-secure-random-jwt-key"

# Google Gemini API Key for Counselling Chatbot
GEMINI_API_KEY="your-gemini-api-key"
```

### Step 2: Database Initialization & Seeding
Deploy database schemas and import the 178k+ parsed cutoff records:
```bash
# 1. Sync database tables
npx prisma db push

# 2. Seed database (optimized memory bulk inserts)
npx prisma db seed
```

### Step 3: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🏗️ Production Build

Verify code compilation and type checking:
```bash
npm run build
npm start
```

---

## 🐳 Docker Deployment

To containerize and run the application:
```bash
# Build production Docker image
docker build -t cappilot .

# Run container in background
docker run -p 3000:3000 --env-file .env -d cappilot
```
