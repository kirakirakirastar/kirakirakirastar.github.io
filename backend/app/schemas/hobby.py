# Hobby schemas
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class HobbyCreate(BaseModel):
    title: str
    type: str  # anime, book, game
    status: str = "want"  # want, in_progress, completed, paused
    rating: Optional[int] = None  # 1-10
    review: Optional[str] = ""
    cover_url: Optional[str] = ""
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class HobbyUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    rating: Optional[int] = None
    review: Optional[str] = None
    cover_url: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class HobbyResponse(BaseModel):
    id: int
    title: str
    type: str
    status: str
    rating: Optional[int]
    review: str
    cover_url: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HobbyStats(BaseModel):
    total: int
    completed: int
    in_progress: int
    want: int
    paused: int
    anime_count: int
    book_count: int
    game_count: int
    avg_rating: Optional[float]
