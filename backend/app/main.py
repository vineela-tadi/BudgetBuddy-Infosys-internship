from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth
from .routers import users
from .routers import expenses
from .routers import income
from .routers import budget
from .routers import savings_goals
from .routers import dashboard
from .routers import notifications
from .routers import analytics
from .routers import reports
from app.routers.profile import router as profile_router


app = FastAPI(
    title="BudgetBuddy API",
    description="Intelligent Student Budget Planning and Personal Expense Management Platform",
    version="1.0.0"
)


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# INCLUDE ROUTERS
# =========================================================

# Authentication router
app.include_router(auth.router)

# Users router
app.include_router(users.router)

# Expenses router
app.include_router(expenses.router)

# Income router
app.include_router(income.router)

# Budget router
app.include_router(budget.router)

# Savings Goals router
app.include_router(savings_goals.router)

# Profile router
app.include_router(
    profile_router,
    prefix="/profile",
    tags=["Profile"]
)
#dashboard router
app.include_router(dashboard.router)

#notifications router
app.include_router(notifications.router)

#analytics router
app.include_router(analytics.router)

#reports router
app.include_router(reports.router)

\
# =========================================================
# ROOT ENDPOINT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to BudgetBuddy API",
        "status": "Backend is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }