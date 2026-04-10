# Dashboard API
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.response import resp
from app.db.session import get_db
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("")
async def get_dashboard(db: Session = Depends(get_db)):
    data = dashboard_service.get_dashboard_data(db)
    return resp(data)
