# IELTSPro

IELTSPro is a production-ready MERN stack platform for IELTS preparation with authentication, AI-assisted feedback, analytics, and study planning.

## Features
- Email/password authentication and Google OAuth
- JWT access and refresh tokens
- User profile management
- Dashboard, analytics, and study planning
- Writing and speaking evaluation flows
- Admin management routes

## Tech Stack
- React 18 + React Router + Framer Motion
- Express + MongoDB + Mongoose
- JWT + Passport.js + Google OAuth
- Chart.js and toast notifications

## Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Environment Variables
Create a backend .env file with:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/ieltspro
PORT=5000
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
EMAIL_FROM=your_email
```
