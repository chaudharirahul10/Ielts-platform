# 🚀 IELTSPro — Complete Setup & Deployment Guide

## Prerequisites
- Node.js ≥ 18  
- npm ≥ 9  
- Git  
- A MongoDB Atlas account (free tier works)  
- An OpenAI API key (GPT-4o for evaluation, GPT-4o-mini for chat/vocab)  
- A Google Cloud project (OAuth + optional Speech-to-Text)  
- A Cloudinary account (free tier for audio/image uploads)  
- A Gmail account with an App Password (for OTP emails)  

---

## Phase 1 — Clone & Install

```bash
# 1. Clone the repo
git clone https://github.com/your-username/ielts-platform.git
cd ielts-platform

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../frontend
npm install
```

---

## Phase 2 — MongoDB Atlas

1. Go to https://cloud.mongodb.com and sign in.  
2. Create a **free M0 cluster** (any cloud region).  
3. In **Database Access** → Add a database user with read/write permissions.  
4. In **Network Access** → Add IP `0.0.0.0/0` (allow all — restrict later in production).  
5. Click **Connect** → **Drivers** → copy the connection string:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Replace `<password>` with your password and add the database name:

```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/ielts_platform?retryWrites=true&w=majority
```

---

## Phase 3 — Google OAuth Setup

1. Go to https://console.cloud.google.com  
2. Create a new project (or use an existing one).  
3. Navigate to **APIs & Services** → **OAuth consent screen**:
   - Choose **External**
   - Fill in app name, support email, developer email
   - Add scope: `email`, `profile`, `openid`
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**:
   - Application type: **Web application**
   - Authorised JavaScript origins: `http://localhost:3000`
   - Authorised redirect URIs: `http://localhost:3000`
5. Copy the **Client ID** — you'll need it for both frontend and backend.

---

## Phase 4 — Cloudinary Setup

1. Sign up at https://cloudinary.com (free plan includes 25GB storage).  
2. From your dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

---

## Phase 5 — Gmail App Password (OTP Emails)

1. Go to your Google Account → **Security** → **2-Step Verification** (must be enabled).  
2. Scroll down to **App passwords**.  
3. Select **Mail** and your device, then click **Generate**.  
4. Copy the 16-character app password.

---

## Phase 6 — Configure Environment Variables

### Backend (`backend/.env`)

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/ielts_platform?retryWrites=true&w=majority

JWT_SECRET=pick-any-long-random-string-min-32-chars-abc123
JWT_EXPIRE=7d

GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx

OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_FROM="IELTSPro <noreply@ieltspro.com>"

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Frontend (`frontend/.env`)

```bash
cp frontend/.env.example frontend/.env
```

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdef.apps.googleusercontent.com
```

---

## Phase 7 — Seed the Database

```bash
cd backend
node src/utils/seed.js
```

Expected output:
```
✅ MongoDB Atlas connected
✅ Admin account created: admin@ieltspro.com / AdminPass123!
✅ Seeded 5 sample questions
✅ Seeded 2 vocabulary words
🎉 Seed complete.
```

---

## Phase 8 — Run Locally

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# → Server running on port 5000

# Terminal 2 — Frontend
cd frontend
npm start
# → React dev server on http://localhost:3000
```

Open http://localhost:3000 — you should see the login screen.

**Demo accounts:**
- Student: `student@ielts.com` / `password123` (create via register)
- Admin: `admin@ieltspro.com` / `AdminPass123!` (seeded above)

---

## Phase 9 — Run with Docker

```bash
# From the project root
cp backend/.env.example backend/.env   # fill in your values first
docker-compose up --build
```

All three services (MongoDB, backend, frontend) will start. Access:
- Frontend: http://localhost:3000
- API: http://localhost:5000
- MongoDB: localhost:27017

---

## Phase 10 — Deploy to Production

### 10A — Deploy Backend to Render

1. Push the repo to GitHub.  
2. Go to https://render.com → **New** → **Web Service**.  
3. Connect your GitHub repo and select the `backend` folder.  
4. Settings:
   ```
   Root Directory: backend
   Build Command:  npm install
   Start Command:  node server.js
   Environment:    Node
   Plan:           Free (or Starter for always-on)
   ```
5. Under **Environment** tab, add every key from your `backend/.env`.  
6. Change `FRONTEND_URL` to your Vercel URL (e.g. `https://ielts-platform.vercel.app`).  
7. Click **Create Web Service** — Render will deploy and give you a URL like:
   `https://ielts-platform-api.onrender.com`

### 10B — Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

cd frontend
vercel
```

Follow the prompts. When asked for environment variables, set:
```
REACT_APP_API_URL   → https://ielts-platform-api.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID → your-google-client-id
```

Or via the Vercel Dashboard:
1. Import your GitHub repo at https://vercel.com/new  
2. Set **Framework** to `Create React App`  
3. Set **Root Directory** to `frontend`  
4. Add environment variables in the **Environment Variables** section  
5. Click **Deploy**

Your app will be live at e.g. `https://ielts-platform.vercel.app`

### 10C — Update Google OAuth origins

Go back to Google Cloud Console → Credentials → your OAuth client:
- Add to **Authorised JavaScript origins**: `https://ielts-platform.vercel.app`
- Add to **Authorised redirect URIs**: `https://ielts-platform.vercel.app`

---

## Phase 11 — Post-Deployment Checklist

- [ ] MongoDB Atlas: restrict IP access to Render's outbound IP range  
- [ ] Set `NODE_ENV=production` in Render  
- [ ] Enable Render's **Auto-Deploy on push** for CI/CD  
- [ ] Add a custom domain in Vercel (optional)  
- [ ] Set `HTTPS` for both frontend and backend (Vercel & Render handle this automatically)  
- [ ] Run the seed script against Atlas: `MONGODB_URI=<atlas_uri> node src/utils/seed.js`  
- [ ] Test all AI features (Writing evaluation, Speaking, Chat) from production  

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `MONGODB_URI connection refused` | Check Atlas IP whitelist and password in `.env` |
| `401 Unauthorized` on all requests | Token expired — clear `localStorage` and re-login |
| Google OAuth `redirect_uri_mismatch` | Add `http://localhost:3000` to Google OAuth origins |
| OpenAI `401` error | Check `OPENAI_API_KEY` is set and has credits |
| Audio upload fails | Check Cloudinary credentials and file size (max 15MB) |
| OTP email not arriving | Check Gmail App Password; check spam folder |
| React blank page on Vercel | Ensure `REACT_APP_API_URL` points to Render backend |
| CORS error in browser | Ensure `FRONTEND_URL` in backend `.env` matches Vercel URL exactly |

---

## Project Structure Summary

```
ielts-platform/
├── backend/
│   ├── server.js                  ← Express entry point
│   ├── src/
│   │   ├── models/                ← Mongoose schemas (10 models)
│   │   ├── controllers/           ← Business logic (11 controllers)
│   │   ├── routes/                ← API route definitions (11 route files)
│   │   ├── middleware/            ← JWT auth, error handler, validator
│   │   ├── services/              ← AI (OpenAI/Gemini), email, speech, certs
│   │   └── utils/                 ← JWT helpers, OTP, band calculator, seed
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                ← Router + protected routes
│   │   ├── components/
│   │   │   ├── auth/              ← LoginForm, RegisterForm, OTPVerification
│   │   │   ├── dashboard/         ← Score cards, charts, streak
│   │   │   ├── listening/         ← Audio player, MCQ, fill-blanks, navigator
│   │   │   ├── reading/           ← Passage, T/F/NG, summary completion
│   │   │   ├── writing/           ← Editor, AI evaluator, criteria breakdown
│   │   │   ├── speaking/          ← Recording, AI interview, feedback
│   │   │   ├── vocabulary/        ← Flashcards, quiz, AI generator
│   │   │   ├── studyplan/         ← AI plan generator, daily tasks
│   │   │   ├── mocktest/          ← Test catalogue, timer, results
│   │   │   ├── leaderboard/       ← Rankings, certificates
│   │   │   ├── analytics/         ← Charts, weak areas, trends
│   │   │   ├── admin/             ← Users, questions, platform stats
│   │   │   ├── profile/           ← Profile editor, settings
│   │   │   └── shared/            ← UI primitives, Sidebar, Topbar, AIChat
│   │   ├── context/authStore.js   ← Zustand auth state
│   │   ├── hooks/index.js         ← useRecording, useTimer, useAI
│   │   └── services/api.js        ← Axios API client
│   ├── vercel.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
└── SETUP.md                       ← This file
```

---

## Tech Stack Reference

| Layer | Technology | Purpose |
|---|---|---|
| Frontend UI | React 18 | Component-based SPA |
| Routing | React Router v6 | Client-side navigation |
| State | Zustand | Auth + global state |
| Animations | Framer Motion | Page transitions, micro-interactions |
| Charts | Chart.js + react-chartjs-2 | Progress analytics |
| API client | Axios | HTTP with token injection |
| Backend | Node.js + Express | REST API server |
| Database | MongoDB + Mongoose | Document storage |
| Auth | JWT + bcrypt | Stateless auth + password hashing |
| OAuth | Google Auth Library | Google sign-in |
| AI Writing | OpenAI GPT-4o | Essay evaluation + band scoring |
| AI Speaking | GPT-4o + Gemini Pro | Speaking analysis |
| STT | OpenAI Whisper | Speech-to-text transcription |
| TTS | OpenAI TTS (nova) | AI examiner voice |
| Vocab AI | GPT-4o-mini | Word generation by topic |
| Email | Nodemailer | OTP + notifications |
| File Storage | Cloudinary | Audio uploads |
| Security | helmet, mongoSanitize, rate-limit | Production hardening |
| Frontend hosting | Vercel | Static + serverless |
| Backend hosting | Render | Node server |
| Database hosting | MongoDB Atlas | Managed MongoDB |
| Dev environment | Docker Compose | Local orchestration |

---

## Adding Questions to the Bank

Use the Admin Panel (admin role) or seed directly:

```javascript
// backend/src/utils/seed.js — add to sampleQuestions array:
{
  module: 'listening',
  audioSection: 1,
  audioUrl: 'https://your-cloudinary-url/audio.mp3',
  questionText: 'What is the name of the caller?',
  questionType: 'fill_blank',
  correctAnswer: 'Jennifer',
  explanation: 'The caller introduces herself at the start of the recording.',
  difficulty: 'beginner',
  tags: ['section1', 'social'],
}
```

Or via API (requires admin JWT):
```bash
curl -X POST http://localhost:5000/api/admin/questions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "module": "reading", "questionText": "...", "questionType": "mcq", "difficulty": "intermediate", "options": ["A","B","C","D"], "correctAnswer": "B" }'
```

---

## API Quick Reference

```
POST   /api/auth/register            Register new user
POST   /api/auth/login               Email + password login
POST   /api/auth/google              Google OAuth login
POST   /api/auth/verify-otp          Verify email OTP

GET    /api/questions?module=reading  Get questions
POST   /api/tests/submit             Score a practice test
POST   /api/writing/submit           Submit essay for AI evaluation
POST   /api/writing/ai-check         Quick grammar check
POST   /api/speaking/submit          Upload audio for AI evaluation

POST   /api/ai/chat                  AI tutor chat
POST   /api/ai/explain-answer        Explain wrong answer
POST   /api/ai/generate-vocab        Generate topic vocabulary
POST   /api/ai/study-plan            Generate personalised plan

GET    /api/analytics/overview       Dashboard summary
GET    /api/analytics/leaderboard    Leaderboard rankings

GET    /api/mocktests                List mock tests
POST   /api/mocktests/:id/start      Start a mock test
POST   /api/mocktests/:id/submit     Submit with sub-scores

GET    /api/admin/users              List all users (admin)
POST   /api/admin/questions          Create question (admin)
GET    /api/admin/analytics          Platform stats (admin)
```

---

*Built with ❤️ — IELTSPro Production-Ready Platform*
