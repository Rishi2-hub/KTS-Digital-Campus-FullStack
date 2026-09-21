from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from .config import settings

connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
database_url = settings.database_url

for prefix in ("postgres://", "postgresql://", "postgresql+psycopg2://"):
    if database_url.startswith(prefix):
        database_url = "postgresql+psycopg://" + database_url[len(prefix):]
        break

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
