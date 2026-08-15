from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime, timezone
from app.db.database import get_db
from app.models.models import Medicine, Inventory, Pharmacy, MedicineSearch
from app.schemas.schemas import MedicineOut, PublicPharmacyAvailabilityOut

router = APIRouter(prefix="/medicines", tags=["Medicines"])

@router.get("", response_model=List[MedicineOut])
def search_medicines(
    q: Optional[str] = Query(None, description="Search term for name or generic name"),
    db: Session = Depends(get_db)
):
    query = db.query(Medicine)
    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Medicine.name.ilike(search_pattern),
                Medicine.generic_name.ilike(search_pattern),
                Medicine.strength.ilike(search_pattern)
            )
        )
    return query.limit(50).all()

@router.get("/{id}", response_model=MedicineOut)
def get_medicine(id: str, db: Session = Depends(get_db)):
    med = db.query(Medicine).filter(Medicine.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")
    return med

@router.get("/{id}/availability", response_model=List[PublicPharmacyAvailabilityOut])
def get_medicine_availability(
    id: str,
    log_search: bool = True,
    coarse_location: Optional[str] = "Thrissur Metro Area",
    db: Session = Depends(get_db)
):
    """
    CRITICAL PRIVACY REQUIREMENT:
    Returns participating pharmacies and their availability status (available/unavailable/uncertain).
    NEVER exposes internal stock quantities, prices, or profit margins to patient-facing views.
    """
    med = db.query(Medicine).filter(Medicine.id == id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    # Record anonymous search signal for demand intelligence
    if log_search:
        search_rec = MedicineSearch(
            medicine_id=id,
            coarse_location=coarse_location or "Thrissur Central",
            created_at=datetime.now(timezone.utc)
        )
        db.add(search_rec)
        db.commit()

    # Query all participating pharmacies that stock or list this medicine
    inventories = db.query(Inventory).filter(Inventory.medicine_id == id).all()

    results = []
    for inv in inventories:
        results.append(PublicPharmacyAvailabilityOut(
            pharmacy_id=inv.pharmacy_id,
            pharmacy_name=inv.pharmacy.name,
            address=inv.pharmacy.address,
            latitude=inv.pharmacy.latitude,
            longitude=inv.pharmacy.longitude,
            availability_status=inv.availability_status,
            last_updated=inv.last_updated
        ))

    return results
