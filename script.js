/* =========================================================
   NSG WELLFARE - COMPLETE SCRIPT
========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyvDFs6hU-jSEwOCk9s0exPJXGtCtMc3LiADj_0jZFsyuLSmTHskmf3W-b9H1o-QBK/exec";

const UPI = "yadav-rishab@fam";

const SUPPORT =
  "https://t.me/Hammerff7gcz";


/* =========================================================
   PRODUCTS
========================================================= */

const plans = [
  {
    id: 1,
    name: "Plan ₹500",
    price: 500,
    reward: 10
  },
  {
    id: 2,
    name: "Plan ₹1,500",
    price: 1500,
    reward: 30
  },
  {
    id: 3,
    name: "Plan ₹3,600",
    price: 3600,
    reward: 72
  }
];


/* =========================================================
   LOCAL STATE
========================================================= */

let s = JSON.parse(
  localStorage.getItem("nsgState") || "null"
) || {
  balance: 0,
  attendance: {},
  deposits: [],
  withdrawals: [],
  transactions: [],
  purchased: [],
  rewardClaims: {}
};


/* =========================================================
   SAVE
========================================================= */

function save() {
  localStorage.setItem(
    "nsgState",
    JSON.stringify(s)
  );
}


/* =========================================================
   FORMAT MONEY
========================================================= */

function fmt(n) {
  return Number(n || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  );
}


/* =========================================================
   SAFE HTML
========================================================= */

function safe(x) {
  return String(x || "").replace(
    /[&<>"']/g,
    a => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[a])
  );
}


/* =========================================================
   USER ID
========================================================= */

function userID() {

  let x =
    localStorage.getItem("nsgUid");

  if (!x) {

    x =
      "You-" +
      Math.floor(
        1000000 +
        Math.random() * 8999999
      );

    localStorage.setItem(
      "nsgUid",
      x
    );
  }

  return x;
}


/* =========================================================
   API REQUEST
========================================================= */

async function api(action, data = {}) {

  const payload = {
    action: action,
    userId: userID(),
    userKey: userID(),
    deviceId:
      localStorage.getItem("nsgDevice") ||
      "",
    ...data
  };

  try {

    const response =
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

    const text =
      await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch (e) {
      return {
        success: false,
        message:
          "Invalid server response."
      };
    }

    return result;

  } catch (error) {

    console.error(error);

    return {
      success: false,
      message:
        "Server connection failed."
    };
  }
}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function go(page) {

  document
    .querySelectorAll(".page")
    .forEach(p =>
      p.classList.remove("active")
    );

  const target =
    document.getElementById(page);

  if (target) {
    target.classList.add("active");
  }

  updateNav(page);

  window.scrollTo(0, 0);

  render();

  if (page === "rewards") {
    loadRewards();
  }
}


/* =========================================================
   BOTTOM NAV ACTIVE
========================================================= */

function updateNav(page) {

  document
    .querySelectorAll(".nav")
    .forEach(n =>
      n.classList.remove("active")
    );

  const map = {
    home: "navHome",
    products: "navProducts",
    rewards: "navRewards",
    deposit: "navDeposit",
    info: "navInfo"
  };

  const id = map[page];

  if (id) {

    const el =
      document.getElementById(id);

    if (el) {
      el.classList.add("active");
    }
  }
}


/* =========================================================
   RENDER
========================================================= */

function render() {

  const topBalance =
    document.getElementById(
      "topBalance"
    );

  const homeBalance =
    document.getElementById(
      "homeBalance"
    );

  const withdrawBalance =
    document.getElementById(
      "withdrawBalance"
    );

  const profileId =
    document.getElementById(
      "profileId"
    );

  const userHome =
    document.getElementById(
      "userIdHome"
    );

  const invite =
    document.getElementById(
      "inviteLink"
    );

  if (topBalance)
    topBalance.textContent =
      fmt(s.balance);

  if (homeBalance)
    homeBalance.textContent =
      fmt(s.balance);

  if (withdrawBalance)
    withdrawBalance.textContent =
      fmt(s.balance);

  if (profileId)
    profileId.textContent =
      userID();

  if (userHome)
    userHome.textContent =
      "User ID: " + userID();

  if (invite)
    invite.value =
      location.href;

  renderProducts();
  renderCalendar();
  renderRewards();
  renderHistory();
}


/* =========================================================
   PRODUCTS
========================================================= */

function productHTML(p) {

  const bought =
    s.purchased.includes(p.id);

  return `
    <div class="product">

      <div class="productTop">

        <div>
          <h3>${safe(p.name)}</h3>

          <p>
            Product plan
          </p>
        </div>

        <div class="price">
          ₹${fmt(p.price)}
        </div>

      </div>

      <ul>

        <li>
          Daily reward:
          ₹${fmt(p.reward)}
        </li>

        <li>
          Reward starts on purchase day
        </li>

      </ul>

      <button
        class="${bought ? "secondary" : "primary"}"
        ${bought ? "disabled" : ""}
        onclick="buy(${p.id})"
      >
        ${
          bought
            ? "Purchased"
            : "Select Product"
        }
      </button>

    </div>
  `;
}


function renderProducts() {

  const html =
    plans
      .map(productHTML)
      .join("");

  const home =
    document.getElementById(
      "homeProducts"
    );

  const list =
    document.getElementById(
      "productList"
    );

  if (home)
    home.innerHTML = html;

  if (list)
    list.innerHTML = html;
}


/* =========================================================
   BUY PRODUCT
========================================================= */

async function buy(productId) {

  const p =
    plans.find(
      x => x.id === productId
    );

  if (!p) return;

  if (
    s.purchased.includes(productId)
  ) {
    alert("This product is already purchased.");
    return;
  }

  if (s.balance < p.price) {
    alert(
      "Insufficient balance. Please deposit first."
    );
    return;
  }

  if (
    !confirm(
      `${p.name}\n\nPrice: ₹${fmt(p.price)}\nDaily reward: ₹${fmt(p.reward)}\n\nPurchase this plan?`
    )
  ) {
    return;
  }

  /*
   * Try server purchase first.
   */
  const result =
    await api(
      "createPurchase",
      {
        productId:
          String(productId)
      }
    );

  /*
   * If backend already supports purchase,
   * use authoritative response.
   */
  if (result && result.success) {

    s.balance =
      Number(
        result.balance ??
        s.balance - p.price
      );

    if (
      !s.purchased.includes(
        productId
      )
    ) {
      s.purchased.push(
        productId
      );
    }

    s.transactions.unshift({
      type: "Product Purchase",
      amount: p.price,
      status: "Completed",
      date:
        new Date().toLocaleString()
    });

    save();
    render();

    alert(
      "Product purchased successfully."
    );

    return;
  }

  /*
   * Backend not supporting purchase yet:
   * do not silently fake a server purchase.
   */
  alert(
    result?.message ||
    "Product purchase service is not available yet."
  );
}


/* =========================================================
   CALENDAR
========================================================= */

let cd = new Date();


function month(v) {

  cd.setMonth(
    cd.getMonth() + v
  );

  renderCalendar();
}


function key(y, m, d) {

  return (
    y +
    "-" +
    String(m + 1)
      .padStart(2, "0") +
    "-" +
    String(d)
      .padStart(2, "0")
  );
}


function renderCalendar() {

  const calendar =
    document.getElementById(
      "calendar"
    );

  const title =
    document.getElementById(
      "monthTitle"
    );

  const count =
    document.getElementById(
      "attCount"
    );

  if (!calendar) return;

  const y =
    cd.getFullYear();

  const m =
    cd.getMonth();

  if (title) {

    title.textContent =
      new Intl.DateTimeFormat(
        "en-IN",
        {
          month: "long",
          year: "numeric"
        }
      ).format(cd);
  }

  calendar.innerHTML = "";

  const first =
    new Date(
      y,
      m,
      1
    ).getDay();

  for (
    let i = 0;
    i < first;
    i++
  ) {

    calendar.innerHTML +=
      '<div class="day empty"></div>';
  }

  const total =
    new Date(
      y,
      m + 1,
      0
    ).getDate();

  const now =
    new Date();

  for (
    let d = 1;
    d <= total;
    d++
  ) {

    const k =
      key(y, m, d);

    const e =
      document.createElement(
        "div"
      );

    let cls = "day";

    if (s.attendance[k]) {
      cls += " done";
    }

    if (
      d === now.getDate() &&
      m === now.getMonth() &&
      y === now.getFullYear()
    ) {
      cls += " today";
    }

    e.className = cls;

    e.textContent = d;

    e.onclick = () =>
      markAttendance(k);

    calendar.appendChild(e);
  }

  if (count) {

    count.textContent =
      Object.keys(
        s.attendance
      ).length;
  }
}


/* =========================================================
   ATTENDANCE
========================================================= */

async function markAttendance(dateKey) {

  if (
    s.attendance[dateKey]
  ) {
    return;
  }

  const today =
    key(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
    );

  if (dateKey !== today) {

    alert(
      "Only today's attendance can be marked."
    );

    return;
  }

  const result =
    await api(
      "attendance",
      {
        date: dateKey
      }
    );

  if (
    result &&
    result.success
  ) {

    s.attendance[dateKey] = 1;

    if (
      result.balance !==
      undefined
    ) {
      s.balance =
        Number(
          result.balance
        );
    }

    save();

    render();

    alert(
      result.message ||
      "Attendance marked successfully."
    );

  } else {

    alert(
      result?.message ||
      "Unable to mark attendance."
    );
  }
}


/* =========================================================
   REWARD TODAY
========================================================= */

function renderRewards() {

  const box =
    document.getElementById(
      "rewardsList"
    );

  if (!box) return;

  if (
    !s.purchased.length
  ) {

    box.innerHTML = `
      <div class="empty">
        No purchased products yet.
      </div>
    `;

    return;
  }

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  box.innerHTML =
    s.purchased
      .map(productId => {

        const p =
          plans.find(
            x => x.id === productId
          );

        if (!p) return "";

        const claimKey =
          productId +
          "_" +
          today;

        const claimed =
          !!s.rewardClaims[
            claimKey
          ];

        return `
          <div class="reward-card">

            <div class="reward-card-top">

              <div>
                <h3>
                  🎁 ${safe(p.name)}
                </h3>

                <p>
                  Daily reward available
                </p>
              </div>

              <div class="reward-amount">
                ₹${fmt(p.reward)}
              </div>

            </div>

            <button
              class="${
                claimed
                  ? "secondary"
                  : "primary"
              }"
              ${
                claimed
                  ? "disabled"
                  : ""
              }
              onclick="claimReward(${p.id})"
            >
              ${
                claimed
                  ? "Claimed Today"
                  : "Claim Reward"
              }
            </button>

          </div>
        `;
      })
      .join("");
}


/* =========================================================
   LOAD SERVER REWARDS
========================================================= */

async function loadRewards() {

  /*
   * Current backend must expose
   * a reward-reading action.
   */
  const result =
    await api(
      "userRewards"
    );

  if (
    !result ||
    !result.success
  ) {
    return;
  }

  if (
    result.balance !==
    undefined
  ) {

    s.balance =
      Number(
        result.balance
      );
  }

  if (
    Array.isArray(
      result.purchases
    )
  ) {

    s.purchased =
      result.purchases
        .map(x =>
          Number(
            x.productId
          )
        )
        .filter(Boolean);
  }

  save();
  renderRewards();
  render();
}


/* =========================================================
   CLAIM REWARD
========================================================= */

async function claimReward(
  productId
) {

  const p =
    plans.find(
      x => x.id === productId
    );

  if (!p) return;

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const claimKey =
    productId +
    "_" +
    today;

  if (
    s.rewardClaims[
      claimKey
    ]
  ) {

    alert(
      "Reward already claimed today."
    );

    return;
  }

  const result =
    await api(
      "claimReward",
      {
        productId:
          String(productId)
      }
    );

  if (
    !result ||
    !result.success
  ) {

    alert(
      result?.message ||
      "Unable to claim reward."
    );

    return;
  }

  /*
   * Server balance is authoritative.
   */
  if (
    result.balance !==
    undefined
  ) {

    s.balance =
      Number(
        result.balance
      );

  } else {

    s.balance +=
      p.reward;
  }

  s.rewardClaims[
    claimKey
  ] = 1;

  s.transactions.unshift({
    type: "Daily Reward",
    amount: p.reward,
    status: "Completed",
    date:
      new Date().toLocaleString()
  });

  save();

  render();

  alert(
    `₹${fmt(p.reward)} reward added to your balance.`
  );
}


/* =========================================================
   DEPOSIT PAGE
========================================================= */

function showDeposit() {
  go("deposit");
}


function copyUPI() {

  const done = () =>
    alert(
      "UPI ID copied: " + UPI
    );

  if (
    navigator.clipboard
  ) {

    navigator.clipboard
      .writeText(UPI)
      .then(done)
      .catch(
        fallbackCopy
      );

  } else {

    fallbackCopy();
  }
}


function fallbackCopy() {

  const x =
    document.createElement(
      "textarea"
    );

  x.value = UPI;

  document.body.appendChild(x);

  x.select();

  document.execCommand(
    "copy"
  );

  x.remove();

  alert(
    "UPI ID copied: " + UPI
  );
}


/* =========================================================
   SCREENSHOT PREVIEW
========================================================= */

function previewScreenshot(
  event
) {

  const file =
    event?.target?.files?.[0];

  const preview =
    document.getElementById(
      "preview"
    );

  if (!preview) return;

  if (!file) {

    preview.innerHTML = "";

    return;
  }

  if (
    file.size >
    5 * 1024 * 1024
  ) {

    alert(
      "Screenshot must be under 5 MB."
    );

    event.target.value = "";

    preview.innerHTML = "";

    return;
  }

  const reader =
    new FileReader();

  reader.onload = e => {

    preview.innerHTML = `
      <img
        src="${e.target.result}"
        alt="Payment Screenshot"
      >
    `;
  };

  reader.readAsDataURL(
    file
  );
}


/* =========================================================
   DEPOSIT SUBMIT
========================================================= */

async function submitDeposit() {

  const amount =
    Number(
      document.getElementById(
        "depositAmount"
      )?.value
    );

  const utr =
    document.getElementById(
      "utr"
    )?.value.trim();

  const file =
    document.getElementById(
      "paymentScreenshot"
    )?.files?.[0];

  const msg =
    document.getElementById(
      "depositMsg"
    );

  if (
    !amount ||
    amount < 500 ||
    amount > 50000
  ) {

    msg.textContent =
      "Enter an amount between ₹500 and ₹50,000.";

    return;
  }

  if (!utr) {

    msg.textContent =
      "Enter UTR / Transaction ID.";

    return;
  }

  if (!file) {

    msg.textContent =
      "Upload payment screenshot.";

    return;
  }

  msg.textContent =
    "Uploading deposit request...";

  const base64 =
    await fileToBase64(
      file
    );

  const result =
    await api(
      "deposit",
      {
        amount: amount,
        utr: utr,
        screenshot:
          base64
      }
    );

  if (
    result &&
    result.success
  ) {

    const id =
      result.depositId ||
      result.requestId ||
      (
        "DEP-" +
        Date.now()
      );

    s.deposits.unshift({
      id: id,
      amount: amount,
      utr: utr,
      status:
        result.status ||
        "Pending",
      date:
        new Date().toLocaleString()
    });

    s.transactions.unshift({
      type: "Deposit",
      amount: amount,
      status:
        result.status ||
        "Pending",
      date:
        new Date().toLocaleString()
    });

    if (
      result.balance !==
      undefined
    ) {

      s.balance =
        Number(
          result.balance
        );
    }

    save();

    document.getElementById(
      "depositAmount"
    ).value = "";

    document.getElementById(
      "utr"
    ).value = "";

    document.getElementById(
      "paymentScreenshot"
    ).value = "";

    document.getElementById(
      "preview"
    ).innerHTML = "";

    msg.textContent =
      result.message ||
      "Deposit submitted successfully.";

    render();

  } else {

    msg.textContent =
      result?.message ||
      "Deposit submission failed.";
  }
}


/* =========================================================
   FILE TO BASE64
========================================================= */

function fileToBase64(
  file
) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();

      reader.onload = () =>
        resolve(
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


/* =========================================================
   WITHDRAW PAGE
========================================================= */

function showWithdraw() {
  go("withdraw");
}


/* =========================================================
   WITHDRAW SUBMIT
========================================================= */

async function submitWithdraw() {

  const amount =
    Number(
      document.getElementById(
        "withdrawAmount"
      )?.value
    );

  const bankName =
    document.getElementById(
      "bankName"
    )?.value.trim();

  const ifsc =
    document.getElementById(
      "ifsc"
    )?.value.trim()
    .toUpperCase();

  const holder =
    document.getElementById(
      "bank"
    )?.value.trim();

  const account =
    document.getElementById(
      "accountNumber"
    )?.value.trim();

  const confirmAccount =
    document.getElementById(
      "confirmAccount"
    )?.value.trim();

  const msg =
    document.getElementById(
      "withdrawMsg"
    );

  if (
    amount < 300 ||
    amount > 20000
  ) {

    msg.textContent =
      "Enter an amount between ₹300 and ₹20,000.";

    return;
  }

  if (
    amount >
    Number(s.balance)
  ) {

    msg.textContent =
      "Insufficient balance.";

    return;
  }

  if (
    !bankName ||
    !ifsc ||
    !holder ||
    !account ||
    !confirmAccount
  ) {

    msg.textContent =
      "Please fill all bank details.";

    return;
  }

  if (
    account !==
    confirmAccount
  ) {

    msg.textContent =
      "Account numbers do not match.";

    return;
  }

  if (
    !/^[A-Z]{4}0[A-Z0-9]{6}$/
      .test(ifsc)
  ) {

    msg.textContent =
      "Enter a valid IFSC code.";

    return;
  }

  msg.textContent =
    "Submitting withdrawal...";

  const result =
    await api(
      "withdraw",
      {
        amount: amount,
        accountHolder:
          holder,
        bankName:
          bankName,
        ifsc: ifsc,
        accountNumber:
          account
      }
    );

  if (
    result &&
    result.success
  ) {

    const id =
      result.withdrawalId ||
      result.requestId ||
      (
        "WDR-" +
        Date.now()
      );

    s.withdrawals.unshift({
      id: id,
      amount: amount,
      status:
        result.status ||
        "Pending",
      date:
        new Date().toLocaleString()
    });

    s.transactions.unshift({
      type: "Withdrawal",
      amount: amount,
      status:
        result.status ||
        "Pending",
      date:
        new Date().toLocaleString()
    });

    if (
      result.balance !==
      undefined
    ) {

      s.balance =
        Number(
          result.balance
        );

    } else {

      s.balance -=
        amount;
    }

    save();

    document.getElementById(
      "withdrawAmount"
    ).value = "";

    msg.textContent =
      result.message ||
      "Withdrawal request submitted.";

    render();

  } else {

    msg.textContent =
      result?.message ||
      "Withdrawal submission failed.";
  }
}


/* =========================================================
   HISTORY
========================================================= */

function renderHistory() {

  const d =
    document.getElementById(
      "depositHistoryList"
    );

  const w =
    document.getElementById(
      "withdrawHistoryList"
    );

  const t =
    document.getElementById(
      "transactionList"
    );


  if (d) {

    d.innerHTML =
      s.deposits.length

        ? s.deposits
            .map(x => `
              <div class="item">

                <b>
                  Deposit ₹${fmt(x.amount)}
                </b>

                <small>
                  ${safe(x.date)}
                </small>

                <p>
                  UTR:
                  ${safe(x.utr)}
                </p>

                <p>
                  Status:
                  ${safe(x.status)}
                </p>

              </div>
            `)
            .join("")

        : `
          <div class="item">
            No deposit requests.
          </div>
        `;
  }


  if (w) {

    w.innerHTML =
      s.withdrawals.length

        ? s.withdrawals
            .map(x => `
              <div class="item">

                <b>
                  Withdrawal ₹${fmt(x.amount)}
                </b>

                <small>
                  ${safe(x.date)}
                </small>

                <p>
                  Status:
                  ${safe(x.status)}
                </p>

              </div>
            `)
            .join("")

        : `
          <div class="item">
            No withdrawal requests.
          </div>
        `;
  }


  if (t) {

    t.innerHTML =
      s.transactions.length

        ? s.transactions
            .map(x => `
              <div class="item">

                <b>
                  ${safe(x.type)}
                  ₹${fmt(x.amount)}
                </b>

                <small>
                  ${safe(x.date)}
                </small>

                <p>
                  Status:
                  ${safe(x.status)}
                </p>

              </div>
            `)
            .join("")

        : `
          <div class="item">
            No transactions yet.
          </div>
        `;
  }
}


/* =========================================================
   INVITE
========================================================= */

function copyInvite() {

  const msg =
    document.getElementById(
      "inviteMsg"
    );

  const link =
    location.href;

  if (
    navigator.clipboard
  ) {

    navigator.clipboard
      .writeText(link)
      .then(() => {

        if (msg) {
          msg.textContent =
            "Invite link copied.";
        }
      })
      .catch(() => {

        if (msg) {
          msg.textContent =
            link;
        }
      });

  } else {

    if (msg) {
      msg.textContent =
        link;
    }
  }
}


function shareInvite() {

  const link =
    location.href;

  window.open(
    "https://wa.me/?text=" +
    encodeURIComponent(
      "Join NSG Wellfare:\n" +
      link
    ),
    "_blank"
  );
}


/* =========================================================
   SUPPORT
========================================================= */

function support() {

  window.open(
    SUPPORT,
    "_blank"
  );
}


/* =========================================================
   INITIALIZE DEVICE
========================================================= */

function initDevice() {

  let device =
    localStorage.getItem(
      "nsgDevice"
    );

  if (!device) {

    device =
      "DEV-" +
      Date.now() +
      "-" +
      Math.random()
        .toString(36)
        .slice(2, 10);

    localStorage.setItem(
      "nsgDevice",
      device
    );
  }
}


/* =========================================================
   INITIALIZE
========================================================= */

function init() {

  initDevice();

  render();

  updateNav("home");

  /*
   * Try to synchronize the account
   * with the server.
   */
  syncUser();
}


/* =========================================================
   SERVER USER SYNC
========================================================= */

async function syncUser() {

  const result =
    await api(
      "getUser"
    );

  if (
    !result ||
    !result.success
  ) {
    return;
  }

  /*
   * Accept common response formats.
   */
  const user =
    result.user ||
    result.data ||
    result;

  if (
    user.balance !==
    undefined
  ) {

    s.balance =
      Number(
        user.balance
      );
  }

  save();

  render();
}


/* =========================================================
   SCREENSHOT INPUT
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const input =
      document.getElementById(
        "paymentScreenshot"
      );

    if (input) {

      input.addEventListener(
        "change",
        function () {

          const file =
            this.files?.[0];

          const preview =
            document.getElementById(
              "preview"
            );

          if (!preview)
            return;

          if (!file) {

            preview.innerHTML =
              "";

            return;
          }

          if (
            file.size >
            5 * 1024 * 1024
          ) {

            alert(
              "Screenshot must be under 5 MB."
            );

            this.value = "";

            preview.innerHTML =
              "";

            return;
          }

          const reader =
            new FileReader();

          reader.onload =
            e => {

              preview.innerHTML = `
                <img
                  src="${e.target.result}"
                  alt="Payment Screenshot"
                >
              `;
            };

          reader.readAsDataURL(
            file
          );
        }
      );
    }

    init();
  }
);
