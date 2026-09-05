/* =========================================================
   NSG WELLFARE
   Compatible with original website HTML
   ========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycby6bTl_tUL1STJtWO8jQaXzjQSOhDLgvxj_2UWuI6VJBhh0ehwpCFSlQMhpDn57MfNtow/exec";

const UPI_ID = "yadav-rishab@fam";
const SUPPORT = "https://t.me/Hammerff7gcz";

const MIN_DEPOSIT = 500;
const MAX_DEPOSIT = 20000;
const MIN_WITHDRAWAL = 300;
const MAX_WITHDRAWAL = 10000;


/* =========================================================
   DATA
   ========================================================= */

let data = JSON.parse(
  localStorage.getItem("investDemo") || "null"
);

if (!data) {
  data = {
    balance: 0,
    attendance: {},
    purchased: [],
    rewards: [],
    deposits: [],
    withdrawals: [],
    transactions: [],
    userKey:
      "NSG-" +
      Date.now().toString(36).toUpperCase()
  };
}

if (!data.attendance) data.attendance = {};
if (!Array.isArray(data.purchased)) data.purchased = [];
if (!Array.isArray(data.rewards)) data.rewards = [];
if (!Array.isArray(data.deposits)) data.deposits = [];
if (!Array.isArray(data.withdrawals)) data.withdrawals = [];
if (!Array.isArray(data.transactions))
  data.transactions = [];

if (!data.userKey) {
  data.userKey =
    "NSG-" +
    Date.now().toString(36).toUpperCase();
}

function saveData() {
  localStorage.setItem(
    "investDemo",
    JSON.stringify(data)
  );
}


/* =========================================================
   COMMON
   ========================================================= */

function money(value) {
  return Number(value || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}

function requestId(prefix) {
  return (
    prefix +
    "-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase()
  );
}

function today() {
  const d = new Date();

  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function openPage(id) {

  document
    .querySelectorAll(".page")
    .forEach(page => {
      page.classList.remove("active");
    });

  const page =
    document.getElementById(id);

  if (page) {
    page.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  updateUI();
}


/* =========================================================
   BALANCE
   ========================================================= */

function updateBalance() {

  const balance =
    document.getElementById("balance");

  const homeBalance =
    document.getElementById("homeBalance");

  const withdrawBalance =
    document.getElementById("withdrawBalance");

  if (balance) {
    balance.textContent =
      money(data.balance);
  }

  if (homeBalance) {
    homeBalance.textContent =
      money(data.balance);
  }

  if (withdrawBalance) {
    withdrawBalance.textContent =
      money(data.balance);
  }
}


/* =========================================================
   PRODUCTS
   ========================================================= */

const products = [

  {
    id: 1,
    name: "Product 1",
    price: 999,
    daily: 18
  },

  {
    id: 2,
    name: "Product 2",
    price: 1999,
    daily: 36
  },

  {
    id: 3,
    name: "Product 3",
    price: 4999,
    daily: 90
  }

];


function productHTML(product) {

  const bought =
    data.purchased.includes(product.id);

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

        <li>
          Daily reward:
          ₹${product.daily}
        </li>

        <li>
          Plan duration:
          30 days
        </li>

        <li>
          Rewards are subject to
          account eligibility
        </li>

      </ul>

      ${
        bought

          ? `
            <button
              class="secondary-btn"
              disabled
            >
              ✓ Purchased
            </button>
          `

          : `
            <button
              class="primary-btn"
              onclick="buyProduct(${product.id})"
            >
              Select Product
            </button>
          `
      }

    </div>
  `;
}


function loadProducts() {

  const html =
    products
      .map(productHTML)
      .join("");

  const list =
    document.getElementById(
      "productsList"
    );

  const home =
    document.getElementById(
      "homeProducts"
    );

  if (list) {
    list.innerHTML = html;
  }

  if (home) {
    home.innerHTML = html;
  }
}


function buyProduct(id) {

  const product =
    products.find(
      item => item.id === id
    );

  if (!product) return;

  if (
    data.purchased.includes(id)
  ) {
    alert(
      "This product is already selected."
    );
    return;
  }

  if (
    Number(data.balance) <
    Number(product.price)
  ) {

    alert(
      "Insufficient balance. Please deposit first."
    );

    openPage("deposit");

    return;
  }

  data.balance -=
    Number(product.price);

  data.purchased.push(id);

  data.transactions.unshift({

    type: "Product Purchase",

    amount: product.price,

    status: "COMPLETED",

    date:
      new Date().toLocaleString()

  });

  saveData();

  updateUI();

  alert(
    product.name +
    " selected successfully."
  );
}


/* =========================================================
   ATTENDANCE
   ========================================================= */

let calendarDate = new Date();


function renderCalendar() {

  const title =
    document.getElementById(
      "monthTitle"
    );

  const calendar =
    document.getElementById(
      "calendar"
    );

  if (!title || !calendar) return;

  const year =
    calendarDate.getFullYear();

  const month =
    calendarDate.getMonth();

  const names = [
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

  title.textContent =
    names[month] +
    " " +
    year;

  calendar.innerHTML = "";

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const totalDays =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {

    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "day empty";

    calendar.appendChild(empty);
  }


  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {

    const element =
      document.createElement(
        "div"
      );

    const key =
      year +
      "-" +
      String(month + 1)
        .padStart(2, "0") +
      "-" +
      String(day)
        .padStart(2, "0");

    element.className =
      "day";

    element.textContent =
      day;

    if (data.attendance[key]) {
      element.classList.add(
        "attended"
      );
    }

    const current =
      new Date();

    if (
      day === current.getDate() &&
      month === current.getMonth() &&
      year === current.getFullYear()
    ) {

      element.classList.add(
        "today"
      );
    }

    element.onclick = function () {
      toggleAttendance(key);
    };

    calendar.appendChild(element);
  }

  updateAttendanceTotal();
}


function toggleAttendance(key) {

  if (key !== today()) {

    alert(
      "Attendance can only be marked for today."
    );

    return;
  }

  if (data.attendance[key]) {

    alert(
      "Today's attendance is already marked."
    );

    return;
  }

  data.attendance[key] = true;

  saveData();

  renderCalendar();

  alert(
    "Attendance marked successfully."
  );
}


function changeMonth(amount) {

  calendarDate.setMonth(
    calendarDate.getMonth() +
    amount
  );

  renderCalendar();
}


function updateAttendanceTotal() {

  const element =
    document.getElementById(
      "attendanceTotal"
    );

  if (element) {

    element.textContent =
      Object.keys(
        data.attendance
      ).length;
  }
}


/* =========================================================
   REWARDS
   ========================================================= */

function renderRewards() {

  const box =
    document.getElementById(
      "rewardsList"
    );

  if (!box) return;

  if (!data.purchased.length) {

    box.innerHTML = `
      <div class="reward-item">

        <b>No purchased products</b>

        <p>
          Select a product to see
          available rewards.
        </p>

      </div>
    `;

    return;
  }

  box.innerHTML =
    data.purchased
      .map(id => {

        const product =
          products.find(
            p => p.id === id
          );

        if (!product) return "";

        const claimed =
          data.rewards.some(
            reward =>
              reward.productId === id &&
              reward.date === today()
          );

        return `
          <div class="reward-item">

            <b>
              ${product.name}
            </b>

            <p>
              Daily Reward:
              ₹${product.daily}
            </p>

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
                    onclick="claimReward(${id})"
                  >
                    Claim Reward
                  </button>
                `
            }

          </div>
        `;

      })
      .join("");
}


function claimReward(id) {

  const product =
    products.find(
      p => p.id === id
    );

  if (!product) return;

  if (
    !data.purchased.includes(id)
  ) {
    return;
  }

  const date =
    today();

  if (
    data.rewards.some(
      r =>
        r.productId === id &&
        r.date === date
    )
  ) {

    alert(
      "Reward already claimed today."
    );

    return;
  }

  data.balance +=
    Number(product.daily);

  data.rewards.push({

    productId: id,

    amount: product.daily,

    date: date

  });

  data.transactions.unshift({

    type: "Bonus",

    amount: product.daily,

    status: "COMPLETED",

    date:
      new Date().toLocaleString()

  });

  saveData();

  updateUI();

  alert(
    "₹" +
    product.daily +
    " reward added."
  );
}


/* =========================================================
   DEPOSIT
   ========================================================= */

function showDeposit() {
  openPage("deposit");
}


function copyUPI() {

  if (
    navigator.clipboard &&
    navigator.clipboard.writeText
  ) {

    navigator.clipboard
      .writeText(UPI_ID)
      .then(() => {

        alert(
          "UPI ID copied: " +
          UPI_ID
        );

      });

    return;
  }

  const input =
    document.createElement(
      "input"
    );

  input.value =
    UPI_ID;

  document.body.appendChild(
    input
  );

  input.select();

  document.execCommand(
    "copy"
  );

  input.remove();

  alert(
    "UPI ID copied: " +
    UPI_ID
  );
}


function fileBase64(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload =
        () => resolve(
          reader.result
        );

      reader.onerror =
        reject;

      reader.readAsDataURL(
        file
      );
    }
  );
}


async function submitDeposit() {

  const amountInput =
    document.getElementById(
      "depositAmount"
    );

  const utrInput =
    document.getElementById(
      "utr"
    );

  const screenshotInput =
    document.getElementById(
      "paymentScreenshot"
    );

  if (
    !amountInput ||
    !utrInput ||
    !screenshotInput
  ) {

    alert(
      "Deposit form not found."
    );

    return;
  }

  const amount =
    Number(
      amountInput.value
    );

  const utr =
    utrInput.value.trim();

  const file =
    screenshotInput.files[0];


  if (
    amount < MIN_DEPOSIT
  ) {

    alert(
      "Minimum deposit is ₹500."
    );

    return;
  }


  if (
    amount > MAX_DEPOSIT
  ) {

    alert(
      "Maximum deposit is ₹20,000."
    );

    return;
  }


  if (!utr) {

    alert(
      "Please enter UTR / Transaction ID."
    );

    return;
  }


  if (!file) {

    alert(
      "Please select payment screenshot."
    );

    return;
  }


  if (
    file.size >
    3 * 1024 * 1024
  ) {

    alert(
      "Screenshot must be 3 MB or smaller."
    );

    return;
  }


  const button =
    document.getElementById(
      "depositSubmitBtn"
    );

  if (button) {

    button.disabled = true;

    button.textContent =
      "Submitting...";
  }


  try {

    const id =
      requestId("DEP");

    const screenshot =
      await fileBase64(file);


    const payload = {

      action:
        "createDeposit",

      requestId:
        id,

      userKey:
        data.userKey,

      amount:
        amount,

      utr:
        utr,

      screenshot:
        screenshot,

      screenshotName:
        file.name,

      screenshotType:
        file.type
    };


    const response =
      await fetch(
        API_URL,
        {

          method:
            "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify(
              payload
            )

        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      throw new Error(
        result.error ||
        "Deposit request rejected"
      );
    }


    data.deposits.unshift({

      requestId:
        id,

      amount:
        amount,

      utr:
        utr,

      status:
        "PENDING",

      date:
        new Date()
          .toLocaleString()

    });


    data.transactions.unshift({

      type:
        "Deposit",

      amount:
        amount,

      status:
        "PENDING",

      date:
        new Date()
          .toLocaleString()

    });


    saveData();


    amountInput.value = "";

    utrInput.value = "";

    screenshotInput.value = "";


    alert(
      "Deposit request sent successfully.\n\nAdmin verification ke baad balance update hoga."
    );


    updateUI();

    pollDeposit(id);


  } catch (error) {

    console.error(error);

    alert(
      "Deposit request send nahi hua.\n\nGoogle Apps Script deployment/API check karein."
    );

  } finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        "Submit Deposit Request";
    }
  }
}


/* =========================================================
   DEPOSIT STATUS
   ========================================================= */

async function pollDeposit(id) {

  let attempts = 0;

  const timer =
    setInterval(
      async () => {

        attempts++;

        try {

          const url =
            API_URL +
            "?action=depositStatus" +
            "&requestId=" +
            encodeURIComponent(id) +
            "&userKey=" +
            encodeURIComponent(
              data.userKey
            );


          const response =
            await fetch(url);


          const result =
            await response.json();


          if (
            result.ok &&
            (
              result.status ===
                "APPROVED" ||
              result.status ===
                "REJECTED"
            )
          ) {

            clearInterval(timer);

            const deposit =
              data.deposits.find(
                d =>
                  d.requestId === id
              );


            if (!deposit) return;


            const oldStatus =
              deposit.status;


            deposit.status =
              result.status;


            deposit.reviewedAt =
              result.reviewedAt ||
              new Date()
                .toLocaleString();


            if (
              result.status ===
                "APPROVED" &&
              oldStatus !==
                "APPROVED"
            ) {

              data.balance +=
                Number(
                  deposit.amount
                );

            }


            data.transactions.unshift({

              type:
                "Deposit",

              amount:
                Number(
                  deposit.amount
                ),

              status:
                result.status,

              date:
                new Date()
                  .toLocaleString()

            });


            saveData();

            updateUI();


            if (
              result.status ===
              "APPROVED"
            ) {

              alert(
                "Deposit approved.\nBalance updated."
              );

            } else {

              alert(
                "Deposit rejected."
              );
            }
          }

        } catch (error) {

          console.log(
            "Deposit status error",
            error
          );
        }


        if (
          attempts >= 120
        ) {

          clearInterval(
            timer
          );
        }

      },
      5000
    );
}


/* =========================================================
   WITHDRAWAL
   ========================================================= */

function showWithdrawal() {
  openPage("withdraw");
}


async function submitWithdrawal() {

  const amountInput =
    document.getElementById(
      "withdrawAmount"
    );

  const nameInput =
    document.getElementById(
      "bankName"
    );

  const accountInput =
    document.getElementById(
      "accountNumber"
    );

  const confirmInput =
    document.getElementById(
      "confirmAccount"
    );

  const bankInput =
    document.getElementById(
      "bank"
    );

  const ifscInput =
    document.getElementById(
      "ifsc"
    );


  if (
    !amountInput ||
    !nameInput ||
    !accountInput ||
    !confirmInput ||
    !bankInput ||
    !ifscInput
  ) {

    alert(
      "Withdrawal form not found."
    );

    return;
  }


  const amount =
    Number(
      amountInput.value
    );

  const holderName =
    nameInput.value.trim();

  const accountNumber =
    accountInput.value.trim();

  const confirmAccount =
    confirmInput.value.trim();

  const bankName =
    bankInput.value.trim();

  const ifsc =
    ifscInput.value
      .trim()
      .toUpperCase();


  if (
    amount < MIN_WITHDRAWAL
  ) {

    alert(
      "Minimum withdrawal is ₹300."
    );

    return;
  }


  if (
    amount > MAX_WITHDRAWAL
  ) {

    alert(
      "Maximum withdrawal is ₹10,000."
    );

    return;
  }


  if (
    amount >
    Number(data.balance)
  ) {

    alert(
      "Insufficient balance."
    );

    return;
  }


  if (
    !holderName ||
    !accountNumber ||
    !confirmAccount ||
    !bankName ||
    !ifsc
  ) {

    alert(
      "Please fill all bank details."
    );

    return;
  }


  if (
    accountNumber !==
    confirmAccount
  ) {

    alert(
      "Account numbers do not match."
    );

    return;
  }


  if (
    !/^[A-Z]{4}0[A-Z0-9]{6}$/
      .test(ifsc)
  ) {

    alert(
      "Invalid IFSC code."
    );

    return;
  }


  const button =
    document.getElementById(
      "withdrawSubmitBtn"
    );


  if (button) {

    button.disabled = true;

    button.textContent =
      "Submitting...";
  }


  try {

    const id =
      requestId("WDR");


    const payload = {

      action:
        "createWithdrawal",

      requestId:
        id,

      userKey:
        data.userKey,

      amount:
        amount,

      holderName:
        holderName,

      accountNumber:
        accountNumber,

      bankName:
        bankName,

      ifsc:
        ifsc
    };


    const response =
      await fetch(
        API_URL,
        {

          method:
            "POST",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify(
              payload
            )

        }
      );


    const result =
      await response.json();


    if (!result.ok) {

      throw new Error(
        result.error ||
        "Withdrawal request rejected"
      );
    }


    /*
      Reserve balance only after
      server accepts the request.
    */

    data.balance -=
      amount;


    data.withdrawals.unshift({

      requestId:
        id,

      amount:
        amount,

      name:
        holderName,

      account:
        accountNumber,

      bank:
        bankName,

      ifsc:
        ifsc,

      status:
        "PENDING",

      date:
        new Date()
          .toLocaleString()

    });


    data.transactions.unshift({

      type:
        "Withdrawal",

      amount:
        amount,

      status:
        "PENDING",

      date:
        new Date()
          .toLocaleString()

    });


    saveData();


    amountInput.value = "";


    alert(
      "Withdrawal request sent successfully.\n\nAdmin payment ke baad status update hoga."
    );


    updateUI();

    pollWithdrawal(id);


  } catch (error) {

    console.error(error);

    alert(
      "Withdrawal request send nahi hua.\n\nGoogle Apps Script deployment/API check karein."
    );

  } finally {

    if (button) {

      button.disabled = false;

      button.textContent =
        "Submit Withdrawal Request";
    }
  }
}


/* =========================================================
   WITHDRAWAL STATUS
   ========================================================= */

async function pollWithdrawal(id) {

  let attempts = 0;

  const timer =
    setInterval(
      async () => {

        attempts++;

        try {

          const url =
            API_URL +
            "?action=withdrawalStatus" +
            "&requestId=" +
            encodeURIComponent(id) +
            "&userKey=" +
            encodeURIComponent(
              data.userKey
            );


          const response =
            await fetch(url);


          const result =
            await response.json();


          if (
            result.ok &&
            (
              result.status ===
                "PAID" ||
              result.status ===
                "REJECTED"
            )
          ) {

            clearInterval(timer);


            const withdrawal =
              data.withdrawals.find(
                w =>
                  w.requestId === id
              );


            if (!withdrawal) return;


            withdrawal.status =
              result.status;


            withdrawal.reviewedAt =
              result.reviewedAt ||
              new Date()
                .toLocaleString();


            /*
              If admin rejects,
              return reserved balance.
            */

            if (
              result.status ===
              "REJECTED"
            ) {

              data.balance +=
                Number(
                  withdrawal.amount
                );
            }


            data.transactions.unshift({

              type:
                "Withdrawal",

              amount:
                Number(
                  withdrawal.amount
                ),

              status:
                result.status,

              date:
                new Date()
                  .toLocaleString()

            });


            saveData();

            updateUI();


            if (
              result.status ===
              "PAID"
            ) {

              alert(
                "Withdrawal marked as paid."
              );

            } else {

              alert(
                "Withdrawal rejected.\nAmount returned to balance."
              );
            }
          }

        } catch (error) {

          console.log(
            "Withdrawal status error",
            error
          );
        }


        if (
          attempts >= 120
        ) {

          clearInterval(
            timer
          );
        }

      },
      5000
    );
}


/* =========================================================
   DEPOSIT HISTORY
   ========================================================= */

function renderDepositHistory() {

  const box =
    document.getElementById(
      "depositHistoryList"
    );

  if (!box) return;


  if (
    !data.deposits.length
  ) {

    box.innerHTML =
      `
      <div class="card">
        No deposit history found.
      </div>
      `;

    return;
  }


  box.innerHTML =
    data.deposits
      .map(item => {

        return `
          <div class="history-item">

            <div>

              <b>
                Deposit
              </b>

              <p>
                ${item.date}
              </p>

              <small>
                UTR:
                ${item.utr}
              </small>

              <br>

              <small>
                Status:
                ${item.status}
              </small>

            </div>

            <div class="amount-green">
              +₹${item.amount}
            </div>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   WITHDRAW HISTORY
   ========================================================= */

function renderWithdrawHistory() {

  const box =
    document.getElementById(
      "withdrawHistoryList"
    );

  if (!box) return;


  if (
    !data.withdrawals.length
  ) {

    box.innerHTML =
      `
      <div class="card">
        No withdrawal history found.
      </div>
      `;

    return;
  }


  box.innerHTML =
    data.withdrawals
      .map(item => {

        return `
          <div class="history-item">

            <div>

              <b>
                Withdrawal
              </b>

              <p>
                ${item.date}
              </p>

              <small>
                Status:
                ${item.status}
              </small>

            </div>

            <div class="amount-red">
              -₹${item.amount}
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

  const box =
    document.getElementById(
      "transactionList"
    );

  if (!box) return;


  if (
    !data.transactions.length
  ) {

    box.innerHTML =
      `
      <div class="card">
        No transactions found.
      </div>
      `;

    return;
  }


  box.innerHTML =
    data.transactions
      .map(item => {

        const positive =
          item.type ===
            "Deposit" ||
          item.type ===
            "Bonus";


        return `
          <div class="history-item">

            <div>

              <b>
                ${item.type}
              </b>

              <p>
                ${item.date}
              </p>

              <small>
                Status:
                ${item.status || "COMPLETED"}
              </small>

            </div>

            <div
              class="${
                positive
                  ? "amount-green"
                  : "amount-red"
              }"
            >

              ${
                positive
                  ? "+"
                  : "-"
              }₹${item.amount}

            </div>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   CUSTOMER SERVICE
   ========================================================= */

function customerService() {

  window.open(
    SUPPORT,
    "_blank"
  );
}


/* =========================================================
   OTHER ORIGINAL FUNCTIONS
   ========================================================= */

function inviteNow() {

  const text =
    encodeURIComponent(
      "Join NSG Wellfare"
    );

  window.open(
    "https://wa.me/?text=" +
      text,
    "_blank"
  );
}


function downloadApp() {

  alert(
    "App download link is not configured yet."
  );
}


function showModal(title, content) {

  const titleBox =
    document.getElementById(
      "modalTitle"
    );

  const contentBox =
    document.getElementById(
      "modalContent"
    );

  const modal =
    document.getElementById(
      "modal"
    );

  if (titleBox)
    titleBox.textContent =
      title;

  if (contentBox)
    contentBox.innerHTML =
      content;

  if (modal)
    modal.classList.add(
      "show"
    );
}


function closeModal() {

  const modal =
    document.getElementById(
      "modal"
    );

  if (modal) {

    modal.classList.remove(
      "show"
    );
  }
}


/* =========================================================
   UPDATE EVERYTHING
   ========================================================= */

function updateUI() {

  updateBalance();

  loadProducts();

  renderRewards();

  renderCalendar();

  renderDepositHistory();

  renderWithdrawHistory();

  renderTransactions();
}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    saveData();

    updateUI();


    /*
      Continue checking pending
      requests after page reload.
    */

    data.deposits
      .filter(
        item =>
          item.status ===
          "PENDING"
      )
      .forEach(
        item =>
          pollDeposit(
            item.requestId
          )
      );


    data.withdrawals
      .filter(
        item =>
          item.status ===
          "PENDING"
      )
      .forEach(
        item =>
          pollWithdrawal(
            item.requestId
          )
      );

  }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.openPage = openPage;

window.showDeposit =
  showDeposit;

window.showWithdrawal =
  showWithdrawal;

window.copyUPI =
  copyUPI;

window.submitDeposit =
  submitDeposit;

window.submitWithdrawal =
  submitWithdrawal;

window.buyProduct =
  buyProduct;

window.claimReward =
  claimReward;

window.toggleAttendance =
  toggleAttendance;

window.changeMonth =
  changeMonth;

window.customerService =
  customerService;

window.inviteNow =
  inviteNow;

window.downloadApp =
  downloadApp;

window.showModal =
  showModal;

window.closeModal =
  closeModal;

window.renderCalendar =
  renderCalendar;

window.renderRewards =
  renderRewards;

window.renderDepositHistory =
  renderDepositHistory;

window.renderWithdrawHistory =
  renderWithdrawHistory;

window.renderTransactions =
  renderTransactions;
