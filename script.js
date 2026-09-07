"use strict";

/* ==============================
   APP LINK
============================== */

const APP_LINK =
  "https://yadavroushan8269.github.io/Bitcoin-Minning/";


/* ==============================
   PAGE NAVIGATION
============================== */

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav");


function showPage(pageId) {

  pages.forEach(function(page) {
    page.classList.remove("active");
  });

  const target = document.getElementById(pageId);

  if (!target) {
    console.error("Page not found:", pageId);
    return;
  }

  target.classList.add("active");

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

    showPage(button.dataset.page);

  });

});


/* ==============================
   QUICK BUTTONS
============================== */

document.getElementById("depositBtn")
  .addEventListener("click", function() {
    showPage("depositPage");
  });


document.getElementById("withdrawBtn")
  .addEventListener("click", function() {
    showPage("infoPage");

    setTimeout(function() {
      document.getElementById("withdrawAmount").focus();
    }, 250);
  });


document.getElementById("myInfoBtn")
  .addEventListener("click", function() {
    showPage("infoPage");
  });


document.getElementById("inviteBtn")
  .addEventListener("click", function() {
    showPage("invitePage");
  });


document.getElementById("accountBtn")
  .addEventListener("click", function() {
    showPage("infoPage");
  });


document.getElementById("productViewBtn")
  .addEventListener("click", function() {
    showPage("productPage");
  });


document.getElementById("learnBtn")
  .addEventListener("click", function() {
    showPage("productPage");
  });


/* ==============================
   BACK BUTTONS
============================== */

document.querySelectorAll(".back-btn")
  .forEach(function(button) {

    button.addEventListener("click", function() {
      showPage(button.dataset.back);
    });

  });


/* ==============================
   USER ID
============================== */

function createUserId() {

  let id = localStorage.getItem("bm_user_id");

  if (!id) {

    let counter =
      parseInt(
        localStorage.getItem("bm_user_counter") || "0",
        10
      );

    counter++;

    if (counter > 999) {
      counter = 999;
    }

    localStorage.setItem(
      "bm_user_counter",
      counter
    );

    id =
      "You-7519" +
      String(counter).padStart(3, "0");

    localStorage.setItem(
      "bm_user_id",
      id
    );
  }

  document.getElementById("homeUserId")
    .textContent = id;

  document.getElementById("profileUserId")
    .textContent = id;
}


/* ==============================
   INDIA LIVE TIME / GREETING
============================== */

function updateTime() {

  const now = new Date();

  const hour = parseInt(
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      hour12: false
    }).format(now),
    10
  );

  let greeting = "Good morning everyone!";

  if (hour >= 12 && hour < 17) {
    greeting = "Good afternoon everyone!";
  }

  if (hour >= 17) {
    greeting = "Good evening everyone!";
  }

  document.getElementById("tickerText")
    .textContent = greeting;
}

updateTime();

setInterval(updateTime, 1000);


/* ==============================
   BALANCE
============================== */

function getBalance() {

  const value =
    parseFloat(
      localStorage.getItem("bm_balance") || "0"
    );

  return Number.isFinite(value) ? value : 0;
}


function updateBalance() {

  const formatted =
    "₹" +
    getBalance().toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  document.getElementById("balanceText")
    .textContent = formatted;

  document.getElementById("homeBalance")
    .textContent = formatted;

  document.getElementById("ruleBalance")
    .textContent = formatted;
}


/* ==============================
   PRODUCT MODAL
============================== */

const modal =
  document.getElementById("productModal");


document.querySelectorAll(".invest-btn")
  .forEach(function(button) {

    button.addEventListener("click", function() {

      const plan =
        button.dataset.plan;

      const price =
        Number(button.dataset.price);

      document.getElementById("modalPlan")
        .textContent = plan.toUpperCase();

      document.getElementById("modalTitle")
        .textContent = plan;

      document.getElementById("modalPrice")
        .textContent =
        "₹" +
        price.toLocaleString("en-IN");

      modal.classList.add("show");

    });

  });


document.getElementById("modalClose")
  .addEventListener("click", function() {

    modal.classList.remove("show");

  });


modal.addEventListener("click", function(event) {

  if (event.target === modal) {
    modal.classList.remove("show");
  }

});


document.getElementById("modalDeposit")
  .addEventListener("click", function() {

    modal.classList.remove("show");

    showPage("depositPage");

  });


/* ==============================
   PROFILE GALLERY
============================== */

const gallery =
  document.getElementById("galleryInput");


gallery.addEventListener("change", function() {

  const file = gallery.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    alert("Please select an image.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(event) {

    setProfileImage(event.target.result);

  };

  reader.readAsDataURL(file);

});


function setProfileImage(data) {

  const img =
    document.getElementById("profileImage");

  const placeholder =
    document.getElementById("profilePlaceholder");

  img.src = data;
  img.style.display = "block";

  placeholder.style.display = "none";

  try {
    localStorage.setItem(
      "bm_profile_image",
      data
    );
  } catch(error) {
    console.log("Image storage unavailable.");
  }
}


/* Load profile */

const savedImage =
  localStorage.getItem("bm_profile_image");

if (savedImage) {
  setProfileImage(savedImage);
}


/* ==============================
   CAMERA
============================== */

let stream = null;

const cameraVideo =
  document.getElementById("cameraVideo");

const takePhoto =
  document.getElementById("takePhotoBtn");

const closeCamera =
  document.getElementById("cameraCloseBtn");

const canvas =
  document.getElementById("photoCanvas");


document.getElementById("cameraOpenBtn")
  .addEventListener("click", async function() {

    try {

      stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user"
          },
          audio: false
        });

      cameraVideo.srcObject = stream;

      cameraVideo.style.display = "block";

      takePhoto.classList.remove("hidden");
      closeCamera.classList.remove("hidden");

    } catch(error) {

      alert(
        "Camera permission was denied or camera is unavailable."
      );

      console.error(error);

    }

  });


takePhoto.addEventListener("click", function() {

  if (!stream) {
    return;
  }

  canvas.width =
    cameraVideo.videoWidth;

  canvas.height =
    cameraVideo.videoHeight;

  const ctx =
    canvas.getContext("2d");

  ctx.drawImage(
    cameraVideo,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const image =
    canvas.toDataURL(
      "image/jpeg",
      .85
    );

  setProfileImage(image);

  stopCamera();

});


closeCamera.addEventListener(
  "click",
  stopCamera
);


function stopCamera() {

  if (stream) {

    stream.getTracks()
      .forEach(function(track) {
        track.stop();
      });

    stream = null;
  }

  cameraVideo.srcObject = null;

  cameraVideo.style.display = "none";

  takePhoto.classList.add("hidden");
  closeCamera.classList.add("hidden");
}


/* ==============================
   BANK DETAILS
============================== */

document.getElementById("saveBankBtn")
  .addEventListener("click", function() {

    const name =
      document.getElementById("accountHolder")
        .value.trim();

    const ifsc =
      document.getElementById("ifsc")
        .value.trim();

    const bank =
      document.getElementById("bankName")
        .value.trim();

    const account =
      document.getElementById("accountNumber")
        .value.trim();

    const repeat =
      document.getElementById("repeatAccount")
        .value.trim();

    const message =
      document.getElementById("bankMessage");


    if (
      !name ||
      !ifsc ||
      !bank ||
      !account ||
      !repeat
    ) {

      message.textContent =
        "Please fill all fields.";

      return;
    }


    if (account !== repeat) {

      message.textContent =
        "Account numbers do not match.";

      return;
    }


    const data = {
      name: name,
      ifsc: ifsc.toUpperCase(),
      bank: bank,
      account: account
    };


    localStorage.setItem(
      "bm_bank",
      JSON.stringify(data)
    );


    message.textContent =
      "Bank details saved locally in this browser.";

  });


/* Load bank */

const savedBank =
  localStorage.getItem("bm_bank");

if (savedBank) {

  try {

    const data =
      JSON.parse(savedBank);

    document.getElementById("accountHolder")
      .value = data.name || "";

    document.getElementById("ifsc")
      .value = data.ifsc || "";

    document.getElementById("bankName")
      .value = data.bank || "";

    document.getElementById("accountNumber")
      .value = data.account || "";

    document.getElementById("repeatAccount")
      .value = data.account || "";

  } catch(error) {
    console.log("Bank data unavailable.");
  }
}


/* ==============================
   WITHDRAWAL VALIDATION
============================== */

document.getElementById("withdrawSubmit")
  .addEventListener("click", function() {

    const amount =
      Number(
        document.getElementById("withdrawAmount").value
      );

    const message =
      document.getElementById("withdrawMessage");


    if (!amount) {

      message.textContent =
        "Please enter an amount.";

      return;
    }


    if (amount < 500) {

      message.textContent =
        "Minimum withdrawal amount is ₹500.";

      return;
    }


    if (amount > 20000) {

      message.textContent =
        "Maximum withdrawal amount is ₹20,000.";

      return;
    }


    if (amount > getBalance()) {

      message.textContent =
        "Insufficient available balance.";

      return;
    }


    const current =
      new Date();

    const india =
      new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(current);

    const parts =
      india.split(":");

    const hour =
      Number(parts[0]);

    const minute =
      Number(parts[1]);

    const total =
      hour * 60 + minute;

    const start =
      10 * 60 + 30;

    const end =
      17 * 60 + 30;


    if (total < start || total > end) {

      message.textContent =
        "Withdrawal time is 10:30 AM - 5:30 PM India time.";

      return;
    }


    let records =
      JSON.parse(
        localStorage.getItem("bm_withdrawals") || "[]"
      );


    const today =
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata"
      }).format(current);


    records =
      records.filter(function(item) {
        return item.date === today;
      });


    if (records.length >= 3) {

      message.textContent =
        "Daily withdrawal limit of 3 has been reached.";

      return;
    }


    records.push({
      amount: amount,
      date: today
    });


    localStorage.setItem(
      "bm_withdrawals",
      JSON.stringify(records)
    );


    message.textContent =
      "Withdrawal request recorded locally.";

  });


/* ==============================
   DEPOSIT FORM
============================== */

document.getElementById("paymentSubmit")
  .addEventListener("click", function() {

    const amount =
      Number(
        document.getElementById("depositAmount").value
      );

    const utr =
      document.getElementById("utr")
        .value.trim();

    const screenshot =
      document.getElementById("paymentScreenshot")
        .files[0];

    const message =
      document.getElementById("paymentMessage");


    if (!amount) {

      message.textContent =
        "Please enter amount.";

      return;
    }


    if (amount < 200 || amount > 50000) {

      message.textContent =
        "Amount must be between ₹200 and ₹50,000.";

      return;
    }


    if (!utr) {

      message.textContent =
        "Please enter transaction reference.";

      return;
    }


    if (!screenshot) {

      message.textContent =
        "Please select screenshot.";

      return;
    }


    message.textContent =
      "Payment information recorded locally. This page does not verify or process payments.";

  });


/* ==============================
   WHATSAPP SHARE
============================== */

document.getElementById("whatsappBtn")
  .addEventListener("click", function() {

    const text =
      "Check out Bitcoin Minning:\n" +
      APP_LINK;

    const url =
      "https://wa.me/?text=" +
      encodeURIComponent(text);

    window.open(
      url,
      "_blank"
    );

  });


/* ==============================
   COPY LINK
============================== */

document.getElementById("copyBtn")
  .addEventListener("click", async function() {

    const message =
      document.getElementById("inviteMessage");

    try {

      await navigator.clipboard.writeText(APP_LINK);

      message.textContent =
        "App link copied successfully.";

    } catch(error) {

      message.textContent =
        APP_LINK;

    }

  });


/* ==============================
   START
============================== */

createUserId();

updateBalance();

showPage("homePage");
