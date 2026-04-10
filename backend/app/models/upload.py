from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime

from app.db.session import Base


class Upload(Base):
    __tablename__ = "uploads"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size = Column(Integer, nullable=False)
    url = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
