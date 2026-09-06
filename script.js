/* ================================
   Investment Demo - script.js
   ================================ */

const state = {
  balance: Number(localStorage.getItem("balance") || 0),
  attendance: JSON.parse(localStorage.getItem("attendance") || "[]"),
  purchased: JSON.parse(localStorage.getItem("purchased") || "[]"),
  rewards: JSON.parse(localStorage.getItem("rewards") || "[]"),
  deposits: JSON.parse(localStorage.getItem("deposits") || "[]"),
  withdrawals: JSON.parse(localStorage.getItem("withdrawals") || "[]"),
  transactions: JSON.parse(localStorage.getItem("transactions") || "[]"),
  month: new Date()
};

const products = [
  {
    id: 1,
    name: "Starter Plan",
    price: 500,
    daily: 25,
    days: 30,
    total: 750
  },
  {
    id: 2,
    name: "Growth Plan",
    price: 1000,
    daily: 60,
    days: 30,
    total: 1800
  },
  {
    id: 3,
    name: "Premium Plan",
    price: 5000,
    daily: 350,
    days: 30,
    total: 10500
  }
];

/* ---------- Storage ---------- */

function saveState() {
  localStorage.setItem("balance", state.balance);
  localStorage.setItem("attendance", JSON.stringify(state.attendance));
  localStorage.setItem("purchased", JSON.stringify(state.purchased));
  localStorage.setItem("rewards", JSON.stringify(state.rewards));
  localStorage.setItem("deposits", JSON.stringify(state.deposits));
  localStorage.setItem("withdrawals", JSON.stringify(state.withdrawals));
  localStorage.setItem("transactions", JSON.stringify(state.transactions));
}

/* ---------- Helpers ---------- */

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}

function createId(prefix = "TXN") {
  return (
    prefix +
    Date.now() +
    Math.floor(Math.random() * 1000)
  );
}

function addTransaction(type, amount, status = "Success") {
  state.transactions.unshift({
    id: createId("TXN"),
    type,
    amount: Number(amount),
    status,
    date: new Date().toLocaleString("en-IN")
  });
}

/* ---------- UI ---------- */

function updateUI() {
  const balanceElements = [
    document.getElementById("balance"),
    document.getElementById("homeBalance"),
    document.getElementById("withdrawBalance")
  ];

  balanceElements.forEach(el => {
    if (el) el.textContent = money(state.balance);
  });

  renderProducts();
  renderAttendance();
  renderRewards();
  renderDepositHistory();
  renderWithdrawHistory();
  renderTransactions();
}

/* ---------- Page Navigation ---------- */

function openPage(page) {
  document.querySelectorAll(".page").forEach(el => {
    el.classList.remove("active");
  });

  const target = document.getElementById(page);

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.remove("active");
  });

  const nav = document.querySelector(
    `.nav-item[data-page="${page}"]`
  );

  if (nav) {
    nav.classList.add("active");
  }

  if (page === "home") {
    updateUI();
  }
}

/* ---------- Products ---------- */

function renderProducts() {
  const box = document.getElementById("productsList");
  const homeBox = document.getElementById("homeProducts");

  if (!box && !homeBox) return;

  const html = products.map(product => `
    <div class="product-card">
      <div class="product-header">
        <div>
          <h3>${product.name}</h3>
          <small>30 Days Plan</small>
        </div>
        <span class="product-badge">ACTIVE</span>
      </div>

      <div class="product-info">
        <div>
          <span>Price</span>
          <strong>${money(product.price)}</strong>
        </div>

        <div>
          <span>Daily Income</span>
          <strong>${money(product.daily)}</strong>
        </div>

        <div>
          <span>Total Return</span>
          <strong>${money(product.total)}</strong>
        </div>
      </div>

      <button onclick="buyProduct(${product.id})">
        Buy Plan
      </button>
    </div>
  `).join("");

  if (box) box.innerHTML = html;

  if (homeBox) {
    homeBox.innerHTML = products.slice(0, 2)
      .map(product => `
        <div class="product-card">
          <h3>${product.name}</h3>
          <p>${money(product.price)}</p>
          <button onclick="buyProduct(${product.id})">
            Buy Now
          </button>
        </div>
      `).join("");
  }
}

function buyProduct(id) {
  const product = products.find(p => p.id === id);

  if (!product) return;

  if (state.balance < product.price) {
    alert("Insufficient demo balance.");
    showDeposit();
    return;
  }

  state.balance -= product.price;

  state.purchased.unshift({
    id: createId("PLAN"),
    productId: product.id,
    name: product.name,
    price: product.price,
    daily: product.daily,
    date: new Date().toLocaleString("en-IN")
  });

  addTransaction(
    "Plan Purchase",
    product.price,
    "Success"
  );

  saveState();
  updateUI();

  alert(`${product.name} purchased successfully.`);
}

/* ---------- Deposit ---------- */

function showDeposit() {
  openPage("deposit");
}

function submitDeposit() {
  const amountInput = document.getElementById("depositAmount");
  const utrInput = document.getElementById("utr");

  if (!amountInput || !utrInput) return;

  const amount = Number(amountInput.value);
  const utr = utrInput.value.trim();

  if (!amount || amount <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  if (!utr) {
    alert("Please enter UTR number.");
    return;
  }

  const deposit = {
    id: createId("DEP"),
    amount,
    utr,
    status: "Pending",
    date: new Date().toLocaleString("en-IN")
  };

  state.deposits.unshift(deposit);

  addTransaction(
    "Deposit",
    amount,
    "Pending"
  );

  saveState();

  amountInput.value = "";
  utrInput.value = "";

  const screenshot =
    document.getElementById("paymentScreenshot");

  if (screenshot) screenshot.value = "";

  renderDepositHistory();
  renderTransactions();

  alert(
    "Deposit request submitted successfully.\nStatus: Pending"
  );

  openPage("depositHistory");
}

/* ---------- Withdrawal ---------- */

function showWithdrawal() {
  openPage("withdraw");
}

function submitWithdrawal() {
  const amountInput =
    document.getElementById("withdrawAmount");

  const bankName =
    document.getElementById("bankName");

  const accountNumber =
    document.getElementById("accountNumber");

  const confirmAccount =
    document.getElementById("confirmAccount");

  const bank =
    document.getElementById("bank");

  const ifsc =
    document.getElementById("ifsc");

  if (!amountInput) return;

  const amount = Number(amountInput.value);

  if (!amount || amount <= 0) {
    alert("Please enter a valid withdrawal amount.");
    return;
  }

  if (amount > state.balance) {
    alert("Insufficient demo balance.");
    return;
  }

  if (
    accountNumber &&
    confirmAccount &&
    accountNumber.value !== confirmAccount.value
  ) {
    alert("Account numbers do not match.");
    return;
  }

  if (bankName && !bankName.value.trim()) {
    alert("Please enter bank name.");
    return;
  }

  if (accountNumber && !accountNumber.value.trim()) {
    alert("Please enter account number.");
    return;
  }

  state.balance -= amount;

  const withdrawal = {
    id: createId("WD"),
    amount,
    bankName: bankName ? bankName.value.trim() : "",
    accountNumber: accountNumber
      ? accountNumber.value.trim()
      : "",
    bank: bank ? bank.value.trim() : "",
    ifsc: ifsc ? ifsc.value.trim() : "",
    status: "Pending",
    date: new Date().toLocaleString("en-IN")
  };

  state.withdrawals.unshift(withdrawal);

  addTransaction(
    "Withdrawal",
    amount,
    "Pending"
  );

  saveState();
  updateUI();

  [
    amountInput,
    bankName,
    accountNumber,
    confirmAccount,
    bank,
    ifsc
  ].forEach(el => {
    if (el) el.value = "";
  });

  alert(
    "Withdrawal request submitted successfully.\nStatus: Pending"
  );

  openPage("withdrawHistory");
}

/* ---------- Attendance ---------- */

function renderAttendance() {
  const calendar = document.getElementById("calendar");
  const title = document.getElementById("monthTitle");

  if (!calendar) return;

  const year = state.month.getFullYear();
  const month = state.month.getMonth();

  const monthName = state.month.toLocaleString(
    "en-IN",
    {
      month: "long",
      year: "numeric"
    }
  );

  if (title) {
    title.textContent = monthName;
  }

  const firstDay = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();

  let html = "";

  const headings = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat"
  ];

  headings.forEach(day => {
    html += `<div class="calendar-heading">${day}</div>`;
  });

  for (let i = 0; i < firstDay; i++) {
    html += `<div class="calendar-empty"></div>`;
  }

  for (let day = 1; day <= days; day++) {
    const key =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const marked = state.attendance.includes(key);

    html += `
      <div
        class="calendar-day ${marked ? "present" : ""}"
        onclick="markAttendance('${key}')"
      >
        ${day}
      </div>
    `;
  }

  calendar.innerHTML = html;

  const total =
    document.getElementById("attendanceTotal");

  if (total) {
    total.textContent = state.attendance.length;
  }
}

function markAttendance(dateKey) {
  const today = new Date();

  const todayKey =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;

  if (dateKey !== todayKey) {
    alert("Attendance can only be marked for today.");
    return;
  }

  if (state.attendance.includes(dateKey)) {
    alert("Attendance already marked today.");
    return;
  }

  state.attendance.push(dateKey);

  state.rewards.unshift({
    id: createId("REWARD"),
    title: "Daily Attendance Reward",
    amount: 10,
    date: new Date().toLocaleString("en-IN")
  });

  state.balance += 10;

  addTransaction(
    "Attendance Reward",
    10,
    "Success"
  );

  saveState();
  updateUI();

  alert("Attendance marked! ₹10 demo reward added.");
}

function changeMonth(direction) {
  state.month.setMonth(
    state.month.getMonth() + direction
  );

  renderAttendance();
}

/* ---------- Rewards ---------- */

function renderRewards() {
  const box = document.getElementById("rewardsList");

  if (!box) return;

  if (!state.rewards.length) {
    box.innerHTML = `
      <div class="empty-state">
        No rewards yet.
      </div>
    `;
    return;
  }

  box.innerHTML = state.rewards.map(reward => `
    <div class="history-item">
      <div>
        <strong>${reward.title}</strong>
        <small>${reward.date}</small>
      </div>

      <strong>+${money(reward.amount)}</strong>
    </div>
  `).join("");
}

/* ---------- Deposit History ---------- */

function renderDepositHistory() {
  const box =
    document.getElementById("depositHistory");

  if (!box) return;

  if (!state.deposits.length) {
    box.innerHTML = `
      <div class="empty-state">
        No deposit records found.
      </div>
    `;
    return;
  }

  box.innerHTML = state.deposits.map(item => `
    <div class="history-item">
      <div>
        <strong>${money(item.amount)}</strong>
        <small>UTR: ${item.utr}</small>
        <small>${item.date}</small>
      </div>

      <span class="status ${item.status.toLowerCase()}">
        ${item.status}
      </span>
    </div>
  `).join("");
}

/* ---------- Withdrawal History ---------- */

function renderWithdrawHistory() {
  const box =
    document.getElementById("withdrawHistory");

  if (!box) return;

  if (!state.withdrawals.length) {
    box.innerHTML = `
      <div class="empty-state">
        No withdrawal records found.
      </div>
    `;
    return;
  }

  box.innerHTML = state.withdrawals.map(item => `
    <div class="history-item">
      <div>
        <strong>${money(item.amount)}</strong>
        <small>${item.bankName || "Bank"}</small>
        <small>${item.date}</small>
      </div>

      <span class="status ${item.status.toLowerCase()}">
        ${item.status}
      </span>
    </div>
  `).join("");
}

/* ---------- Transactions ---------- */

function renderTransactions() {
  const box =
    document.getElementById("transactions");

  if (!box) return;

  if (!state.transactions.length) {
    box.innerHTML = `
      <div class="empty-state">
        No transactions yet.
      </div>
    `;
    return;
  }

  box.innerHTML = state.transactions.map(item => `
    <div class="history-item">
      <div>
        <strong>${item.type}</strong>
        <small>${item.id}</small>
        <small>${item.date}</small>
      </div>

      <div>
        <strong>${money(item.amount)}</strong>
        <span class="status ${item.status.toLowerCase()}">
          ${item.status}
        </span>
      </div>
    </div>
  `).join("");
}

/* ---------- Other Buttons ---------- */

function customerService() {
  alert("Customer service is available in this demo.");
}

function downloadApp() {
  alert("App download is not available in this demo.");
}

function inviteNow() {
  const text =
    "Join me on this Investment Demo platform.";

  if (navigator.share) {
    navigator.share({
      title: "Investment Demo",
      text
    }).catch(() => {});
  } else {
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Invite text copied."));
  }
}

function closeModal() {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.remove("show");
  }
}

/* ---------- Edit Profile ---------- */

function editProfile() {
  const modal = document.getElementById("modal");

  if (modal) {
    modal.classList.add("show");
  }
}

/* ---------- Deposit Shortcut ---------- */

function openDeposit() {
  showDeposit();
}

/* ---------- Initialize ---------- */

document.addEventListener("DOMContentLoaded", () => {
  updateUI();

  // Default page
  const home = document.getElementById("home");

  if (home) {
    openPage("home");
  }
});
