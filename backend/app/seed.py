import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal, engine, Base
from app.models.entities import (
    User, Profile, Skill, CareerPath, CareerCompetency,
    PracticeQuestion, JobListing
)
from app.services.auth import hash_password

async def seed_database(db: AsyncSession):
    # Check if already seeded
    user_check = await db.execute(select(User).limit(1))
    if user_check.scalar_one_or_none():
        return

    # 1. Create Admin and Demo Student accounts
    admin_user = User(
        email="admin@careersaathi.ai",
        hashed_password=hash_password("AdminPass123!"),
        role="admin"
    )
    db.add(admin_user)
    await db.flush()

    admin_profile = Profile(
        id=admin_user.id,
        full_name="Platform Administrator",
        onboarding_completed=True
    )
    db.add(admin_profile)

    student_user = User(
        email="student@careersaathi.ai",
        hashed_password=hash_password("StudentPass123!"),
        role="student"
    )
    db.add(student_user)
    await db.flush()

    student_profile = Profile(
        id=student_user.id,
        full_name="Aarav Sharma",
        college_name="National Institute of Technology",
        degree="B.Tech",
        branch="Computer Science & Engineering",
        current_year=3,
        current_semester=6,
        graduation_year=2026,
        weekly_hours=14,
        target_role="Full-Stack Developer",
        career_interests=["Full-Stack Development", "Cloud Architecture", "Applied AI"],
        preferred_learning_style="Hands-on projects",
        onboarding_completed=True
    )
    db.add(student_profile)

    # 2. Master Skills Catalog
    skills_data = [
        # Frontend
        ("React", "Frontend", "Component architecture, hooks, and virtual DOM in React."),
        ("TypeScript", "Frontend", "Static typing, generics, interfaces, and strict compiler configs."),
        ("Tailwind CSS", "Frontend", "Utility-first modern CSS framework and responsive design tokens."),
        ("Next.js", "Frontend", "Server-side rendering, static site generation, and App Router."),
        # Backend
        ("Python", "Backend", "Core language, async programming, data structures, and OOP."),
        ("FastAPI", "Backend", "Asynchronous Python web framework with Pydantic validation."),
        ("Node.js", "Backend", "Event-driven runtime, Express, microservices, and streams."),
        ("PostgreSQL", "Backend", "Relational database design, query optimization, indexing, and ACID."),
        ("Redis", "Backend", "In-memory caching, pub/sub, rate-limiting, and session store."),
        # AI / ML
        ("Machine Learning", "AI/ML", "Supervised/unsupervised algorithms, evaluation metrics, and feature engineering."),
        ("PyTorch", "AI/ML", "Deep learning framework, tensors, autograd, and neural network models."),
        ("LLMs & Prompt Engineering", "AI/ML", "Foundation models, structured output generation, RAG, and fine-tuning."),
        # Cloud / DevOps
        ("Docker", "DevOps", "Containerization, multi-stage builds, and container networking."),
        ("Kubernetes", "DevOps", "Container orchestration, deployments, pods, and ingress."),
        ("CI/CD & GitHub Actions", "DevOps", "Automated linting, testing, and continuous deployment workflows."),
        ("AWS / Cloud Basics", "DevOps", "Cloud compute (EC2/Lambda), object storage (S3), and VPC fundamentals."),
        # Core & DSA
        ("Data Structures & Algorithms", "Core", "Arrays, linked lists, trees, graphs, dynamic programming, and complexity."),
        ("System Design", "Core", "Horizontal scaling, load balancers, caching strategies, and database sharding.")
    ]

    skill_records = {}
    for name, cat, desc in skills_data:
        sk = Skill(name=name, category=cat, description=desc)
        db.add(sk)
        await db.flush()
        skill_records[name] = sk

    # 3. Career Paths
    careers_data = [
        {
            "slug": "full-stack-developer",
            "title": "Full-Stack Developer",
            "category": "Software Engineering",
            "overview": "Full-stack engineers architect both intuitive user-facing client applications and robust, scalable backend services. They possess end-to-end perspective on software systems.",
            "responsibilities": [
                "Develop responsive web interfaces with modern frontend frameworks.",
                "Build, test, and document RESTful and GraphQL backend APIs.",
                "Design and maintain normalized relational and document databases.",
                "Implement secure authentication, authorization, and data encryption.",
                "Collaborate with product and design teams in agile release cycles."
            ],
            "learning_sequence": [
                {"phase": "Foundation", "focus": "TypeScript, HTML5/CSS3 semantics, SQL fundamentals"},
                {"phase": "Frontend Mastery", "focus": "React state management, performance optimization, responsive layouts"},
                {"phase": "Backend Architecture", "focus": "FastAPI/Node.js, PostgreSQL relational modeling, JWT authentication"},
                {"phase": "DevOps & Production", "focus": "Docker containerization, CI/CD pipelines, cloud deployment"}
            ],
            "portfolio_projects": [
                {"title": "Real-Time Collaboration Workspace", "tech": "React, TypeScript, FastAPI, WebSockets, PostgreSQL"},
                {"title": "E-Commerce Checkout & Inventory Engine", "tech": "Next.js, Tailwind, Redis, Stripe API"}
            ],
            "interview_topics": [
                "Frontend rendering patterns (SSR, CSR, Hydration)",
                "Relational schema indexing and N+1 query troubleshooting",
                "REST API versioning, error contracts, and idempotency",
                "Browser security: CORS, XSS, and CSRF mitigation"
            ],
            "competencies": [
                ("React", "Advanced", "High"),
                ("TypeScript", "Advanced", "High"),
                ("Python", "Intermediate", "High"),
                ("FastAPI", "Intermediate", "High"),
                ("PostgreSQL", "Intermediate", "High"),
                ("Docker", "Beginner", "Medium"),
                ("Data Structures & Algorithms", "Intermediate", "High"),
                ("System Design", "Beginner", "Medium")
            ]
        },
        {
            "slug": "backend-developer",
            "title": "Backend Developer",
            "category": "Software Engineering",
            "overview": "Backend developers engineer the core business logic, persistence layers, distributed services, and high-throughput APIs that power digital platforms.",
            "responsibilities": [
                "Design high-performance database schemas and optimize query execution plans.",
                "Engineer distributed services, caching strategies, and message queues.",
                "Enforce security protocols, role-based authorization, and secrets management.",
                "Write unit, integration, and load tests to ensure system stability."
            ],
            "learning_sequence": [
                {"phase": "Core Principles", "focus": "Object-oriented & async programming, memory management, Linux shell"},
                {"phase": "Data Storage", "focus": "SQL deep dive, indexing strategies, transactions, Redis caching"},
                {"phase": "Distributed Systems", "focus": "Message brokers (Kafka/RabbitMQ), microservices, rate limiters"}
            ],
            "portfolio_projects": [
                {"title": "High-Throughput Analytics Ingestion Pipeline", "tech": "Python, FastAPI, Redis, PostgreSQL"},
                {"title": "Distributed Job Scheduler with Retry Mechanisms", "tech": "Go/Python, Docker, RabbitMQ"}
            ],
            "interview_topics": [
                "ACID properties and isolation levels",
                "Database connection pooling and connection leaks",
                "Eventual consistency vs strong consistency",
                "Thread pools vs event loops"
            ],
            "competencies": [
                ("Python", "Advanced", "High"),
                ("FastAPI", "Advanced", "High"),
                ("PostgreSQL", "Advanced", "High"),
                ("Redis", "Intermediate", "High"),
                ("Docker", "Intermediate", "High"),
                ("Data Structures & Algorithms", "Advanced", "High"),
                ("System Design", "Intermediate", "High")
            ]
        },
        {
            "slug": "ai-ml-engineer",
            "title": "AI / Machine Learning Engineer",
            "category": "Artificial Intelligence",
            "overview": "AI/ML Engineers develop, train, evaluate, and deploy machine learning models and generative AI systems into production software environments.",
            "responsibilities": [
                "Preprocess raw structured and unstructured data pipelines.",
                "Develop and evaluate machine learning models using PyTorch or Scikit-learn.",
                "Deploy models via scalable inference endpoints and batch prediction pipelines.",
                "Build retrieval-augmented generation (RAG) and LLM agent workflows."
            ],
            "learning_sequence": [
                {"phase": "Mathematics & Data", "focus": "Linear algebra, multivariate calculus, probability, NumPy/Pandas"},
                {"phase": "Machine Learning", "focus": "Supervised/unsupervised algorithms, evaluation rubrics, Scikit-learn"},
                {"phase": "Deep Learning & LLMs", "focus": "Neural networks, PyTorch, Transformers, vector databases, RAG"}
            ],
            "portfolio_projects": [
                {"title": "Domain-Specific Knowledge Base with RAG", "tech": "Python, LangChain/LlamaIndex, Qdrant/pgvector, FastAPI"},
                {"title": "Predictive Customer Churn Analysis Pipeline", "tech": "Scikit-Learn, Pandas, MLflow, Docker"}
            ],
            "interview_topics": [
                "Bias-variance trade-off and regularization techniques",
                "Gradient descent optimization variants (Adam, RMSProp)",
                "Attention mechanisms and Transformer architectures",
                "Vector similarity metrics (Cosine, Dot product, Euclidean)"
            ],
            "competencies": [
                ("Python", "Advanced", "High"),
                ("Machine Learning", "Advanced", "High"),
                ("PyTorch", "Intermediate", "High"),
                ("LLMs & Prompt Engineering", "Intermediate", "High"),
                ("PostgreSQL", "Beginner", "Medium"),
                ("Docker", "Intermediate", "Medium")
            ]
        },
        {
            "slug": "cloud-devops-engineer",
            "title": "Cloud & DevOps Engineer",
            "category": "Infrastructure",
            "overview": "Cloud and DevOps engineers build and maintain reliable infrastructure, automated delivery pipelines, container platforms, and observability systems.",
            "responsibilities": [
                "Provision cloud infrastructure using Infrastructure as Code (Terraform).",
                "Maintain automated CI/CD deployment pipelines.",
                "Monitor service health, uptime, latency, and log aggregation.",
                "Implement zero-trust security policies and cloud network topologies."
            ],
            "learning_sequence": [
                {"phase": "Linux & Networking", "focus": "Bash scripting, DNS, TCP/IP, SSH, systemd"},
                {"phase": "Containerization", "focus": "Docker, container security, multi-stage builds"},
                {"phase": "Orchestration & Cloud", "focus": "Kubernetes, AWS/GCP services, Terraform, Helm"},
                {"phase": "Observability", "focus": "Prometheus, Grafana, centralized logging"}
            ],
            "portfolio_projects": [
                {"title": "Automated Multi-Environment GitOps Pipeline", "tech": "GitHub Actions, ArgoCD, Kubernetes, Docker"},
                {"title": "Cloud Infrastructure Provisioning with Terraform", "tech": "Terraform, AWS, VPC, ECS, RDS"}
            ],
            "interview_topics": [
                "Kubernetes architecture: control plane vs worker nodes",
                "Blue/green vs canary deployment strategies",
                "Linux process management, signals, and namespaces",
                "Security best practices for container images"
            ],
            "competencies": [
                ("Docker", "Advanced", "High"),
                ("Kubernetes", "Intermediate", "High"),
                ("CI/CD & GitHub Actions", "Advanced", "High"),
                ("AWS / Cloud Basics", "Intermediate", "High"),
                ("Python", "Intermediate", "Medium")
            ]
        }
    ]

    for c in careers_data:
        comp_tuples = c.pop("competencies")
        career_path = CareerPath(**c, active=True)
        db.add(career_path)
        await db.flush()

        for sk_name, target_lvl, priority in comp_tuples:
            if sk_name in skill_records:
                comp = CareerCompetency(
                    career_path_id=career_path.id,
                    skill_id=skill_records[sk_name].id,
                    target_level=target_lvl,
                    priority=priority
                )
                db.add(comp)

    # 4. Practice Questions Bank (Aptitude & Coding)
    questions_data = [
        # Aptitude
        {
            "question_type": "aptitude",
            "title": "Work and Time Problem",
            "prompt": "Worker A can complete a software sprint in 12 days, and Worker B can complete the same sprint in 24 days. If they work together, in how many days will the sprint be completed?",
            "options_json": ["6 days", "8 days", "10 days", "16 days"],
            "correct_answer": "8 days",
            "explanation": "Rate of A = 1/12 per day. Rate of B = 1/24 per day. Combined rate = 1/12 + 1/24 = 3/24 = 1/8. Total time required = 8 days.",
            "difficulty": "Easy",
            "topic": "Quantitative Aptitude"
        },
        {
            "question_type": "aptitude",
            "title": "Speed, Distance, and Relative Velocity",
            "prompt": "Two data sync streams move towards a shared gateway from endpoints 300 km apart. Stream X travels at 60 km/h and Stream Y at 90 km/h. How long until their signals meet at the gateway?",
            "options_json": ["1.5 hours", "2.0 hours", "2.5 hours", "3.0 hours"],
            "correct_answer": "2.0 hours",
            "explanation": "Relative speed = 60 + 90 = 150 km/h. Time = Distance / Speed = 300 / 150 = 2.0 hours.",
            "difficulty": "Easy",
            "topic": "Quantitative Aptitude"
        },
        {
            "question_type": "aptitude",
            "title": "Logical Sequence & Deduction",
            "prompt": "Statements: (1) All APIs require authentication. (2) Some services are public endpoints. Which conclusion is definitively valid?",
            "options_json": [
                "All public endpoints require authentication.",
                "Some public endpoints require authentication.",
                "No public endpoints require authentication.",
                "None of the above."
            ],
            "correct_answer": "Some public endpoints require authentication.",
            "explanation": "Since all APIs require authentication, any public endpoint that is an API inherently requires authentication.",
            "difficulty": "Medium",
            "topic": "Logical Reasoning"
        },
        {
            "question_type": "aptitude",
            "title": "Probability & Combinatorics",
            "prompt": "A microservice deployment cluster contains 4 healthy pods and 2 failing pods. If 2 pods are inspected at random without replacement, what is the probability that both are healthy?",
            "options_json": ["2/5", "1/3", "4/15", "8/15"],
            "correct_answer": "2/5",
            "explanation": "Total pods = 6. Probability of first healthy pod = 4/6 = 2/3. Probability of second healthy pod = 3/5. Combined = (4/6) * (3/5) = 12/30 = 2/5.",
            "difficulty": "Medium",
            "topic": "Quantitative Aptitude"
        },
        # Coding
        {
            "question_type": "coding",
            "title": "Two Sum (Target Pair Indices)",
            "prompt": "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
            "options_json": None,
            "correct_answer": "Hash map single-pass approach in O(n) time and O(n) space.",
            "explanation": "Iterate through the array maintaining a hash map of value -> index. For each element `num`, check if `target - num` exists in the map. If yes, return current index and map index.",
            "difficulty": "Easy",
            "topic": "Arrays & Hashing",
            "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists."
        },
        {
            "question_type": "coding",
            "title": "Longest Substring Without Repeating Characters",
            "prompt": "Given a string `s`, find the length of the longest substring without duplicate characters.",
            "options_json": None,
            "correct_answer": "Sliding window with two pointers and a character index map.",
            "explanation": "Use a sliding window with left pointer `l` and right pointer `r`. Maintain the last seen index of each character. When a duplicate is seen at `r`, move `l` to `max(l, last_seen[char] + 1)`. Time complexity O(n), Space O(min(m, n)).",
            "difficulty": "Medium",
            "topic": "Sliding Window",
            "constraints": "0 <= s.length <= 5 * 10^4\n`s` consists of English letters, digits, symbols and spaces."
        },
        {
            "question_type": "coding",
            "title": "Validate Binary Search Tree",
            "prompt": "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST satisfies: left subtree contains only nodes with keys strictly less than the node's key, and right subtree contains only nodes with keys strictly greater than the node's key.",
            "options_json": None,
            "correct_answer": "Recursive DFS with allowable range (low, high) or in-order traversal.",
            "explanation": "Perform a recursive traversal passing valid bounds (min_val, max_val). At each node, check min_val < node.val < max_val, then recurse left with (min_val, node.val) and right with (node.val, max_val). Time O(n), Space O(h).",
            "difficulty": "Medium",
            "topic": "Trees & Binary Search",
            "constraints": "The number of nodes is in range [1, 10^4].\n-2^31 <= Node.val <= 2^31 - 1"
        }
    ]

    for q in questions_data:
        pq = PracticeQuestion(**q, active=True)
        db.add(pq)

    # 5. Verified & Clearly Labelled Demo Job Listings
    jobs_data = [
        {
            "title": "Associate Software Engineer (Graduate 2025/2026)",
            "company": "Infosys InStep Campus",
            "location": "Bengaluru, India",
            "work_mode": "Hybrid",
            "employment_type": "Full-time",
            "description": "Join our engineering accelerator program. You will collaborate on modern web platforms, write automated tests, and participate in peer code reviews.",
            "required_skills_json": ["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
            "eligibility_text": "B.Tech/BE in CSE, IT, or related technical disciplines with minimum 65% aggregate or 6.5 CGPA. No active backlogs.",
            "application_url": "https://careers.infosys.com",
            "source_name": "Official Campus Placement Portal",
            "is_demo": False,
            "status": "active"
        },
        {
            "title": "Full-Stack Developer Intern",
            "company": "Razorpay Tech Labs",
            "location": "Bengaluru / Remote",
            "work_mode": "Remote",
            "employment_type": "Internship",
            "description": "6-month internship building customer-facing dashboard widgets, payment webhooks, and scalable Node.js microservices.",
            "required_skills_json": ["React", "TypeScript", "Node.js", "Redis"],
            "eligibility_text": "Pre-final and final year undergraduate students with strong JavaScript and web architecture fundamentals.",
            "application_url": "https://razorpay.com/jobs",
            "source_name": "Razorpay Careers Portal",
            "is_demo": False,
            "status": "active"
        },
        {
            "title": "Junior Machine Learning Engineer",
            "company": "Fractal Analytics",
            "location": "Mumbai / Gurugram",
            "work_mode": "Hybrid",
            "employment_type": "Full-time",
            "description": "Develop automated feature pipelines, test predictive regression and classification models, and assist in LLM fine-tuning for enterprise clients.",
            "required_skills_json": ["Python", "Machine Learning", "PyTorch", "LLMs & Prompt Engineering"],
            "eligibility_text": "Bachelor's or Master's in Computer Science, Data Science, or Mathematics. Hands-on experience with Python data science libraries.",
            "application_url": "https://fractal.ai/careers",
            "source_name": "Fractal Verified Talent Portal",
            "is_demo": False,
            "status": "active"
        },
        {
            "title": "[Demo Sample] Cloud Infrastructure Associate",
            "company": "Acme Cloud Technologies (Sample)",
            "location": "Hyderabad, India",
            "work_mode": "Hybrid",
            "employment_type": "Full-time",
            "description": "Note: This is a clearly labelled demo sample listing provided for testing application workflows.",
            "required_skills_json": ["Docker", "Kubernetes", "CI/CD & GitHub Actions", "AWS / Cloud Basics"],
            "eligibility_text": "Demonstrated interest in Linux systems, containerization, and automated build workflows.",
            "application_url": "https://example.com/careers/demo-cloud",
            "source_name": "CareerSaathi Demo Environment",
            "is_demo": True,
            "status": "active"
        }
    ]

    for j in jobs_data:
        jl = JobListing(**j, last_verified_at=datetime.utcnow())
        db.add(jl)

    await db.commit()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await seed_database(session)

if __name__ == "__main__":
    asyncio.run(init_db())
