# Hobbies service
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.hobby import Hobby, HobbyType, HobbyStatus


def create_hobby(db: Session, **kwargs) -> Hobby:
    payload = dict(kwargs)
    if "type" in payload and payload["type"] is not None:
        payload["type"] = HobbyType(payload["type"])
    if "status" in payload and payload["status"] is not None:
        payload["status"] = HobbyStatus(payload["status"])

    hobby = Hobby(**payload)
    db.add(hobby)
    db.commit()
    db.refresh(hobby)
    return hobby


def get_hobby(db: Session, hobby_id: int) -> Optional[Hobby]:
    return db.query(Hobby).filter(Hobby.id == hobby_id).first()


def list_hobbies(db: Session, type_filter: str = None, status_filter: str = None):
    query = db.query(Hobby)

    if type_filter:
        query = query.filter(Hobby.type == HobbyType(type_filter))
    if status_filter:
        query = query.filter(Hobby.status == HobbyStatus(status_filter))

    return query.order_by(Hobby.updated_at.desc()).all()


def update_hobby(db: Session, hobby: Hobby, **kwargs):
    for key, value in kwargs.items():
        if hasattr(hobby, key) and value is not None:
            if key == "type":
                value = HobbyType(value)
            elif key == "status":
                value = HobbyStatus(value)
            setattr(hobby, key, value)

    db.commit()
    db.refresh(hobby)
    return hobby


def delete_hobby(db: Session, hobby: Hobby):
    db.delete(hobby)
    db.commit()


def get_stats(db: Session):
    total = db.query(Hobby).count()
    completed = db.query(Hobby).filter(Hobby.status == HobbyStatus.COMPLETED).count()
    in_progress = db.query(Hobby).filter(Hobby.status == HobbyStatus.IN_PROGRESS).count()
    want = db.query(Hobby).filter(Hobby.status == HobbyStatus.WANT).count()
    paused = db.query(Hobby).filter(Hobby.status == HobbyStatus.PAUSED).count()

    anime_count = db.query(Hobby).filter(Hobby.type == HobbyType.ANIME).count()
    book_count = db.query(Hobby).filter(Hobby.type == HobbyType.BOOK).count()
    game_count = db.query(Hobby).filter(Hobby.type == HobbyType.GAME).count()

    avg_rating = db.query(func.avg(Hobby.rating)).filter(Hobby.rating.isnot(None)).scalar()

    return {
        "total": total,
        "completed": completed,
        "in_progress": in_progress,
        "want": want,
        "paused": paused,
        "anime_count": anime_count,
        "book_count": book_count,
        "game_count": game_count,
        "avg_rating": float(avg_rating) if avg_rating else None,
    }
