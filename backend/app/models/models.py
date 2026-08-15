from datetime import datetime, timezone
import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'doctor', 'pharmacy', 'patient'
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False, cascade="all, delete-orphan")
    patient_profile = relationship("Patient", back_populates="user", uselist=False, cascade="all, delete-orphan")
    pharmacy_profile = relationship("Pharmacy", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="recipient", cascade="all, delete-orphan")

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    specialization = Column(String(255), nullable=False)
    license_number = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="doctor_profile")
    prescriptions = relationship("Prescription", back_populates="doctor")
    templates = relationship("PrescriptionTemplate", back_populates="doctor")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    date_of_birth = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="patient_profile")
    prescriptions = relationship("Prescription", back_populates="patient")

class Pharmacy(Base):
    __tablename__ = "pharmacies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="pharmacy_profile")
    inventory = relationship("Inventory", back_populates="pharmacy", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="pharmacy")

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    generic_name = Column(String(255), nullable=False, index=True)
    strength = Column(String(100), nullable=False)
    dosage_form = Column(String(100), nullable=False)  # Tablet, Capsule, Syrup, Sachet, etc.
    rxcui = Column(String(50), nullable=True)
    prescription_required = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    inventory_items = relationship("Inventory", back_populates="medicine", cascade="all, delete-orphan")
    prescription_items = relationship("PrescriptionItem", back_populates="medicine")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    pharmacy_id = Column(String(36), ForeignKey("pharmacies.id"), nullable=False, index=True)
    medicine_id = Column(String(36), ForeignKey("medicines.id"), nullable=False, index=True)
    availability_status = Column(String(50), default="available")  # 'available', 'unavailable', 'uncertain'
    internal_stock_quantity = Column(Integer, default=0)  # PROTECTED: never returned to patient APIs
    last_updated = Column(DateTime, default=utcnow, onupdate=utcnow)

    pharmacy = relationship("Pharmacy", back_populates="inventory")
    medicine = relationship("Medicine", back_populates="inventory_items")

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("patients.id"), nullable=False, index=True)
    pharmacy_id = Column(String(36), ForeignKey("pharmacies.id"), nullable=True, index=True)
    status = Column(String(50), default="draft")  # draft, sent, received, unavailable, doctor_review, resolved, completed, cancelled
    notes = Column(Text, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    doctor = relationship("Doctor", back_populates="prescriptions")
    patient = relationship("Patient", back_populates="prescriptions")
    pharmacy = relationship("Pharmacy", back_populates="prescriptions")
    items = relationship("PrescriptionItem", back_populates="prescription", cascade="all, delete-orphan")

class PrescriptionItem(Base):
    __tablename__ = "prescription_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prescription_id = Column(String(36), ForeignKey("prescriptions.id"), nullable=False)
    medicine_id = Column(String(36), ForeignKey("medicines.id"), nullable=False)
    dose = Column(String(100), nullable=False)
    frequency = Column(String(100), nullable=False)  # e.g., 'Twice daily', 'Once daily'
    duration = Column(String(100), nullable=False)   # e.g., '5 days'
    instructions = Column(Text, nullable=True)

    prescription = relationship("Prescription", back_populates="items")
    medicine = relationship("Medicine", back_populates="prescription_items")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recipient_user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    prescription_id = Column(String(36), ForeignKey("prescriptions.id"), nullable=True)
    type = Column(String(50), nullable=False)  # prescription_received, medicine_unavailable, doctor_response, safety_alert, system
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    recipient = relationship("User", back_populates="notifications")

class MedicineSearch(Base):
    __tablename__ = "medicine_searches"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    medicine_id = Column(String(36), ForeignKey("medicines.id"), nullable=False)
    coarse_location = Column(String(100), default="Thrissur Central")
    created_at = Column(DateTime, default=utcnow)

class DemandMetric(Base):
    __tablename__ = "demand_metrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    medicine_id = Column(String(36), ForeignKey("medicines.id"), nullable=False)
    area = Column(String(100), default="Thrissur Metro Area")
    search_count = Column(Integer, default=0)
    prescription_count = Column(Integer, default=0)
    availability_percentage = Column(Float, default=100.0)
    demand_score = Column(Float, default=50.0)
    demand_level = Column(String(50), default="Medium")  # Low, Medium, High
    calculated_at = Column(DateTime, default=utcnow)

    medicine = relationship("Medicine")

class PrescriptionTemplate(Base):
    __tablename__ = "prescription_templates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    doctor_id = Column(String(36), ForeignKey("doctors.id"), nullable=False)
    name = Column(String(255), nullable=False)
    specialization = Column(String(255), nullable=False)
    items_json = Column(Text, nullable=False)  # JSON representation of items
    created_at = Column(DateTime, default=utcnow)

    doctor = relationship("Doctor", back_populates="templates")
