from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.db.database import get_db
from app.models.models import (
    Prescription, PrescriptionItem, Doctor, Pharmacy, Patient, Notification, Medicine
)
from app.schemas.schemas import (
    CreatePrescriptionRequest, PrescriptionOut, PrescriptionItemOut,
    PrescriptionUnavailableRequest, PrescriptionResolveRequest
)

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])

def build_prescription_out(p: Prescription) -> PrescriptionOut:
    return PrescriptionOut(
        id=p.id,
        doctor_id=p.doctor_id,
        doctor_name=p.doctor.user.name if p.doctor and p.doctor.user else "Dr. Unknown",
        doctor_specialization=p.doctor.specialization if p.doctor else None,
        patient_id=p.patient_id,
        patient_name=p.patient.name if p.patient else None,
        pharmacy_id=p.pharmacy_id,
        pharmacy_name=p.pharmacy.name if p.pharmacy else "Unassigned Pharmacy",
        status=p.status,
        notes=p.notes,
        resolution_notes=p.resolution_notes,
        items=[
            PrescriptionItemOut(
                id=item.id,
                prescription_id=item.prescription_id,
                medicine_id=item.medicine_id,
                medicine={
                    "id": item.medicine.id,
                    "name": item.medicine.name,
                    "generic_name": item.medicine.generic_name,
                    "strength": item.medicine.strength,
                    "dosage_form": item.medicine.dosage_form,
                    "rxcui": item.medicine.rxcui,
                    "prescription_required": item.medicine.prescription_required
                },
                dose=item.dose,
                frequency=item.frequency,
                duration=item.duration,
                instructions=item.instructions
            )
            for item in p.items
        ],
        created_at=p.created_at,
        updated_at=p.updated_at
    )

@router.post("", response_model=PrescriptionOut)
def create_prescription(
    payload: CreatePrescriptionRequest,
    doctor_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # If doctor_id not explicitly supplied in query, find first doctor or fallback
    if not doctor_id:
        doc = db.query(Doctor).first()
        if not doc:
            raise HTTPException(status_code=400, detail="No doctor profile configured")
        doctor_id = doc.id
    else:
        doc = db.query(Doctor).filter(Doctor.id == doctor_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Doctor profile not found")

    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Initial status is 'received' if pharmacy assigned, else 'draft'
    init_status = "received" if payload.pharmacy_id else "draft"

    prescription = Prescription(
        doctor_id=doctor_id,
        patient_id=payload.patient_id,
        pharmacy_id=payload.pharmacy_id,
        status=init_status,
        notes=payload.notes,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(prescription)
    db.flush()

    for item_data in payload.items:
        med = db.query(Medicine).filter(Medicine.id == item_data.medicine_id).first()
        if not med:
            raise HTTPException(status_code=400, detail=f"Medicine {item_data.medicine_id} not found")
        item = PrescriptionItem(
            prescription_id=prescription.id,
            medicine_id=med.id,
            dose=item_data.dose,
            frequency=item_data.frequency,
            duration=item_data.duration,
            instructions=item_data.instructions
        )
        db.add(item)

    # If pharmacy selected, send notification to pharmacy
    if payload.pharmacy_id:
        pharmacy = db.query(Pharmacy).filter(Pharmacy.id == payload.pharmacy_id).first()
        if pharmacy:
            notif = Notification(
                recipient_user_id=pharmacy.user_id,
                prescription_id=prescription.id,
                type="prescription_received",
                title=f"New Prescription for {patient.name}",
                message=f"Dr. {doc.user.name} issued a structured digital prescription ({len(payload.items)} items).",
                created_at=datetime.now(timezone.utc)
            )
            db.add(notif)

    db.commit()
    db.refresh(prescription)
    return build_prescription_out(prescription)

@router.get("", response_model=List[PrescriptionOut])
def list_prescriptions(
    doctor_id: Optional[str] = None,
    pharmacy_id: Optional[str] = None,
    patient_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Prescription)
    if doctor_id:
        query = query.filter(Prescription.doctor_id == doctor_id)
    if pharmacy_id:
        query = query.filter(Prescription.pharmacy_id == pharmacy_id)
    if patient_id:
        query = query.filter(Prescription.patient_id == patient_id)
    if status:
        query = query.filter(Prescription.status == status)

    prescriptions = query.order_by(Prescription.created_at.desc()).all()
    return [build_prescription_out(p) for p in prescriptions]

@router.get("/{id}", response_model=PrescriptionOut)
def get_prescription(id: str, db: Session = Depends(get_db)):
    p = db.query(Prescription).filter(Prescription.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return build_prescription_out(p)

@router.post("/{id}/send", response_model=PrescriptionOut)
def send_prescription_to_pharmacy(
    id: str,
    pharmacy_id: str,
    db: Session = Depends(get_db)
):
    p = db.query(Prescription).filter(Prescription.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Prescription not found")

    pharmacy = db.query(Pharmacy).filter(Pharmacy.id == pharmacy_id).first()
    if not pharmacy:
        raise HTTPException(status_code=404, detail="Pharmacy not found")

    p.pharmacy_id = pharmacy_id
    p.status = "received"
    p.updated_at = datetime.now(timezone.utc)

    # Notify pharmacy
    notif = Notification(
        recipient_user_id=pharmacy.user_id,
        prescription_id=p.id,
        type="prescription_received",
        title=f"New Prescription for {p.patient.name}",
        message=f"Dr. {p.doctor.user.name} sent a prescription ({len(p.items)} items). Please review availability.",
        created_at=datetime.now(timezone.utc)
    )
    db.add(notif)
    db.commit()
    db.refresh(p)
    return build_prescription_out(p)

@router.post("/{id}/unavailable", response_model=PrescriptionOut)
def notify_doctor_medicine_unavailable(
    id: str,
    payload: Optional[PrescriptionUnavailableRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Core Demo Story Action:
    Pharmacy marks medicine unavailable and triggers an alert to the prescribing physician.
    """
    p = db.query(Prescription).filter(Prescription.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Prescription not found")

    p.status = "unavailable"
    p.updated_at = datetime.now(timezone.utc)
    med_list_str = ", ".join([i.medicine.name for i in p.items])

    # Send high-priority alert to the Doctor
    notif = Notification(
        recipient_user_id=p.doctor.user_id,
        prescription_id=p.id,
        type="medicine_unavailable",
        title="Pharmacy Availability Alert: Action Required",
        message=f"{p.pharmacy.name if p.pharmacy else 'Pharmacy'} cannot fulfill medication ({med_list_str}) for patient {p.patient.name}. Clinician review required.",
        created_at=datetime.now(timezone.utc)
    )
    db.add(notif)
    db.commit()
    db.refresh(p)
    return build_prescription_out(p)

@router.post("/{id}/doctor-response", response_model=PrescriptionOut)
def doctor_resolve_unavailable(
    id: str,
    payload: PrescriptionResolveRequest,
    db: Session = Depends(get_db)
):
    """
    Core Demo Story Action:
    Clinician decides the clinical resolution (substitutes medicine, changes dose/frequency, or reroutes).
    AI assists with suggestions, but the Doctor makes the decision.
    """
    p = db.query(Prescription).filter(Prescription.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Prescription not found")

    # If substituting medicine
    if payload.updated_medicine_id:
        new_med = db.query(Medicine).filter(Medicine.id == payload.updated_medicine_id).first()
        if new_med and len(p.items) > 0:
            primary_item = p.items[0]
            primary_item.medicine_id = new_med.id
            if payload.updated_dose:
                primary_item.dose = payload.updated_dose
            if payload.updated_frequency:
                primary_item.frequency = payload.updated_frequency
            if payload.updated_duration:
                primary_item.duration = payload.updated_duration
            primary_item.instructions = f"Physician substitution: {new_med.name}. {primary_item.instructions or ''}"

    if payload.new_pharmacy_id:
        p.pharmacy_id = payload.new_pharmacy_id

    p.status = "resolved"
    p.resolution_notes = payload.resolution_notes
    p.updated_at = datetime.now(timezone.utc)

    # Notify Pharmacy of clinician's resolution
    if p.pharmacy:
        notif = Notification(
            recipient_user_id=p.pharmacy.user_id,
            prescription_id=p.id,
            type="doctor_response",
            title=f"Physician Resolution Received for {p.patient.name}",
            message=f"Dr. {p.doctor.user.name} reviewed and updated the prescription: {payload.resolution_notes}",
            created_at=datetime.now(timezone.utc)
        )
        db.add(notif)

    # Notify Patient
    if p.patient and p.patient.user:
        pat_notif = Notification(
            recipient_user_id=p.patient.user_id,
            prescription_id=p.id,
            type="doctor_response",
            title="Prescription Updated by Doctor",
            message=f"Dr. {p.doctor.user.name} updated your prescription with revised medication instructions.",
            created_at=datetime.now(timezone.utc)
        )
        db.add(pat_notif)

    db.commit()
    db.refresh(p)
    return build_prescription_out(p)

@router.post("/{id}/complete", response_model=PrescriptionOut)
def complete_prescription(id: str, db: Session = Depends(get_db)):
    p = db.query(Prescription).filter(Prescription.id == id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Prescription not found")

    p.status = "completed"
    p.updated_at = datetime.now(timezone.utc)

    notif = Notification(
        recipient_user_id=p.patient.user_id,
        prescription_id=p.id,
        type="system",
        title="Prescription Dispensed",
        message=f"Your prescription from Dr. {p.doctor.user.name} has been dispensed by {p.pharmacy.name if p.pharmacy else 'the pharmacy'}.",
        created_at=datetime.now(timezone.utc)
    )
    db.add(notif)
    db.commit()
    db.refresh(p)
    return build_prescription_out(p)
