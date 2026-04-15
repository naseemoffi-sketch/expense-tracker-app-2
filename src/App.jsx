import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const baseExpenseCategories = [
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
  "Send Home Money",
  "Lifestyle",
  "Shopping",
  "Misc",
];

const baseBudgetCategories = [
  "Rent",
  "Bills",
  "Food",
  "Grocery",
  "Transport",
  "Subscriptions",
  "Room",
  "Money Given",
  "Send Home Money",
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
  "Send Home Money": 1000,
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
  return String(date).slice(0, 7);
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selected = options.find((item) => item.value === value);

  return (
    <div className={`custom-select ${className}`} ref={ref}>
      <button
        type="button"
        className={`custom-select-trigger ${open ? "open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <span className={`custom-select-arrow ${open ? "open" : ""}`}>⌄</span>
      </button>

      <div className={`custom-select-menu ${open ? "show" : ""}`}>
        {options.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`custom-select-option ${
              value === item.value ? "selected" : ""
            }`}
            onClick={() => {
              onChange(item.value);
              setOpen(false);
            }}
          >
            <span>{item.label}</span>
            {value === item.value ? (
              <span className="custom-select-check">✓</span>
            ) : null}
          </button>
        ))}
      </div>
    </div>
  );
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
  const [entryYear, setEntryYear] = useState(String(new Date().getFullYear()));
  const [entryMonth, setEntryMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [entryDay, setEntryDay] = useState(
    String(new Date().getDate()).padStart(2, "0")
  );
  const [note, setNote] = useState("");

  const [customCategories, setCustomCategories] = useState(() => {
    const saved = localStorage.getItem("customCategories");
    return saved ? JSON.parse(saved) : [];
  });
  const [newCategoryName, setNewCategoryName] = useState("");

  const [oweName, setOweName] = useState("");
  const [oweAmount, setOweAmount] = useState("");
  const [oweType, setOweType] = useState("lent");
  const [oweYear, setOweYear] = useState(String(new Date().getFullYear()));
  const [oweMonth, setOweMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [oweDay, setOweDay] = useState(
    String(new Date().getDate()).padStart(2, "0")
  );
  const [oweNote, setOweNote] = useState("");

  const [owes, setOwes] = useState(() => {
    const saved = localStorage.getItem("owes");
    return saved ? JSON.parse(saved) : [];
  });

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

  const [autoSync, setAutoSync] = useState(() => {
    const saved = localStorage.getItem("autoSync");
    return saved ? JSON.parse(saved) : false;
  });

  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  });

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
    localStorage.setItem("customCategories", JSON.stringify(customCategories));
  }, [customCategories]);

  useEffect(() => {
    localStorage.setItem("owes", JSON.stringify(owes));
  }, [owes]);

  useEffect(() => {
    localStorage.setItem("supabaseUrl", supabaseUrl);
    localStorage.setItem("supabaseAnonKey", supabaseAnonKey);
    localStorage.setItem("financeUserId", userId);
    localStorage.setItem("autoSync", JSON.stringify(autoSync));
  }, [supabaseUrl, supabaseAnonKey, userId, autoSync]);

  const allExpenseCategories = useMemo(
    () => [...baseExpenseCategories, ...customCategories],
    [customCategories]
  );

  const allBudgetCategories = useMemo(
    () => [...baseBudgetCategories, ...customCategories],
    [customCategories]
  );

  const supabase = useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) return null;
    try {
      return createClient(supabaseUrl, supabaseAnonKey);
    } catch {
      return null;
    }
  }, [supabaseUrl, supabaseAnonKey]);

  const sortedMonths = useMemo(() => {
    return Array.from(
      new Set(transactions.map((item) => monthKey(item.date)))
    ).sort();
  }, [transactions]);

  const monthlySnapshots = useMemo(() => {
    let runningSavings = 0;
    const snapshotMap = {};

    sortedMonths.forEach((month) => {
      const monthItems = transactions.filter(
        (item) => monthKey(item.date) === month
      );

      const income = monthItems
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + Number(item.amount), 0);

      const expense = monthItems
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + Number(item.amount), 0);

      const openingSavings = runningSavings;
      const netThisMonth = income - expense;
      const closingSavings = openingSavings + netThisMonth;

      snapshotMap[month] = {
        openingSavings,
        income,
        expense,
        netThisMonth,
        closingSavings,
      };

      runningSavings = closingSavings;
    });

    return snapshotMap;
  }, [transactions, sortedMonths]);

  const currentSnapshot = monthlySnapshots[selectedMonth] || {
    openingSavings: 0,
    income: 0,
    expense: 0,
    netThisMonth: 0,
    closingSavings: 0,
  };

  const monthTransactions = useMemo(() => {
    return transactions
      .filter((item) => monthKey(item.date) === selectedMonth)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedMonth]);

  const incomeTotal = currentSnapshot.income;
  const expenseTotal = currentSnapshot.expense;
  const carriedSavings = currentSnapshot.openingSavings;
  const savingsAmount = currentSnapshot.closingSavings;
  const netThisMonth = currentSnapshot.netThisMonth;

  const moneyGivenTotal = useMemo(() => {
    return monthTransactions
      .filter(
        (item) =>
          item.type === "expense" &&
          (item.category === "Money Given" ||
            item.category === "Send Home Money")
      )
      .reduce((sum, item) => sum + Number(item.amount), 0);
  }, [monthTransactions]);

  const essentialCategories = new Set([
    "Rent",
    "Bills",
    "Food",
    "Grocery",
    "Transport",
    "Subscriptions",
    "Room",
    "Health",
    "Money Given",
    "Send Home Money",
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
    return (netThisMonth / incomeTotal) * 100;
  }, [incomeTotal, netThisMonth]);

  const budgetStatus = useMemo(() => {
    return allBudgetCategories.map((name) => {
      const spent =
        categorySummary.find((item) => item.name === name)?.value || 0;
      const budget = Number(budgets[name] || 0);
      const remaining = budget - spent;
      const percent = budget > 0 ? (spent / budget) * 100 : 0;
      return { name, spent, budget, remaining, percent };
    });
  }, [categorySummary, budgets, allBudgetCategories]);

  const owesSummary = useMemo(() => {
    const map = {};

    owes.forEach((item) => {
      const person = item.person.trim();
      if (!person) return;

      if (!map[person]) {
        map[person] = {
          person,
          lent: 0,
          returned: 0,
          borrowed: 0,
          repaid: 0,
          pendingToReceive: 0,
          pendingToPay: 0,
        };
      }

      if (item.type === "lent") map[person].lent += Number(item.amount);
      if (item.type === "returned")
        map[person].returned += Number(item.amount);
      if (item.type === "borrowed")
        map[person].borrowed += Number(item.amount);
      if (item.type === "repaid") map[person].repaid += Number(item.amount);

      map[person].pendingToReceive = map[person].lent - map[person].returned;
      map[person].pendingToPay = map[person].borrowed - map[person].repaid;
    });

    return Object.values(map)
      .filter(
        (item) =>
          item.lent > 0 ||
          item.returned > 0 ||
          item.borrowed > 0 ||
          item.repaid > 0
      )
      .sort(
        (a, b) =>
          b.pendingToReceive +
          b.pendingToPay -
          (a.pendingToReceive + a.pendingToPay)
      );
  }, [owes]);

  const totalPendingToReceive = useMemo(() => {
    return owesSummary.reduce((sum, item) => sum + item.pendingToReceive, 0);
  }, [owesSummary]);

  const totalPendingToPay = useMemo(() => {
    return owesSummary.reduce((sum, item) => sum + item.pendingToPay, 0);
  }, [owesSummary]);

  const realNetWorth = useMemo(() => {
    return savingsAmount + totalPendingToReceive - totalPendingToPay;
  }, [savingsAmount, totalPendingToReceive, totalPendingToPay]);

  const aiInsights = useMemo(() => {
    const tips = [];
    const topCategory = categorySummary[0];

    if (incomeTotal <= 0) {
      tips.push(
        "Add your monthly income first so the app can calculate your real status."
      );
    }

    if (netThisMonth < 0) {
      tips.push(
        "This month is negative. Reduce lifestyle, shopping, and outgoing money first."
      );
    }

    if (savingsRate > 0 && savingsRate < 20) {
      tips.push(
        "Your monthly savings rate is low. Try to keep at least 20% of income untouched."
      );
    }

    if (moneyGivenTotal > incomeTotal * 0.15 && incomeTotal > 0) {
      tips.push(
        "Money given or sent is high compared to your income. Keep a limit."
      );
    }

    if (totalPendingToReceive > 0) {
      tips.push(
        `People still need to give you back ${formatQAR(totalPendingToReceive)}.`
      );
    }

    if (totalPendingToPay > 0) {
      tips.push(
        `You still need to pay back ${formatQAR(
          totalPendingToPay
        )}. Keep that amount reserved.`
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
    netThisMonth,
    savingsRate,
    moneyGivenTotal,
    totalPendingToReceive,
    totalPendingToPay,
    nonEssentialTotal,
    essentialTotal,
    budgetStatus,
    categorySummary,
  ]);

  const months = useMemo(() => {
    return Array.from(
      new Set(
        transactions
          .map((item) => monthKey(item.date))
          .concat(todayDate().slice(0, 7))
      )
    ).sort();
  }, [transactions]);

  const smartAlerts = useMemo(() => {
    const alerts = [];

    if (netThisMonth < 0) {
      alerts.push({
        type: "danger",
        title: "Negative month",
        text: `You are down ${formatQAR(Math.abs(netThisMonth))} this month.`,
      });
    }

    if (totalPendingToPay > 0) {
      alerts.push({
        type: "warning",
        title: "Repayments pending",
        text: `${formatQAR(totalPendingToPay)} still needs to be paid back.`,
      });
    }

    if (totalPendingToReceive > 0) {
      alerts.push({
        type: "info",
        title: "Money to receive",
        text: `${formatQAR(
          totalPendingToReceive
        )} is still pending from other people.`,
      });
    }

    budgetStatus
      .filter((item) => item.remaining < 0)
      .slice(0, 2)
      .forEach((item) => {
        alerts.push({
          type: "danger",
          title: `${item.name} over budget`,
          text: `Exceeded by ${formatQAR(Math.abs(item.remaining))}.`,
        });
      });

    if (savingsRate > 0 && savingsRate < 20) {
      alerts.push({
        type: "warning",
        title: "Low savings rate",
        text: `Current savings rate is ${Math.round(savingsRate)}%.`,
      });
    }

    return alerts;
  }, [
    netThisMonth,
    totalPendingToPay,
    totalPendingToReceive,
    budgetStatus,
    savingsRate,
  ]);

  useEffect(() => {
    if (!autoSync || !supabase || syncStatus === "syncing") return;

    const timeout = setTimeout(() => {
      pushToCloud(true);
    }, 1200);

    return () => clearTimeout(timeout);
  }, [transactions, budgets, owes, selectedMonth, autoSync, supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setNotificationPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (notificationPermission !== "granted" || smartAlerts.length === 0) return;

    const firstAlert = smartAlerts[0];
    const alertKey = `${firstAlert.title}-${firstAlert.text}-${selectedMonth}`;
    const lastAlert = localStorage.getItem("lastSmartAlert");

    if (lastAlert === alertKey) return;

    new Notification(firstAlert.title, { body: firstAlert.text });
    localStorage.setItem("lastSmartAlert", alertKey);
  }, [smartAlerts, notificationPermission, selectedMonth]);

  async function requestNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setNotificationPermission(result);
  }

  function sanitizeDecimal(value) {
    return value.replace(/[^0-9.]/g, "");
  }

  function addTransaction() {
    const parsedAmount = Number(amount);
    if (!title.trim() || !parsedAmount || parsedAmount <= 0) return;

    const safeDay = String(
      Math.min(Math.max(Number(entryDay) || 1, 1), 31)
    ).padStart(2, "0");

    const fullDate = `${entryYear}-${entryMonth}-${safeDay}`;
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
    setEntryYear(String(new Date().getFullYear()));
    setEntryMonth(String(new Date().getMonth() + 1).padStart(2, "0"));
    setEntryDay(String(new Date().getDate()).padStart(2, "0"));
    setNote("");
    setSelectedMonth(`${entryYear}-${entryMonth}`);
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

  function addNewCategory() {
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;

    const exists =
      baseExpenseCategories.includes(cleanName) ||
      customCategories.includes(cleanName);

    if (exists) {
      setNewCategoryName("");
      return;
    }

    setCustomCategories((prev) => [...prev, cleanName]);
    setBudgets((prev) => ({
      ...prev,
      [cleanName]: 0,
    }));
    setNewCategoryName("");
  }

  function addOweEntry() {
    const parsedAmount = Number(oweAmount);
    if (!oweName.trim() || !parsedAmount || parsedAmount <= 0) return;

    const safeDay = String(
      Math.min(Math.max(Number(oweDay) || 1, 1), 31)
    ).padStart(2, "0");

    const fullDate = `${oweYear}-${oweMonth}-${safeDay}`;

    const newOwe = {
      id: uid(),
      person: oweName.trim(),
      amount: parsedAmount,
      type: oweType,
      date: fullDate,
      note: oweNote.trim(),
    };

    setOwes((prev) => [newOwe, ...prev]);

    setOweName("");
    setOweAmount("");
    setOweType("lent");
    setOweYear(String(new Date().getFullYear()));
    setOweMonth(String(new Date().getMonth() + 1).padStart(2, "0"));
    setOweDay(String(new Date().getDate()).padStart(2, "0"));
    setOweNote("");
  }

  function removeOweEntry(id) {
    setOwes((prev) => prev.filter((item) => item.id !== id));
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

  async function pushToCloud(silent = false) {
    if (!supabase) {
      setSyncStatus("error");
      setSyncMessage("Supabase not connected");
      return;
    }

    setSyncStatus("syncing");
    if (!silent) setSyncMessage("Uploading data...");

    try {
      await supabase
        .from("finance_transactions")
        .delete()
        .eq("user_id", userId);

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

      if (budgetRows.length > 0) {
        const { error: budgetError } = await supabase
          .from("finance_budgets")
          .insert(budgetRows);

        if (budgetError) throw budgetError;
      }

      await supabase.from("finance_owes").delete().eq("user_id", userId);

      if (owes.length > 0) {
        const oweRows = owes.map((item) => ({
          id: item.id,
          user_id: userId,
          person: item.person,
          amount: item.amount,
          type: item.type,
          date: item.date,
          note: item.note,
        }));

        const { error: oweError } = await supabase
          .from("finance_owes")
          .insert(oweRows);

        if (oweError) throw oweError;
      }

      const { error: settingsError } = await supabase
        .from("finance_settings")
        .upsert(
          { user_id: userId, selected_month: selectedMonth },
          { onConflict: "user_id" }
        );

      if (settingsError) throw settingsError;

      setSyncStatus("connected");
      setSyncMessage(silent ? "Auto sync completed" : "Cloud sync completed");
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

      const { data: owesData, error: owesError } = await supabase
        .from("finance_owes")
        .select("id,person,amount,type,date,note")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (owesError) throw owesError;

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

      if (owesData) setOwes(owesData);

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
      <div className="stack">
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

        <div className="card">
          <div className="section-title">Money Tracking</div>
          {owesSummary.length === 0 ? (
            <div className="empty-text">No pending money records.</div>
          ) : (
            owesSummary.map((item) => (
              <div className="transaction-item" key={item.person}>
                <div className="transaction-left">
                  <div className="transaction-title">{item.person}</div>
                  <div className="transaction-meta">
                    <span>
                      They owe me: {formatQAR(item.pendingToReceive)}
                    </span>
                    <span>I owe them: {formatQAR(item.pendingToPay)}</span>
                  </div>
                </div>
                <div className="transaction-right">
                  <div className="amount income">
                    {formatQAR(item.pendingToReceive - item.pendingToPay)}
                  </div>
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
      <div className="stack">
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
            <CustomSelect
              value={category}
              onChange={setCategory}
              options={allExpenseCategories.map((option) => ({
                value: option,
                label: option,
              }))}
            />
          ) : null}

          <div className="grid-3">
            <CustomSelect
              value={entryYear}
              onChange={setEntryYear}
              options={Array.from({ length: 6 }, (_, index) => {
                const year = String(new Date().getFullYear() - 2 + index);
                return { value: year, label: year };
              })}
            />

            <CustomSelect
              value={entryMonth}
              onChange={setEntryMonth}
              options={Array.from({ length: 12 }, (_, index) => {
                const monthNumber = String(index + 1).padStart(2, "0");
                const label = new Date(`2026-${monthNumber}-01`).toLocaleString(
                  undefined,
                  { month: "long" }
                );
                return { value: monthNumber, label };
              })}
            />

            <CustomSelect
              value={entryDay}
              onChange={setEntryDay}
              options={Array.from({ length: 31 }, (_, index) => {
                const value = String(index + 1).padStart(2, "0");
                return { value, label: value };
              })}
            />
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

        <div className="card">
          <div className="section-title center">Track Loans and Borrowing</div>

          <input
            className="input"
            value={oweName}
            onChange={(e) => setOweName(e.target.value)}
            placeholder="Person name"
          />

          <input
            className="input"
            value={oweAmount}
            onChange={(e) => setOweAmount(sanitizeDecimal(e.target.value))}
            placeholder="Amount"
            inputMode="decimal"
          />

          <CustomSelect
            value={oweType}
            onChange={setOweType}
            options={[
              { value: "lent", label: "I gave money" },
              { value: "returned", label: "They paid me back" },
              { value: "borrowed", label: "I borrowed money" },
              { value: "repaid", label: "I paid them back" },
            ]}
          />

          <div className="grid-3">
            <CustomSelect
              value={oweYear}
              onChange={setOweYear}
              options={Array.from({ length: 6 }, (_, index) => {
                const year = String(new Date().getFullYear() - 2 + index);
                return { value: year, label: year };
              })}
            />

            <CustomSelect
              value={oweMonth}
              onChange={setOweMonth}
              options={Array.from({ length: 12 }, (_, index) => {
                const monthNumber = String(index + 1).padStart(2, "0");
                const label = new Date(`2026-${monthNumber}-01`).toLocaleString(
                  undefined,
                  { month: "long" }
                );
                return { value: monthNumber, label };
              })}
            />

            <CustomSelect
              value={oweDay}
              onChange={setOweDay}
              options={Array.from({ length: 31 }, (_, index) => {
                const value = String(index + 1).padStart(2, "0");
                return { value, label: value };
              })}
            />
          </div>

          <input
            className="input"
            value={oweNote}
            onChange={(e) => setOweNote(e.target.value)}
            placeholder="Note"
          />

          <button className="btn btn-dark full" onClick={addOweEntry}>
            Save Money Record
          </button>

          <div className="transaction-list" style={{ marginTop: "12px" }}>
            {owes.map((item) => (
              <div className="transaction-item" key={item.id}>
                <div className="transaction-left">
                  <div className="transaction-title">{item.person}</div>
                  <div className="transaction-meta">
                    <span className="pill">
                      {item.type === "lent"
                        ? "Given"
                        : item.type === "returned"
                        ? "Returned"
                        : item.type === "borrowed"
                        ? "Borrowed"
                        : "Repaid"}
                    </span>
                    <span>{item.date}</span>
                    {item.note ? <span>• {item.note}</span> : null}
                  </div>
                </div>
                <div className="transaction-right">
                  <div
                    className={
                      item.type === "lent" || item.type === "repaid"
                        ? "amount expense"
                        : "amount income"
                    }
                  >
                    {formatQAR(item.amount)}
                  </div>
                  <button
                    className="icon-btn"
                    onClick={() => removeOweEntry(item.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function renderPlan() {
    return (
      <div className="stack">
        <div className="card">
          <div className="section-title">Add New Budget Section</div>

          <div className="grid-2">
            <input
              className="input"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New section name"
            />

            <button className="btn btn-dark" onClick={addNewCategory}>
              Add Section
            </button>
          </div>
        </div>

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
                const percent =
                  expenseTotal > 0 ? (item.value / expenseTotal) * 100 : 0;
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
          <div className="tip">
            1. Savings carry forward automatically every month.
          </div>
          <div className="tip">
            2. Track both sides: people who owe you and money you borrowed.
          </div>
          <div className="tip">
            3. Real Net = savings + money to receive - money to pay.
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
            <button className="btn btn-dark" onClick={() => pushToCloud()}>
              Push
            </button>
            <button className="btn btn-light" onClick={pullFromCloud}>
              Pull
            </button>
          </div>

          <div className="grid-2">
            <button
              className={autoSync ? "btn btn-dark" : "btn btn-light"}
              onClick={() => setAutoSync((prev) => !prev)}
            >
              {autoSync ? "Auto Sync On" : "Auto Sync Off"}
            </button>
            <button
              className={
                notificationPermission === "granted"
                  ? "btn btn-dark"
                  : "btn btn-light"
              }
              onClick={requestNotificationPermission}
            >
              {notificationPermission === "granted"
                ? "Notifications On"
                : "Enable Alerts"}
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
            finance_owes(id text primary key, user_id text, person text, amount
            numeric, type text, date date, note text)
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
          <CustomSelect
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={months.map((item) => ({
              value: item,
              label: item,
            }))}
          />

          <div className={`sync-pill ${syncStatus}`}>
            {syncStatus.toUpperCase()}
          </div>
        </div>

        <div className="hero-card">
          <div className="hero-top">
            <div>
              <div className="hero-sub">Total Savings</div>
              <div className="hero-value">{formatQAR(savingsAmount)}</div>
              <div className="hero-note">
                Previous savings + this month result
              </div>
            </div>
            <div className="rate-box">
              <div className="hero-sub small-white">REAL NET</div>
              <div className="rate-value">{formatQAR(realNetWorth)}</div>
            </div>
          </div>

          <div className="stat-grid stat-grid-pro">
            <div className="stat-box">
              <div className="stat-label">Carry In</div>
              <div className="stat-value">{Math.round(carriedSavings)}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Income</div>
              <div className="stat-value">{Math.round(incomeTotal)}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">To Receive</div>
              <div className="stat-value">
                {Math.round(totalPendingToReceive)}
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">To Pay</div>
              <div className="stat-value">{Math.round(totalPendingToPay)}</div>
            </div>
          </div>
        </div>

        {smartAlerts.length > 0 && (
          <div className="card">
            <div className="section-title">Smart Alerts</div>
            {smartAlerts.slice(0, 3).map((alert, index) => (
              <div key={index} className={`tip alert-${alert.type}`}>
                <strong>{alert.title}</strong>
                <div>{alert.text}</div>
              </div>
            ))}
          </div>
        )}

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

        <div className="grid-2 summary-grid">
          <div className="summary-card">
            <div className="summary-label">People Owe Me</div>
            <div className="summary-value">
              {formatQAR(totalPendingToReceive)}
            </div>
            <div className="summary-note">Pending to receive</div>
          </div>
          <div className="summary-card">
            <div className="summary-label">I Need To Pay</div>
            <div className="summary-value">{formatQAR(totalPendingToPay)}</div>
            <div className="summary-note">Pending to repay</div>
          </div>
        </div>

        <div className="bottom-nav-wrap">
  <div className="tab-bar floating-tab-bar">
    <button
      className={activeTab === "home" ? "tab active" : "tab"}
      onClick={() => setActiveTab("home")}
    >
      <span className="tab-icon">⌂</span>
      <span className="tab-text">Home</span>
    </button>

    <button
      className={activeTab === "add" ? "tab active" : "tab"}
      onClick={() => setActiveTab("add")}
    >
      <span className="tab-icon">＋</span>
      <span className="tab-text">Add</span>
    </button>

    <button
      className={activeTab === "plan" ? "tab active" : "tab"}
      onClick={() => setActiveTab("plan")}
    >
      <span className="tab-icon">◉</span>
      <span className="tab-text">Plan</span>
    </button>

    <button
      className={activeTab === "charts" ? "tab active" : "tab"}
      onClick={() => setActiveTab("charts")}
    >
      <span className="tab-icon">▤</span>
      <span className="tab-text">Charts</span>
    </button>

    <button
      className={activeTab === "ai" ? "tab active" : "tab"}
      onClick={() => setActiveTab("ai")}
    >
      <span className="tab-icon">✦</span>
      <span className="tab-text">AI</span>
    </button>

    <button
      className={activeTab === "cloud" ? "tab active" : "tab"}
      onClick={() => setActiveTab("cloud")}
    >
      <span className="tab-icon">☁</span>
      <span className="tab-text">Cloud</span>
    </button>
  </div>
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