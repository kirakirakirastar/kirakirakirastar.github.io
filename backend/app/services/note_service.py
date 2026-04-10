# Notes service
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import Optional

from app.models.note import Note
from app.models.tag import Tag


def create_note(db: Session, title: str, content_md: str, summary: str = "", tags: list[str] = None) -> Note:
    note = Note(title=title, content_md=content_md, summary=summary)
    db.add(note)

    if tags:
        for tag_name in tags:
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
            note.tags.append(tag)

    db.commit()
    db.refresh(note)
    return note


def get_note(db: Session, note_id: int) -> Optional[Note]:
    return db.query(Note).filter(Note.id == note_id).first()


def list_notes(db: Session, tag: str = None, year: int = None, month: int = None, keyword: str = None):
    query = db.query(Note)

    if tag:
        query = query.join(Note.tags).filter(Tag.name == tag)
    if year:
        query = query.filter(extract('year', Note.created_at) == year)
    if month:
        query = query.filter(extract('month', Note.created_at) == month)
    if keyword:
        query = query.filter(Note.title.ilike(f"%{keyword}%") | Note.summary.ilike(f"%{keyword}%"))

    return query.order_by(Note.created_at.desc()).all()


def update_note(db: Session, note: Note, **kwargs):
    for key, value in kwargs.items():
        if hasattr(note, key) and value is not None:
            setattr(note, key, value)

    db.commit()
    db.refresh(note)
    return note


def delete_note(db: Session, note: Note):
    db.delete(note)
    db.commit()


def get_archives(db: Session):
    # 简单实现：按年/月统计
    from sqlalchemy import func
    results = db.query(
        extract('year', Note.created_at).label('year'),
        extract('month', Note.created_at).label('month'),
        func.count(Note.id).label('count')
    ).group_by('year', 'month').all()

    return [
        {"year": int(r.year), "month": int(r.month), "count": r.count}
        for r in results
    ]


def list_tags(db: Session):
    return db.query(Tag).all()
