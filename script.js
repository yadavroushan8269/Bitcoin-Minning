/* =========================================================
   NSG WELLFARE - FINAL SCRIPT
   Deposit + Withdrawal + Google Apps Script
========================================================= */

const UPI = "yadav-rishab@fam";

const SUPPORT =
  "https://t.me/Hammerff7gcz";

/*
  IMPORTANT:
  Ye tumhara deployed Google Apps Script Web App URL hai.
*/
const API_URL =
  "https://script.google.com/macros/s/AKfycbyfiUUmlAnWfhoTrADnxKjOiuNT1K5v9qke90nj2GrU_5AH9jCSjl9cSLX_8V7yo3ID/exec";


/* =========================================================
   PLANS
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
  ) || {

    balance: 0,

    attendance: {},

    deposits: [],

    withdrawals: [],

    transactions: [],

    purchased: []

  };


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
   PAGE NAVIGATION
========================================================= */

function go(page) {

  document
    .querySelectorAll(".page")
    .forEach(function(p) {

      p.classList.remove("active");

    });


  const target =
    document.getElementById(page);


  if (target) {

    target.classList.add("active");

  }


  window.scrollTo(0, 0);

  render();

}


/* =========================================================
   RENDER
========================================================= */

function render() {

  const topBalance =
    document.getElementById("topBalance");

  const homeBalance =
    document.getElementById("homeBalance");

  const withdrawBalance =
    document.getElementById("withdrawBalance");

  const profileId =
    document.getElementById("profileId");

  const userIdHome =
    document.getElementById("userIdHome");

  const inviteLink =
    document.getElementById("inviteLink");


  if (topBalance) {

    topBalance.textContent =
      fmt(s.balance);

  }


  if (homeBalance) {

    homeBalance.textContent =
      fmt(s.balance);

  }


  if (withdrawBalance) {

    withdrawBalance.textContent =
      fmt(s.balance);

  }


  if (profileId) {

    profileId.textContent =
      userID();

  }


  if (userIdHome) {

    userIdHome.textContent =
      userID();

  }


  if (inviteLink) {

    inviteLink.value =
      location.href;

  }


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

          <h3>${p.name}</h3>

          <p>
            Product plan
          </p>

        </div>

        <div class="price">
          ₹${p.price}
        </div>

      </div>

      <ul>

        <li>
          Daily reward: ₹${p.reward}
        </li>

        <li>
          Terms and eligibility apply
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


  const homeProducts =
    document.getElementById(
      "homeProducts"
    );


  const productList =
    document.getElementById(
      "productList"
    );


  if (homeProducts) {

    homeProducts.innerHTML =
      html;

  }


  if (productList) {

    productList.innerHTML =
      html;

  }

}


/* =========================================================
   BUY PRODUCT
========================================================= */

function buy(i) {

  const p =
    plans.find(
      function(x) {
        return x.id === i;
      }
    );


  if (!p) {

    return;

  }


  if (
    s.purchased.includes(i)
  ) {

    return;

  }


  if (
    s.balance < p.price
  ) {

    alert(
      "Insufficient balance."
    );

    return;

  }


  s.balance -=
    p.price;


  s.purchased.push(i);


  s.transactions.unshift({

    type: "Product",

    amount: p.price,

    status: "Completed",

    date:
      new Date()
        .toLocaleString()

  });


  save();

  render();


  alert(
    "Product selected successfully."
  );

}


/* =========================================================
   ATTENDANCE
========================================================= */

let cd =
  new Date();


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


  const monthTitle =
    document.getElementById(
      "monthTitle"
    );


  const attCount =
    document.getElementById(
      "attCount"
    );


  if (
    !calendar ||
    !monthTitle
  ) {

    return;

  }


  const y =
    cd.getFullYear();


  const m =
    cd.getMonth();


  monthTitle.textContent =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        month: "long",
        year: "numeric"
      }
    ).format(cd);


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


    e.className =
      "day" +
      (
        s.attendance[k]
          ? " done"
          : ""
      ) +
      (
        d === now.getDate() &&
        m === now.getMonth() &&
        y === now.getFullYear()
          ? " today"
          : ""
      );


    e.textContent =
      d;


    e.onclick =
      function() {

        if (
          !s.attendance[k]
        ) {

          s.attendance[k] =
            1;

          save();

          renderCalendar();

        }

      };


    calendar.appendChild(e);

  }


  if (attCount) {

    attCount.textContent =
      Object.keys(
        s.attendance
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


  if (!box) {

    return;

  }


  if (
    !s.purchased.length
  ) {

    box.innerHTML =
      '<div class="item">No rewards available yet.</div>';

    return;

  }


  box.innerHTML =
    s.purchased

      .map(function(i) {

        const p =
          plans.find(
            function(x) {
              return x.id === i;
            }
          );


        if (!p) {

          return "";

        }


        return `

          <div class="item">

            <b>
              🎁 ${p.name}
            </b>

            <small>
              Daily reward: ₹${p.reward}
            </small>

          </div>

        `;

      })

      .join("");

}


/* =========================================================
   DEPOSIT PAGE
========================================================= */

function showDeposit() {

  go("deposit");

}


/* =========================================================
   COPY UPI
========================================================= */

function copyUPI() {

  if (
    navigator.clipboard
  ) {

    navigator.clipboard

      .writeText(UPI)

      .then(function() {

        alert(
          "UPI ID copied: " +
          UPI
        );

      })

      .catch(function() {

        fallbackCopy();

      });

  } else {

    fallbackCopy();

  }

}


function fallbackCopy() {

  const x =
    document.createElement(
      "textarea"
    );


  x.value =
    UPI;


  document.body.appendChild(x);


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
   FILE TO BASE64
========================================================= */

function fileToBase64(file) {

  return new Promise(
    function(resolve, reject) {

      const reader =
        new FileReader();


      reader.onload =
        function() {

          resolve(
            reader.result
          );

        };


      reader.onerror =
        function() {

          reject(
            new Error(
              "Unable to read screenshot"
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* =========================================================
   SCREENSHOT PREVIEW
========================================================= */

function setupScreenshotPreview() {

  const input =
    document.getElementById(
      "paymentScreenshot"
    );


  if (!input) {

    return;

  }


  input.addEventListener(
    "change",
    function() {

      const file =
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
        function(e) {

          preview.innerHTML = `

            <img
              src="${e.target.result}"
              alt="Screenshot preview"
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
   DEPOSIT SUBMIT
========================================================= */

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


  const msg =
    document.getElementById(
      "depositMsg"
    );


  const amount =
    Number(
      amountInput
        ? amountInput.value
        : 0
    );


  const utr =
    utrInput
      ? utrInput.value.trim()
      : "";


  const file =
    screenshotInput
      ? screenshotInput.files[0]
      : null;


  if (
    amount < 500 ||
    amount > 50000
  ) {

    if (msg) {

      msg.textContent =
        "Enter an amount between ₹500 and ₹50,000.";

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
        "Screenshot must be under 5 MB.";

    }

    return;

  }


  const requestId =
    "DEP-" +
    Date.now();


  const uid =
    userID();


  if (msg) {

    msg.textContent =
      "Submitting deposit request...";

  }


  try {

    const screenshot =
      await fileToBase64(
        file
      );


    const payload = {

      action:
        "deposit",

      userId:
        uid,

      requestId:
        requestId,

      amount:
        amount,

      utr:
        utr,

      screenshot:
        screenshot,

      screenshotName:
        file.name,

      screenshotType:
        file.type ||
        "image/jpeg"

    };


    /*
      no-cors is required for browser -> Apps Script.
      Apps Script receives the POST request.
    */

    await fetch(
      API_URL,
      {

        method:
          "POST",

        mode:
          "no-cors",

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


    /*
      Save local request history.
    */

    const r = {

      id:
        requestId,

      amount:
        amount,

      utr:
        utr,

      status:
        "Pending Verification",

      date:
        new Date()
          .toLocaleString()

    };


    s.deposits.unshift(r);


    s.transactions.unshift({

      type:
        "Deposit",

      amount:
        amount,

      status:
        "Pending Verification",

      date:
        r.date

    });


    save();


    if (amountInput) {

      amountInput.value =
        "";

    }


    if (utrInput) {

      utrInput.value =
        "";

    }


    if (screenshotInput) {

      screenshotInput.value =
        "";

    }


    const preview =
      document.getElementById(
        "preview"
      );


    if (preview) {

      preview.innerHTML =
        "";

    }


    if (msg) {

      msg.textContent =
        "Deposit request submitted successfully. Pending verification.";

    }


    render();


  } catch (error) {

    console.error(
      "Deposit error:",
      error
    );


    if (msg) {

      msg.textContent =
        "Unable to submit request. Please try again.";

    }

  }

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
      ).value
    );


  const name =
    document.getElementById(
      "bankName"
    ).value.trim();


  const ifsc =
    document.getElementById(
      "ifsc"
    ).value
      .trim()
      .toUpperCase();


  const bank =
    document.getElementById(
      "bank"
    ).value.trim();


  const account =
    document.getElementById(
      "accountNumber"
    ).value.trim();


  const confirmAccount =
    document.getElementById(
      "confirmAccount"
    ).value.trim();


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
    s.balance
  ) {

    msg.textContent =
      "Insufficient balance.";

    return;

  }


  if (
    !name ||
    !ifsc ||
    !bank ||
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


  const requestId =
    "WDR-" +
    Date.now();


  const uid =
    userID();


  msg.textContent =
    "Submitting withdrawal request...";


  try {

    const payload = {

      action:
        "withdrawal",

      userId:
        uid,

      requestId:
        requestId,

      amount:
        amount,

      accountHolder:
        name,

      ifsc:
        ifsc,

      bankName:
        bank,

      accountNumber:
        account

    };


    await fetch(
      API_URL,
      {

        method:
          "POST",

        mode:
          "no-cors",

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


    const r = {

      id:
        requestId,

      amount:
        amount,

      status:
        "Pending",

      date:
        new Date()
          .toLocaleString()

    };


    s.withdrawals.unshift(r);


    s.transactions.unshift({

      type:
        "Withdrawal",

      amount:
        amount,

      status:
        "Pending",

      date:
        r.date

    });


    s.balance -=
      amount;


    save();


    document.getElementById(
      "withdrawAmount"
    ).value =
      "";


    document.getElementById(
      "bankName"
    ).value =
      "";


    document.getElementById(
      "ifsc"
    ).value =
      "";


    document.getElementById(
      "bank"
    ).value =
      "";


    document.getElementById(
      "accountNumber"
    ).value =
      "";


    document.getElementById(
      "confirmAccount"
    ).value =
      "";


    msg.textContent =
      "Withdrawal request submitted successfully. Pending verification.";


    render();


  } catch (error) {

    console.error(
      "Withdrawal error:",
      error
    );


    msg.textContent =
      "Unable to submit request. Please try again.";

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

        ?

        s.deposits

          .map(function(x) {

            return `

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

            `;

          })

          .join("")

        :

        '<div class="item">No deposit requests.</div>';

  }


  if (w) {

    w.innerHTML =
      s.withdrawals.length

        ?

        s.withdrawals

          .map(function(x) {

            return `

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

            `;

          })

          .join("")

        :

        '<div class="item">No withdrawal requests.</div>';

  }


  if (t) {

    t.innerHTML =
      s.transactions.length

        ?

        s.transactions

          .map(function(x) {

            return `

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

            `;

          })

          .join("")

        :

        '<div class="item">No transactions yet.</div>';

  }

}


/* =========================================================
   HTML SECURITY
========================================================= */

function safe(x) {

  return String(
    x || ""
  )
    .replace(
      /[&<>"']/g,
      function(a) {

        return {

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

        }[a];

      }
    );

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

      .then(function() {

        if (msg) {

          msg.textContent =
            "Invite link copied.";

        }

      })

      .catch(function() {

        if (msg) {

          msg.textContent =
            location.href;

        }

      });

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
   START
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    setupScreenshotPreview();

    render();

  }
);
