
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..auth import get_current_user
from ..models import Income, Expense, Budget, SavingsGoal

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    total_income = (
        db.query(func.coalesce(func.sum(Income.amount), 0))
        .filter(Income.user_id == current_user.id)
        .scalar()
    )

    total_expenses = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(Expense.user_id == current_user.id)
        .scalar()
    )

    total_budget = (
        db.query(func.coalesce(func.sum(Budget.allocated_amount), 0))
        .filter(Budget.user_id == current_user.id)
        .scalar()
    )

    total_savings_goals = (
        db.query(func.count(SavingsGoal.id))
        .filter(SavingsGoal.user_id == current_user.id)
        .scalar()
    )

    return {
        "total_income": float(total_income),
        "total_expenses": float(total_expenses),
        "balance": float(total_income - total_expenses),
        "total_budget": float(total_budget),
        "total_savings_goals": total_savings_goals
    }
