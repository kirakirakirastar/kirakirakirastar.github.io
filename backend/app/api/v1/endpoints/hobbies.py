# Hobbies API
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.response import resp
from app.db.session import get_db
from app.schemas.hobby import HobbyCreate, HobbyUpdate, HobbyResponse, HobbyStats
from app.services import hobby_service

router = APIRouter(prefix="/hobbies", tags=["Hobbies"])


@router.get("")
async def list_hobbies(
    type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    hobbies = hobby_service.list_hobbies(db, type, status)
    return resp([HobbyResponse.model_validate(h) for h in hobbies])


@router.post("")
async def create_hobby(item: HobbyCreate, db: Session = Depends(get_db)):
    hobby = hobby_service.create_hobby(
        db,
        title=item.title,
        type=item.type,
        status=item.status,
        rating=item.rating,
        review=item.review or "",
        cover_url=item.cover_url or "",
        started_at=item.started_at,
        completed_at=item.completed_at
    )
    return resp(HobbyResponse.model_validate(hobby))


@router.get("/stats")
async def get_stats(db: Session = Depends(get_db)):
    stats = hobby_service.get_stats(db)
    return resp(stats)


@router.get("/{hobby_id}")
async def get_hobby(hobby_id: int, db: Session = Depends(get_db)):
    hobby = hobby_service.get_hobby(db, hobby_id)
    if not hobby:
        return resp(code=404, message="条目不存在")
    return resp(HobbyResponse.model_validate(hobby))


@router.put("/{hobby_id}")
async def update_hobby(hobby_id: int, item: HobbyUpdate, db: Session = Depends(get_db)):
    hobby = hobby_service.get_hobby(db, hobby_id)
    if not hobby:
        return resp(code=404, message="条目不存在")

    data = {k: v for k, v in item.model_dump(exclude_unset=True).items() if v is not None}
    hobby = hobby_service.update_hobby(db, hobby, **data)

    return resp(HobbyResponse.model_validate(hobby))


@router.delete("/{hobby_id}")
async def delete_hobby(hobby_id: int, db: Session = Depends(get_db)):
    hobby = hobby_service.get_hobby(db, hobby_id)
    if not hobby:
        return resp(code=404, message="条目不存在")
    hobby_service.delete_hobby(db, hobby)
    return resp(message="删除成功")
