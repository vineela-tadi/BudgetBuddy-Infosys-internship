
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..auth import get_current_user
from ..models import Income, Expense

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


# =========================================================
# ANALYTICS SUMMARY
# =========================================================

@router.get("/summary")
def get_analytics_summary(
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

    total_income = float(total_income)
    total_expenses = float(total_expenses)
    balance = total_income - total_expenses

    savings_rate = (
        (balance / total_income) * 100
        if total_income > 0 else 0
    )

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": balance,
        "savings_rate": round(savings_rate, 2),
        "expense_ratio": round(
            (total_expenses / total_income) * 100, 2
        ) if total_income > 0 else 0
    }


# =========================================================
# EXPENSES BY CATEGORY
# =========================================================

@router.get("/categories")
def get_expenses_by_category(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    results = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label("total")
        )
        .filter(Expense.user_id == current_user.id)
        .group_by(Expense.category)
        .order_by(func.sum(Expense.amount).desc())
        .all()
    )

    return [
        {
            "category": category or "Uncategorized",
            "total": float(total or 0)
        }
        for category, total in results
    ]


# =========================================================
# MONTHLY EXPENSE TREND - LAST 6 MONTHS
# =========================================================

@router.get("/monthly-trend")
def get_monthly_expense_trend(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    today = date.today()

    # Include current month and previous five months
    month_ranges = []

    for offset in range(5, -1, -1):
        month_index = today.year * 12 + today.month - 1 - offset
        year = month_index // 12
        month = month_index % 12 + 1

        start_date = date(year, month, 1)

        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)

        month_ranges.append(
            (year, month, start_date, end_date)
        )

    results = []

    for year, month, start_date, end_date in month_ranges:
        total = (
            db.query(
                func.coalesce(func.sum(Expense.amount), 0)
            )
            .filter(
                Expense.user_id == current_user.id,
                Expense.date >= start_date,
                Expense.date < end_date
            )
            .scalar()
        )

        results.append({
            "month": date(year, month, 1).strftime("%b %Y"),
            "total": float(total or 0)
        })

    return results