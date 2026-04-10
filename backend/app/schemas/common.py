# Common schemas
from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


# 分页响应
class PageResponse(BaseModel):
    items: list[Any]
    total: int
    page: int
    page_size: int
    total_pages: int
