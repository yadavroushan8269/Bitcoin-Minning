"use strict";

/* =========================
   BASIC NAVIGATION
========================= */

const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav");

function showPage(pageId){

  pages.forEach(page => {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageId);

  if(page){
    page.classList.add("active");
  }

  navButtons.forEach(btn => {
    btn.classList.remove("active");

    if(btn.dataset.page === pageId){
      btn.classList.add("active");
    }
  });

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}


/* Bottom navigation */

navButtons.forEach(btn => {

  btn.addEventListener("click", () => {

    const page = btn.dataset.page;

    if(page){
      showPage(page);
    }

  });

});


/* All data-page buttons */

document.querySelectorAll("[data-page]").forEach(btn => {

  if(btn.classList.contains("nav")) return;

  btn.addEventListener("click", () => {

    const page = btn.dataset.page;

    if(page){
      showPage(page);
    }

  });

});


/* Back buttons */

document.querySelectorAll(".back-btn").forEach(btn => {

  btn.addEventListener("click", () => {

    showPage(
      btn.dataset.back || "homePage"
    );

  });

});


/* =========================
   USER ID
========================= */

function createUserId(){

  let userId =
    localStorage.getItem("bm_user_id");

  if(!userId){

    const random =
      Math.floor(
        1000000 +
        Math.random() * 8999999
      );

    userId =
      "You-" + random;

    localStorage.setItem(
      "bm_user_id",
      userId
    );
  }

  const elements = [
    "profileUserId",
    "infoUserId"
  ];

  elements.forEach(id => {

    const el =
      document.getElementById(id);

    if(el){
      el.textContent = userId;
    }

  });

}


/* =========================
   BALANCE
========================= */

function getBalance(){

  return Number(
    localStorage.getItem("bm_balance") || "0"
  );

}

function updateBalance(){

  const balance =
    getBalance();

  const formatted =
    "₹" +
    balance.toLocaleString("en-IN", {
      minimumFractionDigits:2,
      maximumFractionDigits:2
    });

  const ids = [
    "balanceDisplay",
    "infoBalance",
    "withdrawBalance"
  ];

  ids.forEach(id => {

    const el =
      document.getElementById(id);

    if(el){
      el.textContent = formatted;
    }

  });

}


/* =========================
   INDIA TIME / GREETING
========================= */

function getIndiaDate(){

  return new Date(
    new Date().toLocaleString(
      "en-US",
      {timeZone:"Asia/Kolkata"}
    )
  );

}


/* =========================
   PROFILE PHOTO
========================= */

const galleryInput =
  document.getElementById("galleryInput");

const profileImage =
  document.getElementById("profileImage");

function loadProfileImage(){

  const saved =
    localStorage.getItem(
      "bm_profile_image"
    );

  if(saved && profileImage){

    profileImage.src = saved;

  }else if(profileImage){

    profileImage.src =
      "data:image/svg+xml;charset=UTF-8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg"
             width="100"
             height="100"
             viewBox="0 0 100 100">
          <rect width="100"
                height="100"
                rx="50"
                fill="#102a39"/>
          <circle cx="50"
                  cy="38"
                  r="17"
                  fill="#8fa7b8"/>
          <path d="M20 86
                   C25 64 75 64 80 86"
                fill="#8fa7b8"/>
        </svg>
      `);

  }

}

if(galleryInput){

  galleryInput.addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];

      if(!file) return;

      if(!file.type.startsWith("image/")){
        return;
      }

      const reader =
        new FileReader();

      reader.onload = e => {

        const image =
          e.target.result;

        localStorage.setItem(
          "bm_profile_image",
          image
        );

        if(profileImage){
          profileImage.src = image;
        }

      };

      reader.readAsDataURL(file);

    }
  );

}


/* =========================
   BANK DETAILS
========================= */

const bankFields = [
  "bankNamePerson",
  "bankIfsc",
  "bankName",
  "accountNumber",
  "repeatAccountNumber"
];

function loadBankDetails(){

  bankFields.forEach(id => {

    const value =
      localStorage.getItem(
        "bm_" + id
      );

    const el =
      document.getElementById(id);

    if(el && value){
      el.value = value;
    }

  });

}

const saveBankBtn =
  document.getElementById("saveBankBtn");

if(saveBankBtn){

  saveBankBtn.addEventListener(
    "click",
    () => {

      const person =
        document.getElementById(
          "bankNamePerson"
        ).value.trim();

      const ifsc =
        document.getElementById(
          "bankIfsc"
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

      const message =
        document.getElementById(
          "bankMessage"
        );

      if(
        !person ||
        !ifsc ||
        !bank ||
        !account ||
        !repeat
      ){

        message.textContent =
          "Please fill all bank details.";

        return;
      }

      if(account !== repeat){

        message.textContent =
          "Account numbers do not match.";

        return;
      }

      bankFields.forEach(id => {

        const el =
          document.getElementById(id);

        localStorage.setItem(
          "bm_" + id,
          el.value.trim()
        );

      });

      message.textContent =
        "✓ Bank details saved locally.";

    }
  );

}


/* =========================
   PRODUCT MODAL
========================= */

const productModal =
  document.getElementById(
    "productModal"
  );

const modalClose =
  document.getElementById(
    "modalClose"
  );

const modalTitle =
  document.getElementById(
    "modalTitle"
  );

const modalText =
  document.getElementById(
    "modalText"
  );

const modalDepositBtn =
  document.getElementById(
    "modalDepositBtn"
  );


document.querySelectorAll(
  ".plan-btn"
).forEach(btn => {

  btn.addEventListener(
    "click",
    () => {

      const amount =
        btn.dataset.amount;

      if(modalTitle){

        modalTitle.textContent =
          "₹" + amount + " Mining Plan";

      }

      if(modalText){

        modalText.textContent =
          "This plan is displayed for informational and UI purposes. No guaranteed investment return is represented.";

      }

      if(productModal){

        productModal.classList.add(
          "show"
        );

      }

    }
  );

});


if(modalClose){

  modalClose.addEventListener(
    "click",
    () => {

      productModal.classList.remove(
        "show"
      );

    }
  );

}


if(productModal){

  productModal.addEventListener(
    "click",
    event => {

      if(event.target === productModal){

        productModal.classList.remove(
          "show"
        );

      }

    }
  );

}


if(modalDepositBtn){

  modalDepositBtn.addEventListener(
    "click",
    () => {

      productModal.classList.remove(
        "show"
      );

      showPage("depositPage");

    }
  );

}


/* =========================
   DEPOSIT
   LOCAL ONLY
========================= */

const paymentScreenshot =
  document.getElementById(
    "paymentScreenshot"
  );

const paymentPreview =
  document.getElementById(
    "paymentScreenshotPreview"
  );


/* Screenshot preview */

if(paymentScreenshot){

  paymentScreenshot.addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];

      if(!file) return;

      if(!file.type.startsWith("image/")){

        paymentPreview.innerHTML =
          "";

        return;

      }

      const reader =
        new FileReader();

      reader.onload = e => {

        paymentPreview.innerHTML = `
          <img
            src="${e.target.result}"
            alt="Payment Screenshot Preview">
        `;

      };

      reader.readAsDataURL(file);

    }
  );

}


/* Copy UPI */

const copyUpiBtn =
  document.getElementById(
    "copyUpiBtn"
  );

if(copyUpiBtn){

  copyUpiBtn.addEventListener(
    "click",
    async () => {

      const upi =
        "yadav-rishab@fam";

      try{

        await navigator.clipboard.writeText(
          upi
        );

        copyUpiBtn.textContent =
          "Copied!";

        setTimeout(() => {

          copyUpiBtn.textContent =
            "Copy";

        },1500);

      }catch(error){

        alert(
          "UPI ID: " + upi
        );

      }

    }
  );

}


/* Submit deposit request */

const paymentSubmit =
  document.getElementById(
    "paymentSubmit"
  );

if(paymentSubmit){

  paymentSubmit.addEventListener(
    "click",
    () => {

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

      const message =
        document.getElementById(
          "paymentMessage"
        );


      if(
        !amount ||
        amount < 200 ||
        amount > 50000
      ){

        message.textContent =
          "Enter an amount between ₹200 and ₹50,000.";

        return;

      }


      if(!utr){

        message.textContent =
          "Please enter UTR / transaction reference.";

        return;

      }


      if(!screenshot){

        message.textContent =
          "Please attach the payment screenshot.";

        return;

      }


      const request = {

        id:
          "DEP-" +
          Date.now(),

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


      message.textContent =
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

      paymentPreview.innerHTML =
        "";

    }
  );

}


/* =========================
   WITHDRAW
========================= */

const withdrawSubmit =
  document.getElementById(
    "withdrawSubmit"
  );

if(withdrawSubmit){

  withdrawSubmit.addEventListener(
    "click",
    () => {

      const amount =
        Number(
          document.getElementById(
            "withdrawAmount"
          ).value
        );

      const message =
        document.getElementById(
          "withdrawMessage"
        );

      const now =
        getIndiaDate();

      const hours =
        now.getHours();

      const minutes =
        now.getMinutes();

      const currentMinutes =
        hours * 60 + minutes;

      const start =
        10 * 60 + 30;

      const end =
        17 * 60 + 30;


      if(
        !amount ||
        amount < 500 ||
        amount > 20000
      ){

        message.textContent =
          "Withdrawal amount must be ₹500 - ₹20,000.";

        return;

      }


      if(
        currentMinutes < start ||
        currentMinutes > end
      ){

        message.textContent =
          "Withdrawal requests are available from 10:30 AM to 5:30 PM IST.";

        return;

      }


      const balance =
        getBalance();


      if(amount > balance){

        message.textContent =
          "Insufficient available balance.";

        return;

      }


      const today =
        now.toISOString()
          .slice(0,10);


      const key =
        "bm_withdrawals_" + today;


      const count =
        Number(
          localStorage.getItem(key) || "0"
        );


      if(count >= 3){

        message.textContent =
          "Maximum 3 withdrawal requests allowed today.";

        return;

      }


      localStorage.setItem(
        key,
        String(count + 1)
      );


      message.textContent =
        "✓ Withdrawal request saved locally.";

      document.getElementById(
        "withdrawAmount"
      ).value = "";

    }
  );

}


/* =========================
   INVITE
========================= */

const whatsappBtn =
  document.getElementById(
    "whatsappBtn"
  );

if(whatsappBtn){

  whatsappBtn.addEventListener(
    "click",
    () => {

      const text =
        "Check out Bitcoin Minning: " +
        window.location.href;

      const url =
        "https://wa.me/?text=" +
        encodeURIComponent(text);

      window.open(
        url,
        "_blank"
      );

    }
  );

}


const copyLinkBtn =
  document.getElementById(
    "copyLinkBtn"
  );

if(copyLinkBtn){

  copyLinkBtn.addEventListener(
    "click",
    async () => {

      const message =
        document.getElementById(
          "inviteMessage"
        );

      try{

        await navigator.clipboard.writeText(
          window.location.href
        );

        message.textContent =
          "✓ App link copied.";

      }catch(error){

        message.textContent =
          "Copy failed. Please copy the browser link.";

      }

    }
  );

}


/* =========================
   START APP
========================= */

createUserId();
loadProfileImage();
loadBankDetails();
updateBalance();

showPage("homePage");
