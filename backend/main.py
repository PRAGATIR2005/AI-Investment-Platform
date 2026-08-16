from datetime import date,datetime,timedelta
from passlib.context import CryptContext
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import JWTError,jwt

from database import Base, engine, get_db
from models import Investment, User
from ai_engine import generate_portfolio_insight, answer_question

# Create database tables
Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "ai-investment-platform-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
oauth2_scheme = HTTPBearer()
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        user = db.query(User).filter(
            User.id == int(user_id)
        ).first()

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except (JWTError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )
app = FastAPI(
    title="AI Investment Platform API",
    description="Backend API for an AI-powered investment portfolio platform",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    password: str
class InvestmentCreate(BaseModel):
    asset_name: str
    asset_type: str
    quantity: float
    purchase_price: float
    current_price: float
    purchase_date: date
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
@app.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }
@app.post("/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not pwd_context.verify(
        login_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }
@app.get("/")
def home():
    return {
        "message": "AI Investment Platform API is running!",
        "status": "success"
    }


@app.post("/investments")
def add_investment(
    investment: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_investment = Investment(
        asset_name=investment.asset_name,
        asset_type=investment.asset_type,
        quantity=investment.quantity,
        purchase_price=investment.purchase_price,
        current_price=investment.current_price,
        purchase_date=investment.purchase_date,
        user_id=current_user.id
    )

    db.add(new_investment)
    db.commit()
    db.refresh(new_investment)

    return {
        "message": "Investment added successfully",
        "investment": {
            "id": new_investment.id,
            "asset_name": new_investment.asset_name,
            "asset_type": new_investment.asset_type,
            "quantity": new_investment.quantity,
            "purchase_price": new_investment.purchase_price,
            "current_price": new_investment.current_price,
            "purchase_date": new_investment.purchase_date,
            "user_id": new_investment.user_id
        }
    }


@app.get("/investments")
def get_investments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    return investments


@app.get("/investments/{investment_id}")
def get_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()

    if not investment:
        raise HTTPException(
            status_code=404,
            detail="Investment not found"
        )

    return investment

@app.put("/investments/{investment_id}")
def update_investment(
    investment_id: int,
    investment: InvestmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()

    if not existing_investment:
        raise HTTPException(
            status_code=404,
            detail="Investment not found"
        )

    existing_investment.asset_name = investment.asset_name
    existing_investment.asset_type = investment.asset_type
    existing_investment.quantity = investment.quantity
    existing_investment.purchase_price = investment.purchase_price
    existing_investment.current_price = investment.current_price
    existing_investment.purchase_date = investment.purchase_date

    db.commit()
    db.refresh(existing_investment)

    return {
        "message": "Investment updated successfully",
        "investment": {
            "id": existing_investment.id,
            "asset_name": existing_investment.asset_name,
            "asset_type": existing_investment.asset_type,
            "quantity": existing_investment.quantity,
            "purchase_price": existing_investment.purchase_price,
            "current_price": existing_investment.current_price,
            "purchase_date": existing_investment.purchase_date,
            "user_id": existing_investment.user_id
        }
    }
@app.delete("/investments/{investment_id}")
def delete_investment(
    investment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investment = db.query(Investment).filter(
        Investment.id == investment_id,
        Investment.user_id == current_user.id
    ).first()

    if not investment:
        raise HTTPException(
            status_code=404,
            detail="Investment not found"
        )

    db.delete(investment)
    db.commit()

    return {
        "message": "Investment deleted successfully"
    }
@app.get("/portfolio/summary")
def portfolio_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    total_invested = 0
    current_value = 0

    for investment in investments:
        invested_amount = (
            investment.quantity * investment.purchase_price
        )

        current_amount = (
            investment.quantity * investment.current_price
        )

        total_invested += invested_amount
        current_value += current_amount

    profit_loss = current_value - total_invested

    if total_invested > 0:
        return_percentage = (
            profit_loss / total_invested
        ) * 100
    else:
        return_percentage = 0

    return {
        "total_invested": round(total_invested, 2),
        "current_value": round(current_value, 2),
        "profit_loss": round(profit_loss, 2),
        "return_percentage": round(return_percentage, 2)
    }
@app.get("/ai/advice")
def ai_advice(
    question: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    insight = generate_portfolio_insight(investments)

    portfolio = insight["portfolio"]

    best_asset = insight["best_asset"]
    worst_asset = insight["worst_asset"]

    diversification = insight["diversification"]
    risk = insight["risk"]

    # -----------------------------
    # Generate explanation
    # -----------------------------

    if portfolio["profit_loss"] > 0:
        performance_message = (
            "Your portfolio is currently generating a profit."
        )
    elif portfolio["profit_loss"] < 0:
        performance_message = (
            "Your portfolio is currently showing a loss."
        )
    else:
        performance_message = (
            "Your portfolio is currently at break-even."
        )

    analysis_text = (
        "🤖 AI PORTFOLIO ANALYSIS\n\n"

        "📊 PORTFOLIO PERFORMANCE\n\n"
        f"Total invested: ₹{portfolio['total_invested']:,.2f}\n"
        f"Current value: ₹{portfolio['current_value']:,.2f}\n"
        f"Profit/Loss: ₹{portfolio['profit_loss']:,.2f}\n"
        f"Overall return: "
        f"{portfolio['return_percentage']:.2f}%\n\n"

        f"{performance_message}\n\n"
    )

    # -----------------------------
    # Best asset
    # -----------------------------

    if best_asset:
        analysis_text += (
            "🏆 BEST PERFORMING ASSET\n\n"
            f"{best_asset['asset']} generated "
            f"₹{best_asset['profit_loss']:,.2f} "
            f"profit/loss with a "
            f"{best_asset['return_percentage']:.2f}% return.\n\n"
        )

    # -----------------------------
    # Worst asset
    # -----------------------------

    if worst_asset:
        analysis_text += (
            "📉 LOWEST PERFORMING ASSET\n\n"
            f"{worst_asset['asset']} generated "
            f"₹{worst_asset['profit_loss']:,.2f} "
            f"profit/loss with a "
            f"{worst_asset['return_percentage']:.2f}% return.\n\n"
        )

    # -----------------------------
    # Diversification
    # -----------------------------

    analysis_text += (
        "⚖️ DIVERSIFICATION\n\n"
        f"Score: {diversification['score']}/100\n"
        f"Level: {diversification['level']}\n\n"
    )

    # -----------------------------
    # Risk
    # -----------------------------

    analysis_text += (
        "⚠️ PORTFOLIO RISK\n\n"
        f"Risk score: {risk['score']}/100\n"
        f"Risk level: {risk['level']}\n\n"
    )

    # -----------------------------
    # General insight
    # -----------------------------

    if risk["level"] == "High":
        insight_message = (
            "The portfolio shows relatively high risk based "
            "on the current portfolio indicators."
        )

    elif diversification["level"] == "Low diversification":
        insight_message = (
            "The portfolio may benefit from greater diversification "
            "across different asset types."
        )

    elif portfolio["return_percentage"] > 0:
        insight_message = (
            "The portfolio is currently profitable based on "
            "the available investment data."
        )

    else:
        insight_message = (
            "Consider reviewing the portfolio performance and "
            "asset allocation regularly."
        )

    answer = answer_question(question, insight)

    analysis_text = answer

    return {
        "question": question,
        "answer": analysis_text,
        "portfolio": portfolio,
        "best_asset": best_asset,
        "worst_asset": worst_asset,
        "diversification": diversification,
        "risk": risk,
        "assets": insight["assets"]
    }