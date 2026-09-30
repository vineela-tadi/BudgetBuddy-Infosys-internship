from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    UniqueConstraint
)
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


# =========================================================
# USER
# =========================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="user")

    # Password reset fields
    reset_token = Column(String(255), nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship(
        "Profile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    incomes = relationship(
        "Income",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    expenses = relationship(
        "Expense",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    budgets = relationship(
        "Budget",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    savings_goals = relationship(
        "SavingsGoal",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    reports = relationship(
        "Report",
        back_populates="user",
        cascade="all, delete-orphan"
    )


# =========================================================
# PROFILE
# =========================================================

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True
    )

    phone = Column(
        String(20),
        nullable=True
    )

    monthly_income = Column(
        Float,
        nullable=True
    )

    financial_preferences = Column(
        String(500),
        nullable=True
    )

    user = relationship(
        "User",
        back_populates="profile"
    )

# =========================================================
# INCOME
# =========================================================

class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    amount = Column(Float, nullable=False)
    source = Column(String(50), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship(
        "User",
        back_populates="incomes"
    )


# =========================================================
# EXPENSE
# =========================================================

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    amount = Column(Float, nullable=False)
    category = Column(String(50), nullable=False)
    description = Column(String(500), nullable=True)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship(
        "User",
        back_populates="expenses"
    )


# =========================================================
# BUDGET
# =========================================================

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    category = Column(String(50), nullable=False)
    allocated_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship(
        "User",
        back_populates="budgets"
    )

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "month",
            "year",
            "category",
            name="unique_user_month_category_budget"
        ),
    )


# =========================================================
# SAVINGS GOAL
# =========================================================

class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    goal_name = Column(String(150), nullable=False)
    target_amount = Column(Float, nullable=False)
    saved_amount = Column(Float, nullable=False, default=0)
    target_date = Column(Date, nullable=True)
    is_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship(
        "User",
        back_populates="savings_goals"
    )


# =========================================================
# NOTIFICATION
# =========================================================

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    message = Column(String(500), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship(
        "User",
        back_populates="notifications"
    )


# =========================================================
# REPORT
# =========================================================

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)

    total_income = Column(
        Float,
        nullable=False,
        default=0
    )

    total_expense = Column(
        Float,
        nullable=False,
        default=0
    )

    remaining_amount = Column(
        Float,
        nullable=False,
        default=0
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    user = relationship(
        "User",
        back_populates="reports"
    )