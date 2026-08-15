# AyuLink

**Connecting doctors, pharmacies and patients through one structured prescription network.**

AyuLink transforms a prescription from an isolated paper document into a structured digital transaction connecting doctors, patients, and pharmacies.

---

## 1. Product Overview
AyuLink is a clinical coordination network platform designed to eliminate prescription handoff breakdowns, streamline medication availability verification, and maintain clinical safety with human-in-the-loop decision control.

## 2. The Problem
The traditional healthcare prescription workflow is fragmented:
1. Doctors handwrite or print paper prescriptions.
2. Patients travel to pharmacies without knowing stock levels.
3. If a medicine is out of stock, the patient leaves or searches elsewhere.
4. The prescribing doctor is rarely notified of out-of-stock hurdles or subsequent non-adherence.

## 3. The Solution
- **Structured Digital Prescriptions**: Doctors author structured digital orders with RxNorm-mapped concept validation.
- **Immediate Pharmacy Verification**: Chosen pharmacies receive the prescription instantly and verify stock.
- **Clinician-in-the-Loop Resolution**: If unavailable, the pharmacy notifies the doctor, who selects the appropriate substitution or alternative plan.
- **Privacy-Preserving Patient Search**: Patients search regional participating pharmacies for availability without exposing private inventory numbers.
- **Demand Intelligence**: Aggregated, privacy-preserving signals help pharmacies detect potential supply gaps before shortages escalate.

## 4. Architecture
See [docs/architecture.md](file:///c:/Ayulink/docs/architecture.md) for sequence diagrams and subsystem layouts.
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python 3.11) + Pydantic v2 + SQLAlchemy ORM
- **Database**: SQLite (local development) / Supabase PostgreSQL (cloud)
- **External Data**: RxNorm concept mapping & openFDA reference fallback

## 5. Technology Stack
- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS, Lucide React, Recharts
- **Backend**: FastAPI 0.141, Uvicorn, Pydantic 2.13, SQLAlchemy 2.0, Httpx, Pytest

## 6. Database Schema
- `users`: ID, name, email, password hash, role (`doctor`, `pharmacy`, `patient`)
- `doctors`: ID, user ID, specialization, license number
- `patients`: ID, user ID, name, date of birth
- `pharmacies`: ID, user ID, name, address, coordinates
- `medicines`: ID, name, generic name, strength, dosage form, RxCUI, prescription required
- `inventory`: ID, pharmacy ID, medicine ID, availability status, internal stock quantity (masked from public API), last updated
- `prescriptions`: ID, doctor ID, patient ID, pharmacy ID, status, notes, resolution notes, timestamps
- `prescription_items`: ID, prescription ID, medicine ID, dose, frequency, duration, instructions
- `notifications`: ID, recipient ID, prescription ID, type, title, message, read flag, timestamp
- `demand_metrics`: ID, medicine ID, area, search count, prescription count, availability percentage, demand score, demand level

## 7. Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```
Backend runs on `http://localhost:8000`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

## 8. Environment Variables
Copy `.env.example` to `.env`:
```env
DATABASE_URL=sqlite:///./ayulink.db
API_PREFIX=/api
DEMO_MODE=True
RXNORM_API_ENABLED=True
OPENFDA_API_ENABLED=True
```

## 9. Running Automated Tests
```bash
pytest -v
```

## 10. Demo Credentials
| Role | Name | Email | Password |
|---|---|---|---|
| **Doctor** | Dr. Arun Menon | `doctor@ayulink.demo` | `demo123` |
| **Doctor (Alternate)** | Dr. Priya Nair | `dr.priya@ayulink.demo` | `demo123` |
| **Pharmacy** | CarePlus Pharmacy | `pharmacy@ayulink.demo` | `demo123` |
| **Pharmacy (Partner)** | GreenCare Pharmacy | `greencare@ayulink.demo` | `demo123` |
| **Patient** | Rahul Krishnan | `patient@ayulink.demo` | `demo123` |

## 11. Core Demo Workflow
1. **Doctor creates prescription**: Prescribes *Amoxicillin 500 mg* to *CarePlus Pharmacy* for patient *Rahul Krishnan*.
2. **Pharmacy checks stock**: CarePlus inventory shows Amoxicillin unavailable -> clicks **"Notify Doctor"**.
3. **Doctor resolves**: Receives alert, reviews options, and confirms substitution (*Augmentin 625 mg*).
4. **Pharmacy dispenses**: Receives updated order and completes fulfillment.
5. **Patient searches**: Searches *Paracetamol* or *ORS* to see nearby participating pharmacy availability with protected stock counts.
6. **Demand Intelligence**: Reviews capacity signals and supply gap indicators.

See [docs/demo-script.md](file:///c:/Ayulink/docs/demo-script.md) for the presentation walkthrough.

## 12. API Documentation
See [docs/api.md](file:///c:/Ayulink/docs/api.md) or open interactive Swagger UI at `http://localhost:8000/docs`.

## 13. Safety & Prototype Limitations
> **Prototype Notice**: AyuLink is a demonstration prototype and is not intended for autonomous diagnosis, prescribing, dispensing, or medical decision-making. **AI assists. Clinicians decide.**

## 14. Resetting Demo State
Use the **"Reset Demo"** button in the header navbar or call:
```bash
curl -X POST http://localhost:8000/api/demo/reset
```

## 15. Future Roadmap
- **Phase 2**: Direct HL7 / FHIR protocol interoperability, digital signature PKI, verified credentialing.
- **Phase 3**: Hospital HIS / EMR integration, longitudinal medication adherence tracking.
- **Phase 4**: Regional multi-tier supply chain predictive reordering.
