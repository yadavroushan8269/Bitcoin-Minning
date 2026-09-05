const API_URL =
  "https://script.google.com/macros/s/AKfycby6bTl_tUL1STJtWO8jQaXzjQSOhDLgvxj_2UWuI6VJBhh0ehwpCFSlQMhpDn57MfNtow/exec";

const UPI_ID = "yadav-rishab@fam";
const SUPPORT_URL = "https://t.me/Hammerff7gcz";

const STORAGE_KEY = "nsgWellfareData";

let data = {
  balance: 0,
  deposits: [],
  withdrawals: [],
  transactions: [],
  attendance: {},
  rewards: []
};

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      data = Object.assign(data, JSON.parse(saved));
    }
  } catch (e) {
    console.log(e);
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function money(n) {
  return Number(n || 0).toFixed(2);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openPage(page) {
  document.querySelectorAll(".page").forEach(p => {
    p.classList.remove("active");
  });

  const el = document.getElementById(page);

  if (el) {
    el.classList.add("active");
  }

  updateBalances();

  if (page === "home") {
    renderHomeProducts();
  }

  if (page === "products") {
    renderProducts();
  }

  if (page === "attendance") {
    renderCalendar();
  }

  if (page === "rewards") {
    renderRewards();
  }

  if (page === "depositHistory") {
    renderDepositHistory();
  }

  if (page === "withdrawHistory") {
    renderWithdrawHistory();
  }

  if (page === "transactions") {
    renderTransactions();
  }

  window.scrollTo(0, 0);
}

function updateBalances() {
  const home = document.getElementById("homeBalance");
  const info = document.getElementById("infoBalance");
  const withdraw = document.getElementById("withdrawBalance");

  if (home) home.textContent = money(data.balance);
  if (info) info.textContent = money(data.balance);
  if (withdraw) withdraw.textContent = money(data.balance);
}

function showModal(title, content) {
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalContent").innerHTML = content;
  document.getElementById("modal").classList.add("show");
}

function closeModal() {
  document.getElementById("modal").classList.remove("show");
}

function customerService() {
  window.open(SUPPORT_URL, "_blank");
}

function downloadApp() {
  showModal(
    "NSG Wellfare",
    "<p>App download option will be available here.</p>"
  );
}

function inviteNow() {
  const text = encodeURIComponent(
    "Join NSG Wellfare and manage your investment easily."
  );

  window.open("https://wa.me/?text=" + text, "_blank");
}

function copyUPI() {
  navigator.clipboard
    .writeText(UPI_ID)
    .then(() => alert("UPI ID copied"))
    .catch(() => alert("UPI ID: " + UPI_ID));
}


/* =========================
   PRODUCTS
========================= */

const products = [
  {
    name: "Starter Plan",
    amount: 500,
    daily: 15,
    days: 30
  },
  {
    name: "Growth Plan",
    amount: 1000,
    daily: 35,
    days: 30
  },
  {
    name: "Premium Plan",
    amount: 5000,
    daily: 200,
    days: 30
  },
  {
    name: "Elite Plan",
    amount: 10000,
    daily: 450,
    days: 30
  }
];

function productHTML(p) {
  return `
    <div class="product-card">
      <h3>${escapeHTML(p.name)}</h3>
      <p>Investment: ₹${money(p.amount)}</p>
      <p>Daily Return: ₹${money(p.daily)}</p>
      <p>Duration: ${p.days} Days</p>
      <button onclick="selectProduct(${p.amount})">
        Invest ₹${money(p.amount)}
      </button>
    </div>
  `;
}

function renderHomeProducts() {
  const box = document.getElementById("homeProducts");

  if (!box) return;

  box.innerHTML = products
    .slice(0, 2)
    .map(productHTML)
    .join("");
}

function renderProducts() {
  const box = document.getElementById("productsList");

  if (!box) return;

  box.innerHTML = products.map(productHTML).join("");
}

function selectProduct(amount) {
  showModal(
    "Investment",
    `
      <p>Selected investment amount: <b>₹${money(amount)}</b></p>
      <button class="submit-btn"
        onclick="closeModal(); showDeposit(); document.getElementById('depositAmount').value=${amount};">
        Continue to Deposit
      </button>
    `
  );
}


/* =========================
   DEPOSIT
========================= */

function showDeposit() {
  openPage("deposit");
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}

async function submitDeposit() {
  const amount = Number(
    document.getElementById("depositAmount").value
  );

  const utr = document.getElementById("utr").value.trim();

  const screenshot =
    document.getElementById("paymentScreenshot").files[0];

  if (!amount || amount < 500 || amount > 20000) {
    alert("Deposit amount ₹500 se ₹20,000 ke beech hona chahiye.");
    return;
  }

  if (!utr) {
    alert("UTR / Transaction ID enter karein.");
    return;
  }

  if (!screenshot) {
    alert("Payment screenshot select karein.");
    return;
  }

  if (screenshot.size > 3 * 1024 * 1024) {
    alert("Screenshot 3MB se kam hona chahiye.");
    return;
  }

  const btn = document.getElementById("depositSubmitBtn");

  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const imageBase64 = await fileToBase64(screenshot);

    const requestId =
      "DEP-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 8);

    const result = await apiPost({
      action: "createDeposit",
      requestId,
      amount,
      utr,
      screenshot: imageBase64
    });

    if (!result || result.ok !== true) {
      throw new Error(
        result?.message || "Deposit request failed"
      );
    }

    data.deposits.unshift({
      requestId,
      amount,
      utr,
      status: "PENDING",
      createdAt: new Date().toISOString()
    });

    saveData();
    renderDepositHistory();

    alert(
      "Deposit request submit ho gaya.\n\nAdmin verification ke baad balance update hoga."
    );

    document.getElementById("depositAmount").value = "";
    document.getElementById("utr").value = "";
    document.getElementById("paymentScreenshot").value = "";

    openPage("depositHistory");

    pollDeposit(requestId);

  } catch (error) {
    console.error(error);
    alert("Deposit submit nahi hua: " + error.message);
  }

  btn.disabled = false;
  btn.textContent = "Submit Deposit";
}


/* =========================
   WITHDRAWAL
========================= */

function showWithdrawal() {
  openPage("withdraw");
}

async function submitWithdrawal() {
  const amount = Number(
    document.getElementById("withdrawAmount").value
  );

  const holder =
    document.getElementById("bankName").value.trim();

  const account =
    document.getElementById("accountNumber").value.trim();

  const confirmAccount =
    document.getElementById("confirmAccount").value.trim();

  const bank =
    document.getElementById("bank").value.trim();

  const ifsc =
    document.getElementById("ifsc").value.trim();

  if (!amount || amount < 300 || amount > 10000) {
    alert("Withdrawal amount ₹300 se ₹10,000 ke beech hona chahiye.");
    return;
  }

  if (amount > Number(data.balance)) {
    alert("Insufficient balance.");
    return;
  }

  if (!holder || !account || !confirmAccount || !bank || !ifsc) {
    alert("Sabhi bank details fill karein.");
    return;
  }

  if (account !== confirmAccount) {
    alert("Account number match nahi kar raha.");
    return;
  }

  const btn = document.getElementById("withdrawSubmitBtn");

  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const requestId =
      "WDR-" +
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 8);

    const result = await apiPost({
      action: "createWithdrawal",
      requestId,
      amount,
      accountHolder: holder,
      accountNumber: account,
      bankName: bank,
      ifsc
    });

    if (!result || result.ok !== true) {
      throw new Error(
        result?.message || "Withdrawal request failed"
      );
    }

    data.withdrawals.unshift({
      requestId,
      amount,
      accountHolder: holder,
      accountNumber: account,
      bankName: bank,
      ifsc,
      status: "PENDING",
      createdAt: new Date().toISOString()
    });

    saveData();
    renderWithdrawHistory();

    alert(
      "Withdrawal request admin ko bhej diya gaya hai.\n\nAdmin payment verify karke process karega."
    );

    document.getElementById("withdrawAmount").value = "";
    document.getElementById("bankName").value = "";
    document.getElementById("accountNumber").value = "";
    document.getElementById("confirmAccount").value = "";
    document.getElementById("bank").value = "";
    document.getElementById("ifsc").value = "";

    openPage("withdrawHistory");

    pollWithdrawal(requestId);

  } catch (error) {
    console.error(error);
    alert("Withdrawal submit nahi hua: " + error.message);
  }

  btn.disabled = false;
  btn.textContent = "Submit Withdrawal";
}


/* =========================
   API
========================= */

async function apiPost(payload) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid server response");
  }
}

async function apiGet(params) {
  const url =
    API_URL +
    "?" +
    new URLSearchParams(params).toString();

  const response = await fetch(url);
  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Invalid server response");
  }
}


/* =========================
   STATUS POLLING
========================= */

async function pollDeposit(requestId) {
  try {
    const result = await apiGet({
      action: "depositStatus",
      requestId
    });

    if (result && result.ok) {
      updateDepositStatus(
        requestId,
        String(result.status || "").toUpperCase()
      );
    }
  } catch (e) {
    console.log("Deposit status:", e);
  }
}

function updateDepositStatus(requestId, status) {
  const item = data.deposits.find(
    x => x.requestId === requestId
  );

  if (!item) return;

  const oldStatus = item.status;

  item.status = status;

  if (
    status === "APPROVED" &&
    oldStatus !== "APPROVED"
  ) {
    data.balance += Number(item.amount);

    data.transactions.unshift({
      type: "DEPOSIT",
      amount: Number(item.amount),
      status: "APPROVED",
      createdAt: new Date().toISOString()
    });
  }

  saveData();
  updateBalances();
  renderDepositHistory();
  renderTransactions();
}

async function pollWithdrawal(requestId) {
  try {
    const result = await apiGet({
      action: "withdrawalStatus",
      requestId
    });

    if (result && result.ok) {
      updateWithdrawalStatus(
        requestId,
        String(result.status || "").toUpperCase()
      );
    }
  } catch (e) {
    console.log("Withdrawal status:", e);
  }
}

function updateWithdrawalStatus(requestId, status) {
  const item = data.withdrawals.find(
    x => x.requestId === requestId
  );

  if (!item) return;

  const oldStatus = item.status;

  item.status = status;

  if (
    status === "REJECTED" &&
    oldStatus !== "REJECTED"
  ) {
    data.balance += Number(item.amount);
  }

  if (
    (status === "PAID" || status === "APPROVED") &&
    oldStatus === "PENDING"
  ) {
    data.transactions.unshift({
      type: "WITHDRAWAL",
      amount: Number(item.amount),
      status,
      createdAt: new Date().toISOString()
    });
  }

  saveData();
  updateBalances();
  renderWithdrawHistory();
  renderTransactions();
}


/* =========================
   HISTORY
========================= */

function statusClass(status) {
  const s = String(status).toLowerCase();

  if (s === "approved") return "approved";
  if (s === "paid") return "paid";
  if (s === "rejected") return "rejected";

  return "pending";
}

function renderDepositHistory() {
  const box = document.getElementById(
    "depositHistoryList"
  );

  if (!box) return;

  if (!data.deposits.length) {
    box.innerHTML =
      '<div class="empty">No deposit history</div>';
    return;
  }

  box.innerHTML = data.deposits.map(item => `
    <div class="history-card">
      <b>Deposit ₹${money(item.amount)}</b>
      <p>UTR: ${escapeHTML(item.utr)}</p>
      <small>${new Date(item.createdAt).toLocaleString()}</small>
      <br>
      <span class="status ${statusClass(item.status)}">
        ${escapeHTML(item.status)}
      </span>
    </div>
  `).join("");
}

function renderWithdrawHistory() {
  const box = document.getElementById(
    "withdrawHistoryList"
  );

  if (!box) return;

  if (!data.withdrawals.length) {
    box.innerHTML =
      '<div class="empty">No withdrawal history</div>';
    return;
  }

  box.innerHTML = data.withdrawals.map(item => `
    <div class="history-card">
      <b>Withdrawal ₹${money(item.amount)}</b>
      <p>Bank: ${escapeHTML(item.bankName)}</p>
      <p>Account: ****${escapeHTML(
        item.accountNumber.slice(-4)
      )}</p>
      <small>${new Date(item.createdAt).toLocaleString()}</small>
      <br>
      <span class="status ${statusClass(item.status)}">
        ${escapeHTML(item.status)}
      </span>
    </div>
  `).join("");
}

function renderTransactions() {
  const box =
    document.getElementById("transactionList");

  if (!box) return;

  if (!data.transactions.length) {
    box.innerHTML =
      '<div class="empty">No transactions</div>';
    return;
  }

  box.innerHTML = data.transactions.map(item => `
    <div class="history-card">
      <b>${escapeHTML(item.type)}</b>
      <p>₹${money(item.amount)}</p>
      <span class="status ${statusClass(item.status)}">
        ${escapeHTML(item.status)}
      </span>
      <br>
      <small>
        ${new Date(item.createdAt).toLocaleString()}
      </small>
    </div>
  `).join("");
}


/* =========================
   ATTENDANCE
========================= */

function changeMonth(diff) {
  currentMonth += diff;

  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }

  renderCalendar();
}

function renderCalendar() {
  const calendar =
    document.getElementById("calendar");

  const title =
    document.getElementById("monthTitle");

  const total =
    document.getElementById("attendanceTotal");

  if (!calendar) return;

  const firstDay =
    new Date(currentYear, currentMonth, 1).getDay();

  const days =
    new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthName =
    new Date(
      currentYear,
      currentMonth
    ).toLocaleString("en-IN", {
      month: "long",
      year: "numeric"
    });

  title.textContent = monthName;

  let html = "";

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    .forEach(day => {
      html += `<div class="day-head">${day}</div>`;
    });

  for (let i = 0; i < firstDay; i++) {
    html += "<div></div>";
  }

  let count = 0;

  for (let d = 1; d <= days; d++) {
    const key =
      `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const today =
      new Date().toISOString().slice(0, 10);

    let cls = "day";

    if (data.attendance[key]) {
      cls += " present";
      count++;
    } else if (key < today) {
      cls += " past";
    }

    if (key === today) {
      cls += " today";
    }

    html += `
      <div
        class="${cls}"
        onclick="markAttendance('${key}')">
        ${d}
      </div>
    `;
  }

  calendar.innerHTML = html;

  if (total) {
    total.textContent = count;
  }
}

function markAttendance(key) {
  const today =
    new Date().toISOString().slice(0, 10);

  if (key !== today) {
    alert("Sirf aaj ki attendance mark ki ja sakti hai.");
    return;
  }

  if (data.attendance[key]) {
    alert("Aaj ki attendance already marked hai.");
    return;
  }

  data.attendance[key] = true;

  saveData();
  renderCalendar();

  alert("Attendance marked successfully.");
}


/* =========================
   REWARDS
========================= */

function renderRewards() {
  const box =
    document.getElementById("rewardsList");

  if (!box) return;

  const rewards = [
    {
      title: "Daily Login",
      reward: "₹5"
    },
    {
      title: "7 Days Attendance",
      reward: "₹50"
    },
    {
      title: "Invite Friends",
      reward: "Special Reward"
    }
  ];

  box.innerHTML = rewards.map(r => `
    <div class="reward-card">
      <h3>🎁 ${escapeHTML(r.title)}</h3>
      <p>Reward: <b>${escapeHTML(r.reward)}</b></p>
    </div>
  `).join("");
}


/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  updateBalances();
  renderHomeProducts();
  renderProducts();
  renderCalendar();
  renderRewards();
  renderDepositHistory();
  renderWithdrawHistory();
  renderTransactions();

  openPage("home");
});
