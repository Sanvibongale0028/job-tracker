# Job Application Tracker

A full-stack web application to track job applications, analyze resumes using AI, manage interview reminders, and visualize application analytics.

🔗 **Live Demo:** [job-tracker-ivory-alpha.vercel.app](https://job-tracker-ivory-alpha.vercel.app)

---

## Features

- **Authentication** — Secure register and login with JWT
- **Application Tracking** — Add, edit, delete job applications with status, date, notes
- **Filter & Sort** — Search by company/role, filter by status, sort by any field
- **Analytics Dashboard** — Pie chart, bar chart, and line chart visualizing application data
- **AI Resume Analyzer** — Upload resume and analyze it using Groq (Llama 3.3 70B) with filters for experience level and target role
- **Email Reminders** — Set reminders for interviews, get email alerts automatically
- **Export** — Download all applications as PDF or Excel
- **Responsive UI** — Works on mobile and desktop

---

## Tech Stack

### Frontend
- React (Vite)
- React Router DOM
- Tailwind CSS v4
- Recharts
- Axios
- React Hot Toast

### Backend
- Node.js + Express.js
- PostgreSQL (hosted on Supabase)
- JWT Authentication (jsonwebtoken + bcryptjs)
- Groq API (Llama 3.3 70B) — AI resume analysis
- Nodemailer — email reminders
- Supabase Storage — resume file storage
- PDFKit — PDF export
- ExcelJS — Excel export
- pdfreader — PDF text extraction

### Deployment
- Frontend — Vercel
- Backend — Render (Dockerized)
- Database — Supabase (PostgreSQL)

## Project Structure

```
job-tracker/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   ├── email.js
│   │   ├── multer.js
│   │   └── supabase.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── applicationController.js
│   │   ├── reminderController.js
│   │   ├── resumeController.js
│   │   ├── exportController.js
│   │   └── resumeAnalyzerController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── reminderRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── exportRoutes.js
│   │   └── resumeAnalyzerRoutes.js
│   ├── server.js
│   └── Dockerfile
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── layout/
    │   │       └── Navbar.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Applications.jsx
    │   │   ├── Analytics.jsx
    │   │   ├── Resume.jsx
    │   │   └── Reminders.jsx
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── public/
        └── vercel.json
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register a new user |
| POST | /api/auth/login | Login and get JWT token |

### Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/applications | Get all applications (with filter/sort/search) |
| POST | /api/applications | Add a new application |
| PUT | /api/applications/:id | Update an application |
| DELETE | /api/applications/:id | Delete an application |
| GET | /api/applications/stats | Get application stats |
| GET | /api/applications/analytics | Get analytics data |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/resume | Get current resume URL |
| POST | /api/resume/upload | Upload resume |
| PUT | /api/resume/update | Replace resume |
| GET | /api/analyzer/analyze | AI resume analysis |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reminders | Add a reminder |
| GET | /api/reminders | Get all reminders |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/export/pdf | Export applications as PDF |
| GET | /api/export/excel | Export applications as Excel |

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    resume_path TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    company VARCHAR(100),
    role VARCHAR(100),
    status VARCHAR(50),
    date_applied DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reminders
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id),
    reminder_date TIMESTAMP,
    message TEXT,
    sent BOOLEAN DEFAULT false
);
```

---

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL database (or Supabase account)
- Groq API key
- Gmail account with App Password

### Backend Setup

```bash
cd backend
npm install
```

```
Create `.env` in the backend folder:
PORT=5000
DATABASE_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
```

```bash
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` in the frontend folder:
VITE_API_URL=http://localhost:5000

```bash
npm run dev
```

---

## Environment Variables

### Backend (Render)
| Variable | Description |
|----------|-------------|
| DATABASE_URL | Supabase PostgreSQL connection string |
| JWT_SECRET | Secret key for JWT tokens |
| EMAIL_USER | Gmail address for sending reminders |
| EMAIL_PASS | Gmail App Password |
| SUPABASE_URL | Supabase project URL |
| SUPABASE_ANON_KEY | Supabase anonymous key |
| GROQ_API_KEY | Groq API key for AI analysis |

### Frontend (Vercel)
| Variable | Description |
|----------|-------------|
| VITE_API_URL | Backend API URL |

---

## Author

**Sanvi Bongale**
B.Tech Information Technology
Walchand College of Engineering, Sangli

GitHub: [Sanvibongale0028](https://github.com/Sanvibongale0028)
Email: sanvi.bongale@walchandsangli.ac.in