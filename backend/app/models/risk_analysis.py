from sqlalchemy import Column, String, Text, DateTime, Float, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
import uuid
from datetime import datetime

class RiskAnalysis(Base):
    __tablename__ = "risk_analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    flag_id = Column(UUID(as_uuid=True), ForeignKey("feature_flags.id"), nullable=False)
    risk_score = Column(Float, nullable=False)  # 0-100
    ai_reasoning = Column(Text)  # AI's explanation
    detected_issues = Column(JSON, default=[])  # ["database_migration", "auth_change"]
    recommendation = Column(Text)  # AI's recommendation for approval process
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "flag_id": str(self.flag_id),
            "risk_score": self.risk_score,
            "ai_reasoning": self.ai_reasoning,
            "detected_issues": self.detected_issues,
            "recommendation": self.recommendation,
            "analyzed_at": self.analyzed_at.isoformat() if self.analyzed_at else None
        }
