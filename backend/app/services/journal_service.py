# Journals service
from sqlalchemy.orm import Session
from sqlalchemy import extract
from typing import Optional

from app.models.journal import Journal


def create_journal(db: Session, title: str, content_html: str, content_json: str = "{}", excerpt: str = "") -> Journal:
    journal = Journal(title=title, content_html=content_html, content_json=content_json, excerpt=excerpt)
    db.add(journal)
    db.commit()
    db.refresh(journal)
    return journal


def get_journal(db: Session, journal_id: int) -> Optional[Journal]:
    return db.query(Journal).filter(Journal.id == journal_id).first()


def list_journals(db: Session, year: int = None, month: int = None, keyword: str = None):
    query = db.query(Journal)

    if year:
        query = query.filter(extract('year', Journal.created_at) == year)
    if month:
        query = query.filter(extract('month', Journal.created_at) == month)
    if keyword:
        query = query.filter(
            Journal.title.ilike(f"%{keyword}%") |
            Journal.excerpt.ilike(f"%{keyword}%") |
            Journal.content_html.ilike(f"%{keyword}%")
        )

    return query.order_by(Journal.created_at.desc()).all()


def update_journal(db: Session, journal: Journal, **kwargs):
    for key, value in kwargs.items():
        if hasattr(journal, key) and value is not None:
            setattr(journal, key, value)

    db.commit()
    db.refresh(journal)
    return journal


def delete_journal(db: Session, journal: Journal):
    db.delete(journal)
    db.commit()


def get_archives(db: Session):
    from sqlalchemy import func
    results = db.query(
        extract('year', Journal.created_at).label('year'),
        extract('month', Journal.created_at).label('month'),
        func.count(Journal.id).label('count')
    ).group_by('year', 'month').all()

    return [
        {"year": int(r.year), "month": int(r.month), "count": r.count}
        for r in results
    ]
