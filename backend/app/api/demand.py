from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import DemandMetric, Medicine
from app.schemas.schemas import DemandMetricOut

router = APIRouter(prefix="/demand", tags=["Demand Intelligence"])

@router.get("", response_model=List[DemandMetricOut])
def get_demand_intelligence(db: Session = Depends(get_db)):
    metrics = db.query(DemandMetric).all()
    results = []
    for dm in metrics:
        # Supply gap is flagged when demand is high or medium, and availability is under 50%
        is_gap = (dm.demand_level in ["High", "Medium"]) and (dm.availability_percentage < 50.0)
        results.append(DemandMetricOut(
            id=dm.id,
            medicine_id=dm.medicine_id,
            medicine_name=dm.medicine.name,
            generic_name=dm.medicine.generic_name,
            strength=dm.medicine.strength,
            area=dm.area,
            search_count=dm.search_count,
            prescription_count=dm.prescription_count,
            availability_percentage=dm.availability_percentage,
            demand_score=dm.demand_score,
            demand_level=dm.demand_level,
            supply_gap_detected=is_gap,
            calculated_at=dm.calculated_at
        ))
    return results

@router.get("/{medicine_id}", response_model=DemandMetricOut)
def get_medicine_demand(medicine_id: str, db: Session = Depends(get_db)):
    dm = db.query(DemandMetric).filter(DemandMetric.medicine_id == medicine_id).first()
    if not dm:
        raise HTTPException(status_code=404, detail="Demand metric not found for this medicine")

    is_gap = (dm.demand_level in ["High", "Medium"]) and (dm.availability_percentage < 50.0)
    return DemandMetricOut(
        id=dm.id,
        medicine_id=dm.medicine_id,
        medicine_name=dm.medicine.name,
        generic_name=dm.medicine.generic_name,
        strength=dm.medicine.strength,
        area=dm.area,
        search_count=dm.search_count,
        prescription_count=dm.prescription_count,
        availability_percentage=dm.availability_percentage,
        demand_score=dm.demand_score,
        demand_level=dm.demand_level,
        supply_gap_detected=is_gap,
        calculated_at=dm.calculated_at
    )
