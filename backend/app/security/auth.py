"""Admin authentication using HTTP Basic Auth with bcrypt password hashing."""
import secrets
import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from app.config import settings

security = HTTPBasic()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


# Hash the admin password at module load time
_admin_password_hash = hash_password(settings.admin_password)


def require_admin(credentials: HTTPBasicCredentials = Depends(security)):
    """FastAPI dependency: require valid admin credentials via HTTP Basic Auth."""
    correct_username = secrets.compare_digest(
        credentials.username.encode("utf8"),
        settings.admin_username.encode("utf8"),
    )
    correct_password = verify_password(credentials.password, _admin_password_hash)

    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username
