```javascript
"use strict";

/* =========================================
   APP SETTINGS
========================================= */

const APP_LINK =
  "https://yadavroushan8269.github.io/Bitcoin-Minning/";

const USER_ID_KEY = "bitcoin_user_id";
const PROFILE_IMAGE_KEY = "bitcoin_profile_image";
const BANK_KEY = "bitcoin_bank_details";
const BALANCE_KEY = "bitcoin_balance";
const WITHDRAW_KEY = "bitcoin_withdrawals";


/* =========================================
   USER ID
========================================= */

function createUserId() {

  let savedId = localStorage.getItem(USER_ID_KEY);

  if (!savedId) {

    let counter =
      parseInt(localStorage.getItem("bitcoin_user_counter") || "0", 10);

    counter++;

    if (counter > 999) {
      counter = 999;
    }

    localStorage.setItem(
      "bitcoin_user_counter",
      String(counter)
    );

    const serial = String(counter).padStart(3, "0");

    savedId = "You-7519" + serial;

    localStorage.setItem(
      USER_ID_KEY,
      savedId
    );
  }

  const element = document.getElementById("userId");

  if (element) {
    element.textContent = savedId;
  }
}


/* =========================================
   NAVIGATION
========================================= */

const navItems =
  document.querySelectorAll(".nav-item");

const pages =
  document.querySelectorAll(".page");


function showPage(pageId) {

  pages.forEach(page => {
    page.classList.remove("active");
  });

  const selected =
    document.getElementById(pageId);

  if (selected) {
    selected.classList.add("active");
  }

  navItems.forEach(item => {

    item.classList.remove("active");

    if (item.dataset.page === pageId) {
      item.classList.add("active");
    }
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


navItems.forEach(item => {

  item.addEventListener("click", () => {

    showPage(item.dataset.page);

  });

});


/* =========================================
   INDIA LIVE TIME
========================================= */

function updateIndiaTime() {

  const now = new Date();

  const indiaTime =
    new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }
    ).format(now);

  const timeElement =
    document.getElementById("liveTime");

  if (timeElement) {
    timeElement.textContent = indiaTime;
  }


  const hour =
    parseInt(
      new Intl.DateTimeFormat(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          hour12: false
        }
      ).format(now),
      10
    );

  let greeting = "Good morning everyone";

  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon everyone";
  }

  if (hour >= 17) {
    greeting = "Good evening everyone";
  }

  const greetingElement =
    document.getElementById("greeting");

  if (greetingElement) {
    greetingElement.textContent = greeting;
  }
}

updateIndiaTime();

setInterval(
  updateIndiaTime,
  1000
);


/* =========================================
   PROFILE IMAGE - GALLERY
========================================= */

const galleryInput =
  document.getElementById("galleryInput");

galleryInput.addEventListener(
  "change",
  function () {

    const file = this.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {

      setProfileImage(
        event.target.result
      );

    };

    reader.readAsDataURL(file);
  }
);


function setProfileImage(imageData) {

  const image =
    document.getElementById("profileImage");

  const placeholder =
    document.getElementById("avatarPlaceholder");

  image.src = imageData;
  image.style.display = "block";

  placeholder.style.display = "none";

  try {

    localStorage.setItem(
      PROFILE_IMAGE_KEY,
      imageData
    );

  } catch (error) {

    console.log(
      "Image could not be saved locally."
    );

  }
}


/* =========================================
   LOAD PROFILE IMAGE
========================================= */

function loadProfileImage() {

  const saved =
    localStorage.getItem(
      PROFILE_IMAGE_KEY
    );

  if (saved) {
    setProfileImage(saved);
  }
}


/* =========================================
   CAMERA
========================================= */

let cameraStream = null;

const cameraBtn =
  document.getElementById("cameraBtn");

const cameraPreview =
  document.getElementById("cameraPreview");

const takePhotoBtn =
  document.getElementById("takePhotoBtn");

const closeCameraBtn =
  document.getElementById("closeCameraBtn");

const photoCanvas =
  document.getElementById("photoCanvas");


cameraBtn.addEventListener(
  "click",
  async function () {

    try {

      cameraStream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user"
          },
          audio: false
        });

      cameraPreview.srcObject =
        cameraStream;

      cameraPreview.style.display =
        "block";

      takePhotoBtn.style.display =
        "block";

      closeCameraBtn.style.display =
        "block";

    } catch (error) {

      alert(
        "Camera permission was not granted or camera is unavailable."
      );

      console.log(error);

    }
  }
);


takePhotoBtn.addEventListener(
  "click",
  function () {

    if (!cameraStream) {
      return;
    }

    photoCanvas.width =
      cameraPreview.videoWidth;

    photoCanvas.height =
      cameraPreview.videoHeight;

    const context =
      photoCanvas.getContext("2d");

    context.drawImage(
      cameraPreview,
      0,
      0,
      photoCanvas.width,
      photoCanvas.height
    );

    const imageData =
      photoCanvas.toDataURL(
        "image/jpeg",
        0.85
      );

    setProfileImage(imageData);

    stopCamera();
  }
);


closeCameraBtn.addEventListener(
  "click",
  stopCamera
);


function stopCamera() {

  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(track => track.stop());

    cameraStream = null;
  }

  cameraPreview.srcObject = null;

  cameraPreview.style.display =
    "none";

  takePhotoBtn.style.display =
    "none";

  closeCameraBtn.style.display =
    "none";
}


/* =========================================
   PRODUCT MODAL
========================================= */

function openProductInfo(
  productName,
  price
) {

  document.getElementById(
    "modalProductName"
  ).textContent = productName;

  document.getElementById(
    "modalProductPrice"
  ).textContent =
    "₹" + Number(price).toLocaleString("en-IN");

  document
    .getElementById("productModal")
    .classList.add("show");
}


function closeModal() {

  document
    .getElementById("productModal")
    .classList.remove("show");
}


function goToDepositInfo() {

  closeModal();

  showPage("deposit");
}


/* =========================================
   BANK DETAILS
========================================= */

function saveBankDetails() {

  const name =
    document.getElementById(
      "bankNamePerson"
    ).value.trim();

  const ifsc =
    document.getElementById(
      "ifscCode"
    ).value.trim();

  const bank =
    document.getElementById(
      "bankName"
    ).value.trim();

  const account =
    document.getElementById(
      "accountNumber"
    ).value.trim();

  const repeat =
    document.getElementById(
      "repeatAccountNumber"
    ).value.trim();

  const status =
    document.getElementById(
      "bankStatus"
    );


  if (
    !name ||
    !ifsc ||
    !bank ||
    !account ||
    !repeat
  ) {

    status.textContent =
      "Please fill all fields.";

    return;
  }


  if (account !== repeat) {

    status.textContent =
      "Account numbers do not match.";

    return;
  }


  if (account.length < 6) {

    status.textContent =
      "Please enter a valid account number.";

    return;
  }


  const details = {
    name: name,
    ifsc: ifsc.toUpperCase(),
    bank: bank,
    account: account,
    savedAt: new Date().toISOString()
  };


  localStorage.setItem(
    BANK_KEY,
    JSON.stringify(details)
  );


  status.textContent =
    "Bank details saved locally in this browser. They were not sent anywhere.";

}


/* =========================================
   LOAD BANK DETAILS
========================================= */

function loadBankDetails() {

  const saved =
    localStorage.getItem(BANK_KEY);

  if (!saved) {
    return;
  }

  try {

    const data =
      JSON.parse(saved);

    document.getElementById(
      "bankNamePerson"
    ).value = data.name || "";

    document.getElementById(
      "ifscCode"
    ).value = data.ifsc || "";

    document.getElementById(
      "bankName"
    ).value = data.bank || "";

    document.getElementById(
      "accountNumber"
    ).value = data.account || "";

    document.getElementById(
      "repeatAccountNumber"
    ).value = data.account || "";

  } catch (error) {

    console.log(
      "Could not load bank details."
    );

  }
}


/* =========================================
   BALANCE
========================================= */

function getBalance() {

  const balance =
    parseFloat(
      localStorage.getItem(
        BALANCE_KEY
      ) || "0"
    );

  return isNaN(balance)
    ? 0
    : balance;
}


function updateBalanceDisplay() {

  const balance =
    getBalance();

  const formatted =
    "₹" +
    balance.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  document.getElementById(
    "balance"
  ).textContent = formatted;

  document.getElementById(
    "ruleBalance"
  ).textContent = formatted;
}


/* =========================================
   WITHDRAWAL
========================================= */

function requestWithdrawal() {

  const amount =
    parseFloat(
      document.getElementById(
        "withdrawAmount"
      ).value
    );

  const status =
    document.getElementById(
      "withdrawStatus"
    );


  if (isNaN(amount)) {

    status.textContent =
      "Please enter a withdrawal amount.";

    return;
  }


  if (amount < 500) {

    status.textContent =
      "Minimum withdrawal amount is ₹500.";

    return;
  }


  if (amount > 20000) {

    status.textContent =
      "Maximum withdrawal amount is ₹20,000.";

    return;
  }


  const balance =
    getBalance();


  if (amount > balance) {

    status.textContent =
      "Insufficient available balance.";

    return;
  }


  const indiaDate =
    new Date().toLocaleString(
      "en-IN",
      {
        timeZone: "Asia/Kolkata"
      }
    );


  const currentHour =
    parseInt(
      new Intl.DateTimeFormat(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          hour12: false
        }
      ).format(new Date()),
      10
    );

  const currentMinute =
    parseInt(
      new Intl.DateTimeFormat(
        "en-IN",
        {
          timeZone: "Asia/Kolkata",
          minute: "numeric"
        }
      ).format(new Date()),
      10
    );


  const totalMinutes =
    currentHour * 60 +
    currentMinute;


  const start =
    10 * 60 + 30;

  const end =
    17 * 60 + 30;


  if (
    totalMinutes < start ||
    totalMinutes > end
  ) {

    status.textContent =
      "Withdrawal is available from 10:30 AM to 5:30 PM India time.";

    return;
  }


  let withdrawals =
    JSON.parse(
      localStorage.getItem(
        WITHDRAW_KEY
      ) || "[]"
    );


  const today =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Kolkata"
      }
    ).format(new Date());


  withdrawals =
    withdrawals.filter(
      item => item.date === today
    );


  if (withdrawals.length >= 3) {

    status.textContent =
      "Daily withdrawal limit of 3 has been reached.";

    return;
  }


  status.textContent =
    "Withdrawal request recorded locally. No payment is processed by this GitHub Pages demo.";

  withdrawals.push({
    amount: amount,
    date: today,
    time: indiaDate
  });


  localStorage.setItem(
    WITHDRAW_KEY,
    JSON.stringify(withdrawals)
  );

}


/* =========================================
   PAYMENT INFORMATION FORM
========================================= */

function submitPaymentInfo() {

  const amount =
    parseFloat(
      document.getElementById(
        "depositAmount"
      ).value
    );

  const utr =
    document.getElementById(
      "utrNumber"
    ).value.trim();

  const screenshot =
    document.getElementById(
      "paymentScreenshot"
    ).files[0];

  const status =
    document.getElementById(
      "paymentStatus"
    );


  if (isNaN(amount)) {

    status.textContent =
      "Please enter an amount.";

    return;
  }


  if (
    amount < 200 ||
    amount > 50000
  ) {

    status.textContent =
      "Amount must be between ₹200 and ₹50,000.";

    return;
  }


  if (!utr) {

    status.textContent =
      "Please enter the transaction reference.";

    return;
  }


  if (!screenshot) {

    status.textContent =
      "Please select a payment screenshot.";

    return;
  }


  status.textContent =
    "Information recorded locally for this browser. No payment verification or Telegram forwarding is performed.";

}


/* =========================================
   WHATSAPP SHARE
========================================= */

function shareWhatsApp() {

  const message =
    "Check out Bitcoin Minning: " +
    APP_LINK;

  const whatsappURL =
    "https://wa.me/?text=" +
    encodeURIComponent(message);

  window.open(
    whatsappURL,
    "_blank",
    "noopener,noreferrer"
  );
}


/* =========================================
   COPY APP LINK
========================================= */

async function copyAppLink() {

  const status =
    document.getElementById(
      "copyStatus"
    );

  try {

    await navigator.clipboard.writeText(
      APP_LINK
    );

    status.textContent =
      "App link copied.";

  } catch (error) {

    status.textContent =
      "Copy failed. Please copy the link manually.";

  }
}


/* =========================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================= */

document
  .getElementById("productModal")
  .addEventListener(
    "click",
    function (event) {

      if (event.target === this) {
        closeModal();
      }

    }
  );


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    createUserId();

    loadProfileImage();

    loadBankDetails();

    updateBalanceDisplay();

  }
);
```
