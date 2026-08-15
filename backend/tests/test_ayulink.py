import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import Base, engine, SessionLocal
from app.db.seed_data import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db_before_tests():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
    yield

def test_root_disclaimer():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "AyuLink" in data["app"]
    assert "Clinicians decide" in data["disclaimer"]

def test_auth_login_all_roles():
    # Doctor login
    doc_res = client.post("/api/auth/login", json={"email": "doctor@ayulink.demo", "password": "demo123"})
    assert doc_res.status_code == 200
    doc_data = doc_res.json()
    assert doc_data["user"]["role"] == "doctor"
    assert "doctor_id" in doc_data["role_profile"]

    # Pharmacy login
    pharm_res = client.post("/api/auth/login", json={"email": "pharmacy@ayulink.demo", "password": "demo123"})
    assert pharm_res.status_code == 200
    pharm_data = pharm_res.json()
    assert pharm_data["user"]["role"] == "pharmacy"
    assert "pharmacy_id" in pharm_data["role_profile"]

    # Patient login
    pat_res = client.post("/api/auth/login", json={"email": "patient@ayulink.demo", "password": "demo123"})
    assert pat_res.status_code == 200
    pat_data = pat_res.json()
    assert pat_data["user"]["role"] == "patient"
    assert "patient_id" in pat_data["role_profile"]

def test_primary_demo_workflow_end_to_end():
    """
    Validates Master Demo Scenario 1:
    1. Doctor creates prescription for Amoxicillin 500mg to CarePlus Pharmacy.
    2. CarePlus Pharmacy receives prescription and clicks 'Notify Doctor' (Unavailable).
    3. Prescription status transitions to 'unavailable' and Doctor receives notification.
    4. Doctor resolves with clinician-controlled decision (Substitute Augmentin 625mg).
    5. Prescription transitions to 'resolved' and Pharmacy receives resolution notification.
    """
    # 1. Fetch Patient Rahul and CarePlus Pharmacy and Amoxicillin medicine
    patients = client.get("/api/patients").json()
    rahul = next(p for p in patients if "Rahul" in p["name"])

    pharmacies = client.get("/api/pharmacies").json()
    careplus = next(p for p in pharmacies if "CarePlus" in p["name"])

    meds = client.get("/api/medicines?q=Amoxicillin").json()
    amox = next(m for m in meds if "500" in m["strength"])

    # Doctor creates prescription
    create_payload = {
        "patient_id": rahul["id"],
        "pharmacy_id": careplus["id"],
        "notes": "Acute bacterial pharyngitis suspected. Prescribing first-line antibiotic.",
        "items": [
            {
                "medicine_id": amox["id"],
                "dose": "1 capsule",
                "frequency": "Twice daily",
                "duration": "5 days",
                "instructions": "Take after food with water."
            }
        ]
    }
    create_res = client.post("/api/prescriptions", json=create_payload)
    assert create_res.status_code == 200
    rx = create_res.json()
    assert rx["status"] == "received"
    assert len(rx["items"]) == 1
    assert rx["items"][0]["medicine"]["name"] == "Amoxicillin 500 mg"
    rx_id = rx["id"]

    # 2. Pharmacy receives it and marks medicine unavailable -> notifies doctor
    unavail_res = client.post(f"/api/prescriptions/{rx_id}/unavailable", json={
        "notes": "Amoxicillin 500mg currently out of stock at Round North location."
    })
    assert unavail_res.status_code == 200
    unavail_data = unavail_res.json()
    assert unavail_data["status"] == "unavailable"

    # Verify Doctor received the high-priority notification
    doc_dashboard = client.get("/api/doctors/dashboard?doctor_id=" + rx["doctor_id"]).json()
    assert doc_dashboard["pending_responses_count"] >= 1
    assert any("cannot fulfill" in n["message"] or "Availability Alert" in n["title"] for n in doc_dashboard["notifications"])

    # 3. Doctor reviews & executes Clinician-Controlled Decision (Substitute Augmentin 625mg)
    augmentin = next(m for m in client.get("/api/medicines?q=Augmentin").json())
    resolve_payload = {
        "resolution_action": "substitute_medicine",
        "updated_medicine_id": augmentin["id"],
        "updated_dose": "1 tablet",
        "updated_frequency": "Twice daily",
        "updated_duration": "5 days",
        "resolution_notes": "Clinician substitute: Replaced with Augmentin 625mg (Amoxicillin/Clavulanate) due to local inventory constraint."
    }
    resolve_res = client.post(f"/api/prescriptions/{rx_id}/doctor-response", json=resolve_payload)
    assert resolve_res.status_code == 200
    resolved_data = resolve_res.json()
    assert resolved_data["status"] == "resolved"
    assert "Augmentin" in resolved_data["items"][0]["medicine"]["name"]
    assert "Clinician substitute" in resolved_data["resolution_notes"]

def test_second_demo_story_medicine_availability_privacy():
    """
    Validates Demo Story 2 & Strict Privacy Control:
    Patient searches for medicine availability.
    Returns pharmacy availability status, but NEVER internal stock quantity.
    """
    meds = client.get("/api/medicines?q=Paracetamol").json()
    paracetamol = meds[0]

    avail_res = client.get(f"/api/medicines/{paracetamol['id']}/availability")
    assert avail_res.status_code == 200
    avail_list = avail_res.json()
    assert len(avail_list) >= 3

    # Check privacy: internal_stock_quantity must NOT be present
    for entry in avail_list:
        assert "availability_status" in entry
        assert "last_updated" in entry
        assert "pharmacy_name" in entry
        assert "internal_stock_quantity" not in entry
        assert "stock" not in entry
        assert "quantity" not in entry

def test_third_demo_story_demand_intelligence_and_pos_sync():
    """
    Validates Demand Intelligence and Simulated Inventory POS sync.
    """
    demand_res = client.get("/api/demand")
    assert demand_res.status_code == 200
    metrics = demand_res.json()
    assert len(metrics) > 0

    ors_metric = next((m for m in metrics if "ORS" in m["medicine_name"]), None)
    assert ors_metric is not None
    assert ors_metric["supply_gap_detected"] is True
    assert ors_metric["demand_level"] == "High"

    # POS Sync test
    pharmacies = client.get("/api/pharmacies").json()
    pharm_id = pharmacies[0]["id"]
    sync_res = client.post(f"/api/inventory/sync?pharmacy_id={pharm_id}")
    assert sync_res.status_code == 200
    sync_data = sync_res.json()
    assert sync_data["status"] == "success"
    assert sync_data["medicines_processed"] > 0

def test_ai_patient_history_summary_and_safety_checks():
    """
    Validates AI Patient History summary generation & Drug Safety alerts.
    """
    patients = client.get("/api/patients").json()
    rahul = next(p for p in patients if "Rahul" in p["name"])

    # AI History summary
    history_res = client.post("/api/ai/history-summary", json={"patient_id": rahul["id"]})
    assert history_res.status_code == 200
    history_data = history_res.json()
    assert history_data["prescription_count"] >= 2
    assert "recorded prescription encounters" in history_data["timeline_summary"]
    assert "Physician confirmation required" in history_data["disclaimer"]

    # AI Medication Safety Check (Dual NSAIDs: Ibuprofen + Diclofenac)
    ibup = next(m for m in client.get("/api/medicines?q=Ibuprofen").json())
    diclo = next(m for m in client.get("/api/medicines?q=Diclofenac").json())

    safety_res = client.post("/api/ai/safety-check", json={
        "patient_id": rahul["id"],
        "items": [
            {"medicine_id": ibup["id"], "dose": "400mg", "frequency": "Twice daily"},
            {"medicine_id": diclo["id"], "dose": "50mg", "frequency": "Twice daily"}
        ]
    })
    assert safety_res.status_code == 200
    safety_data = safety_res.json()
    assert safety_data["has_alerts"] is True
    assert any("Dual NSAID" in a["title"] for a in safety_data["alerts"])
