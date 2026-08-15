import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AyuLink Healthcare Prescription Network"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ayulink.db")
    RXNORM_API_ENABLED: bool = True
    OPENFDA_API_ENABLED: bool = True
    DEMO_MODE: bool = True

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")

settings = Settings()
