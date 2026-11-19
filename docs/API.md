# CareerSaathi AI — API Documentation

Base path: `/api/v1`

## Authentication & Profile
- `POST /api/v1/auth/register`: Create student account (`email`, `password`, `full_name`).
- `POST /api/v1/auth/login`: Authenticate and receive JWT access token.
- `GET /api/v1/me`: Retrieve current user credentials and student profile.
- `PATCH /api/v1/me`: Update academic details, target career, and weekly availability.

## Careers & Assessment
- `GET /api/v1/careers`: List curated active career paths.
- `GET /api/v1/careers/{career_id_or_slug}`: Detailed career competencies and learning sequence.
- `GET /api/v1/assessments/questions`: Guidance assessment questions.
- `POST /api/v1/assessments`: Submit answers to receive structured career recommendations.
- `GET /api/v1/assessments/history`: Past assessment records.

## Roadmap & Skills
- `GET /api/v1/roadmaps`: Current active roadmap with calculated progress.
- `POST /api/v1/roadmaps/generate`: Generate customized roadmap for target role.
- `PATCH /api/v1/roadmaps/tasks/{task_id}`: Update task status (`todo`, `in_progress`, `completed`) and notes.
- `GET /api/v1/skills`: Master skill catalog.
- `GET /api/v1/skills/my`: Student's logged skills.
- `POST /api/v1/skills`: Add or update proficiency in a skill.
- `DELETE /api/v1/skills/{student_skill_id}`: Remove skill.
- `GET /api/v1/skills/gap-analysis`: Real-time gap analysis comparing student skills against target role competencies.

## Resumes & AI Assistant
- `POST /api/v1/resumes`: Upload PDF resume, extract text, and receive review scores.
- `GET /api/v1/resumes`: List user's resumes and analysis history.
- `DELETE /api/v1/resumes/{resume_id}`: Soft delete resume and purge private file.
- `GET /api/v1/chat/conversations`: List assistant conversations.
- `POST /api/v1/chat/conversations`: Create new conversation.
- `POST /api/v1/chat/conversations/{conversation_id}/messages`: Send message with student context.

## Mock Interviews & Practice
- `POST /api/v1/interviews`: Start mock interview session.
- `POST /api/v1/interviews/{session_id}/questions/{question_id}/answer`: Submit answer and receive structured rubric feedback.
- `POST /api/v1/interviews/{session_id}/complete`: Finish session and compute summary metrics.
- `GET /api/v1/practice/questions`: List aptitude or coding questions.
- `POST /api/v1/practice/questions/{question_id}/attempt`: Verify answer and record attempt.
- `GET /api/v1/practice/history`: Attempt history and accuracy percentage.

## Jobs & Application Tracker
- `GET /api/v1/jobs`: Verified job openings with profile alignment scores.
- `POST /api/v1/jobs/{job_id}/save`: Bookmark / toggle save job.
- `GET /api/v1/applications`: Application pipeline records.
- `POST /api/v1/applications`: Record new application.
- `PATCH /api/v1/applications/{application_id}`: Update stage and notes.

## Administration
- `GET /api/v1/admin/overview`: System stats, active user count, and AI execution logs.
- `GET /api/v1/admin/users`: User directory with search.
- `POST /api/v1/admin/jobs`: Add verified job listing.
- `PATCH /api/v1/admin/jobs/{job_id}`: Archive or edit listing.
- `POST /api/v1/admin/questions`: Add practice question to bank.
