# Kathmandu Technical School — Digital Campus Full Stack

This version connects the React portal to a real FastAPI backend and database.

## Stack
- Frontend: React + Vite
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL for production (SQLite fallback for easy local testing)
- Authentication: JWT + bcrypt
- File storage: local `backend/uploads` for development

## Features now connected to real data
- Login for admin, teacher and student
- Teacher creates assignments
- Teacher uploads real PDF/DOC/DOCX/PPT/XLS/image course materials
- Material metadata is stored in the database
- Uploaded files are stored in `backend/uploads`
- Teacher can open/download and delete their own materials
- Students can see published teacher materials and download them

## 1. Start backend

PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

The backend will be available at http://localhost:8000 and Swagger docs at http://localhost:8000/docs.

### PostgreSQL

For PostgreSQL, edit `.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/kts_digital_campus
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173
UPLOAD_DIR=./uploads
```

Create the database first:

```sql
CREATE DATABASE kts_digital_campus;
```

Tables are created automatically on first backend start for this prototype.

## 2. Start frontend

Open another PowerShell:

```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

Open the Vite URL shown in the terminal.

## Demo accounts

- Admin: `admin@kts.edu.np` / `Admin@123`
- Teacher: `teacher@kts.edu.np` / `Teacher@123`
- Student: `student@kts.edu.np` / `Student@123`

These are seeded automatically on backend startup. Change them before production use.

## Teacher upload workflow

1. Login as teacher.
2. Open **Courses & Materials**.
3. Click **Upload material**.
4. Enter title/course/description.
5. Select a real file.
6. Click **Upload & Publish**.
7. The file is saved under `backend/uploads` and its metadata is stored in the database.
8. Login as student to see the published material in **Study Materials**.

## Important production changes

Before deployment, use PostgreSQL, S3/Supabase Storage instead of local uploads, HTTPS, a strong JWT secret, proper password reset/email service, database migrations (Alembic), virus/file scanning, rate limiting and automated backups.
