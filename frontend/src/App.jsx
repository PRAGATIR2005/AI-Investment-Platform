import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const API_URL = "http://127.0.0.1:8000";
function getAuthHeaders() {
  const token = localStorage.getItem("access_token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}
function App() {
  function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");

  setUser(null);
  setSummary(null);
  setInvestments([]);
  setAiAnswer("");
  setAiAnalysis(null);
  setQuestion("");
}
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [summary, setSummary] = useState(null);
const [investments, setInvestments] = useState([]);
const [loading, setLoading] = useState(true);

const [question, setQuestion] = useState("");
const [aiAnswer, setAiAnswer] = useState("");
const [aiAnalysis, setAiAnalysis] = useState(null);
const [aiLoading, setAiLoading] = useState(false);
const [editingId, setEditingId] = useState(null);
const [showForm, setShowForm] = useState(false);
const [showRegister, setShowRegister] = useState(false);

const [newInvestment, setNewInvestment] = useState({
  asset_name: "",
  asset_type: "Stock",
  quantity: "",
  purchase_price: "",
  current_price: "",
  purchase_date: ""
});
const allocationData = investments.map((investment) => ({
  name: investment.asset_name,
  value: investment.quantity * investment.current_price
}));

const profitData = investments.map((investment) => ({
  name: investment.asset_name,
  profit:
    (investment.current_price - investment.purchase_price) *
    investment.quantity
}));

  useEffect(() => {
  if (user) {
    fetchPortfolioData();
  }
}, [user]);

  async function fetchPortfolioData() {
  try {
    setLoading(true);

    const headers = getAuthHeaders();

    const summaryResponse = await fetch(
      `${API_URL}/portfolio/summary`,
      {
        headers
      }
    );

    const investmentsResponse = await fetch(
      `${API_URL}/investments`,
      {
        headers
      }
    );

    if (!summaryResponse.ok || !investmentsResponse.ok) {
      throw new Error("Failed to fetch portfolio data");
    }

    const summaryData = await summaryResponse.json();
    const investmentsData = await investmentsResponse.json();

    setSummary(summaryData);
    setInvestments(investmentsData);

  } catch (error) {
    console.error(
      "Error fetching portfolio data:",
      error
    );

    // Never keep old user's data on screen
    setSummary(null);
    setInvestments([]);
  } finally {
    setLoading(false);
  }
}

  async function askAI() {
  if (!question.trim()) {
    return;
  }

  setAiLoading(true);
  setAiAnswer("");
  setAiAnalysis(null);

  try {
    const response = await fetch(
  `${API_URL}/ai/advice?question=${encodeURIComponent(question)}`,
  {
    headers: getAuthHeaders()
  }
);

    const data = await response.json();

    setAiAnswer(data.answer);
    setAiAnalysis(data);
  } catch (error) {
    console.error("AI error:", error);

    setAiAnswer(
      "Unable to connect to the AI assistant."
    );
  } finally {
    setAiLoading(false);
  }
}
async function addInvestment(e) {
  e.preventDefault();

  try {
    const url = editingId
      ? `${API_URL}/investments/${editingId}`
      : `${API_URL}/investments`;

    const method = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
      method: method,
      headers: getAuthHeaders(),
      body: JSON.stringify({
        asset_name: newInvestment.asset_name,
        asset_type: newInvestment.asset_type,
        quantity: Number(newInvestment.quantity),
        purchase_price: Number(newInvestment.purchase_price),
        current_price: Number(newInvestment.current_price),
        purchase_date: newInvestment.purchase_date
      })
    });

    if (!response.ok) {
      throw new Error(
        editingId
          ? "Failed to update investment"
          : "Failed to add investment"
      );
    }

    setNewInvestment({
      asset_name: "",
      asset_type: "Stock",
      quantity: "",
      purchase_price: "",
      current_price: "",
      purchase_date: ""
    });

    setEditingId(null);
    setShowForm(false);

    await fetchPortfolioData();

  } catch (error) {
    console.error(
      editingId
        ? "Error updating investment:"
        : "Error adding investment:",
      error
    );

    alert(
      editingId
        ? "Unable to update investment."
        : "Unable to add investment."
    );
  }
}
async function deleteInvestment(id) {
  const confirmed = window.confirm(
    "Are you sure you want to delete this investment?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/investments/${id}`,
      {
        method: "DELETE",
        headers: getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete investment");
    }

    await fetchPortfolioData();

  } catch (error) {
    console.error("Error deleting investment:", error);
    alert("Unable to delete investment.");
  }
}
function editInvestment(investment) {
  setEditingId(investment.id);

  setNewInvestment({
    asset_name: investment.asset_name,
    asset_type: investment.asset_type,
    quantity: investment.quantity,
    purchase_price: investment.purchase_price,
    current_price: investment.current_price,
    purchase_date: investment.purchase_date
  });

  setShowForm(true);
}
if (!user) {
  if (showRegister) {
    return (
      <Register
        onRegister={() => setShowRegister(false)}
      />
    );
  }

  return (
    <Login
      onLogin={setUser}
      onRegister={() => setShowRegister(true)}
    />
  );
}
if (loading) {
    return <h2 className="loading">Loading portfolio...</h2>;
  }

  return (
    <div className="app">
      <header className="header">
  <div>
    <h1>AI Investment Platform</h1>
    <p>
      Welcome, {user?.name}
    </p>
  </div>

  <div className="header-actions">

    <div className="status">
      ● API Connected
    </div>

    <button
      className="logout-button"
      onClick={logout}
    >
      Logout
    </button>

  </div>
</header>

      <main className="dashboard">

        <section className="summary-grid">

          <div className="card">
            <h3>Total Invested</h3>
            <p className="value">
              ₹{summary?.total_invested?.toLocaleString()}
            </p>
          </div>

          <div className="card">
            <h3>Current Value</h3>
            <p className="value">
              ₹{summary?.current_value?.toLocaleString()}
            </p>
          </div>

          <div className="card">
            <h3>Profit / Loss</h3>
            <p className="value profit">
              ₹{summary?.profit_loss?.toLocaleString()}
            </p>
          </div>

          <div className="card">
            <h3>Return</h3>
            <p className="value profit">
              {summary?.return_percentage}%
            </p>
          </div>

        </section>

        <section className="investments-section">

          <div className="section-header">
  <h2>Your Investments</h2>

  <div className="section-actions">
    <button onClick={() => setShowForm(!showForm)}>
      {showForm ? "Close" : "＋ Add Investment"}
    </button>

    <button onClick={fetchPortfolioData}>
      Refresh
    </button>
  </div>
</div>
{showForm && (
  <form className="investment-form" onSubmit={addInvestment}>

    <div className="form-header">
      <h3>
  {editingId ? "Edit Investment" : "Add New Investment"}
</h3>
      <p>
  {editingId
    ? "Update the details of your investment."
    : "Enter the details of your investment."}
</p>
    </div>

    <div className="form-grid">

      <div className="form-group">
        <label>Asset Name</label>
        <input
          type="text"
          placeholder="e.g. Tesla"
          value={newInvestment.asset_name}
          onChange={(e) =>
            setNewInvestment({
              ...newInvestment,
              asset_name: e.target.value
            })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Asset Type</label>
        <select
          value={newInvestment.asset_type}
          onChange={(e) =>
            setNewInvestment({
              ...newInvestment,
              asset_type: e.target.value
            })
          }
        >
          <option value="Stock">Stock</option>
          <option value="ETF">ETF</option>
          <option value="Mutual Fund">Mutual Fund</option>
          <option value="Gold">Gold</option>
          <option value="Bond">Bond</option>
          <option value="Crypto">Crypto</option>
        </select>
      </div>

      <div className="form-group">
        <label>Quantity</label>
        <input
          type="number"
          step="any"
          min="0"
          placeholder="e.g. 10"
          value={newInvestment.quantity}
          onChange={(e) =>
            setNewInvestment({
              ...newInvestment,
              quantity: e.target.value
            })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Purchase Price (₹)</label>
        <input
          type="number"
          step="any"
          min="0"
          placeholder="e.g. 200"
          value={newInvestment.purchase_price}
          onChange={(e) =>
            setNewInvestment({
              ...newInvestment,
              purchase_price: e.target.value
            })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Current Price (₹)</label>
        <input
          type="number"
          step="any"
          min="0"
          placeholder="e.g. 230"
          value={newInvestment.current_price}
          onChange={(e) =>
            setNewInvestment({
              ...newInvestment,
              current_price: e.target.value
            })
          }
          required
        />
      </div>

      <div className="form-group">
        <label>Purchase Date</label>
        <input
          type="date"
          value={newInvestment.purchase_date}
          onChange={(e) =>
            setNewInvestment({
              ...newInvestment,
              purchase_date: e.target.value
            })
          }
          required
        />
      </div>

    </div>

    <button type="submit" className="submit-investment">
  {editingId ? "Update Investment" : "Add Investment"}
</button>

  </form>
)}

          <div className="table-container">

            <table>

              <thead>
  <tr>
    <th>Asset</th>
    <th>Type</th>
    <th>Quantity</th>
    <th>Purchase Price</th>
    <th>Current Price</th>
    <th>Profit / Loss</th>
    <th>Action</th>
  </tr>
</thead>

              <tbody>

                {investments.map((investment) => {

                  const invested =
                    investment.quantity *
                    investment.purchase_price;

                  const current =
                    investment.quantity *
                    investment.current_price;

                  const profit = current - invested;

                  return (
                    <tr key={investment.id}>

                      <td>
                        <strong>
                          {investment.asset_name}
                        </strong>
                      </td>

                      <td>{investment.asset_type}</td>

                      <td>{investment.quantity}</td>

                      <td>
                        ₹{investment.purchase_price}
                      </td>

                      <td>
                        ₹{investment.current_price}
                      </td>

                      <td className={profit >= 0 ? "profit" : "loss"}>
                        ₹{profit.toLocaleString()}
                      </td>
                      <td>
  <button
    className="edit-button"
    onClick={() => editInvestment(investment)}
  >
    Edit
  </button>

  <button
    className="delete-button"
    onClick={() => deleteInvestment(investment.id)}
  >
    Delete
  </button>
</td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </section>
        <section className="analytics-section">

  <div className="analytics-header">
    <h2>Portfolio Analytics</h2>
    <p>Visual overview of your current investments</p>
  </div>

  <div className="charts-grid">

    <div className="chart-card">

      <h3>Portfolio Allocation</h3>

      <ResponsiveContainer width="100%" height={300}>

        <PieChart>

          <Pie
            data={allocationData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >

            {allocationData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
              />
            ))}

          </Pie>

          <Tooltip />
          <Legend />

        </PieChart>

      </ResponsiveContainer>

    </div>


    <div className="chart-card">

      <h3>Profit / Loss by Asset</h3>

      <ResponsiveContainer width="100%" height={300}>

        <BarChart data={profitData}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="name" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Bar
            dataKey="profit"
            name="Profit / Loss"
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  </div>

</section>

        <section className="ai-section">

  <div className="ai-icon">🤖</div>

  <div className="ai-content">

    <h2>AI Investment Assistant</h2>

    <p>
      Ask questions about your portfolio and get
      AI-powered insights.
    </p>

    <div className="ai-input">

      <input
        type="text"
        placeholder="Ask: How is my portfolio performing?"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            askAI();
          }
        }}
      />

      <button onClick={askAI} disabled={aiLoading}>
  {aiLoading ? "Analyzing..." : "Ask AI"}
</button>

    </div>

    {aiAnswer && aiAnalysis && (
  <div className="ai-answer">

    <strong>🤖 AI Portfolio Analysis</strong>

    <div className="ai-metrics">

      <div className="ai-metric">
        <span>📊 Return</span>
        <strong>
          {aiAnalysis.portfolio?.return_percentage}%
        </strong>
      </div>

      <div className="ai-metric">
        <span>💰 Profit/Loss</span>
        <strong>
          ₹{aiAnalysis.portfolio?.profit_loss?.toLocaleString()}
        </strong>
      </div>

      <div className="ai-metric">
        <span>⚖️ Diversification</span>
        <strong>
          {aiAnalysis.diversification?.score}/100
        </strong>
        <small>
          {aiAnalysis.diversification?.level}
        </small>
      </div>

      <div className="ai-metric">
        <span>⚠️ Risk</span>
        <strong>
          {aiAnalysis.risk?.score}/100
        </strong>
        <small>
          {aiAnalysis.risk?.level}
        </small>
      </div>

    </div>

    {aiAnalysis.best_asset && (
      <div className="ai-insight">
        <h4>🏆 Best Performing Asset</h4>

        <p>
          <strong>
            {aiAnalysis.best_asset.asset}
          </strong>

          {" "}generated{" "}

          ₹{aiAnalysis.best_asset.profit_loss?.toLocaleString()}

          {" "}with a{" "}

          {aiAnalysis.best_asset.return_percentage}%
          {" "}return.
        </p>
      </div>
    )}

    {aiAnalysis.worst_asset && (
      <div className="ai-insight">
        <h4>📉 Lowest Performing Asset</h4>

        <p>
          <strong>
            {aiAnalysis.worst_asset.asset}
          </strong>

          {" "}generated{" "}

          ₹{aiAnalysis.worst_asset.profit_loss?.toLocaleString()}

          {" "}with a{" "}

          {aiAnalysis.worst_asset.return_percentage}%
          {" "}return.
        </p>
      </div>
    )}
  </div>
)}
<div className="ai-insight">

  <h4>💡 AI Response</h4>

  <p>{aiAnswer}</p>

</div>
  </div>

</section>

      </main>
    </div>
  );
}

export default App;