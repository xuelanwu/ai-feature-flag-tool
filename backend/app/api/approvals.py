from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from datetime import datetime
from app.db.database import get_db
from app.models.approval import Approval, ApprovalStatus
from app.models.feature_flag import FeatureFlag, FlagStatus

router = APIRouter()

class ApprovalCreate(BaseModel):
    flag_id: str
    approver_id: str

class ApprovalUpdate(BaseModel):
    status: str  # "approved" or "rejected"
    comment: str = ""

class ApprovalResponse(BaseModel):
    id: str
    flag_id: str
    approver_id: str
    status: str
    comment: str | None
    approved_at: str | None
    created_at: str | None
    flag_details: dict | None = None

@router.post("/", response_model=ApprovalResponse)
async def create_approval_request(approval: ApprovalCreate, db: Session = Depends(get_db)):
    """
    Create an approval request for a feature flag
    """
    # Check if flag exists
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == approval.flag_id).first()
    if not flag:
        raise HTTPException(status_code=404, detail="Flag not found")
    
    # Check if flag is in pending status
    if flag.status != FlagStatus.PENDING:
        raise HTTPException(status_code=400, detail="Flag is not in pending status")
    
    # Check if approval already exists
    existing = db.query(Approval).filter(
        Approval.flag_id == approval.flag_id,
        Approval.approver_id == approval.approver_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Approval request already exists")
    
    # Create approval
    new_approval = Approval(
        flag_id=approval.flag_id,
        approver_id=approval.approver_id,
        status=ApprovalStatus.PENDING
    )
    
    db.add(new_approval)
    db.commit()
    db.refresh(new_approval)
    
    response = new_approval.to_dict()
    response["flag_details"] = flag.to_dict()
    
    return response

@router.get("/", response_model=List[ApprovalResponse])
async def get_approvals(status: str = None, approver_id: str = None, db: Session = Depends(get_db)):
    """
    Get all approval requests, optionally filtered
    """
    query = db.query(Approval)
    
    if status:
        query = query.filter(Approval.status == status)
    
    if approver_id:
        query = query.filter(Approval.approver_id == approver_id)
    
    approvals = query.all()
    
    result = []
    for approval in approvals:
        approval_dict = approval.to_dict()
        
        # Get flag details
        flag = db.query(FeatureFlag).filter(FeatureFlag.id == approval.flag_id).first()
        approval_dict["flag_details"] = flag.to_dict() if flag else None
        
        result.append(approval_dict)
    
    return result

@router.patch("/{approval_id}")
async def update_approval(
    approval_id: str, 
    approval_update: ApprovalUpdate, 
    db: Session = Depends(get_db)
):
    """
    Approve or reject an approval request
    """
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    if approval.status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail="Approval already processed")
    
    # Update approval
    if approval_update.status.lower() == "approved":
        approval.status = ApprovalStatus.APPROVED
        approval.approved_at = datetime.utcnow()
        
        # Update flag status
        flag = db.query(FeatureFlag).filter(FeatureFlag.id == approval.flag_id).first()
        if flag:
            flag.status = FlagStatus.APPROVED
        
    elif approval_update.status.lower() == "rejected":
        approval.status = ApprovalStatus.REJECTED
        approval.approved_at = datetime.utcnow()
        
        # Update flag status
        flag = db.query(FeatureFlag).filter(FeatureFlag.id == approval.flag_id).first()
        if flag:
            flag.status = FlagStatus.REJECTED
    else:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    approval.comment = approval_update.comment
    
    db.commit()
    db.refresh(approval)
    
    response = approval.to_dict()
    
    # Get updated flag details
    flag = db.query(FeatureFlag).filter(FeatureFlag.id == approval.flag_id).first()
    response["flag_details"] = flag.to_dict() if flag else None
    
    return response

@router.get("/pending/{approver_id}", response_model=List[ApprovalResponse])
async def get_pending_approvals_for_user(approver_id: str, db: Session = Depends(get_db)):
    """
    Get all pending approvals for a specific approver
    """
    approvals = db.query(Approval).filter(
        Approval.approver_id == approver_id,
        Approval.status == ApprovalStatus.PENDING
    ).all()
    
    result = []
    for approval in approvals:
        approval_dict = approval.to_dict()
        
        # Get flag details with risk analysis
        flag = db.query(FeatureFlag).filter(FeatureFlag.id == approval.flag_id).first()
        if flag:
            from app.models.risk_analysis import RiskAnalysis
            risk = db.query(RiskAnalysis).filter(RiskAnalysis.flag_id == flag.id).first()
            
            flag_dict = flag.to_dict()
            flag_dict["risk_analysis"] = risk.to_dict() if risk else None
            approval_dict["flag_details"] = flag_dict
        
        result.append(approval_dict)
    
    return result
