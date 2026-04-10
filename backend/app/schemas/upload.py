# Upload schemas
from pydantic import BaseModel
from datetime import datetime


class UploadResponse(BaseModel):
    id: int
    filename: str
    original_name: str
    mime_type: str
    size: int
    url: str
    created_at: datetime

    class Config:
        from_attributes = True
