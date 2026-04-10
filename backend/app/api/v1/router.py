# API v1 router
from fastapi import APIRouter

from app.api.v1.endpoints import notes, journals, hobbies, dashboard, upload

api_router = APIRouter()
api_router.include_router(notes.router)
api_router.include_router(journals.router)
api_router.include_router(hobbies.router)
api_router.include_router(dashboard.router)
api_router.include_router(upload.router)
# sync 路由预留，当前不实现
# from app.api.v1.endpoints import sync
# api_router.include_router(sync.router)
# WebDAV 挂载预留位置
