import { useState } from "react";
import "./App.css";

const API_URL = "https://banking-backend-api-py.onrender.com";


function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [activePage, setActivePage] = useState("dashboard");

  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [balance, setBalance] = useState("");
  const [accountType, setAccountType] = useState("saving");

  const [showAccounts, setShowAccounts] = useState(false);
  const [accounts, setAccounts] = useState([]);

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAccount, setDepositAccount] = useState("");
  const [depositAmount, setDepositAmount] = useState("");

  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAccount, setWithdrawAccount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [showTransactions, setShowTransactions] = useState(false);
  const [transactionAccount, setTransactionAccount] = useState("");
  const [transactions, setTransactions] = useState([]);

  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    const cleanUsername = username.trim();

    if (!isLogin && !fullName.trim()) {
      setMessage("Full name is required");
      return;
    }

    if (!cleanUsername) {
      setMessage("Username is required");
      return;
    }

    if (cleanUsername.length < 3) {
      setMessage("Username must be at least 3 characters");
      return;
    }

    const usernamePattern = /^[a-zA-Z0-9_]+$/;

    if (!usernamePattern.test(cleanUsername)) {
      setMessage(
        "Username can contain only letters, numbers and underscore"
      );
      return;
    }

    if (!password) {
      setMessage("Password is required");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    const url = isLogin
      ? `${API_URL}/login`
      : `${API_URL}/register`;
    try {
      const response = await fetch(url, {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          username: cleanUsername,
          password: password
        })
      });

      const data = await response.json();

      if (data.success && isLogin) {
        setLoggedIn(true);
        setActivePage("dashboard");
        setMessage("");
      } else if (data.success && !isLogin) {
        setMessage("Registration successful! Please login.");

        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setFullName("");

        setIsLogin(true);
      } else {
        setMessage(data.message || "Something went wrong");
      }
    } catch {
      setMessage("Backend server is not running");
    }
  };

  const createAccount = async () => {
    if (!accountName || !balance) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/accounts`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            name: accountName,
            balance: Number(balance),
            account_type: accountType
          })
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (data.success) {
        setAccountName("");
        setBalance("");
        setAccountType("saving");
        setShowCreateAccount(false);
        setActivePage("dashboard");
      }
    } catch {
      setMessage("Backend server is not running");
    }
  };

  const getAccounts = async () => {
    try {
      const response = await fetch(
        `${API_URL}/accounts`
      );

      const data = await response.json();

      if (data.success) {
        setAccounts(data.accounts);

        setShowAccounts(true);
        setShowCreateAccount(false);
        setShowDeposit(false);
        setShowWithdraw(false);
        setShowTransactions(false);
      }
    } catch {
      setMessage("Backend server is not running");
    }
  };

  const depositMoney = async () => {
    if (!depositAccount || !depositAmount) {
      setMessage("Please enter account number and amount");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/accounts/${depositAccount}/deposit`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            amount: Number(depositAmount)
          })
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (data.success) {
        setDepositAccount("");
        setDepositAmount("");
        setShowDeposit(false);
        setActivePage("dashboard");
      }
    } catch {
      setMessage("Backend server is not running");
    }
  };

  const withdrawMoney = async () => {
    if (!withdrawAccount || !withdrawAmount) {
      setMessage("Please enter account number and amount");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/accounts/${withdrawAccount}/withdraw`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            amount: Number(withdrawAmount)
          })
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (data.success) {
        setWithdrawAccount("");
        setWithdrawAmount("");
        setShowWithdraw(false);
        setActivePage("dashboard");
      }
    } catch {
      setMessage("Backend server is not running");
    }
  };

  const getTransactions = async () => {
    if (!transactionAccount) {
      setMessage("Please enter account number");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/accounts/${transactionAccount}/transactions`
      );

      const data = await response.json();

      if (!data.success) {
        setMessage(data.message);
        return;
      }

      setTransactions(data.transactions);

      setShowTransactions(true);
      setShowAccounts(false);
      setShowCreateAccount(false);
      setShowDeposit(false);
      setShowWithdraw(false);
    } catch {
      setMessage("Backend server is not running");
    }
  };

  const deleteAccount = async (accountNumber) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete account ${accountNumber}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/accounts/${accountNumber}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (data.success) {
        getAccounts();
      }
    } catch {
      setMessage("Backend server is not running");
    }
  };

  // =========================
  // HELPER
  // =========================

  const clearPanels = () => {
    setShowAccounts(false);
    setShowCreateAccount(false);
    setShowDeposit(false);
    setShowWithdraw(false);
    setShowTransactions(false);
  };

  // =========================
  // DASHBOARD
  // =========================

  if (loggedIn) {
    return (
      <div className="dashboard">

        <aside className="sidebar">

          <div className="brand">

            <div className="brand-icon">
              ₹
            </div>

            <div>
              <h2>FinBank</h2>
              <span>Banking System</span>
            </div>

          </div>

          <nav>

            <button
              className={`nav-btn ${
                activePage === "dashboard" ? "active" : ""
              }`}
              onClick={() => {
                setActivePage("dashboard");
                clearPanels();
              }}
            >
              🏠 Dashboard
            </button>

            <button
              className={`nav-btn ${
                activePage === "create" ? "active" : ""
              }`}
              onClick={() => {
                setActivePage("create");

                setShowCreateAccount(true);
                setShowAccounts(false);
                setShowDeposit(false);
                setShowWithdraw(false);
                setShowTransactions(false);
              }}
            >
              💳 Create Account
            </button>

            <button
              className={`nav-btn ${
                activePage === "accounts" ? "active" : ""
              }`}
              onClick={() => {
                setActivePage("accounts");
                getAccounts();
              }}
            >
              👥 All Accounts
            </button>

            <button
              className={`nav-btn ${
                activePage === "deposit" ? "active" : ""
              }`}
              onClick={() => {
                setActivePage("deposit");

                setShowDeposit(true);
                setShowAccounts(false);
                setShowCreateAccount(false);
                setShowWithdraw(false);
                setShowTransactions(false);
              }}
            >
              ⬇ Deposit
            </button>

            <button
              className={`nav-btn ${
                activePage === "withdraw" ? "active" : ""
              }`}
              onClick={() => {
                setActivePage("withdraw");

                setShowWithdraw(true);
                setShowAccounts(false);
                setShowCreateAccount(false);
                setShowDeposit(false);
                setShowTransactions(false);
              }}
            >
              ⬆ Withdraw
            </button>

            <button
              className={`nav-btn ${
                activePage === "transactions" ? "active" : ""
              }`}
              onClick={() => {
                setActivePage("transactions");

                setShowTransactions(true);
                setShowAccounts(false);
                setShowCreateAccount(false);
                setShowDeposit(false);
                setShowWithdraw(false);
              }}
            >
              📄 Transactions
            </button>

          </nav>

          <button
            className="logout-btn"
            onClick={() => {
              setLoggedIn(false);
              setActivePage("dashboard");
              clearPanels();
            }}
          >
            🚪 Logout
          </button>

        </aside>

        <main className="main-content">

          <header className="topbar">

            <div>
              <p className="small-text">
                Welcome back,
              </p>

              <h1>
                {username}
              </h1>
            </div>

            <div className="profile">

              <div className="avatar">
                {username.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>
                  {username}
                </strong>

                <span>
                  Customer
                </span>
              </div>

            </div>

          </header>

          {message && (
            <div className="message">
              {message}
            </div>
          )}

          {!showCreateAccount &&
            !showAccounts &&
            !showDeposit &&
            !showWithdraw &&
            !showTransactions && (

              <>

                <section className="welcome-card">

                  <div>
                    <p>
                      Banking Management System
                    </p>

                    <h2>
                      Manage your money with confidence.
                    </h2>

                    <span>
                      Create accounts, manage transactions
                      and track your banking activity.
                    </span>
                  </div>

                  <div className="card-symbol">
                    ₹
                  </div>

                </section>

                <section className="stats">

                  <div className="stat-card">

                    <div className="stat-icon">
                      💳
                    </div>

                    <div>
                      <span>
                        Total Accounts
                      </span>

                      <h2>
                        Manage
                      </h2>
                    </div>

                  </div>

                  <div className="stat-card">

                    <div className="stat-icon">
                      ⬇
                    </div>

                    <div>
                      <span>
                        Deposit
                      </span>

                      <h2>
                        Quick Action
                      </h2>
                    </div>

                  </div>

                  <div className="stat-card">

                    <div className="stat-icon">
                      ⬆
                    </div>

                    <div>
                      <span>
                        Withdraw
                      </span>

                      <h2>
                        Quick Action
                      </h2>
                    </div>

                  </div>

                </section>

                <section className="quick-actions">

                  <h2>
                    Quick Actions
                  </h2>

                  <div className="action-grid">

                    <button
                      onClick={() => {
                        setActivePage("create");

                        setShowCreateAccount(true);
                        setShowAccounts(false);
                        setShowDeposit(false);
                        setShowWithdraw(false);
                        setShowTransactions(false);
                      }}
                    >
                      <span>💳</span>

                      <strong>
                        Create Account
                      </strong>

                      <small>
                        Open a new bank account
                      </small>
                    </button>

                    <button
                      onClick={() => {
                        setActivePage("accounts");
                        getAccounts();
                      }}
                    >
                      <span>
                        👥
                      </span>

                      <strong>
                        View Accounts
                      </strong>

                      <small>
                        View all customer accounts
                      </small>
                    </button>

                    <button
                      onClick={() => {
                        setActivePage("deposit");

                        setShowDeposit(true);
                        setShowAccounts(false);
                        setShowCreateAccount(false);
                        setShowWithdraw(false);
                        setShowTransactions(false);
                      }}
                    >
                      <span>
                        ⬇
                      </span>

                      <strong>
                        Deposit Money
                      </strong>

                      <small>
                        Add money to an account
                      </small>
                    </button>

                    <button
                      onClick={() => {
                        setActivePage("withdraw");

                        setShowWithdraw(true);
                        setShowAccounts(false);
                        setShowCreateAccount(false);
                        setShowDeposit(false);
                        setShowTransactions(false);
                      }}
                    >
                      <span>
                        ⬆
                      </span>

                      <strong>
                        Withdraw Money
                      </strong>

                      <small>
                        Withdraw money safely
                      </small>
                    </button>

                  </div>

                </section>

              </>
            )}

          {/* CREATE ACCOUNT */}

          {showCreateAccount && (

            <section className="panel">

              <div className="panel-header">

                <h2>
                  Create Bank Account
                </h2>

                <p>
                  Open a new savings or current account.
                </p>

              </div>

              <div className="form-grid">

                <div className="input-group">

                  <label>
                    Account Holder Name
                  </label>

                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={accountName}
                    onChange={(e) =>
                      setAccountName(e.target.value)
                    }
                  />

                </div>

                <div className="input-group">

                  <label>
                    Initial Balance
                  </label>

                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={balance}
                    onChange={(e) =>
                      setBalance(e.target.value)
                    }
                  />

                </div>

                <div className="input-group">

                  <label>
                    Account Type
                  </label>

                  <select
                    value={accountType}
                    onChange={(e) =>
                      setAccountType(e.target.value)
                    }
                  >
                    <option value="saving">
                      Saving Account
                    </option>

                    <option value="current">
                      Current Account
                    </option>
                  </select>

                </div>

              </div>

              <div className="form-actions">

                <button
                  className="primary-btn"
                  onClick={createAccount}
                >
                  Create Account
                </button>

                <button
                  className="secondary-btn"
                  onClick={() => {
                    setShowCreateAccount(false);
                    setActivePage("dashboard");
                  }}
                >
                  Cancel
                </button>

              </div>

            </section>
          )}

          {/* ALL ACCOUNTS */}

          {showAccounts && (

            <section className="panel">

              <div className="panel-header">

                <h2>
                  All Accounts
                </h2>

                <p>
                  Manage all registered bank accounts.
                </p>

              </div>

              <div className="accounts-grid">

                {accounts.length === 0 ? (

                  <p>
                    No accounts found.
                  </p>

                ) : (

                  accounts.map((account) => (

                    <div
                      className="account-card"
                      key={account.account_number}
                    >

                      <div className="account-top">

                        <span>
                          {account.account_type}
                        </span>

                        <strong>
                          #{account.account_number}
                        </strong>

                      </div>

                      <h3>
                        {account.name}
                      </h3>

                      <p>
                        Available Balance
                      </p>

                      <h2>
                        ₹{account.balance.toLocaleString()}
                      </h2>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteAccount(
                            account.account_number
                          )
                        }
                      >
                        🗑 Delete Account
                      </button>

                    </div>

                  ))
                )}

              </div>

            </section>
          )}

          {/* DEPOSIT */}

          {showDeposit && (

            <section className="panel">

              <div className="panel-header">

                <h2>
                  Deposit Money
                </h2>

                <p>
                  Add money to a customer account.
                </p>

              </div>

              <div className="form-grid">

                <div className="input-group">

                  <label>
                    Account Number
                  </label>

                  <input
                    type="number"
                    placeholder="Enter account number"
                    value={depositAccount}
                    onChange={(e) =>
                      setDepositAccount(e.target.value)
                    }
                  />

                </div>

                <div className="input-group">

                  <label>
                    Deposit Amount
                  </label>

                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) =>
                      setDepositAmount(e.target.value)
                    }
                  />

                </div>

              </div>

              <button
                className="primary-btn"
                onClick={depositMoney}
              >
                Deposit Money
              </button>

            </section>
          )}

          {/* WITHDRAW */}

          {showWithdraw && (

            <section className="panel">

              <div className="panel-header">

                <h2>
                  Withdraw Money
                </h2>

                <p>
                  Withdraw money from a customer account.
                </p>

              </div>

              <div className="form-grid">

                <div className="input-group">

                  <label>
                    Account Number
                  </label>

                  <input
                    type="number"
                    placeholder="Enter account number"
                    value={withdrawAccount}
                    onChange={(e) =>
                      setWithdrawAccount(e.target.value)
                    }
                  />

                </div>

                <div className="input-group">

                  <label>
                    Withdrawal Amount
                  </label>

                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) =>
                      setWithdrawAmount(e.target.value)
                    }
                  />

                </div>

              </div>

              <button
                className="primary-btn"
                onClick={withdrawMoney}
              >
                Withdraw Money
              </button>

            </section>
          )}

          {/* TRANSACTIONS */}

          {showTransactions && (

            <section className="panel">

              <div className="panel-header">

                <h2>
                  Transaction History
                </h2>

                <p>
                  View deposits and withdrawals.
                </p>

              </div>

              <div className="transaction-search">

                <input
                  type="number"
                  placeholder="Enter account number"
                  value={transactionAccount}
                  onChange={(e) =>
                    setTransactionAccount(e.target.value)
                  }
                />

                <button
                  className="primary-btn"
                  onClick={getTransactions}
                >
                  Search
                </button>

              </div>

              <div className="transactions">

                {transactions.length === 0 ? (

                  <p>
                    No transactions found.
                  </p>

                ) : (

                  transactions.map(
                    (transaction, index) => (

                      <div
                        className="transaction"
                        key={index}
                      >

                        <div>

                          <strong>
                            {transaction.type === "deposit"
                              ? "Money Deposited"
                              : "Money Withdrawn"
                            }
                          </strong>

                          <small>
                            {transaction.date}
                          </small>

                        </div>

                        <strong
                          className={
                            transaction.type === "deposit"
                              ? "deposit-text"
                              : "withdraw-text"
                          }
                        >
                          {transaction.type === "deposit"
                            ? "+"
                            : "-"
                          }

                          ₹{transaction.amount}
                        </strong>

                      </div>

                    )
                  )
                )}

              </div>

            </section>
          )}

        </main>

      </div>
    );
  }

  // =========================
  // LOGIN / REGISTER PAGE
  // =========================

  return (

    <div className="auth-page">

      {/* LEFT BRAND */}

      <div className="auth-brand">

        <div className="brand-logo">
          ₹
        </div>

        <h1>
          FinBank
        </h1>

        <p>
          Simple, secure and smart banking
          management for everyone.
        </p>

        <div className="security-text">

          <span>
            🔒
          </span>

          <div>
            <strong>
              Secure Banking
            </strong>

            <br />

            <small>
              Your data stays protected
            </small>
          </div>

        </div>

      </div>

      {/* RIGHT CONTENT */}

      <div className="auth-content">

        <div className="auth-box">

          <h2>
            {isLogin
              ? "Welcome Back"
              : "Create Account"
            }
          </h2>

          <p className="auth-subtitle">
            {isLogin
              ? "Login to continue to your banking dashboard"
              : "Create your FinBank account in a few seconds"
            }
          </p>

          <div className="blue-line"></div>

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}

            {!isLogin && (

              <div className="input-group">

                <label>
                  Full Name
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    👤
                  </span>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                  />

                </div>

              </div>

            )}

            {/* USERNAME */}

            <div className="input-group">

              <label>
                Username
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  👤
                </span>

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value)
                  }
                />

              </div>

            </div>

            {/* PASSWORD */}

            <div className="input-group">

              <label>
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"
                  }
                </button>

              </div>

            </div>

            {/* CONFIRM PASSWORD */}

            {!isLogin && (

              <div className="input-group">

                <label>
                  Confirm Password
                </label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    🔐
                  </span>

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                  />

                  <button
                    type="button"
                    className="show-password"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"
                    }
                  </button>

                </div>

              </div>

            )}

            {/* LOGIN OPTIONS */}

            {isLogin && (

              <div className="auth-options">

                <label className="remember">

                  <input
                    type="checkbox"
                  />

                  Remember me

                </label>

                <button
                  type="button"
                  className="forgot-btn"
                  onClick={() =>
                    setMessage(
                      "Please contact the administrator to reset your password."
                    )
                  }
                >
                  Forgot password?
                </button>

              </div>

            )}

            {/* MAIN BUTTON */}

            <button
              className="main-auth-btn"
              type="submit"
            >
              {isLogin
                ? "Login to FinBank →"
                : "Create FinBank Account →"
              }
            </button>

          </form>

          <div className="or-section">

            <span></span>

            <p>
              OR
            </p>

            <span></span>

          </div>

          <button
            className="switch-auth-btn"
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage("");
              setPassword("");
              setConfirmPassword("");
            }}
          >

            <span>
              {isLogin ? "＋" : "←"}
            </span>

            {isLogin
              ? "Create a new account"
              : "Already have an account? Login"
            }

          </button>

        </div>

        {/* BOTTOM FEATURES */}

        <div className="auth-features">

          <div className="feature">

            <span>
              🔒
            </span>

            <div>
              <strong>
                Secure
              </strong>

              <br />

              <small>
                Protected banking
              </small>
            </div>

          </div>

          <div className="feature">

            <span>
              ⚡
            </span>

            <div>
              <strong>
                Fast
              </strong>

              <br />

              <small>
                Quick transactions
              </small>
            </div>

          </div>

          <div className="feature">

            <span>
              💳
            </span>

            <div>
              <strong>
                Easy
              </strong>

              <br />

              <small>
                Simple management
              </small>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default App;