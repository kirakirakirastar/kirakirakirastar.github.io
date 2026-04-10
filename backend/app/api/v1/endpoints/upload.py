# Upload API
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.core.response import resp
from app.db.session import get_db
from app.services import upload_service

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("")
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        upload = upload_service.save_upload(db, file)
        return resp({
            "id": upload.id,
            "filename": upload.filename,
            "original_name": upload.original_name,
            "mime_type": upload.mime_type,
            "size": upload.size,
            "url": upload.url,
            "created_at": upload.created_at.isoformat()
        })
    except Exception as e:
        return resp(code=400, message=str(e))
