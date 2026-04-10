from sqlalchemy import Column, Integer, String, Text, DateTime, Enum
from datetime import datetime
import enum

from app.db.session import Base


class HobbyType(str, enum.Enum):
    ANIME = "anime"
    BOOK = "book"
    GAME = "game"


class HobbyStatus(str, enum.Enum):
    WANT = "want"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    PAUSED = "paused"


class Hobby(Base):
    __tablename__ = "hobbies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    type = Column(Enum(HobbyType), nullable=False)
    status = Column(Enum(HobbyStatus), nullable=False, default=HobbyStatus.WANT)
    rating = Column(Integer, nullable=True)  # 1-10
    review = Column(Text, default="")
    cover_url = Column(String(500), default="")
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
