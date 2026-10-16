from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_url: str = "sqlite:///./nammaconnect.db"
    frontend_origin: str = "http://localhost:3000"
    secret_key: str = "change-this-in-production-use-a-long-random-string"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    admin_username: str = "admin"
    admin_password: str = "change-this-admin-password"
    debug: bool = False
    app_version: str = "1.0.0"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
