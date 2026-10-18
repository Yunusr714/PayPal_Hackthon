from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Cashiko Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Sandbox Mode
    ENVIRONMENT: str = "development"
    DEMO_MODE: bool = True  # Fallback to realistic simulated sandbox fixtures if real PayPal credentials are missing
    
    # PayPal Invoicing API v2 Settings
    PAYPAL_MODE: str = "sandbox"  # sandbox or live
    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_CLIENT_SECRET: Optional[str] = None
    PAYPAL_WEBHOOK_ID: Optional[str] = None
    
    @property
    def PAYPAL_BASE_URL(self) -> str:
        if self.PAYPAL_MODE == "live":
            return "https://api-m.paypal.com"
        return "https://api-m.sandbox.paypal.com"
        
    @property
    def is_paypal_configured(self) -> bool:
        return bool(self.PAYPAL_CLIENT_ID and self.PAYPAL_CLIENT_SECRET)

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./flowcollect.db"
    
    # AI Provider Settings (Groq / Gemini / OpenAI)
    LLM_PROVIDER: str = "groq"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "openai/gpt-oss-20b"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    @property
    def is_llm_configured(self) -> bool:
        if self.LLM_PROVIDER == "groq":
            return bool(self.GROQ_API_KEY)
        elif self.LLM_PROVIDER == "gemini":
            return bool(self.GEMINI_API_KEY)
        elif self.LLM_PROVIDER == "openai":
            return bool(self.OPENAI_API_KEY)
        return False
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
