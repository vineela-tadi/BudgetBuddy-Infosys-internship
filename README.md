# BudgetBuddy – Personal Finance Management System

## Project Overview

BudgetBuddy is a web-based personal finance management application developed as part of the Infosys internship project. It helps users manage their income, expenses, budgets, and savings while monitoring their financial activities.

## Features

* User Registration and Login
* Dashboard with Income, Expenses, and Balance
* Income Management
* Expense Management
* Budget Creation and Tracking
* Budget Exceeded Notifications
* Financial Analytics and Category-wise Expense Breakdown
* Monthly Financial Reports
* User Profile Management

## Technologies Used

**Frontend**

* React.js
* JavaScript
* HTML
* CSS

**Backend**

* Python
* FastAPI
* SQLAlchemy
* REST APIs

**Tools**

* Git and GitHub
* Visual Studio Code
* Swagger UI for API testing

## Project Structure

* `backend/` – Backend APIs and business logic
* `frontend/` – React user interface

## How to Run the Project

### 1. Start the Backend

Open a terminal in the backend directory and activate your Python virtual environment.

Install dependencies if a `requirements.txt` file is available:

```bash
pip install -r requirements.txt
```

Start the FastAPI server using the correct application module for your project:

```bash
uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` to access Swagger UI.

### 2. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal.

## Project Objective

The objective of BudgetBuddy is to provide a simple and user-friendly platform for tracking personal finances and supporting better budgeting decisions.
