from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./kts.db"
    jwt_secret: str = "change-this-in-production"
    access_token_expire_minutes: int = 480
    cors_origins: str = "http://localhost:5173"
    upload_dir: str = "./uploads"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
