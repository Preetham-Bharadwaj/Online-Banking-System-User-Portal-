# Online Banking System - Fintech SaaS Application

A modern, scalable online banking system built with React, Node.js, Express, and Supabase PostgreSQL. This project is structured as a monorepo containing a full-stack fintech SaaS application.

## 🌟 Features

- **Modern UI/UX**: Glassmorphism, smooth animations, and premium responsive design using Tailwind CSS.
- **Secure Authentication**: JWT-based authentication with role-based access control.
- **Dashboard**: Real-time financial overview, recent transactions, and account analytics.
- **Budget Tracker**: Interactive spending charts and budget monitoring tools.
- **Fund Transfers**: UI flow for initiating secure transfers to beneficiaries.
- **Scalable Architecture**: Clean, modular monorepo structure separating frontend and backend concerns.

## 🏗️ Architecture

```
online-banking-system/
│
├── frontend/        # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level page components
│   │   ├── layouts/     # Application layout wrappers
│   │   ├── routes/      # Route definitions
│   │   ├── services/    # API calls (Axios)
│   │   ├── store/       # State management (Zustand)
│   │   └── utils/       # Helper functions
│
├── backend/         # Express backend APIs
│   ├── controllers/ # Request handlers
│   ├── routes/      # API endpoint definitions
│   ├── middleware/  # Express middlewares (Auth, Error handling)
│   ├── services/    # Business logic
│   ├── models/      # Data access layer
│   ├── config/      # System configurations
│   └── app.js       # Express application setup
│
├── database/        # SQL schema, migrations, seed files
├── docs/            # API docs + architecture docs
└── shared/          # Shared constants/types/helpers
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository and install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../backend && npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` in the root directory and update the variables:
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure you update the Supabase URLs and Keys with your project details.*

3. **Database Setup**
   - Go to your Supabase project dashboard.
   - Run the SQL script located in `database/schema.sql` via the SQL Editor to generate all tables and schemas.

### Running Locally

From the root directory, you can start both frontend and backend concurrently:

```bash
npm run dev
```

Alternatively, start them individually:
- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run dev`

## 📦 Deployment Instructions

### Frontend Deployment (Vercel/Netlify)

1. Connect your GitHub repository to Vercel.
2. Select the `frontend` folder as the Root Directory.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Add the required environment variables (`VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
6. Deploy!

### Backend Deployment (Render/Railway)

1. Connect your GitHub repository to Render/Railway.
2. Create a new Web Service.
3. Select the `backend` folder as the Root Directory.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add the required backend environment variables (Supabase keys, JWT secret, etc.).
7. Deploy!

### Database (Supabase)
Supabase provides managed PostgreSQL. The database is hosted automatically. Ensure you have properly configured the Row Level Security (RLS) policies before going to production.

## 🛡️ Security Best Practices Implemented

- Helmet.js for setting secure HTTP headers.
- CORS configured for authorized frontend origin.
- Password hashing with `bcrypt`.
- Route protection with JWT tokens.
- Parameterized queries to prevent SQL Injection (via Supabase client).
