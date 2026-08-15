from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.db.database import engine, Base, SessionLocal
from app.db.seed_data import seed_database
from app.models.models import User

# Import routers
from app.api.auth import router as auth_router
from app.api.doctors import router as doctors_router
from app.api.patients import router as patients_router
from app.api.pharmacies import router as pharmacies_router
from app.api.medicines import router as medicines_router
from app.api.prescriptions import router as prescriptions_router
from app.api.inventory import router as inventory_router
from app.api.notifications import router as notifications_router
from app.api.demand import router as demand_router
from app.api.ai import router as ai_router
from app.api.demo import router as demo_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize tables
    Base.metadata.create_all(bind=engine)
    # Check if seeded
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            print("Empty database detected. Seeding baseline AyuLink demo dataset...")
            seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Digital structured prescription network connecting doctors, pharmacies, and patients.",
    lifespan=lifespan
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(doctors_router, prefix=settings.API_PREFIX)
app.include_router(patients_router, prefix=settings.API_PREFIX)
app.include_router(pharmacies_router, prefix=settings.API_PREFIX)
app.include_router(medicines_router, prefix=settings.API_PREFIX)
app.include_router(prescriptions_router, prefix=settings.API_PREFIX)
app.include_router(inventory_router, prefix=settings.API_PREFIX)
app.include_router(notifications_router, prefix=settings.API_PREFIX)
app.include_router(demand_router, prefix=settings.API_PREFIX)
app.include_router(ai_router, prefix=settings.API_PREFIX)
app.include_router(demo_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "app": "AyuLink Healthcare Prescription Network",
        "status": "online",
        "version": settings.VERSION,
        "disclaimer": "Prototype Notice: AyuLink is a demonstration prototype and is not intended for diagnosis, prescribing, dispensing, or medical decision-making. AI assists. Clinicians decide."
    }
