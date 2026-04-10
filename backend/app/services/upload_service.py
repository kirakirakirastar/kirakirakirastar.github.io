# Upload service
import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.upload import Upload


def save_upload(db: Session, file: UploadFile) -> Upload:
    # 验证文件类型
    ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise ValueError(f"不支持的文件类型: {ext}")

    # 生成唯一文件名
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    upload_path = Path(settings.UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)

    # 按日期组织子目录（可选）
    from datetime import datetime
    date_path = datetime.now().strftime("%Y/%m")
    full_path = upload_path / date_path
    full_path.mkdir(parents=True, exist_ok=True)

    file_path = full_path / unique_name

    # 保存文件
    contents = file.file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise ValueError("文件过大")

    with open(file_path, 'wb') as f:
        f.write(contents)

    # 相对 URL
    url = f"/uploads/{date_path}/{unique_name}"

    # 记录到数据库
    upload = Upload(
        filename=unique_name,
        original_name=file.filename,
        mime_type=file.content_type,
        size=len(contents),
        url=url
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)

    return upload
