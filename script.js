/* =========================================================
   BITCOIN MINNING - MAIN SCRIPT
   Demo / Test Version
   ========================================================= */

"use strict";

/* =========================================================
   CONFIG
========================================================= */

const APP_NAME = "Bitcoin Minning";

const UPI_ID = "yadav-rishab@fam";

const CUSTOMER_SERVICE_URL = "https://t.me/Hammerff7gcz";

const ADMIN_EMAIL = "yadavroushan8269@gmail.com";

const MIN_DEPOSIT = 200;
const MAX_DEPOSIT = 50000;

const MIN_WITHDRAW = 500;
const MAX_WITHDRAW = 20000;

const MAX_WITHDRAWALS_PER_DAY = 3;


/* =========================================================
   PRODUCT DATA
========================================================= */

const PRODUCTS = {
  500: {
    id: "plan500",
    name: "Starter Mining Plan",
    price: 500,
    duration: "30 Days",
    daily: "Demo reward",
    description:
      "Starter level mining plan for testing the website's demo purchase flow.",
    features: [
      "30-day demo plan",
      "Demo mining dashboard",
      "Transaction history",
      "Test balance support"
    ]
  },

  1500: {
    id: "plan1500",
    name: "Pro Mining Plan",
    price: 1500,
    duration: "60 Days",
    daily: "Demo reward",
    description:
      "Pro level demo mining plan with a larger test amount.",
    features: [
      "60-day demo plan",
      "Demo mining dashboard",
      "Transaction history",
      "Test balance support"
    ]
  },

  3600: {
    id: "plan3600",
    name: "Premium Mining Plan",
    price: 3600,
    duration: "90 Days",
    daily: "Demo reward",
    description:
      "Premium demo plan for testing product selection and purchase flow.",
    features: [
      "90-day demo plan",
      "Demo mining dashboard",
      "Transaction history",
      "Test balance support"
    ]
  }
};


/* =========================================================
   STORAGE KEYS
========================================================= */

const STORAGE = {
  USER: "bm_user",
  BALANCE: "bm_demo_balance",
  PROFILE: "bm_profile_image",
  BANK: "bm_bank_details",

  DEPOSITS: "bm_deposit_history",
  WITHDRAWALS: "bm_withdrawal_history",
  TRANSACTIONS: "bm_transactions",

  PURCHASES: "bm_demo_purchases",

  REFERRAL: "bm_referral_code",
  LAST_DEPOSIT: "bm_last_deposit_request"
};


/* =========================================================
   GLOBAL STATE
========================================================= */

let currentPage = "homePage";

let firebaseReady = false;
let firebaseUser = null;
let firebaseAuth = null;
let firebaseDb = null;

let selectedProduct = null;


/* =========================================================
   BASIC HELPERS
========================================================= */

function $(id) {
  return document.getElementById(id);
}


function showElement(id) {
  const el = $(id);

  if (el) {
    el.classList.remove("hidden");
  }
}


function hideElement(id) {
  const el = $(id);

  if (el) {
    el.classList.add("hidden");
  }
}


function setText(id, value) {
  const el = $(id);

  if (el) {
    el.textContent = value;
  }
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function formatRupee(amount) {
  const number = Number(amount) || 0;

  return "₹" + number.toLocaleString("en-IN");
}


function formatDate(dateValue) {
  const date = dateValue
    ? new Date(dateValue)
    : new Date();

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =========================================================
   LOCAL STORAGE HELPERS
========================================================= */

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error("Storage read error:", key, error);
    return fallback;
  }
}


function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Storage write error:", key, error);
    return false;
  }
}


/* =========================================================
   USER
========================================================= */

function generateUserId() {
  const number = Math.floor(
    1000000 + Math.random() * 9000000
  );

  return "You-" + number;
}


function getUser() {
  let user = readJSON(STORAGE.USER, null);

  if (!user || !user.id) {
    user = {
      id: generateUserId(),
      createdAt: new Date().toISOString()
    };

    writeJSON(STORAGE.USER, user);
  }

  return user;
}


/* =========================================================
   BALANCE
========================================================= */

function getLocalBalance() {
  const value = Number(
    localStorage.getItem(STORAGE.BALANCE)
  );

  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value;
}


function setLocalBalance(amount) {
  let balance = Number(amount);

  if (!Number.isFinite(balance) || balance < 0) {
    balance = 0;
  }

  localStorage.setItem(
    STORAGE.BALANCE,
    String(Math.round(balance * 100) / 100)
  );

  updateBalanceUI();

  return balance;
}


function changeLocalBalance(amount) {
  const current = getLocalBalance();

  return setLocalBalance(current + Number(amount));
}


function updateBalanceUI() {
  const balance = getLocalBalance();

  const formatted = formatRupee(balance);

  setText("homeBalance", formatted);
  setText("infoBalance", formatted);
  setText("withdrawBalance", formatted);

  setText("withdrawPageBalance", formatted);
}


/* =========================================================
   NAVIGATION
========================================================= */

function showPage(pageId) {
  const pages = document.querySelectorAll(".page");

  pages.forEach(function(page) {
    page.classList.remove("active");
  });

  const target = $(pageId);

  if (target) {
    target.classList.add("active");
    currentPage = pageId;
  }

  updateBottomNavigation(pageId);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageId === "depositHistoryPage") {
    renderDepositHistory();
  }

  if (pageId === "withdrawalHistoryPage") {
    renderWithdrawalHistory();
  }

  if (pageId === "historyPage") {
    renderTransactionHistory();
  }

  if (pageId === "homePage") {
    updateBalanceUI();
  }
}


function updateBottomNavigation(pageId) {
  const navButtons = document.querySelectorAll(".nav-item");

  navButtons.forEach(function(button) {
    button.classList.remove("active");
  });

  let targetButton = null;

  if (pageId === "homePage") {
    targetButton = document.querySelector(
      '.nav-item[data-page="homePage"]'
    );
  }

  if (pageId === "productPage") {
    targetButton = document.querySelector(
      '.nav-item[data-page="productPage"]'
    );
  }

  if (pageId === "infoPage") {
    targetButton = document.querySelector(
      '.nav-item[data-page="infoPage"]'
    );
  }

  if (pageId === "invitePage") {
    targetButton = document.querySelector(
      '.nav-item[data-page="invitePage"]'
    );
  }

  if (targetButton) {
    targetButton.classList.add("active");
  }
}


/* =========================================================
   PROFILE
========================================================= */

function updateProfileUI() {
  const user = getUser();

  setText("profileUserId", user.id);

  const letter = user.id
    ? user.id.charAt(0).toUpperCase()
    : "U";

  setText("profileLetter", letter);
  setText("topProfileLetter", letter);

  const savedImage = localStorage.getItem(
    STORAGE.PROFILE
  );

  const profileImage = $("profileImage");
  const topProfileImg = $("topProfileImg");

  if (savedImage) {

    if (profileImage) {
      profileImage.src = savedImage;
      profileImage.style.display = "block";
    }

    if (topProfileImg) {
      topProfileImg.src = savedImage;
      topProfileImg.style.display = "block";
    }

    hideElement("profileLetter");
    hideElement("topProfileLetter");

  } else {

    if (profileImage) {
      profileImage.style.display = "none";
    }

    if (topProfileImg) {
      topProfileImg.style.display = "none";
    }

    showElement("profileLetter");
    showElement("topProfileLetter");
  }
}


function handleProfileImage(file) {

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please select an image.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image size should be below 5 MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {

    const dataUrl = event.target.result;

    try {
      localStorage.setItem(
        STORAGE.PROFILE,
        dataUrl
      );

      updateProfileUI();

    } catch (error) {

      alert(
        "Image could not be saved. Please use a smaller image."
      );

      console.error(error);
    }
  };

  reader.readAsDataURL(file);
}


/* =========================================================
   GREETING
========================================================= */

function updateGreeting() {

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 17) {
    greeting = "Good Afternoon";
  }

  setText("greeting", greeting);
}


/* =========================================================
   REFERRAL
========================================================= */

function getReferralCode() {

  let code = localStorage.getItem(
    STORAGE.REFERRAL
  );

  if (!code) {

    const user = getUser();

    code = user.id;

    localStorage.setItem(
      STORAGE.REFERRAL,
      code
    );
  }

  return code;
}


function updateReferralLink() {

  const baseUrl =
    window.location.origin +
    window.location.pathname;

  const link =
    baseUrl +
    "?ref=" +
    encodeURIComponent(getReferralCode());

  const input = $("referralLink");

  if (input) {
    input.value = link;
  }
}


/* =========================================================
   COPY
========================================================= */

async function copyText(text) {

  try {

    if (navigator.clipboard) {

      await navigator.clipboard.writeText(text);

      return true;
    }

  } catch (error) {
    console.error(error);
  }

  try {

    const textarea =
      document.createElement("textarea");

    textarea.value = text;

    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    document.execCommand("copy");

    document.body.removeChild(textarea);

    return true;

  } catch (error) {

    console.error(error);

    return false;
  }
}


async function copyUPI() {

  const success = await copyText(UPI_ID);

  if (success) {
    alert("UPI ID copied.");
  } else {
    alert("Could not copy UPI ID.");
  }
}


async function copyReferral() {

  const input = $("referralLink");

  if (!input) {
    return;
  }

  const success =
    await copyText(input.value);

  if (success) {
    alert("Referral link copied.");
  } else {
    alert("Could not copy referral link.");
  }
}


/* =========================================================
   FIREBASE INITIALIZATION
========================================================= */

async function initializeFirebase() {

  try {

    if (typeof firebase === "undefined") {

      console.warn(
        "Firebase SDK is not loaded."
      );

      return;
    }

    firebaseAuth = firebase.auth();
    firebaseDb = firebase.firestore();

    firebaseReady = true;

    firebaseAuth.onAuthStateChanged(
      async function(user) {

        firebaseUser = user || null;

        if (user) {

          await loadFirebaseBalance();

        } else {

          try {

            await firebaseAuth.signInAnonymously();

          } catch (error) {

            console.error(
              "Anonymous Firebase login failed:",
              error
            );
          }
        }
      }
    );

    if (!firebaseAuth.currentUser) {

      await firebaseAuth.signInAnonymously();
    }

  } catch (error) {

    firebaseReady = false;

    console.error(
      "Firebase initialization failed:",
      error
    );
  }
}


/* =========================================================
   FIREBASE TEST BALANCE
========================================================= */

async function loadFirebaseBalance() {

  if (
    !firebaseReady ||
    !firebaseDb ||
    !firebaseUser
  ) {
    return;
  }

  try {

    const ref = firebaseDb
      .collection("testBalances")
      .doc(firebaseUser.uid);

    const snapshot =
      await ref.get();

    if (snapshot.exists) {

      const data = snapshot.data();

      const balance =
        Number(data.balance) || 0;

      localStorage.setItem(
        STORAGE.BALANCE,
        String(balance)
      );

      updateBalanceUI();

    } else {

      await ref.set({
        uid: firebaseUser.uid,
        userId: getUser().id,
        balance: 0,
        createdAt:
          firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:
          firebase.firestore.FieldValue.serverTimestamp()
      });

      setLocalBalance(0);
    }

  } catch (error) {

    console.error(
      "Firebase balance load error:",
      error
    );

    /*
      Local demo balance is kept working even if
      Firebase rules/config are temporarily wrong.
    */
  }
}


async function saveFirebaseBalance(balance) {

  if (
    !firebaseReady ||
    !firebaseDb ||
    !firebaseUser
  ) {
    return false;
  }

  try {

    const ref = firebaseDb
      .collection("testBalances")
      .doc(firebaseUser.uid);

    await ref.set(
      {
        uid: firebaseUser.uid,
        userId: getUser().id,
        balance: Number(balance),
        updatedAt:
          firebase.firestore.FieldValue.serverTimestamp()
      },
      {
        merge: true
      }
    );

    return true;

  } catch (error) {

    console.error(
      "Firebase balance save error:",
      error
    );

    return false;
  }
}


/* =========================================================
   BANK DETAILS
   ========================================================= */

function loadBankDetails() {

  const bank =
    readJSON(STORAGE.BANK, {});

  if ($("bankName")) {
    $("bankName").value =
      bank.name || "";
  }

  if ($("bankIfsc")) {
    $("bankIfsc").value =
      bank.ifsc || "";
  }

  if ($("bankBankName")) {
    $("bankBankName").value =
      bank.bankName || "";
  }

  if ($("bankAccount")) {
    $("bankAccount").value =
      bank.account || "";
  }

  if ($("bankAccountRepeat")) {
    $("bankAccountRepeat").value =
      bank.accountRepeat || "";
  }
}


function saveBankDetails() {

  const name =
    $("bankName")?.value.trim() || "";

  const ifsc =
    $("bankIfsc")?.value.trim().toUpperCase() || "";

  const bankName =
    $("bankBankName")?.value.trim() || "";

  const account =
    $("bankAccount")?.value.trim() || "";

  const accountRepeat =
    $("bankAccountRepeat")?.value.trim() || "";

  const message =
    $("bankMessage");


  if (!name ||
      !ifsc ||
      !bankName ||
      !account ||
      !accountRepeat) {

    if (message) {
      message.textContent =
        "Please fill all bank details.";
      message.className = "message";
    }

    return;
  }


  if (account !== accountRepeat) {

    if (message) {
      message.textContent =
        "Account numbers do not match.";
      message.className = "message";
    }

    return;
  }


  if (account.length < 6) {

    if (message) {
      message.textContent =
        "Please enter a valid account number.";
      message.className = "message";
    }

    return;
  }


  const bank = {
    name: name,
    ifsc: ifsc,
    bankName: bankName,
    account: account,
    accountRepeat: accountRepeat,
    savedAt: new Date().toISOString()
  };


  /*
    Bank information is kept locally in this demo.
    It is not uploaded to Telegram or a third-party server.
  */

  writeJSON(
    STORAGE.BANK,
    bank
  );


  if (message) {

    message.textContent =
      "Bank details saved on this device.";

    message.className =
      "message success";
  }
}


/* =========================================================
   DEPOSIT - SCREENSHOT PREVIEW
========================================================= */

function setupScreenshotPreview() {

  const input =
    $("paymentScreenshot");

  const preview =
    $("paymentScreenshotPreview");

  if (!input || !preview) {
    return;
  }

  input.addEventListener(
    "change",
    function() {

      preview.innerHTML = "";

      const file =
        input.files &&
        input.files[0];

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {

        preview.innerHTML =
          '<p class="message">Please select an image file.</p>';

        input.value = "";

        return;
      }

      if (file.size > 5 * 1024 * 1024) {

        preview.innerHTML =
          '<p class="message">Image must be below 5 MB.</p>';

        input.value = "";

        return;
      }

      const reader =
        new FileReader();

      reader.onload =
        function(event) {

          const img =
            document.createElement("img");

          img.src =
            event.target.result;

          img.alt =
            "Payment screenshot preview";

          preview.appendChild(img);
        };

      reader.readAsDataURL(file);
    }
  );
}


/* =========================================================
   DEPOSIT REQUEST
========================================================= */

function submitDepositRequest() {

  const amount =
    Number(
      $("depositAmount")?.value
    );

  const utr =
    $("utr")?.value.trim() || "";

  const screenshot =
    $("paymentScreenshot")?.files?.[0] || null;

  const message =
    $("paymentMessage");


  function showError(text) {

    if (message) {

      message.textContent = text;
      message.className = "message";
    }
  }


  if (
    !Number.isFinite(amount) ||
    amount < MIN_DEPOSIT ||
    amount > MAX_DEPOSIT
  ) {

    showError(
      `Amount must be between ${formatRupee(MIN_DEPOSIT)} and ${formatRupee(MAX_DEPOSIT)}.`
    );

    return;
  }


  if (!utr) {

    showError(
      "Please enter the transaction reference / UTR."
    );

    return;
  }


  if (!screenshot) {

    showError(
      "Please select a payment screenshot."
    );

    return;
  }


  if (
    !screenshot.type.startsWith("image/")
  ) {

    showError(
      "Please select a valid image."
    );

    return;
  }


  const request = {

    id:
      "DEP-" +
      Date.now(),

    userId:
      getUser().id,

    amount:
      amount,

    utr:
      utr,

    screenshotName:
      screenshot.name,

    screenshotSize:
      screenshot.size,

    status:
      "Pending Verification",

    createdAt:
      new Date().toISOString()
  };


  const deposits =
    readJSON(
      STORAGE.DEPOSITS,
      []
    );


  deposits.unshift(request);


  writeJSON(
    STORAGE.DEPOSITS,
    deposits
  );


  localStorage.setItem(
    STORAGE.LAST_DEPOSIT,
    JSON.stringify(request)
  );


  /*
    IMPORTANT:
    This demo records the request locally.
    It does NOT automatically send payment screenshots,
    UTRs or payment information to Telegram.
  */


  addTransaction({
    type: "Deposit Request",
    amount: amount,
    status: "Pending Verification",
    reference: utr
  });


  if (message) {

    message.textContent =
      "Deposit request saved. Status: Pending Verification.";

    message.className =
      "message success";
  }


  const amountInput =
    $("depositAmount");

  const utrInput =
    $("utr");

  const screenshotInput =
    $("paymentScreenshot");

  const preview =
    $("paymentScreenshotPreview");


  if (amountInput) {
    amountInput.value = "";
  }

  if (utrInput) {
    utrInput.value = "";
  }

  if (screenshotInput) {
    screenshotInput.value = "";
  }

  if (preview) {
    preview.innerHTML = "";
  }


  renderDepositHistory();
}


/* =========================================================
   DEPOSIT HISTORY
========================================================= */

function renderDepositHistory() {

  const container =
    $("depositHistoryList");

  if (!container) {
    return;
  }

  const deposits =
    readJSON(
      STORAGE.DEPOSITS,
      []
    );


  if (!deposits.length) {

    container.innerHTML =
      `
      <div class="history-item">
        <div class="history-item-title">
          No deposit requests yet
        </div>
        <div class="history-item-meta">
          Your demo deposit requests will appear here.
        </div>
      </div>
      `;

    return;
  }


  container.innerHTML =
    deposits
      .map(function(item) {

        return `
          <div class="history-item">

            <div class="history-item-top">

              <div>
                <div class="history-item-title">
                  Deposit Request
                </div>

                <div class="history-item-meta">
                  ${escapeHtml(item.id)}
                </div>
              </div>

              <div class="history-item-amount">
                ${formatRupee(item.amount)}
              </div>

            </div>

            <div class="history-item-meta">
              UTR: ${escapeHtml(item.utr)}
              <br>
              ${formatDate(item.createdAt)}
            </div>

            <span class="history-status">
              ${escapeHtml(item.status)}
            </span>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   WITHDRAWAL TIME
========================================================= */

function isWithdrawalTime() {

  const now =
    new Date();

  const hours =
    now.getHours();

  const minutes =
    now.getMinutes();

  const currentMinutes =
    hours * 60 + minutes;

  const start =
    10 * 60 + 30;

  const end =
    17 * 60;

  return (
    currentMinutes >= start &&
    currentMinutes <= end
  );
}


/* =========================================================
   TODAY'S WITHDRAWALS
========================================================= */

function getTodayWithdrawals() {

  const withdrawals =
    readJSON(
      STORAGE.WITHDRAWALS,
      []
    );

  const today =
    getTodayKey();

  return withdrawals.filter(
    function(item) {

      if (!item.createdAt) {
        return false;
      }

      return (
        getDateKey(item.createdAt) ===
        today
      );
    }
  );
}


function getDateKey(dateValue) {

  const date =
    new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =========================================================
   WITHDRAWAL
========================================================= */

async function processWithdrawal(amount) {

  const message =
    $("withdrawMessage");

  const pageMessage =
    $("withdrawPageMessage");


  function showError(text) {

    if (message) {
      message.textContent = text;
      message.className = "message";
    }

    if (pageMessage) {
      pageMessage.textContent = text;
      pageMessage.className = "message";
    }
  }


  function showSuccess(text) {

    if (message) {
      message.textContent = text;
      message.className = "message success";
    }

    if (pageMessage) {
      pageMessage.textContent = text;
      pageMessage.className =
        "message success";
    }
  }


  amount =
    Number(amount);


  if (
    !Number.isFinite(amount) ||
    amount < MIN_WITHDRAW ||
    amount > MAX_WITHDRAW
  ) {

    showError(
      `Withdrawal amount must be between ${formatRupee(MIN_WITHDRAW)} and ${formatRupee(MAX_WITHDRAW)}.`
    );

    return;
  }


  if (!isWithdrawalTime()) {

    showError(
      "Demo withdrawal requests are available from 10:30 AM to 5:00 PM."
    );

    return;
  }


  const todayWithdrawals =
    getTodayWithdrawals();


  if (
    todayWithdrawals.length >=
    MAX_WITHDRAWALS_PER_DAY
  ) {

    showError(
      "Maximum 3 withdrawal requests are allowed per day."
    );

    return;
  }


  const balance =
    getLocalBalance();


  if (amount > balance) {

    showError(
      "Insufficient demo balance."
    );

    return;
  }


  const bank =
    readJSON(
      STORAGE.BANK,
      null
    );


  if (!bank ||
      !bank.name ||
      !bank.ifsc ||
      !bank.bankName ||
      !bank.account) {

    showError(
      "Please save your bank details first."
    );

    showPage("infoPage");

    return;
  }


  /*
    DEMO ONLY:
    Deducts from test balance locally/Firebase.
    No real bank transfer is made.
  */

  const newBalance =
    balance - amount;


  setLocalBalance(
    newBalance
  );


  await saveFirebaseBalance(
    newBalance
  );


  const withdrawal = {

    id:
      "WD-" +
      Date.now(),

    userId:
      getUser().id,

    amount:
      amount,

    status:
      "Pending Demo Review",

    createdAt:
      new Date().toISOString()
  };


  const withdrawals =
    readJSON(
      STORAGE.WITHDRAWALS,
      []
    );


  withdrawals.unshift(
    withdrawal
  );


  writeJSON(
    STORAGE.WITHDRAWALS,
    withdrawals
  );


  addTransaction({
    type: "Withdrawal",
    amount: amount,
    status: "Pending Demo Review",
    reference: withdrawal.id
  });


  showSuccess(
    `Demo withdrawal request submitted for ${formatRupee(amount)}.`
  );


  if ($("withdrawAmount")) {
    $("withdrawAmount").value = "";
  }

  if ($("withdrawPageAmount")) {
    $("withdrawPageAmount").value = "";
  }


  renderWithdrawalHistory();
  renderTransactionHistory();
  updateBalanceUI();
}


/* =========================================================
   WITHDRAWAL HISTORY
========================================================= */

function renderWithdrawalHistory() {

  const container =
    $("withdrawalHistoryList");

  if (!container) {
    return;
  }


  const withdrawals =
    readJSON(
      STORAGE.WITHDRAWALS,
      []
    );


  if (!withdrawals.length) {

    container.innerHTML =
      `
      <div class="history-item">

        <div class="history-item-title">
          No withdrawals yet
        </div>

        <div class="history-item-meta">
          Your demo withdrawal requests will appear here.
        </div>

      </div>
      `;

    return;
  }


  container.innerHTML =
    withdrawals
      .map(function(item) {

        return `
          <div class="history-item">

            <div class="history-item-top">

              <div>

                <div class="history-item-title">
                  Withdrawal Request
                </div>

                <div class="history-item-meta">
                  ${escapeHtml(item.id)}
                </div>

              </div>

              <div class="history-item-amount">
                ${formatRupee(item.amount)}
              </div>

            </div>

            <div class="history-item-meta">
              ${formatDate(item.createdAt)}
            </div>

            <span class="history-status">
              ${escapeHtml(item.status)}
            </span>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   TRANSACTION HISTORY
========================================================= */

function getTransactions() {

  return readJSON(
    STORAGE.TRANSACTIONS,
    []
  );
}


function addTransaction(data) {

  const transactions =
    getTransactions();


  transactions.unshift({

    id:
      "TX-" +
      Date.now() +
      "-" +
      Math.floor(
        Math.random() * 1000
      ),

    userId:
      getUser().id,

    type:
      data.type || "Transaction",

    amount:
      Number(data.amount) || 0,

    status:
      data.status || "Pending",

    reference:
      data.reference || "",

    createdAt:
      new Date().toISOString()
  });


  writeJSON(
    STORAGE.TRANSACTIONS,
    transactions
  );
}


function renderTransactionHistory() {

  const container =
    $("historyList");

  if (!container) {
    return;
  }


  const transactions =
    getTransactions();


  if (!transactions.length) {

    container.innerHTML =
      `
      <div class="history-item">

        <div class="history-item-title">
          No transactions yet
        </div>

        <div class="history-item-meta">
          Your demo transactions will appear here.
        </div>

      </div>
      `;

    return;
  }


  container.innerHTML =
    transactions
      .map(function(item) {

        return `
          <div class="history-item">

            <div class="history-item-top">

              <div>

                <div class="history-item-title">
                  ${escapeHtml(item.type)}
                </div>

                <div class="history-item-meta">
                  ${escapeHtml(item.id)}
                </div>

              </div>

              <div class="history-item-amount">
                ${formatRupee(item.amount)}
              </div>

            </div>

            <div class="history-item-meta">
              ${item.reference
                ? "Reference: " +
                  escapeHtml(item.reference) +
                  "<br>"
                : ""
              }

              ${formatDate(item.createdAt)}
            </div>

            <span class="history-status">
              ${escapeHtml(item.status)}
            </span>

          </div>
        `;

      })
      .join("");
}


/* =========================================================
   PRODUCT PAGE
========================================================= */

function renderProducts() {

  const container =
    document.querySelector(
      ".product-list"
    );

  if (!container) {
    return;
  }


  const values =
    Object.values(PRODUCTS);


  container.innerHTML =
    values
      .map(function(product, index) {

        const popular =
          index === 1
            ? " popular"
            : "";

        return `
          <article class="product-card${popular}">

            <div class="product-top">

              <div>

                <span class="plan-tag">
                  ${index === 1
                    ? "POPULAR"
                    : "DEMO PLAN"}
                </span>

                <h3>
                  ${formatRupee(product.price)}
                </h3>

              </div>

              <span class="product-number">
                0${index + 1}
              </span>

            </div>

            <p class="product-description">
              ${escapeHtml(product.description)}
            </p>

            <ul class="product-features">

              ${product.features
                .map(function(feature) {
                  return `
                    <li>
                      ${escapeHtml(feature)}
                    </li>
                  `;
                })
                .join("")}

            </ul>

            <button
              type="button"
              class="primary product-view-btn"
              data-product="${product.price}"
            >
              View Details
            </button>

          </article>
        `;
      })
      .join("");


  document
    .querySelectorAll(
      ".product-view-btn"
    )
    .forEach(function(button) {

      button.addEventListener(
        "click",
        function() {

          const price =
            Number(
              button.dataset.product
            );

          openProductModal(price);
        }
      );
    });
}


/* =========================================================
   HOME PLAN BUTTONS
========================================================= */

function setupHomePlanButtons() {

  document
    .querySelectorAll(
      "[data-product]"
    )
    .forEach(function(button) {

      if (
        button.classList.contains(
          "product-view-btn"
        )
      ) {
        return;
      }


      button.addEventListener(
        "click",
        function() {

          const price =
            Number(
              button.dataset.product
            );

          if (
            PRODUCTS[price]
          ) {
            openProductModal(price);
          }
        }
      );
    });
}


/* =========================================================
   PRODUCT MODAL
========================================================= */

function openProductModal(price) {

  const product =
    PRODUCTS[price];


  if (!product) {
    return;
  }


  selectedProduct =
    product;


  setText(
    "modalTitle",
    product.name
  );


  setText(
    "modalPrice",
    formatRupee(product.price)
  );


  setText(
    "modalText",
    product.description
  );


  const modal =
    $("planModal");

  if (modal) {
    modal.classList.remove(
      "hidden"
    );
  }
}


function closeProductModal() {

  selectedProduct =
    null;

  const modal =
    $("planModal");

  if (modal) {
    modal.classList.add(
      "hidden"
    );
  }
}


/* =========================================================
   DEMO PURCHASE
========================================================= */

async function continueDemoPurchase() {

  if (!selectedProduct) {
    return;
  }


  const product =
    selectedProduct;


  const balance =
    getLocalBalance();


  /*
    This is intentionally a DEMO purchase.
    No real-money investment is processed.
  */

  if (balance < product.price) {

    closeProductModal();

    alert(
      `Insufficient demo balance. You need ${formatRupee(product.price)} test balance.`
    );

    showPage("depositPage");

    return;
  }


  const newBalance =
    balance - product.price;


  setLocalBalance(
    newBalance
  );


  await saveFirebaseBalance(
    newBalance
  );


  const purchase = {

    id:
      "INV-" +
      Date.now(),

    userId:
      getUser().id,

    productId:
      product.id,

    productName:
      product.name,

    amount:
      product.price,

    duration:
      product.duration,

    status:
      "Active Demo",

    createdAt:
      new Date().toISOString()
  };


  const purchases =
    readJSON(
      STORAGE.PURCHASES,
      []
    );


  purchases.unshift(
    purchase
  );


  writeJSON(
    STORAGE.PURCHASES,
    purchases
  );


  addTransaction({
    type:
      "Demo Plan Purchase",

    amount:
      product.price,

    status:
      "Active Demo",

    reference:
      purchase.id
  });


  closeProductModal();


  alert(
    `${product.name} activated in DEMO mode.`
  );


  updateBalanceUI();
  renderTransactionHistory();

  showPage("historyPage");
}


/* =========================================================
   WHATSAPP INVITE
========================================================= */

function inviteOnWhatsApp() {

  const link =
    $("referralLink")?.value ||
    window.location.href;


  const text =
    `Join ${APP_NAME} demo website using my referral link: ${link}`;


  const url =
    "https://wa.me/?text=" +
    encodeURIComponent(text);


  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}


/* =========================================================
   CUSTOMER SERVICE
========================================================= */

function openCustomerService() {

  window.open(
    CUSTOMER_SERVICE_URL,
    "_blank",
    "noopener,noreferrer"
  );
}


/* =========================================================
   PAGE-SPECIFIC WITHDRAW BUTTONS
========================================================= */

function handleHomeWithdraw() {

  showPage("infoPage");

  setTimeout(
    function() {

      const input =
        $("withdrawAmount");

      if (input) {

        input.focus();

        input.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }

    },
    250
  );
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

function setupNavigation() {

  document
    .querySelectorAll(
      ".nav-item[data-page]"
    )
    .forEach(function(button) {

      button.addEventListener(
        "click",
        function() {

          const page =
            button.dataset.page;

          if (page) {
            showPage(page);
          }
        }
      );
    });


  if ($("topProfile")) {

    $("topProfile")
      .addEventListener(
        "click",
        function() {
          showPage("infoPage");
        }
      );
  }


  if ($("depositBtn")) {

    $("depositBtn")
      .addEventListener(
        "click",
        function() {
          showPage("depositPage");
        }
      );
  }


  if ($("withdrawBtn")) {

    $("withdrawBtn")
      .addEventListener(
        "click",
        handleHomeWithdraw
      );
  }


  if ($("myInfoBtn")) {

    $("myInfoBtn")
      .addEventListener(
        "click",
        function() {
          showPage("infoPage");
        }
      );
  }


  if ($("inviteBtn")) {

    $("inviteBtn")
      .addEventListener(
        "click",
        function() {
          showPage("invitePage");
        }
      );
  }


  if ($("productsBtn")) {

    $("productsBtn")
      .addEventListener(
        "click",
        function() {
          showPage("productPage");
        }
      );
  }
}


/* =========================================================
   BACK BUTTONS
========================================================= */

function setupBackButtons() {

  if ($("historyBackBtn")) {

    $("historyBackBtn")
      .addEventListener(
        "click",
        function() {
          showPage("homePage");
        }
      );
  }


  if ($("withdrawHistoryBackBtn")) {

    $("withdrawHistoryBackBtn")
      .addEventListener(
        "click",
        function() {
          showPage("infoPage");
        }
      );
  }


  if ($("transactionHistoryBackBtn")) {

    $("transactionHistoryBackBtn")
      .addEventListener(
        "click",
        function() {
          showPage("infoPage");
        }
      );
  }
}


/* =========================================================
   INFO PAGE BUTTONS
========================================================= */

function setupInfoButtons() {

  if ($("saveBankBtn")) {

    $("saveBankBtn")
      .addEventListener(
        "click",
        saveBankDetails
      );
  }


  if ($("depositHistoryBtn")) {

    $("depositHistoryBtn")
      .addEventListener(
        "click",
        function() {
          showPage(
            "depositHistoryPage"
          );
        }
      );
  }


  if ($("withdrawalHistoryBtn")) {

    $("withdrawalHistoryBtn")
      .addEventListener(
        "click",
        function() {
          showPage(
            "withdrawalHistoryPage"
          );
        }
      );
  }


  if ($("transactionHistoryBtn")) {

    $("transactionHistoryBtn")
      .addEventListener(
        "click",
        function() {
          showPage(
            "historyPage"
          );
        }
      );
  }


  if ($("withdrawSubmit")) {

    $("withdrawSubmit")
      .addEventListener(
        "click",
        function() {

          const amount =
            $("withdrawAmount")
              ?.value;

          processWithdrawal(
            amount
          );
        }
      );
  }


  if ($("withdrawPageSubmit")) {

    $("withdrawPageSubmit")
      .addEventListener(
        "click",
        function() {

          const amount =
            $("withdrawPageAmount")
              ?.value;

          processWithdrawal(
            amount
          );
        }
      );
  }
}


/* =========================================================
   DEPOSIT BUTTONS
========================================================= */

function setupDepositButtons() {

  if ($("copyUpiBtn")) {

    $("copyUpiBtn")
      .addEventListener(
        "click",
        copyUPI
      );
  }


  if ($("paymentSubmit")) {

    $("paymentSubmit")
      .addEventListener(
        "click",
        submitDepositRequest
      );
  }
}


/* =========================================================
   PROFILE BUTTONS
========================================================= */

function setupProfileButtons() {

  if ($("profileUploadBtn")) {

    $("profileUploadBtn")
      .addEventListener(
        "click",
        function() {

          const input =
            $("profileUpload");

          if (input) {
            input.click();
          }
        }
      );
  }


  if ($("profileUpload")) {

    $("profileUpload")
      .addEventListener(
        "change",
        function() {

          const file =
            this.files?.[0];

          handleProfileImage(
            file
          );
        }
      );
  }
}


/* =========================================================
   INVITE BUTTONS
========================================================= */

function setupInviteButtons() {

  if ($("copyLinkBtn")) {

    $("copyLinkBtn")
      .addEventListener(
        "click",
        copyReferral
      );
  }


  if ($("whatsappBtn")) {

    $("whatsappBtn")
      .addEventListener(
        "click",
        inviteOnWhatsApp
      );
  }


  if ($("customerServiceBtn")) {

    $("customerServiceBtn")
      .addEventListener(
        "click",
        openCustomerService
      );
  }
}


/* =========================================================
   MODAL BUTTONS
========================================================= */

function setupModal() {

  if ($("modalClose")) {

    $("modalClose")
      .addEventListener(
        "click",
        closeProductModal
      );
  }


  if ($("modalDepositBtn")) {

    $("modalDepositBtn")
      .addEventListener(
        "click",
        continueDemoPurchase
      );
  }


  const modal =
    $("planModal");

  if (modal) {

    modal.addEventListener(
      "click",
      function(event) {

        if (
          event.target === modal
        ) {
          closeProductModal();
        }
      }
    );
  }
}


/* =========================================================
   KEYBOARD
========================================================= */

function setupKeyboard() {

  document.addEventListener(
    "keydown",
    function(event) {

      if (
        event.key === "Escape"
      ) {

        closeProductModal();
      }
    }
  );
}


/* =========================================================
   INPUT RESTRICTIONS
========================================================= */

function setupInputValidation() {

  if ($("utr")) {

    $("utr")
      .addEventListener(
        "input",
        function() {

          this.value =
            this.value
              .replace(/\s/g, "")
              .slice(0, 50);
        }
      );
  }


  if ($("bankIfsc")) {

    $("bankIfsc")
      .addEventListener(
        "input",
        function() {

          this.value =
            this.value
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, "")
              .slice(0, 11);
        }
      );
  }


  if ($("bankAccount")) {

    $("bankAccount")
      .addEventListener(
        "input",
        function() {

          this.value =
            this.value
              .replace(/\D/g, "")
              .slice(0, 20);
        }
      );
  }


  if ($("bankAccountRepeat")) {

    $("bankAccountRepeat")
      .addEventListener(
        "input",
        function() {

          this.value =
            this.value
              .replace(/\D/g, "")
              .slice(0, 20);
        }
      );
  }
}


/* =========================================================
   DEFAULT DATA
========================================================= */

function initializeLocalData() {

  getUser();

  getReferralCode();

  if (
    localStorage.getItem(
      STORAGE.BALANCE
    ) === null
  ) {

    localStorage.setItem(
      STORAGE.BALANCE,
      "0"
    );
  }


  if (
    !localStorage.getItem(
      STORAGE.DEPOSITS
    )
  ) {

    writeJSON(
      STORAGE.DEPOSITS,
      []
    );
  }


  if (
    !localStorage.getItem(
      STORAGE.WITHDRAWALS
    )
  ) {

    writeJSON(
      STORAGE.WITHDRAWALS,
      []
    );
  }


  if (
    !localStorage.getItem(
      STORAGE.TRANSACTIONS
    )
  ) {

    writeJSON(
      STORAGE.TRANSACTIONS,
      []
    );
  }


  if (
    !localStorage.getItem(
      STORAGE.PURCHASES
    )
  ) {

    writeJSON(
      STORAGE.PURCHASES,
      []
    );
  }
}


/* =========================================================
   HOME DATA
========================================================= */

function setupHomeData() {

  updateGreeting();
  updateBalanceUI();
  updateReferralLink();
}


/* =========================================================
   HISTORY TITLES
========================================================= */

function setupHistoryTitles() {

  if ($("historyPageTitle")) {

    $("historyPageTitle")
      .textContent =
      "Transaction History";
  }


  if ($("historyPageSubtitle")) {

    $("historyPageSubtitle")
      .textContent =
      "Your demo transaction records";
  }
}


/* =========================================================
   INIT
========================================================= */

async function initializeApp() {

  initializeLocalData();

  updateProfileUI();

  setupHomeData();

  loadBankDetails();

  setupNavigation();

  setupBackButtons();

  setupInfoButtons();

  setupDepositButtons();

  setupProfileButtons();

  setupInviteButtons();

  setupModal();

  setupKeyboard();

  setupInputValidation();

  setupScreenshotPreview();

  setupHistoryTitles();

  renderProducts();

  setupHomePlanButtons();

  renderDepositHistory();

  renderWithdrawalHistory();

  renderTransactionHistory();

  updateBalanceUI();

  await initializeFirebase();
}


/* =========================================================
   DOM READY
========================================================= */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    initializeApp
  );

} else {

  initializeApp();
}


/* =========================================================
   DEBUG HELPERS
========================================================= */

window.BitcoinMinningApp = {

  getUser: getUser,

  getBalance:
    getLocalBalance,

  setDemoBalance:
    async function(amount) {

      const balance =
        setLocalBalance(amount);

      await saveFirebaseBalance(
        balance
      );

      return balance;
    },

  getDeposits:
    function() {

      return readJSON(
        STORAGE.DEPOSITS,
        []
      );
    },

  getWithdrawals:
    function() {

      return readJSON(
        STORAGE.WITHDRAWALS,
        []
      );
    },

  getTransactions:
    getTransactions,

  getPurchases:
    function() {

      return readJSON(
        STORAGE.PURCHASES,
        []
      );
    },

  showPage:
    showPage
};


/* =========================================================
   END
========================================================= */
