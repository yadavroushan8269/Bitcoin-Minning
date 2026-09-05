/* =====================================================
   INVESTPRO DEMO
   Demo/Test only - no real payment processing
===================================================== */


/* -----------------------------
   PRODUCT DATA
----------------------------- */

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


/* -----------------------------
   STORAGE
----------------------------- */

let data = JSON.parse(
  localStorage.getItem("investDemo")
) || {

  balance: 0,

  attendance: {},

  purchased: [],

  rewards: [],

  deposits: [],

  withdrawals: [],

  transactions: []

};


function saveData() {

  localStorage.setItem(
    "investDemo",
    JSON.stringify(data)
  );

}


/* -----------------------------
   PAGE NAVIGATION
----------------------------- */

function openPage(pageId) {

  document.querySelectorAll(".page")
    .forEach(page => {
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


/* -----------------------------
   BALANCE
----------------------------- */

function updateBalance() {

  document.getElementById("balance")
    .textContent = data.balance.toFixed(2);

  document.getElementById("homeBalance")
    .textContent = data.balance.toFixed(2);

  const wb = document.getElementById("withdrawBalance");

  if (wb) {
    wb.textContent = data.balance.toFixed(2);
  }

}


/* -----------------------------
   PRODUCT HTML
----------------------------- */

function productHTML(product) {

  const bought = data.purchased.includes(product.id);

  return `
    <div class="product">

      <div class="product-head">

        <div>
          <h3>${product.name}</h3>
          <p>Daily demo reward</p>
        </div>

        <div class="product-price">
          ₹${product.price}
        </div>

      </div>

      <ul>
        <li>Daily reward: ₹${product.daily}</li>
        <li>Demo product</li>
        <li>Rewards can be claimed after purchase</li>
      </ul>

      ${
        bought

        ? `
          <button
            class="secondary-btn"
            onclick="alert('You already purchased this demo product.')"
          >
            ✓ Purchased
          </button>
        `

        : `
          <button
            class="primary-btn"
            onclick="buyProduct(${product.id})"
          >
            Invest / Purchase Demo
          </button>
        `
      }

    </div>
  `;
}


/* -----------------------------
   LOAD PRODUCTS
----------------------------- */

function loadProducts() {

  const html = products
    .map(productHTML)
    .join("");

  document.getElementById("productsList")
    .innerHTML = html;

  document.getElementById("homeProducts")
    .innerHTML = html;

}


/* -----------------------------
   BUY PRODUCT
----------------------------- */

function buyProduct(productId) {

  const product = products.find(
    p => p.id === productId
  );

  if (!product) return;

  if (data.purchased.includes(productId)) {

    alert("This product is already purchased.");

    return;
  }

  if (data.balance < product.price) {

    alert(
      "Insufficient demo balance.\n\n" +
      "Please use Demo Deposit first."
    );

    openPage("deposit");

    return;
  }

  data.balance -= product.price;

  data.purchased.push(productId);

  data.transactions.unshift({

    type: "Product Purchase",

    amount: product.price,

    date: new Date().toLocaleString(),

    color: "red"

  });

  saveData();

  updateUI();

  alert(
    `${product.name} purchased successfully in DEMO mode.`
  );

}


/* -----------------------------
   ATTENDANCE
----------------------------- */

let calendarDate = new Date();


function renderCalendar() {

  const year = calendarDate.getFullYear();

  const month = calendarDate.getMonth();

  const monthNames = [
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

  document.getElementById("monthTitle")
    .textContent =
    `${monthNames[month]} ${year}`;


  const firstDay =
    new Date(year, month, 1).getDay();

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();


  const calendar =
    document.getElementById("calendar");

  calendar.innerHTML = "";


  for (let i = 0; i < firstDay; i++) {

    const empty =
      document.createElement("div");

    empty.className = "day empty";

    calendar.appendChild(empty);

  }


  for (let day = 1; day <= daysInMonth; day++) {

    const box =
      document.createElement("div");

    box.className = "day";

    box.textContent = day;


    const key =
      `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;


    if (data.attendance[key]) {

      box.classList.add("attended");

    }


    const today = new Date();

    if (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {

      box.classList.add("today");

    }


    box.onclick = function() {

      toggleAttendance(key);

    };


    calendar.appendChild(box);

  }


  updateAttendanceTotal();

}


function toggleAttendance(key) {

  const today =
    new Date().toISOString().slice(0,10);

  if (key !== today) {

    alert(
      "Demo attendance can only be marked for today."
    );

    return;

  }

  if (data.attendance[key]) {

    delete data.attendance[key];

  } else {

    data.attendance[key] = true;

  }

  saveData();

  renderCalendar();

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

  document.getElementById("attendanceTotal")
    .textContent = total;

}


/* -----------------------------
   REWARDS
----------------------------- */

function renderRewards() {

  const container =
    document.getElementById("rewardsList");

  if (data.purchased.length === 0) {

    container.innerHTML = `
      <div class="reward-item">
        <b>No purchased products</b>
        <p>Purchase a demo product to see rewards.</p>
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


      const alreadyClaimed =
        data.rewards.some(
          r => r.productId === productId &&
               r.date === new Date().toISOString().slice(0,10)
        );


      return `
        <div class="reward-item">

          <div style="margin-bottom:10px">

            <b>${product.name}</b>

            <p>
              Daily Reward:
              ₹${product.daily}
            </p>

          </div>


          ${
            alreadyClaimed

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


/* -----------------------------
   CLAIM REWARD
----------------------------- */

function claimReward(productId) {

  const product =
    products.find(
      p => p.id === productId
    );

  if (!product) return;


  if (!data.purchased.includes(productId)) {

    alert(
      "You can only claim rewards for purchased products."
    );

    return;

  }


  const today =
    new Date().toISOString().slice(0,10);


  const claimed =
    data.rewards.some(
      r =>
        r.productId === productId &&
        r.date === today
    );


  if (claimed) {

    alert("Reward already claimed today.");

    return;

  }


  data.balance += product.daily;


  data.rewards.push({

    productId: productId,

    amount: product.daily,

    date: today

  });


  data.transactions.unshift({

    type: "Bonus",

    amount: product.daily,

    date: new Date().toLocaleString(),

    color: "green"

  });


  saveData();

  updateUI();

  alert(
    `₹${product.daily} demo reward added to your balance.`
  );

}


/* -----------------------------
   DEPOSIT
----------------------------- */

/* IMPORTANT:
   Never put your Telegram bot token in this file.
*/

const DEPOSIT_API_URL =
"https://script.google.com/macros/s/AKfycby6bTl_tUL1STJtWO8jQaXzjQSOhDLgvxj_2UWuI6VJBhh0ehwpCFSlQMhpDn57MfNtow/exec";


function showDeposit() {

  openPage("deposit");

  setDepositStatus("");

}


function copyUPI() {

  const upi = "yadav-rishab@fam";

  if (
    navigator.clipboard &&
    window.isSecureContext
  ) {

    navigator.clipboard
      .writeText(upi)
      .then(() => {

        alert("UPI ID copied.");

      });

  } else {

    prompt(
      "Copy this UPI ID:",
      upi
    );

  }

}


function setDepositStatus(
  text,
  ok = false
) {

  const el =
    document.getElementById(
      "depositStatus"
    );

  if (!el) return;

  el.textContent = text;

  el.style.color =
    ok
      ? "#087a3b"
      : "#b05c00";

}


function fileToBase64(file) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload = () => {

        resolve(
          reader.result
            .split(",")[1]
        );

      };

      reader.onerror =
        reject;

      reader.readAsDataURL(file);

    }
  );

}


async function submitDeposit() {

  const amount =
    Number(
      document.getElementById(
        "depositAmount"
      ).value
    );

  const utr =
    document.getElementById(
      "utr"
    ).value.trim();

  const screenshot =
    document.getElementById(
      "paymentScreenshot"
    ).files[0];

  const btn =
    document.getElementById(
      "depositSubmitBtn"
    );


  if (
    !Number.isFinite(amount) ||
    amount < 500
  ) {

    setDepositStatus(
      "Minimum deposit is ₹500."
    );

    return;

  }


  if (amount > 20000) {

    setDepositStatus(
      "Maximum deposit is ₹20,000."
    );

    return;

  }


  if (!utr) {

    setDepositStatus(
      "Please enter the UTR / Transaction ID."
    );

    return;

  }


  if (!screenshot) {

    setDepositStatus(
      "Please upload your payment screenshot."
    );

    return;

  }


  if (
    screenshot.size >
    3 * 1024 * 1024
  ) {

    setDepositStatus(
      "Screenshot must be 3 MB or smaller."
    );

    return;

  }


  if (
    !DEPOSIT_API_URL ||
    DEPOSIT_API_URL.includes(
      "PASTE_YOUR_"
    )
  ) {

    setDepositStatus(
      "Admin backend URL is not configured yet."
    );

    return;

  }


  btn.disabled = true;

  btn.textContent =
    "Submitting...";


  setDepositStatus(
    "Uploading payment proof..."
  );


  try {

    const imageBase64 =
      await fileToBase64(
        screenshot
      );


    const userKey =
      getUserKey();


    const payload = {

      action:
        "createDeposit",

      userKey:

        userKey,

      amount:

        amount,

      utr:

        utr,

      imageBase64:

        imageBase64,

      imageName:

        screenshot.name,

      imageType:

        screenshot.type

    };


    const response =
      await fetch(
        DEPOSIT_API_URL,
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
        "Submission failed"
      );

    }


    data.deposits.unshift({

      id:
        result.requestId,

      amount:
        amount,

      utr:
        utr,

      date:
        new Date()
          .toLocaleString(),

      status:
        "Pending Verification"

    });


    saveData();

    updateUI();


    document.getElementById(
      "depositAmount"
    ).value = "";


    document.getElementById(
      "utr"
    ).value = "";


    document.getElementById(
      "paymentScreenshot"
    ).value = "";


    setDepositStatus(

      "Deposit request sent. Waiting for admin verification.",

      true

    );


    startDepositStatusPolling(
      result.requestId
    );


  } catch (err) {

    console.error(err);

    setDepositStatus(
      "Could not submit request. Please try again."
    );

  } finally {

    btn.disabled = false;

    btn.textContent =
      "Submit Deposit Request";

  }

}


function getUserKey() {

  let key =
    localStorage.getItem(
      "investDemoUserKey"
    );


  if (!key) {

    key =
      "U" +
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .slice(2,8);


    localStorage.setItem(
      "investDemoUserKey",
      key
    );

  }


  return key;

}


async function checkDepositStatus(
  requestId
) {

  try {

    const response =
      await fetch(

        DEPOSIT_API_URL +
        "?action=status&requestId=" +
        encodeURIComponent(
          requestId
        )

      );


    const result =
      await response.json();


    if (!result.ok)
      return;


    if (
      result.status ===
      "APPROVED"
    ) {

      const deposit =
        data.deposits.find(
          d =>
            d.id ===
            requestId
        );


      if (
        deposit &&
        deposit.status !==
        "Approved"
      ) {

        deposit.status =
          "Approved";


        data.balance +=
          Number(
            deposit.amount
          );


        data.transactions.unshift({

          type:
            "Deposit",

          amount:
            Number(
              deposit.amount
            ),

          date:
            new Date()
              .toLocaleString(),

          color:
            "green"

        });


        saveData();

        updateUI();


        setDepositStatus(

          "Deposit successful. ₹" +
          Number(
            deposit.amount
          ).toFixed(2) +
          " added to your balance.",

          true

        );

      }


      return true;

    }


    if (
      result.status ===
      "REJECTED"
    ) {

      const deposit =
        data.deposits.find(
          d =>
            d.id ===
            requestId
        );


      if (deposit) {

        deposit.status =
          "Rejected";

      }


      saveData();

      updateUI();


      setDepositStatus(
        "Deposit request was rejected by admin."
      );


      return true;

    }

  } catch (e) {

    console.log(
      "Status check failed",
      e
    );

  }


  return false;

}


function startDepositStatusPolling(
  requestId
) {

  let tries = 0;


  const timer =
    setInterval(

      async () => {

        tries++;


        const done =
          await checkDepositStatus(
            requestId
          );


        if (
          done ||
          tries >= 120
        ) {

          clearInterval(
            timer
          );

        }

      },

      5000

    );

}


/* -----------------------------
   WITHDRAWAL
----------------------------- */

function showWithdrawal() {

  openPage("withdraw");

}


function submitWithdrawal() {

  const amount =
    Number(
      document.getElementById(
        "withdrawAmount"
      ).value
    );


  const name =
    document.getElementById(
      "bankName"
    ).value.trim();


  const account =
    document.getElementById(
      "accountNumber"
    ).value.trim();


  const confirmAccount =
    document.getElementById(
      "confirmAccount"
    ).value.trim();


  const bank =
    document.getElementById(
      "bank"
    ).value.trim();


  const ifsc =
    document.getElementById(
      "ifsc"
    ).value.trim();


  if (amount < 300) {

    alert(
      "Minimum demo withdrawal is ₹300."
    );

    return;

  }


  if (amount > 10000) {

    alert(
      "Maximum demo withdrawal is ₹10,000."
    );

    return;

  }


  if (
    amount >
    data.balance
  ) {

    alert(
      "Insufficient demo balance."
    );

    return;

  }


  if (
    !name ||
    !account ||
    !confirmAccount ||
    !bank ||
    !ifsc
  ) {

    alert(
      "Please fill all fields."
    );

    return;

  }


  if (
    account !==
    confirmAccount
  ) {

    alert(
      "Account numbers do not match."
    );

    return;

  }


  data.balance -=
    amount;


  data.withdrawals.unshift({

    amount:
      amount,

    name:
      name,

    account:
      account,

    bank:
      bank,

    ifsc:
      ifsc,

    status:
      "Demo Pending",

    date:
      new Date()
        .toLocaleString()

  });


  data.transactions.unshift({

    type:
      "Withdrawal",

    amount:
      amount,

    date:
      new Date()
        .toLocaleString(),

    color:
      "red"

  });


  saveData();

  updateUI();


  alert(
    `₹${amount} demo withdrawal request created.`
  );


  openPage(
    "info"
  );

}


/* -----------------------------
   WITHDRAW HISTORY
----------------------------- */

function renderWithdrawHistory() {

  const box =
    document.getElementById(
      "withdrawHistoryList"
    );


  if (
    data.withdrawals.length ===
    0
  ) {

    box.innerHTML = `

      <div class="card">

        No withdrawal history found.

      </div>

    `;

    return;

  }


  box.innerHTML =
    data.withdrawals
      .map(
        item => `

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

    `
      )
      .join("");

}


/* -----------------------------
   DEPOSIT HISTORY
----------------------------- */

function renderDepositHistory() {

  const box =
    document.getElementById(
      "depositHistoryList"
    );


  if (
    data.deposits.length ===
    0
  ) {

    box.innerHTML = `

      <div class="card">

        No deposit history found.

      </div>

    `;

    return;

  }


  box.innerHTML =
    data.deposits
      .map(
        item => `

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

            <br>

            Status:
            ${item.status ||
              "Pending Verification"}

          </small>

        </div>


        <div class="amount-green">

          +₹${item.amount}

        </div>

      </div>

    `
      )
      .join("");

}


/* -----------------------------
   TRANSACTION HISTORY
----------------------------- */

function renderTransactions() {

  const box =
    document.getElementById(
      "transactionList"
    );


  if (
    data.transactions.length ===
    0
  ) {

    box.innerHTML = `

      <div class="card">

        No transactions found.

      </div>

    `;

    return;

  }


  box.innerHTML =
    data.transactions
      .map(
        item => {

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

          </div>


          <div class="${
            positive
              ? "amount-green"
              : "amount-red"
          }">

            ${
              positive
                ? "+"
                : "-"
            }₹${item.amount}

          </div>

        </div>

      `;

        }
      )
      .join("");

}


/* -----------------------------
   CUSTOMER SERVICE
----------------------------- */

function customerService() {

  window.open(
    "https://t.me/Hammerff7gcz",
    "_blank"
  );

}


/* -----------------------------
   INVITE
----------------------------- */

function inviteNow() {

  const link =
    "https://24win.live";


  const text =
    `Join this app: ${link}`;


  const whatsapp =
    "https://wa.me/?text=" +
    encodeURIComponent(
      text
    );


  window.open(
    whatsapp,
    "_blank"
  );

}


/* -----------------------------
   DOWNLOAD APK
----------------------------- */

function downloadApp() {

  alert(

    "APK download link abhi configured nahi hai.\n\n" +

    "Jab aap APK file upload karoge, " +

    "script.js me APK URL set kar dena."

  );

}


/* -----------------------------
   MODAL
----------------------------- */

function showModal(
  title,
  content
) {

  document.getElementById(
    "modalTitle"
  ).textContent =
    title;


  document.getElementById(
    "modalContent"
  ).innerHTML =
    content;


  document.getElementById(
    "modal"
  ).classList.add(
    "show"
  );

}


function closeModal() {

  document.getElementById(
    "modal"
  ).classList.remove(
    "show"
  );

}


/* -----------------------------
   UPDATE EVERYTHING
----------------------------- */

function updateUI() {

  updateBalance();

  loadProducts();

  renderRewards();

  renderCalendar();

  renderWithdrawHistory();

  renderDepositHistory();

  renderTransactions();

}


/* -----------------------------
   INITIAL LOAD
----------------------------- */

document.addEventListener(

  "DOMContentLoaded",

  function() {

    updateUI();

  }

);
