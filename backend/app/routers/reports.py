
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..auth import get_current_user
from ..models import Income, Expense, Report

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)


# =========================================================
# GET MONTHLY REPORT
# =========================================================

@router.get("/monthly")
def get_monthly_report(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Validate month and year
    if month < 1 or month > 12:
        raise HTTPException(
            status_code=400,
            detail="Month must be between 1 and 12"
        )

    if year < 2000 or year > 2100:
        raise HTTPException(
            status_code=400,
            detail="Invalid year"
        )

    # Calculate monthly date range
    start_date = date(year, month, 1)

    if month == 12:
        end_date = date(year + 1, 1, 1)
    else:
        end_date = date(year, month + 1, 1)

    # Calculate total income for the logged-in user
    total_income = (
        db.query(
            func.coalesce(func.sum(Income.amount), 0)
        )
        .filter(
            Income.user_id == current_user.id,
            Income.date >= start_date,
            Income.date < end_date
        )
        .scalar()
    )

    # Calculate total expenses for the logged-in user
    total_expenses = (
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

    total_income = float(total_income)
    total_expenses = float(total_expenses)

    remaining_balance = total_income - total_expenses

    # Save or update the monthly report
    report = (
        db.query(Report)
        .filter(
            Report.user_id == current_user.id,
            Report.month == month,
            Report.year == year
        )
        .first()
    )

    try:
        if report:
            report.total_income = total_income
            report.total_expense = total_expenses
            report.remaining_amount = remaining_balance
        else:
            report = Report(
                user_id=current_user.id,
                month=month,
                year=year,
                total_income=total_income,
                total_expense=total_expenses,
                remaining_amount=remaining_balance
            )
            db.add(report)

        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to generate monthly report"
        )

    # Return data expected by Reports.jsx
    return {
        "month": month,
        "year": year,
        "total_income": total_income,
        "total_expenses": total_expenses,
        "remaining_balance": remaining_balance
    }