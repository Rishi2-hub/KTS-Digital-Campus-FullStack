from datetime import date, datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MaterialOut(BaseModel):
    id: int
    title: str
    course: str
    description: str | None
    original_filename: str
    content_type: str
    size_bytes: int
    published: bool
    teacher_id: int
    teacher_name: str
    created_at: datetime
    download_url: str


class AssignmentCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    course: str = Field(min_length=1, max_length=150)
    description: str | None = None
    due_date: date | None = None
    max_marks: int = Field(default=100, ge=1, le=1000)


class AssignmentOut(AssignmentCreate):
    id: int
    teacher_id: int
    teacher_name: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class GradeSave(BaseModel):
    assignment_id: int
    student_id: int
    marks: int = Field(ge=0, le=100000)
    feedback: str | None = None


class GradeOut(BaseModel):
    id: int
    assignment_id: int
    assignment_title: str
    max_marks: int
    student_id: int
    student_name: str
    student_email: EmailStr
    teacher_id: int
    teacher_name: str
    marks: int
    feedback: str | None
    created_at: datetime
    updated_at: datetime
