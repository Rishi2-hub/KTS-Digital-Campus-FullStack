from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import User
from .security import hash_password

DEMO_USERS = [
    ("KTS Administrator", "admin@kts.edu.np", "Admin@123", "admin"),
    ("Demo Teacher", "teacher@kts.edu.np", "Teacher@123", "teacher"),
    ("Demo Student", "student@kts.edu.np", "Student@123", "student"),
]

def seed_demo_users(db: Session):
    for name, email, password, role in DEMO_USERS:
        existing = db.scalar(select(User).where(User.email == email))
        if not existing:
            db.add(User(name=name, email=email, password_hash=hash_password(password), role=role))
    db.commit()
