import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Doctor, Prescription, Patient, Notification, PrescriptionTemplate

router = APIRouter(prefix="/doctors", tags=["Doctors"])

@router.get("/dashboard")
def get_doctor_dashboard(doctor_id: str, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    prescriptions = db.query(Prescription).filter(Prescription.doctor_id == doctor_id).all()
    pending_responses = [p for p in prescriptions if p.status in ["unavailable", "doctor_review"]]
    active_prescriptions = [p for p in prescriptions if p.status in ["sent", "received", "resolved"]]

    # Recent patients
    patients = db.query(Patient).all()

    # Safety/System alerts for this doctor
    notifications = db.query(Notification).filter(
        Notification.recipient_user_id == doctor.user_id
    ).order_by(Notification.created_at.desc()).limit(10).all()

    return {
        "doctor_name": doctor.user.name,
        "specialization": doctor.specialization,
        "license_number": doctor.license_number,
        "total_prescriptions": len(prescriptions),
        "pending_responses_count": len(pending_responses),
        "active_prescriptions_count": len(active_prescriptions),
        "patients_count": len(patients),
        "pending_prescriptions": [
            {
                "id": p.id,
                "patient_name": p.patient.name,
                "pharmacy_name": p.pharmacy.name if p.pharmacy else "Unassigned",
                "status": p.status,
                "notes": p.notes,
                "created_at": p.created_at
            }
            for p in pending_responses
        ],
        "recent_prescriptions": [
            {
                "id": p.id,
                "patient_name": p.patient.name,
                "pharmacy_name": p.pharmacy.name if p.pharmacy else "Unassigned",
                "status": p.status,
                "created_at": p.created_at
            }
            for p in prescriptions[-5:]
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

@router.get("/templates")
def get_prescription_templates(doctor_id: str, db: Session = Depends(get_db)):
    templates = db.query(PrescriptionTemplate).filter(
        (PrescriptionTemplate.doctor_id == doctor_id) | (PrescriptionTemplate.doctor_id.isnot(None))
    ).all()
    results = []
    for t in templates:
        results.append({
            "id": t.id,
            "name": t.name,
            "specialization": t.specialization,
            "items": json.loads(t.items_json) if t.items_json else []
        })
    return results
