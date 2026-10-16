"""
Pytest fixtures and configuration for NammaConnect API tests.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(scope="session")
def admin_auth():
    import base64
    from app.config import settings
    token = base64.b64encode(f"{settings.admin_username}:{settings.admin_password}".encode()).decode()
    return {"Authorization": f"Basic {token}"}
