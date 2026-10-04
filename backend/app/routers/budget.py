
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Budget, Expense, Notification
from ..schemas import BudgetCreate, BudgetResponse
from ..auth import get_current_user

router = APIRouter(
    prefix="/budget",
    tags=["Budget"]
)


def check_budget_alert(db, budget, user_id):
    total_expenses = (
        db.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(
            Expense.user_id == user_id,
            Expense.category == budget.category,
            func.extract("month", Expense.date) == budget.month,
            func.extract("year", Expense.date) == budget.year
        )
        .scalar()
    )

    if total_expenses > budget.allocated_amount:
        message = (
            f"Budget exceeded for {budget.category}. "
            f"Spent: {float(total_expenses):.2f}, "
            f"Budget: {float(budget.allocated_amount):.2f}"
        )

        existing_notification = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.message == message
        ).first()

        if not existing_notification:
            notification = Notification(
                user_id=user_id,
                message=message,
                is_read=False
            )
            db.add(notification)


@router.post("/", response_model=BudgetResponse)
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
    db.flush()

    check_budget_alert(
        db,
        new_budget,
        current_user.id
    )

    db.commit()
    db.refresh(new_budget)

    return new_budget


@router.get("/", response_model=list[BudgetResponse])
def get_budgets(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Budget).filter(
        Budget.user_id == current_user.id
    ).all()


@router.put("/{budget_id}", response_model=BudgetResponse)
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

    check_budget_alert(
        db,
        budget,
        current_user.id
    )

    db.commit()
    db.refresh(budget)

    return budget


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
