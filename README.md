# Nazen Gym Management System

> **Production-Ready Indian Gym Management Solution**
> 
> Gym: **Nazen – Powered by Being Strong**  
> Location: 97XQ+CW3, Handwara, Jammu and Kashmir – 193221, India

![Nazen Gym](https://img.shields.io/badge/Nazen-Gym%20Management-orange)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Express](https://img.shields.io/badge/Express-5.x-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

## � Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://nazen-gym.netlify.app](https://nazen-gym.netlify.app) |
| **Backend API** | [https://nazen-back-end.onrender.com](https://nazen-back-end.onrender.com) |
| **Database** | Supabase (PostgreSQL) |

### Demo Credentials
| Role | Phone | Password |
|------|-------|----------|
| Admin | `+919876543210` | `admin123` |
| Member | `+919876543211` | `member123` |

## �🏋️ Features

### For Gym Admins
- **Member Management** - Add, edit, freeze, extend memberships
- **Payment Processing** - Razorpay integration with GST-compliant invoices
- **Attendance Tracking** - QR code & manual check-in/out
- **Workout Plans** - Create and assign PPL, Bro Split, Full Body routines
- **Gallery Management** - Upload gym photos with categories
- **Dashboard Analytics** - Revenue, attendance, expiring memberships

### For Members
- **Personal Dashboard** - Membership status, days remaining
- **Attendance History** - Calendar view of gym visits
- **Workout Plans** - View assigned exercise routines
- **Progress Tracking** - Weight, measurements, progress photos
- **QR Check-in** - Quick scan for attendance
- **Payment History** - Invoice downloads

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, Framer Motion |
| **Backend** | Node.js, Express.js 5 |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT + bcrypt |
| **Payments** | Razorpay |
| **State** | Zustand + React Query |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend (.env)**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/nazen_gym"
JWT_SECRET="your-super-secret-key"
RAZORPAY_KEY_ID="rzp_test_xxxxx"
RAZORPAY_KEY_SECRET="xxxxx"
FRONTEND_URL="http://localhost:3000"
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api"
```

### 3. Setup Database

```bash
cd backend
npx prisma db push
npm run db:seed
```

### 4. Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🔐 Demo Credentials

| Role | Phone | Password |
|------|-------|----------|
| **Admin** | +919876543210 | admin123 |
| **Member** | +919876543211 | member123 |

## 📁 Project Structure

```
NAIZEN/
├── frontend/                 # Next.js Frontend
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── admin/       # Admin dashboard
│   │   │   ├── member/      # Member dashboard
│   │   │   └── login/       # Authentication
│   │   ├── components/      # UI components
│   │   ├── lib/             # API client, utilities
│   │   ├── store/           # Zustand stores
│   │   └── types/           # TypeScript types
│   └── package.json
│
├── backend/                  # Express Backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation
│   │   ├── routes/          # API routes
│   │   └── utils/           # Helpers
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Sample data
│   └── package.json
│
└── README.md
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | User login |
| `GET` | `/api/members` | List all members |
| `POST` | `/api/members` | Create member |
| `GET` | `/api/plans` | List membership plans |
| `POST` | `/api/payments/razorpay/order` | Create payment order |
| `POST` | `/api/attendance/qr` | QR check-in |
| `GET` | `/api/dashboard/admin` | Admin stats |

[See full API documentation →](./backend/README.md)

## 🇮🇳 Indian Localization

- **Currency**: INR (₹) with proper formatting
- **GST**: 18% included, invoice compliant
- **Date Format**: DD/MM/YYYY
- **Phone**: +91 validation
- **Timezone**: Asia/Kolkata (IST)

## 🎨 Design

- **Dark/Light Mode** (Dark by default)
- **Mobile-First** responsive design
- **Modern Glassmorphism** UI
- **Smooth Animations** with Framer Motion
- **Indian Gym Aesthetic** (Orange/Red gradients)

## 📦 Cloud Deployment (FREE)

### Option 1: Render + Netlify + Supabase ⭐ Recommended

#### Step 1: Database (Supabase)
1. Go to [supabase.com](https://supabase.com) → Create project
2. Settings → Database → Copy `Connection string (URI)`
3. Use this as `DATABASE_URL`

#### Step 2: Backend (Render)
1. Go to [render.com](https://render.com) → New Web Service
2. Connect GitHub repo → Select `backend` folder
3. Add environment variables:
   - `DATABASE_URL` (from Supabase)
   - `JWT_SECRET` (any secure string)
   - `FRONTEND_URL` (your Netlify URL, add after step 3)
4. Deploy → Copy your Render URL

#### Step 3: Frontend (Netlify)
1. Go to [netlify.com](https://netlify.com) → Add new site
2. Connect GitHub repo → Set base directory: `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com/api`
4. Deploy

#### Step 4: Update CORS
Go back to Render and update `FRONTEND_URL` with your Netlify URL.

s
## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use for your gym!

---

**Built with ❤️ for Nazen – Powered by Being Strong, Handwara**
