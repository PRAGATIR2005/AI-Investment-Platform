## AI Investment Platform

An AI-powered investment portfolio management web application that allows users to securely manage investments, monitor portfolio performance, visualize financial data, and receive portfolio-specific insights through an AI Investment Assistant.

## 📌 Project Overview

The AI Investment Platform is a full-stack web application designed to simplify investment portfolio management.

Users can create individual accounts, securely log in, add and manage investments, view portfolio performance, analyze profit and loss, visualize asset allocation, and ask questions about their portfolio.

The application supports multiple users while keeping each user's investment data separate.

## 🎯 Objectives

- Provide secure user registration and authentication.
- Allow users to manage investment portfolios.
- Calculate portfolio value, profit/loss, and returns.
- Provide visual portfolio analytics.
- Provide portfolio-specific AI-assisted insights.
- Keep different users' investment data separate.
- Provide a simple and professional user interface.

## ✨ Key Features

### 🔐 User Authentication

- User registration
- User login
- JWT authentication
- Logout
- Invalid-login handling
- Session persistence

### 👤 Multi-User Support

Each user has an independent investment portfolio.

Users can access only the investments associated with their authenticated account.

### 💼 Investment Management

Users can:

- Add investments
- Edit investments
- Delete investments
- View investments

Supported asset types:

- Stock
- ETF
- Mutual Fund
- Gold
- Bond
- Crypto

### 📊 Portfolio Summary

The dashboard displays:

- Total invested amount
- Current portfolio value
- Profit/Loss
- Overall return percentage

### 📈 Portfolio Analytics

The application provides:

- Portfolio allocation chart
- Profit/Loss by asset chart
- Asset-level performance analysis

### 🤖 AI Investment Assistant

Users can ask questions such as:

- How is my portfolio performing?
- Which is my best investment?
- Which investment is performing worst?
- What is the risk of my portfolio?
- How diversified is my portfolio?

The assistant analyzes the authenticated user's portfolio and provides a relevant response.

## 🏗️ System Architecture

```text
                    USER
                      │
                      ▼
              React Frontend
                      │
                 REST API
                      │
                      ▼
              FastAPI Backend
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
   Authentication          Portfolio APIs
          │                       │
          │                       ▼
          │                SQLite Database
          │                       │
          └───────────┬───────────┘
                      │
                      ▼
             Portfolio Analysis
                      │
                      ▼
           AI Investment Assistant
````

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS3
* Recharts

### Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite
* JWT Authentication

### Development Tools

* Visual Studio Code
* Node.js
* npm
* Python Virtual Environment
* Swagger / OpenAPI

## 📁 Project Structure

```text
AI-Investment-Platform/
│
├── README.md
│
├── backend/
│   ├── ai_engine.py
│   ├── database.py
│   ├── investments.db
│   ├── main.py
│   ├── models.py
│   └── venv/
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── assets/
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   └── main.jsx
    │
    ├── package.json
    ├── package-lock.json
    ├── index.html
    └── vite.config.js
```

## 🔑 Authentication Flow

```text
User
  ↓
Registration
  ↓
Account stored in database
  ↓
Login
  ↓
Backend validates credentials
  ↓
JWT token generated
  ↓
Token stored by frontend
  ↓
Authenticated API requests
  ↓
User-specific portfolio
```

Authenticated requests use:

```text
Authorization: Bearer <access_token>
```

## 💰 Investment Calculations

### Invested Amount

```text
Quantity × Purchase Price
```

### Current Value

```text
Quantity × Current Price
```

### Profit/Loss

```text
Current Value - Invested Amount
```

### Return Percentage

```text
(Profit/Loss ÷ Total Invested) × 100
```

## 🤖 AI Investment Assistant

The application contains a portfolio analysis engine that evaluates:

* Portfolio performance
* Best-performing asset
* Lowest-performing asset
* Diversification
* Portfolio risk
* Asset-level performance

The user's question is analyzed to determine which portfolio information is relevant.

For example:

```text
Question:
Which is my best investment?

Response:
Your best-performing investment is ...
```

Another example:

```text
Question:
What is the risk of my portfolio?

Response:
Your current portfolio risk score is ...
```

The AI analysis is based on the currently authenticated user's portfolio.

> Note: The current AI assistant is a project-specific portfolio analysis engine. It does not currently use an external generative AI model such as Gemini or GPT.

## 🔌 API Endpoints

### Authentication

```text
POST /register
POST /login
```

### Investments

```text
GET    /investments
POST   /investments
PUT    /investments/{investment_id}
DELETE /investments/{investment_id}
```

### Portfolio

```text
GET /portfolio/summary
```

### AI Assistant

```text
GET /ai/advice
```

## 🚀 Running the Backend

Open a terminal:

```cmd
cd /d E:\AI-Investment-Platform\backend
```

Activate the virtual environment:

```cmd
venv\Scripts\activate
```

Start the backend:

```cmd
uvicorn main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger documentation:

```text
http://127.0.0.1:8000/docs
```

## 🌐 Running the Frontend

Open another terminal:

```cmd
cd /d E:\AI-Investment-Platform\frontend
```

Install dependencies if required:

```cmd
npm install
```

Start the frontend:

```cmd
npm run dev
```

Open the URL displayed by Vite, normally:

```text
http://localhost:5173
```

## 🧪 Testing Performed

### Authentication

* [x] User registration
* [x] User login
* [x] Invalid login handling
* [x] Logout
* [x] Session persistence

### Multi-User Support

* [x] Multiple users
* [x] User-specific investments
* [x] User data isolation
* [x] User-specific AI analysis

### Investment Management

* [x] Add investment
* [x] Edit investment
* [x] Delete investment
* [x] Portfolio calculations

### Analytics

* [x] Portfolio summary
* [x] Portfolio allocation
* [x] Profit/Loss visualization
* [x] Asset performance

### AI Assistant

* [x] Portfolio performance questions
* [x] Best investment questions
* [x] Lowest-performing investment questions
* [x] Risk questions
* [x] Diversification questions
* [x] Different responses for different questions

### Frontend

* [x] Login interface
* [x] Registration interface
* [x] Dashboard interface
* [x] Responsive login design
* [x] Production build verification

## 🔒 Security

The backend associates every investment with a user ID.

Investment queries are filtered using the authenticated user's ID:

```python
Investment.user_id == current_user.id
```

This prevents normal authenticated requests from returning another user's investments.

JWT authentication is used for protected API requests.

## 📊 Project Status

| Component              | Status       |
| ---------------------- | ------------ |
| Registration           | ✅ Complete   |
| Login                  | ✅ Complete   |
| Logout                 | ✅ Complete   |
| JWT Authentication     | ✅ Complete   |
| Multi-user support     | ✅ Complete   |
| Investment CRUD        | ✅ Complete   |
| Portfolio calculations | ✅ Complete   |
| Analytics              | ✅ Complete   |
| AI Assistant           | ✅ Complete   |
| User data isolation    | ✅ Tested     |
| Login UI               | ✅ Complete   |
| Dashboard UI           | ✅ Complete   |
| Frontend build         | ✅ Successful |

## ⚠️ Limitations

* Investment prices are currently entered manually.
* Live stock-market data is not currently integrated.
* The AI assistant uses the application's own portfolio analysis engine rather than a large language model.
* SQLite is mainly suitable for development and demonstration.
* Advanced financial forecasting is not included.
* The application should not be considered a professional financial advisory system.

## 🔮 Future Enhancements

Possible future improvements include:

* Real-time stock market APIs
* Live ETF and mutual fund prices
* Gemini or another generative AI integration
* Natural-language financial conversations
* Advanced portfolio recommendations
* Historical portfolio performance
* Portfolio forecasting
* Email notifications
* Two-factor authentication
* PostgreSQL production database
* Cloud deployment
* Advanced risk analysis
* Automated investment reports

## 🎓 Academic Project

This project demonstrates the integration of:

* Frontend development
* Backend API development
* Database management
* Authentication
* Data visualization
* Portfolio analysis
* AI-assisted application functionality
* Full-stack web development

## ⚠️ Disclaimer

This application is developed for educational and demonstration purposes.

The portfolio insights generated by the application should not be considered professional financial advice.

## 📌 Project

**AI Investment Platform**

A full-stack investment portfolio management and AI-assisted analysis application.


