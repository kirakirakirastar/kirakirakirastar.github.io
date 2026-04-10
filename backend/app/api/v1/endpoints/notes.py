# Notes API
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.core.response import resp
from app.db.session import get_db
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteListItem
from app.services import note_service
from app.models.tag import Tag

router = APIRouter(prefix="/notes", tags=["Notes"])


@router.get("")
async def list_notes(
    tag: Optional[str] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db)
):
    notes = note_service.list_notes(db, tag, year, month, keyword)
    return resp([NoteListItem.model_validate(n) for n in notes])


@router.post("")
async def create_note(item: NoteCreate, db: Session = Depends(get_db)):
    note = note_service.create_note(db, item.title, item.content_md, item.summary or "", item.tags or [])
    return resp(NoteResponse.model_validate(note))


@router.get("/archives")
async def get_archives(db: Session = Depends(get_db)):
    archives = note_service.get_archives(db)
    return resp(archives)


@router.get("/tags")
async def get_tags(db: Session = Depends(get_db)):
    tags = note_service.list_tags(db)
    return resp([{"id": t.id, "name": t.name} for t in tags])


@router.get("/{note_id}")
async def get_note(note_id: int, db: Session = Depends(get_db)):
    note = note_service.get_note(db, note_id)
    if not note:
        return resp(code=404, message="笔记不存在")
    return resp(NoteResponse.model_validate(note))


@router.put("/{note_id}")
async def update_note(note_id: int, item: NoteUpdate, db: Session = Depends(get_db)):
    note = note_service.get_note(db, note_id)
    if not note:
        return resp(code=404, message="笔记不存在")

    data = item.model_dump(exclude_unset=True)
    if 'tags' in data:
        tags = data.pop('tags')
        note_service.update_note(db, note, **data)
        # 更新标签
        note.tags.clear()
        for tag_name in tags or []:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
            note.tags.append(tag)
        db.commit()
        db.refresh(note)
    else:
        note = note_service.update_note(db, note, **data)

    return resp(NoteResponse.model_validate(note))


@router.delete("/{note_id}")
async def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = note_service.get_note(db, note_id)
    if not note:
        return resp(code=404, message="笔记不存在")
    note_service.delete_note(db, note)
    return resp(message="删除成功")
