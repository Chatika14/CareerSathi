import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, ForeignKey, Text, DateTime, JSON, Index
)
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="student")  # 'student' or 'admin'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    student_skills = relationship("StudentSkill", back_populates="user", cascade="all, delete-orphan")
    assessments = relationship("CareerAssessment", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("ChatConversation", back_populates="user", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    practice_attempts = relationship("PracticeAttempt", back_populates="user", cascade="all, delete-orphan")
    saved_jobs = relationship("SavedJob", back_populates="user", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    full_name = Column(String(255), nullable=False)
    college_name = Column(String(255), nullable=True)
    degree = Column(String(100), nullable=True)
    branch = Column(String(100), nullable=True)
    current_year = Column(Integer, nullable=True)
    current_semester = Column(Integer, nullable=True)
    graduation_year = Column(Integer, nullable=True)
    weekly_hours = Column(Integer, default=10)
    target_role = Column(String(100), nullable=True)
    career_interests = Column(JSON, default=list)  # list of strings
    preferred_learning_style = Column(String(50), nullable=True)
    onboarding_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # Frontend, Backend, AI/ML, Cloud, Core, etc.
    description = Column(Text, nullable=True)
    
    student_skills = relationship("StudentSkill", back_populates="skill", cascade="all, delete-orphan")
    career_competencies = relationship("CareerCompetency", back_populates="skill", cascade="all, delete-orphan")

class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    proficiency = Column(String(50), nullable=False, default="Beginner")  # Beginner, Intermediate, Advanced
    evidence_type = Column(String(100), default="Self-reported")  # Self-reported, Assessment, Project, Course
    last_assessed_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="student_skills")
    skill = relationship("Skill", back_populates="student_skills")

class CareerPath(Base):
    __tablename__ = "career_paths"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    overview = Column(Text, nullable=False)
    responsibilities = Column(JSON, default=list)  # list of strings
    learning_sequence = Column(JSON, default=list)  # list of structured phases
    portfolio_projects = Column(JSON, default=list)  # list of project ideas
    interview_topics = Column(JSON, default=list)  # list of topic strings
    active = Column(Boolean, default=True)

    competencies = relationship("CareerCompetency", back_populates="career_path", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="career_path")

class CareerCompetency(Base):
    __tablename__ = "career_competencies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    career_path_id = Column(String(36), ForeignKey("career_paths.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    target_level = Column(String(50), nullable=False)  # Beginner, Intermediate, Advanced
    priority = Column(String(50), default="High")  # High, Medium, Nice-to-have

    career_path = relationship("CareerPath", back_populates="competencies")
    skill = relationship("Skill", back_populates="career_competencies")

class CareerAssessment(Base):
    __tablename__ = "career_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    answers_json = Column(JSON, nullable=False)
    result_json = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="assessments")

class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    career_path_id = Column(String(36), ForeignKey("career_paths.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="active")  # active, completed, archived
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")
    career_path = relationship("CareerPath", back_populates="roadmaps")
    phases = relationship("RoadmapPhase", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapPhase.sort_order")

class RoadmapPhase(Base):
    __tablename__ = "roadmap_phases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    roadmap_id = Column(String(36), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)

    roadmap = relationship("Roadmap", back_populates="phases")
    tasks = relationship("RoadmapTask", back_populates="phase", cascade="all, delete-orphan", order_by="RoadmapTask.sort_order")

class RoadmapTask(Base):
    __tablename__ = "roadmap_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    phase_id = Column(String(36), ForeignKey("roadmap_phases.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    estimated_hours = Column(Float, default=4.0)
    status = Column(String(50), default="todo")  # todo, in_progress, completed
    resource_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    sort_order = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)

    phase = relationship("RoadmapPhase", back_populates="tasks")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    storage_path = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), default="application/pdf")
    file_size = Column(Integer, nullable=False)
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="resumes")
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(150), nullable=True)
    parsed_data_json = Column(JSON, nullable=False)
    feedback_json = Column(JSON, nullable=False)
    review_score = Column(Float, nullable=False)  # CareerSaathi Review Score out of 100
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses")

class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), default="Career Discussion")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("ChatConversation", back_populates="messages")

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(150), nullable=False)
    interview_type = Column(String(50), default="technical")  # technical, hr, behavioral
    difficulty = Column(String(50), default="Medium")  # Easy, Medium, Hard
    status = Column(String(50), default="in_progress")  # in_progress, completed
    summary_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="interview_sessions")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan", order_by="InterviewQuestion.sort_order")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    session_id = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    sort_order = Column(Integer, default=0)

    session = relationship("InterviewSession", back_populates="questions")
    answers = relationship("InterviewAnswer", back_populates="question", cascade="all, delete-orphan")

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_id = Column(String(36), ForeignKey("interview_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    answer_text = Column(Text, nullable=False)
    feedback_json = Column(JSON, nullable=False)  # rubric: correctness, relevance, completeness, clarity, communication, sample_answer
    created_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("InterviewQuestion", back_populates="answers")

class PracticeQuestion(Base):
    __tablename__ = "practice_questions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    question_type = Column(String(50), nullable=False)  # aptitude, coding
    title = Column(String(255), nullable=False)
    prompt = Column(Text, nullable=False)
    options_json = Column(JSON, nullable=True)  # list of strings for aptitude
    correct_answer = Column(Text, nullable=True)  # string option for aptitude or reference solution
    explanation = Column(Text, nullable=True)
    difficulty = Column(String(50), default="Medium")  # Easy, Medium, Hard
    topic = Column(String(100), nullable=False, index=True)  # Quantitative, Logical, DSA, Dynamic Programming, etc.
    constraints = Column(Text, nullable=True)
    input_output_examples = Column(JSON, nullable=True)
    active = Column(Boolean, default=True)

    attempts = relationship("PracticeAttempt", back_populates="question", cascade="all, delete-orphan")

class PracticeAttempt(Base):
    __tablename__ = "practice_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("practice_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    answer_json = Column(JSON, nullable=False)
    is_correct = Column(Boolean, default=False)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="practice_attempts")
    question = relationship("PracticeQuestion", back_populates="attempts")

class JobListing(Base):
    __tablename__ = "job_listings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False, index=True)
    company = Column(String(200), nullable=False, index=True)
    location = Column(String(150), nullable=False)
    work_mode = Column(String(50), default="Hybrid")  # Remote, Hybrid, Onsite
    employment_type = Column(String(50), default="Full-time")  # Internship, Full-time
    description = Column(Text, nullable=False)
    required_skills_json = Column(JSON, default=list)  # list of required skill names
    eligibility_text = Column(Text, nullable=True)
    application_url = Column(String(500), nullable=False)
    source_name = Column(String(100), nullable=False)  # Verified Company Portal, University Board, etc.
    last_verified_at = Column(DateTime, default=datetime.utcnow)
    deadline = Column(DateTime, nullable=True)
    status = Column(String(50), default="active")  # active, archived, closed
    is_demo = Column(Boolean, default=False)  # Clearly flags demo records
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    saved_by = relationship("SavedJob", back_populates="job", cascade="all, delete-orphan")
    applications = relationship("JobApplication", back_populates="job", cascade="all, delete-orphan")

class SavedJob(Base):
    __tablename__ = "saved_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("job_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_jobs")
    job = relationship("JobListing", back_populates="saved_by")

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_id = Column(String(36), ForeignKey("job_listings.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="applied")  # saved, applied, assessment, interview, offer, rejected, withdrawn
    applied_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="applications")
    job = relationship("JobListing", back_populates="applications")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    body = Column(Text, nullable=False)
    type = Column(String(50), default="general")  # roadmap, assessment, resume, interview, application, general
    link = Column(String(255), nullable=True)
    read_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")

class AIUsageLog(Base):
    __tablename__ = "ai_usage_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True, index=True)
    provider = Column(String(50), nullable=False)
    model = Column(String(100), nullable=False)
    feature = Column(String(100), nullable=False)  # resume_analysis, chat, roadmap_generation, interview_eval
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    latency_ms = Column(Integer, default=0)
    status = Column(String(50), default="success")  # success, error, rate_limited
    created_at = Column(DateTime, default=datetime.utcnow)
