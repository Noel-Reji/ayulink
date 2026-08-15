from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import hashlib
from app.db.database import get_db
from app.models.models import User, Doctor, Pharmacy, Patient
from app.schemas.schemas import LoginRequest, LoginResponse, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

def verify_password(plain: str, hashed: str) -> bool:
    return hashlib.sha256(plain.encode()).hexdigest() == hashed

@router.post("/login", response_model=LoginResponse)
def login(creds: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or demo password (try demo123)"
        )

    # Resolve role profile details
    role_profile = {"role": user.role}
    if user.role == "doctor":
        doc = db.query(Doctor).filter(Doctor.user_id == user.id).first()
        if doc:
            role_profile.update({
                "doctor_id": doc.id,
                "specialization": doc.specialization,
                "license_number": doc.license_number
            })
    elif user.role == "pharmacy":
        pharm = db.query(Pharmacy).filter(Pharmacy.user_id == user.id).first()
        if pharm:
            role_profile.update({
                "pharmacy_id": pharm.id,
                "name": pharm.name,
                "address": pharm.address
            })
    elif user.role == "patient":
        pat = db.query(Patient).filter(Patient.user_id == user.id).first()
        if pat:
            role_profile.update({
                "patient_id": pat.id,
                "name": pat.name,
                "date_of_birth": pat.date_of_birth
            })

    # Simple bearer token representing user_id:role for prototype
    mock_token = f"ayulink-token-{user.id}-{user.role}"

    return LoginResponse(
        user=UserOut.model_validate(user),
        token=mock_token,
        role_profile=role_profile
    )

@router.get("/demo-accounts")
def get_demo_accounts():
    """Provides standard quick-login demo credentials for the demo script."""
    return [
        {"role": "doctor", "name": "Dr. Arun Menon", "email": "doctor@ayulink.demo", "password": "demo123", "desc": "General Physician - Creates Prescriptions & Resolves Out-of-Stock Exceptions"},
        {"role": "pharmacy", "name": "CarePlus Pharmacy", "email": "pharmacy@ayulink.demo", "password": "demo123", "desc": "Local Pharmacy - Receives Prescriptions & Checks Inventory"},
        {"role": "patient", "name": "Rahul Krishnan", "email": "patient@ayulink.demo", "password": "demo123", "desc": "Patient - Searches Medicine Availability & Tracks Prescriptions"}
    ]
