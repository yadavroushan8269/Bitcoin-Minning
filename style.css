/* =========================================
   NSG WELLFARE - SCRIPT.JS
   Demo / Simulation Version
========================================= */

const products = [
  { id: 1, name: "Starter Plan", price: 999, daily: 18 },
  { id: 2, name: "Growth Plan", price: 1999, daily: 36 },
  { id: 3, name: "Premium Plan", price: 4999, daily: 90 }
];

let data = JSON.parse(localStorage.getItem("nsgWellfare")) || {
  balance: 0,
  attendance: {},
  purchased: [],
  rewards: [],
  deposits: [],
  withdrawals: [],
  transactions: []
};

let calendarDate = new Date();

function saveData() {
  localStorage.setItem("nsgWellfare", JSON.stringify(data));
}

/* =========================
   NAVIGATION
========================= */

function openPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  updateUI();
}

/* =========================
   BALANCE
========================= */

function updateBalance() {
  const balance = Number(data.balance || 0).toFixed(2);

  const top = document.getElementById("balance");
  const home = document.getElementById("homeBalance");
  const withdraw = document.getElementById("withdrawBalance");

  if (top) top.textContent = balance;
  if (home) home.textContent = balance;
  if (withdraw) withdraw.textContent = balance;
}

/* =========================
   PRODUCTS
========================= */

function productHTML(product) {
  const bought = data.purchased.includes(product.id);

  return `
    <div class="product">

      <div class="product-head">
        <div>
          <h3>${product.name}</h3>
          <p>Daily reward plan</p>
        </div>

        <div class="product-price">
          ₹${product.price}
        </div>
      </div>

      <ul>
        <li>Daily reward: ₹${product.daily}</li>
        <li>30 day plan</li>
        <li>Simulation account</li>
      </ul>

      ${
        bought
        ? `
          <button class="secondary-btn" disabled>
            ✓ Purchased
          </button>
        `
        : `
          <button
            class="primary-btn"
            onclick="buyProduct(${product.id})"
          >
            Select Plan
          </button>
        `
      }

    </div>
  `;
}

function loadProducts() {
  const html = products.map(productHTML).join("");

  const list = document.getElementById("productsList");
  const home = document.getElementById("homeProducts");

  if (list) list.innerHTML = html;
  if (home) {
    home.innerHTML = products
      .slice(0, 2)
      .map(productHTML)
      .join("");
  }
}

function buyProduct(productId) {
  const product = products.find(
    p => p.id === productId
  );

  if (!product) return;

  if (data.purchased.includes(productId)) {
    alert("This plan is already selected.");
    return;
  }

  if (data.balance < product.price) {
    alert("Insufficient demo balance.");
    openPage("deposit");
    return;
  }

  data.balance -= product.price;

  data.purchased.push(productId);

  data.transactions.unshift({
    type: "Plan Purchase",
    amount: product.price,
    date: new Date().toLocaleString("en-IN"),
    color: "red"
  });

  saveData();
  updateUI();

  alert(
    product.name +
    " selected successfully."
  );
}

/* =========================
   ATTENDANCE
========================= */

function renderCalendar() {
  const calendar =
    document.getElementById("calendar");

  const title =
    document.getElementById("monthTitle");

  if (!calendar) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  if (title) {
    title.textContent =
      `${months[month]} ${year}`;
  }

  const firstDay =
    new Date(year, month, 1).getDay();

  const totalDays =
    new Date(year, month + 1, 0).getDate();

  calendar.innerHTML = "";

  for (let i = 0; i < firstDay; i++) {
    const empty =
      document.createElement("div");

    empty.className = "day empty";

    calendar.appendChild(empty);
  }

  const today = new Date();

  for (let day = 1; day <= totalDays; day++) {

    const box =
      document.createElement("div");

    box.className = "day";
    box.textContent = day;

    const key =
      `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    if (data.attendance[key]) {
      box.classList.add("attended");
    }

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      box.classList.add("today");
    }

    box.onclick = () => {
      toggleAttendance(key);
    };

    calendar.appendChild(box);
  }

  updateAttendanceTotal();
}

function toggleAttendance(key) {

  const today =
    new Date();

  const todayKey =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  if (key !== todayKey) {
    alert("You can mark attendance only for today.");
    return;
  }

  if (data.attendance[key]) {
    alert("Today's attendance is already marked.");
    return;
  }

  data.attendance[key] = true;

  saveData();
  renderCalendar();

  alert("Attendance marked successfully.");
}

function changeMonth(amount) {
  calendarDate.setMonth(
    calendarDate.getMonth() + amount
  );

  renderCalendar();
}

function updateAttendanceTotal() {
  const total =
    Object.keys(data.attendance).length;

  const element =
    document.getElementById("attendanceTotal");

  if (element) {
    element.textContent = total;
  }
}

/* =========================
   REWARDS
========================= */

function renderRewards() {

  const container =
    document.getElementById("rewardsList");

  if (!container) return;

  if (data.purchased.length === 0) {

    container.innerHTML = `
      <div class="reward-item">
        <b>No selected plans</b>
        <p>Select a plan to see available rewards.</p>
      </div>
    `;

    return;
  }

  container.innerHTML =
    data.purchased.map(productId => {

      const product =
        products.find(
          p => p.id === productId
        );

      if (!product) return "";

      const today =
        new Date().toISOString().slice(0, 10);

      const claimed =
        data.rewards.some(
          reward =>
            reward.productId === productId &&
            reward.date === today
        );

      return `
        <div class="reward-item">

          <b>${product.name}</b>

          <p>
            Daily Reward:
            ₹${product.daily}
          </p>

          <br>

          ${
            claimed
            ? `
              <button
                class="secondary-btn"
                disabled
              >
                ✓ Claimed Today
              </button>
            `
            : `
              <button
                class="primary-btn"
                onclick="claimReward(${product.id})"
              >
                Claim Reward
              </button>
            `
          }

        </div>
      `;

    }).join("");
}

function claimReward(productId) {

  const product =
    products.find(
      p => p.id === productId
    );

  if (!product) return;

  if (!data.purchased.includes(productId)) {
    alert("Plan not selected.");
    return;
  }

  const today =
    new Date().toISOString().slice(0, 10);

  const already =
    data.rewards.some(
      r =>
        r.productId === productId &&
        r.date === today
    );

  if (already) {
    alert("Reward already claimed today.");
    return;
  }

  data.balance += product.daily;

  data.rewards.push({
    productId,
    amount: product.daily,
    date: today
  });

  data.transactions.unshift({
    type: "Daily Reward",
    amount: product.daily,
    date: new Date().toLocaleString("en-IN"),
    color: "green"
  });

  saveData();
  updateUI();

  alert(
    `₹${product.daily} reward added.`
  );
}

/* =========================
   DEPOSIT
========================= */

function showDeposit() {
  openPage("deposit");
}

function submitDeposit() {

  const amountElement =
    document.getElementById("depositAmount");

  const utrElement =
    document.getElementById("utr");

  if (!amountElement || !utrElement) return;

  const amount =
    Number(amountElement.value);

  const utr =
    utrElement.value.trim();

  if (!amount || amount < 500) {
    alert("Minimum amount is ₹500.");
    return;
  }

  if (amount > 20000) {
    alert("Maximum amount is ₹20,000.");
    return;
  }

  if (!utr) {
    alert("Please enter UTR.");
    return;
  }

  /*
    Demo only:
    This does not process real payments.
  */

  data.balance += amount;

  data.deposits.unshift({
    amount,
    utr,
    status: "Demo Approved",
    date: new Date().toLocaleString("en-IN")
  });

  data.transactions.unshift({
    type: "Deposit",
    amount,
    date: new Date().toLocaleString("en-IN"),
    color: "green"
  });

  amountElement.value = "";
  utrElement.value = "";

  saveData();
  updateUI();

  alert(
    `₹${amount} demo balance added successfully.`
  );

  openPage("depositHistory");
}

/* =========================
   WITHDRAWAL
========================= */

function showWithdrawal() {
  openPage("withdraw");
}

function submitWithdrawal() {

  const amount =
    Number(
      document.getElementById("withdrawAmount").value
    );

  const name =
    document.getElementById("bankName").value.trim();

  const account =
    document.getElementById("accountNumber").value.trim();

  const confirmAccount =
    document.getElementById("confirmAccount").value.trim();

  const bank =
    document.getElementById("bank").value.trim();

  const ifsc =
    document.getElementById("ifsc").value.trim();

  if (!amount || amount < 300) {
    alert("Minimum withdrawal is ₹300.");
    return;
  }

  if (amount > 10000) {
    alert("Maximum withdrawal is ₹10,000.");
    return;
  }

  if (amount > data.balance) {
    alert("Insufficient balance.");
    return;
  }

  if (
    !name ||
    !account ||
    !confirmAccount ||
    !bank ||
    !ifsc
  ) {
    alert("Please fill all bank details.");
    return;
  }

  if (account !== confirmAccount) {
    alert("Account numbers do not match.");
    return;
  }

  data.balance -= amount;

  data.withdrawals.unshift({
    amount,
    name,
    account,
    bank,
    ifsc,
    status: "Demo Pending",
    date: new Date().toLocaleString("en-IN")
  });

  data.transactions.unshift({
    type: "Withdrawal",
    amount,
    date: new Date().toLocaleString("en-IN"),
    color: "red"
  });

  document.getElementById("withdrawAmount").value = "";
  document.getElementById("bankName").value = "";
  document.getElementById("accountNumber").value = "";
  document.getElementById("confirmAccount").value = "";
  document.getElementById("bank").value = "";
  document.getElementById("ifsc").value = "";

  saveData();
  updateUI();

  alert(
    "Withdrawal request created successfully."
  );

  openPage("withdrawHistory");
}

/* =========================
   HISTORY
========================= */

function renderWithdrawHistory() {

  const box =
    document.getElementById(
      "withdrawHistoryList"
    );

  if (!box) return;

  if (!data.withdrawals.length) {
    box.innerHTML = `
      <div class="card">
        No withdrawal history found.
      </div>
    `;
    return;
  }

  box.innerHTML =
    data.withdrawals.map(item => `
      <div class="history-item">

        <div>
          <b>Withdrawal</b>
          <p>${item.date}</p>
          <small>Status: ${item.status}</small>
        </div>

        <div class="amount-red">
          -₹${item.amount}
        </div>

      </div>
    `).join("");
}

function renderDepositHistory() {

  const box =
    document.getElementById(
      "depositHistoryList"
    );

  if (!box) return;

  if (!data.deposits.length) {
    box.innerHTML = `
      <div class="card">
        No deposit history found.
      </div>
    `;
    return;
  }

  box.innerHTML =
    data.deposits.map(item => `
      <div class="history-item">

        <div>
          <b>Deposit</b>
          <p>${item.date}</p>
          <small>
            UTR: ${item.utr}
          </small>
          <small>
            Status: ${item.status}
          </small>
        </div>

        <div class="amount-green">
          +₹${item.amount}
        </div>

      </div>
    `).join("");
}

function renderTransactions() {

  const box =
    document.getElementById(
      "transactionList"
    );

  if (!box) return;

  if (!data.transactions.length) {
    box.innerHTML = `
      <div class="card">
        No transactions found.
      </div>
    `;
    return;
  }

  box.innerHTML =
    data.transactions.map(item => {

      const positive =
        item.type === "Deposit" ||
        item.type === "Bonus" ||
        item.type === "Daily Reward";

      return `
        <div class="history-item">

          <div>
            <b>${item.type}</b>
            <p>${item.date}</p>
          </div>

          <div class="${
            positive
              ? "amount-green"
              : "amount-red"
          }">
            ${positive ? "+" : "-"}₹${item.amount}
          </div>

        </div>
      `;

    }).join("");
}

/* =========================
   OTHER BUTTONS
========================= */

function customerService() {
  window.open(
    "https://t.me/Hammerff7gcz",
    "_blank"
  );
}

function inviteNow() {

  const text =
    "Join NSG Wellfare";

  if (navigator.share) {

    navigator.share({
      title: "NSG Wellfare",
      text
    }).catch(() => {});

  } else {

    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Invite text copied.");
      });

  }
}

function downloadApp() {
  alert(
    "APK download link is not configured yet."
  );
}

/* =========================
   MODAL
========================= */

function showModal(title, content) {

  const titleBox =
    document.getElementById("modalTitle");

  const contentBox =
    document.getElementById("modalContent");

  const modal =
    document.getElementById("modal");

  if (titleBox) {
    titleBox.textContent = title;
  }

  if (contentBox) {
    contentBox.innerHTML = content;
  }

  if (modal) {
    modal.classList.add("show");
  }
}

function closeModal() {

  const modal =
    document.getElementById("modal");

  if (modal) {
    modal.classList.remove("show");
  }
}

/* =========================
   UPDATE UI
========================= */

function updateUI() {
  updateBalance();
  loadProducts();
  renderRewards();
  renderCalendar();
  renderWithdrawHistory();
  renderDepositHistory();
  renderTransactions();
}

/* =========================
   START
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    updateUI();
  }
);
