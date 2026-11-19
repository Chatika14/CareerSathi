from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Any, Dict
from datetime import datetime

# Health
class HealthResponse(BaseModel):
    status: str
    environment: str
    timestamp: datetime
    version: str

# Auth & User
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: Optional[str] = "student"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    profile: Optional[Dict[str, Any]] = None

# Profile
class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    college_name: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    current_year: Optional[int] = None
    current_semester: Optional[int] = None
    graduation_year: Optional[int] = None
    weekly_hours: Optional[int] = None
    target_role: Optional[str] = None
    career_interests: Optional[List[str]] = None
    preferred_learning_style: Optional[str] = None
    onboarding_completed: Optional[bool] = None

class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    full_name: str
    college_name: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    current_year: Optional[int] = None
    current_semester: Optional[int] = None
    graduation_year: Optional[int] = None
    weekly_hours: int = 10
    target_role: Optional[str] = None
    career_interests: List[str] = []
    preferred_learning_style: Optional[str] = None
    onboarding_completed: bool = False
    created_at: datetime
    updated_at: datetime

# Skills
class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    category: str
    description: Optional[str] = None

class StudentSkillCreate(BaseModel):
    skill_name: str
    category: Optional[str] = "General"
    proficiency: str = "Beginner"  # Beginner, Intermediate, Advanced
    evidence_type: Optional[str] = "Self-reported"

class StudentSkillUpdate(BaseModel):
    proficiency: str
    evidence_type: Optional[str] = None

class StudentSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    skill_id: str
    skill: SkillResponse
    proficiency: str
    evidence_type: str
    last_assessed_at: datetime
    updated_at: datetime

class SkillGapItem(BaseModel):
    skill_name: str
    category: str
    target_level: str
    current_level: Optional[str] = None
    status: str  # "acquired", "to_strengthen", "missing"
    priority: str
    related_roadmap_task: Optional[str] = None

class SkillGapAnalysisResponse(BaseModel):
    target_role: str
    total_competencies: int
    matching_skills_count: int
    readiness_percentage: float
    skills: List[SkillGapItem]

# Career Paths
class CareerCompetencyResponse(BaseModel):
    skill_name: str
    category: str
    target_level: str
    priority: str

class CareerPathSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    slug: str
    title: str
    category: str
    overview: str
    active: bool

class CareerPathDetail(CareerPathSummary):
    responsibilities: List[str] = []
    learning_sequence: List[Dict[str, Any]] = []
    portfolio_projects: List[Dict[str, Any]] = []
    interview_topics: List[str] = []
    competencies: List[CareerCompetencyResponse] = []

# Assessment
class AssessmentQuestion(BaseModel):
    id: str
    category: str
    question: str
    options: List[str]

class AssessmentSubmit(BaseModel):
    answers: Dict[str, Any]

class CareerRecommendation(BaseModel):
    career_slug: str
    title: str
    alignment_score: int  # 0 to 100
    reasoning: List[str]
    skills_to_develop: List[str]
    confidence_label: str

class AssessmentResponse(BaseModel):
    id: str
    created_at: datetime
    recommendations: List[CareerRecommendation]
    summary: str
    limitations: List[str]

# Roadmap
class RoadmapTaskUpdate(BaseModel):
    status: Optional[str] = None  # todo, in_progress, completed
    notes: Optional[str] = None

class RoadmapTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    phase_id: str
    title: str
    description: Optional[str] = None
    estimated_hours: float
    status: str
    resource_url: Optional[str] = None
    notes: Optional[str] = None
    sort_order: int
    completed_at: Optional[datetime] = None

class RoadmapPhaseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    description: Optional[str] = None
    sort_order: int
    tasks: List[RoadmapTaskResponse] = []

class RoadmapResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    user_id: str
    career_path_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    total_tasks: int
    completed_tasks: int
    progress_percentage: float
    phases: List[RoadmapPhaseResponse] = []

class RoadmapGenerateRequest(BaseModel):
    target_role: str
    weekly_hours: Optional[int] = 10
    preferred_learning_style: Optional[str] = "Hands-on projects"

# Resume
class ResumeAnalysisResponse(BaseModel):
    id: str
    resume_id: str
    target_role: Optional[str] = None
    review_score: float  # CareerSaathi Resume Review Score out of 100
    score_breakdown: Dict[str, float]
    parsed_sections: Dict[str, Any]
    strengths: List[str]
    missing_elements: List[str]
    actionable_suggestions: List[Dict[str, str]]
    created_at: datetime

class ResumeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    original_filename: str
    mime_type: str
    file_size: int
    created_at: datetime
    latest_analysis: Optional[ResumeAnalysisResponse] = None

# Chat
class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1)

class ChatMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    role: str
    content: str
    created_at: datetime

class ChatConversationCreate(BaseModel):
    title: Optional[str] = "Career Guidance Session"

class ChatConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = []

# Interview
class InterviewSessionCreate(BaseModel):
    target_role: str
    interview_type: str = "technical"  # technical, hr, behavioral
    difficulty: str = "Medium"  # Easy, Medium, Hard
    question_count: int = 4

class InterviewAnswerSubmit(BaseModel):
    answer_text: str = Field(..., min_length=2)

class InterviewRubricFeedback(BaseModel):
    correctness_score: int  # 1-10
    clarity_score: int  # 1-10
    completeness_score: int  # 1-10
    strengths: List[str]
    improvements: List[str]
    sample_better_answer: str

class InterviewQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    question_text: str
    category: Optional[str] = None
    sort_order: int
    answer: Optional[Dict[str, Any]] = None

class InterviewSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    target_role: str
    interview_type: str
    difficulty: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    questions: List[InterviewQuestionResponse] = []
    summary: Optional[Dict[str, Any]] = None

# Practice
class PracticeQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    question_type: str  # aptitude, coding
    title: str
    prompt: str
    options: Optional[List[str]] = None
    difficulty: str
    topic: str
    constraints: Optional[str] = None
    input_output_examples: Optional[List[Dict[str, str]]] = None

class PracticeAttemptSubmit(BaseModel):
    answer: str

class PracticeAttemptResponse(BaseModel):
    id: str
    question_id: str
    is_correct: bool
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None
    feedback: Optional[str] = None
    created_at: datetime

# Job & Application
class JobListingResponse(BaseModel):
    id: str
    title: str
    company: str
    location: str
    work_mode: str
    employment_type: str
    description: str
    required_skills: List[str]
    eligibility_text: Optional[str] = None
    application_url: str
    source_name: str
    last_verified_at: datetime
    deadline: Optional[datetime] = None
    status: str
    is_demo: bool
    is_saved: Optional[bool] = False
    application_status: Optional[str] = None
    profile_alignment: Optional[int] = None  # percentage 0-100

class JobApplicationCreate(BaseModel):
    job_id: str
    status: Optional[str] = "applied"
    notes: Optional[str] = None

class JobApplicationUpdate(BaseModel):
    status: str  # saved, applied, assessment, interview, offer, rejected, withdrawn
    notes: Optional[str] = None

class JobApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    job_id: str
    status: str
    applied_at: datetime
    notes: Optional[str] = None
    updated_at: datetime
    job: JobListingResponse

# Notification
class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    body: str
    type: str
    link: Optional[str] = None
    read_at: Optional[datetime] = None
    created_at: datetime

# Readiness Overview
class ReadinessMetric(BaseModel):
    label: str
    score: int  # 0 to 100
    weight: float
    description: str
    action_item: str

class ReadinessOverviewResponse(BaseModel):
    overall_readiness_score: int  # 0 to 100
    rating_label: str  # e.g., "Early Stage", "Developing", "Placement Ready"
    metrics: List[ReadinessMetric]
    next_actions: List[Dict[str, str]]
    disclaimer: str
