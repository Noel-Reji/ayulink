from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Patient, Prescription, Medicine, DemandMetric
from app.schemas.schemas import (
    HistorySummaryRequest, HistorySummaryResponse,
    SafetyCheckRequest, SafetyCheckResponse,
    DemandExplanationRequest, DemandExplanationResponse
)
from app.services.safety_service import SafetyService
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["Assistive AI Services"])

@router.post("/history-summary", response_model=HistorySummaryResponse)
def generate_history_summary(
    payload: HistorySummaryRequest,
    db: Session = Depends(get_db)
):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found")

    prescriptions = db.query(Prescription).filter(Prescription.patient_id == payload.patient_id).all()
    summary_data = AIService.generate_patient_history_summary(patient, prescriptions)

    return HistorySummaryResponse(
        patient_name=summary_data["patient_name"],
        prescription_count=summary_data["prescription_count"],
        timeline_summary=summary_data["timeline_summary"],
        key_medications=summary_data["key_medications"],
        disclaimer=summary_data["disclaimer"]
    )

@router.post("/safety-check", response_model=SafetyCheckResponse)
def check_prescription_safety(
    payload: SafetyCheckRequest,
    db: Session = Depends(get_db)
):
    med_ids = [item.medicine_id for item in payload.items]
    medicines = db.query(Medicine).filter(Medicine.id.in_(med_ids)).all()

    alerts = SafetyService.check_prescription_safety(medicines)
    return SafetyCheckResponse(
        has_alerts=len(alerts) > 0,
        alerts=alerts,
        disclaimer="Assistive information only. Physician confirmation required."
    )

@router.post("/demand-explanation", response_model=DemandExplanationResponse)
def explain_demand(
    payload: DemandExplanationRequest,
    db: Session = Depends(get_db)
):
    med = db.query(Medicine).filter(Medicine.id == payload.medicine_id).first()
    if not med:
        raise HTTPException(status_code=404, detail="Medicine not found")

    dm = db.query(DemandMetric).filter(DemandMetric.medicine_id == payload.medicine_id).first()
    metric_data = {
        "search_count": dm.search_count if dm else 45,
        "prescription_count": dm.prescription_count if dm else 20,
        "availability_percentage": dm.availability_percentage if dm else 75.0,
        "demand_score": dm.demand_score if dm else 50.0,
        "demand_level": dm.demand_level if dm else "Medium"
    }

    result = AIService.explain_demand_metric(med.name, metric_data)
    return DemandExplanationResponse(**result)
