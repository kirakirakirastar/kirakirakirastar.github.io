from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from app.db.session import Base


class Journal(Base):
    __tablename__ = "journals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content_html = Column(Text, nullable=False)  # HTML 内容
    content_json = Column(Text, default="{}")  # 编辑器 JSON 内容
    excerpt = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
