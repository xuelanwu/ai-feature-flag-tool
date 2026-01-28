from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api import flags, approvals, runtime
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Feature Flag System API",
    description="AI-Assisted Feature Flag & Approval Workflow",
    version="1.0.0"
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "https://ai-feature-flag-tool.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flags.router, prefix="/api/flags", tags=["flags"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["approvals"])
app.include_router(runtime.router, prefix="/api/runtime", tags=["runtime"])

@app.get("/")
async def root():
    return {
        "message": "Feature Flag System API",
        "docs": "/docs",
        "health": "ok",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
