/* =========================================================
   BITCOIN MINNING
   Main JavaScript
   Firebase + Local Demo Data
   ========================================================= */

"use strict";


/* =========================================================
   CONFIG
   ========================================================= */

const UPI_ID = "yadav-rishab@fam";
const CUSTOMER_SERVICE = "https://t.me/Hammerff7gcz";

const STORAGE = {
  user: "bm_user",
  balance: "bm_balance",
  profile: "bm_profile",
  bank: "bm_bank",
  deposits: "bm_deposit_history",
  withdrawals: "bm_withdrawal_history",
  transactions: "bm_transactions",
  referral: "bm_referral"
};


/* =========================================================
   HELPERS
   ========================================================= */

function $(id) {
  return document.getElementById(id);
}

function safeJSONParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function getStorage(key, fallback) {
  return safeJSONParse(localStorage.getItem(key), fallback);
}

function setStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function money(value) {
  const number = Number(value) || 0;

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function nowString() {
  return new Date().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function generateUserId() {
  return "You-" + Math.floor(1000000 + Math.random() * 9000000);
}

function getUser() {
  let user = getStorage(STORAGE.user, null);

  if (!user) {
    user = {
      id: generateUserId(),
      createdAt: new Date().toISOString()
    };

    setStorage(STORAGE.user, user);
  }

  return user;
}

function getBalance() {
  return Number(localStorage.getItem(STORAGE.balance)) || 0;
}

function setBalance(value) {
  const balance = Math.max(0, Number(value) || 0);

  localStorage.setItem(STORAGE.balance, String(balance));

  updateBalanceUI();
}

function showMessage(element, text, type) {
  if (!element) return;

  element.textContent = text;
  element.className = "message";

  if (type) {
    element.classList.add(type);
  }
}

function clearMessage(element) {
  if (!element) return;

  element.textContent = "";
  element.className = "message";
}


/* =========================================================
   FIREBASE
   ========================================================= */

let firebaseUser = null;

async function initializeFirebase() {

  if (
    typeof firebase === "undefined" ||
    typeof auth === "undefined"
  ) {
    console.warn("Firebase is not available.");
    return;
  }

  try {

    if (!auth.currentUser) {
      await auth.signInAnonymously();
    }

    firebaseUser = auth.currentUser;

    console.log("Firebase connected:", firebaseUser.uid);

    await loadFirebaseTestBalance();

  } catch (error) {

    console.warn(
      "Firebase initialization failed:",
      error
    );

  }
}


async function loadFirebaseTestBalance() {

  if (
    !firebaseUser ||
    typeof db === "undefined"
  ) {
    return;
  }

  try {

    const ref = db
      .collection("testBalances")
      .doc(firebaseUser.uid);

    const snapshot = await ref.get();

    if (!snapshot.exists) {

      await ref.set({
        uid: firebaseUser.uid,
        userId: getUser().id,
        balance: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      setBalance(0);

      return;
    }

    const data = snapshot.data();

    if (typeof data.balance === "number") {
      setBalance(data.balance);
    }

  } catch (error) {

    console.warn(
      "Could not load Firebase balance:",
      error
    );

  }
}


/* =========================================================
   SAVE TEST BALANCE
   ========================================================= */

async function saveFirebaseBalance(balance) {

  if (
    !firebaseUser ||
    typeof db === "undefined"
  ) {
    return false;
  }

  try {

    await db
      .collection("testBalances")
      .doc(firebaseUser.uid)
      .set(
        {
          uid: firebaseUser.uid,
          userId: getUser().id,
          balance: Number(balance) || 0,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        },
        {
          merge: true
        }
      );

    return true;

  } catch (error) {

    console.warn(
      "Firebase balance save failed:",
      error
    );

    return false;
  }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

const allPages = [
  "homePage",
  "productPage",
  "infoPage",
  "depositPage",
  "withdrawPage",
  "depositHistoryPage",
  "withdrawalHistoryPage",
  "historyPage",
  "invitePage"
];

function showPage(pageId) {

  allPages.forEach(function (id) {

    const page = $(id);

    if (page) {
      page.classList.remove("active");
    }

  });

  const target = $(pageId);

  if (target) {
    target.classList.add("active");
  }

  document
    .querySelectorAll(".nav-item")
    .forEach(function (item) {

      item.classList.remove("active");

      if (item.dataset.page === pageId) {
        item.classList.add("active");
      }

    });

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
    renderTransactions();
  }

  if (pageId === "infoPage") {
    loadBankDetails();
    updateBalanceUI();
  }
}


/* =========================================================
   BOTTOM NAV
   ========================================================= */

document
  .querySelectorAll(".nav-item")
  .forEach(function (item) {

    item.addEventListener("click", function () {

      const pageId = item.dataset.page;

      if (pageId) {
        showPage(pageId);
      }

    });

  });


/* =========================================================
   HOME BUTTONS
   ========================================================= */

if ($("depositBtn")) {

  $("depositBtn").addEventListener("click", function () {
    showPage("depositPage");
  });

}


if ($("withdrawBtn")) {

  $("withdrawBtn").addEventListener("click", function () {

    showPage("withdrawPage");

    setTimeout(function () {

      if ($("withdrawPageAmount")) {
        $("withdrawPageAmount").focus();
      }

    }, 250);

  });

}


if ($("myInfoBtn")) {

  $("myInfoBtn").addEventListener("click", function () {
    showPage("infoPage");
  });

}


if ($("inviteBtn")) {

  $("inviteBtn").addEventListener("click", function () {
    showPage("invitePage");
  });

}


if ($("productsBtn")) {

  $("productsBtn").addEventListener("click", function () {
    showPage("productPage");
  });

}


if ($("topProfile")) {

  $("topProfile").addEventListener("click", function () {
    showPage("infoPage");
  });

}


/* =========================================================
   USER / GREETING
   ========================================================= */

function initializeUser() {

  const user = getUser();

  if ($("profileUserId")) {
    $("profileUserId").textContent =
      "User ID: " + user.id;
  }

  if ($("greeting")) {

    const hour = new Date().getHours();

    let greeting = "Good evening";

    if (hour < 12) {
      greeting = "Good morning";
    } else if (hour < 17) {
      greeting = "Good afternoon";
    }

    $("greeting").textContent =
      greeting + ", User 👋";

  }

}


/* =========================================================
   BALANCE UI
   ========================================================= */

function updateBalanceUI() {

  const balance = getBalance();

  if ($("homeBalance")) {
    $("homeBalance").textContent = money(balance);
  }

  if ($("infoBalance")) {
    $("infoBalance").textContent = money(balance);
  }

  if ($("withdrawBalance")) {
    $("withdrawBalance").textContent = money(balance);
  }

  if ($("withdrawPageBalance")) {
    $("withdrawPageBalance").textContent = money(balance);
  }

}


/* =========================================================
   PROFILE
   ========================================================= */

function loadProfile() {

  const profile = getStorage(
    STORAGE.profile,
    null
  );

  if (!profile || !profile.image) {
    return;
  }

  if ($("profileImage")) {

    $("profileImage").src = profile.image;
    $("profileImage").classList.add("show");

  }

  if ($("profileLetter")) {
    $("profileLetter").style.display = "none";
  }

  if ($("topProfileImg")) {

    $("topProfileImg").src = profile.image;
    $("topProfileImg").classList.add("show");

  }

  if ($("topProfileLetter")) {
    $("topProfileLetter").style.display = "none";
  }

}


if ($("profileUploadBtn")) {

  $("profileUploadBtn").addEventListener(
    "click",
    function () {

      if ($("profileUpload")) {
        $("profileUpload").click();
      }

    }
  );

}


if ($("profileUpload")) {

  $("profileUpload").addEventListener(
    "change",
    function () {

      const file = this.files && this.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Please select an image.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Image should be smaller than 5 MB.");
        return;
      }

      const reader = new FileReader();

      reader.onload = function (event) {

        const image = event.target.result;

        setStorage(STORAGE.profile, {
          image: image
        });

        loadProfile();

      };

      reader.readAsDataURL(file);

    }
  );

}


/* =========================================================
   BANK DETAILS
   ========================================================= */

function loadBankDetails() {

  const bank = getStorage(
    STORAGE.bank,
    null
  );

  if (!bank) return;

  if ($("bankName")) {
    $("bankName").value = bank.name || "";
  }

  if ($("bankIfsc")) {
    $("bankIfsc").value = bank.ifsc || "";
  }

  if ($("bankBankName")) {
    $("bankBankName").value = bank.bankName || "";
  }

  if ($("bankAccount")) {
    $("bankAccount").value = bank.account || "";
  }

  if ($("bankAccountRepeat")) {
    $("bankAccountRepeat").value =
      bank.accountRepeat || "";
  }

}


if ($("saveBankBtn")) {

  $("saveBankBtn").addEventListener(
    "click",
    function () {

      const name =
        $("bankName")
          ? $("bankName").value.trim()
          : "";

      const ifsc =
        $("bankIfsc")
          ? $("bankIfsc").value.trim()
          : "";

      const bankName =
        $("bankBankName")
          ? $("bankBankName").value.trim()
          : "";

      const account =
        $("bankAccount")
          ? $("bankAccount").value.trim()
          : "";

      const accountRepeat =
        $("bankAccountRepeat")
          ? $("bankAccountRepeat").value.trim()
          : "";

      const message = $("bankMessage");

      clearMessage(message);

      if (!name) {
        showMessage(
          message,
          "Enter account holder name.",
          "error"
        );
        return;
      }

      if (!ifsc) {
        showMessage(
          message,
          "Enter IFSC code.",
          "error"
        );
        return;
      }

      if (!bankName) {
        showMessage(
          message,
          "Enter bank name.",
          "error"
        );
        return;
      }

      if (!account) {
        showMessage(
          message,
          "Enter account number.",
          "error"
        );
        return;
      }

      if (account !== accountRepeat) {
        showMessage(
          message,
          "Account numbers do not match.",
          "error"
        );
        return;
      }

      setStorage(STORAGE.bank, {
        name: name,
        ifsc: ifsc,
        bankName: bankName,
        account: account,
        accountRepeat: accountRepeat
      });

      showMessage(
        message,
        "Bank details saved locally for this demo.",
        "success"
      );

    }
  );

}


/* =========================================================
   DEPOSIT
   ========================================================= */

let selectedScreenshotData = "";


if ($("copyUpiBtn")) {

  $("copyUpiBtn").addEventListener(
    "click",
    async function () {

      try {

        await navigator.clipboard.writeText(UPI_ID);

        this.textContent = "Copied";

        const button = this;

        setTimeout(function () {
          button.textContent = "Copy";
        }, 1500);

      } catch (error) {

        alert("UPI ID: " + UPI_ID);

      }

    }
  );

}


/* SCREENSHOT PREVIEW */

if ($("paymentScreenshot")) {

  $("paymentScreenshot").addEventListener(
    "change",
    function () {

      const file =
        this.files && this.files[0];

      if (!file) {
        selectedScreenshotData = "";

        if ($("paymentScreenshotPreview")) {
          $("paymentScreenshotPreview").innerHTML = "";
          $("paymentScreenshotPreview")
            .classList.remove("show");
        }

        return;
      }

      if (!file.type.startsWith("image/")) {

        alert("Please select an image.");

        this.value = "";
        return;

      }

      if (file.size > 5 * 1024 * 1024) {

        alert(
          "Screenshot should be smaller than 5 MB."
        );

        this.value = "";
        return;

      }

      const reader = new FileReader();

      reader.onload = function (event) {

        selectedScreenshotData =
          event.target.result;

        if ($("paymentScreenshotPreview")) {

          $("paymentScreenshotPreview").innerHTML =
            "<img src=\"" +
            selectedScreenshotData +
            "\" alt=\"Payment screenshot preview\">";

          $("paymentScreenshotPreview")
            .classList.add("show");

        }

      };

      reader.readAsDataURL(file);

    }
  );

}


/* =========================================================
   DEPOSIT REQUEST
   ========================================================= */

if ($("paymentSubmit")) {

  $("paymentSubmit").addEventListener(
    "click",
    function () {

      const amount = Number(
        $("depositAmount")
          ? $("depositAmount").value
          : 0
      );

      const utr =
        $("utr")
          ? $("utr").value.trim()
          : "";

      const message =
        $("paymentMessage");

      clearMessage(message);

      if (!amount || amount < 200 || amount > 50000) {

        showMessage(
          message,
          "Enter an amount between ₹200 and ₹50,000.",
          "error"
        );

        return;
      }

      if (!utr) {

        showMessage(
          message,
          "Enter the transaction reference.",
          "error"
        );

        return;
      }

      if (!selectedScreenshotData) {

        showMessage(
          message,
          "Please select a payment screenshot.",
          "error"
        );

        return;
      }


      const user = getUser();

      const request = {

        id:
          "DEP-" +
          Date.now(),

        userId:
          user.id,

        amount:
          amount,

        utr:
          utr,

        status:
          "Pending Verification",

        createdAt:
          new Date().toISOString()

      };


      const history = getStorage(
        STORAGE.deposits,
        []
      );

      history.unshift(request);

      setStorage(
        STORAGE.deposits,
        history.slice(0, 100)
      );


      addTransaction({
        type: "Deposit Request",
        amount: amount,
        status: "Pending Verification",
        reference: request.id
      });


      showMessage(
        message,
        "Request submitted. Status: Pending Verification.",
        "success"
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

      selectedScreenshotData = "";

      if ($("paymentScreenshotPreview")) {
        $("paymentScreenshotPreview").innerHTML = "";
        $("paymentScreenshotPreview")
          .classList.remove("show");
      }

    }
  );

}


/* =========================================================
   WITHDRAWAL
   ========================================================= */

function createWithdrawal(amount, messageElement) {

  const balance = getBalance();

  if (!amount || amount < 500 || amount > 20000) {

    showMessage(
      messageElement,
      "Enter an amount between ₹500 and ₹20,000.",
      "error"
    );

    return false;
  }

  if (amount > balance) {

    showMessage(
      messageElement,
      "Insufficient demo balance.",
      "error"
    );

    return false;
  }


  const history = getStorage(
    STORAGE.withdrawals,
    []
  );


  const today = new Date().toDateString();

  const todayCount =
    history.filter(function (item) {

      return new Date(item.createdAt)
        .toDateString() === today;

    }).length;


  if (todayCount >= 3) {

    showMessage(
      messageElement,
      "Maximum 3 withdrawal requests per day.",
      "error"
    );

    return false;
  }


  const now = new Date();

  const minutes =
    now.getHours() * 60 +
    now.getMinutes();

  const opening =
    10 * 60 + 30;

  const closing =
    17 * 60;


  if (
    minutes < opening ||
    minutes > closing
  ) {

    showMessage(
      messageElement,
      "Withdrawal requests are available from 10:30 AM to 5:00 PM.",
      "error"
    );

    return false;
  }


  const request = {

    id:
      "WDR-" +
      Date.now(),

    userId:
      getUser().id,

    amount:
      amount,

    status:
      "Pending Verification",

    createdAt:
      new Date().toISOString()

  };


  history.unshift(request);

  setStorage(
    STORAGE.withdrawals,
    history.slice(0, 100)
  );


  setBalance(balance - amount);

  saveFirebaseBalance(
    getBalance()
  );


  addTransaction({

    type:
      "Withdrawal Request",

    amount:
      amount,

    status:
      "Pending Verification",

    reference:
      request.id

  });


  showMessage(
    messageElement,
    "Withdrawal request submitted.",
    "success"
  );


  return true;
}


/* OLD INFO WITHDRAW */

if ($("withdrawSubmit")) {

  $("withdrawSubmit").addEventListener(
    "click",
    function () {

      const amount = Number(
        $("withdrawAmount")
          ? $("withdrawAmount").value
          : 0
      );

      const success = createWithdrawal(
        amount,
        $("withdrawMessage")
      );

      if (success && $("withdrawAmount")) {
        $("withdrawAmount").value = "";
      }

    }
  );

}


/* SEPARATE WITHDRAW PAGE */

if ($("withdrawPageSubmit")) {

  $("withdrawPageSubmit").addEventListener(
    "click",
    function () {

      const amount = Number(
        $("withdrawPageAmount")
          ? $("withdrawPageAmount").value
          : 0
      );

      const success = createWithdrawal(
        amount,
        $("withdrawPageMessage")
      );

      if (success && $("withdrawPageAmount")) {
        $("withdrawPageAmount").value = "";
      }

    }
  );

}


/* =========================================================
   TRANSACTIONS
   ========================================================= */

function addTransaction(transaction) {

  const transactions =
    getStorage(
      STORAGE.transactions,
      []
    );

  transactions.unshift({

    id:
      transaction.reference ||
      ("TX-" + Date.now()),

    type:
      transaction.type || "Transaction",

    amount:
      Number(transaction.amount) || 0,

    status:
      transaction.status || "Pending",

    createdAt:
      new Date().toISOString()

  });

  setStorage(
    STORAGE.transactions,
    transactions.slice(0, 200)
  );

}


/* =========================================================
   HISTORY RENDER
   ========================================================= */

function emptyHistoryHTML(title, text) {

  return `
    <div class="history-empty">
      <strong>${title}</strong>
      <span>${text}</span>
    </div>
  `;

}


function historyItemHTML(item, type) {

  const title =
    type === "deposit"
      ? "Deposit Request"
      : "Withdrawal Request";

  const amount =
    money(item.amount);

  const status =
    String(item.status || "Pending")
      .toLowerCase()
      .replace(/\s+/g, "-");

  const date =
    item.createdAt
      ? new Date(item.createdAt)
          .toLocaleString("en-IN")
      : "-";


  return `
    <div class="history-item">

      <div class="history-item-top">

        <div>
          <div class="history-item-title">
            ${title}
          </div>

          <div class="history-item-meta">
            ${date}
          </div>
        </div>

        <div class="history-item-amount">
          ₹${amount}
        </div>

      </div>

      <div class="history-item-meta">

        <span>
          ${item.id || "-"}
        </span>

        <span class="status ${status}">
          ${item.status || "Pending"}
        </span>

      </div>

    </div>
  `;

}


function renderDepositHistory() {

  const container =
    $("depositHistoryList");

  if (!container) return;

  const history =
    getStorage(
      STORAGE.deposits,
      []
    );

  if (!history.length) {

    container.innerHTML =
      emptyHistoryHTML(
        "No deposit requests",
        "Your deposit requests will appear here."
      );

    return;
  }

  container.innerHTML =
    history
      .map(function (item) {
        return historyItemHTML(
          item,
          "deposit"
        );
      })
      .join("");

}


function renderWithdrawalHistory() {

  const container =
    $("withdrawalHistoryList");

  if (!container) return;

  const history =
    getStorage(
      STORAGE.withdrawals,
      []
    );

  if (!history.length) {

    container.innerHTML =
      emptyHistoryHTML(
        "No withdrawal requests",
        "Your withdrawal requests will appear here."
      );

    return;
  }

  container.innerHTML =
    history
      .map(function (item) {
        return historyItemHTML(
          item,
          "withdrawal"
        );
      })
      .join("");

}


function renderTransactions() {

  const container =
    $("historyList");

  if (!container) return;

  const transactions =
    getStorage(
      STORAGE.transactions,
      []
    );

  if (!transactions.length) {

    container.innerHTML =
      emptyHistoryHTML(
        "No transactions",
        "Your demo transactions will appear here."
      );

    return;
  }


  container.innerHTML =
    transactions
      .map(function (item) {

        const status =
          String(item.status || "Pending")
            .toLowerCase()
            .replace(/\s+/g, "-");

        const date =
          item.createdAt
            ? new Date(item.createdAt)
                .toLocaleString("en-IN")
            : "-";

        return `
          <div class="history-item">

            <div class="history-item-top">

              <div>

                <div class="history-item-title">
                  ${item.type}
                </div>

                <div class="history-item-meta">
                  ${date}
                </div>

              </div>

              <div class="history-item-amount">
                ₹${money(item.amount)}
              </div>

            </div>

            <div class="history-item-meta">

              <span>
                ${item.id || "-"}
              </span>

              <span class="status ${status}">
                ${item.status || "Pending"}
              </span>

            </div>

          </div>
        `;

      })
      .join("");

}


/* =========================================================
   HISTORY BUTTONS
   ========================================================= */

if ($("depositHistoryBtn")) {

  $("depositHistoryBtn").addEventListener(
    "click",
    function () {

      showPage("depositHistoryPage");

    }
  );

}


if ($("withdrawalHistoryBtn")) {

  $("withdrawalHistoryBtn").addEventListener(
    "click",
    function () {

      showPage("withdrawalHistoryPage");

    }
  );

}


if ($("transactionHistoryBtn")) {

  $("transactionHistoryBtn").addEventListener(
    "click",
    function () {

      showPage("historyPage");

    }
  );

}


/* BACK BUTTONS */

if ($("historyBackBtn")) {

  $("historyBackBtn").addEventListener(
    "click",
    function () {
      showPage("infoPage");
    }
  );

}


if ($("withdrawHistoryBackBtn")) {

  $("withdrawHistoryBackBtn").addEventListener(
    "click",
    function () {
      showPage("infoPage");
    }
  );

}


if ($("transactionHistoryBackBtn")) {

  $("transactionHistoryBackBtn").addEventListener(
    "click",
    function () {
      showPage("infoPage");
    }
  );

}


/* =========================================================
   INVITE
   ========================================================= */

function initializeReferral() {

  const user =
    getUser();

  const base =
    window.location.origin +
    window.location.pathname;

  const referral =
    base +
    "?ref=" +
    encodeURIComponent(user.id);


  setStorage(
    STORAGE.referral,
    referral
  );


  if ($("referralLink")) {
    $("referralLink").value =
      referral;
  }

}


if ($("copyLinkBtn")) {

  $("copyLinkBtn").addEventListener(
    "click",
    async function () {

      const link =
        $("referralLink")
          ? $("referralLink").value
          : "";

      if (!link) return;

      try {

        await navigator.clipboard.writeText(link);

        this.textContent = "Copied";

        const button = this;

        setTimeout(function () {
          button.textContent = "Copy";
        }, 1500);

      } catch (error) {

        alert(link);

      }

    }
  );

}


if ($("whatsappBtn")) {

  $("whatsappBtn").addEventListener(
    "click",
    function () {

      const link =
        $("referralLink")
          ? $("referralLink").value
          : window.location.href;

      const message =
        "Check this website: " +
        link;

      const url =
        "https://wa.me/?text=" +
        encodeURIComponent(message);

      window.open(
        url,
        "_blank"
      );

    }
  );

}


/* =========================================================
   CUSTOMER SERVICE
   ========================================================= */

if ($("customerServiceBtn")) {

  $("customerServiceBtn").addEventListener(
    "click",
    function () {

      window.open(
        CUSTOMER_SERVICE,
        "_blank"
      );

    }
  );

}


/* =========================================================
   PLAN MODAL
   ========================================================= */

function openPlanModal(amount) {

  if (!$("planModal")) return;

  if ($("modalTitle")) {
    $("modalTitle").textContent =
      "₹" + money(amount) + " Mining Plan";
  }

  if ($("modalText")) {
    $("modalText").textContent =
      "This is a demo mining plan. " +
      "No guaranteed return or automatic real-money transaction is performed.";
  }

  $("planModal").classList.add("show");

  $("planModal").setAttribute(
    "aria-hidden",
    "false"
  );

  $("planModal").dataset.amount =
    String(amount);

}


document
  .querySelectorAll(".plan-open, .product-select")
  .forEach(function (button) {

    button.addEventListener(
      "click",
      function () {

        const amount =
          Number(this.dataset.plan);

        if (amount) {
          openPlanModal(amount);
        }

      }
    );

  });


if ($("modalClose")) {

  $("modalClose").addEventListener(
    "click",
    function () {

      $("planModal").classList.remove("show");

      $("planModal").setAttribute(
        "aria-hidden",
        "true"
      );

    }
  );

}


if ($("planModal")) {

  $("planModal").addEventListener(
    "click",
    function (event) {

      if (event.target === this) {

        this.classList.remove("show");

        this.setAttribute(
          "aria-hidden",
          "true"
        );

      }

    }
  );

}


if ($("modalDepositBtn")) {

  $("modalDepositBtn").addEventListener(
    "click",
    function () {

      if ($("planModal")) {

        $("planModal").classList.remove("show");

        $("planModal").setAttribute(
          "aria-hidden",
          "true"
        );

      }

      showPage("depositPage");

    }
  );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initializeApp() {

  initializeUser();

  initializeReferral();

  loadProfile();

  loadBankDetails();

  updateBalanceUI();

  renderDepositHistory();

  renderWithdrawalHistory();

  renderTransactions();

  initializeFirebase();

}


/* =========================================================
   START
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    initializeApp();

  }
);
