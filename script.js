/* =========================================
   BITCOIN MINNING - SCRIPT
========================================= */


/* =========================================
   PAGE NAVIGATION
========================================= */

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav");


function showPage(pageId) {

  pages.forEach(function(page) {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }

  navButtons.forEach(function(button) {
    button.classList.remove("active");

    if (button.dataset.page === pageId) {
      button.classList.add("active");
    }
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* Bottom navigation */

navButtons.forEach(function(button) {

  button.addEventListener("click", function() {

    const pageId = button.dataset.page;

    if (pageId) {
      showPage(pageId);
    }

  });

});


/* Buttons having data-page */

document.querySelectorAll("[data-page]").forEach(function(button) {

  button.addEventListener("click", function() {

    const pageId = button.dataset.page;

    if (pageId) {
      showPage(pageId);
    }

  });

});


/* Back buttons */

document.querySelectorAll("[data-back]").forEach(function(button) {

  button.addEventListener("click", function() {

    const pageId = button.dataset.back;

    if (pageId) {
      showPage(pageId);
    }

  });

});


/* =========================================
   USER ID
========================================= */

function createUserId() {

  let userId =
    localStorage.getItem("bm_user_id");

  if (!userId) {

    const number =
      Math.floor(
        1000000 +
        Math.random() * 9000000
      );

    userId =
      "You-" + number;

    localStorage.setItem(
      "bm_user_id",
      userId
    );
  }

  const elements = [
    document.getElementById("profileUserId")
  ];

  elements.forEach(function(element) {

    if (element) {
      element.textContent = userId;
    }

  });
}


/* =========================================
   BALANCE
========================================= */

function getBalance() {

  const saved =
    localStorage.getItem("bm_balance");

  if (saved === null) {
    localStorage.setItem(
      "bm_balance",
      "0"
    );

    return 0;
  }

  return Number(saved) || 0;
}


function updateBalance() {

  const balance = getBalance();

  const formatted =
    "₹" +
    balance.toLocaleString("en-IN");


  const ids = [
    "homeBalance",
    "infoBalance",
    "withdrawBalance"
  ];


  ids.forEach(function(id) {

    const element =
      document.getElementById(id);

    if (element) {
      element.textContent =
        formatted;
    }

  });
}


/* =========================================
   INDIA TIME / GREETING
========================================= */

function updateGreeting() {

  const greeting =
    document.getElementById("greeting");

  if (!greeting) return;


  const now =
    new Date();

  const hour =
    Number(
      new Intl.DateTimeFormat(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          hour12: false
        }
      ).format(now)
    );


  if (hour >= 5 && hour < 12) {

    greeting.textContent =
      "Good Morning";

  } else if (hour >= 12 && hour < 17) {

    greeting.textContent =
      "Good Afternoon";

  } else if (hour >= 17 && hour < 21) {

    greeting.textContent =
      "Good Evening";

  } else {

    greeting.textContent =
      "Good Night";

  }

}


/* =========================================
   PRODUCT MODAL
========================================= */

const productModal =
  document.getElementById("productModal");

const modalClose =
  document.getElementById("modalClose");

const modalTitle =
  document.getElementById("modalTitle");

const modalText =
  document.getElementById("modalText");


document.querySelectorAll(
  "[data-product]"
).forEach(function(button) {

  button.addEventListener(
    "click",
    function() {

      const product =
        button.dataset.product;

      if (modalTitle) {
        modalTitle.textContent =
          product + " Mining Plan";
      }

      if (modalText) {

        modalText.textContent =
          "This is informational content " +
          "about the selected mining plan. " +
          "This GitHub Pages version does " +
          "not guarantee investment returns " +
          "or process real-money investments.";

      }

      if (productModal) {
        productModal.classList.add("show");
      }

    }
  );

});


if (modalClose) {

  modalClose.addEventListener(
    "click",
    function() {

      productModal.classList.remove("show");

    }
  );

}


if (productModal) {

  productModal.addEventListener(
    "click",
    function(event) {

      if (event.target === productModal) {

        productModal.classList.remove(
          "show"
        );

      }

    }
  );

}


/* =========================================
   PROFILE IMAGE
========================================= */

const profileUploadBtn =
  document.getElementById(
    "profileUploadBtn"
  );

const profileGallery =
  document.getElementById(
    "profileGallery"
  );

const profileImage =
  document.getElementById(
    "profileImage"
  );

const profileLetter =
  document.getElementById(
    "profileLetter"
  );

const topProfileImg =
  document.getElementById(
    "topProfileImg"
  );

const topProfileLetter =
  document.getElementById(
    "topProfileLetter"
  );


function loadProfileImage() {

  const savedImage =
    localStorage.getItem(
      "bm_profile_image"
    );

  if (!savedImage) return;


  if (profileImage) {

    profileImage.src =
      savedImage;

    profileImage.classList.add(
      "show"
    );

  }


  if (profileLetter) {
    profileLetter.style.display =
      "none";
  }


  if (topProfileImg) {

    topProfileImg.src =
      savedImage;

    topProfileImg.classList.add(
      "show"
    );

  }


  if (topProfileLetter) {
    topProfileLetter.style.display =
      "none";
  }

}


if (profileUploadBtn && profileGallery) {

  profileUploadBtn.addEventListener(
    "click",
    function() {

      profileGallery.click();

    }
  );


  profileGallery.addEventListener(
    "change",
    function() {

      const file =
        profileGallery.files[0];

      if (!file) return;

      if (!file.type.startsWith("image/")) {
        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        function(event) {

          const imageData =
            event.target.result;

          localStorage.setItem(
            "bm_profile_image",
            imageData
          );

          loadProfileImage();

        };


      reader.readAsDataURL(file);

    }
  );

}


/* =========================================
   BANK DETAILS
========================================= */

const bankName =
  document.getElementById(
    "bankName"
  );

const bankIfsc =
  document.getElementById(
    "bankIfsc"
  );

const bankBankName =
  document.getElementById(
    "bankBankName"
  );

const bankAccount =
  document.getElementById(
    "bankAccount"
  );

const bankAccountRepeat =
  document.getElementById(
    "bankAccountRepeat"
  );

const saveBankBtn =
  document.getElementById(
    "saveBankBtn"
  );

const bankMessage =
  document.getElementById(
    "bankMessage"
  );


function loadBankDetails() {

  let data;

  try {

    data =
      JSON.parse(
        localStorage.getItem(
          "bm_bank_details"
        ) || "null"
      );

  } catch (error) {

    data = null;

  }


  if (!data) return;


  if (bankName)
    bankName.value =
      data.name || "";

  if (bankIfsc)
    bankIfsc.value =
      data.ifsc || "";

  if (bankBankName)
    bankBankName.value =
      data.bankName || "";

  if (bankAccount)
    bankAccount.value =
      data.account || "";

  if (bankAccountRepeat)
    bankAccountRepeat.value =
      data.account || "";

}


if (saveBankBtn) {

  saveBankBtn.addEventListener(
    "click",
    function() {

      const name =
        bankName.value.trim();

      const ifsc =
        bankIfsc.value.trim();

      const bank =
        bankBankName.value.trim();

      const account =
        bankAccount.value.trim();

      const repeat =
        bankAccountRepeat.value.trim();


      if (
        !name ||
        !ifsc ||
        !bank ||
        !account ||
        !repeat
      ) {

        bankMessage.textContent =
          "Please fill all bank details.";

        return;

      }


      if (account !== repeat) {

        bankMessage.textContent =
          "Account numbers do not match.";

        return;

      }


      const data = {

        name: name,
        ifsc: ifsc,
        bankName: bank,
        account: account

      };


      localStorage.setItem(
        "bm_bank_details",
        JSON.stringify(data)
      );


      bankMessage.textContent =
        "✓ Bank details saved locally.";

    }
  );

}


/* =========================================
   WITHDRAWAL
========================================= */

const withdrawAmount =
  document.getElementById(
    "withdrawAmount"
  );

const withdrawSubmit =
  document.getElementById(
    "withdrawSubmit"
  );

const withdrawMessage =
  document.getElementById(
    "withdrawMessage"
  );


function getISTDate() {

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Kolkata"
    }
  ).format(
    new Date()
  );

}


function getISTHourMinute() {

  const parts =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }
    ).formatToParts(
      new Date()
    );


  let hour = 0;
  let minute = 0;


  parts.forEach(function(part) {

    if (part.type === "hour") {
      hour = Number(part.value);
    }

    if (part.type === "minute") {
      minute = Number(part.value);
    }

  });


  return {
    hour: hour,
    minute: minute
  };

}


if (withdrawSubmit) {

  withdrawSubmit.addEventListener(
    "click",
    function() {

      const amount =
        Number(
          withdrawAmount.value
        );


      if (
        !amount ||
        amount < 500 ||
        amount > 20000
      ) {

        withdrawMessage.textContent =
          "Withdrawal amount must be ₹500 - ₹20,000.";

        return;

      }


      const time =
        getISTHourMinute();

      const totalMinutes =
        time.hour * 60 +
        time.minute;


      const start =
        10 * 60 + 30;

      const end =
        17 * 60 + 30;


      if (
        totalMinutes < start ||
        totalMinutes > end
      ) {

        withdrawMessage.textContent =
          "Withdrawal time is 10:30 AM - 5:30 PM IST.";

        return;

      }


      const today =
        getISTDate();


      let records =
        JSON.parse(
          localStorage.getItem(
            "bm_withdrawals"
          ) || "[]"
        );


      records =
        records.filter(function(item) {

          return item.date === today;

        });


      if (records.length >= 3) {

        withdrawMessage.textContent =
          "Maximum 3 withdrawal requests per day.";

        return;

      }


      const balance =
        getBalance();


      if (amount > balance) {

        withdrawMessage.textContent =
          "Insufficient available balance.";

        return;

      }


      const current =
        new Date();


      const withdrawalRecord = {

        amount: amount,

        date: today,

        dateTime:
          current.toISOString(),

        status:
          "Request Recorded"

      };


      records.push({

        amount: amount,

        date: today

      });


      localStorage.setItem(
        "bm_withdrawals",
        JSON.stringify(records)
      );


      let withdrawalHistory =
        JSON.parse(
          localStorage.getItem(
            "bm_withdrawal_history"
          ) || "[]"
        );


      withdrawalHistory.push(
        withdrawalRecord
      );


      localStorage.setItem(
        "bm_withdrawal_history",
        JSON.stringify(
          withdrawalHistory
        )
      );


      withdrawMessage.textContent =
        "✓ Withdrawal request recorded locally.";


      withdrawAmount.value = "";

    }
  );

}


/* =========================================
   DEPOSIT
========================================= */

const paymentScreenshot =
  document.getElementById(
    "paymentScreenshot"
  );

const paymentScreenshotPreview =
  document.getElementById(
    "paymentScreenshotPreview"
  );


if (
  paymentScreenshot &&
  paymentScreenshotPreview
) {

  paymentScreenshot.addEventListener(
    "change",
    function() {

      const file =
        paymentScreenshot.files[0];

      paymentScreenshotPreview.innerHTML =
        "";

      paymentScreenshotPreview.classList.remove(
        "show"
      );


      if (!file) return;


      if (!file.type.startsWith("image/")) {
        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        function(event) {

          const img =
            document.createElement(
              "img"
            );


          img.src =
            event.target.result;


          paymentScreenshotPreview.appendChild(
            img
          );


          paymentScreenshotPreview.classList.add(
            "show"
          );

        };


      reader.readAsDataURL(file);

    }
  );

}


/* =========================================
   COPY UPI
========================================= */

const copyUpiBtn =
  document.getElementById(
    "copyUpiBtn"
  );


if (copyUpiBtn) {

  copyUpiBtn.addEventListener(
    "click",
    async function() {

      const upi =
        "yadav-rishab@fam";


      try {

        await navigator.clipboard.writeText(
          upi
        );

        copyUpiBtn.textContent =
          "Copied";

        setTimeout(
          function() {

            copyUpiBtn.textContent =
              "Copy";

          },
          1500
        );

      } catch (error) {

        alert(
          "UPI ID: " + upi
        );

      }

    }
  );

}


/* =========================================
   DEPOSIT SUBMIT
========================================= */

const paymentSubmit =
  document.getElementById(
    "paymentSubmit"
  );

const paymentMessage =
  document.getElementById(
    "paymentMessage"
  );


if (paymentSubmit) {

  paymentSubmit.addEventListener(
    "click",
    function() {

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


      if (
        !amount ||
        amount < 200 ||
        amount > 50000
      ) {

        paymentMessage.textContent =
          "Amount must be ₹200 - ₹50,000.";

        return;

      }


      if (!utr) {

        paymentMessage.textContent =
          "Please enter UTR / transaction reference.";

        return;

      }


      if (!screenshot) {

        paymentMessage.textContent =
          "Please attach the payment screenshot.";

        return;

      }


      const request = {

        id:
          "DEP-" + Date.now(),

        amount:
          amount,

        utr:
          utr,

        submittedAt:
          new Date().toISOString(),

        status:
          "Pending Verification"

      };


      localStorage.setItem(
        "bm_last_deposit_request",
        JSON.stringify(request)
      );


      let depositHistory =
        JSON.parse(
          localStorage.getItem(
            "bm_deposit_history"
          ) || "[]"
        );


      depositHistory.push({

        amount:
          amount,

        utr:
          utr,

        date:
          new Date().toISOString(),

        status:
          "Pending Verification"

      });


      localStorage.setItem(
        "bm_deposit_history",
        JSON.stringify(
          depositHistory
        )
      );


      paymentMessage.textContent =
        "✓ Request submitted locally. Status: Pending Verification.";


      document.getElementById(
        "depositAmount"
      ).value = "";


      document.getElementById(
        "utr"
      ).value = "";


      document.getElementById(
        "paymentScreenshot"
      ).value = "";


      if (paymentScreenshotPreview) {

        paymentScreenshotPreview.innerHTML =
          "";

        paymentScreenshotPreview.classList.remove(
          "show"
        );

      }

    }
  );

}


/* =========================================
   HISTORY FUNCTIONS
========================================= */

function readHistory(key) {

  try {

    const data =
      JSON.parse(
        localStorage.getItem(key) || "[]"
      );

    return Array.isArray(data)
      ? data
      : [];

  } catch (error) {

    return [];

  }

}


function formatHistoryDate(value) {

  if (!value) {
    return "-";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value;

  }


  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone: "Asia/Kolkata",

      day: "2-digit",
      month: "2-digit",
      year: "numeric",

      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",

      hour12: true

    }
  ).format(date);

}


function escapeHistoryText(value) {

  return String(
    value ?? ""
  )
  .replace(
    /&/g,
    "&amp;"
  )
  .replace(
    /</g,
    "&lt;"
  )
  .replace(
    />/g,
    "&gt;"
  )
  .replace(
    /"/g,
    "&quot;"
  )
  .replace(
    /'/g,
    "&#039;"
  );

}


/* =========================================
   DEPOSIT HISTORY
========================================= */

function normalizeDepositHistory() {

  return readHistory(
    "bm_deposit_history"
  )
  .map(function(item) {

    return {

      type:
        "deposit",

      amount:
        Number(
          item.amount || 0
        ),

      utr:
        item.utr || "",

      date:
        item.date ||
        item.submittedAt ||
        "",

      status:
        item.status ||
        "Pending Verification"

    };

  });

}


/* =========================================
   WITHDRAWAL HISTORY
========================================= */

function normalizeWithdrawalHistory() {

  return readHistory(
    "bm_withdrawal_history"
  )
  .map(function(item) {

    return {

      type:
        "withdrawal",

      amount:
        Number(
          item.amount || 0
        ),

      date:
        item.dateTime ||
        item.date ||
        "",

      status:
        item.status ||
        "Request Recorded"

    };

  });

}


/* =========================================
   SHOW HISTORY
========================================= */

function showHistory(type) {

  const list =
    document.getElementById(
      "historyList"
    );

  const title =
    document.getElementById(
      "historyPageTitle"
    );

  const subtitle =
    document.getElementById(
      "historyPageSubtitle"
    );


  if (
    !list ||
    !title ||
    !subtitle
  ) {
    return;
  }


  let records = [];


  if (type === "deposit") {

    title.textContent =
      "Deposit History";

    subtitle.textContent =
      "All deposit records";

    records =
      normalizeDepositHistory();

  }

  else if (
    type === "withdrawal"
  ) {

    title.textContent =
      "Withdrawal History";

    subtitle.textContent =
      "All withdrawal records";

    records =
      normalizeWithdrawalHistory();

  }

  else {

    title.textContent =
      "Transaction History";

    subtitle.textContent =
      "Deposits & withdrawals";

    records =
      normalizeDepositHistory()
      .concat(
        normalizeWithdrawalHistory()
      );

  }


  records.sort(
    function(a, b) {

      return (
        new Date(
          b.date || 0
        ) -
        new Date(
          a.date || 0
        )
      );

    }
  );


  if (!records.length) {

    list.innerHTML = `

      <div class="history-empty">

        <div class="history-empty-icon">
          📋
        </div>

        <h3>
          No History Yet
        </h3>

        <p>
          Your recorded transactions
          will appear here.
        </p>

      </div>

    `;

  }

  else {

    list.innerHTML =
      records.map(
        function(item) {

          const isDeposit =
            item.type === "deposit";


          const titleText =
            isDeposit
              ? "Deposit"
              : "Withdrawal";


          const icon =
            isDeposit
              ? "↓"
              : "↑";


          const amountClass =
            isDeposit
              ? "deposit-amount"
              : "withdraw-amount";


          const utrRow =
            isDeposit &&
            item.utr

            ? `

              <p>

                UTR:

                <strong>
                  ${escapeHistoryText(
                    item.utr
                  )}
                </strong>

              </p>

            `

            : "";


          return `

            <div class="history-card">

              <div class="history-card-top">

                <div class="
                  history-type-icon
                  ${
                    isDeposit
                      ? "deposit-type"
                      : "withdraw-type"
                  }
                ">

                  ${icon}

                </div>


                <div class="history-main">

                  <b>
                    ${titleText}
                  </b>

                  <small>

                    ${escapeHistoryText(
                      formatHistoryDate(
                        item.date
                      )
                    )}

                  </small>

                </div>


                <div class="
                  history-amount
                  ${amountClass}
                ">

                  ₹${Number(
                    item.amount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}

                </div>

              </div>


              <div class="history-details">

                <p>

                  Date & Time:

                  <strong>

                    ${escapeHistoryText(
                      formatHistoryDate(
                        item.date
                      )
                    )}

                  </strong>

                </p>


                <p>

                  Status:

                  <strong>

                    ${escapeHistoryText(
                      item.status
                    )}

                  </strong>

                </p>


                ${utrRow}

              </div>

            </div>

          `;

        }
      ).join("");

  }


  showPage(
    "historyPage"
  );

}


/* =========================================
   HISTORY BUTTONS
========================================= */

const transactionHistoryBtn =
  document.getElementById(
    "transactionHistoryBtn"
  );


if (transactionHistoryBtn) {

  transactionHistoryBtn.addEventListener(
    "click",
    function() {

      showHistory("all");

    }
  );

}


const depositHistoryBtn =
  document.getElementById(
    "depositHistoryBtn"
  );


if (depositHistoryBtn) {

  depositHistoryBtn.addEventListener(
    "click",
    function() {

      showHistory("deposit");

    }
  );

}


const withdrawalHistoryBtn =
  document.getElementById(
    "withdrawalHistoryBtn"
  );


if (withdrawalHistoryBtn) {

  withdrawalHistoryBtn.addEventListener(
    "click",
    function() {

      showHistory(
        "withdrawal"
      );

    }
  );

}


/* =========================================
   HISTORY BACK
========================================= */

const historyBackBtn =
  document.getElementById(
    "historyBackBtn"
  );


if (historyBackBtn) {

  historyBackBtn.addEventListener(
    "click",
    function() {

      showPage(
        "infoPage"
      );

    }
  );

}


/* =========================================
   CUSTOMER SERVICE
========================================= */

const customerServiceBtn =
  document.getElementById(
    "customerServiceBtn"
  );


if (customerServiceBtn) {

  customerServiceBtn.addEventListener(
    "click",
    function() {

      window.open(
        "https://t.me/Hammerff7gcz",
        "_blank"
      );

    }
  );

}


/* =========================================
   WHATSAPP INVITE
========================================= */

const whatsappBtn =
  document.getElementById(
    "whatsappBtn"
  );


if (whatsappBtn) {

  whatsappBtn.addEventListener(
    "click",
    function() {

      const text =
        "Check out Bitcoin Minning";

      const url =
        window.location.href;


      const shareUrl =
        "https://wa.me/?text=" +
        encodeURIComponent(
          text + "\n" + url
        );


      window.open(
        shareUrl,
        "_blank"
      );

    }
  );

}


/* =========================================
   COPY APP LINK
========================================= */

const copyLinkBtn =
  document.getElementById(
    "copyLinkBtn"
  );


if (copyLinkBtn) {

  copyLinkBtn.addEventListener(
    "click",
    async function() {

      const link =
        window.location.href;


      try {

        await navigator.clipboard.writeText(
          link
        );

        copyLinkBtn.textContent =
          "Copied";

        setTimeout(
          function() {

            copyLinkBtn.textContent =
              "Copy App Link";

          },
          1500
        );

      } catch (error) {

        alert(link);

      }

    }
  );

}


/* =========================================
   START APP
========================================= */

createUserId();

updateBalance();

updateGreeting();

loadProfileImage();

loadBankDetails();

showPage(
  "homePage"
);
