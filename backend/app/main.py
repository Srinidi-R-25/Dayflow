import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.seed import seed_db
from app.routers import (
    auth_router,
    employees_router,
    attendance_router,
    leave_router,
    payroll_router,
    notifications_router,
    analytics_router,
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Dayflow HRMS FastAPI Backend REST API Service",
)

# Configure CORS
origins = [origin.strip() for origin in settings.CORS_ORIGINS if origin.strip()]
if "*" not in origins:
    origins.extend(["http://localhost:3000", "http://127.0.0.1:3000"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables and seed data on startup
@app.on_event("startup")
def on_startup():
    try:
        Base.metadata.create_all(bind=engine)
        seed_db()
    except Exception as e:
        print(f"Startup initialization notice: {e}")

# Include Routers
app.include_router(auth_router.router)
app.include_router(employees_router.router)
app.include_router(attendance_router.router)
app.include_router(leave_router.router)
app.include_router(payroll_router.router)
app.include_router(notifications_router.router)
app.include_router(analytics_router.router)

@app.get("/")
def root():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "tagline": "Every workday, perfectly aligned.",
        "docs_url": "/docs",
    }
