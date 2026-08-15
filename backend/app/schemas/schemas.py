from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime

# --- Auth ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LoginResponse(BaseModel):
    user: UserOut
    token: str
    role_profile: dict

# --- Medicine ---
class MedicineOut(BaseModel):
    id: str
    name: str
    generic_name: str
    strength: str
    dosage_form: str
    rxcui: Optional[str] = None
    prescription_required: bool
    model_config = ConfigDict(from_attributes=True)

# --- Inventory ---
# IMPORTANT: Public view for patients NEVER includes internal_stock_quantity!
class PublicPharmacyAvailabilityOut(BaseModel):
    pharmacy_id: str
    pharmacy_name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    availability_status: str  # available, unavailable, uncertain
    last_updated: datetime

class InternalInventoryItemOut(BaseModel):
    id: str
    pharmacy_id: str
    medicine_id: str
    medicine: MedicineOut
    availability_status: str
    internal_stock_quantity: int
    last_updated: datetime
    model_config = ConfigDict(from_attributes=True)

class InventoryUpdateStatusRequest(BaseModel):
    availability_status: str  # available, unavailable, uncertain
    internal_stock_quantity: Optional[int] = None

class PosSyncResponse(BaseModel):
    last_synchronization: str
    medicines_processed: int
    updated: int
    unavailable: int
    status: str
    message: str

# --- Prescriptions ---
class PrescriptionItemCreate(BaseModel):
    medicine_id: str
    dose: str
    frequency: str
    duration: str
    instructions: Optional[str] = None

class PrescriptionItemOut(BaseModel):
    id: str
    prescription_id: str
    medicine_id: str
    medicine: MedicineOut
    dose: str
    frequency: str
    duration: str
    instructions: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class CreatePrescriptionRequest(BaseModel):
    patient_id: str
    pharmacy_id: Optional[str] = None
    notes: Optional[str] = None
    items: List[PrescriptionItemCreate]

class PrescriptionOut(BaseModel):
    id: str
    doctor_id: str
    doctor_name: Optional[str] = None
    doctor_specialization: Optional[str] = None
    patient_id: str
    patient_name: Optional[str] = None
    pharmacy_id: Optional[str] = None
    pharmacy_name: Optional[str] = None
    status: str
    notes: Optional[str] = None
    resolution_notes: Optional[str] = None
    items: List[PrescriptionItemOut]
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PrescriptionUnavailableRequest(BaseModel):
    notes: Optional[str] = "Medicine currently unavailable at this pharmacy location."

class PrescriptionResolveRequest(BaseModel):
    resolution_action: str  # e.g., 'substitute_medicine', 'change_instructions', 'reroute_pharmacy', 'cancel'
    updated_medicine_id: Optional[str] = None
    updated_dose: Optional[str] = None
    updated_frequency: Optional[str] = None
    updated_duration: Optional[str] = None
    resolution_notes: str
    new_pharmacy_id: Optional[str] = None

# --- Notifications ---
class NotificationOut(BaseModel):
    id: str
    recipient_user_id: str
    prescription_id: Optional[str] = None
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Demand ---
class DemandMetricOut(BaseModel):
    id: str
    medicine_id: str
    medicine_name: str
    generic_name: str
    strength: str
    area: str
    search_count: int
    prescription_count: int
    availability_percentage: float
    demand_score: float
    demand_level: str
    supply_gap_detected: bool
    calculated_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- AI & Safety ---
class SafetyCheckItem(BaseModel):
    medicine_id: str
    dose: str
    frequency: str

class SafetyCheckRequest(BaseModel):
    patient_id: str
    items: List[SafetyCheckItem]

class SafetyAlert(BaseModel):
    level: str  # 'warning', 'info', 'caution'
    title: str
    description: str
    recommendation: str
    source: str
    physician_confirmation_required: bool = True

class SafetyCheckResponse(BaseModel):
    has_alerts: bool
    alerts: List[SafetyAlert]
    disclaimer: str = "Assistive information only. Physician confirmation required."

class HistorySummaryRequest(BaseModel):
    patient_id: str

class HistorySummaryResponse(BaseModel):
    patient_name: str
    prescription_count: int
    timeline_summary: str
    key_medications: List[str]
    disclaimer: str = "AI-generated summary based on recorded AyuLink data. Assistive information only. Physician confirmation required."

class DemandExplanationRequest(BaseModel):
    medicine_id: str

class DemandExplanationResponse(BaseModel):
    medicine_name: str
    score: float
    level: str
    factors: List[dict]
    explanation: str
    disclaimer: str = "Demand Intelligence / prototype signal. Non-prescriptive analytics for pharmacy capacity planning."
