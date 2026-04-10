# Journals API
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.response import resp
from app.db.session import get_db
from app.schemas.journal import JournalCreate, JournalUpdate, JournalResponse, JournalListItem
from app.services import journal_service

router = APIRouter(prefix="/journals", tags=["Journals"])


@router.get("")
async def list_journals(
    year: Optional[int] = None,
    month: Optional[int] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db)
):
    journals = journal_service.list_journals(db, year, month, keyword)
    return resp([JournalListItem.model_validate(j) for j in journals])


@router.post("")
async def create_journal(item: JournalCreate, db: Session = Depends(get_db)):
    journal = journal_service.create_journal(
        db,
        item.title,
        item.content_html,
        item.content_json or "{}",
        item.excerpt or ""
    )
    return resp(JournalResponse.model_validate(journal))


@router.get("/archives")
async def get_archives(db: Session = Depends(get_db)):
    archives = journal_service.get_archives(db)
    return resp(archives)


@router.get("/{journal_id}")
async def get_journal(journal_id: int, db: Session = Depends(get_db)):
    journal = journal_service.get_journal(db, journal_id)
    if not journal:
        return resp(code=404, message="日志不存在")
    return resp(JournalResponse.model_validate(journal))


@router.put("/{journal_id}")
async def update_journal(journal_id: int, item: JournalUpdate, db: Session = Depends(get_db)):
    journal = journal_service.get_journal(db, journal_id)
    if not journal:
        return resp(code=404, message="日志不存在")

    data = {k: v for k, v in item.model_dump(exclude_unset=True).items() if v is not None}
    journal = journal_service.update_journal(db, journal, **data)

    return resp(JournalResponse.model_validate(journal))


@router.delete("/{journal_id}")
async def delete_journal(journal_id: int, db: Session = Depends(get_db)):
    journal = journal_service.get_journal(db, journal_id)
    if not journal:
        return resp(code=404, message="日志不存在")
    journal_service.delete_journal(db, journal)
    return resp(message="删除成功")
