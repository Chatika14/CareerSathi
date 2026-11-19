import sys
import os
from pathlib import Path

# Add backend directory to sys.path so app modules are resolvable
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Ensure storage directory exists in /tmp if running on Vercel
if os.getenv("VERCEL"):
    os.makedirs("/tmp/storage/resumes", exist_ok=True)

from app.main import app
