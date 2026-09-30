from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Income
from ..schemas import IncomeCreate, IncomeResponse
from ..auth import get_current_user


router = APIRouter(
    prefix="/income",
    tags=["Income"]
)


# =========================================================
# ADD INCOME
# =========================================================

@router.post(
    "/",
    response_model=IncomeResponse
)
def create_income(
    income: IncomeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_income = Income(
        user_id=current_user.id,
        amount=income.amount,
        source=income.source,
        date=income.date,
        description=income.description
    )

    db.add(new_income)
    db.commit()
    db.refresh(new_income)

    return new_income


# =========================================================
# GET ALL INCOME
# =========================================================

@router.get(
    "/",
    response_model=list[IncomeResponse]
)
def get_income(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    incomes = db.query(Income).filter(
        Income.user_id == current_user.id
    ).all()

    return incomes


# =========================================================
# UPDATE INCOME
# =========================================================

@router.put(
    "/{income_id}",
    response_model=IncomeResponse
)
def update_income(
    income_id: int,
    income_data: IncomeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == current_user.id
    ).first()

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    income.amount = income_data.amount
    income.source = income_data.source
    income.date = income_data.date
    income.description = income_data.description

    db.commit()
    db.refresh(income)

    return income


# =========================================================
# DELETE INCOME
# =========================================================

@router.delete("/{income_id}")
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    income = db.query(Income).filter(
        Income.id == income_id,
        Income.user_id == current_user.id
    ).first()

    if not income:
        raise HTTPException(
            status_code=404,
            detail="Income not found"
        )

    db.delete(income)
    db.commit()

    return {
        "message": "Income deleted successfully"
    }