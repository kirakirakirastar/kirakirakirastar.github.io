# Note schemas
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TagSchema(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class NoteCreate(BaseModel):
    title: str
    content_md: str
    summary: Optional[str] = ""
    tags: Optional[list[str]] = []


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content_md: Optional[str] = None
    summary: Optional[str] = None
    tags: Optional[list[str]] = None


class NoteResponse(BaseModel):
    id: int
    title: str
    content_md: str
    summary: str
    tags: list[TagSchema]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NoteListItem(BaseModel):
    id: int
    title: str
    summary: str
    tags: list[TagSchema]
    created_at: datetime

    class Config:
        from_attributes = True


class ArchiveItem(BaseModel):
    year: int
    month: int
    count: int
