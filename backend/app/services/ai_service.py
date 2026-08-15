from typing import List, Dict, Any
from app.models.models import Prescription, Patient

class AIService:
    @staticmethod
    def generate_patient_history_summary(patient: Patient, prescriptions: List[Prescription]) -> Dict[str, Any]:
        if not prescriptions:
            return {
                "patient_name": patient.name,
                "prescription_count": 0,
                "timeline_summary": f"No prior prescription records exist in the AyuLink network for patient {patient.name}.",
                "key_medications": [],
                "disclaimer": "AI-generated summary based on recorded AyuLink data. Assistive information only. Physician confirmation required."
            }

        # Aggregate medications from records
        med_records = []
        unique_meds = set()
        dates_sorted = sorted(prescriptions, key=lambda p: p.created_at)

        for p in dates_sorted:
            date_str = p.created_at.strftime("%Y-%m-%d")
            items_str = ", ".join([f"{item.medicine.name} ({item.dose}, {item.frequency})" for item in p.items])
            med_records.append(f"• {date_str}: {items_str} [Status: {p.status.capitalize()}]")
            for item in p.items:
                unique_meds.add(item.medicine.name)

        summary_text = (
            f"Patient {patient.name} has {len(prescriptions)} recorded prescription encounters in the AyuLink database. "
            f"Active therapy history includes {len(unique_meds)} distinct pharmaceutical agents across General & Internal medicine. "
            f"Most recent recorded treatment on {dates_sorted[-1].created_at.strftime('%B %d, %Y')} included: "
            + ", ".join([item.medicine.name for item in dates_sorted[-1].items]) + "."
        )

        return {
            "patient_name": patient.name,
            "prescription_count": len(prescriptions),
            "timeline_summary": summary_text,
            "timeline_entries": med_records,
            "key_medications": list(unique_meds),
            "disclaimer": "AI-generated summary based on recorded AyuLink data. Assistive information only. Physician confirmation required."
        }

    @staticmethod
    def explain_demand_metric(medicine_name: str, metric_data: Dict[str, Any]) -> Dict[str, Any]:
        search_count = metric_data.get("search_count", 0)
        rx_count = metric_data.get("prescription_count", 0)
        avail_pct = metric_data.get("availability_percentage", 100.0)
        score = metric_data.get("demand_score", 50.0)
        level = metric_data.get("demand_level", "Medium")

        factors = [
            {"factor": "Patient Search Volume", "weight": "40%", "value": f"{search_count} localized searches", "impact": "High" if search_count > 100 else "Moderate"},
            {"factor": "Prescription Inflow", "weight": "40%", "value": f"{rx_count} physician orders", "impact": "High" if rx_count > 50 else "Moderate"},
            {"factor": "Local Availability Ratio", "weight": "20%", "value": f"{avail_pct}% fulfillment coverage", "impact": "Critical Gap" if avail_pct < 50 else "Adequate"}
        ]

        if avail_pct < 50 and score > 70:
            explanation = f"Potential supply gap detected for {medicine_name}. Search volume ({search_count}) and prescription demand ({rx_count}) are outpacing local pharmacy stock levels ({avail_pct}% availability)."
        else:
            explanation = f"Demand for {medicine_name} is operating at {level.lower()} intensity with balanced distribution across regional fulfillment partners."

        return {
            "medicine_name": medicine_name,
            "score": score,
            "level": level,
            "factors": factors,
            "explanation": explanation,
            "disclaimer": "Demand Intelligence / prototype signal. Non-prescriptive analytics for pharmacy capacity planning."
        }
