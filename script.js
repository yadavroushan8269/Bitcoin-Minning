/* =========================================================
   NSG WELLFARE - FRONTEND SCRIPT
   ========================================================= */

const DEPOSIT_API_URL =
  "https://script.google.com/macros/s/AKfycby6bTl_tUL1STJtWO8jQaXzjQSOhDLgvxj_2UWuI6VJBhh0ehwpCFSlQMhpDn57MfNtow/exec";

const CUSTOMER_SERVICE =
  "https://t.me/Hammerff7gcz";

const UPI_ID = "yadav-rishab@fam";

const MIN_DEPOSIT = 500;
const MAX_DEPOSIT = 20000;
const MIN_WITHDRAWAL = 300;

const STORAGE_KEY = "nsgWellfareData";


/* =========================================================
   STORAGE
   ========================================================= */

function getData() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const data = {
      userKey: generateUserKey(),
      balance: 0,
      deposits: [],
      withdrawals: [],
      attendance: {},
      rewards: [],
      transactions: [],
      bank: {}
    };

    saveData(data);
    return data;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    const data = {
      userKey: generateUserKey(),
      balance: 0,
      deposits: [],
      withdrawals: [],
      attendance: {},
      rewards: [],
      transactions: [],
      bank: {}
    };

    saveData(data);
    return data;
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateUserKey() {
  return (
    "NSG-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
}

function getUserKey() {
  const data = getData();
  return data.userKey;
}


/* =========================================================
   COMMON HELPERS
   ========================================================= */

function money(value) {
  return "₹" + Number(value || 0).toLocaleString("en-IN");
}

function todayKey() {
  const d = new Date();

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}

function createRequestId(prefix) {
  return (
    prefix +
    "-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).substring(2, 7).toUpperCase()
  );
}

function escapeHTML(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showMessage(message, type = "info") {
  let box = document.getElementById("toast");

  if (!box) {
    box = document.createElement("div");
    box.id = "toast";

    box.style.position = "fixed";
    box.style.left = "50%";
    box.style.bottom = "85px";
    box.style.transform = "translateX(-50%)";
    box.style.zIndex = "99999";
    box.style.padding = "12px 18px";
    box.style.borderRadius = "12px";
    box.style.fontSize = "14px";
    box.style.fontWeight = "600";
    box.style.maxWidth = "90%";
    box.style.textAlign = "center";

    document.body.appendChild(box);
  }

  box.textContent = message;

  if (type === "success") {
    box.style.background = "#166534";
    box.style.color = "#fff";
  } else if (type === "error") {
    box.style.background = "#b91c1c";
    box.style.color = "#fff";
  } else {
    box.style.background = "#1f2937";
    box.style.color = "#fff";
  }

  box.style.display = "block";

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {
    box.style.display = "none";
  }, 3000);
}

function formatDate(value) {
  if (!value) return "-";

  const d = new Date(value);

  if (isNaN(d.getTime())) return value;

  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.style.display = "none";
  });

  const page = document.getElementById(pageId);

  if (page) {
    page.style.display = "block";
  }

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.remove("active");
  });

  const nav = document.querySelector(
    `[data-page="${pageId}"]`
  );

  if (nav) {
    nav.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageId === "home") {
    updateHome();
  }

  if (pageId === "deposit") {
    updateDepositPage();
  }

  if (pageId === "withdrawal") {
    updateWithdrawalPage();
  }

  if (pageId === "attendance") {
    renderCalendar();
  }

  if (pageId === "history") {
    renderHistory();
  }

  if (pageId === "transactions") {
    renderTransactions();
  }

  if (pageId === "my-info") {
    renderMyInfo();
  }
}


/* =========================================================
   HOME
   ========================================================= */

function updateHome() {
  const data = getData();

  const balanceElements = [
    "balance",
    "homeBalance",
    "availableBalance"
  ];

  balanceElements.forEach(id => {
    const el = document.getElementById(id);

    if (el) {
      el.textContent = money(data.balance);
    }
  });

  const userId = document.getElementById("userId");

  if (userId) {
    userId.textContent = data.userKey;
  }
}


/* =========================================================
   COPY UPI
   ========================================================= */

function copyUPI() {
  navigator.clipboard
    .writeText(UPI_ID)
    .then(() => {
      showMessage("UPI ID copied successfully", "success");
    })
    .catch(() => {
      const input = document.createElement("input");
      input.value = UPI_ID;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();

      showMessage("UPI ID copied", "success");
    });
}


/* =========================================================
   DEPOSIT
   ========================================================= */

function updateDepositPage() {
  const data = getData();

  const balance = document.getElementById("depositBalance");

  if (balance) {
    balance.textContent = money(data.balance);
  }

  const upi = document.getElementById("upiId");

  if (upi) {
    upi.textContent = UPI_ID;
  }
}

async function submitDeposit() {
  const amountInput = document.getElementById("depositAmount");
  const utrInput = document.getElementById("utr");
  const screenshotInput =
    document.getElementById("paymentScreenshot");

  if (!amountInput || !utrInput || !screenshotInput) {
    showMessage("Deposit form nahi mila", "error");
    return;
  }

  const amount = Number(amountInput.value);
  const utr = utrInput.value.trim();
  const file = screenshotInput.files[0];

  if (!amount || amount < MIN_DEPOSIT || amount > MAX_DEPOSIT) {
    showMessage(
      `Deposit amount ₹${MIN_DEPOSIT} se ₹${MAX_DEPOSIT} ke beech hona chahiye`,
      "error"
    );
    return;
  }

  if (!utr || utr.length < 6) {
    showMessage("Valid UTR / Transaction ID enter karein", "error");
    return;
  }

  if (!file) {
    showMessage("Payment screenshot select karein", "error");
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    showMessage("Screenshot maximum 3 MB ka hona chahiye", "error");
    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    showMessage(
      "Sirf JPG, PNG ya WebP screenshot allowed hai",
      "error"
    );
    return;
  }

  const button =
    document.getElementById("depositSubmitBtn");

  if (button) {
    button.disabled = true;
    button.textContent = "Submitting...";
  }

  try {
    const base64 = await fileToBase64(file);

    const requestId = createRequestId("DEP");

    const payload = {
      action: "createDeposit",
      requestId: requestId,
      userKey: getUserKey(),
      amount: amount,
      utr: utr,
      screenshot: base64,
      screenshotName: file.name,
      screenshotType: file.type
    };

    const response = await fetch(DEPOSIT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || "Deposit request failed");
    }

    const data = getData();

    data.deposits.unshift({
      requestId: requestId,
      amount: amount,
      utr: utr,
      status: "PENDING",
      createdAt: new Date().toISOString()
    });

    data.transactions.unshift({
      type: "DEPOSIT",
      requestId: requestId,
      amount: amount,
      status: "PENDING",
      createdAt: new Date().toISOString()
    });

    saveData(data);

    amountInput.value = "";
    utrInput.value = "";
    screenshotInput.value = "";

    showMessage(
      "Deposit request submit ho gaya. Admin verification ke baad balance update hoga.",
      "success"
    );

    updateHome();
    renderHistory();
    renderTransactions();

    startDepositPolling(requestId);
  } catch (error) {
    console.error(error);

    showMessage(
      "Deposit submit nahi hua. Internet aur Apps Script deployment check karein.",
      "error"
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Submit Deposit Request";
    }
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
}


/* =========================================================
   DEPOSIT STATUS POLLING
   ========================================================= */

function startDepositPolling(requestId) {
  let attempts = 0;

  const timer = setInterval(async () => {
    attempts++;

    try {
      const url =
        DEPOSIT_API_URL +
        "?action=depositStatus" +
        "&requestId=" +
        encodeURIComponent(requestId) +
        "&userKey=" +
        encodeURIComponent(getUserKey());

      const response = await fetch(url);
      const result = await response.json();

      if (!result.ok) return;

      if (
        result.status === "APPROVED" ||
        result.status === "REJECTED"
      ) {
        clearInterval(timer);

        updateDepositLocalStatus(
          requestId,
          result.status,
          result.reviewedAt
        );

        if (result.status === "APPROVED") {
          showMessage(
            "Deposit approved. Balance update ho gaya.",
            "success"
          );
        } else {
          showMessage(
            "Deposit request reject kar diya gaya.",
            "error"
          );
        }

        updateHome();
        renderHistory();
        renderTransactions();
      }
    } catch (error) {
      console.log("Status check:", error);
    }

    if (attempts >= 120) {
      clearInterval(timer);
    }
  }, 5000);
}

function updateDepositLocalStatus(
  requestId,
  status,
  reviewedAt
) {
  const data = getData();

  const deposit = data.deposits.find(
    item => item.requestId === requestId
  );

  if (!deposit) return;

  if (deposit.status === "APPROVED") {
    return;
  }

  const oldStatus = deposit.status;

  deposit.status = status;
  deposit.reviewedAt =
    reviewedAt || new Date().toISOString();

  if (status === "APPROVED" && oldStatus !== "APPROVED") {
    data.balance += Number(deposit.amount);

    data.transactions.unshift({
      type: "DEPOSIT",
      requestId: requestId,
      amount: Number(deposit.amount),
      status: "APPROVED",
      createdAt: new Date().toISOString()
    });
  }

  if (status === "REJECTED") {
    data.transactions.unshift({
      type: "DEPOSIT",
      requestId: requestId,
      amount: Number(deposit.amount),
      status: "REJECTED",
      createdAt: new Date().toISOString()
    });
  }

  saveData(data);
}


/* =========================================================
   WITHDRAWAL
   ========================================================= */

function updateWithdrawalPage() {
  const data = getData();

  const balance = document.getElementById(
    "withdrawBalance"
  );

  if (balance) {
    balance.textContent = money(data.balance);
  }

  const bank = data.bank || {};

  const holder =
    document.getElementById("accountHolderName");

  const account =
    document.getElementById("accountNumber");

  const confirm =
    document.getElementById("confirmAccountNumber");

  const bankName =
    document.getElementById("bankName");

  const ifsc =
    document.getElementById("ifsc");

  if (holder && bank.holderName) {
    holder.value = bank.holderName;
  }

  if (account && bank.accountNumber) {
    account.value = bank.accountNumber;
  }

  if (confirm && bank.accountNumber) {
    confirm.value = bank.accountNumber;
  }

  if (bankName && bank.bankName) {
    bankName.value = bank.bankName;
  }

  if (ifsc && bank.ifsc) {
    ifsc.value = bank.ifsc;
  }
}

async function submitWithdrawal() {
  const amountInput =
    document.getElementById("withdrawAmount");

  const holderInput =
    document.getElementById("accountHolderName");

  const accountInput =
    document.getElementById("accountNumber");

  const confirmInput =
    document.getElementById("confirmAccountNumber");

  const bankInput =
    document.getElementById("bankName");

  const ifscInput =
    document.getElementById("ifsc");

  if (
    !amountInput ||
    !holderInput ||
    !accountInput ||
    !confirmInput ||
    !bankInput ||
    !ifscInput
  ) {
    showMessage("Withdrawal form nahi mila", "error");
    return;
  }

  const amount = Number(amountInput.value);

  const holder = holderInput.value.trim();
  const account = accountInput.value.trim();
  const confirmAccount = confirmInput.value.trim();
  const bank = bankInput.value.trim();
  const ifsc = ifscInput.value.trim().toUpperCase();

  const data = getData();

  if (!amount || amount < MIN_WITHDRAWAL) {
    showMessage(
      `Minimum withdrawal ${money(MIN_WITHDRAWAL)} hai`,
      "error"
    );
    return;
  }

  if (amount > data.balance) {
    showMessage("Insufficient balance", "error");
    return;
  }

  if (holder.length < 2) {
    showMessage("Account holder name enter karein", "error");
    return;
  }

  if (!account || account.length < 6) {
    showMessage("Valid account number enter karein", "error");
    return;
  }

  if (account !== confirmAccount) {
    showMessage(
      "Account number match nahi kar raha",
      "error"
    );
    return;
  }

  if (bank.length < 2) {
    showMessage("Bank name enter karein", "error");
    return;
  }

  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

  if (!ifscRegex.test(ifsc)) {
    showMessage("Valid IFSC code enter karein", "error");
    return;
  }

  const button =
    document.getElementById("withdrawSubmitBtn");

  if (button) {
    button.disabled = true;
    button.textContent = "Submitting...";
  }

  try {
    const requestId = createRequestId("WDR");

    const payload = {
      action: "createWithdrawal",
      requestId: requestId,
      userKey: getUserKey(),
      amount: amount,
      holderName: holder,
      accountNumber: account,
      bankName: bank,
      ifsc: ifsc
    };

    const response = await fetch(DEPOSIT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(
        result.error || "Withdrawal request failed"
      );
    }

    /*
      Reserve the amount locally.
      Backend admin will manually pay and mark PAID.
    */

    data.balance -= amount;

    data.bank = {
      holderName: holder,
      accountNumber: account,
      bankName: bank,
      ifsc: ifsc
    };

    data.withdrawals.unshift({
      requestId: requestId,
      amount: amount,
      holderName: holder,
      accountNumber: account,
      bankName: bank,
      ifsc: ifsc,
      status: "PENDING",
      createdAt: new Date().toISOString()
    });

    data.transactions.unshift({
      type: "WITHDRAWAL",
      requestId: requestId,
      amount: amount,
      status: "PENDING",
      createdAt: new Date().toISOString()
    });

    saveData(data);

    amountInput.value = "";

    showMessage(
      "Withdrawal request submit ho gaya. Admin payment verify karega.",
      "success"
    );

    updateHome();
    updateWithdrawalPage();
    renderHistory();
    renderTransactions();

    startWithdrawalPolling(requestId);
  } catch (error) {
    console.error(error);

    showMessage(
      "Withdrawal request submit nahi hua. Server/deployment check karein.",
      "error"
    );
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = "Submit Withdrawal Request";
    }
  }
}


/* =========================================================
   WITHDRAWAL STATUS
   ========================================================= */

function startWithdrawalPolling(requestId) {
  let attempts = 0;

  const timer = setInterval(async () => {
    attempts++;

    try {
      const url =
        DEPOSIT_API_URL +
        "?action=withdrawalStatus" +
        "&requestId=" +
        encodeURIComponent(requestId) +
        "&userKey=" +
        encodeURIComponent(getUserKey());

      const response = await fetch(url);
      const result = await response.json();

      if (!result.ok) return;

      if (
        result.status === "PAID" ||
        result.status === "REJECTED"
      ) {
        clearInterval(timer);

        updateWithdrawalLocalStatus(
          requestId,
          result.status,
          result.reviewedAt
        );

        if (result.status === "PAID") {
          showMessage(
            "Withdrawal paid successfully.",
            "success"
          );
        } else {
          showMessage(
            "Withdrawal rejected. Amount balance me return kar diya gaya.",
            "error"
          );
        }

        updateHome();
        updateWithdrawalPage();
        renderHistory();
        renderTransactions();
      }
    } catch (error) {
      console.log("Withdrawal status:", error);
    }

    if (attempts >= 120) {
      clearInterval(timer);
    }
  }, 5000);
}

function updateWithdrawalLocalStatus(
  requestId,
  status,
  reviewedAt
) {
  const data = getData();

  const withdrawal = data.withdrawals.find(
    item => item.requestId === requestId
  );

  if (!withdrawal) return;

  if (
    withdrawal.status === "PAID" ||
    withdrawal.status === "REJECTED"
  ) {
    return;
  }

  withdrawal.status = status;
  withdrawal.reviewedAt =
    reviewedAt || new Date().toISOString();

  if (status === "REJECTED") {
    data.balance += Number(withdrawal.amount);
  }

  data.transactions.unshift({
    type: "WITHDRAWAL",
    requestId: requestId,
    amount: Number(withdrawal.amount),
    status: status,
    createdAt: new Date().toISOString()
  });

  saveData(data);
}


/* =========================================================
   ATTENDANCE
   ========================================================= */

function renderCalendar() {
  const container =
    document.getElementById("calendar");

  if (!container) return;

  const data = getData();

  const now = new Date();

  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  let html = "";

  html += `
    <div class="calendar-header">
      ${now.toLocaleString("en-IN", {
        month: "long",
        year: "numeric"
      })}
    </div>
  `;

  html += `
    <div class="calendar-week">
      <div>Sun</div>
      <div>Mon</div>
      <div>Tue</div>
      <div>Wed</div>
      <div>Thu</div>
      <div>Fri</div>
      <div>Sat</div>
    </div>
  `;

  html += `<div class="calendar-grid">`;

  for (let i = 0; i < firstDay.getDay(); i++) {
    html += `<div class="calendar-empty"></div>`;
  }

  for (
    let day = 1;
    day <= lastDay.getDate();
    day++
  ) {
    const key =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const attended = !!data.attendance[key];

    const date = new Date(year, month, day);

    const isFuture = date > now;

    let cls = "calendar-day";

    if (attended) {
      cls += " attended";
    } else {
      cls += " missed";
    }

    if (isFuture) {
      cls += " future";
    }

    html += `
      <button
        class="${cls}"
        ${isFuture ? "disabled" : ""}
        onclick="markAttendance('${key}')"
      >
        ${day}
      </button>
    `;
  }

  html += `</div>`;

  container.innerHTML = html;
}

function markAttendance(dateKey) {
  const data = getData();

  if (data.attendance[dateKey]) {
    showMessage(
      "Aaj ki attendance already marked hai",
      "info"
    );
    return;
  }

  const today = todayKey();

  if (dateKey !== today) {
    showMessage(
      "Sirf current date ki attendance mark kar sakte hain",
      "error"
    );
    return;
  }

  data.attendance[dateKey] = true;

  data.rewards.unshift({
    date: dateKey,
    amount: 0,
    type: "Attendance",
    createdAt: new Date().toISOString()
  });

  saveData(data);

  renderCalendar();

  showMessage(
    "Attendance marked successfully",
    "success"
  );
}


/* =========================================================
   REWARDS
   ========================================================= */

function renderRewards() {
  const container =
    document.getElementById("rewardsList");

  if (!container) return;

  const data = getData();

  if (!data.rewards.length) {
    container.innerHTML = `
      <div class="empty-state">
        No rewards yet
      </div>
    `;
    return;
  }

  container.innerHTML = data.rewards
    .map(reward => {
      return `
        <div class="history-card">
          <div>
            <strong>${escapeHTML(reward.type)}</strong>
            <small>${escapeHTML(reward.date)}</small>
          </div>

          <strong>${money(reward.amount)}</strong>
        </div>
      `;
    })
    .join("");
}


/* =========================================================
   PRODUCTS
   ========================================================= */

const PRODUCTS = [
  {
    id: 1,
    name: "Starter Plan",
    price: 500,
    daily: 15,
    days: 30
  },
  {
    id: 2,
    name: "Growth Plan",
    price: 1000,
    daily: 35,
    days: 30
  },
  {
    id: 3,
    name: "Premium Plan",
    price: 5000,
    daily: 200,
    days: 30
  },
  {
    id: 4,
    name: "Elite Plan",
    price: 10000,
    daily: 450,
    days: 30
  }
];

function renderProducts() {
  const container =
    document.getElementById("productsList");

  if (!container) return;

  container.innerHTML = PRODUCTS
    .map(product => {
      return `
        <div class="product-card">

          <div class="product-title">
            ${escapeHTML(product.name)}
          </div>

          <div class="product-price">
            ${money(product.price)}
          </div>

          <div class="product-info">
            <span>Daily</span>
            <strong>${money(product.daily)}</strong>
          </div>

          <div class="product-info">
            <span>Duration</span>
            <strong>${product.days} Days</strong>
          </div>

          <button
            class="primary-btn"
            onclick="buyProduct(${product.id})"
          >
            Select Plan
          </button>

        </div>
      `;
    })
    .join("");
}

function buyProduct(id) {
  const product =
    PRODUCTS.find(item => item.id === id);

  if (!product) return;

  showMessage(
    `${product.name} select kiya gaya. Deposit aur activation admin verification ke baad hoga.`,
    "info"
  );
}


/* =========================================================
   HISTORY
   ========================================================= */

function renderHistory() {
  const container =
    document.getElementById("historyList");

  if (!container) return;

  const data = getData();

  const deposits = data.deposits.map(item => ({
    type: "Deposit",
    amount: item.amount,
    status: item.status,
    id: item.requestId,
    date: item.createdAt
  }));

  const withdrawals = data.withdrawals.map(item => ({
    type: "Withdrawal",
    amount: item.amount,
    status: item.status,
    id: item.requestId,
    date: item.createdAt
  }));

  const all = [...deposits, ...withdrawals]
    .sort(
      (a, b) =>
        new Date(b.date) - new Date(a.date)
    );

  if (!all.length) {
    container.innerHTML = `
      <div class="empty-state">
        No transaction history
      </div>
    `;
    return;
  }

  container.innerHTML = all
    .map(item => {
      return `
        <div class="history-card">

          <div>
            <strong>${escapeHTML(item.type)}</strong>

            <small>
              ${escapeHTML(item.id)}
            </small>

            <small>
              ${formatDate(item.date)}
            </small>
          </div>

          <div class="history-right">

            <strong>
              ${money(item.amount)}
            </strong>

            <span class="status ${String(item.status).toLowerCase()}">
              ${escapeHTML(item.status)}
            </span>

          </div>

        </div>
      `;
    })
    .join("");
}


/* =========================================================
   TRANSACTIONS
   ========================================================= */

function renderTransactions() {
  const container =
    document.getElementById("transactionsList");

  if (!container) return;

  const data = getData();

  if (!data.transactions.length) {
    container.innerHTML = `
      <div class="empty-state">
        No transactions yet
      </div>
    `;
    return;
  }

  container.innerHTML = data.transactions
    .map(tx => {
      const isDeposit =
        tx.type === "DEPOSIT";

      return `
        <div class="transaction-card">

          <div class="transaction-icon">
            ${isDeposit ? "↓" : "↑"}
          </div>

          <div class="transaction-details">

            <strong>
              ${isDeposit ? "Deposit" : "Withdrawal"}
            </strong>

            <small>
              ${formatDate(tx.createdAt)}
            </small>

            <small>
              ${escapeHTML(tx.requestId)}
            </small>

          </div>

          <div class="transaction-amount">

            <strong>
              ${isDeposit ? "+" : "-"}${money(tx.amount)}
            </strong>

            <span class="status ${String(tx.status).toLowerCase()}">
              ${escapeHTML(tx.status)}
            </span>

          </div>

        </div>
      `;
    })
    .join("");
}


/* =========================================================
   MY INFO
   ========================================================= */

function renderMyInfo() {
  const data = getData();

  const userId =
    document.getElementById("myUserId");

  const balance =
    document.getElementById("myBalance");

  if (userId) {
    userId.textContent = data.userKey;
  }

  if (balance) {
    balance.textContent = money(data.balance);
  }

  const bank = data.bank || {};

  const bankHolder =
    document.getElementById("savedBankHolder");

  const bankAccount =
    document.getElementById("savedBankAccount");

  const bankName =
    document.getElementById("savedBankName");

  const bankIFSC =
    document.getElementById("savedBankIFSC");

  if (bankHolder) {
    bankHolder.textContent =
      bank.holderName || "Not saved";
  }

  if (bankAccount) {
    bankAccount.textContent =
      bank.accountNumber
        ? maskAccount(bank.accountNumber)
        : "Not saved";
  }

  if (bankName) {
    bankName.textContent =
      bank.bankName || "Not saved";
  }

  if (bankIFSC) {
    bankIFSC.textContent =
      bank.ifsc || "Not saved";
  }
}

function maskAccount(account) {
  if (!account) return "";

  if (account.length <= 4) {
    return account;
  }

  return (
    "****" +
    account.substring(account.length - 4)
  );
}


/* =========================================================
   CUSTOMER SERVICE
   ========================================================= */

function openCustomerService() {
  window.open(
    CUSTOMER_SERVICE,
    "_blank",
    "noopener,noreferrer"
  );
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeApp() {
  getData();

  updateHome();
  updateDepositPage();
  updateWithdrawalPage();

  renderProducts();
  renderCalendar();
  renderRewards();
  renderHistory();
  renderTransactions();
  renderMyInfo();

  /*
    Automatically check pending deposits/withdrawals
    after page reload.
  */

  const data = getData();

  data.deposits
    .filter(item => item.status === "PENDING")
    .forEach(item => {
      startDepositPolling(item.requestId);
    });

  data.withdrawals
    .filter(item => item.status === "PENDING")
    .forEach(item => {
      startWithdrawalPolling(item.requestId);
    });
}


/* =========================================================
   BUTTON / NAV EVENT HANDLING
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();

  document
    .querySelectorAll("[data-page]")
    .forEach(item => {
      item.addEventListener("click", () => {
        const page = item.getAttribute("data-page");

        if (page) {
          showPage(page);
        }
      });
    });

  /*
    Deposit button
  */

  const depositButton =
    document.getElementById("depositSubmitBtn");

  if (depositButton) {
    depositButton.addEventListener(
      "click",
      submitDeposit
    );
  }

  /*
    Withdrawal button
  */

  const withdrawalButton =
    document.getElementById("withdrawSubmitBtn");

  if (withdrawalButton) {
    withdrawalButton.addEventListener(
      "click",
      submitWithdrawal
    );
  }

  /*
    Copy UPI button
  */

  const copyButton =
    document.getElementById("copyUpiBtn");

  if (copyButton) {
    copyButton.addEventListener(
      "click",
      copyUPI
    );
  }

  /*
    Customer service
  */

  document
    .querySelectorAll(".customer-service")
    .forEach(button => {
      button.addEventListener(
        "click",
        openCustomerService
      );
    });
});


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.showPage = showPage;
window.copyUPI = copyUPI;
window.submitDeposit = submitDeposit;
window.submitWithdrawal = submitWithdrawal;
window.markAttendance = markAttendance;
window.buyProduct = buyProduct;
window.openCustomerService = openCustomerService;
window.renderCalendar = renderCalendar;
window.renderRewards = renderRewards;
window.renderHistory = renderHistory;
window.renderTransactions = renderTransactions;
window.renderMyInfo = renderMyInfo;
