import pytest
import io
import uuid
from pypdf import PdfWriter
from httpx import AsyncClient, ASGITransport
from app.main import app

def generate_minimal_pdf() -> bytes:
    writer = PdfWriter()
    writer.add_blank_page(width=72, height=72)
    stream = io.BytesIO()
    writer.write(stream)
    return stream.getvalue()

@pytest.mark.asyncio
async def test_full_critical_student_journey():
    unique_suffix = uuid.uuid4().hex[:8]
    email_a = f"journey_{unique_suffix}@careersaathi.ai"
    email_b = f"student_b_{unique_suffix}@careersaathi.ai"

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Register student A
        reg_resp = await client.post("/api/v1/auth/register", json={
            "email": email_a,
            "password": "SecurePassword123!",
            "full_name": "Rohan Patel"
        })
        assert reg_resp.status_code == 200
        token_a = reg_resp.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # 2. Complete onboarding profile
        prof_resp = await client.patch("/api/v1/me", json={
            "college_name": "IIT Bombay",
            "degree": "B.Tech",
            "branch": "CSE",
            "current_year": 3,
            "graduation_year": 2026,
            "weekly_hours": 14,
            "target_role": "Full-Stack Developer",
            "onboarding_completed": True
        }, headers=headers_a)
        assert prof_resp.status_code == 200
        assert prof_resp.json()["target_role"] == "Full-Stack Developer"

        # 3. Submit guidance assessment
        assess_resp = await client.post("/api/v1/assessments", json={
            "answers": {
                "q1_work_preference": "Building end-to-end applications that bridge both UI and cloud infrastructure",
                "q2_programming_comfort": "JavaScript / TypeScript / React / CSS",
                "q3_project_interest": "An interactive web application with dynamic dashboards and great UX",
                "q4_learning_style": "Building hands-on projects and debugging real code",
                "q5_weekly_commitment": "10-15 hours/week"
            }
        }, headers=headers_a)
        assert assess_resp.status_code == 200
        assess_data = assess_resp.json()
        assert len(assess_data["recommendations"]) >= 1

        # 4. Generate roadmap
        gen_resp = await client.post("/api/v1/roadmaps/generate", json={
            "target_role": "Full-Stack Developer",
            "weekly_hours": 14,
            "preferred_learning_style": "Hands-on projects"
        }, headers=headers_a)
        assert gen_resp.status_code == 200
        roadmap = gen_resp.json()
        assert len(roadmap["phases"]) >= 2
        assert roadmap["total_tasks"] > 0
        first_task = roadmap["phases"][0]["tasks"][0]

        # 5. Mark task complete & verify progress updates
        task_update = await client.patch(f"/api/v1/roadmaps/tasks/{first_task['id']}", json={
            "status": "completed",
            "notes": "Finished study notes on relational schemas."
        }, headers=headers_a)
        assert task_update.status_code == 200
        assert task_update.json()["status"] == "completed"

        # Refetch roadmap to verify progress
        active_road = await client.get("/api/v1/roadmaps", headers=headers_a)
        assert active_road.status_code == 200
        assert active_road.json()["completed_tasks"] >= 1
        assert active_road.json()["progress_percentage"] > 0

        # 6. Add skills & check gap analysis
        skill_add = await client.post("/api/v1/skills", json={
            "skill_name": "React",
            "category": "Frontend",
            "proficiency": "Intermediate",
            "evidence_type": "Project Built"
        }, headers=headers_a)
        assert skill_add.status_code == 200

        gap_resp = await client.get("/api/v1/skills/gap-analysis", headers=headers_a)
        assert gap_resp.status_code == 200
        gap_data = gap_resp.json()
        assert gap_data["target_role"] == "Full-Stack Developer"
        assert len(gap_data["skills"]) > 0

        # 7. Upload and analyze resume
        pdf_bytes = generate_minimal_pdf()
        resume_upload = await client.post("/api/v1/resumes", files={
            "file": ("rohan_resume.pdf", pdf_bytes, "application/pdf")
        }, data={"target_role": "Full-Stack Developer"}, headers=headers_a)
        assert resume_upload.status_code == 200
        res_data = resume_upload.json()
        resume_id = res_data["id"]
        assert res_data["latest_analysis"]["review_score"] > 0
        assert len(res_data["latest_analysis"]["strengths"]) > 0

        # 8. Chat conversation with assistant
        conv_resp = await client.post("/api/v1/chat/conversations", json={
            "title": "Interview Prep Discussion"
        }, headers=headers_a)
        assert conv_resp.status_code == 200
        conv_id = conv_resp.json()["id"]

        msg_resp = await client.post(f"/api/v1/chat/conversations/{conv_id}/messages", json={
            "content": "What are key differences between REST and WebSockets for my Full-Stack project?"
        }, headers=headers_a)
        assert msg_resp.status_code == 200
        assert len(msg_resp.json()["content"]) > 10

        # 9. Mock interview session
        int_resp = await client.post("/api/v1/interviews", json={
            "target_role": "Full-Stack Developer",
            "interview_type": "technical",
            "difficulty": "Medium",
            "question_count": 2
        }, headers=headers_a)
        assert int_resp.status_code == 200
        session_id = int_resp.json()["id"]
        first_q = int_resp.json()["questions"][0]

        # Submit answer
        ans_resp = await client.post(f"/api/v1/interviews/{session_id}/questions/{first_q['id']}/answer", json={
            "answer_text": "B-Tree indexes are balanced search trees optimized for range queries and sorting with O(log n) lookup. Hash indexes offer O(1) lookups for point queries but cannot accelerate range scans."
        }, headers=headers_a)
        assert ans_resp.status_code == 200
        assert "feedback" in ans_resp.json()

        # Complete interview
        comp_resp = await client.post(f"/api/v1/interviews/{session_id}/complete", headers=headers_a)
        assert comp_resp.status_code == 200
        assert comp_resp.json()["status"] == "completed"

        # 10. Practice questions
        practice_q = await client.get("/api/v1/practice/questions?question_type=aptitude", headers=headers_a)
        assert practice_q.status_code == 200
        p_list = practice_q.json()
        assert len(p_list) > 0
        q_item = p_list[0]

        attempt_resp = await client.post(f"/api/v1/practice/questions/{q_item['id']}/attempt", json={
            "answer": q_item["options"][0] if q_item.get("options") else "test"
        }, headers=headers_a)
        assert attempt_resp.status_code == 200
        assert "is_correct" in attempt_resp.json()

        # 11. Jobs & Applications
        jobs_resp = await client.get("/api/v1/jobs", headers=headers_a)
        assert jobs_resp.status_code == 200
        jobs_list = jobs_resp.json()
        assert len(jobs_list) > 0
        job_item = jobs_list[0]
        assert "profile_alignment" in job_item

        # Toggle save
        save_resp = await client.post(f"/api/v1/jobs/{job_item['id']}/save", headers=headers_a)
        assert save_resp.status_code == 200
        assert save_resp.json()["saved"] is True

        # Track application
        app_create = await client.post("/api/v1/applications", json={
            "job_id": job_item["id"],
            "status": "applied",
            "notes": "Applied via referral"
        }, headers=headers_a)
        assert app_create.status_code == 200
        app_id = app_create.json()["id"]

        # Update application status
        app_patch = await client.patch(f"/api/v1/applications/{app_id}", json={
            "status": "assessment",
            "notes": "OA scheduled for Monday"
        }, headers=headers_a)
        assert app_patch.status_code == 200
        assert app_patch.json()["status"] == "assessment"

        # 12. Dashboard overview reflects real metrics
        dash = await client.get("/api/v1/dashboard/overview", headers=headers_a)
        assert dash.status_code == 200
        assert dash.json()["readiness"]["overall_readiness_score"] > 0
        assert dash.json()["applications_count"] >= 1
        assert dash.json()["saved_jobs_count"] >= 1

        # 13. Privacy & Isolation check with Student B
        reg_b = await client.post("/api/v1/auth/register", json={
            "email": email_b,
            "password": "SecurePassword123!",
            "full_name": "Student B"
        })
        token_b = reg_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # Student B cannot access Student A's resume
        b_resume_access = await client.get(f"/api/v1/resumes/{resume_id}", headers=headers_b)
        assert b_resume_access.status_code == 404

        # Student B cannot access Student A's chat conversation
        b_chat_access = await client.get(f"/api/v1/chat/conversations/{conv_id}", headers=headers_b)
        assert b_chat_access.status_code == 404

        # Student B cannot update Student A's application
        b_app_access = await client.patch(f"/api/v1/applications/{app_id}", json={"status": "rejected"}, headers=headers_b)
        assert b_app_access.status_code == 404
