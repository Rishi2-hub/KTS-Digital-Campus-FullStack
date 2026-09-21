from pathlib import Path
from uuid import uuid4
from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy import select
from sqlalchemy.orm import Session
from .config import settings
from .db import Base, engine, get_db
from .models import Assignment, Grade, Material, User
from .schemas import AssignmentCreate, AssignmentOut, GradeOut, GradeSave, LoginRequest, LoginResponse, MaterialOut, UserOut
from .security import create_access_token, get_current_user, require_roles, verify_password
from .seed import seed_demo_users

Base.metadata.create_all(bind=engine)
# Add the grades table to an existing development database without deleting data.
Grade.__table__.create(bind=engine, checkfirst=True)
Path(settings.upload_dir).mkdir(parents=True, exist_ok=True)
with Session(engine) as db:
    seed_demo_users(db)

app = FastAPI(title="KTS Digital Campus API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[x.strip() for x in settings.cors_origins.split(",") if x.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".ppt", ".pptx", ".xlsx", ".xls"}
MAX_FILE_SIZE = 20 * 1024 * 1024

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "KTS Digital Campus API"}

@app.post("/api/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return LoginResponse(access_token=create_access_token(user), user=UserOut.model_validate(user))

@app.get("/api/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user

@app.get("/api/materials", response_model=list[MaterialOut])
def list_materials(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = select(Material).order_by(Material.created_at.desc())
    if user.role == "student":
        stmt = stmt.where(Material.published.is_(True))
    elif user.role == "teacher":
        stmt = stmt.where(Material.teacher_id == user.id)
    rows = db.scalars(stmt).all()
    return [
        MaterialOut(
            id=m.id, title=m.title, course=m.course, description=m.description,
            original_filename=m.original_filename, content_type=m.content_type,
            size_bytes=m.size_bytes, published=m.published, teacher_id=m.teacher_id,
            teacher_name=m.teacher.name, created_at=m.created_at,
            download_url=f"/api/materials/{m.id}/download",
        ) for m in rows
    ]

@app.post("/api/materials", response_model=MaterialOut, status_code=201)
def create_material(
    title: str = Form(...),
    course: str = Form(...),
    description: str | None = Form(None),
    published: bool = Form(True),
    file: UploadFile = File(...),
    user: User = Depends(require_roles("teacher", "admin")),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(400, "A file is required")
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {suffix}")

    data = file.file.read(MAX_FILE_SIZE + 1)
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(413, "File is larger than 20 MB")

    stored = f"{uuid4().hex}{suffix}"
    destination = Path(settings.upload_dir) / stored
    destination.write_bytes(data)

    material = Material(
        title=title.strip(), course=course.strip(), description=description,
        original_filename=file.filename, stored_filename=stored,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(data), published=published, teacher_id=user.id,
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return MaterialOut(
        id=material.id, title=material.title, course=material.course,
        description=material.description, original_filename=material.original_filename,
        content_type=material.content_type, size_bytes=material.size_bytes,
        published=material.published, teacher_id=material.teacher_id,
        teacher_name=user.name, created_at=material.created_at,
        download_url=f"/api/materials/{material.id}/download",
    )

@app.get("/api/materials/{material_id}/download")
def download_material(material_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    material = db.get(Material, material_id)
    if not material:
        raise HTTPException(404, "Material not found")
    if user.role == "student" and not material.published:
        raise HTTPException(403, "Material is not published")
    if user.role == "teacher" and material.teacher_id != user.id:
        raise HTTPException(403, "You can only access your own teacher files")
    path = Path(settings.upload_dir) / material.stored_filename
    if not path.exists():
        raise HTTPException(404, "Stored file not found")
    return FileResponse(path, media_type=material.content_type, filename=material.original_filename)

@app.delete("/api/materials/{material_id}", status_code=204)
def delete_material(material_id: int, user: User = Depends(require_roles("teacher", "admin")), db: Session = Depends(get_db)):
    material = db.get(Material, material_id)
    if not material:
        raise HTTPException(404, "Material not found")
    if user.role == "teacher" and material.teacher_id != user.id:
        raise HTTPException(403, "You can only delete your own materials")
    path = Path(settings.upload_dir) / material.stored_filename
    if path.exists():
        path.unlink()
    db.delete(material)
    db.commit()

@app.get("/api/assignments", response_model=list[AssignmentOut])
def list_assignments(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    stmt = select(Assignment).order_by(Assignment.created_at.desc())
    if user.role == "teacher":
        stmt = stmt.where(Assignment.teacher_id == user.id)
    rows = db.scalars(stmt).all()
    return [AssignmentOut(
        id=a.id, title=a.title, course=a.course, description=a.description,
        due_date=a.due_date, max_marks=a.max_marks, teacher_id=a.teacher_id,
        teacher_name=a.teacher.name, created_at=a.created_at,
    ) for a in rows]

@app.post("/api/assignments", response_model=AssignmentOut, status_code=201)
def create_assignment(payload: AssignmentCreate, user: User = Depends(require_roles("teacher", "admin")), db: Session = Depends(get_db)):
    assignment = Assignment(**payload.model_dump(), teacher_id=user.id)
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return AssignmentOut(
        id=assignment.id, title=assignment.title, course=assignment.course,
        description=assignment.description, due_date=assignment.due_date,
        max_marks=assignment.max_marks, teacher_id=assignment.teacher_id,
        teacher_name=user.name, created_at=assignment.created_at,
    )


@app.put("/api/assignments/{assignment_id}", response_model=AssignmentOut)
def update_assignment(
    assignment_id: int,
    payload: AssignmentCreate,
    user: User = Depends(require_roles("teacher", "admin")),
    db: Session = Depends(get_db),
):
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(404, "Assignment not found")
    if user.role == "teacher" and assignment.teacher_id != user.id:
        raise HTTPException(403, "You can only edit your own assignments")

    for key, value in payload.model_dump().items():
        setattr(assignment, key, value)
    db.commit()
    db.refresh(assignment)

    return AssignmentOut(
        id=assignment.id, title=assignment.title, course=assignment.course,
        description=assignment.description, due_date=assignment.due_date,
        max_marks=assignment.max_marks, teacher_id=assignment.teacher_id,
        teacher_name=assignment.teacher.name, created_at=assignment.created_at,
    )


@app.delete("/api/assignments/{assignment_id}", status_code=204)
def delete_assignment(
    assignment_id: int,
    user: User = Depends(require_roles("teacher", "admin")),
    db: Session = Depends(get_db),
):
    assignment = db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(404, "Assignment not found")
    if user.role == "teacher" and assignment.teacher_id != user.id:
        raise HTTPException(403, "You can only delete your own assignments")

    # Delete grades first so the endpoint works with PostgreSQL foreign keys too.
    db.query(Grade).filter(Grade.assignment_id == assignment_id).delete(synchronize_session=False)
    db.delete(assignment)
    db.commit()


@app.get("/api/students", response_model=list[UserOut])
def list_students(
    user: User = Depends(require_roles("teacher", "admin")),
    db: Session = Depends(get_db),
):
    return db.scalars(
        select(User).where(User.role == "student", User.active.is_(True)).order_by(User.name)
    ).all()


def _grade_out(grade: Grade) -> GradeOut:
    return GradeOut(
        id=grade.id,
        assignment_id=grade.assignment_id,
        assignment_title=grade.assignment.title,
        max_marks=grade.assignment.max_marks,
        student_id=grade.student_id,
        student_name=grade.student.name,
        student_email=grade.student.email,
        teacher_id=grade.teacher_id,
        teacher_name=grade.teacher.name,
        marks=grade.marks,
        feedback=grade.feedback,
        created_at=grade.created_at,
        updated_at=grade.updated_at,
    )


@app.get("/api/grades", response_model=list[GradeOut])
def list_grades(
    assignment_id: int | None = None,
    user: User = Depends(require_roles("teacher", "admin", "student")),
    db: Session = Depends(get_db),
):
    stmt = select(Grade).order_by(Grade.updated_at.desc())
    if assignment_id is not None:
        stmt = stmt.where(Grade.assignment_id == assignment_id)
    if user.role == "teacher":
        stmt = stmt.where(Grade.teacher_id == user.id)
    elif user.role == "student":
        stmt = stmt.where(Grade.student_id == user.id)

    rows = db.scalars(stmt).all()
    return [_grade_out(g) for g in rows]


@app.put("/api/grades", response_model=GradeOut)
def save_grade(
    payload: GradeSave,
    user: User = Depends(require_roles("teacher", "admin")),
    db: Session = Depends(get_db),
):
    assignment = db.get(Assignment, payload.assignment_id)
    if not assignment:
        raise HTTPException(404, "Assignment not found")
    if user.role == "teacher" and assignment.teacher_id != user.id:
        raise HTTPException(403, "You can only grade your own assignments")

    student = db.get(User, payload.student_id)
    if not student or student.role != "student" or not student.active:
        raise HTTPException(404, "Student not found")
    if payload.marks > assignment.max_marks:
        raise HTTPException(400, f"Marks cannot be greater than {assignment.max_marks}")

    grade = db.scalar(
        select(Grade).where(
            Grade.assignment_id == payload.assignment_id,
            Grade.student_id == payload.student_id,
        )
    )

    if grade:
        grade.marks = payload.marks
        grade.feedback = payload.feedback
        grade.teacher_id = user.id
    else:
        grade = Grade(
            assignment_id=payload.assignment_id,
            student_id=payload.student_id,
            teacher_id=user.id,
            marks=payload.marks,
            feedback=payload.feedback,
        )
        db.add(grade)

    db.commit()
    db.refresh(grade)
    return _grade_out(grade)


@app.delete("/api/grades/{grade_id}", status_code=204)
def delete_grade(
    grade_id: int,
    user: User = Depends(require_roles("teacher", "admin")),
    db: Session = Depends(get_db),
):
    grade = db.get(Grade, grade_id)
    if not grade:
        raise HTTPException(404, "Grade not found")
    if user.role == "teacher" and grade.teacher_id != user.id:
        raise HTTPException(403, "You can only delete grades you entered")
    db.delete(grade)
    db.commit()
