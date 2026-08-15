from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Patient, Prescription
from app.schemas.schemas import PrescriptionOut

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("")
def list_patients(db: Session = Depends(get_db)):
    patients = db.query(Patient).all()
    return [
        {
            "id": p.id,
            "user_id": p.user_id,
            "name": p.name,
            "date_of_birth": p.date_of_birth,
            "email": p.user.email if p.user else None,
            "created_at": p.created_at
        }
        for p in patients
    ]

@router.get("/{id}")
def get_patient(id: str, db: Session = Depends(get_db)):
    p = db.query(Patient).filter(Patient.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {
        "id": p.id,
        "name": p.name,
        "date_of_birth": p.date_of_birth,
        "email": p.user.email if p.user else None,
        "created_at": p.created_at
    }

@router.get("/{id}/prescriptions")
def get_patient_prescriptions(id: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    prescriptions = db.query(Prescription).filter(Prescription.patient_id == id).order_by(Prescription.created_at.desc()).all()
    result = []
    for p in prescriptions:
        result.append(PrescriptionOut(
            id=p.id,
            doctor_id=p.doctor_id,
            doctor_name=p.doctor.user.name if p.doctor and p.doctor.user else "Dr. Unknown",
            doctor_specialization=p.doctor.specialization if p.doctor else None,
            patient_id=p.patient_id,
            patient_name=p.patient.name if p.patient else None,
            pharmacy_id=p.pharmacy_id,
            pharmacy_name=p.pharmacy.name if p.pharmacy else "No Pharmacy Assigned",
            status=p.status,
            notes=p.notes,
            resolution_notes=p.resolution_notes,
            items=[
                {
                    "id": item.id,
                    "prescription_id": item.prescription_id,
                    "medicine_id": item.medicine_id,
                    "medicine": {
                        "id": item.medicine.id,
                        "name": item.medicine.name,
                        "generic_name": item.medicine.generic_name,
                        "strength": item.medicine.strength,
                        "dosage_form": item.medicine.dosage_form,
                        "rxcui": item.medicine.rxcui,
                        "prescription_required": item.medicine.prescription_required
                    },
                    "dose": item.dose,
                    "frequency": item.frequency,
                    "duration": item.duration,
                    "instructions": item.instructions
                }
                for item in p.items
            ],
            created_at=p.created_at,
            updated_at=p.updated_at
        ))
    return result
