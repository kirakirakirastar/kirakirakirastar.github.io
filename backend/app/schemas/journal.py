# Journal schemas
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class JournalCreate(BaseModel):
    title: str
    content_html: str
    content_json: Optional[str] = "{}"
    excerpt: Optional[str] = ""


class JournalUpdate(BaseModel):
    title: Optional[str] = None
    content_html: Optional[str] = None
    content_json: Optional[str] = None
    excerpt: Optional[str] = None


class JournalResponse(BaseModel):
    id: int
    title: str
    content_html: str
    content_json: str
    excerpt: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JournalListItem(BaseModel):
    id: int
    title: str
    excerpt: str
    created_at: datetime

    class Config:
        from_attributes = True
