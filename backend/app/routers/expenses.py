
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import Expense, Notification, Budget
from ..schemas import ExpenseCreate, ExpenseResponse
from ..auth import get_current_user


router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


# =========================================================
# HELPER: CHECK BUDGET AND CREATE ALERT IF REQUIRED
# =========================================================

def check_budget_and_notify(
    db: Session,
    user_id: int,
    category: str,
    expense_date: date
):
    month = expense_date.month
    year = expense_date.year

    # Find budget for the same user, month, year and category
    budget = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.month == month,
        Budget.year == year,
        func.lower(Budget.category) == category.strip().lower()
    ).first()

    if not budget:
        return

    # First day of the budget month
    start_date = date(year, month, 1)

    # First day of the next month
    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    # Calculate total expenses in this category for this month
    total_spent = db.query(
        func.coalesce(func.sum(Expense.amount), 0)
    ).filter(
        Expense.user_id == user_id,
        func.lower(Expense.category) == budget.category.strip().lower(),
        Expense.date >= start_date,
        Expense.date < end_date
    ).scalar()

    total_spent = float(total_spent or 0)
    allocated = float(budget.allocated_amount or 0)

    # No alert if spending is within budget
    if total_spent <= allocated:
        return

    month_label = f"{year}-{month:02d}"
    alert_prefix = (
        f"Budget exceeded for {budget.category} "
        f"({month_label})!"
    )

    # Avoid creating duplicate alerts for the same category and month
    existing_alert = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.message.like(f"{alert_prefix}%")
    ).first()

    if existing_alert:
        # Refresh the amount in an existing unread alert
        if not existing_alert.is_read:
            existing_alert.message = (
                f"{alert_prefix} Spent ₹{total_spent:.2f} "
                f"of ₹{allocated:.2f}; "
                f"over by ₹{total_spent - allocated:.2f}."
            )
        return

    # Create a new budget exceeded notification
    notification = Notification(
        user_id=user_id,
        message=(
            f"{alert_prefix} Spent ₹{total_spent:.2f} "
            f"of ₹{allocated:.2f}; "
            f"over by ₹{total_spent - allocated:.2f}."
        ),
        is_read=False
    )

    db.add(notification)


# =========================================================
# ADD EXPENSE + NOTIFICATIONS + BUDGET CHECK
# =========================================================

@router.post("/", response_model=ExpenseResponse)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_expense = Expense(
        user_id=current_user.id,
        amount=expense.amount,
        category=expense.category,
        description=expense.description,
        date=expense.date
    )

    try:
        db.add(new_expense)
        db.flush()

        # Normal expense notification
        db.add(
            Notification(
                user_id=current_user.id,
                message=(
                    f"New expense added: ₹{expense.amount} "
                    f"for {expense.category}"
                ),
                is_read=False
            )
        )

        # Check whether the category budget has been exceeded
        check_budget_and_notify(
            db=db,
            user_id=current_user.id,
            category=expense.category,
            expense_date=expense.date
        )

        # Save expense and all notifications together
        db.commit()
        db.refresh(new_expense)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to add expense and check budget"
        )

    return new_expense


# =========================================================
# GET ALL EXPENSES
# =========================================================

@router.get("/", response_model=list[ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Expense).filter(
        Expense.user_id == current_user.id
    ).all()


# =========================================================
# UPDATE EXPENSE
# =========================================================

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    try:
        expense.amount = expense_data.amount
        expense.category = expense_data.category
        expense.description = expense_data.description
        expense.date = expense_data.date

        db.flush()

        # Recheck the budget for the updated expense
        check_budget_and_notify(
            db=db,
            user_id=current_user.id,
            category=expense.category,
            expense_date=expense.date
        )

        db.commit()
        db.refresh(expense)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update expense and check budget"
        )

    return expense


# =========================================================
# DELETE EXPENSE
# =========================================================

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id,
        Expense.user_id == current_user.id
    ).first()

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    db.delete(expense)
    db.commit()

    return {
        "message": "Expense deleted successfully"
    }