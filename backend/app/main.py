from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api import flags, approvals, runtime  # 新增 runtime

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Feature Flag System API",
    description="AI-Assisted Feature Flag & Approval Workflow",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(flags.router, prefix="/api/flags", tags=["flags"])
app.include_router(approvals.router, prefix="/api/approvals", tags=["approvals"])
app.include_router(runtime.router, prefix="/api/runtime", tags=["runtime"])  # 新增

@app.get("/")
async def root():
    return {
        "message": "Feature Flag System API",
        "docs": "/docs",
        "health": "ok"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
