from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
from backend.app.core.config import settings

db_url = settings.DATABASE_URL
# Handle postgres:// vs postgresql:// for SQLAlchemy compatibility
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
pool_kwargs = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False, "timeout": 30}
    pool_kwargs = {"poolclass": NullPool}
else:
    pool_kwargs = {"pool_pre_ping": True}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    **pool_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

