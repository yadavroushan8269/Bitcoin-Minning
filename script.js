"use strict";

/* =========================================================
   BITCOIN MINNING - DEMO / TEST JAVASCRIPT
   ========================================================= */

const UPI_ID = "yadav-rishab@fam";
const CUSTOMER_SERVICE = "https://t.me/Hammerff7gcz";

const KEYS = {
  user: "bm_user",
  balance: "bm_balance",
  bank: "bm_bank",
  deposits: "bm_deposits",
  withdrawals: "bm_withdrawals",
  transactions: "bm_transactions",
  profile: "bm_profile",
  referral: "bm_referral"
};


/* =========================================================
   BASIC HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}

function getJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function money(value) {
  return Number(value || 0).toFixed(2);
}

function nowText() {
  return new Date().toLocaleString("en-IN");
}

function todayKey() {
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
   USER
   ========================================================= */

function createUserId() {

  let user = getJSON(KEYS.user, null);

  if (user && user.id) {
    return user;
  }

  const number =
    Math.floor(1000000 + Math.random() * 9000000);

  user = {
    id: "You-" + number,
    createdAt: nowText()
  };

  setJSON(KEYS.user, user);

  return user;
}

function getUser() {
  return getJSON(KEYS.user, null);
}


/* =========================================================
   BALANCE
   ========================================================= */

function getBalance() {
  return Number(localStorage.getItem(KEYS.balance) || "0");
}

function setBalance(value) {

  const amount = Math.max(0, Number(value || 0));

  localStorage.setItem(
    KEYS.balance,
    amount.toFixed(2)
  );

  updateBalanceUI();
}

function updateBalanceUI() {

  const balance = money(getBalance());

  if ($("homeBalance")) {
    $("homeBalance").textContent = balance;
  }

  if ($("infoBalance")) {
    $("infoBalance").textContent = balance;
  }

  if ($("withdrawBalance")) {
    $("withdrawBalance").textContent = balance;
  }
}


/* =========================================================
   AUTH
   ========================================================= */

function showLogin() {

  if ($("loginBox")) {
    $("loginBox").classList.remove("hidden");
  }

  if ($("registerBox")) {
    $("registerBox").classList.add("hidden");
  }
}

function showRegister() {

  if ($("loginBox")) {
    $("loginBox").classList.add("hidden");
  }

  if ($("registerBox")) {
    $("registerBox").classList.remove("hidden");
  }
}


function registerUser() {

  const input = $("registerMobile");

  const mobile = input
    ? input.value.trim()
    : "";

  if (!/^[0-9]{10}$/.test(mobile)) {

    if ($("registerMessage")) {
      $("registerMessage").textContent =
        "Enter a valid 10 digit mobile number.";
    }

    return;
  }

  const user = createUserId();

  user.mobile = mobile;

  setJSON(KEYS.user, user);

  if (!localStorage.getItem(KEYS.balance)) {
    setBalance(0);
  }

  initializeReferral();

  showApp();

  alert(
    "Permanent Demo ID created:\n" +
    user.id
  );
}


function loginUser() {

  const input = $("loginMobile");

  const mobile = input
    ? input.value.trim()
    : "";

  if (!/^[0-9]{10}$/.test(mobile)) {

    if ($("loginMessage")) {
      $("loginMessage").textContent =
        "Enter a valid 10 digit mobile number.";
    }

    return;
  }

  let user = getUser();

  if (!user) {

    user = createUserId();

    user.mobile = mobile;

    setJSON(KEYS.user, user);
  }

  showApp();
}


function showApp() {

  if ($("authScreen")) {
    $("authScreen").classList.add("hidden");
  }

  if ($("app")) {
    $("app").classList.remove("hidden");
  }

  initializeApp();
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function openPage(pageId) {

  const pages = document.querySelectorAll(".page");

  pages.forEach(function(page) {
    page.classList.remove("active");
  });

  const target = $(pageId);

  if (target) {
    target.classList.add("active");
  }

  const navs = document.querySelectorAll(
    ".bottom-nav .nav"
  );

  navs.forEach(function(nav) {

    nav.classList.remove("active");

    if (nav.dataset.page === pageId) {
      nav.classList.add("active");
    }

  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageId === "depositHistory") {
    renderDepositHistory();
  }

  if (pageId === "withdrawHistory") {
    renderWithdrawalHistory();
  }

  if (pageId === "transactions") {
    renderTransactions();
  }
}


/* =========================================================
   QUICK ACTIONS
   ========================================================= */

function showDeposit() {
  openPage("deposit");
}

function showWithdrawal() {
  openPage("withdraw");
}

function inviteNow() {

  initializeReferral();

  const link =
    localStorage.getItem(KEYS.referral) ||
    window.location.href;

  const text =
    "Check Bitcoin Minning demo website:\n" +
    link;

  const whatsapp =
    "https://wa.me/?text=" +
    encodeURIComponent(text);

  window.open(
    whatsapp,
    "_blank"
  );
}


function customerService() {
  window.open(
    CUSTOMER_SERVICE,
    "_blank"
  );
}


/* =========================================================
   PROFILE
   ========================================================= */

function initializeProfile() {

  const user = getUser();

  if (!user) return;

  const letter =
    (user.id || "U")
      .replace("You-", "")
      .charAt(0)
      .toUpperCase();

  if ($("profileUserId")) {
    $("profileUserId").textContent =
      user.id;
  }

  if ($("profileIdHome")) {
    $("profileIdHome").textContent =
      "User ID: " + user.id;
  }

  if ($("profileLetter")) {
    $("profileLetter").textContent =
      letter;
  }

  if ($("topProfileLetter")) {
    $("topProfileLetter").textContent =
      letter;
  }

  const savedImage =
    localStorage.getItem(KEYS.profile);

  if (savedImage) {

    if ($("profileImage")) {
      $("profileImage").src = savedImage;
      $("profileImage").classList.remove("hidden");
    }

    if ($("profileLetter")) {
      $("profileLetter").classList.add("hidden");
    }

    if ($("topProfileImg")) {
      $("topProfileImg").src = savedImage;
      $("topProfileImg").classList.remove("hidden");
    }

    if ($("topProfileLetter")) {
      $("topProfileLetter").classList.add("hidden");
    }
  }
}


function setupProfileUpload() {

  const button = $("profileUploadBtn");
  const input = $("profileUpload");

  if (!button || !input) return;

  button.onclick = function() {
    input.click();
  };

  input.onchange = function() {

    const file = input.files &&
                 input.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {

      const data =
        event.target.result;

      localStorage.setItem(
        KEYS.profile,
        data
      );

      initializeProfile();
    };

    reader.readAsDataURL(file);
  };
}


/* =========================================================
   BANK DETAILS
   ========================================================= */

function saveBankDetails() {

  const name =
    $("bankName")
      ? $("bankName").value.trim()
      : "";

  const ifsc =
    $("ifsc")
      ? $("ifsc").value.trim().toUpperCase()
      : "";

  const bank =
    $("bank")
      ? $("bank").value.trim()
      : "";

  const account =
    $("accountNumber")
      ? $("accountNumber").value.trim()
      : "";

  const confirm =
    $("confirmAccount")
      ? $("confirmAccount").value.trim()
      : "";


  if (!name ||
      !ifsc ||
      !bank ||
      !account ||
      !confirm) {

    showMessage(
      "bankMessage",
      "Please fill all bank details."
    );

    return;
  }


  if (account !== confirm) {

    showMessage(
      "bankMessage",
      "Account numbers do not match."
    );

    return;
  }


  setJSON(KEYS.bank, {
    name: name,
    ifsc: ifsc,
    bank: bank,
    account: account,
    updatedAt: nowText()
  });


  showMessage(
    "bankMessage",
    "Bank details saved locally."
  );
}


function loadBankDetails() {

  const bank =
    getJSON(KEYS.bank, null);

  if (!bank) return;

  if ($("bankName")) {
    $("bankName").value =
      bank.name || "";
  }

  if ($("ifsc")) {
    $("ifsc").value =
      bank.ifsc || "";
  }

  if ($("bank")) {
    $("bank").value =
      bank.bank || "";
  }

  if ($("accountNumber")) {
    $("accountNumber").value =
      bank.account || "";
  }

  if ($("confirmAccount")) {
    $("confirmAccount").value =
      bank.account || "";
  }
}


/* =========================================================
   MESSAGE
   ========================================================= */

function showMessage(id, text) {

  const el = $(id);

  if (!el) return;

  el.textContent = text;

  setTimeout(function() {

    if (el.textContent === text) {
      el.textContent = "";
    }

  }, 5000);
}


/* =========================================================
   DEPOSIT
   ========================================================= */

function copyUPI() {

  if (navigator.clipboard) {

    navigator.clipboard
      .writeText(UPI_ID)
      .then(function() {

        alert(
          "UPI ID copied:\n" +
          UPI_ID
        );

      })
      .catch(function() {

        prompt(
          "Copy UPI ID:",
          UPI_ID
        );

      });

  } else {

    prompt(
      "Copy UPI ID:",
      UPI_ID
    );

  }
}


function setupScreenshotPreview() {

  const input =
    $("paymentScreenshot");

  const preview =
    $("paymentScreenshotPreview");

  if (!input || !preview) return;

  input.onchange = function() {

    preview.innerHTML = "";

    const file =
      input.files &&
      input.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {

      preview.textContent =
        "Please select an image.";

      return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {

      const img =
        document.createElement("img");

      img.src =
        event.target.result;

      img.alt =
        "Payment screenshot preview";

      preview.appendChild(img);
    };

    reader.readAsDataURL(file);
  };
}


function submitDeposit() {

  const amount =
    Number(
      $("depositAmount")
        ? $("depositAmount").value
        : 0
    );

  const utr =
    $("utr")
      ? $("utr").value.trim()
      : "";

  const screenshot =
    $("paymentScreenshot") &&
    $("paymentScreenshot").files
      ? $("paymentScreenshot").files[0]
      : null;


  if (
    !Number.isFinite(amount) ||
    amount < 500 ||
    amount > 20000
  ) {

    showMessage(
      "paymentMessage",
      "Demo deposit amount must be ₹500 - ₹20,000."
    );

    return;
  }


  if (!utr) {

    showMessage(
      "paymentMessage",
      "Enter the transaction reference."
    );

    return;
  }


  if (!screenshot) {

    showMessage(
      "paymentMessage",
      "Please select a payment screenshot."
    );

    return;
  }


  const deposits =
    getJSON(KEYS.deposits, []);


  const request = {

    id:
      "DEP-" +
      Date.now(),

    amount: amount,

    utr: utr,

    screenshotName:
      screenshot.name,

    status:
      "Pending Verification",

    createdAt:
      nowText()
  };


  deposits.unshift(request);

  setJSON(
    KEYS.deposits,
    deposits
  );


  addTransaction({
    type: "Deposit Request",
    amount: amount,
    status: "Pending Verification",
    ref: request.id
  });


  showMessage(
    "paymentMessage",
    "Deposit request saved locally for demo verification."
  );


  if ($("depositAmount")) {
    $("depositAmount").value = "";
  }

  if ($("utr")) {
    $("utr").value = "";
  }

  if ($("paymentScreenshot")) {
    $("paymentScreenshot").value = "";
  }

  if ($("paymentScreenshotPreview")) {
    $("paymentScreenshotPreview").innerHTML = "";
  }


  setTimeout(function() {
    renderDepositHistory();
  }, 300);
}


/* =========================================================
   WITHDRAW
   ========================================================= */

function isWithdrawalTime() {

  const now =
    new Date();

  const hours =
    now.getHours();

  const minutes =
    now.getMinutes();

  const total =
    hours * 60 + minutes;

  const start =
    10 * 60 + 30;

  const end =
    17 * 60;

  return total >= start &&
         total <= end;
}


function withdrawalsToday() {

  const list =
    getJSON(
      KEYS.withdrawals,
      []
    );

  const today =
    todayKey();

  return list.filter(function(item) {

    return item.day === today;

  }).length;
}


function submitWithdrawal() {

  const amount =
    Number(
      $("withdrawAmount")
        ? $("withdrawAmount").value
        : 0
    );


  if (
    !Number.isFinite(amount) ||
    amount < 500 ||
    amount > 20000
  ) {

    showMessage(
      "withdrawMessage",
      "Withdrawal must be ₹500 - ₹20,000."
    );

    return;
  }


  if (!isWithdrawalTime()) {

    showMessage(
      "withdrawMessage",
      "Demo withdrawal time is 10:30 AM - 5:00 PM."
    );

    return;
  }


  if (withdrawalsToday() >= 3) {

    showMessage(
      "withdrawMessage",
      "Maximum 3 withdrawal requests per day."
    );

    return;
  }


  const balance =
    getBalance();


  if (amount > balance) {

    showMessage(
      "withdrawMessage",
      "Insufficient demo balance."
    );

    return;
  }


  const bank =
    getJSON(KEYS.bank, null);


  if (!bank ||
      !bank.name ||
      !bank.ifsc ||
      !bank.bank ||
      !bank.account) {

    showMessage(
      "withdrawMessage",
      "Please save your bank details first."
    );

    return;
  }


  const withdrawals =
    getJSON(
      KEYS.withdrawals,
      []
    );


  const request = {

    id:
      "WDR-" +
      Date.now(),

    amount:
      amount,

    status:
      "Pending",

    day:
      todayKey(),

    createdAt:
      nowText()
  };


  withdrawals.unshift(request);

  setJSON(
    KEYS.withdrawals,
    withdrawals
  );


  setBalance(
    balance - amount
  );


  addTransaction({
    type: "Withdrawal Request",
    amount: amount,
    status: "Pending",
    ref: request.id
  });


  showMessage(
    "withdrawMessage",
    "Withdrawal request saved as demo request."
  );


  if ($("withdrawAmount")) {
    $("withdrawAmount").value = "";
  }


  setTimeout(function() {
    renderWithdrawalHistory();
  }, 300);
}


/* =========================================================
   TRANSACTIONS
   ========================================================= */

function addTransaction(data) {

  const list =
    getJSON(
      KEYS.transactions,
      []
    );

  list.unshift({

    id:
      data.ref ||
      "TX-" + Date.now(),

    type:
      data.type,

    amount:
      Number(data.amount || 0),

    status:
      data.status || "Pending",

    createdAt:
      nowText()
  });


  setJSON(
    KEYS.transactions,
    list
  );
}


function renderTransactions() {

  const box =
    $("transactionList");

  if (!box) return;

  const list =
    getJSON(
      KEYS.transactions,
      []
    );


  if (!list.length) {

    box.innerHTML =
      '<div class="empty-history">' +
      'No transactions yet.' +
      '</div>';

    return;
  }


  box.innerHTML =
    list.map(function(item) {

      const sign =
        item.type === "Deposit Request"
          ? "+"
          : "-";

      return `
        <div class="history-item">

          <div class="history-top">

            <span class="history-title">
              ${escapeHTML(item.type)}
            </span>

            <span class="history-amount">
              ${sign} ₹${money(item.amount)}
            </span>

          </div>

          <div class="history-date">
            ${escapeHTML(item.createdAt)}
          </div>

          <span class="history-status">
            ${escapeHTML(item.status)}
          </span>

        </div>
      `;

    }).join("");
}


/* =========================================================
   DEPOSIT HISTORY
   ========================================================= */

function renderDepositHistory() {

  const box =
    $("depositHistoryList");

  if (!box) return;

  const list =
    getJSON(
      KEYS.deposits,
      []
    );


  if (!list.length) {

    box.innerHTML =
      '<div class="empty-history">' +
      'No deposit requests yet.' +
      '</div>';

    return;
  }


  box.innerHTML =
    list.map(function(item) {

      return `
        <div class="history-item">

          <div class="history-top">

            <span class="history-title">
              Deposit Request
            </span>

            <span class="history-amount">
              ₹${money(item.amount)}
            </span>

          </div>

          <div class="history-date">
            ${escapeHTML(item.createdAt)}
          </div>

          <div class="history-date">
            UTR: ${escapeHTML(item.utr)}
          </div>

          <span class="history-status">
            ${escapeHTML(item.status)}
          </span>

        </div>
      `;

    }).join("");
}


/* =========================================================
   WITHDRAWAL HISTORY
   ========================================================= */

function renderWithdrawalHistory() {

  const box =
    $("withdrawalHistoryList");

  if (!box) return;

  const list =
    getJSON(
      KEYS.withdrawals,
      []
    );


  if (!list.length) {

    box.innerHTML =
      '<div class="empty-history">' +
      'No withdrawal requests yet.' +
      '</div>';

    return;
  }


  box.innerHTML =
    list.map(function(item) {

      return `
        <div class="history-item">

          <div class="history-top">

            <span class="history-title">
              Withdrawal Request
            </span>

            <span class="history-amount">
              ₹${money(item.amount)}
            </span>

          </div>

          <div class="history-date">
            ${escapeHTML(item.createdAt)}
          </div>

          <span class="history-status">
            ${escapeHTML(item.status)}
          </span>

        </div>
      `;

    }).join("");
}


/* =========================================================
   REFERRAL
   ========================================================= */

function initializeReferral() {

  const user =
    getUser();

  if (!user) return;

  let link =
    localStorage.getItem(
      KEYS.referral
    );


  if (!link) {

    link =
      window.location.origin +
      window.location.pathname +
      "?ref=" +
      encodeURIComponent(user.id);

    localStorage.setItem(
      KEYS.referral,
      link
    );
  }


  if ($("referralLink")) {
    $("referralLink").textContent =
      link;
  }
}


function copyReferral() {

  initializeReferral();

  const link =
    localStorage.getItem(
      KEYS.referral
    ) ||
    window.location.href;


  if (navigator.clipboard) {

    navigator.clipboard
      .writeText(link)
      .then(function() {

        alert("Referral link copied.");

      })
      .catch(function() {

        prompt(
          "Copy referral link:",
          link
        );

      });

  } else {

    prompt(
      "Copy referral link:",
      link
    );

  }
}


/* =========================================================
   PRODUCT MODAL
   ========================================================= */

let selectedPlan = null;


function openPlan(name, price, description) {

  selectedPlan = {
    name: name,
    price: price,
    description: description
  };


  if ($("modalPlan")) {
    $("modalPlan").textContent =
      name.toUpperCase();
  }

  if ($("modalTitle")) {
    $("modalTitle").textContent =
      name;
  }

  if ($("modalPrice")) {
    $("modalPrice").textContent =
      price;
  }

  if ($("modalContent")) {
    $("modalContent").textContent =
      description;
  }


  const modal =
    $("modal");

  if (modal) {
    modal.classList.add("show");
  }
}


function closeModal() {

  const modal =
    $("modal");

  if (modal) {
    modal.classList.remove("show");
  }

  selectedPlan = null;
}


function goDepositFromModal() {

  closeModal();

  showDeposit();

  if (
    selectedPlan &&
    selectedPlan.price
  ) {

    const number =
      Number(
        String(selectedPlan.price)
          .replace(/[^\d.]/g, "")
      );

    if ($("depositAmount") &&
        number >= 500) {

      $("depositAmount").value =
        number;
    }
  }
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* =========================================================
   MODAL CLICK OUTSIDE
   ========================================================= */

function setupModal() {

  const modal =
    $("modal");

  if (!modal) return;

  modal.addEventListener(
    "click",
    function(event) {

      if (event.target === modal) {
        closeModal();
      }

    }
  );
}


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeApp() {

  const user =
    getUser();

  if (!user) {
    return;
  }


  if (!localStorage.getItem(KEYS.balance)) {
    localStorage.setItem(
      KEYS.balance,
      "0.00"
    );
  }


  if ($("greeting")) {

    $("greeting").textContent =
      "Hello " +
      user.id +
      " 👋";
  }


  initializeProfile();

  loadBankDetails();

  initializeReferral();

  updateBalanceUI();

  setupProfileUpload();

  setupScreenshotPreview();

  setupModal();

  renderDepositHistory();

  renderWithdrawalHistory();

  renderTransactions();


  /* Make sure HOME is visible */

  openPage("home");
}


/* =========================================================
   STARTUP
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    const user =
      getUser();

    if (user) {

      showApp();

    } else {

      if ($("authScreen")) {
        $("authScreen")
          .classList
          .remove("hidden");
      }

      if ($("app")) {
        $("app")
          .classList
          .add("hidden");
      }

      showLogin();
    }


    /* Bottom navigation */

    document
      .querySelectorAll(".bottom-nav .nav")
      .forEach(function(button) {

        button.addEventListener(
          "click",
          function() {

            const page =
              button.dataset.page;

            if (page) {
              openPage(page);
            }

          }
        );

      });

  });
