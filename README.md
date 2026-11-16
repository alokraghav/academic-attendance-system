# Smart Academic Attendance & Leave Management System
### Full-Stack BCA Final Year Academic Project (2024 - 2027)

**Author:** Alok Raghav  
**Email:** [thakursushant875@gmail.com](mailto:thakursushant875@gmail.com)  
**GitHub Repository:** [https://github.com/alokraghav/academic-attendance-system.git](https://github.com/alokraghav/academic-attendance-system.git)  
**Project Type:** BCA Final Year Degree Major Project  

---

## 🌟 Project Overview
The **Smart Academic Attendance & Leave Management System** is a production-ready, full-stack enterprise academic ERP application designed to automate student attendance tracking, enforce the mandatory **75.00% university attendance compliance threshold**, forecast lecture deficits, manage student leave applications, and generate institution-ready Excel/CSV analytical reports.

All mathematical formulas, attendance percentages, defaulter logic, leave handling, and report generation are strictly implemented in **Python** backend services.

---

## 🚀 Live Localhost Endpoints

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Frontend Web Portal** | `http://localhost:3000` | Modern, light-themed Next.js University ERP Portal |
| **Backend API & Swagger Docs** | `http://localhost:8000/api/docs` | Interactive FastAPI OpenAPI Documentation |
| **Alternative API Docs** | `http://localhost:8000/api/redoc` | ReDoc API Reference |
| **Backend Health Check** | `http://localhost:8000/health` | Health & Status Endpoint |

---

## 🔑 Ready-to-Use Demo Accounts (Pre-Seeded)

The database comes pre-seeded with realistic academic data (1 Admin, 3 Faculty, 25 Students, 2 Departments, Courses, Semesters, Subjects, and Attendance Sessions):

| Role | Email Address | Password | Description |
| :--- | :--- | :--- | :--- |
| **Institutional Admin** | `admin@smartacademic.edu` | `Admin@123` | Full access: metrics, academics, users, reports |
| **Department Faculty** | `rajesh.sharma@smartacademic.edu` | `Faculty@123` | Mark attendance, assigned subjects, defaulters |
| **BCA Student** | `student01@smartacademic.edu` | `Student@123` | View attendance %, defaulter status, apply leave |

*(Quick one-click demo login buttons are also provided directly on the `/login` page for fast evaluation)*

---

## 📐 Core Python Mathematical Formulas & Rules

### 1. Attendance Percentage Calculation
$$\text{Attendance Percentage} = \left( \frac{\text{Attended Completed Classes}}{\text{Total Conducted Classes}} \right) \times 100$$
- Handles division by zero gracefully (returns `0.00%`).
- Cancelled or scheduled classes are excluded from the total count.
- Rounded to 2 decimal places.

### 2. Strict 75.00% Defaulter Rule
$$\text{is\_defaulter} = (\text{Attendance Percentage} < 75.00)$$
- **74.99%** $\rightarrow$ **Defaulter (True)**
- **75.00%** $\rightarrow$ **Eligible / Regular (False)**
- **80.00%** $\rightarrow$ **Eligible / Regular (False)**

### 3. Dynamic Lecture Recovery Deficit Formulation
Calculates the exact number of future consecutive classes a student must attend to reach the 75% threshold:
$$\text{Additional Classes Needed} = \left\lceil \frac{0.75 \times \text{Total Classes} - \text{Attended Classes}}{0.25} \right\rceil$$

---

## 🛠️ Technology Stack

- **Backend:** Python 3.12+, FastAPI, Uvicorn (ASGI), SQLAlchemy 2.0, Pydantic v2
- **Data & Reports:** Python Pandas 2.2+, openpyxl 3.1+ (Excel .xlsx and CSV generation)
- **Database:** PostgreSQL (Supabase Cloud) / SQLite (Local development)
- **Authentication:** JWT (JSON Web Tokens), Bcrypt Password Hashing, Role-Based Access Control
- **Testing:** Pytest (12/12 unit tests passing)
- **Frontend:** Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React Icons
- **Design System:** Clean, modern university ERP light theme (`#F7F8FA` background, `#4267A9` primary accent)

---

## 📂 Project Directory Structure

```
alok raghav/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── academics.py    # Departments, courses, subjects
│   │   │   │   │   ├── attendance.py   # Sessions, marking, history, defaulters
│   │   │   │   │   ├── auth.py         # Login, JWT, password reset
│   │   │   │   │   ├── dashboard.py    # Real-time metrics from DB
│   │   │   │   │   ├── faculty.py      # Faculty management
│   │   │   │   │   ├── leave.py        # Student leave applications & approvals
│   │   │   │   │   ├── reports.py      # Pandas & openpyxl CSV/Excel exports
│   │   │   │   │   ├── students.py     # Student records CRUD
│   │   │   │   │   └── users.py        # Admin account management
│   │   │   │   └── router.py
│   │   │   └── deps.py                 # Role authorization dependencies
│   │   ├── core/
│   │   │   ├── config.py               # Pydantic Settings
│   │   │   ├── database.py             # SQLAlchemy session & engine
│   │   │   └── security.py             # JWT token & Bcrypt hashing
│   │   ├── models/
│   │   │   └── models.py               # 12 Normalized SQLAlchemy models
│   │   ├── schemas/
│   │   │   └── schemas.py              # Pydantic validation schemas
│   │   ├── seeds/
│   │   │   └── seed_data.py            # Academic seed data script
│   │   ├── services/
│   │   │   ├── attendance_service.py   # Python attendance & defaulter math
│   │   │   └── report_service.py       # Pandas/openpyxl Excel styling
│   │   └── main.py                     # FastAPI application entry point
│   ├── tests/
│   │   ├── test_calculations.py        # Math & defaulter edge-case tests
│   │   └── test_services_direct.py     # Endpoints & workflow tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/                  # Admin dashboard & management pages
│   │   │   ├── faculty/                # Faculty portal & roll-call register
│   │   │   ├── student/                # Student portal & leave tracker
│   │   │   ├── login/                  # Institutional login page
│   │   │   ├── globals.css             # Light theme ERP styles
│   │   │   └── layout.js
│   │   ├── components/                 # Reusable UI & layout components
│   │   └── lib/
│   │       ├── api.js                  # Unified API client & downloader
│   │       └── auth-context.js         # Session context
│   ├── package.json
│   └── tailwind.config.js
├── start_servers.bat                   # Double-click launcher for Windows
└── README.md
```

---

## ⚡ Running the Project Locally

### 1. Start Both Servers (Double-Click)
Simply double-click `start_servers.bat` in the root folder. It will launch:
- FastAPI backend on `http://127.0.0.1:8000`
- Next.js frontend on `http://127.0.0.1:3000`

### 2. Manual Startup

**Backend:**
```bash
cd "D:\antigravity project\alok raghav"
.\backend\venv\Scripts\python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

**Frontend:**
```bash
cd "D:\antigravity project\alok raghav\frontend"
npm run dev
```

### 3. Run Backend Test Suite
```bash
.\backend\venv\Scripts\python -m pytest backend/tests/ -v
```
*(All 12 test cases pass with 100% success rate)*

---

## ☁️ Cloud Deployment Guidelines

- **Database (Supabase):** Set `DATABASE_URL=postgresql://postgres:[password]@db.[supabase-ref].supabase.co:5432/postgres` in `.env`.
- **Backend (Render / Vercel):** Deploy `backend` with start command `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`.
- **Frontend (Vercel):** Connect GitHub repo, set root directory to `frontend`, and configure `NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com`.

---

**Academic Project by Alok Raghav** | Bachelor of Computer Applications (BCA) Final Year Project (2026-2027)
