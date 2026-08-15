from typing import List, Dict, Any
from app.models.models import Medicine

# Deterministic safety rule matrix for reliable demo validation
INTERACTION_RULES = [
    {
        "meds": ["Ibuprofen", "Diclofenac"],
        "level": "warning",
        "title": "Dual NSAID Therapy Alert",
        "description": "Concurrent prescription of multiple Non-Steroidal Anti-Inflammatory Drugs (NSAIDs) increases the risk of gastrointestinal bleeding and renal impairment.",
        "recommendation": "Consider selecting a single NSAID at the lowest effective dose or adding gastroprotection.",
        "source": "Clinical Pharmacology & RxNorm Drug Matrix"
    },
    {
        "meds": ["Atorvastatin", "Azithromycin"],
        "level": "caution",
        "title": "Macrolide & Statin Interaction Warning",
        "description": "Macrolides may increase systemic exposure to CYP3A4-metabolized statins, slightly increasing myopathy risk.",
        "recommendation": "Monitor for unexpected muscle pain or temporarily hold statin during short-course macrolide therapy.",
        "source": "FDA Drug Safety Communication"
    },
    {
        "meds": ["Tramadol", "Cetirizine"],
        "level": "caution",
        "title": "Additive CNS Depression",
        "description": "Concurrent use of opioid analgesics and first/second-generation antihistamines may exacerbate sedation and psychomotor impairment.",
        "recommendation": "Advise patient to avoid operating machinery and monitor sedation level.",
        "source": "RxNorm Interaction Database"
    },
    {
        "meds": ["Amoxicillin", "Cefixime"],
        "level": "warning",
        "title": "Redundant Beta-Lactam Coverage",
        "description": "Dual beta-lactam antibiotic prescription may result in redundant antibacterial spectrum without clinical benefit.",
        "recommendation": "Review targeted pathogen and select a single optimal antimicrobial regimen.",
        "source": "Antimicrobial Stewardship Guidelines"
    }
]

DOSE_LIMIT_RULES = [
    {
        "generic": "Paracetamol",
        "max_single_mg": 1000,
        "warning_text": "Single dose exceeds standard adult recommendation (1000 mg max per single administration)."
    },
    {
        "generic": "Ibuprofen",
        "max_single_mg": 800,
        "warning_text": "Single dose exceeds standard adult ceiling dose (800 mg max)."
    }
]

class SafetyService:
    @staticmethod
    def check_prescription_safety(medicines: List[Medicine], doses: Dict[str, str] = None) -> List[Dict[str, Any]]:
        alerts = []
        med_names = [m.name for m in medicines]
        generic_names = [m.generic_name for m in medicines]

        # 1. Check Drug Interactions
        for rule in INTERACTION_RULES:
            matched_count = 0
            for req_med in rule["meds"]:
                if any(req_med.lower() in name.lower() for name in (med_names + generic_names)):
                    matched_count += 1
            if matched_count >= len(rule["meds"]):
                alerts.append({
                    "level": rule["level"],
                    "title": rule["title"],
                    "description": rule["description"],
                    "recommendation": rule["recommendation"],
                    "source": rule["source"],
                    "physician_confirmation_required": True
                })

        # 2. General Prescribing Guideline Check
        for m in medicines:
            if "Amoxicillin" in m.generic_name:
                alerts.append({
                    "level": "info",
                    "title": f"Penicillin Class Advisory ({m.name})",
                    "description": "Standard allergy verification recommended. Confirm patient has no documented hypersensitivity to penicillin or cephalosporin derivatives.",
                    "recommendation": "Physician confirmation of patient allergy history is advised.",
                    "source": "RxNorm Concept ID: " + (m.rxcui or "213169"),
                    "physician_confirmation_required": True
                })

        return alerts
