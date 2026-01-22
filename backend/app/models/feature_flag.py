from sqlalchemy import Column, String, Text, DateTime, Enum, JSON, Float
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
import uuid
from datetime import datetime
import enum

class FlagStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ACTIVE = "active"
    INACTIVE = "inactive"

class RiskLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True)
    description = Column(Text)
    created_by = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(Enum(FlagStatus), default=FlagStatus.PENDING)
    risk_level = Column(Enum(RiskLevel), nullable=True)
    config = Column(JSON, default={})  # {"rollout_percentage": 10, "target_users": []}
    code_changes = Column(Text)  # Description of code changes
    scope = Column(String(255))  # "frontend", "backend", "database", "all"
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "status": self.status.value if self.status else None,
            "risk_level": self.risk_level.value if self.risk_level else None,
            "config": self.config,
            "code_changes": self.code_changes,
            "scope": self.scope
        }
