from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.seed_data import seed_database

router = APIRouter(prefix="/demo", tags=["Demo Management"])

@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """
    Restores the clean demo state for live presentations.
    CarePlus Pharmacy inventory will have Amoxicillin marked unavailable,
    allowing the full clinician loop demo to be repeated.
    """
    seed_database(db)
    return {
        "status": "success",
        "message": "AyuLink demo database has been reset to baseline scenario state successfully."
    }
