from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Pharmacy, Inventory, Prescription, Notification
from app.schemas.schemas import InternalInventoryItemOut

router = APIRouter(prefix="/pharmacies", tags=["Pharmacies"])

@router.get("")
def list_pharmacies(db: Session = Depends(get_db)):
    pharmacies = db.query(Pharmacy).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "address": p.address,
            "latitude": p.latitude,
            "longitude": p.longitude,
            "user_id": p.user_id,
            "created_at": p.created_at
        }
        for p in pharmacies
    ]

@router.get("/{id}/inventory", response_model=list[InternalInventoryItemOut])
def get_pharmacy_inventory(id: str, db: Session = Depends(get_db)):
    """Internal pharmacy inventory management endpoint (Only for authorized pharmacy)."""
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == id).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")

    items = db.query(Inventory).filter(Inventory.pharmacy_id == id).all()
    return items

@router.get("/{id}/dashboard")
def get_pharmacy_dashboard(id: str, db: Session = Depends(get_db)):
    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == id).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")

    prescriptions = db.query(Prescription).filter(Prescription.pharmacy_id == id).all()
    incoming = [p for p in prescriptions if p.status in ["sent", "received"]]
    pending_doctor = [p for p in prescriptions if p.status in ["unavailable", "doctor_review"]]
    resolved = [p for p in prescriptions if p.status in ["resolved"]]
    completed = [p for p in prescriptions if p.status in ["completed"]]

    inventory_items = db.query(Inventory).filter(Inventory.pharmacy_id == id).all()
    low_availability = [inv for inv in inventory_items if inv.availability_status in ["unavailable", "uncertain"]]

    notifications = db.query(Notification).filter(
        Notification.recipient_user_id == pharmacy.user_id
    ).order_by(Notification.created_at.desc()).limit(10).all()

    return {
        "pharmacy_name": pharmacy.name,
        "address": pharmacy.address,
        "incoming_count": len(incoming),
        "pending_doctor_count": len(pending_doctor),
        "resolved_count": len(resolved),
        "completed_count": len(completed),
        "low_availability_count": len(low_availability),
        "incoming_prescriptions": [
            {
                "id": p.id,
                "patient_name": p.patient.name,
                "doctor_name": p.doctor.user.name if p.doctor and p.doctor.user else "Dr. Unknown",
                "doctor_specialization": p.doctor.specialization if p.doctor else "General",
                "status": p.status,
                "notes": p.notes,
                "resolution_notes": p.resolution_notes,
                "item_count": len(p.items),
                "items": [
                    {
                        "id": item.id,
                        "medicine_name": item.medicine.name,
                        "strength": item.medicine.strength,
                        "dose": item.dose,
                        "frequency": item.frequency,
                        "duration": item.duration,
                        "instructions": item.instructions
                    }
                    for item in p.items
                ],
                "created_at": p.created_at,
                "updated_at": p.updated_at
            }
            for p in prescriptions if p.status in ["sent", "received", "unavailable", "doctor_review", "resolved"]
        ],
        "notifications": [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "type": n.type,
                "is_read": n.is_read,
                "created_at": n.created_at
            }
            for n in notifications
        ]
    }
