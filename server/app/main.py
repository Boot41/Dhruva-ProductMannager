from fastapi import FastAPI

from app.core.config import load_env
from app.routes.health import router as health_router
from app.routes.root import router as root_router
from app.routes.roadmap import router as roadmap_router
from app.routes.milestones import router as milestones_router
from app.routes.plan import router as plan_router
from app.routes.tasks import router as tasks_router


# Ensure environment variables from .env are loaded at startup
load_env()

app = FastAPI(title="ProductManager", version="0.1.0")

# Include routers
app.include_router(health_router)
app.include_router(root_router)
app.include_router(roadmap_router)
app.include_router(milestones_router)
app.include_router(plan_router)
app.include_router(tasks_router)