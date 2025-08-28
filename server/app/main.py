from fastapi import FastAPI
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import load_env
from app.routes.health import router as health_router
from app.routes.root import router as root_router
from app.routes.roadmap import router as roadmap_router
from app.routes.milestones import router as milestones_router
from app.routes.plan import router as plan_router
from app.routes.tasks import router as tasks_router
from app.routes.system_design import router as system_design_router
from app.routes.user import router as user_router
from app.routes.projects import router as projects_router
from app.routes.project_uml import router as project_uml_router
from app.routes.company import router as company_router
from app.routes.task_assignments import router as task_assignments_router
from app.routes.user_project import router as user_project_router


# Ensure environment variables from .env are loaded at startup
load_env()

app = FastAPI(title="ProductManager", version="0.1.0")

# Enable CORS for Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(root_router)
app.include_router(roadmap_router)
app.include_router(milestones_router)
app.include_router(plan_router)
app.include_router(tasks_router)
app.include_router(system_design_router)
app.include_router(user_router)
app.include_router(projects_router)
app.include_router(project_uml_router)
app.include_router(company_router)
app.include_router(task_assignments_router)
app.include_router(user_project_router)