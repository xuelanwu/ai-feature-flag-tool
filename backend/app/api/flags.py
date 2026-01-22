from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.db.database import get_db
from app.models.feature_flag import FeatureFlag, FlagStatus, RiskLevel
from app.models.risk_analysis import RiskAnalysis
from app.models.approval import Approval, ApprovalStatus
from app.ai.ai_risk_analyzer import AIRiskAnalyzer
from sqlalchemy.orm.attributes import flag_modified

router = APIRouter()

# Approver rules
APPROVER_MAPPING = {
    "low": "team-lead@company.com",
    "medium": "senior-engineer@company.com",
    "high": "engineering-manager@company.com",
    "critical": "cto@company.com"
}

# Pydantic models for request/response
class FlagCreate(BaseModel):
    name: str
    description: str
    created_by: str
    code_changes: str
    scope: str
    config: dict = {}

class FlagResponse(BaseModel):
    id: str
    name: str
    description: str
    created_by: str
    status: str
    risk_level: str | None
    config: dict
    code_changes: str
    scope: str
    created_at: str | None
    risk_analysis: dict | None = None
    required_approver: str | None = None

@router.post("/", response_model=FlagResponse)
async def create_flag(flag: FlagCreate, db: Session = Depends(get_db)):
    """
    Create a new feature flag and perform AI risk analysis
    Automatically assigns approver based on risk level
    """
    # Check if flag name already exists
    existing = db.query(FeatureFlag).filter(FeatureFlag.name == flag.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Flag name already exists")

    # Create feature flag
    new_flag = FeatureFlag(
        name=flag.name,
        description=flag.description,
        created_by=flag.created_by,
        code_changes=flag.code_changes,
        scope=flag.scope,
        config=flag.config,
        status=FlagStatus.PENDING
    )

    db.add(new_flag)
    db.commit()
    db.refresh(new_flag)

    risk_data = None
    assigned_approver = "senior-engineer@company.com"

    # Perform AI risk analysis
    try:
        analyzer = AIRiskAnalyzer()
        risk_result = analyzer.analyze_feature_flag({
            "name": flag.name,
            "description": flag.description,
            "scope": flag.scope,
            "code_changes": flag.code_changes,
            "config": flag.config
        })

        # Save risk analysis
        risk_analysis = RiskAnalysis(
            flag_id=new_flag.id,
            risk_score=risk_result["risk_score"],
            ai_reasoning=risk_result["ai_reasoning"],
            detected_issues=risk_result["detected_issues"],
            recommendation=risk_result["recommendation"]
        )

        # Update flag risk level
        risk_level = risk_result["risk_level"]
        new_flag.risk_level = RiskLevel(risk_level)

        # Assign approver based on risk level
        assigned_approver = APPROVER_MAPPING.get(risk_level, "senior-engineer@company.com")

        db.add(risk_analysis)
        db.commit()
        db.refresh(risk_analysis)

        risk_data = risk_analysis.to_dict()

    except Exception as e:
        print(f"Risk analysis failed: {str(e)}")
        assigned_approver = "senior-engineer@company.com"

    #  Create Approval Request（Using approver assigned by system）
    try:
        approval = Approval(
            flag_id=new_flag.id,
            approver_id=assigned_approver,
            status=ApprovalStatus.PENDING
        )
        db.add(approval)
        db.commit()
        print(f" Created approval request for {assigned_approver} (Risk: {new_flag.risk_level})")
    except Exception as e:
        print(f"Failed to create approval: {str(e)}")

    response = new_flag.to_dict()
    response["risk_analysis"] = risk_data
    response["required_approver"] = assigned_approver

    return response

@router.get("/", response_model=List[FlagResponse])
async def get_flags(status: str = None, db: Session = Depends(get_db)):
    """
    Get all feature flags, optionally filtered by status
    """
    query = db.query(FeatureFlag)

    if status:
        query = query.filter(FeatureFlag.status == status)

    flags = query.all()

    result = []
    for flag in flags:
        flag_dict = flag.to_dict()

        # Get risk analysis
        risk = db.query(RiskAnalysis).filter(RiskAnalysis.flag_id == flag.id).first()
        flag_dict["risk_analysis"] = risk.to_dict() if risk else None

        # Get approver
        approval = db.query(Approval).filter(Approval.flag_id == flag.id).first()
        flag_dict["required_approver"] = approval.approver_id if approval else None

        result.append(flag_dict)

    return result

@router.get("/{flag_id}", response_model=FlagResponse)
async def get_flag(flag_id: str, db: Session = Depends(get_db)):
    """
    Get a specific feature flag by ID
    """
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()

    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")

    flag_dict = flag.to_dict()

    # Get risk analysis
    risk = db.query(RiskAnalysis).filter(RiskAnalysis.flag_id == flag.id).first()
    flag_dict["risk_analysis"] = risk.to_dict() if risk else None

    # Get approver
    approval = db.query(Approval).filter(Approval.flag_id == flag.id).first()
    flag_dict["required_approver"] = approval.approver_id if approval else None

    return flag_dict

@router.patch("/{flag_id}/toggle")
async def toggle_flag(flag_id: str, db: Session = Depends(get_db)):
    """
    Toggle flag status between ACTIVE and INACTIVE (only for approved flags)
    """
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()

    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")

    if flag.status not in [FlagStatus.ACTIVE, FlagStatus.INACTIVE, FlagStatus.APPROVED]:
        raise HTTPException(status_code=400, detail="Can only toggle approved flags")

    if flag.status == FlagStatus.ACTIVE:
        flag.status = FlagStatus.INACTIVE
    else:
        flag.status = FlagStatus.ACTIVE

    db.commit()
    db.refresh(flag)

    return flag.to_dict()

@router.patch("/{flag_id}/rollout")
async def update_rollout(
    flag_id: str,
    rollout_percentage: int,
    db: Session = Depends(get_db)
):
    """
    Update rollout percentage for a flag
    """
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()

    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")

    if not 0 <= rollout_percentage <= 100:
        raise HTTPException(status_code=400, detail="Rollout percentage must be between 0 and 100")

    flag.config['rollout_percentage'] = rollout_percentage

    flag_modified(flag, "config")

    db.commit()
    db.refresh(flag)

    return flag.to_dict()
