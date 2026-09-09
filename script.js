/* =========================================================
   NSG WELLFARE - SCRIPT.JS
   PRODUCT + DAILY REWARD + DEPOSIT + WITHDRAWAL
========================================================= */


/* =========================================================
   CONFIG
========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyvDFs6hUu-jSEwOCk9s0exPJXGtCtMc3LiADj_0jZFsyuLSmTHskmf3W-b9H1o-QBK/exec";

const UPI =
  "yadav-rishab@fam";

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

let s =
  JSON.parse(
    localStorage.getItem("nsgState") || "null"
  ) ||
  {
    balance: 0,
    attendance: {},
    deposits: [],
    withdrawals: [],
    transactions: [],
    purchased: [],
    rewards: []
  };


if (!Array.isArray(s.deposits)) {
  s.deposits = [];
}

if (!Array.isArray(s.withdrawals)) {
  s.withdrawals = [];
}

if (!Array.isArray(s.transactions)) {
  s.transactions = [];
}

if (!Array.isArray(s.purchased)) {
  s.purchased = [];
}

if (!Array.isArray(s.rewards)) {
  s.rewards = [];
}


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
   FORMAT
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
   API REQUEST HELPER
========================================================= */

async function apiPost(payload) {

  const response =
    await fetch(
      API_URL,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      }
    );

  const text =
    await response.text();

  let result;

  try {

    result =
      JSON.parse(text);

  } catch (e) {

    throw new Error(
      "Invalid server response."
    );

  }

  if (
    result.ok === false ||
    result.success === false
  ) {

    throw new Error(
      result.message ||
      result.error ||
      "Request failed."
    );

  }

  return result;

}


/* =========================================================
   API GET
========================================================= */

async function apiGet(
  action,
  extra = {}
) {

  const params =
    new URLSearchParams();

  params.set(
    "action",
    action
  );

  Object.keys(extra).forEach(
    key => {

      if (
        extra[key] !== undefined &&
        extra[key] !== null
      ) {

        params.set(
          key,
          extra[key]
        );

      }

    }
  );

  const response =
    await fetch(
      API_URL +
      "?" +
      params.toString()
    );

  const text =
    await response.text();

  let result;

  try {

    result =
      JSON.parse(text);

  } catch (e) {

    throw new Error(
      "Invalid server response."
    );

  }

  return result;

}


/* =========================================================
   OPEN PAGE
========================================================= */

function go(page) {

  document
    .querySelectorAll(".page")
    .forEach(
      p =>
        p.classList.remove(
          "active"
        )
    );

  const target =
    document.getElementById(page);

  if (target) {

    target.classList.add(
      "active"
    );

  }

  window.scrollTo(
    0,
    0
  );

  render();

  if (page === "rewards") {

    loadRewards();

  }

}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function render() {

  setText(
    "topBalance",
    fmt(s.balance)
  );

  setText(
    "homeBalance",
    fmt(s.balance)
  );

  setText(
    "withdrawBalance",
    fmt(s.balance)
  );

  setText(
    "profileId",
    userID()
  );

  setText(
    "userIdHome",
    userID()
  );

  const invite =
    document.getElementById(
      "inviteLink"
    );

  if (invite) {

    invite.value =
      location.href;

  }

  renderProducts();

  renderCalendar();

  renderRewards();

  renderHistory();

}


/* =========================================================
   SAFE TEXT
========================================================= */

function setText(
  id,
  value
) {

  const el =
    document.getElementById(id);

  if (el) {

    el.textContent =
      value;

  }

}


/* =========================================================
   PRODUCT HTML
========================================================= */

function productHTML(p) {

  const bought =
    s.purchased.includes(
      p.id
    );

  return `

    <div class="product">

      <div class="productTop">

        <div>

          <h3>
            ${safe(p.name)}
          </h3>

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


/* =========================================================
   RENDER PRODUCTS
========================================================= */

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

  if (home) {

    home.innerHTML =
      html;

  }

  if (list) {

    list.innerHTML =
      html;

  }

}


/* =========================================================
   BUY PRODUCT
========================================================= */

async function buy(productId) {

  const product =
    plans.find(
      p =>
        p.id ===
        Number(productId)
    );

  if (!product) {

    return;

  }


  if (
    s.purchased.includes(
      product.id
    )
  ) {

    alert(
      "This product is already purchased."
    );

    return;

  }


  const confirmed =
    confirm(
      product.name +
      "\n\nPrice: ₹" +
      fmt(product.price) +
      "\nDaily Reward: ₹" +
      fmt(product.reward) +
      "\n\nReward starts today.\n\nContinue?"
    );

  if (!confirmed) {

    return;

  }


  try {

    const result =
      await apiPost({

        action:
          "createPurchase",

        requestId:
          "PUR-" +
          Date.now(),

        userId:
          userID(),

        userKey:
          userID(),

        productId:
          product.id

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


    if (
      !s.purchased.includes(
        product.id
      )
    ) {

      s.purchased.push(
        product.id
      );

    }


    s.transactions.unshift({

      type:
        "Product Purchase",

      amount:
        product.price,

      status:
        "Completed",

      date:
        new Date()
          .toLocaleString()

    });


    save();

    render();

    await loadRewards();

    alert(
      product.name +
      " purchased successfully.\n\n" +
      "Today's reward of ₹" +
      fmt(product.reward) +
      " is available in Reward Today."
    );


  } catch (error) {

    console.error(
      "Purchase error:",
      error
    );

    alert(
      error.message ||
      "Product purchase failed."
    );

  }

}


/* =========================================================
   CALENDAR
========================================================= */

let cd =
  new Date();


function month(value) {

  cd.setMonth(
    cd.getMonth() +
    Number(value)
  );

  renderCalendar();

}


function key(
  y,
  m,
  d
) {

  return (
    y +
    "-" +
    String(
      m + 1
    ).padStart(2, "0") +
    "-" +
    String(d).padStart(
      2,
      "0"
    )
  );

}


/* =========================================================
   RENDER CALENDAR
========================================================= */

function renderCalendar() {

  const calendar =
    document.getElementById(
      "calendar"
    );

  const title =
    document.getElementById(
      "monthTitle"
    );

  if (!calendar || !title) {

    return;

  }


  const y =
    cd.getFullYear();

  const m =
    cd.getMonth();


  title.textContent =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        month:
          "long",
        year:
          "numeric"
      }
    ).format(cd);


  calendar.innerHTML =
    "";


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
      key(
        y,
        m,
        d
      );


    const e =
      document.createElement(
        "div"
      );


    e.className =
      "day";


    if (
      s.attendance[k]
    ) {

      e.classList.add(
        "done"
      );

      e.classList.add(
        "attended"
      );

    }


    if (
      d ===
        now.getDate() &&
      m ===
        now.getMonth() &&
      y ===
        now.getFullYear()
    ) {

      e.classList.add(
        "today"
      );

    }


    e.textContent =
      d;


    e.onclick =
      () => markTodayAttendance(
        k
      );


    calendar.appendChild(
      e
    );

  }


  setText(
    "attCount",
    Object.keys(
      s.attendance
    ).length
  );

  setText(
    "attendanceTotal",
    Object.keys(
      s.attendance
    ).length
  );

}


/* =========================================================
   ATTENDANCE
========================================================= */

async function markTodayAttendance(
  dateKey
) {

  const today =
    localDateString();


  if (
    dateKey !==
    today
  ) {

    alert(
      "Attendance can only be marked for today."
    );

    return;

  }


  if (
    s.attendance[
      dateKey
    ]
  ) {

    return;

  }


  try {

    const result =
      await apiPost({

        action:
          "markAttendance",

        userId:
          userID(),

        userKey:
          userID(),

        date:
          dateKey

      });


    s.attendance[
      dateKey
    ] = 1;

    save();

    renderCalendar();


  } catch (error) {

    console.error(
      "Attendance error:",
      error
    );

    alert(
      error.message ||
      "Attendance could not be marked."
    );

  }

}


/* =========================================================
   REWARD TODAY
========================================================= */

async function loadRewards() {

  try {

    const result =
      await apiGet(
        "userRewards",
        {
          userId:
            userID(),

          userKey:
            userID()
        }
      );


    if (
      !result.ok &&
      result.success !== true
    ) {

      return;

    }


    const purchases =
      result.purchases ||
      result.rewards ||
      [];


    if (
      result.balance !==
      undefined
    ) {

      s.balance =
        Number(
          result.balance
        );

    }


    s.serverRewards =
      purchases;


    save();

    renderRewards();

    render();


  } catch (error) {

    console.log(
      "Reward loading:",
      error
    );

    renderRewards();

  }

}


/* =========================================================
   RENDER REWARDS
========================================================= */

function renderRewards() {

  const box =
    document.getElementById(
      "rewardsList"
    );

  if (!box) {

    return;

  }


  const serverRewards =
    Array.isArray(
      s.serverRewards
    )
      ? s.serverRewards
      : [];


  /*
     If server data is available,
     use it.
  */

  if (
    serverRewards.length
  ) {

    box.innerHTML =
      serverRewards
        .map(
          renderServerReward
        )
        .join("");

    return;

  }


  /*
     Fallback for products already
     stored locally.
  */

  if (
    !s.purchased.length
  ) {

    box.innerHTML = `

      <div class="reward-item">

        <b>
          No purchased products
        </b>

        <p>
          Purchase a product to receive daily rewards.
        </p>

      </div>

    `;

    return;

  }


  box.innerHTML =
    s.purchased
      .map(
        productId => {

          const p =
            plans.find(
              x =>
                x.id ===
                productId
            );

          if (!p) {

            return "";

          }


          return `

            <div class="reward-item">

              <b>
                🎁 ${safe(p.name)}
              </b>

              <p>
                Daily Reward:
                ₹${fmt(p.reward)}
              </p>

              <button
                class="primary-btn"
                onclick="claimReward(${p.id})"
              >
                Claim Reward
              </button>

            </div>

          `;

        }
      )
      .join("");

}


/* =========================================================
   SERVER REWARD HTML
========================================================= */

function renderServerReward(
  item
) {

  const productId =
    Number(
      item.productId ||
      item.productID ||
      item.id
    );


  const p =
    plans.find(
      x =>
        x.id ===
        productId
    );


  const name =
    item.productName ||
    (p ? p.name : "Product");


  const daily =
    Number(
      item.dailyReward ||
      item.reward ||
      (p ? p.reward : 0)
    );


  const purchaseId =
    item.purchaseId ||
    item.id;


  const claimAvailable =
    item.claimAvailable !==
    false;


  if (
    !claimAvailable
  ) {

    return `

      <div class="reward-item">

        <b>
          🎁 ${safe(name)}
        </b>

        <p>
          Daily Reward:
          ₹${fmt(daily)}
        </p>

        <p>
          ✓ Reward already claimed today
        </p>

        <button
          class="secondary-btn"
          disabled
        >
          ✓ Claimed Today
        </button>

      </div>

    `;

  }


  return `

    <div class="reward-item">

      <b>
        🎁 ${safe(name)}
      </b>

      <p>
        Daily Reward:
        ₹${fmt(daily)}
      </p>

      <p>
        Reward is available today.
      </p>

      <button
        class="primary-btn"
        onclick="claimReward('${safeAttr(purchaseId)}')"
      >
        Claim Reward
      </button>

    </div>

  `;

}


/* =========================================================
   CLAIM REWARD
========================================================= */

async function claimReward(
  purchaseId
) {

  if (!purchaseId) {

    alert(
      "Invalid purchase."
    );

    return;

  }


  const button =
    event &&
    event.target
      ? event.target
      : null;


  if (button) {

    button.disabled =
      true;

    button.textContent =
      "Claiming...";

  }


  try {

    const result =
      await apiPost({

        action:
          "claimReward",

        userId:
          userID(),

        userKey:
          userID(),

        purchaseId:
          purchaseId

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


    /*
       Save local transaction
    */

    const amount =
      Number(
        result.amount ||
        result.reward ||
        0
      );


    s.rewards.push({

      purchaseId:
        purchaseId,

      amount:
        amount,

      date:
        localDateString()

    });


    s.transactions.unshift({

      type:
        "Daily Reward",

      amount:
        amount,

      status:
        "Completed",

      date:
        new Date()
          .toLocaleString()

    });


    save();

    render();

    await loadRewards();


    alert(
      "Reward claimed successfully.\n\n" +
      "₹" +
      fmt(amount) +
      " has been added to your balance."
    );


  } catch (error) {

    console.error(
      "Claim reward error:",
      error
    );

    alert(
      error.message ||
      "Reward claim failed."
    );

    if (button) {

      button.disabled =
        false;

      button.textContent =
        "Claim Reward";

    }

  }

}


/* =========================================================
   DEPOSIT
========================================================= */

function showDeposit() {

  go("deposit");

}


function copyUPI() {

  if (
    navigator.clipboard
  ) {

    navigator.clipboard
      .writeText(UPI)
      .then(
        () =>
          alert(
            "UPI ID copied: " +
            UPI
          )
      )
      .catch(
        fallbackCopyUPI
      );

  } else {

    fallbackCopyUPI();

  }

}


function fallbackCopyUPI() {

  const x =
    document.createElement(
      "textarea"
    );

  x.value =
    UPI;

  document.body.appendChild(
    x
  );

  x.select();

  document.execCommand(
    "copy"
  );

  x.remove();

  alert(
    "UPI ID copied: " +
    UPI
  );

}


/* =========================================================
   SCREENSHOT PREVIEW
========================================================= */

function setupScreenshot() {

  const input =
    document.getElementById(
      "paymentScreenshot"
    );

  if (!input) {

    return;

  }


  input.addEventListener(
    "change",
    function () {

      const file =
        this.files &&
        this.files[0];


      const preview =
        document.getElementById(
          "preview"
        );


      if (!preview) {

        return;

      }


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

        this.value =
          "";

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
              alt="Payment screenshot"
              style="
                max-width:100%;
                border-radius:10px;
                margin-top:10px;
              "
            >

          `;

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================================
   FILE TO BASE64
========================================================= */

function fileToBase64(
  file
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader();

      reader.onload =
        () => {

          const result =
            String(
              reader.result ||
              ""
            );

          resolve(
            result.split(
              ","
            )[1] || ""
          );

        };

      reader.onerror =
        reject;

      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================================
   SUBMIT DEPOSIT
========================================================= */

async function submitDeposit() {

  const amount =
    Number(
      document.getElementById(
        "depositAmount"
      )?.value || 0
    );


  const utr =
    document.getElementById(
      "utr"
    )?.value.trim() || "";


  const file =
    document.getElementById(
      "paymentScreenshot"
    )?.files?.[0];


  const msg =
    document.getElementById(
      "depositMsg"
    );


  const btn =
    document.querySelector(
      '#deposit button[onclick="submitDeposit()"]'
    );


  if (
    amount < 500 ||
    amount > 20000
  ) {

    if (msg) {

      msg.textContent =
        "Enter an amount between ₹500 and ₹20,000.";

    }

    return;

  }


  if (!utr) {

    if (msg) {

      msg.textContent =
        "Enter UTR / Transaction ID.";

    }

    return;

  }


  if (!file) {

    if (msg) {

      msg.textContent =
        "Upload payment screenshot.";

    }

    return;

  }


  if (
    file.size >
    5 * 1024 * 1024
  ) {

    if (msg) {

      msg.textContent =
        "Screenshot must be 5 MB or smaller.";

    }

    return;

  }


  if (btn) {

    btn.disabled =
      true;

    btn.textContent =
      "Submitting...";

  }


  if (msg) {

    msg.textContent =
      "Submitting deposit request...";

  }


  try {

    const base64 =
      await fileToBase64(
        file
      );


    const requestId =
      "DEP-" +
      Date.now();


    const result =
      await apiPost({

        action:
          "createDeposit",

        requestId:
          requestId,

        userId:
          userID(),

        userKey:
          userID(),

        amount:
          amount,

        utr:
          utr,

        screenshot:
          base64,

        screenshotName:
          file.name,

        screenshotType:
          file.type ||
          "image/jpeg"

      });


    const id =
      result.requestId ||
      requestId;


    s.deposits.unshift({

      id:
        id,

      amount:
        amount,

      utr:
        utr,

      status:
        "Pending Verification",

      date:
        new Date()
          .toLocaleString()

    });


    s.transactions.unshift({

      type:
        "Deposit",

      amount:
        amount,

      status:
        "Pending Verification",

      date:
        new Date()
          .toLocaleString()

    });


    save();


    const amountEl =
      document.getElementById(
        "depositAmount"
      );

    const utrEl =
      document.getElementById(
        "utr"
      );

    const screenshotEl =
      document.getElementById(
        "paymentScreenshot"
      );

    const preview =
      document.getElementById(
        "preview"
      );


    if (amountEl) {

      amountEl.value =
        "";

    }

    if (utrEl) {

      utrEl.value =
        "";

    }

    if (screenshotEl) {

      screenshotEl.value =
        "";

    }

    if (preview) {

      preview.innerHTML =
        "";

    }


    if (msg) {

      msg.textContent =
        "Deposit submitted successfully. Waiting for admin verification.";

    }


    render();

    pollDeposit(
      id
    );


  } catch (error) {

    console.error(
      "Deposit error:",
      error
    );

    if (msg) {

      msg.textContent =
        "Deposit failed: " +
        (
          error.message ||
          "Please try again."
        );

    }

  } finally {

    if (btn) {

      btn.disabled =
        false;

      btn.textContent =
        "Submit Deposit Request";

    }

  }

}


/* =========================================================
   POLL DEPOSIT
========================================================= */

function pollDeposit(
  requestId
) {

  let tries =
    0;


  const timer =
    setInterval(
      async () => {

        tries++;


        try {

          const result =
            await apiGet(
              "depositStatus",
              {
                requestId:
                  requestId,

                userId:
                  userID()
              }
            );


          if (
            result.ok &&
            (
              result.status ===
                "APPROVED" ||
              result.status ===
                "REJECTED"
            )
          ) {

            clearInterval(
              timer
            );


            const deposit =
              s.deposits.find(
                x =>
                  x.id ===
                  requestId
              );


            if (deposit) {

              deposit.status =
                result.status ===
                "APPROVED"
                  ? "Approved"
                  : "Rejected";

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


            save();

            render();


            const msg =
              document.getElementById(
                "depositMsg"
              );


            if (msg) {

              msg.textContent =
                result.status ===
                "APPROVED"
                  ? "Deposit approved. Balance updated."
                  : "Deposit rejected by admin.";

            }

          }

        } catch (error) {

          console.log(
            "Deposit status:",
            error
          );

        }


        if (
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


/* =========================================================
   WITHDRAWAL
========================================================= */

function showWithdraw() {

  go("withdraw");

}


/* =========================================================
   SUBMIT WITHDRAWAL
========================================================= */

async function submitWithdraw() {

  const amount =
    Number(
      document.getElementById(
        "withdrawAmount"
      )?.value || 0
    );


  const name =
    document.getElementById(
      "bankName"
    )?.value.trim() || "";


  const ifsc =
    document.getElementById(
      "ifsc"
    )?.value.trim()
      .toUpperCase() || "";


  const bank =
    document.getElementById(
      "bank"
    )?.value.trim() || "";


  const account =
    document.getElementById(
      "accountNumber"
    )?.value.trim() || "";


  const confirmAccount =
    document.getElementById(
      "confirmAccount"
    )?.value.trim() || "";


  const msg =
    document.getElementById(
      "withdrawMsg"
    );


  const btn =
    document.querySelector(
      '#withdraw button[onclick="submitWithdraw()"]'
    );


  if (
    amount < 300 ||
    amount > 10000
  ) {

    if (msg) {

      msg.textContent =
        "Enter an amount between ₹300 and ₹10,000.";

    }

    return;

  }


  if (
    amount >
    Number(s.balance || 0)
  ) {

    if (msg) {

      msg.textContent =
        "Insufficient balance.";

    }

    return;

  }


  if (
    !name ||
    !ifsc ||
    !bank ||
    !account ||
    !confirmAccount
  ) {

    if (msg) {

      msg.textContent =
        "Please fill all bank details.";

    }

    return;

  }


  if (
    account !==
    confirmAccount
  ) {

    if (msg) {

      msg.textContent =
        "Account numbers do not match.";

    }

    return;

  }


  if (
    !/^[A-Z]{4}0[A-Z0-9]{6}$/
      .test(ifsc)
  ) {

    if (msg) {

      msg.textContent =
        "Enter a valid IFSC code.";

    }

    return;

  }


  if (btn) {

    btn.disabled =
      true;

    btn.textContent =
      "Submitting...";

  }


  if (msg) {

    msg.textContent =
      "Submitting withdrawal request...";

  }


  try {

    const requestId =
      "WDR-" +
      Date.now();


    const result =
      await apiPost({

        action:
          "createWithdrawal",

        requestId:
          requestId,

        userId:
          userID(),

        userKey:
          userID(),

        amount:
          amount,

        accountHolder:
          name,

        holderName:
          name,

        name:
          name,

        bankName:
          bank,

        bank:
          bank,

        ifsc:
          ifsc,

        accountNumber:
          account

      });


    const id =
      result.requestId ||
      requestId;


    if (
      result.balance !==
      undefined
    ) {

      s.balance =
        Number(
          result.balance
        );

    } else {

      s.balance =
        Number(
          s.balance
        ) -
        amount;

    }


    s.withdrawals.unshift({

      id:
        id,

      amount:
        amount,

      status:
        "Pending",

      date:
        new Date()
          .toLocaleString()

    });


    s.transactions.unshift({

      type:
        "Withdrawal",

      amount:
        amount,

      status:
        "Pending",

      date:
        new Date()
          .toLocaleString()

    });


    save();


    const amountEl =
      document.getElementById(
        "withdrawAmount"
      );

    if (amountEl) {

      amountEl.value =
        "";

    }


    if (msg) {

      msg.textContent =
        "Withdrawal request submitted. Waiting for admin verification.";

    }


    render();

    pollWithdrawal(
      id
    );


  } catch (error) {

    console.error(
      "Withdrawal error:",
      error
    );

    if (msg) {

      msg.textContent =
        "Withdrawal failed: " +
        (
          error.message ||
          "Please try again."
        );

    }

  } finally {

    if (btn) {

      btn.disabled =
        false;

      btn.textContent =
        "Submit Withdrawal Request";

    }

  }

}


/* =========================================================
   POLL WITHDRAWAL
========================================================= */

function pollWithdrawal(
  requestId
) {

  let tries =
    0;


  const timer =
    setInterval(
      async () => {

        tries++;


        try {

          const result =
            await apiGet(
              "withdrawalStatus",
              {
                requestId:
                  requestId,

                userId:
                  userID()
              }
            );


          if (
            result.ok &&
            (
              result.status ===
                "APPROVED" ||
              result.status ===
                "REJECTED"
            )
          ) {

            clearInterval(
              timer
            );


            const item =
              s.withdrawals.find(
                x =>
                  x.id ===
                  requestId
              );


            if (item) {

              item.status =
                result.status ===
                "APPROVED"
                  ? "Approved"
                  : "Rejected";

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


            save();

            render();


            const msg =
              document.getElementById(
                "withdrawMsg"
              );


            if (msg) {

              msg.textContent =
                result.status ===
                "APPROVED"
                  ? "Withdrawal approved."
                  : "Withdrawal rejected. Amount returned to balance.";

            }

          }

        } catch (error) {

          console.log(
            "Withdrawal status:",
            error
          );

        }


        if (
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
            .map(
              x => `

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

              `
            )
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
            .map(
              x => `

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

              `
            )
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
            .map(
              x => `

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

              `
            )
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

function shareInvite() {

  window.open(
    "https://wa.me/?text=" +
      encodeURIComponent(
        "Join NSG Wellfare: " +
        location.href
      ),
    "_blank"
  );

}


function copyInvite() {

  const msg =
    document.getElementById(
      "inviteMsg"
    );


  if (
    navigator.clipboard
  ) {

    navigator.clipboard
      .writeText(
        location.href
      )
      .then(
        () => {

          if (msg) {

            msg.textContent =
              "Invite link copied.";

          }

        }
      )
      .catch(
        () => {

          if (msg) {

            msg.textContent =
              location.href;

          }

        }
      );

  } else {

    if (msg) {

      msg.textContent =
        location.href;

    }

  }

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
   LOCAL DATE
========================================================= */

function localDateString() {

  const d =
    new Date();


  return (
    d.getFullYear() +
    "-" +
    String(
      d.getMonth() + 1
    ).padStart(2, "0") +
    "-" +
    String(
      d.getDate()
    ).padStart(2, "0")
  );

}


/* =========================================================
   HTML SAFE
========================================================= */

function safe(value) {

  return String(
    value == null
      ? ""
      : value
  )
    .replace(
      /[&<>"']/g,
      a =>
        ({
          "&":
            "&amp;",
          "<":
            "&lt;",
          ">":
            "&gt;",
          '"':
            "&quot;",
          "'":
            "&#039;"
        }[a])
    );

}


function safeAttr(value) {

  return safe(
    value
  ).replace(
    /`/g,
    "&#096;"
  );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    setupScreenshot();

    render();

    /*
       Load server rewards after
       page starts.
    */

    loadRewards();

  }
);


/*
   In case script is loaded after
   DOM is already ready.
*/

if (
  document.readyState !==
  "loading"
) {

  setupScreenshot();

  render();

  loadRewards();

}
