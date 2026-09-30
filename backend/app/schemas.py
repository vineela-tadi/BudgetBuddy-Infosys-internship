from datetime import date
from pydantic import BaseModel, EmailStr, Field


# =========================================================
# USER SCHEMAS
# =========================================================

class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=100)


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True


# =========================================================
# TOKEN SCHEMA
# =========================================================

class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# =========================================================
# PROFILE SCHEMAS
# =========================================================

class ProfileCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str


class ProfileResponse(BaseModel):
    name: str
    email: EmailStr
    phone: str

# =========================================================
# INCOME SCHEMAS
# =========================================================

class IncomeCreate(BaseModel):
    amount: float
    source: str
    date: date
    description: str | None = None


class IncomeResponse(BaseModel):
    id: int
    amount: float
    source: str
    date: date
    description: str | None = None

    class Config:
        from_attributes = True


# =========================================================
# EXPENSE SCHEMAS
# =========================================================

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: str | None = None
    date: date


class ExpenseResponse(BaseModel):
    id: int
    amount: float
    category: str
    description: str | None = None
    date: date

    class Config:
        from_attributes = True


# =========================================================
# BUDGET SCHEMAS
# =========================================================

class BudgetCreate(BaseModel):
    month: int
    year: int
    category: str
    allocated_amount: float


class BudgetResponse(BaseModel):
    id: int
    month: int
    year: int
    category: str
    allocated_amount: float

    class Config:
        from_attributes = True


# =========================================================
# SAVINGS GOAL SCHEMAS
# =========================================================

class SavingsGoalCreate(BaseModel):
    goal_name: str = Field(
        min_length=1,
        max_length=150
    )

    target_amount: float = Field(
        gt=0
    )

    saved_amount: float = Field(
        default=0,
        ge=0
    )

    target_date: date | None = None


class SavingsGoalUpdate(BaseModel):
    goal_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=150
    )

    target_amount: float | None = Field(
        default=None,
        gt=0
    )

    target_date: date | None = None


class SavingsGoalProgress(BaseModel):
    saved_amount: float = Field(
        ge=0
    )


class SavingsGoalResponse(BaseModel):
    id: int
    goal_name: str
    target_amount: float
    saved_amount: float
    target_date: date | None = None
    is_completed: bool
    progress_percentage: float

    class Config:
        from_attributes = True


# =========================================================
# NOTIFICATION SCHEMAS
# =========================================================

class NotificationCreate(BaseModel):
    message: str


class NotificationResponse(BaseModel):
    id: int
    message: str
    is_read: bool

    class Config:
        from_attributes = True


# =========================================================
# REPORT SCHEMAS
# =========================================================

class ReportResponse(BaseModel):
    id: int
    month: int
    year: int
    total_income: float
    total_expense: float
    remaining_amount: float

    class Config:
        from_attributes = True
        
class GoogleLoginRequest(BaseModel):
    credential: str