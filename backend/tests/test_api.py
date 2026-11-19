import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_health():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "environment" in data

@pytest.mark.asyncio
async def test_auth_and_profile():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Login with demo student
        login_resp = await client.post("/api/v1/auth/login", json={
            "email": "student@careersaathi.ai",
            "password": "StudentPass123!"
        })
        assert login_resp.status_code == 200
        data = login_resp.json()
        token = data["access_token"]
        assert token is not None

        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get me
        me_resp = await client.get("/api/v1/me", headers=headers)
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["email"] == "student@careersaathi.ai"
        assert me_data["profile"]["full_name"] == "Aarav Sharma"

        # 3. List careers
        careers_resp = await client.get("/api/v1/careers", headers=headers)
        assert careers_resp.status_code == 200
        careers = careers_resp.json()
        assert len(careers) >= 3

        # 4. Get readiness overview
        dash_resp = await client.get("/api/v1/dashboard/overview", headers=headers)
        assert dash_resp.status_code == 200
        dash_data = dash_resp.json()
        assert "readiness" in dash_data
        assert "overall_readiness_score" in dash_data["readiness"]

@pytest.mark.asyncio
async def test_admin_authorization():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Student cannot access admin endpoints
        student_login = await client.post("/api/v1/auth/login", json={
            "email": "student@careersaathi.ai",
            "password": "StudentPass123!"
        })
        student_token = student_login.json()["access_token"]
        student_headers = {"Authorization": f"Bearer {student_token}"}

        admin_check = await client.get("/api/v1/admin/overview", headers=student_headers)
        assert admin_check.status_code == 403

        # Admin can access admin endpoints
        admin_login = await client.post("/api/v1/auth/login", json={
            "email": "admin@careersaathi.ai",
            "password": "AdminPass123!"
        })
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        admin_overview = await client.get("/api/v1/admin/overview", headers=admin_headers)
        assert admin_overview.status_code == 200
        overview_data = admin_overview.json()
        assert overview_data["stats"]["total_users"] >= 2
