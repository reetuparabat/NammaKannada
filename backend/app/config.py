from pydantic_settings import BaseSettings
from pydantic import model_validator
from typing import Optional


class Settings(BaseSettings):
    database_url: str = "sqlite:///./nammakannada.db"
    frontend_origin: str = "http://localhost:3000"
    secret_key: str = "change-this-in-production-use-a-long-random-string"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours
    admin_username: str = "admin"
    admin_password: str = "change-this-admin-password"
    debug: bool = False
    environment: str = "development"
    app_version: str = "1.0.0"

    class Config:
        env_file = ".env"
        extra = "ignore"

    @model_validator(mode="after")
    def validate_production_credentials(self):
        if self.environment.lower() == "production":
            insecure_passwords = {"change-this-admin-password", "admin123", "password", "admin", ""}
            if self.admin_password in insecure_passwords or len(self.admin_password) < 8:
                raise RuntimeError(
                    "Production configuration error: ADMIN_PASSWORD must be configured with a strong, non-default secret in production."
                )
            insecure_secrets = {"change-this-in-production-use-a-long-random-string", "dev-secret-key-change-in-production", ""}
            if self.secret_key in insecure_secrets or len(self.secret_key) < 16:
                raise RuntimeError(
                    "Production configuration error: SECRET_KEY must be configured with a strong, non-default secret in production."
                )
        return self


settings = Settings()
