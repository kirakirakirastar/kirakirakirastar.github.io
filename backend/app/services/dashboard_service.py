# Dashboard service
from datetime import datetime

from sqlalchemy import extract
from sqlalchemy.orm import Session

from app.models.note import Note
from app.models.journal import Journal
from app.models.hobby import Hobby, HobbyStatus


def get_dashboard_data(db: Session):
    notes_count = db.query(Note).count()
    journals_count = db.query(Journal).count()
    hobbies_count = db.query(Hobby).count()
    completed_hobbies = db.query(Hobby).filter(Hobby.status == HobbyStatus.COMPLETED).count()

    latest_notes = db.query(Note).order_by(Note.created_at.desc()).limit(5).all()
    latest_journals = db.query(Journal).order_by(Journal.created_at.desc()).limit(5).all()
    latest_hobbies = db.query(Hobby).order_by(Hobby.updated_at.desc()).limit(5).all()

    now = datetime.now()
    month_updates = (
        db.query(Note)
        .filter(extract("year", Note.updated_at) == now.year, extract("month", Note.updated_at) == now.month)
        .count()
        + db.query(Journal)
        .filter(extract("year", Journal.updated_at) == now.year, extract("month", Journal.updated_at) == now.month)
        .count()
        + db.query(Hobby)
        .filter(extract("year", Hobby.updated_at) == now.year, extract("month", Hobby.updated_at) == now.month)
        .count()
    )

    return {
        "stats": {
            "notes_count": notes_count,
            "journals_count": journals_count,
            "hobbies_count": hobbies_count,
            "completed_hobbies": completed_hobbies,
            "month_updates": month_updates,
        },
        "latest_notes": [{"id": n.id, "title": n.title, "created_at": n.created_at.isoformat()} for n in latest_notes],
        "latest_journals": [{"id": j.id, "title": j.title, "created_at": j.created_at.isoformat()} for j in latest_journals],
        "latest_hobbies": [
            {"id": h.id, "title": h.title, "type": h.type.value, "status": h.status.value, "updated_at": h.updated_at.isoformat()}
            for h in latest_hobbies
        ],
    }
