from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.models.feature_flag import FeatureFlag, FlagStatus
import hashlib

router = APIRouter()

@router.get("/check")
async def check_feature_flag(
    flag_name: str = Query(..., description="Feature flag name"),
    user_id: Optional[str] = Query(None, description="User ID for rollout calculation"),
    db: Session = Depends(get_db)
):
    flag = db.query(FeatureFlag).filter(
        FeatureFlag.name == flag_name
    ).first()

    if not flag:
        return {
            "flag_name": flag_name,
            "enabled": False,
            "rollout_percentage": 0,
            "reason": "Flag not found"
        }

    if flag.status != FlagStatus.ACTIVE:
        return {
            "flag_name": flag_name,
            "enabled": False,
            "rollout_percentage": flag.config.get('rollout_percentage', 0),
            "reason": f"Flag is {flag.status.value}, not active"
        }

    rollout_percentage = flag.config.get('rollout_percentage', 100)

    if rollout_percentage == 100:
        return {
            "flag_name": flag_name,
            "enabled": True,
            "rollout_percentage": 100,
            "reason": "Full rollout (100%)"
        }

    if user_id:
        hash_input = f"{flag_name}:{user_id}"
        user_hash = int(hashlib.md5(hash_input.encode()).hexdigest(), 16) % 100

        enabled = user_hash < rollout_percentage

        return {
            "flag_name": flag_name,
            "enabled": enabled,
            "rollout_percentage": rollout_percentage,
            "reason": f"User hash: {user_hash}, rollout: {rollout_percentage}%, enabled: {enabled}"
        }

    return {
        "flag_name": flag_name,
        "enabled": False,
        "rollout_percentage": rollout_percentage,
        "reason": "No user_id provided for rollout calculation"
    }

@router.get("/all")
async def get_all_active_flags(
    user_id: Optional[str] = Query(None, description="User ID for rollout calculation"),
    db: Session = Depends(get_db)
):
    active_flags = db.query(FeatureFlag).filter(
        FeatureFlag.status == FlagStatus.ACTIVE
    ).all()

    result = {}

    for flag in active_flags:
        rollout_percentage = flag.config.get('rollout_percentage', 100)

        if rollout_percentage == 100:
            result[flag.name] = True
        elif user_id:
            hash_input = f"{flag.name}:{user_id}"
            user_hash = int(hashlib.md5(hash_input.encode()).hexdigest(), 16) % 100
            result[flag.name] = user_hash < rollout_percentage
        else:
            result[flag.name] = False

    return result
