/* =========================================================
   BITCOIN MINNING
   COMPLETE SCRIPT
   Firebase Test/Demo Balance + Website Functions
========================================================= */

(function () {

  "use strict";


  /* =======================================================
     CONFIG
  ======================================================= */

  const UPI_ID = "yadav-rishab@fam";

  const CUSTOMER_SERVICE =
    "https://t.me/Hammerff7gcz";

  const ADMIN_EMAIL =
    "yadavroushan8269@gmail.com";


  /* =======================================================
     FIREBASE CONFIG
  ======================================================= */

  const FIREBASE_CONFIG = {

    apiKey:
      "AIzaSyAN5jFZ0hBOb-Zmbrv8W1E2aGqnmd8_iOM",

    authDomain:
      "bitcoin-minning-web.firebaseapp.com",

    projectId:
      "bitcoin-minning-web",

    storageBucket:
      "bitcoin-minning-web.firebasestorage.app",

    messagingSenderId:
      "691683594489",

    appId:
      "1:691683594489:web:96252fee18748e54ad9228"

  };


  /* =======================================================
     GLOBAL FIREBASE VARIABLES
  ======================================================= */

  let firebaseApp = null;

  let firebaseAuth = null;

  let firestoreDB = null;

  let firebaseUser = null;

  let firebaseBalance = 0;

  let firebaseReady = false;


  /* =======================================================
     BASIC HELPERS
  ======================================================= */

  function byId(id) {

    return document.getElementById(id);

  }


  function safeJSONParse(value, fallback) {

    try {

      const parsed =
        JSON.parse(value);

      return parsed;

    } catch (error) {

      return fallback;

    }

  }


  function readLocalArray(key) {

    const value =
      localStorage.getItem(key);

    if (!value) {

      return [];

    }

    const parsed =
      safeJSONParse(value, []);

    return Array.isArray(parsed)
      ? parsed
      : [];

  }


  function saveLocalArray(key, value) {

    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

  }


  /* =======================================================
     USER ID
  ======================================================= */

  function createUserId() {

    let userId =
      localStorage.getItem(
        "bm_user_id"
      );


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


    const profileUserId =
      byId("profileUserId");


    if (profileUserId) {

      profileUserId.textContent =
        userId;

    }


    return userId;

  }


  function getUserId() {

    return (
      localStorage.getItem(
        "bm_user_id"
      ) ||
      createUserId()
    );

  }


  /* =======================================================
     PAGE NAVIGATION
  ======================================================= */

  function getPages() {

    return document.querySelectorAll(
      ".page"
    );

  }


  function getNavButtons() {

    return document.querySelectorAll(
      ".nav"
    );

  }


  function showPage(pageId) {

    const pages =
      getPages();


    pages.forEach(
      function (page) {

        page.classList.remove(
          "active"
        );

      }
    );


    const page =
      byId(pageId);


    if (page) {

      page.classList.add(
        "active"
      );

    }


    getNavButtons().forEach(
      function (button) {

        button.classList.remove(
          "active"
        );


        if (
          button.dataset.page ===
          pageId
        ) {

          button.classList.add(
            "active"
          );

        }

      }
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }


  function setupNavigation() {

    document
      .querySelectorAll(
        "[data-page]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              const pageId =
                button.dataset.page;


              if (pageId) {

                showPage(
                  pageId
                );

              }

            }
          );

        }
      );


    document
      .querySelectorAll(
        "[data-back]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              const pageId =
                button.dataset.back;


              if (pageId) {

                showPage(
                  pageId
                );

              }

            }
          );

        }
      );

  }


  /* =======================================================
     BALANCE
  ======================================================= */

  function getLocalBalance() {

    return Number(
      localStorage.getItem(
        "bm_balance"
      ) || 0
    );

  }


  function getBalance() {

    if (firebaseReady) {

      return Number(
        firebaseBalance || 0
      );

    }

    return getLocalBalance();

  }


  function updateBalanceDisplay() {

    const balance =
      getBalance();


    const formatted =
      "₹" +
      balance.toLocaleString(
        "en-IN"
      );


    const ids = [

      "homeBalance",

      "infoBalance",

      "withdrawBalance"

    ];


    ids.forEach(
      function (id) {

        const element =
          byId(id);


        if (element) {

          element.textContent =
            formatted;

        }

      }
    );

  }


  function updateBalance() {

    updateBalanceDisplay();

  }


  /* =======================================================
     FIREBASE SDK LOADER
  ======================================================= */

  function loadFirebaseScript(src) {

    return new Promise(
      function (resolve, reject) {

        const existing =
          document.querySelector(
            'script[src="' +
            src +
            '"]'
          );


        if (existing) {

          if (
            typeof firebase !==
            "undefined"
          ) {

            resolve();

            return;

          }

        }


        const script =
          document.createElement(
            "script"
          );


        script.src = src;

        script.async = true;


        script.onload =
          function () {

            resolve();

          };


        script.onerror =
          function () {

            reject(
              new Error(
                "Failed to load Firebase"
              )
            );

          };


        document.head.appendChild(
          script
        );

      }
    );

  }


  async function loadFirebaseSDK() {

    try {

      await loadFirebaseScript(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"
      );


      await loadFirebaseScript(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"
      );


      await loadFirebaseScript(
        "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"
      );


      return true;

    } catch (error) {

      console.error(
        "Firebase SDK error:",
        error
      );


      return false;

    }

  }


  /* =======================================================
     FIREBASE INITIALIZATION
  ======================================================= */

  async function initializeFirebase() {

    const loaded =
      await loadFirebaseSDK();


    if (!loaded) {

      return;

    }


    if (
      typeof firebase ===
      "undefined"
    ) {

      console.error(
        "Firebase is unavailable."
      );

      return;

    }


    try {

      firebaseApp =
        firebase.apps.length
          ? firebase.app()
          : firebase.initializeApp(
              FIREBASE_CONFIG
            );


      firebaseAuth =
        firebase.auth();


      firestoreDB =
        firebase.firestore();


      firebaseReady =
        true;


      console.log(
        "Firebase initialized."
      );


      firebaseAuth.onAuthStateChanged(
        async function (user) {

          if (!user) {

            try {

              await firebaseAuth
                .signInAnonymously();

            } catch (error) {

              console.error(
                "Anonymous sign-in failed:",
                error
              );

            }

            return;

          }


          firebaseUser =
            user;


          console.log(
            "Firebase user:",
            user.uid
          );


          await createOrLoadFirebaseBalance();

        }
      );


    } catch (error) {

      console.error(
        "Firebase initialization failed:",
        error
      );

    }

  }


  /* =======================================================
     CREATE / LOAD TEST BALANCE
  ======================================================= */

  async function createOrLoadFirebaseBalance() {

    if (
      !firebaseReady ||
      !firebaseUser ||
      !firestoreDB
    ) {

      return;

    }


    const publicUserId =
      getUserId();


    const balanceRef =
      firestoreDB
        .collection(
          "testBalances"
        )
        .doc(
          firebaseUser.uid
        );


    try {

      const snapshot =
        await balanceRef.get();


      if (snapshot.exists) {

        const data =
          snapshot.data() || {};


        firebaseBalance =
          Number(
            data.balance || 0
          );


        /*
          If the document already exists
          but userId is missing, update
          the public User ID.
        */

        if (
          data.userId !==
          publicUserId
        ) {

          await balanceRef.update({

            userId:
              publicUserId,

            updatedAt:
              firebase.firestore
                .FieldValue
                .serverTimestamp()

          });

        }


      } else {

        /*
          New user document
        */

        firebaseBalance = 0;


        await balanceRef.set({

          uid:
            firebaseUser.uid,

          userId:
            publicUserId,

          balance:
            0,

          createdAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp(),

          updatedAt:
            firebase.firestore
              .FieldValue
              .serverTimestamp()

        });


        console.log(
          "New test balance user created:",
          publicUserId
        );

      }


      localStorage.setItem(
        "bm_balance",
        String(
          firebaseBalance
        )
      );


      updateBalanceDisplay();


    } catch (error) {

      console.error(
        "Firebase balance error:",
        error
      );

    }

  }


  /* =======================================================
     REFRESH FIREBASE BALANCE
  ======================================================= */

  async function refreshFirebaseBalance() {

    if (
      !firebaseReady ||
      !firebaseUser
    ) {

      return;

    }


    try {

      const ref =
        firestoreDB
          .collection(
            "testBalances"
          )
          .doc(
            firebaseUser.uid
          );


      const snapshot =
        await ref.get();


      if (
        snapshot.exists
      ) {

        const data =
          snapshot.data() || {};


        firebaseBalance =
          Number(
            data.balance || 0
          );


        localStorage.setItem(
          "bm_balance",
          String(
            firebaseBalance
          )
        );


        updateBalanceDisplay();

      }

    } catch (error) {

      console.error(
        "Balance refresh failed:",
        error
      );

    }

  }


  /* =======================================================
     GREETING
  ======================================================= */

  function updateGreeting() {

    const greeting =
      byId("greeting");


    if (!greeting) {

      return;

    }


    const now =
      new Date();


    const hour =
      Number(
        new Intl.DateTimeFormat(
          "en-IN",
          {
            timeZone:
              "Asia/Kolkata",

            hour:
              "2-digit",

            hour12:
              false
          }
        ).format(now)
      );


    if (
      hour >= 5 &&
      hour < 12
    ) {

      greeting.textContent =
        "Good Morning";

    }

    else if (
      hour >= 12 &&
      hour < 17
    ) {

      greeting.textContent =
        "Good Afternoon";

    }

    else if (
      hour >= 17 &&
      hour < 21
    ) {

      greeting.textContent =
        "Good Evening";

    }

    else {

      greeting.textContent =
        "Good Night";

    }

  }


  /* =======================================================
     PRODUCT MODAL
  ======================================================= */

  function setupProductModal() {

    const modal =
      byId("productModal") ||
      byId("planModal");


    const closeButton =
      byId("modalClose");


    const title =
      byId("modalTitle");


    const text =
      byId("modalText");


    document
      .querySelectorAll(
        "[data-product]"
      )
      .forEach(
        function (button) {

          button.addEventListener(
            "click",
            function () {

              const product =
                button.dataset.product ||
                "Selected";


              if (title) {

                title.textContent =
                  product +
                  " Mining Plan";

              }


              if (text) {

                text.textContent =
                  "This is informational/demo content. This GitHub Pages version does not guarantee investment returns or process real-money investments.";

              }


              if (modal) {

                modal.classList.add(
                  "show"
                );

              }

            }
          );

        }
      );


    if (closeButton) {

      closeButton.addEventListener(
        "click",
        function () {

          if (modal) {

            modal.classList.remove(
              "show"
            );

          }

        }
      );

    }


    if (modal) {

      modal.addEventListener(
        "click",
        function (event) {

          if (
            event.target ===
            modal
          ) {

            modal.classList.remove(
              "show"
            );

          }

        }
      );

    }


    const modalDepositBtn =
      byId(
        "modalDepositBtn"
      );


    if (modalDepositBtn) {

      modalDepositBtn.addEventListener(
        "click",
        function () {

          if (modal) {

            modal.classList.remove(
              "show"
            );

          }


          showPage(
            "depositPage"
          );

        }
      );

    }

  }


  /* =======================================================
     PROFILE IMAGE
  ======================================================= */

  function loadProfileImage() {

    const saved =
      localStorage.getItem(
        "bm_profile_image"
      );


    if (!saved) {

      return;

    }


    const image =
      byId("profileImage");


    const letter =
      byId("profileLetter");


    const topImage =
      byId("topProfileImg");


    const topLetter =
      byId("topProfileLetter");


    if (image) {

      image.src =
        saved;

      image.classList.add(
        "show"
      );

    }


    if (letter) {

      letter.style.display =
        "none";

    }


    if (topImage) {

      topImage.src =
        saved;

      topImage.classList.add(
        "show"
      );

    }


    if (topLetter) {

      topLetter.style.display =
        "none";

    }

  }


  function setupProfileUpload() {

    const button =
      byId(
        "profileUploadBtn"
      );


    const input =
      byId(
        "profileGallery"
      );


    if (
      !button ||
      !input
    ) {

      return;

    }


    button.addEventListener(
      "click",
      function () {

        input.click();

      }
    );


    input.addEventListener(
      "change",
      function () {

        const file =
          input.files[0];


        if (!file) {

          return;

        }


        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          return;

        }


        const reader =
          new FileReader();


        reader.onload =
          function (event) {

            const imageData =
              event.target.result;


            localStorage.setItem(
              "bm_profile_image",
              imageData
            );


            loadProfileImage();

          };


        reader.readAsDataURL(
          file
        );

      }
    );

  }


  /* =======================================================
     BANK DETAILS
     LOCAL ONLY
  ======================================================= */

  function loadBankDetails() {

    const data =
      safeJSONParse(
        localStorage.getItem(
          "bm_bank_details"
        ),
        null
      );


    if (!data) {

      return;

    }


    const name =
      byId("bankName");


    const ifsc =
      byId("bankIfsc");


    const bank =
      byId("bankBankName");


    const account =
      byId("bankAccount");


    const repeat =
      byId(
        "bankAccountRepeat"
      );


    if (name) {

      name.value =
        data.name || "";

    }


    if (ifsc) {

      ifsc.value =
        data.ifsc || "";

    }


    if (bank) {

      bank.value =
        data.bankName || "";

    }


    if (account) {

      account.value =
        data.account || "";

    }


    if (repeat) {

      repeat.value =
        data.account || "";

    }

  }


  function setupBankDetails() {

    const button =
      byId(
        "saveBankBtn"
      );


    if (!button) {

      return;

    }


    button.addEventListener(
      "click",
      function () {

        const name =
          (
            byId("bankName")?.value ||
            ""
          ).trim();


        const ifsc =
          (
            byId("bankIfsc")?.value ||
            ""
          ).trim();


        const bank =
          (
            byId("bankBankName")?.value ||
            ""
          ).trim();


        const account =
          (
            byId("bankAccount")?.value ||
            ""
          ).trim();


        const repeat =
          (
            byId(
              "bankAccountRepeat"
            )?.value ||
            ""
          ).trim();


        const message =
          byId(
            "bankMessage"
          );


        if (
          !name ||
          !ifsc ||
          !bank ||
          !account ||
          !repeat
        ) {

          if (message) {

            message.textContent =
              "Please fill all bank details.";

          }

          return;

        }


        if (
          account !==
          repeat
        ) {

          if (message) {

            message.textContent =
              "Account numbers do not match.";

          }

          return;

        }


        const data = {

          name:
            name,

          ifsc:
            ifsc,

          bankName:
            bank,

          account:
            account

        };


        /*
          Stored only on this device.
        */

        localStorage.setItem(
          "bm_bank_details",
          JSON.stringify(
            data
          )
        );


        if (message) {

          message.textContent =
            "✓ Bank details saved locally.";

        }

      }
    );

  }


  /* =======================================================
     IST DATE
  ======================================================= */

  function getISTDate() {

    return new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone:
          "Asia/Kolkata"
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
          timeZone:
            "Asia/Kolkata",

          hour:
            "2-digit",

          minute:
            "2-digit",

          hour12:
            false
        }
      ).formatToParts(
        new Date()
      );


    let hour = 0;

    let minute = 0;


    parts.forEach(
      function (part) {

        if (
          part.type ===
          "hour"
        ) {

          hour =
            Number(
              part.value
            );

        }


        if (
          part.type ===
          "minute"
        ) {

          minute =
            Number(
              part.value
            );

        }

      }
    );


    return {
      hour:
        hour,

      minute:
        minute
    };

  }


  /* =======================================================
     WITHDRAWAL
     DEMO / LOCAL RECORD
  ======================================================= */

  function setupWithdrawal() {

    const submit =
      byId(
        "withdrawSubmit"
      );


    const amountInput =
      byId(
        "withdrawAmount"
      );


    const message =
      byId(
        "withdrawMessage"
      );


    if (
      !submit ||
      !amountInput
    ) {

      return;

    }


    submit.addEventListener(
      "click",
      async function () {

        await refreshFirebaseBalance();


        const amount =
          Number(
            amountInput.value
          );


        if (
          !amount ||
          amount < 500 ||
          amount > 20000
        ) {

          if (message) {

            message.textContent =
              "Withdrawal amount must be ₹500 - ₹20,000.";

          }

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
          totalMinutes <
            start ||
          totalMinutes >
            end
        ) {

          if (message) {

            message.textContent =
              "Withdrawal time is 10:30 AM - 5:30 PM IST.";

          }

          return;

        }


        const today =
          getISTDate();


        let daily =
          readLocalArray(
            "bm_withdrawals"
          );


        daily =
          daily.filter(
            function (item) {

              return (
                item.date ===
                today
              );

            }
          );


        if (
          daily.length >= 3
        ) {

          if (message) {

            message.textContent =
              "Maximum 3 withdrawal requests per day.";

          }

          return;

        }


        const balance =
          getBalance();


        if (
          amount >
          balance
        ) {

          if (message) {

            message.textContent =
              "Insufficient available demo balance.";

          }

          return;

        }


        const now =
          new Date();


        daily.push({

          amount:
            amount,

          date:
            today

        });


        saveLocalArray(
          "bm_withdrawals",
          daily
        );


        const history =
          readLocalArray(
            "bm_withdrawal_history"
          );


        history.push({

          amount:
            amount,

          date:
            today,

          dateTime:
            now.toISOString(),

          status:
            "Request Recorded"

        });


        saveLocalArray(
          "bm_withdrawal_history",
          history
        );


        if (message) {

          message.textContent =
            "✓ Demo withdrawal request recorded locally.";

        }


        amountInput.value =
          "";


        /*
          Important:
          Client cannot directly change
          Firebase admin-controlled balance.
          Admin can update the demo balance.
        */

      }
    );

  }


  /* =======================================================
     SECOND WITHDRAW PAGE SUPPORT
  ======================================================= */

  function setupSecondWithdrawPage() {

    const submit =
      byId(
        "withdrawPageSubmit"
      );


    const amountInput =
      byId(
        "withdrawPageAmount"
      );


    const message =
      byId(
        "withdrawPageMessage"
      );


    if (
      !submit ||
      !amountInput
    ) {

      return;

    }


    submit.addEventListener(
      "click",
      function () {

        const amount =
          Number(
            amountInput.value
          );


        if (
          !amount ||
          amount < 500 ||
          amount > 20000
        ) {

          if (message) {

            message.textContent =
              "Withdrawal amount must be ₹500 - ₹20,000.";

          }

          return;

        }


        const balance =
          getBalance();


        if (
          amount >
          balance
        ) {

          if (message) {

            message.textContent =
              "Insufficient available demo balance.";

          }

          return;

        }


        const today =
          getISTDate();


        const records =
          readLocalArray(
            "bm_withdrawal_history"
          );


        records.push({

          amount:
            amount,

          date:
            today,

          dateTime:
            new Date()
              .toISOString(),

          status:
            "Request Recorded"

        });


        saveLocalArray(
          "bm_withdrawal_history",
          records
        );


        if (message) {

          message.textContent =
            "✓ Demo withdrawal request recorded locally.";

        }


        amountInput.value =
          "";

      }
    );

  }


  /* =======================================================
     PAYMENT SCREENSHOT PREVIEW
     LOCAL ONLY
  ======================================================= */

  function setupScreenshotPreview() {

    const input =
      byId(
        "paymentScreenshot"
      );


    const preview =
      byId(
        "paymentScreenshotPreview"
      );


    if (
      !input ||
      !preview
    ) {

      return;

    }


    input.addEventListener(
      "change",
      function () {

        const file =
          input.files[0];


        preview.innerHTML =
          "";


        preview.classList.remove(
          "show"
        );


        if (!file) {

          return;

        }


        if (
          !file.type.startsWith(
            "image/"
          )
        ) {

          return;

        }


        const reader =
          new FileReader();


        reader.onload =
          function (event) {

            const img =
              document.createElement(
                "img"
              );


            img.src =
              event.target.result;


            preview.appendChild(
              img
            );


            preview.classList.add(
              "show"
            );

          };


        reader.readAsDataURL(
          file
        );

      }
    );

  }


  /* =======================================================
     COPY UPI
  ======================================================= */

  function setupCopyUPI() {

    const button =
      byId(
        "copyUpiBtn"
      );


    if (!button) {

      return;

    }


    button.addEventListener(
      "click",
      async function () {

        try {

          await navigator
            .clipboard
            .writeText(
              UPI_ID
            );


          button.textContent =
            "Copied";


          setTimeout(
            function () {

              button.textContent =
                "Copy";

            },
            1500
          );


        } catch (error) {

          alert(
            "UPI ID: " +
            UPI_ID
          );

        }

      }
    );

  }


  /* =======================================================
     DEPOSIT
     LOCAL RECORD ONLY
  ======================================================= */

  function setupDeposit() {

    const submit =
      byId(
        "paymentSubmit"
      );


    if (!submit) {

      return;

    }


    submit.addEventListener(
      "click",
      function () {

        const amount =
          Number(
            byId(
              "depositAmount"
            )?.value || 0
          );


        const utr =
          (
            byId(
              "utr"
            )?.value ||
            ""
          ).trim();


        const screenshot =
          byId(
            "paymentScreenshot"
          )?.files?.[0];


        const message =
          byId(
            "paymentMessage"
          );


        if (
          !amount ||
          amount < 200 ||
          amount > 50000
        ) {

          if (message) {

            message.textContent =
              "Amount must be ₹200 - ₹50,000.";

          }

          return;

        }


        if (!utr) {

          if (message) {

            message.textContent =
              "Please enter UTR / transaction reference.";

          }

          return;

        }


        if (!screenshot) {

          if (message) {

            message.textContent =
              "Please attach the payment screenshot.";

          }

          return;

        }


        const record = {

          id:
            "DEP-" +
            Date.now(),

          amount:
            amount,

          utr:
            utr,

          submittedAt:
            new Date()
              .toISOString(),

          status:
            "Pending Verification"

        };


        localStorage.setItem(
          "bm_last_deposit_request",
          JSON.stringify(
            record
          )
        );


        const history =
          readLocalArray(
            "bm_deposit_history"
          );


        history.push({

          amount:
            amount,

          utr:
            utr,

          date:
            new Date()
              .toISOString(),

          status:
            "Pending Verification"

        });


        saveLocalArray(
          "bm_deposit_history",
          history
        );


        if (message) {

          message.textContent =
            "✓ Request recorded locally. Status: Pending Verification.";

        }


        const amountField =
          byId(
            "depositAmount"
          );


        const utrField =
          byId(
            "utr"
          );


        const screenshotField =
          byId(
            "paymentScreenshot"
          );


        if (amountField) {

          amountField.value =
            "";

        }


        if (utrField) {

          utrField.value =
            "";

        }


        if (screenshotField) {

          screenshotField.value =
            "";

        }


        const preview =
          byId(
            "paymentScreenshotPreview"
          );


        if (preview) {

          preview.innerHTML =
            "";

          preview.classList.remove(
            "show"
          );

        }

      }
    );

  }


  /* =======================================================
     HISTORY HELPERS
  ======================================================= */

  function escapeHTML(value) {

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


  function formatHistoryDate(value) {

    if (!value) {

      return "-";

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return String(
        value
      );

    }


    return new Intl.DateTimeFormat(
      "en-IN",
      {
        timeZone:
          "Asia/Kolkata",

        day:
          "2-digit",

        month:
          "2-digit",

        year:
          "numeric",

        hour:
          "2-digit",

        minute:
          "2-digit",

        second:
          "2-digit",

        hour12:
          true
      }
    ).format(
      date
    );

  }


  function normalizeDepositHistory() {

    return readLocalArray(
      "bm_deposit_history"
    ).map(
      function (item) {

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

      }
    );

  }


  function normalizeWithdrawalHistory() {

    return readLocalArray(
      "bm_withdrawal_history"
    ).map(
      function (item) {

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

      }
    );

  }


  /* =======================================================
     SHOW HISTORY
  ======================================================= */

  function showHistory(type) {

    const list =
      byId(
        "historyList"
      );


    const title =
      byId(
        "historyPageTitle"
      );


    const subtitle =
      byId(
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


    if (
      type ===
      "deposit"
    ) {

      title.textContent =
        "Deposit History";


      subtitle.textContent =
        "All deposit records";


      records =
        normalizeDepositHistory();

    }


    else if (
      type ===
      "withdrawal"
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
      function (a, b) {

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


    if (
      !records.length
    ) {

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
        records
          .map(
            function (item) {

              const deposit =
                item.type ===
                "deposit";


              const typeTitle =
                deposit
                  ? "Deposit"
                  : "Withdrawal";


              const icon =
                deposit
                  ? "↓"
                  : "↑";


              const amountClass =
                deposit
                  ? "deposit-amount"
                  : "withdraw-amount";


              const utrRow =
                deposit &&
                item.utr
                  ? `

                    <p>
                      UTR:
                      <strong>
                        ${escapeHTML(
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
                        deposit
                          ? "deposit-type"
                          : "withdraw-type"
                      }
                    ">

                      ${icon}

                    </div>


                    <div class="history-main">

                      <b>
                        ${typeTitle}
                      </b>

                      <small>
                        ${escapeHTML(
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
                        ${escapeHTML(
                          formatHistoryDate(
                            item.date
                          )
                        )}
                      </strong>
                    </p>


                    <p>
                      Status:
                      <strong>
                        ${escapeHTML(
                          item.status
                        )}
                      </strong>
                    </p>


                    ${utrRow}

                  </div>

                </div>

              `;

            }
          )
          .join("");

    }


    showPage(
      "historyPage"
    );

  }


  /* =======================================================
     HISTORY BUTTONS
  ======================================================= */

  function setupHistoryButtons() {

    const all =
      byId(
        "transactionHistoryBtn"
      );


    const deposit =
      byId(
        "depositHistoryBtn"
      );


    const withdrawal =
      byId(
        "withdrawalHistoryBtn"
      );


    if (all) {

      all.addEventListener(
        "click",
        function () {

          showHistory(
            "all"
          );

        }
      );

    }


    if (deposit) {

      deposit.addEventListener(
        "click",
        function () {

          showHistory(
            "deposit"
          );

        }
      );

    }


    if (withdrawal) {

      withdrawal.addEventListener(
        "click",
        function () {

          showHistory(
            "withdrawal"
          );

        }
      );

    }


    const historyBack =
      byId(
        "historyBackBtn"
      );


    if (historyBack) {

      historyBack.addEventListener(
        "click",
        function () {

          showPage(
            "infoPage"
          );

        }
      );

    }


    const withdrawalBack =
      byId(
        "withdrawHistoryBackBtn"
      );


    if (withdrawalBack) {

      withdrawalBack.addEventListener(
        "click",
        function () {

          showPage(
            "infoPage"
          );

        }
      );

    }


    const transactionBack =
      byId(
        "transactionHistoryBackBtn"
      );


    if (transactionBack) {

      transactionBack.addEventListener(
        "click",
        function () {

          showPage(
            "infoPage"
          );

        }
      );

    }

  }


  /* =======================================================
     WHATSAPP INVITE
  ======================================================= */

  function setupWhatsApp() {

    const button =
      byId(
        "whatsappBtn"
      );


    if (!button) {

      return;

    }


    button.addEventListener(
      "click",
      function () {

        const text =
          "Check out Bitcoin Minning";


        const url =
          window.location.href;


        const shareUrl =
          "https://wa.me/?text=" +
          encodeURIComponent(
            text +
            "\n" +
            url
          );


        window.open(
          shareUrl,
          "_blank"
        );

      }
    );

  }


  /* =======================================================
     COPY APP LINK
  ======================================================= */

  function setupCopyLink() {

    const button =
      byId(
        "copyLinkBtn"
      );


    if (!button) {

      return;

    }


    button.addEventListener(
      "click",
      async function () {

        const link =
          window.location.href;


        try {

          await navigator
            .clipboard
            .writeText(
              link
            );


          button.textContent =
            "Copied";


          setTimeout(
            function () {

              button.textContent =
                "Copy App Link";

            },
            1500
          );


        } catch (error) {

          alert(
            link
          );

        }

      }
    );

  }


  /* =======================================================
     REFERRAL LINK
  ======================================================= */

  function setupReferral() {

    const referral =
      byId(
        "referralLink"
      );


    if (referral) {

      referral.textContent =
        window.location.href;

    }

  }


  /* =======================================================
     CUSTOMER SERVICE
  ======================================================= */

  function setupCustomerService() {

    const button =
      byId(
        "customerServiceBtn"
      );


    if (!button) {

      return;

    }


    button.addEventListener(
      "click",
      function () {

        window.open(
          CUSTOMER_SERVICE,
          "_blank"
        );

      }
    );

  }


  /* =======================================================
     HOME BUTTONS
  ======================================================= */

  function setupHomeButtons() {

    const deposit =
      byId(
        "depositBtn"
      );


    const withdraw =
      byId(
        "withdrawBtn"
      );


    const info =
      byId(
        "myInfoBtn"
      );


    const invite =
      byId(
        "inviteBtn"
      );


    const products =
      byId(
        "productsBtn"
      );


    if (deposit) {

      deposit.addEventListener(
        "click",
        function () {

          showPage(
            "depositPage"
          );

        }
      );

    }


    if (withdraw) {

      withdraw.addEventListener(
        "click",
        function () {

          /*
            Main withdrawal form is
            inside infoPage.
          */

          showPage(
            "infoPage"
          );


          setTimeout(
            function () {

              const input =
                byId(
                  "withdrawAmount"
                );


              if (input) {

                input.focus();

              }

            },
            250
          );

        }
      );

    }


    if (info) {

      info.addEventListener(
        "click",
        function () {

          showPage(
            "infoPage"
          );

        }
      );

    }


    if (invite) {

      invite.addEventListener(
        "click",
        function () {

          showPage(
            "invitePage"
          );

        }
      );

    }


    if (products) {

      products.addEventListener(
        "click",
        function () {

          showPage(
            "productPage"
          );

        }
      );

    }

  }


  /* =======================================================
     TOP PROFILE
  ======================================================= */

  function setupTopProfile() {

    const profile =
      byId(
        "topProfile"
      );


    if (!profile) {

      return;

    }


    profile.addEventListener(
      "click",
      function () {

        showPage(
          "infoPage"
        );

      }
    );

  }


  /* =======================================================
     INITIAL APP
  ======================================================= */

  async function startApp() {

    createUserId();

    updateBalance();

    updateGreeting();

    loadProfileImage();

    loadBankDetails();

    setupNavigation();

    setupProductModal();

    setupProfileUpload();

    setupBankDetails();

    setupWithdrawal();

    setupSecondWithdrawPage();

    setupScreenshotPreview();

    setupCopyUPI();

    setupDeposit();

    setupHistoryButtons();

    setupWhatsApp();

    setupCopyLink();

    setupReferral();

    setupCustomerService();

    setupHomeButtons();

    setupTopProfile();


    showPage(
      "homePage"
    );


    /*
      Start Firebase after the
      normal website has loaded.
    */

    await initializeFirebase();

  }


  /* =======================================================
     START
  ======================================================= */

  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      startApp
    );

  } else {

    startApp();

  }


})();
