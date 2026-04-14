import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const expenseCategories = [
  "Rent",
  "Bills",
  "Food",
  "Grocery",
  "Transport",
  "Subscriptions",
  "Room",
  "Health",
  "Gift",
  "Money Given",
  "Lifestyle",
  "Shopping",
  "Misc",
];

const budgetCategories = [
  "Rent",
  "Bills",
  "Food",
  "Grocery",
  "Transport",
  "Subscriptions",
  "Room",
  "Money Given",
  "Lifestyle",
  "Shopping",
  "Misc",
];

const initialTransactions = [
  {
    id: "seed-1",
    type: "income",
    title: "Salary",
    amount: 6500,
    category: "Income",
    date: "2026-02-01",
    note: "Monthly income",
  },
  {
    id: "seed-2",
    type: "expense",
    title: "Rent (your share)",
    amount: 500,
    category: "Rent",
    date: "2026-02-02",
    note: "Essential",
  },
  {
    id: "seed-3",
    type: "expense",
    title: "Vodafone",
    amount: 140,
    category: "Bills",
    date: "2026-02-03",
    note: "Phone bill",
  },
  {
    id: "seed-4",
    type: "expense",
    title: "Grocery",
    amount: 104,
    category: "Grocery",
    date: "2026-02-04",
    note: "10 + 89 + 5",
  },
  {
    id: "seed-5",
    type: "expense",
    title: "Daily Food",
    amount: 172.37,
    category: "Food",
    date: "2026-02-10",
    note: "From previous sheet",
  },
  {
    id: "seed-6",
    type: "expense",
    title: "Transport",
    amount: 50,
    category: "Transport",
    date: "2026-02-11",
    note: "10 + 10 + 10 + 10 + 10",
  },
  {
    id: "seed-7",
    type: "expense",
    title: "Subscriptions",
    amount: 215,
    category: "Subscriptions",
    date: "2026-02-12",
    note: "45 + 50 + 50 + 50 + 20",
  },
  {
    id: "seed-8",
    type: "expense",
    title: "Shisha",
    amount: 29,
    category: "Lifestyle",
    date: "2026-02-14",
    note: "9 + 10 + 5 + 5",
  },
  {
    id: "seed-9",
    type: "expense",
    title: "Washing",
    amount: 3.5,
    category: "Misc",
    date: "2026-02-15",
    note: "Laundry",
  },
  {
    id: "seed-10",
    type: "expense",
    title: "Uber",
    amount: 69,
    category: "Transport",
    date: "2026-02-18",
    note: "17 + 5 + 5 + 7 + 14 + 21",
  },
  {
    id: "seed-11",
    type: "expense",
    title: "Perfume",
    amount: 35,
    category: "Shopping",
    date: "2026-02-19",
    note: "Personal shopping",
  },
  {
    id: "seed-12",
    type: "expense",
    title: "Hair",
    amount: 15,
    category: "Misc",
    date: "2026-02-20",
    note: "Personal care",
  },
  {
    id: "seed-13",
    type: "expense",
    title: "Valentines day",
    amount: 190,
    category: "Gift",
    date: "2026-02-21",
    note: "Special occasion",
  },
  {
    id: "seed-14",
    type: "expense",
    title: "Phone item",
    amount: 15,
    category: "Shopping",
    date: "2026-02-22",
    note: "Accessory",
  },
];

const initialBudgets = {
  Rent: 500,
  Bills: 200,
  Food: 300,
  Grocery: 150,
  Transport: 150,
  Subscriptions: 220,
  Room: 100,
  "Money Given": 1000,
  Lifestyle: 150,
  Shopping: 100,
  Misc: 100,
};

function formatQAR(value) {
  const num = Number(value || 0);
  const sign = num < 0 ? "-" : "";
  return `${sign}${Math.abs(num).toFixed(2)} QAR`;
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function monthKey(date) {
  return date.slice(0, 7);
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : initialTransactions;
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem("budgets");
    return saved ? JSON.parse(saved) : initialBudgets;
  });

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return localStorage.getItem("selectedMonth") || todayDate().slice(0, 7);
  });

  const [activeTab, setActiveTab] = useState("home");
  const [entryType, setEntryType] = useState("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [entryMonth, setEntryMonth] = useState(todayDate().slice(0, 7));
  const [entryDay, setEntryDay] = useState(
    String(new Date().getDate()).padStart(2, "0")
  );
  const [note, setNote] = useState("");

  const [supabaseUrl, setSupabaseUrl] = useState(
    localStorage.getItem("supabaseUrl") || ""
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    localStorage.getItem("supabaseAnonKey") || ""
  );
  const [userId, setUserId] = useState(
    localStorage.getItem("financeUserId") || uid()
  );
  const [syncStatus, setSyncStatus] = useState("local");
  const [syncMessage, setSyncMessage] = useState("Local only");

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("selectedMonth", selectedMonth);
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem("supabaseUrl", supabaseUrl);
    localStorage.setItem("supabaseAnonKey", supabaseAnonKey);
    localStorage.setItem("financeUserId", userId);
  }, [supabaseUrl, supabaseAnonKey, userId]);

  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch {
      return null;
    }
  }, [supabaseUrl, supabaseAnonKey]);

  const monthTransactions = useMemo(() => {
    return transactions
      .filter((item) => monthKey(item.date) === selectedMonth)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth]);

  const incomeTotal = useMemo(() => {
    return monthTransactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }, [monthTransactions]);

  const expenseTotal = useMemo(() => {
    return monthTransactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }, [monthTransactions]);

  const moneyGivenTotal = useMemo(() => {
    return monthTransactions
      .filter(
        (item) => item.type === "expense" && item.category === "Money Given"
      )
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }, [monthTransactions]);

  const savingsAmount = useMemo(() => {
    return incomeTotal - expenseTotal;
  }, [incomeTotal, expenseTotal]);

  const essentialCategories = new Set([
    "Rent",
    "Bills",
    "Food",
    "Grocery",
    "Transport",
    "Subscriptions",
    "Room",
    "Health",
  ]);

  const nonEssentialCategories = new Set([
    "Lifestyle",
    "Shopping",
    "Gift",
    "Misc",
  ]);

  const essentialTotal = useMemo(() => {
    return monthTransactions
      .filter(
        (item) =>
          item.type === "expense" && essentialCategories.has(item.category)
      )
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }, [monthTransactions]);

  const nonEssentialTotal = useMemo(() => {
    return monthTransactions
      .filter(
        (item) =>
          item.type === "expense" && nonEssentialCategories.has(item.category)
      )
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }, [monthTransactions]);

  const categorySummary = useMemo(() => {
    const map = {};
    monthTransactions.forEach((item) => {
      if (item.type !== "expense") return;
      map[item.category] = (map[item.category] || 0) + Number(item.amount);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthTransactions]);

  const savingsRate = useMemo(() => {
    if (incomeTotal <= 0) return 0;
    return (savingsAmount / incomeTotal) * 100;
  }, [incomeTotal, savingsAmount]);

  const budgetStatus = useMemo(() => {
    return budgetCategories.map((name) => {
      const spent =
        categorySummary.find((item) => item.name === name)?.value || 0;
      const budget = Number(budgets[name] || 0);
      const remaining = budget - spent;
      const percent = budget > 0 ? (spent / budget) * 100 : 0;
      return { name, spent, budget, remaining, percent };
    });
  }, [categorySummary, budgets]);

  const aiInsights = useMemo(() => {
    const tips = [];
    const topCategory = categorySummary[0];

    if (incomeTotal <= 0) {
      tips.push(
        "Add your monthly income first so the app can calculate your real status."
      );
    }

    if (savingsAmount < 0) {
      tips.push(
        "You are spending more than your income this month. Control shopping, lifestyle, and money given first."
      );
    }

    if (savingsRate > 0 && savingsRate < 20) {
      tips.push(
        "Your savings rate is low. Try to keep at least 20% of your income untouched."
      );
    }

    if (moneyGivenTotal > incomeTotal * 0.15 && incomeTotal > 0) {
      tips.push(
        "Money given to people is high compared to your income. Set a monthly limit and always add the person's name in note."
      );
    }

    if (nonEssentialTotal > essentialTotal * 0.4 && essentialTotal > 0) {
      tips.push(
        "Non-essential spending is getting high. Reduce lifestyle, gifts, and shopping first."
      );
    }

    const overBudget = budgetStatus.filter((item) => item.remaining < 0);
    if (overBudget.length > 0) {
      tips.push(
        `You crossed your budget in ${overBudget
          .map((item) => item.name)
          .join(", ")}.`
      );
    }

    if (topCategory) {
      tips.push(
        `${topCategory.name} is your biggest expense category this month. Check that first.`
      );
    }

    if (tips.length === 0) {
      tips.push("Your month looks balanced. Keep adding entries daily.");
    }

    return tips;
  }, [
    incomeTotal,
    savingsAmount,
    savingsRate,
    moneyGivenTotal,
    nonEssentialTotal,
    essentialTotal,
    budgetStatus,
    categorySummary,
  ]);

  const months = useMemo(() => {
    return Array.from(
      new Set(
        transactions.map((item) => monthKey(item.date)).concat(todayDate().slice(0, 7))
      )
    ).sort();
  }, [transactions]);

  function sanitizeDecimal(value) {
    return value.replace(/[^0-9.]/g, "");
  }

  function addTransaction() {
    const parsedAmount = Number(amount);
    if (!title.trim() || !parsedAmount || parsedAmount <= 0) return;

    const safeDay = String(
      Math.min(Math.max(Number(entryDay) || 1, 1), 31)
    ).padStart(2, "0");

    const fullDate = `${entryMonth}-${safeDay}`;
    const finalCategory = entryType === "income" ? "Income" : category;

    const newRow = {
      id: uid(),
      type: entryType,
      title: title.trim(),
      amount: parsedAmount,
      category: finalCategory,
      date: fullDate,
      note: note.trim(),
    };

    setTransactions((prev) => [newRow, ...prev]);
    setTitle("");
    setAmount("");
    setCategory("Food");
    setEntryMonth(todayDate().slice(0, 7));
    setEntryDay(String(new Date().getDate()).padStart(2, "0"));
    setNote("");
    setSelectedMonth(entryMonth);
    setActiveTab("home");
  }

  function removeTransaction(id) {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  }

  function updateBudget(name, value) {
    setBudgets((prev) => ({
      ...prev,
      [name]: Number(value) || 0,
    }));
  }

  async function connectCloud() {
    if (!supabase) {
      setSyncStatus("error");
      setSyncMessage("Add Supabase URL and anon key first");
      return;
    }
    setSyncStatus("connected");
    setSyncMessage("Connected. Ready to sync.");
  }

  async function pushToCloud() {
    if (!supabase) {
      setSyncStatus("error");
      setSyncMessage("Supabase not connected");
      return;
    }

    setSyncStatus("syncing");
    setSyncMessage("Uploading data...");

    try {
      await supabase.from("finance_transactions").delete().eq("user_id", userId);

      if (transactions.length > 0) {
        const rows = transactions.map((item) => ({
          id: item.id,
          user_id: userId,
          type: item.type,
          title: item.title,
          amount: item.amount,
          category: item.category,
          date: item.date,
          note: item.note,
        }));

        const { error: txError } = await supabase
          .from("finance_transactions")
          .insert(rows);

        if (txError) throw txError;
      }

      await supabase.from("finance_budgets").delete().eq("user_id", userId);

      const budgetRows = Object.entries(budgets).map(([cat, budget]) => ({
        user_id: userId,
        category: cat,
        budget,
      }));

      const { error: budgetError } = await supabase
        .from("finance_budgets")
        .insert(budgetRows);

      if (budgetError) throw budgetError;

      const { error: settingsError } = await supabase
        .from("finance_settings")
        .upsert(
          { user_id: userId, selected_month: selectedMonth },
          { onConflict: "user_id" }
        );

      if (settingsError) throw settingsError;

      setSyncStatus("connected");
      setSyncMessage("Cloud sync completed");
    } catch (error) {
      setSyncStatus("error");
      setSyncMessage(error?.message || "Cloud sync failed");
    }
  }

  async function pullFromCloud() {
    if (!supabase) {
      setSyncStatus("error");
      setSyncMessage("Supabase not connected");
      return;
    }

    setSyncStatus("syncing");
    setSyncMessage("Downloading data...");

    try {
      const { data: txData, error: txError } = await supabase
        .from("finance_transactions")
        .select("id,type,title,amount,category,date,note")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (txError) throw txError;

      const { data: budgetData, error: budgetError } = await supabase
        .from("finance_budgets")
        .select("category,budget")
        .eq("user_id", userId);

      if (budgetError) throw budgetError;

      const { data: settingsData, error: settingsError } = await supabase
        .from("finance_settings")
        .select("selected_month")
        .eq("user_id", userId)
        .maybeSingle();

      if (settingsError) throw settingsError;

      if (txData) setTransactions(txData);

      if (budgetData) {
        const nextBudgets = { ...initialBudgets };
        budgetData.forEach((row) => {
          nextBudgets[row.category] = Number(row.budget);
        });
        setBudgets(nextBudgets);
      }

      if (settingsData?.selected_month) {
        setSelectedMonth(settingsData.selected_month);
      }

      setSyncStatus("connected");
      setSyncMessage("Cloud data loaded");
    } catch (error) {
      setSyncStatus("error");
      setSyncMessage(error?.message || "Cloud download failed");
    }
  }

  function renderHome() {
    return (
      <div className="card">
        <div className="section-title">Recent Transactions</div>
        <div className="transaction-list">
          {monthTransactions.length === 0 ? (
            <div className="empty-text">No entries for this month.</div>
          ) : (
            monthTransactions.map((item) => (
              <div className="transaction-item" key={item.id}>
                <div className="transaction-left">
                  <div className="transaction-title">{item.title}</div>
                  <div className="transaction-meta">
                    <span className="pill">{item.category}</span>
                    <span>{item.date}</span>
                    {item.note ? <span>• {item.note}</span> : null}
                  </div>
                </div>
                <div className="transaction-right">
                  <div
                    className={
                      item.type === "income"
                        ? "amount income"
                        : "amount expense"
                    }
                  >
                    {item.type === "income" ? "+" : "-"}
                    {Number(item.amount).toFixed(2)}
                  </div>
                  <button
                    className="icon-btn"
                    onClick={() => removeTransaction(item.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  function renderAdd() {
    return (
      <div className="card">
        <div className="section-title center">Add Entry</div>

        <div className="toggle-row">
          <button
            className={entryType === "expense" ? "btn btn-dark" : "btn btn-light"}
            onClick={() => setEntryType("expense")}
          >
            Expense
          </button>
          <button
            className={entryType === "income" ? "btn btn-dark" : "btn btn-light"}
            onClick={() => setEntryType("income")}
          >
            Income
          </button>
        </div>

        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={entryType === "income" ? "Income title" : "Expense title"}
        />

        <input
          className="input"
          value={amount}
          onChange={(e) => setAmount(sanitizeDecimal(e.target.value))}
          placeholder="Amount"
          inputMode="decimal"
        />

        {entryType === "expense" ? (
         <select
  className="input"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
            {expenseCategories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : null}

        <div className="grid-2">
          <select
            className="input"
            value={entryMonth}
            onChange={(e) => setEntryMonth(e.target.value)}
          >
            {Array.from({ length: 12 }, (_, index) => {
              const monthNumber = String(index + 1).padStart(2, "0");
              const value = `${selectedMonth.slice(0, 4)}-${monthNumber}`;
              const label = new Date(`${value}-01`).toLocaleString(undefined, {
                month: "long",
                year: "numeric",
              });
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>

          <select
            className="input"
            value={entryDay}
            onChange={(e) => setEntryDay(e.target.value)}
          >
            {Array.from({ length: 31 }, (_, index) => {
              const value = String(index + 1).padStart(2, "0");
              return (
                <option key={value} value={value}>
                  {value}
                </option>
              );
            })}
          </select>
        </div>

        <input
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note or person name"
        />

        <div className="quick-row">
          {[5, 10, 20, 50].map((q) => (
            <button
              key={q}
              className="btn btn-light"
              onClick={() => setAmount(String((Number(amount) || 0) + q))}
            >
              +{q}
            </button>
          ))}
        </div>

        <button className="btn btn-dark full" onClick={addTransaction}>
          Add Entry
        </button>
      </div>
    );
  }

  function renderPlan() {
    return (
      <div className="stack">
        {budgetStatus.map((item) => (
          <div className="card" key={item.name}>
            <div className="budget-head">
              <div className="budget-name">{item.name}</div>
              <div className={item.remaining < 0 ? "left danger" : "left"}>
                {item.remaining < 0
                  ? formatQAR(item.remaining)
                  : `Left ${formatQAR(item.remaining)}`}
              </div>
            </div>

            <div className="budget-sub">
              Spent {formatQAR(item.spent)} / Budget {formatQAR(item.budget)}
            </div>

            <input
              className="input"
              value={String(item.budget)}
              onChange={(e) =>
                updateBudget(item.name, sanitizeDecimal(e.target.value))
              }
              inputMode="decimal"
            />

            <div className="progress">
              <div
                className={
                  item.percent > 100
                    ? "progress-bar red"
                    : item.percent > 80
                    ? "progress-bar yellow"
                    : "progress-bar"
                }
                style={{ width: `${Math.min(item.percent, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderCharts() {
    return (
      <div className="stack">
        <div className="card">
          <div className="section-title">Expense Split</div>
          {categorySummary.length === 0 ? (
            <div className="empty-text">No expense data for this month.</div>
          ) : (
            <div className="simple-chart">
              {categorySummary.map((item) => {
                const percent = expenseTotal > 0 ? (item.value / expenseTotal) * 100 : 0;
                return (
                  <div key={item.name} className="chart-row">
                    <div className="chart-label">{item.name}</div>
                    <div className="chart-bar-wrap">
                      <div
                        className="chart-bar"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="chart-value">{formatQAR(item.value)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderAI() {
    return (
      <div className="stack">
        <div className="card">
          <div className="section-title">AI Financial Check</div>
          <div className="stack">
            {aiInsights.map((tip, index) => (
              <div className="tip" key={index}>
                {tip}
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Control First</div>
          <div className="tip">1. Keep needs separate from wants.</div>
          <div className="tip">
            2. Track money given to people every single time.
          </div>
          <div className="tip">
            3. Add person name in note when you give money.
          </div>
          <div className="tip">
            4. Check Plan tab before spending on shopping or lifestyle.
          </div>
        </div>
      </div>
    );
  }

  function renderCloud() {
    return (
      <div className="stack">
        <div className="card">
          <div className="section-title">Cloud Database Setup</div>

          <input
            className="input"
            value={supabaseUrl}
            onChange={(e) => setSupabaseUrl(e.target.value)}
            placeholder="Supabase URL"
            autoCapitalize="none"
            autoCorrect="off"
          />

          <input
            className="input"
            value={supabaseAnonKey}
            onChange={(e) => setSupabaseAnonKey(e.target.value)}
            placeholder="Supabase anon key"
            autoCapitalize="none"
            autoCorrect="off"
          />

          <input
            className="input"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Private user ID"
            autoCapitalize="none"
            autoCorrect="off"
          />

          <div className="grid-3">
            <button className="btn btn-light" onClick={connectCloud}>
              Connect
            </button>
            <button className="btn btn-dark" onClick={pushToCloud}>
              Push
            </button>
            <button className="btn btn-light" onClick={pullFromCloud}>
              Pull
            </button>
          </div>

          <div className="status-box">Status: {syncMessage}</div>
        </div>

        <div className="card">
          <div className="section-title">Supabase Tables Needed</div>
          <div className="code-box">
            finance_transactions(id text primary key, user_id text, type text,
            title text, amount numeric, category text, date date, note text)
          </div>
          <div className="code-box">
            finance_budgets(user_id text, category text, budget numeric)
          </div>
          <div className="code-box">
            finance_settings(user_id text primary key, selected_month text)
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-container">
        <div className="top-head">
          <div>
            <div className="mini-label">Personal Finance</div>
            <h1 className="main-title">Money Status</h1>
          </div>
          <div className="wallet-box">💼</div>
        </div>

        <div className="top-row">
          <select
  className="input"
  value={selectedMonth}
  onChange={(e) => setSelectedMonth(e.target.value)}
>
            {months.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <div className={`sync-pill ${syncStatus}`}>
            {syncStatus.toUpperCase()}
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-top">
            <div>
              <div className="hero-sub">This Month</div>
              <div className="hero-value">{formatQAR(savingsAmount)}</div>
              <div className="hero-note">Net balance after all tracked expenses</div>
            </div>
            <div className="rate-box">
              <div className="hero-sub small-white">SAVINGS RATE</div>
              <div className="rate-value">{Math.round(savingsRate)}%</div>
            </div>
          </div>

          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-label">Income</div>
              <div className="stat-value">{Math.round(incomeTotal)}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Expense</div>
              <div className="stat-value">{Math.round(expenseTotal)}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Given</div>
              <div className="stat-value">{Math.round(moneyGivenTotal)}</div>
            </div>
          </div>
        </div>

        <div className="grid-2 summary-grid">
          <div className="summary-card">
            <div className="summary-label">Needs</div>
            <div className="summary-value">{formatQAR(essentialTotal)}</div>
            <div className="summary-note">Main living costs</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">Wants</div>
            <div className="summary-value">{formatQAR(nonEssentialTotal)}</div>
            <div className="summary-note">Can be reduced first</div>
          </div>
        </div>

        <div className="tab-bar">
          <button
            className={activeTab === "home" ? "tab active" : "tab"}
            onClick={() => setActiveTab("home")}
          >
            Home
          </button>
          <button
            className={activeTab === "add" ? "tab active" : "tab"}
            onClick={() => setActiveTab("add")}
          >
            Add
          </button>
          <button
            className={activeTab === "plan" ? "tab active" : "tab"}
            onClick={() => setActiveTab("plan")}
          >
            Plan
          </button>
          <button
            className={activeTab === "charts" ? "tab active" : "tab"}
            onClick={() => setActiveTab("charts")}
          >
            Charts
          </button>
          <button
            className={activeTab === "ai" ? "tab active" : "tab"}
            onClick={() => setActiveTab("ai")}
          >
            AI
          </button>
          <button
            className={activeTab === "cloud" ? "tab active" : "tab"}
            onClick={() => setActiveTab("cloud")}
          >
            Cloud
          </button>
        </div>

<div key={activeTab} className="page-animate">
  {activeTab === "home" && renderHome()}
  {activeTab === "add" && renderAdd()}
  {activeTab === "plan" && renderPlan()}
  {activeTab === "charts" && renderCharts()}
  {activeTab === "ai" && renderAI()}
  {activeTab === "cloud" && renderCloud()}
</div>
      </div>
    </div>
  );
}