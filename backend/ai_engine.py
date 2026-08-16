def analyze_portfolio(investments):
    total_invested = 0
    current_value = 0

    asset_analysis = []

    for investment in investments:

        invested = (
            investment.quantity *
            investment.purchase_price
        )

        current = (
            investment.quantity *
            investment.current_price
        )

        profit_loss = current - invested

        if invested > 0:
            return_percentage = (
                profit_loss / invested
            ) * 100
        else:
            return_percentage = 0

        total_invested += invested
        current_value += current

        asset_analysis.append({
            "asset": investment.asset_name,
            "type": investment.asset_type,
            "invested": round(invested, 2),
            "current_value": round(current, 2),
            "profit_loss": round(profit_loss, 2),
            "return_percentage": round(return_percentage, 2)
        })

    total_profit_loss = current_value - total_invested

    if total_invested > 0:
        total_return = (
            total_profit_loss / total_invested
        ) * 100
    else:
        total_return = 0

    return {
        "total_invested": round(total_invested, 2),
        "current_value": round(current_value, 2),
        "profit_loss": round(total_profit_loss, 2),
        "return_percentage": round(total_return, 2),
        "assets": asset_analysis
    }
def find_best_and_worst(assets):
    if not assets:
        return {
            "best": None,
            "worst": None
        }

    best = max(
        assets,
        key=lambda asset: asset["return_percentage"]
    )

    worst = min(
        assets,
        key=lambda asset: asset["return_percentage"]
    )

    return {
        "best": best,
        "worst": worst
    }    
def calculate_diversification(investments):
    if not investments:
        return {
            "score": 0,
            "level": "No investments"
        }

    asset_types = set(
        investment.asset_type
        for investment in investments
    )

    number_of_types = len(asset_types)

    if number_of_types == 1:
        score = 30
        level = "Low diversification"

    elif number_of_types == 2:
        score = 55
        level = "Moderate diversification"

    elif number_of_types == 3:
        score = 75
        level = "Good diversification"

    else:
        score = 90
        level = "High diversification"

    return {
        "score": score,
        "level": level,
        "asset_types": list(asset_types)
    }
def calculate_risk(investments):
    if not investments:
        return {
            "score": 0,
            "level": "No data"
        }

    asset_types = set(
        investment.asset_type
        for investment in investments
    )

    number_of_types = len(asset_types)

    total_invested = sum(
        investment.quantity * investment.purchase_price
        for investment in investments
    )

    current_value = sum(
        investment.quantity * investment.current_price
        for investment in investments
    )

    if total_invested > 0:
        return_percentage = (
            (current_value - total_invested)
            / total_invested
        ) * 100
    else:
        return_percentage = 0

    # Start with a moderate risk score
    risk_score = 50

    # Less diversification → higher risk
    if number_of_types == 1:
        risk_score += 25
    elif number_of_types == 2:
        risk_score += 10
    elif number_of_types >= 4:
        risk_score -= 10

    # Large negative return → higher risk indicator
    if return_percentage < -10:
        risk_score += 20
    elif return_percentage < 0:
        risk_score += 10

    # Keep score between 0 and 100
    risk_score = max(0, min(100, risk_score))

    if risk_score >= 70:
        level = "High"
    elif risk_score >= 40:
        level = "Moderate"
    else:
        level = "Low"

    return {
        "score": risk_score,
        "level": level
    }
def generate_portfolio_insight(investments):
    analysis = analyze_portfolio(investments)

    ranking = find_best_and_worst(
        analysis["assets"]
    )

    diversification = calculate_diversification(
        investments
    )

    risk = calculate_risk(
        investments
    )

    return {
        "portfolio": {
            "total_invested": analysis["total_invested"],
            "current_value": analysis["current_value"],
            "profit_loss": analysis["profit_loss"],
            "return_percentage": analysis["return_percentage"]
        },

        "best_asset": ranking["best"],
        "worst_asset": ranking["worst"],

        "diversification": diversification,

        "risk": risk,

        "assets": analysis["assets"]
    }
def answer_question(question, insight):
    question = question.lower().strip()

    portfolio = insight["portfolio"]
    best = insight["best_asset"]
    worst = insight["worst_asset"]
    diversification = insight["diversification"]
    risk = insight["risk"]

    # -----------------------------
    # BEST INVESTMENT
    # -----------------------------
    if (
        "best investment" in question
        or "best asset" in question
        or "top investment" in question
        or "best performing" in question
        or "which investment is best" in question
        or "which is my best" in question
    ):
        if best:
            return (
                f"🏆 Your best-performing investment is "
                f"{best['asset']}. "
                f"It currently has a profit/loss of "
                f"₹{best['profit_loss']:,.2f} "
                f"and a return of "
                f"{best['return_percentage']:.2f}%."
            )

        return "There are no investments available to analyze."

    # -----------------------------
    # WORST INVESTMENT
    # -----------------------------
    if (
        "worst investment" in question
        or "worst asset" in question
        or "weakest investment" in question
        or "weakest asset" in question
        or "lowest performing" in question
        or "lowest investment" in question
    ):
        if worst:
            return (
                f"📉 Your lowest-performing investment is "
                f"{worst['asset']}. "
                f"It currently has a profit/loss of "
                f"₹{worst['profit_loss']:,.2f} "
                f"and a return of "
                f"{worst['return_percentage']:.2f}%."
            )

        return "There are no investments available to analyze."

    # -----------------------------
    # RISK
    # -----------------------------
    if (
        "risk" in question
        or "risky" in question
        or "risk level" in question
        or "risk score" in question
    ):
        return (
            f"⚠️ Your portfolio risk score is "
            f"{risk['score']}/100, classified as "
            f"{risk['level']} risk. "
            f"This project-level score considers your "
            f"asset diversification and current portfolio "
            f"performance."
        )

    # -----------------------------
    # DIVERSIFICATION
    # -----------------------------
    if (
        "diversification" in question
        or "diversified" in question
        or "diversify" in question
        or "asset types" in question
    ):
        return (
            f"⚖️ Your portfolio diversification score is "
            f"{diversification['score']}/100, classified as "
            f"{diversification['level']}. "
            f"You currently have "
            f"{len(diversification['asset_types'])} "
            f"different asset types."
        )

    # -----------------------------
    # PERFORMANCE
    # -----------------------------
    if (
        "performance" in question
        or "performing" in question
        or "return" in question
        or "profit" in question
        or "loss" in question
        or "portfolio doing" in question
        or "portfolio performing" in question
    ):
        return (
            f"📊 Your portfolio is currently valued at "
            f"₹{portfolio['current_value']:,.2f}. "
            f"You have invested "
            f"₹{portfolio['total_invested']:,.2f}, "
            f"resulting in a profit/loss of "
            f"₹{portfolio['profit_loss']:,.2f}. "
            f"Your overall return is "
            f"{portfolio['return_percentage']:.2f}%."
        )

    # -----------------------------
    # GENERAL QUESTION
    # -----------------------------
    return (
        f"📊 Your portfolio is currently valued at "
        f"₹{portfolio['current_value']:,.2f}, "
        f"with an overall return of "
        f"{portfolio['return_percentage']:.2f}%. "
        f"Your diversification level is "
        f"{diversification['level']} and your current "
        f"risk level is {risk['level']}."
    )