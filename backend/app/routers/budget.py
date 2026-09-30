from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Budget
from ..schemas import BudgetCreate, BudgetResponse
from ..auth import get_current_user


router = APIRouter(
    prefix="/budget",
    tags=["Budget"]
)


# =========================================================
# CREATE BUDGET
# =========================================================

@router.post(
    "/",
    response_model=BudgetResponse
)
def create_budget(
    budget: BudgetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if budget.allocated_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Budget amount must be greater than 0"
        )

    if budget.month < 1 or budget.month > 12:
        raise HTTPException(
            status_code=400,
            detail="Month must be between 1 and 12"
        )

    existing_budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.month == budget.month,
        Budget.year == budget.year,
        Budget.category == budget.category
    ).first()

    if existing_budget:
        raise HTTPException(
            status_code=400,
            detail="Budget already exists for this category and month"
        )

    new_budget = Budget(
        user_id=current_user.id,
        month=budget.month,
        year=budget.year,
        category=budget.category,
        allocated_amount=budget.allocated_amount
    )

    db.add(new_budget)
    db.commit()
    db.refresh(new_budget)

    return new_budget


# =========================================================
# GET MY BUDGETS
# =========================================================

@router.get(
    "/",
    response_model=list[BudgetResponse]
)
def get_budgets(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id
    ).all()

    return budgets


# =========================================================
# UPDATE BUDGET
# =========================================================

@router.put(
    "/{budget_id}",
    response_model=BudgetResponse
)
def update_budget(
    budget_id: int,
    budget_data: BudgetCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    if budget_data.allocated_amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Budget amount must be greater than 0"
        )

    if budget_data.month < 1 or budget_data.month > 12:
        raise HTTPException(
            status_code=400,
            detail="Month must be between 1 and 12"
        )

    budget.month = budget_data.month
    budget.year = budget_data.year
    budget.category = budget_data.category
    budget.allocated_amount = budget_data.allocated_amount

    db.commit()
    db.refresh(budget)

    return budget


# =========================================================
# DELETE BUDGET
# =========================================================

@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()

    if not budget:
        raise HTTPException(
            status_code=404,
            detail="Budget not found"
        )

    db.delete(budget)
    db.commit()

    return {
        "message": "Budget deleted successfully"
    }