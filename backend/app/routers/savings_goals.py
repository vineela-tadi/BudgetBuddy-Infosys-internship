from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import SavingsGoal
from ..schemas import (
    SavingsGoalCreate,
    SavingsGoalUpdate,
    SavingsGoalProgress,
    SavingsGoalResponse
)
from ..auth import get_current_user


router = APIRouter(
    prefix="/savings-goals",
    tags=["Savings Goals"]
)


# =========================================================
# HELPER - PREPARE SAVINGS GOAL RESPONSE
# =========================================================

def prepare_goal_response(goal: SavingsGoal):
    if goal.target_amount > 0:
        progress = (
            goal.saved_amount / goal.target_amount
        ) * 100
    else:
        progress = 0

    progress = min(progress, 100)

    return {
        "id": goal.id,
        "goal_name": goal.goal_name,
        "target_amount": goal.target_amount,
        "saved_amount": goal.saved_amount,
        "target_date": goal.target_date,
        "is_completed": goal.saved_amount >= goal.target_amount,
        "progress_percentage": round(progress, 2)
    }


# =========================================================
# CREATE SAVINGS GOAL
# =========================================================

@router.post(
    "/",
    response_model=SavingsGoalResponse
)
def create_savings_goal(
    goal: SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if not goal.goal_name.strip():
        raise HTTPException(
            status_code=400,
            detail="Goal name is required"
        )

    if goal.target_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Target amount must be greater than 0"
        )

    if goal.saved_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Saved amount cannot be negative"
        )

    if goal.saved_amount > goal.target_amount:
        raise HTTPException(
            status_code=400,
            detail="Saved amount cannot exceed target amount"
        )

    new_goal = SavingsGoal(
        user_id=current_user.id,
        goal_name=goal.goal_name.strip(),
        target_amount=goal.target_amount,
        saved_amount=goal.saved_amount,
        target_date=goal.target_date,
        is_completed=goal.saved_amount >= goal.target_amount
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return prepare_goal_response(new_goal)


# =========================================================
# GET MY SAVINGS GOALS
# =========================================================

@router.get(
    "/",
    response_model=list[SavingsGoalResponse]
)
def get_savings_goals(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == current_user.id
    ).all()

    return [
        prepare_goal_response(goal)
        for goal in goals
    ]


# =========================================================
# GET SINGLE SAVINGS GOAL
# =========================================================

@router.get(
    "/{goal_id}",
    response_model=SavingsGoalResponse
)
def get_savings_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found"
        )

    return prepare_goal_response(goal)


# =========================================================
# UPDATE SAVINGS GOAL
# =========================================================

@router.put(
    "/{goal_id}",
    response_model=SavingsGoalResponse
)
def update_savings_goal(
    goal_id: int,
    goal_data: SavingsGoalUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found"
        )

    if goal_data.goal_name is not None:
        if not goal_data.goal_name.strip():
            raise HTTPException(
                status_code=400,
                detail="Goal name is required"
            )

        goal.goal_name = goal_data.goal_name.strip()

    if goal_data.target_amount is not None:
        if goal_data.target_amount <= 0:
            raise HTTPException(
                status_code=400,
                detail="Target amount must be greater than 0"
            )

        if goal.saved_amount > goal_data.target_amount:
            raise HTTPException(
                status_code=400,
                detail="Target amount cannot be less than saved amount"
            )

        goal.target_amount = goal_data.target_amount

    if goal_data.target_date is not None:
        goal.target_date = goal_data.target_date

    goal.is_completed = (
        goal.saved_amount >= goal.target_amount
    )

    db.commit()
    db.refresh(goal)

    return prepare_goal_response(goal)


# =========================================================
# UPDATE SAVINGS PROGRESS
# =========================================================

@router.put(
    "/{goal_id}/progress",
    response_model=SavingsGoalResponse
)
def update_savings_progress(
    goal_id: int,
    progress_data: SavingsGoalProgress,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found"
        )

    if progress_data.saved_amount < 0:
        raise HTTPException(
            status_code=400,
            detail="Saved amount cannot be negative"
        )

    if progress_data.saved_amount > goal.target_amount:
        raise HTTPException(
            status_code=400,
            detail="Saved amount cannot exceed target amount"
        )

    goal.saved_amount = progress_data.saved_amount

    goal.is_completed = (
        goal.saved_amount >= goal.target_amount
    )

    db.commit()
    db.refresh(goal)

    return prepare_goal_response(goal)


# =========================================================
# MARK GOAL AS COMPLETED
# =========================================================

@router.put(
    "/{goal_id}/complete",
    response_model=SavingsGoalResponse
)
def complete_savings_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found"
        )

    if goal.saved_amount < goal.target_amount:
        raise HTTPException(
            status_code=400,
            detail="Goal cannot be completed until target amount is reached"
        )

    goal.is_completed = True

    db.commit()
    db.refresh(goal)

    return prepare_goal_response(goal)


# =========================================================
# DELETE SAVINGS GOAL
# =========================================================

@router.delete("/{goal_id}")
def delete_savings_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Savings goal not found"
        )

    db.delete(goal)
    db.commit()

    return {
        "message": "Savings goal deleted successfully"
    }