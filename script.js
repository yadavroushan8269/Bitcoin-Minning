/* =========================================================
   NSG WELLFARE - MAIN SCRIPT
   ========================================================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycby6bTl_tUL1STJtWO8jQaXzjQSOhDLgvxj_2UWuI6VJBhh0ehwpCFSlQMhpDn57MfNtow/exec";

const SUPPORT_URL = "https://t.me/Hammerff7gcz";

let authToken = localStorage.getItem("nsgAuthToken") || "";

let user = null;

try {
  user = JSON.parse(localStorage.getItem("nsgUser") || "null");
} catch (e) {
  user = null;
}

let currentMonth = new Date();


/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}


function showMessage(id, text) {
  const element = $(id);

  if (element) {
    element.textContent = text;
  }
}


function money(value) {
  const number = Number(value || 0);

  return "₹" + number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


function cleanMobile(value) {
  return String(value || "")
    .replace(/\D/g, "")
    .replace(/^91/, "")
    .slice(-10);
}


function validMobile(value) {
  return /^\d{10}$/.test(cleanMobile(value));
}


function validPassword(value) {
  return (
    value.length >= 8 &&
    /[A-Za-z]/.test(value) &&
    /\d/.test(value)
  );
}


/* =========================================================
   API
   ========================================================= */

async function apiPost(data) {

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data)
  });

  const text = await response.text();

  let result;

  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error("Server response is not valid.");
  }

  return result;
}


async function apiGet(data) {

  const query = new URLSearchParams(data);

  const response = await fetch(
    API_URL + "?" + query.toString()
  );

  const text = await response.text();

  let result;

  try {
    result = JSON.parse(text);
  } catch (error) {
    throw new Error("Server response is not valid.");
  }

  return result;
}


/* =========================================================
   AUTH SCREEN
   ========================================================= */

function showSignup() {

  $("loginBox").classList.add("hidden");
  $("signupBox").classList.remove("hidden");

  showMessage("authMsg", "");
}


function showLogin() {

  $("signupBox").classList.add("hidden");
  $("loginBox").classList.remove("hidden");

  showMessage("authMsg", "");
}


/* =========================================================
   REGISTER
   ========================================================= */

async function register() {

  const mobile = cleanMobile($("signupMobile").value);

  const password =
    $("signupPassword").value;

  const confirmPassword =
    $("signupConfirm").value;


  if (!validMobile(mobile)) {

    showMessage(
      "authMsg",
      "Enter a valid 10 digit mobile number."
    );

    return;
  }


  if (!validPassword(password)) {

    showMessage(
      "authMsg",
      "Password must be 8+ characters with letters and numbers."
    );

    return;
  }


  if (password !== confirmPassword) {

    showMessage(
      "authMsg",
      "Passwords do not match."
    );

    return;
  }


  $("signupBtn").disabled = true;

  showMessage(
    "authMsg",
    "Creating your account..."
  );


  try {

    const result = await apiPost({

      action: "register",

      mobile: "+91" + mobile,

      password: password

    });


    if (!result.ok) {

      throw new Error(
        result.error ||
        "Registration failed."
      );

    }


    authToken =
      result.token ||
      result.sessionToken ||
      "";


    user =
      result.user ||
      {
        mobile: "+91" + mobile,
        userKey: result.userKey || ""
      };


    localStorage.setItem(
      "nsgAuthToken",
      authToken
    );


    localStorage.setItem(
      "nsgUser",
      JSON.stringify(user)
    );


    /*
      Registration successful.

      User is immediately taken to HOME.
    */

    showApp();

    openPage("home");

    fillUserData();

    await refreshBalance();

    await loadTransactions();


    showMessage(
      "authMsg",
      ""
    );

  } catch (error) {

    showMessage(
      "authMsg",
      error.message ||
      "Registration failed."
    );

  } finally {

    $("signupBtn").disabled = false;

  }
}


/* =========================================================
   LOGIN
   ========================================================= */

async function login() {

  const mobile =
    cleanMobile($("loginMobile").value);

  const password =
    $("loginPassword").value;


  if (!validMobile(mobile)) {

    showMessage(
      "authMsg",
      "Enter a valid 10 digit mobile number."
    );

    return;
  }


  if (!password) {

    showMessage(
      "authMsg",
      "Enter your password."
    );

    return;
  }


  $("loginBtn").disabled = true;

  showMessage(
    "authMsg",
    "Logging in..."
  );


  try {

    const result = await apiPost({

      action: "login",

      mobile: "+91" + mobile,

      password: password

    });


    if (!result.ok) {

      throw new Error(
        result.error ||
        "Wrong details pls try again"
      );

    }


    authToken =
      result.token ||
      result.sessionToken ||
      "";


    user =
      result.user ||
      {};


    localStorage.setItem(
      "nsgAuthToken",
      authToken
    );


    localStorage.setItem(
      "nsgUser",
      JSON.stringify(user)
    );


    showApp();

    openPage("home");

    fillUserData();

    await refreshBalance();

    await loadTransactions();


    showMessage(
      "authMsg",
      ""
    );

  } catch (error) {

    showMessage(
      "authMsg",
      error.message ||
      "Wrong details pls try again"
    );

  } finally {

    $("loginBtn").disabled = false;

  }
}


/* =========================================================
   SHOW APP
   ========================================================= */

function showApp() {

  $("authScreen").classList.add("hidden");

  $("app").classList.remove("hidden");

  fillUserData();

}


/* =========================================================
   USER DATA
   ========================================================= */

function fillUserData() {

  if (!user) return;


  const mobile =
    user.mobile ||
    user.phone ||
    "—";


  const userKey =
    user.userKey ||
    user.key ||
    "—";


  if ($("homeUser")) {
    $("homeUser").textContent =
      userKey;
  }


  if ($("infoMobile")) {
    $("infoMobile").textContent =
      mobile;
  }


  if ($("infoUserKey")) {
    $("infoUserKey").textContent =
      userKey;
  }

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

  try {

    if (authToken) {

      await apiPost({

        action: "logout",

        token: authToken

      });

    }

  } catch (error) {
    console.log(error);
  }


  localStorage.removeItem(
    "nsgAuthToken"
  );

  localStorage.removeItem(
    "nsgUser"
  );


  authToken = "";

  user = null;


  location.reload();

}


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function openPage(pageId) {

  const pages =
    document.querySelectorAll(".page");


  pages.forEach(function(page) {

    page.classList.remove("active");

  });


  const page =
    $(pageId);


  if (!page) return;


  page.classList.add("active");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  if (pageId === "products") {

    renderProducts();

  }


  if (pageId === "attendance") {

    renderCalendar();

  }


  if (pageId === "depositHistory") {

    loadDepositHistory();

  }


  if (pageId === "withdrawHistory") {

    loadWithdrawalHistory();

  }


  if (pageId === "transactions") {

    loadTransactions();

  }


  if (pageId === "home") {

    refreshBalance();

    loadTransactions();

  }

}


/* =========================================================
   SHORTCUTS
   ========================================================= */

function showDeposit() {

  openPage("deposit");

}


function showWithdrawal() {

  openPage("withdraw");

}


function customerService() {

  window.open(
    SUPPORT_URL,
    "_blank"
  );

}


function closeModal() {

  $("modal").classList.add("hidden");

}


function showEditProfile() {

  $("modalBody").innerHTML = `

    <h3>Edit Details</h3>

    <p style="margin-top:10px;color:#778397;font-size:13px;line-height:1.6">

      Your registered mobile number is linked
      to your account.

      Bank details can be updated by entering
      the latest details during withdrawal.

    </p>

  `;

  $("modal").classList.remove("hidden");

}


/* =========================================================
   PRODUCTS
   ========================================================= */

const products = [

  {
    name: "Starter",
    price: 500,
    info: "Starter product"
  },

  {
    name: "Growth",
    price: 1000,
    info: "Growth product"
  },

  {
    name: "Premium",
    price: 5000,
    info: "Premium product"
  }

];


function productHTML(product) {

  return `

    <div class="product">

      <b>${product.name}</b>

      <div class="price">
        ₹${Number(product.price).toLocaleString("en-IN")}
      </div>

      <div class="meta">
        ${product.info}
      </div>

    </div>

  `;

}


function renderProducts() {

  if ($("productsList")) {

    $("productsList").innerHTML =
      products.map(productHTML).join("");

  }


  if ($("homeProducts")) {

    $("homeProducts").innerHTML =
      products
        .slice(0, 2)
        .map(productHTML)
        .join("");

  }

}


/* =========================================================
   BALANCE
   ========================================================= */

async function refreshBalance() {

  if (!authToken) return;


  try {

    const result =
      await apiGet({

        action: "balance",

        token: authToken,

        userKey:
          user?.userKey || ""

      });


    const balance =
      Number(result.balance || 0);


    if ($("homeBalance")) {

      $("homeBalance").textContent =
        money(balance);

    }


    if ($("withdrawBalance")) {

      $("withdrawBalance").textContent =
        money(balance);

    }

  } catch (error) {

    console.log(
      "Balance error:",
      error
    );

  }

}


/* =========================================================
   DEPOSIT
   ========================================================= */

async function submitDeposit() {

  const amount =
    Number(
      $("depositAmount").value
    );


  const utr =
    $("utr").value.trim();


  const file =
    $("paymentScreenshot").files[0];


  if (!amount || amount <= 0) {

    showMessage(
      "depositMsg",
      "Enter a valid amount."
    );

    return;
  }


  if (!utr) {

    showMessage(
      "depositMsg",
      "Enter UTR / Transaction ID."
    );

    return;
  }


  if (!file) {

    showMessage(
      "depositMsg",
      "Select payment screenshot."
    );

    return;
  }


  $("depositSubmitBtn").disabled = true;


  showMessage(
    "depositMsg",
    "Submitting deposit..."
  );


  try {

    const base64 =
      await fileToBase64(file);


    const imageBase64 =
      base64.split(",")[1];


    const result =
      await apiPost({

        action: "createDeposit",

        token: authToken,

        userKey:
          user?.userKey || "",

        amount: amount,

        utr: utr,

        imageBase64:
          imageBase64,

        imageName:
          file.name,

        imageType:
          file.type

      });


    if (!result.ok) {

      throw new Error(
        result.error ||
        "Deposit request failed."
      );

    }


    showMessage(
      "depositMsg",
      "Deposit submitted. Waiting for verification."
    );


    $("depositAmount").value = "";

    $("utr").value = "";

    $("paymentScreenshot").value = "";


  } catch (error) {

    showMessage(
      "depositMsg",
      error.message ||
      "Deposit failed."
    );

  } finally {

    $("depositSubmitBtn").disabled =
      false;

  }

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
              "Could not read screenshot."
            )
          );

        };


      reader.readAsDataURL(file);

    }
  );

}


/* =========================================================
   WITHDRAWAL
   ========================================================= */

async function submitWithdrawal() {

  const amount =
    Number(
      $("withdrawAmount").value
    );


  const bankName =
    $("bankName").value.trim();


  const accountNumber =
    $("accountNumber").value.trim();


  const confirmAccount =
    $("confirmAccount").value.trim();


  const holderName =
    $("bank").value.trim();


  const ifsc =
    $("ifsc").value.trim();


  if (!amount || amount <= 0) {

    showMessage(
      "withdrawMsg",
      "Enter a valid withdrawal amount."
    );

    return;
  }


  if (!bankName) {

    showMessage(
      "withdrawMsg",
      "Enter bank name."
    );

    return;
  }


  if (!accountNumber) {

    showMessage(
      "withdrawMsg",
      "Enter account number."
    );

    return;
  }


  if (accountNumber !== confirmAccount) {

    showMessage(
      "withdrawMsg",
      "Account numbers do not match."
    );

    return;
  }


  if (!holderName) {

    showMessage(
      "withdrawMsg",
      "Enter account holder name."
    );

    return;
  }


  if (!ifsc) {

    showMessage(
      "withdrawMsg",
      "Enter IFSC code."
    );

    return;
  }


  $("withdrawSubmitBtn").disabled =
    true;


  showMessage(
    "withdrawMsg",
    "Submitting withdrawal..."
  );


  try {

    const result =
      await apiPost({

        action: "createWithdrawal",

        token: authToken,

        userKey:
          user?.userKey || "",

        amount: amount,

        holderName:
          holderName,

        accountHolder:
          holderName,

        accountNumber:
          accountNumber,

        bankName:
          bankName,

        ifsc:
          ifsc

      });


    if (!result.ok) {

      throw new Error(
        result.error ||
        "Withdrawal request failed."
      );

    }


    showMessage(
      "withdrawMsg",
      "Withdrawal request submitted for manual processing."
    );


    $("withdrawAmount").value = "";

    $("accountNumber").value = "";

    $("confirmAccount").value = "";


  } catch (error) {

    showMessage(
      "withdrawMsg",
      error.message ||
      "Withdrawal failed."
    );

  } finally {

    $("withdrawSubmitBtn").disabled =
      false;

  }

}


/* =========================================================
   DEPOSIT HISTORY
   ========================================================= */

async function loadDepositHistory() {

  const box =
    $("depositHistoryList");


  box.innerHTML =
    "Loading...";


  try {

    const result =
      await apiGet({

        action: "depositHistory",

        token: authToken,

        userKey:
          user?.userKey || ""

      });


    const rows =
      result.items ||
      result.data ||
      [];


    if (!rows.length) {

      box.innerHTML =
        `<div class="muted">
          No deposit records yet.
        </div>`;

      return;
    }


    box.innerHTML =
      rows.map(function(row) {

        return `

          <div class="list-item">

            <b>
              ${money(row.amount)}
            </b>

            <br>

            <span style="float:none;color:#7c8798">

              ${row.createdAt || ""}

            </span>

            <br>

            <span>

              ${row.status || "Pending"}

            </span>

          </div>

        `;

      }).join("");


  } catch (error) {

    box.innerHTML =
      `<div class="muted">
        No deposit records yet.
      </div>`;

  }

}


/* =========================================================
   WITHDRAWAL HISTORY
   ========================================================= */

async function loadWithdrawalHistory() {

  const box =
    $("withdrawHistoryList");


  box.innerHTML =
    "Loading...";


  try {

    const result =
      await apiGet({

        action: "withdrawalHistory",

        token: authToken,

        userKey:
          user?.userKey || ""

      });


    const rows =
      result.items ||
      result.data ||
      [];


    if (!rows.length) {

      box.innerHTML =
        `<div class="muted">
          No withdrawal records yet.
        </div>`;

      return;
    }


    box.innerHTML =
      rows.map(function(row) {

        return `

          <div class="list-item">

            <b>
              ${money(row.amount)}
            </b>

            <br>

            <span style="float:none;color:#7c8798">

              ${row.createdAt || ""}

            </span>

            <br>

            <span>

              ${row.status || "Pending"}

            </span>

          </div>

        `;

      }).join("");


  } catch (error) {

    box.innerHTML =
      `<div class="muted">
        No withdrawal records yet.
      </div>`;

  }

}


/* =========================================================
   TRANSACTIONS
   ========================================================= */

async function loadTransactions() {

  if (!authToken) return;


  try {

    const result =
      await apiGet({

        action: "transactions",

        token: authToken,

        userKey:
          user?.userKey || ""

      });


    const rows =
      result.items ||
      result.data ||
      [];


    let html;


    if (!rows.length) {

      html =
        `<div class="muted">
          No transactions yet.
        </div>`;

    } else {

      html =
        rows.slice(0, 20)
          .map(function(row) {

            return `

              <div class="list-item">

                <b>
                  ${row.type || "Transaction"}
                </b>

                <br>

                ${money(row.amount)}

                <br>

                <span style="float:none;color:#7c8798">

                  ${row.createdAt || ""}

                </span>

              </div>

            `;

          })
          .join("");

    }


    if ($("transactionsList")) {

      $("transactionsList").innerHTML =
        html;

    }


    if ($("homeTransactions")) {

      $("homeTransactions").innerHTML =
        html;

    }


  } catch (error) {

    console.log(
      "Transaction error:",
      error
    );

  }

}


/* =========================================================
   ATTENDANCE
   ========================================================= */

function changeMonth(number) {

  currentMonth.setMonth(
    currentMonth.getMonth() + number
  );


  renderCalendar();

}


function renderCalendar() {

  const calendar =
    $("calendar");


  if (!calendar) return;


  const year =
    currentMonth.getFullYear();


  const month =
    currentMonth.getMonth();


  const monthName =
    new Date(
      year,
      month,
      1
    ).toLocaleString(
      "en-IN",
      {
        month: "long",
        year: "numeric"
      }
    );


  $("monthLabel").textContent =
    monthName;


  const days =
    [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat"
    ];


  calendar.innerHTML =
    days.map(function(day) {

      return `
        <div class="dow">
          ${day}
        </div>
      `;

    }).join("");


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

    calendar.innerHTML +=
      "<div></div>";

  }


  const today =
    new Date();


  let attendanceCount = 0;


  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {

    const key =
      "nsg_att_" +
      year +
      "-" +
      (month + 1) +
      "-" +
      day;


    const attended =
      localStorage.getItem(key) === "1";


    if (attended) {

      attendanceCount++;

    }


    const isToday =
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate();


    calendar.innerHTML += `

      <button
        class="day
          ${attended ? "attended" : ""}
          ${isToday ? "today" : ""}
        "
        onclick="
          markAttendance(
            ${year},
            ${month},
            ${day}
          )
        "
      >
        ${day}
      </button>

    `;

  }


  $("attendanceTotal").textContent =
    attendanceCount;

}


/* =========================================================
   MARK TODAY ATTENDANCE
   ========================================================= */

function markAttendance(
  year,
  month,
  day
) {

  const today =
    new Date();


  const isToday =
    year === today.getFullYear() &&
    month === today.getMonth() &&
    day === today.getDate();


  if (!isToday) {

    alert(
      "Attendance can only be marked for today."
    );

    return;
  }


  const key =
    "nsg_att_" +
    year +
    "-" +
    (month + 1) +
    "-" +
    day;


  if (
    localStorage.getItem(key) === "1"
  ) {

    alert(
      "Today's attendance is already marked."
    );

    return;

  }


  localStorage.setItem(
    key,
    "1"
  );


  renderCalendar();


  alert(
    "Today's attendance marked successfully."
  );

}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeApp() {

  renderProducts();

  renderCalendar();


  if (
    authToken &&
    user
  ) {

    showApp();

    openPage("home");

    refreshBalance();

    loadTransactions();

  } else {

    $("authScreen").classList.remove(
      "hidden"
    );

    $("app").classList.add(
      "hidden"
    );

    showLogin();

  }

}


/* =========================================================
   BUTTON EVENTS
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    $("signupBtn").addEventListener(
      "click",
      register
    );


    $("loginBtn").addEventListener(
      "click",
      login
    );


    initializeApp();

  }
);
