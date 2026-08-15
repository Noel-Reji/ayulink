import hashlib
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.models import (
    User, Doctor, Patient, Pharmacy, Medicine,
    Inventory, Prescription, PrescriptionItem,
    Notification, MedicineSearch, DemandMetric, PrescriptionTemplate
)

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def seed_database(db: Session):
    # Clear existing demo data
    db.query(Notification).delete()
    db.query(PrescriptionItem).delete()
    db.query(Prescription).delete()
    db.query(Inventory).delete()
    db.query(MedicineSearch).delete()
    db.query(DemandMetric).delete()
    db.query(PrescriptionTemplate).delete()
    db.query(Medicine).delete()
    db.query(Doctor).delete()
    db.query(Patient).delete()
    db.query(Pharmacy).delete()
    db.query(User).delete()
    db.commit()

    demo_pass = hash_password("demo123")
    now = datetime.now(timezone.utc)

    # 1. Users & Profiles
    # Doctors
    doc1_user = User(
        name="Dr. Arun Menon",
        email="doctor@ayulink.demo",
        password_hash=demo_pass,
        role="doctor"
    )
    doc2_user = User(
        name="Dr. Priya Nair",
        email="dr.priya@ayulink.demo",
        password_hash=demo_pass,
        role="doctor"
    )
    db.add_all([doc1_user, doc2_user])
    db.flush()

    doc1 = Doctor(
        user_id=doc1_user.id,
        specialization="General Medicine",
        license_number="MED-KL-2018-9482"
    )
    doc2 = Doctor(
        user_id=doc2_user.id,
        specialization="Internal Medicine",
        license_number="MED-KL-2020-4109"
    )
    db.add_all([doc1, doc2])

    # Patients
    pat1_user = User(
        name="Rahul Krishnan",
        email="patient@ayulink.demo",
        password_hash=demo_pass,
        role="patient"
    )
    pat2_user = User(
        name="Anjali Thomas",
        email="anjali@ayulink.demo",
        password_hash=demo_pass,
        role="patient"
    )
    db.add_all([pat1_user, pat2_user])
    db.flush()

    pat1 = Patient(
        user_id=pat1_user.id,
        name="Rahul Krishnan",
        date_of_birth="1994-05-18"
    )
    pat2 = Patient(
        user_id=pat2_user.id,
        name="Anjali Thomas",
        date_of_birth="1988-11-23"
    )
    db.add_all([pat1, pat2])

    # Pharmacies
    pharm1_user = User(
        name="CarePlus Pharmacy",
        email="pharmacy@ayulink.demo",
        password_hash=demo_pass,
        role="pharmacy"
    )
    pharm2_user = User(
        name="GreenCare Pharmacy",
        email="greencare@ayulink.demo",
        password_hash=demo_pass,
        role="pharmacy"
    )
    pharm3_user = User(
        name="Medico Pharmacy",
        email="medico@ayulink.demo",
        password_hash=demo_pass,
        role="pharmacy"
    )
    pharm4_user = User(
        name="CityMed Pharmacy",
        email="citymed@ayulink.demo",
        password_hash=demo_pass,
        role="pharmacy"
    )
    db.add_all([pharm1_user, pharm2_user, pharm3_user, pharm4_user])
    db.flush()

    pharm1 = Pharmacy(
        user_id=pharm1_user.id,
        name="CarePlus Pharmacy",
        address="Round North, Thrissur, Kerala",
        latitude=10.5276,
        longitude=76.2144
    )
    pharm2 = Pharmacy(
        user_id=pharm2_user.id,
        name="GreenCare Pharmacy",
        address="MG Road, Thrissur, Kerala",
        latitude=10.5220,
        longitude=76.2180
    )
    pharm3 = Pharmacy(
        user_id=pharm3_user.id,
        name="Medico Pharmacy",
        address="Swaraj Round West, Thrissur, Kerala",
        latitude=10.5250,
        longitude=76.2100
    )
    pharm4 = Pharmacy(
        user_id=pharm4_user.id,
        name="CityMed Pharmacy",
        address="East Fort Junction, Thrissur, Kerala",
        latitude=10.5290,
        longitude=76.2230
    )
    db.add_all([pharm1, pharm2, pharm3, pharm4])
    db.flush()

    # 2. Medicines Seed (30+ items)
    medicines_data = [
        ("Amoxicillin 500 mg", "Amoxicillin", "500 mg", "Capsule", "213169", True),
        ("Paracetamol 500 mg", "Paracetamol", "500 mg", "Tablet", "209387", False),
        ("Azithromycin 500 mg", "Azithromycin", "500 mg", "Tablet", "248656", True),
        ("Metformin 500 mg", "Metformin", "500 mg", "Tablet", "860975", True),
        ("Amlodipine 5 mg", "Amlodipine", "5 mg", "Tablet", "197361", True),
        ("Cetirizine 10 mg", "Cetirizine", "10 mg", "Tablet", "310344", False),
        ("Pantoprazole 40 mg", "Pantoprazole", "40 mg", "Tablet", "284635", True),
        ("ORS (Oral Rehydration Salts)", "Oral Electrolytes", "21.8 g", "Sachet", "847232", False),
        ("Ibuprofen 400 mg", "Ibuprofen", "400 mg", "Tablet", "197806", False),
        ("Omeprazole 20 mg", "Omeprazole", "20 mg", "Capsule", "284649", True),
        ("Atorvastatin 20 mg", "Atorvastatin", "20 mg", "Tablet", "259255", True),
        ("Losartan 50 mg", "Losartan", "50 mg", "Tablet", "311354", True),
        ("Ciprofloxacin 500 mg", "Ciprofloxacin", "500 mg", "Tablet", "309309", True),
        ("Levofloxacin 500 mg", "Levofloxacin", "500 mg", "Tablet", "242095", True),
        ("Doxycycline 100 mg", "Doxycycline", "100 mg", "Capsule", "197607", True),
        ("Montelukast 10 mg", "Montelukast", "10 mg", "Tablet", "203531", True),
        ("Telmisartan 40 mg", "Telmisartan", "40 mg", "Tablet", "313171", True),
        ("Clopidogrel 75 mg", "Clopidogrel", "75 mg", "Tablet", "309362", True),
        ("Hydrochlorothiazide 25 mg", "Hydrochlorothiazide", "25 mg", "Tablet", "316049", True),
        ("Salbutamol 100 mcg", "Salbutamol", "100 mcg", "Inhaler", "745678", True),
        ("Budesonide 200 mcg", "Budesonide", "200 mcg", "Inhaler", "308881", True),
        ("Metoprolol 50 mg", "Metoprolol", "50 mg", "Tablet", "866414", True),
        ("Glimepiride 2 mg", "Glimepiride", "2 mg", "Tablet", "310537", True),
        ("Ranitidine 150 mg", "Ranitidine", "150 mg", "Tablet", "312845", True),
        ("Domperidone 10 mg", "Domperidone", "10 mg", "Tablet", "36443", True),
        ("Cefixime 200 mg", "Cefixime", "200 mg", "Tablet", "309088", True),
        ("Augmentin 625 mg", "Amoxicillin and Clavulanate Potassium", "625 mg", "Tablet", "213269", True),
        ("Tramadol 50 mg", "Tramadol", "50 mg", "Capsule", "835603", True),
        ("Diclofenac 50 mg", "Diclofenac", "50 mg", "Tablet", "200345", True),
        ("Gabapentin 300 mg", "Gabapentin", "300 mg", "Capsule", "310430", True),
        ("Multivitamin Complex", "Multivitamins + Minerals", "Standard", "Tablet", "1152002", False),
    ]

    med_objs = {}
    for name, generic, strength, form, rxcui, rx_req in medicines_data:
        m = Medicine(
            name=name,
            generic_name=generic,
            strength=strength,
            dosage_form=form,
            rxcui=rxcui,
            prescription_required=rx_req
        )
        db.add(m)
        med_objs[name] = m
    db.flush()

    # 3. Seed Inventory with Deterministic Availability Rules
    # CarePlus Pharmacy: Amoxicillin is UNAVAILABLE for the primary demo story!
    careplus_inv = [
        ("Amoxicillin 500 mg", "unavailable", 0),
        ("Paracetamol 500 mg", "available", 45),
        ("ORS (Oral Rehydration Salts)", "available", 12),
        ("Metformin 500 mg", "available", 30),
        ("Augmentin 625 mg", "available", 25),
        ("Azithromycin 500 mg", "available", 18),
        ("Cetirizine 10 mg", "available", 50),
        ("Pantoprazole 40 mg", "available", 35),
        ("Ibuprofen 400 mg", "available", 20),
        ("Omeprazole 20 mg", "available", 15),
    ]

    greencare_inv = [
        ("Amoxicillin 500 mg", "available", 22),
        ("Paracetamol 500 mg", "available", 60),
        ("ORS (Oral Rehydration Salts)", "unavailable", 0),
        ("Metformin 500 mg", "available", 40),
        ("Azithromycin 500 mg", "available", 14),
        ("Cetirizine 10 mg", "available", 28),
    ]

    medico_inv = [
        ("Amoxicillin 500 mg", "available", 15),
        ("Paracetamol 500 mg", "uncertain", 2),
        ("ORS (Oral Rehydration Salts)", "available", 5),
        ("Metformin 500 mg", "available", 10),
        ("Azithromycin 500 mg", "uncertain", 1),
    ]

    citymed_inv = [
        ("Amoxicillin 500 mg", "available", 40),
        ("Paracetamol 500 mg", "available", 80),
        ("ORS (Oral Rehydration Salts)", "unavailable", 0),
        ("Augmentin 625 mg", "available", 30),
        ("Cetirizine 10 mg", "available", 45),
    ]

    def add_inventory_items(pharm_id, items_list, base_mins_ago=12):
        for med_name, status, stock in items_list:
            if med_name in med_objs:
                inv = Inventory(
                    pharmacy_id=pharm_id,
                    medicine_id=med_objs[med_name].id,
                    availability_status=status,
                    internal_stock_quantity=stock,
                    last_updated=now - timedelta(minutes=base_mins_ago)
                )
                db.add(inv)

    add_inventory_items(pharm1.id, careplus_inv, base_mins_ago=12)
    add_inventory_items(pharm2.id, greencare_inv, base_mins_ago=27)
    add_inventory_items(pharm3.id, medico_inv, base_mins_ago=300) # 5 hours ago -> uncertain
    add_inventory_items(pharm4.id, citymed_inv, base_mins_ago=45)

    # 4. Historical Prescriptions for Patient Rahul
    # Past Prescription 1: 2026-07-12
    p1 = Prescription(
        doctor_id=doc1.id,
        patient_id=pat1.id,
        pharmacy_id=pharm1.id,
        status="completed",
        notes="Seasonal allergic rhinitis with mild headache.",
        created_at=datetime(2026, 7, 12, 10, 30, tzinfo=timezone.utc),
        updated_at=datetime(2026, 7, 12, 11, 0, tzinfo=timezone.utc)
    )
    db.add(p1)
    db.flush()

    db.add(PrescriptionItem(
        prescription_id=p1.id,
        medicine_id=med_objs["Cetirizine 10 mg"].id,
        dose="1 tablet",
        frequency="Once daily (at night)",
        duration="5 days",
        instructions="Take after food before bedtime."
    ))
    db.add(PrescriptionItem(
        prescription_id=p1.id,
        medicine_id=med_objs["Paracetamol 500 mg"].id,
        dose="1 tablet",
        frequency="SOS / As needed",
        duration="3 days",
        instructions="Take if feverish or headache occurs."
    ))

    # Past Prescription 2: 2026-07-28
    p2 = Prescription(
        doctor_id=doc1.id,
        patient_id=pat1.id,
        pharmacy_id=pharm1.id,
        status="completed",
        notes="Gastric reflux symptoms and hyperacidity.",
        created_at=datetime(2026, 7, 28, 14, 15, tzinfo=timezone.utc),
        updated_at=datetime(2026, 7, 28, 14, 45, tzinfo=timezone.utc)
    )
    db.add(p2)
    db.flush()

    db.add(PrescriptionItem(
        prescription_id=p2.id,
        medicine_id=med_objs["Pantoprazole 40 mg"].id,
        dose="1 tablet",
        frequency="Once daily",
        duration="14 days",
        instructions="Take 30 minutes before breakfast."
    ))

    # 5. Doctor Templates
    tpl1 = PrescriptionTemplate(
        doctor_id=doc1.id,
        name="Upper Respiratory Tract Protocol",
        specialization="General Medicine",
        items_json='[{"medicine_name": "Amoxicillin 500 mg", "dose": "1 capsule", "frequency": "Twice daily", "duration": "5 days", "instructions": "Take after meals with plenty of water"}, {"medicine_name": "Paracetamol 500 mg", "dose": "1 tablet", "frequency": "Thrice daily", "duration": "3 days", "instructions": "Take for fever or body aches"}]'
    )
    tpl2 = PrescriptionTemplate(
        doctor_id=doc1.id,
        name="Acid Reflux / Gastric Protocol",
        specialization="General Medicine",
        items_json='[{"medicine_name": "Pantoprazole 40 mg", "dose": "1 tablet", "frequency": "Once daily", "duration": "7 days", "instructions": "Take empty stomach before breakfast"}, {"medicine_name": "Domperidone 10 mg", "dose": "1 tablet", "frequency": "Twice daily", "duration": "5 days", "instructions": "Take 15 mins before meals"}]'
    )
    db.add_all([tpl1, tpl2])

    # 6. Demand Metrics & Simulated Anonymous Searches
    demand_data = [
        ("ORS (Oral Rehydration Salts)", 142, 67, 46.0, 84.5, "High"),
        ("Amoxicillin 500 mg", 95, 48, 60.0, 72.0, "Medium"),
        ("Paracetamol 500 mg", 210, 115, 88.0, 78.0, "High"),
        ("Azithromycin 500 mg", 62, 30, 75.0, 52.0, "Medium"),
        ("Cetirizine 10 mg", 54, 22, 92.0, 38.0, "Low"),
        ("Metformin 500 mg", 88, 56, 85.0, 64.0, "Medium"),
        ("Pantoprazole 40 mg", 110, 70, 82.0, 68.0, "Medium"),
    ]

    for med_name, searches, rx_count, avail_pct, score, level in demand_data:
        if med_name in med_objs:
            dm = DemandMetric(
                medicine_id=med_objs[med_name].id,
                area="Thrissur Metro Area",
                search_count=searches,
                prescription_count=rx_count,
                availability_percentage=avail_pct,
                demand_score=score,
                demand_level=level,
                calculated_at=now
            )
            db.add(dm)
            # Add anonymous search records
            for _ in range(3):
                db.add(MedicineSearch(
                    medicine_id=med_objs[med_name].id,
                    coarse_location="Thrissur Central",
                    created_at=now - timedelta(hours=2)
                ))

    db.commit()
    print("Database seeded successfully with realistic AyuLink clinical demo dataset.")
